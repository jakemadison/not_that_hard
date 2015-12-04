from __future__ import print_function

__author__ = 'Madison'

import httplib2
import os

from apiclient import discovery
import oauth2client
from oauth2client import client
from oauth2client import tools

import datetime
import calendar

# try:
#     import argparse
#     flags = argparse.ArgumentParser(parents=[tools.argparser]).parse_args()
# except ImportError:
flags = None

SCOPES = 'https://www.googleapis.com/auth/calendar.readonly'
CLIENT_SECRET_FILE = 'client_secret.json'
APPLICATION_NAME = 'NOT THAT HARD'


def get_credentials():
    """Gets valid user credentials from storage.

    If nothing has been stored, or if the stored credentials are invalid,
    the OAuth2 flow is completed to obtain the new credentials.

    Returns:
        Credentials, the obtained credential.
    """
    home_dir = os.path.expanduser('~')
    credential_dir = os.path.join(home_dir, '.credentials')

    if not os.path.exists(credential_dir):
        os.makedirs(credential_dir)

    credential_path = os.path.join(credential_dir, 'not_that_hard.json')
    store = oauth2client.file.Storage(credential_path)

    credentials = store.get()

    if not credentials or credentials.invalid:
        flow = client.flow_from_clientsecrets(CLIENT_SECRET_FILE, SCOPES)
        flow.user_agent = APPLICATION_NAME
        credentials = tools.run_flow(flow, store, flags)

        print('Storing credentials to ' + credential_path)

    return credentials


def retrieve_google_data(timeMin, timeMax):

    # get calendar creds:
    credentials = get_credentials()

    # auth and create a service.
    http = credentials.authorize(httplib2.Http())
    service = discovery.build('calendar', 'v3', http=http)

    print('Getting events')

    eventsResult = service.events().list(calendarId='lqm45a6aqdinoeno89fs6vhl2g@group.calendar.google.com',
                                         timeMin=timeMin, timeMax=timeMax,
                                         maxResults=10000, singleEvents=True,
                                         orderBy='startTime').execute()

    events = eventsResult.get('items', [])

    return events


def get_calendar_data(year=None, month=None):

    now = datetime.datetime.now()

    if year is None and month is None:
        min_day = datetime.datetime(year=now.year, month=now.month, day=1)
        max_day = datetime.datetime(year=now.year, month=now.month, day=calendar.monthrange(now.year, now.month)[1])
    else:
        min_day = datetime.datetime(year=year, month=month, day=1)
        max_day = datetime.datetime(year=year, month=month, day=calendar.monthrange(year, month)[1])

    # covert dates into a usable format for google requests:
    timeMin = min_day.isoformat() + 'Z'
    timeMax = max_day.isoformat() + 'Z'

    # grab our events from google:
    events = retrieve_google_data(timeMin, timeMax)

    compiled_events = []
    for event in events:
        start = event['start'].get('dateTime', event['start'].get('date'))
        compiled_events.append({'date': start, 'event': event['summary']})

    if not events:
        print('No events found.')

    all_parsed_data = []
    curr_day = min_day

    while True:
        parsed_datum = {'health': [None, None],
                        'wealth': [None, None],
                        'arts': [None, None],
                        'smarts': [None, None]}

        print(curr_day.strftime('%m %d'), end=': ')
        parsed_datum['day'] = curr_day.strftime('%A %b %d')

        # go through all events and add in those activities that match the current date.  compiled events
        # then doesn't have to care about order.  Although, it is ordered above as well.  Meh.
        for each_event in compiled_events:
            event_date = datetime.datetime.strptime(each_event['date'][:-6], '%Y-%m-%dT%H:%M:%S')

            # if event is the same date, add to datum.
            if event_date.strftime('%Y %m %d') == curr_day.strftime('%Y %m %d'):
                try:
                    category, activity = each_event['event'].split(':')
                    activity = activity.strip()

                    if parsed_datum[category][0] is None:
                        parsed_datum[category][0] = activity
                    elif parsed_datum[category][1] is None:
                        parsed_datum[category][1] = activity

                except ValueError:  # no ':' found in event.  malformed event probably.
                    pass
        # done dealing with events.

        all_parsed_data.append(parsed_datum)

        curr_day += datetime.timedelta(days=1)
        if curr_day > max_day:
            break

    return all_parsed_data


if __name__ == '__main__':
    print('cal data: ', get_calendar_data())
