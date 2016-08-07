import main.models as models
from datetime import datetime, timedelta

# controller functions for 'must do's will go here.


def get_must_do_data():
    print('updating must do history now...')
    update_must_do_history()

    print('getting must do data')
    must_do_array = models.MustDoHistory.objects.all()
    print(must_do_array)
    must_do_cats = models.MustDoCategories.objects.all()
    print(must_do_cats)


def update_must_do_history():
    print('updating must do history...')
    must_do_events = models.MustDoCategories.objects.all()

    for each_category in must_do_events:
        print('now updating event: {}'.format(each_category))
        schedule_array = each_category.schedule.split(';')
        print('schedule: days: {}, months: {}'.format(schedule_array[0], schedule_array[1]))

        if schedule_array[0] != '*':
            day_array = schedule_array[0].split(',')
            today = datetime.now().weekday()

            if today in day_array:
                print('i need to update historical!')

        if schedule_array[1] != '*':
            month_array = schedule_array[1].split(',')
            this_month = datetime.now().month
            print('is this correct month? {}'.format(this_month))
            print('month array: {}'.format(month_array))

            # this is where we check what the last day was in the history
            # and then add depending on the current schedule set..
