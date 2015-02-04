from __future__ import print_function
from datetime import datetime, timedelta
import models
import monthdelta
from django.db.models import Q
import pytz


def construct_data_array(current_val=None, amount=None, has_prev=None, has_next=None):

    # should be in the form: array = [{day: date, wealth: [1, 2], health}]

    if current_val == 'month':
        new_date = datetime.now(pytz.timezone('US/Pacific'))
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
        has_prev = models.Day.objects.filter(Q(date__lt=new_date) | Q(date__lt=new_date)).exists()  # review this..
        # why is it doing less than date or less than date???? there must have been a reason....?

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

        parsed_datum['day'] = datetime.strftime(each_day.date, '%A %b %d')
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

    if most_recent_day is None:
        print('no data found at all... creating a day for today and exiting')
        models.Day(date=current_day).save()
        return

    if most_recent_day >= current_day:
        print('nothing to do.. most recent is either same or more than current day')
        return

    while most_recent_day != current_day:
        print('i need to do some work! cur: {c}, mrd: {m}'.format(c=current_day, m=most_recent_day))
        most_recent_day += timedelta(days=1)
        models.Day(date=most_recent_day).save()


def update_day_notes(day, year, notes):

    parse_date = datetime.strptime(day+' '+year, '%A %b %d %Y')
    existing_record = models.Day.objects.filter(date=parse_date)[0]

    try:
        if existing_record is None:
            return

        existing_record.notes = notes
        existing_record.save()

    except Exception, e:
        print('there was an error saving notes to the DB: {e}'.format(e=e))
        return 'A Database Failure'

    else:
        return 'success'


def update_events(position, value, event_text, arc_pos, day, year):

    category_array = ['arts', 'smarts', 'wealth', 'health']
    print('i believe that {0} is category: {1}'.format(event_text, category_array[int(position)]))

    date = datetime.strptime(day + ' ' + year, '%A %b %d %Y')
    print(date)

    day_record = models.Day.objects.filter(date=date).first()
    event_record = models.Event(category=category_array[int(position)], name=event_text, day_link=day_record)
    event_record.save()

    print(event_record)

    return 'success!'



if __name__ == "__main__":
    x = None
    print(x)