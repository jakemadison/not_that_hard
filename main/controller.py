from __future__ import print_function
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "not_that_hard.settings")
from django.forms.models import model_to_dict
from datetime import datetime
# import django
# django.setup()
import models


def construct_data_array():

    historical_data_array = []
    historical_data = models.Day.objects.all().order_by('date')

    for each_day in historical_data:
        parsed_datum = model_to_dict(each_day, exclude='date')
        parsed_datum['date'] = datetime.strftime(each_day.date, '%b %d')
        historical_data_array.append(parsed_datum)

    return historical_data_array


def construct_data_array_new():

    # should be in the form: array = [{day: date, wealth: [1, 2], health}]

    parsed_data_array = []
    historical_data = models.Event.objects.all().select_related().order_by('day_link__date')

    # for each in historical_data[0].events:
    #     print(each)

    categories = ['arts', 'smarts', 'wealth', 'health']

    parsed_datum = {}

    for each_event in historical_data:

        print(each_event.major_event, each_event.day_link.date, each_event.category, each_event.name)

        if 'day' not in parsed_datum:
            parsed_datum['day'] = datetime.strftime(each_event.day_link.date, '%b %d')

        elif parsed_datum['day'] != datetime.strftime(each_event.day_link.date, '%b %d'):
            # print('testing {0} against {1}'.format(parsed_datum['day'],
            #                                        datetime.strftime(each_event.day_link.date, '%b %d')))

            parsed_data_array.append(parsed_datum)
            parsed_datum = {}
            continue

        if str(each_event.category) in parsed_datum:
            parsed_datum[str(each_event.category)].append(str(each_event.name))

        else:
            if each_event.major_event:
                print('i recognized this as a major event!')
                parsed_datum[str(each_event.category)] = [str(each_event.name), str(each_event.name)]
                print('datum after adding: {0}'.format(parsed_datum))

            else:
                parsed_datum[str(each_event.category)] = [str(each_event.name)]

    # loop is done!

    parsed_data_array.append(parsed_datum)

    for each in parsed_data_array:
        print(each)

    return parsed_data_array


if __name__ == "__main__":
    x = construct_data_array()
    print(x)