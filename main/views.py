from __future__ import print_function
from django.template import RequestContext
from django.shortcuts import render_to_response
import json
from django.http import HttpResponse
from controllers import controller, year_controller, slider_controller, must_do_controller
from django.views.decorators.http import require_POST
from django.core.context_processors import csrf
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import csrf_exempt
import controllers.calendar_controller as cc


# Create your views here.
@ensure_csrf_cookie
def index(request):
    current_user = request.user
    print('entered index view rendering for user: {}, id: {}'.format(current_user, current_user.id))
    context = RequestContext(request)
    controller.update_day_table_to_current(current_user.id)

    print('finished all prep.  Rendering Template now')
    return render_to_response('index.html', context)


def get_calendar_data(request):
    print('getting google cal data')

    result = cc.get_calendar_data()

    return HttpResponse(json.dumps({'message': 'success', 'data': result}), content_type="application/json")


def get_historical_data(request):

    """
    Main async request to get historical data from the front end.  Gets and munges it from the controller.

    :param request:
    :return:
    """

    print('getting historical data...')

    current_user_id = request.user.id
    if current_user_id is None:
        return HttpResponse(json.dumps({'message': 'major failure.  improper user id.'}))

    amount = request.GET.get('amount', None)
    current_val = request.GET.get('current', None)
    has_prev_received = request.GET.get('has_prev', None)
    has_next_received = request.GET.get('has_next', None)

    print('i received current: {c}, amount: {a}, p: {p}, n: {n}'.format(c=current_val, a=amount,
                                                                        p=has_prev_received, n=has_next_received))

    data_array, month, has_next, has_prev, category_counts = controller.construct_data_array(current_user_id,
                                                                                             current_val,
                                                                                             amount,
                                                                                             has_prev_received,
                                                                                             has_next_received)

    # print('i am sending month: {m}, p: {p}, n: {n}'.format(m=month, p=has_prev, n=has_next))

    print('finished all calcs.  sending to frontend now')
    return HttpResponse(json.dumps({'message': 'success',
                                    'data': data_array,
                                    'month': month,
                                    'has_next': has_next,
                                    'has_prev': has_prev,
                                    'category_counts': category_counts}),
                        content_type="application/json")


def get_year_data(request):
    print('getting year data now')

    result = year_controller.construct_year_data()

    return HttpResponse(json.dumps({'message': 'success', 'data': result}), content_type="application/json")


@require_POST
@csrf_exempt  # temp hack, because csrf junk is BORING  # TODO: this matters now.
def update_stuff(request):

    """
    Async request to update some backend Notes data.  Need to grab current user from session here.

    :param request:
    :return:
    """

    print('updating stuff')

    current_user_id = request.user.id
    if current_user_id is None:
        return HttpResponse(json.dumps({'message': 'major failure.  improper user id.'}))

    c = {}
    c.update(csrf(request))

    new_notes = request.POST.get('new_notes', None).encode('utf-8')
    day = request.POST.get('day', None)
    date = request.POST.get('date', None)

    print('got parameters')

    if new_notes is not None and day is not None and date is not None:
        year = date.split(' ')[-1]

        try:
            print('i received the following notes: {n}, {d}, {dt}'.format(n=new_notes, d=day, dt=date))
            operation_result = controller.update_day_notes(current_user_id, day, year, new_notes)
        except UnicodeEncodeError, u:
            print('god damn I hate encodings {0}'.format(u))
            operation_result = 'Encoding Error :<'

    else:
        print('apparently I got nothing...')
        operation_result = 'Not Enough Required Data'

    print('finished all calculations.  sending result message to front end')
    return HttpResponse(json.dumps({'message': operation_result}), content_type="application/json")


@require_POST
@csrf_exempt  # temp hack, because csrf junk is BORING
def update_sliders(request):

    """
    Get some slider data from the front end and update it on the DB.

    :param request:
    :return:
    """

    print('updating sliders!!!')
    slider_data = request.POST.dict()
    print('----- slider data: {}'.format(slider_data))

    controller_response = slider_controller.update_slider_data(slider_data)

    return HttpResponse(json.dumps({'message': controller_response}), content_type="application/json")


# These could probably be the same view on backend and function on front end,
# and view could deal with event vs notes... later.
@require_POST
@csrf_exempt  # temp hack, because csrf junk is BORING  # TODO: this matters now.
def update_event(request):

    """
    Update events on the backend.

    :param request:
    :return:
    """

    print('updating event')

    current_user_id = request.user.id
    if current_user_id is None:
        return HttpResponse(json.dumps({'message': 'major failure.  improper user id.'}))

    category = request.POST.get('category', None)
    event_text = request.POST.get('event_text', None)
    day = request.POST.get('day', None)
    date = request.POST.get('date', None)
    is_update = request.POST.get('is_update', None)
    old_text = request.POST.get('old_text', None)
    remove_event = request.POST.get('remove_event', None)

    print('i received a bunch of values!! {0}, {1}, {2}, {3}, {4}, {5}, {6}'.format(category, event_text,
                                                                                    day, date, is_update,
                                                                                    old_text, remove_event))
    year = date.split(' ')[-1]

    result_message = controller.update_events(current_user_id, category, event_text, day, year,
                                              is_update, old_text, remove_event)

    return HttpResponse(json.dumps({'message': result_message}), content_type="application/json")


# Must Do Views down here:
def get_must_do_data(request):

    """
    Deprecated.  This should get moved somewhere else.

    :param request:
    :return:
    """

    print('getting must do data...')

    must_do_controller.get_must_do_data()

    return HttpResponse(json.dumps({'message': 'success'}), content_type="application/json")
