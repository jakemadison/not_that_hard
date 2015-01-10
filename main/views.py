from __future__ import print_function
from django.template import RequestContext
from django.shortcuts import render_to_response
from main.models import Day
import json
from django.forms.models import model_to_dict
from django.http import HttpResponse
from datetime import datetime


# Create your views here.
def index(request):
    context = RequestContext(request)

    context_dict = {'boldmessage': "Testing.....1,2,3"}

    return render_to_response('index.html', context_dict, context)


def get_historical_data(request):

    print('getting historical data...')
    historical_data = Day.objects.all().order_by('date')

    historical_array = []

    for each_day in historical_data:
        parsed_datum = model_to_dict(each_day, exclude='date')
        parsed_datum['date'] = datetime.strftime(each_day.date, '%b %d')
        print(type(each_day.date))
        historical_array.append(parsed_datum)

    return HttpResponse(json.dumps({'message': 'success',
                                    'data': historical_array}),
                        content_type="application/json")
