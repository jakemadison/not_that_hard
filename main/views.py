from __future__ import print_function
from django.template import RequestContext
from django.shortcuts import render_to_response
import json
from django.http import HttpResponse
import controller


# Create your views here.
def index(request):
    context = RequestContext(request)
    return render_to_response('index.html', context)


def get_historical_data(request):

    print('getting historical data...')

    amount = request.GET.get('amount', None)
    current_val = request.GET.get('current', None)

    print('i received current: {c}, amount: {a}'.format(c=current_val, a=amount))
    data_array, month, has_next, has_prev = controller.construct_data_array_new_again(current_val, amount)

    return HttpResponse(json.dumps({'message': 'success',
                                    'data': data_array,
                                    'month': month,
                                    'has_next': has_next,
                                    'has_prev': has_prev}),
                        content_type="application/json")


