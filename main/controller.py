from __future__ import print_function
from datetime import datetime, timedelta
import models
import monthdelta
from django.db.models import Q


def construct_data_array_new_again(current_val=None, amount=None, has_prev=None, has_next=None):

    # should be in the form: array = [{day: date, wealth: [1, 2], health}]

    if current_val == 'month':
        new_date = datetime.now()
        month = str(new_date.month)
        year = str(new_date.year)
        month_name = new_date.strftime('%B')
        new_date = datetime.strptime(month + ' ' + year, '%m %Y')
        # print('new date: {0}'.format(new_date))

    else:
        new_date = datetime.strptime(current_val, '%B %Y') + monthdelta.monthdelta(int(amount))
        # print('current date: {0}'.format(new_date))

        month = new_date.strftime('%m')
        year = new_date.strftime('%Y')
        month_name = new_date.strftime('%B')

        # if we're here, then we don't know about next or prev

    # now to actually get our data:
    parsed_data_array = []

    historical_data = models.Day.objects.all().order_by('date').filter(date__year=year, date__month=month)

    # print('now checking for existence of has_prev/next')
    if has_prev is None:
        has_prev = models.Day.objects.filter(Q(date__lt=new_date) | Q(date__lt=new_date)).exists()

    if has_next is None:
        has_next = models.Day.objects.filter(Q(date__gte=new_date+monthdelta.monthdelta(1)) |
                                             Q(date__gte=new_date+monthdelta.monthdelta(1))).exists()

    # print('now building historical array from data')
    parsed_datum = {'health': [None, None],
                    'wealth': [None, None],
                    'arts': [None, None],
                    'smarts': [None, None]}

    for each_day in historical_data:

        # get associated events:
        day_events = each_day.events.all()

        parsed_datum['day'] = datetime.strftime(each_day.date, '%b %d')
        parsed_datum['notes'] = each_day.notes

        # print('adding events for day: {0}'.format(each_day))

        for each_event in day_events:

            if parsed_datum[str(each_event.category)][0] is None:
                parsed_datum[str(each_event.category)][0] = str(each_event.name)
                if each_event.major_event:
                    parsed_datum[str(each_event.category)][1] = [str(each_event.name)]

            else:
                parsed_datum[str(each_event.category)][1] = [str(each_event.name)]

        parsed_data_array.append(parsed_datum)
        parsed_datum = {'health': [None, None],
                        'wealth': [None, None],
                        'arts': [None, None],
                        'smarts': [None, None]}

    return parsed_data_array, month_name + ' ' + year, has_next, has_prev


def update_day_table_to_current():
    print('updating day table to current')

    current_day = datetime.now().date()
    most_recent_day = models.Day.objects.all().order_by('-date')[0].date

    if most_recent_day >= current_day:
        print('nothing to do.. most recent is either same or more than current day')
        return

    while most_recent_day != current_day:
        print('i need to do some work! cur: {c}, mrd: {m}'.format(c=current_day, m=most_recent_day))
        most_recent_day += timedelta(days=1)
        models.Day(date=most_recent_day).save()


if __name__ == "__main__":
    x = None
    print(x)