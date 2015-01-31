from __future__ import print_function
from django.template import RequestContext
from django.shortcuts import render_to_response
import json
from django.http import HttpResponse
import controller


# Create your views here.
def index(request):
    print('entered index view rendering')
    context = RequestContext(request)

    controller.update_day_table_to_current()

    return render_to_response('index.html', context)


def get_historical_data(request):

    print('getting historical data...')

    amount = request.GET.get('amount', None)
    current_val = request.GET.get('current', None)
    has_prev_received = request.GET.get('has_prev', None)
    has_next_received = request.GET.get('has_next', None)

    # print('i received current: {c}, amount: {a}, p: {p}, n: {n}'.format(c=current_val, a=amount,
    #                                                                     p=has_prev_received, n=has_next_received))

    data_array, month, has_next, has_prev = controller.construct_data_array_new_again(current_val,
                                                                                      amount, has_prev_received,
                                                                                      has_next_received)

    # print('i am sending month: {m}, p: {p}, n: {n}'.format(m=month, p=has_prev, n=has_next))

    return HttpResponse(json.dumps({'message': 'success',
                                    'data': data_array,
                                    'month': month,
                                    'has_next': has_next,
                                    'has_prev': has_prev}),
                        content_type="application/json")


