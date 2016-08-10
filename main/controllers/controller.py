"""
This is the main controller module.  It is responsible for dealing with the getting/setting/updating of basic
day and event information for a particular user.

"""

from __future__ import print_function
from datetime import datetime, timedelta
import main.models as models
import monthdelta
import pytz
from slider_controller import get_day_feelings


def parse_historical_data(historical_data_array, sliders_active=False):

    """
    Does all the munging of historical data from the DB and returns it as usable objects.

    :param historical_data_array:
    :param sliders_active
    :return:
    """

    # now to actually get our data:
    parsed_data_array = []
    category_counts = {'health': 0, 'wealth': 0, 'arts': 0, 'smarts': 0}

    # print('now building historical array from data')
    parsed_datum = {'health': [None, None],
                    'wealth': [None, None],
                    'arts': [None, None],
                    'smarts': [None, None],
                    'feelings': {}}

    for each_day in historical_data_array:

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

        if sliders_active:
            feeling_record = each_day.slider_day.first()
            parsed_datum['feelings'] = get_day_feelings(feeling_record)

        parsed_data_array.append(parsed_datum)
        parsed_datum = {'health': [None, None],
                        'wealth': [None, None],
                        'arts': [None, None],
                        'smarts': [None, None],
                        'feelings': {}}

    return parsed_data_array, category_counts


def construct_data_array(user_id, current_val=None, amount=None, has_prev=None, has_next=None, sliders_active=False):

    """
    Construct a data array object of our basic event info and day info for a particular user.  Checks to see if
    we need to have next/prev buttons if they are not already explicitly passed in.

    :param user_id:
    :param current_val:
    :param amount:
    :param has_prev:
    :param has_next:
    :return:
    """

    print('entered construct data array with: {} {} {} {}'.format(current_val, amount, has_prev, has_next))
    print('amount: {}'.format(amount))

    # figure out start dates to query DB on:
    if current_val == 'month' or amount == '' or current_val == 'year':
        new_date = datetime.now(pytz.timezone('US/Pacific'))
        month = str(new_date.month)
        year = str(new_date.year)
        month_name = new_date.strftime('%B')
        new_date = datetime.strptime(month + ' ' + year, '%m %Y')

    else:
        new_date = datetime.strptime(current_val, '%B %Y') + monthdelta.monthdelta(int(amount))

        month = new_date.strftime('%m')
        year = new_date.strftime('%Y')
        month_name = new_date.strftime('%B')
        # if we're here, then we don't know about next or prev

    if current_val == 'year':
        print('getting year vals...')
        historical_data = models.Day.objects.all().order_by('date').filter(date__year=year, user_link=user_id)
    else:
        historical_data = models.Day.objects.all().order_by('date').filter(date__year=year, date__month=month,
                                                                           user_link=user_id)

    # now munge our historical data into something usable:
    parsed_data_array, category_counts = parse_historical_data(historical_data, sliders_active)

    # determine if there are previous/next months after the current one, if it wasn't explicitly passed in:
    if has_prev in (None, ""):
        has_prev = models.Day.objects.filter(user_link=user_id).filter(date__lt=new_date).exists()

    if has_next in (None, ""):
        has_next = models.Day.objects.filter(user_link=user_id)
        has_next = has_next.filter(date__gte=new_date+monthdelta.monthdelta(1)).exists()

    return parsed_data_array, month_name + ' ' + year, has_next, has_prev, category_counts


def update_day_table_to_current(current_user):

    """
    Instead of using a cron job, we just wait until user logs in, then fill in whatever missing days they need.

    :return:
    """

    print('updating day table to current')

    current_day = datetime.now().date()
    most_recent_day = models.Day.objects.filter(user_link=current_user).all().order_by('-date')

    if most_recent_day:
        print(most_recent_day)
        most_recent_day = most_recent_day[0].date
    else:
        print('no data found for any days at all...'.format(most_recent_day))
        # get the first day of the month & save it out:
        start_day = current_day - timedelta(days=current_day.day-1)
        models.Day(date=start_day, user_link=current_user).save()
        most_recent_day = start_day

    if most_recent_day >= current_day:
        print('nothing to do.. most recent is either same or more than current day')
        return

    while most_recent_day != current_day:
        print('i need to do some work! cur: {c}, mrd: {m}'.format(c=current_day, m=most_recent_day))
        most_recent_day += timedelta(days=1)
        models.Day(date=most_recent_day, user_link=current_user).save()


def update_day_notes(current_user, day, year, notes):

    """
    Given some note data, add that to the proper day.  Could/should be generalized to any data item.

    :param current_user:
    :param day:
    :param year:
    :param notes:
    :return:
    """

    print('update day notes function is active')

    parse_date = datetime.strptime(day+' '+year, '%A %b %d %Y')
    existing_record = models.Day.objects.filter(date=parse_date, user_link=current_user)[0]

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


def update_events(current_user, category, event_text, day, year, is_update, old_text, delete_event):

    """
    Update, insert, or deleting events in our event table.

    :param current_user:
    :param category:
    :param event_text:
    :param day:
    :param year:
    :param is_update:
    :param old_text:
    :param delete_event:
    :return:
    """

    print('i believe that {0} is category: {1}'.format(event_text, category))

    date = datetime.strptime(day + ' ' + year, '%A %b %d %Y')
    print(date)

    try:

        day_record = models.Day.objects.filter(date=date, user_link=current_user).first()

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


if __name__ == "__main__":
    x = None
    print(x)
