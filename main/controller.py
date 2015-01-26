from __future__ import print_function
# import os
# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "not_that_hard.settings")
from django.forms.models import model_to_dict
from datetime import datetime
# import django
# django.setup()
import models
import monthdelta


def construct_data_array_new_again(current_val=None, amount=None):

    # should be in the form: array = [{day: date, wealth: [1, 2], health}]

    if current_val is None or amount is None:
        month = str(datetime.now().month)
        year = str(datetime.now().year)
        month_name = datetime.now().strftime('%B')

    else:
        new_date = datetime.strptime(current_val, '%B %Y') + monthdelta.monthdelta(int(amount))
        print('current date: {0}'.format(new_date))

        month = new_date.strftime('%m')
        year = new_date.strftime('%Y')
        month_name = new_date.strftime('%B')

    # now to actually get our data:
    parsed_data_array = []

    historical_data = models.Day.objects.all().order_by('date').filter(date__year=year, date__month=month)

    parsed_datum = {'health': [None, None],
                    'wealth': [None, None],
                    'arts': [None, None],
                    'smarts': [None, None]}

    for each_day in historical_data:

        # get associated events:
        day_events = each_day.events.all()

        parsed_datum['day'] = datetime.strftime(each_day.date, '%b %d')

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

    return parsed_data_array, month_name + ' ' + year


if __name__ == "__main__":
    x = None
    print(x)