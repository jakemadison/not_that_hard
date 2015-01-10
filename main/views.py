from __future__ import print_function
from django.template import RequestContext
from django.shortcuts import render_to_response
import json
from django.http import HttpResponse
import controller


# Create your views here.
def index(request):
    context = RequestContext(request)

    context_dict = {'boldmessage': "Testing.....1,2,3"}

    return render_to_response('index.html', context_dict, context)


def get_historical_data(request):

    print('getting historical data...')

    data_array = controller.construct_data_array()

    print(data_array)

    return HttpResponse(json.dumps({'message': 'success',
                                    'data': data_array}),
                        content_type="application/json")


def temp_entry_point(request):

    data = controller.construct_data_array_new()

    return HttpResponse(json.dumps({'message': 'success',
                                    'data': data}),
                        content_type="application/json")
