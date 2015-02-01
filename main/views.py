from __future__ import print_function
from django.template import RequestContext
from django.shortcuts import render_to_response
import json
from django.http import HttpResponse
import controller
from django.views.decorators.http import require_POST
from django.core.context_processors import csrf
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import csrf_exempt


# Create your views here.
@ensure_csrf_cookie
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

    data_array, month, has_next, has_prev = controller.construct_data_array(current_val, amount,
                                                                            has_prev_received, has_next_received)

    # print('i am sending month: {m}, p: {p}, n: {n}'.format(m=month, p=has_prev, n=has_next))

    return HttpResponse(json.dumps({'message': 'success',
                                    'data': data_array,
                                    'month': month,
                                    'has_next': has_next,
                                    'has_prev': has_prev}),
                        content_type="application/json")


@require_POST
@csrf_exempt  # temp hack, because csrf junk is BORING
def update_stuff(request):
    print('updating stuff')

    c = {}
    c.update(csrf(request))

    new_notes = request.POST.get('new_notes', None)
    day = request.POST.get('day', None)
    date = request.POST.get('date', None)

    if new_notes is not None and day is not None and date is not None:
        year = date.split(' ')[-1]
        print('i received the following notes: {n}, {d}, {dt}'.format(n=new_notes, d=day, dt=date))
        operation_result = controller.update_day_notes(day, year, new_notes)

    else:
        print('apparently I got nothing...')
        operation_result = 'Not Enough Required Data'

    return HttpResponse(json.dumps({'message': operation_result}), content_type="application/json")


