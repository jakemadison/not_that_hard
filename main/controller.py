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

    parsed_data_array = []
    historical_data = models.Event.objects.all().select_related()

    for each_event in historical_data:
        parsed_datum = model_to_dict(each_event)
        parsed_datum['event_date'] = datetime.strftime(each_event.day_link.date, '%b %d')

        # parsed_datum['date'] = datetime.strftime(each_day.date, '%b %d')
        parsed_data_array.append(parsed_datum)


    print('parsed array: ', parsed_data_array)

    return parsed_data_array


if __name__ == "__main__":
    x = construct_data_array()
    print(x)