from __future__ import print_function
from datetime import datetime, timedelta
import models
import monthdelta
from django.db.models import Q
import pytz


def construct_data_array(current_val=None, amount=None, has_prev=None, has_next=None):

    # should be in the form: array = [{day: date, wealth: [1, 2], health}]

    category_counts = {'health': 0, 'wealth': 0, 'arts': 0, 'smarts': 0}

    print('entered construct data array with: {} {} {} {}'.format(current_val, amount, has_prev, has_next))
    print('amount: {}'.format(amount))

    if current_val == 'month' or amount == '':
        new_date = datetime.now(pytz.timezone('US/Pacific'))
        month = str(new_date.month)
        year = str(new_date.year)
        month_name = new_date.strftime('%B')
        new_date = datetime.strptime(month + ' ' + year, '%m %Y')
        # print('new date: {0}'.format(new_date))

    else:
        print('casting int here....')
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
                category_counts[str(each_event.category)] += 1

            else:
                parsed_datum[str(each_event.category)][1] = str(each_event.name)
                category_counts[str(each_event.category)] += 1

        parsed_data_array.append(parsed_datum)
        parsed_datum = {'health': [None, None],
                        'wealth': [None, None],
                        'arts': [None, None],
                        'smarts': [None, None]}

    return parsed_data_array, month_name + ' ' + year, has_next, has_prev, category_counts


def construct_year_data():

    # this function should build out totals per category, per month, which will get used to build a real
    # choropleth map of each month:

    # {'Jan 2015': {'arts': 10, 'smarts': 5, 'health': 10, 'wealth': 15}
    #  'Feb 2015': {'arts': 12, 'smarts': 25, 'health': 13, 'wealth': 10}
    #  (etc...)
    # } [{date: 'blah', data: {blah, blah, blah}},
    # [date, arts, smarts, health, wealth, total]

    historical_data = models.Day.objects.all().order_by('date')

    year_array = []
    year_datum = {'date': datetime.strftime(historical_data[0].date, '%b %y'), 'total_days': 0}

    for each_day in historical_data:
        year_datum['total_days'] += 1

        event_data = each_day.events.all()
        for each_event in event_data:

            if datetime.strftime(each_day.date, '%b %y') == year_datum['date']:
                if 'cat_data' in year_datum:
                    year_datum['cat_data'][each_event.category] += 1
                else:
                    year_datum['cat_data'] = {'arts': 0, 'smarts': 0, 'health': 0, 'wealth': 0}
                    year_datum['cat_data'][each_event.category] += 1

            else:
                year_array.append(year_datum)
                year_datum = {'date': datetime.strftime(each_day.date, '%b %y'), 'total_days': 0,
                              'cat_data': {'arts': 0, 'smarts': 0, 'health': 0, 'wealth': 0}}
                year_datum['cat_data'][each_event.category] += 1

    year_array.append(year_datum)

    print(year_array)

    return year_array


def update_day_table_to_current():
    print('updating day table to current')

    current_day = datetime.now().date()
    most_recent_day = models.Day.objects.all().order_by('-date')

    if most_recent_day:
        print(most_recent_day)
        most_recent_day = most_recent_day[0].date

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

    print('update day notes function is active')

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


def update_events(category, event_text, day, year, is_update, old_text, delete_event):

    # category_array = ['arts', 'smarts', 'wealth', 'health']
    print('i believe that {0} is category: {1}'.format(event_text, category))

    date = datetime.strptime(day + ' ' + year, '%A %b %d %Y')
    print(date)

    try:

        day_record = models.Day.objects.filter(date=date).first()

        if delete_event == 'true':
            print('i am attempting to delete an event')
            event_record = models.Event.objects.filter(day_link=day_record,
                                                       category=category,
                                                       name=old_text).first()

            print('deleting: {0}'.format(event_record))
            event_record.delete()
            return 'success'

        if is_update == 'true':
            event_record = models.Event.objects.filter(day_link=day_record, category=category, name=old_text).first()
            event_record.name = event_text

        else:
            event_record = models.Event(category=category, name=event_text, day_link=day_record)

        event_record.save()
        print(event_record)

    except Exception, err:  # there must be a finer-tuned exception class to catch here.
        print('zomg... super huge exception: {e}'.format(e=err))
        # okay, so the most recent DB error is because we're using 2 DBs and the migration isn't applying to
        # both of them, for whatever reason. <- this is fixed with DB cleanup.

        # if event_record:
        #     event_record.rollback()  # there is no rolling back
        return 'there was a db error!'

    return 'success'


# controller functions for 'must do's will go here.
def update_must_do_history():
    must_do_cats = models.MustDoCategories.objects.all()
    for each_category in must_do_cats:
        print(each_category)


def get_must_do_data():
    print('updating must do history now...')
    update_must_do_history()

    print('getting must do data')
    must_do_array = models.MustDoHistory.objects.all()
    print(must_do_array)
    must_do_cats = models.MustDoCategories.objects.all()
    print(must_do_cats)


if __name__ == "__main__":
    x = None
    print(x)