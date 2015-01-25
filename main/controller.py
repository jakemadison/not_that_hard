from __future__ import print_function
# import os
# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "not_that_hard.settings")
from django.forms.models import model_to_dict
from datetime import datetime
# import django
# django.setup()
import models


# this can probably be considered dead now..
def construct_data_array():

    historical_data_array = []
    historical_data = models.Day.objects.all().order_by('date')

    for each_day in historical_data:
        parsed_datum = model_to_dict(each_day, exclude='date')
        parsed_datum['date'] = datetime.strftime(each_day.date, '%b %d')
        historical_data_array.append(parsed_datum)

    return historical_data_array


def construct_data_array_new_again():

    # should be in the form: array = [{day: date, wealth: [1, 2], health}]

    parsed_data_array = []

    historical_data = models.Day.objects.all().order_by('date')

    parsed_datum = {'health': [None, None],
                    'wealth': [None, None],
                    'arts': [None, None],
                    'smarts': [None, None]}

    for each_day in historical_data:

        # get associated events:
        day_events = each_day.events.all()

        parsed_datum['day'] = datetime.strftime(each_day.date, '%d')

        print('adding events for day: {0}'.format(each_day))

        for each_event in day_events:

            if parsed_datum[str(each_event.category)][0] is None:
                parsed_datum[str(each_event.category)][0] = str(each_event.name)

            else:
                parsed_datum[str(each_event.category)][1] = [str(each_event.name)]

        parsed_data_array.append(parsed_datum)
        parsed_datum = {'health': [None, None],
                        'wealth': [None, None],
                        'arts': [None, None],
                        'smarts': [None, None]}

    for each in parsed_data_array:
        print('-------------')
        print(each)

    return parsed_data_array, 'January 2015'


if __name__ == "__main__":
    x = construct_data_array()
    print(x)