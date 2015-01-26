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

    amount = request.GET.get('amount', None)
    current_val = request.GET.get('current', None)

    print('i received current: {c}, amount: {a}'.format(c=current_val, a=amount))
    data_array, month = controller.construct_data_array_new_again()

    return HttpResponse(json.dumps({'message': 'success',
                                    'data': data_array,
                                    'month': month}),
                        content_type="application/json")


#
#
#
#
def temp_entry_point(request):

    print('returning data from new controller function now.....')

    data = controller.construct_data_array_new()

    return HttpResponse(json.dumps({'message': 'success',
                                    'data': data}),
                        content_type="application/json")
