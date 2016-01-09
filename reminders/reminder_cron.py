"""
Regular cron job that runs once per day, reads a config for options, checks the DB for the last time something
was done, creates suggestions if appropriate, and emails out.

Could also have a 'hey, you're on track, good job!' option every x number of days in a streak.
Could have a 'heres what your week looks like so far, here's your month so far', something like that?
Can we render D3 in an email??? -> use phantomJs, grab the page, render to png, send it on out. NP.
That can be a V2 though.  For now, KISS.

For now the config will be a simple json file, later it will probably be a DB thing.

To Do:
- Fix perms on server side
- only send on periodicity (every x days) to not get super annoying.
- better suggestions
- better emails formatting, pictures
- inspiring quotes?  too cheesy?
- change settings on the front end
- send some kind of graphic snapshot of the recent week using phantomJS or whatever

"""

import json
import sqlite3 as db
from not_that_hard.settings import DATABASES
from datetime import datetime
from django.core.mail import EmailMessage


def get_config():
    with open('reminder_config.json') as f:
        config = json.load(f)
    return config


def get_last_event_date(event_type):

    # event_type = 'sfasda'

    sql = "select max(date) from main_day d join main_event e on e.day_link_id=d.id where e.category = ?"

    db_loc = DATABASES['default']['NAME']

    print event_type,
    with db.connect(db_loc) as conn:
        cur = conn.cursor()
        cur.execute(sql, (event_type,))
        max_date = cur.fetchone()[0]

    return max_date


def get_suggestion_for_event(event_type):

    sql = "select name from main_event where category = ? order by random() limit 1"

    db_loc = DATABASES['default']['NAME']

    print event_type,
    with db.connect(db_loc) as conn:
        cur = conn.cursor()
        cur.execute(sql, (event_type,))
        random_event = cur.fetchone()[0]

    return random_event


def create_email_reminder(reminders):
    html = """
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>html title</title>
  <style type="text/css" media="screen">
    table{
        background-color: #AAD373;
        empty-cells:hide;
    }
    td.cell{
        background-color: white;
    }
  </style>
</head>
<body>
<p>Hey, it looks like you haven't added to your events lately.  </p>
"""

    reminder_template = """
    <p>
    It's been <b>{}</b> days since you last did something to contribute to your <b>{}</b>.  Something in the
    past you did for
    that category was <b>{}</b>.  Maybe you could do that again?
    </p>
    """

    for each_reminder in reminders:
        html += reminder_template.format(each_reminder['days_since'],
                                         each_reminder['name'],
                                         each_reminder['suggestion'])
        html += '<br>'

    html += """
    </body>
    """

    return html


def send_email(raw_content, address, sender='noreply@notthathard.jakemadison.com'):

    print 'constructing email'
    email_content = create_email_reminder(raw_content)

    print 'sending email content now to {}'.format(address)

    # everything should be good here, just send the stupid email
    print email_content

    msg = EmailMessage('A friendsly reminder from NTH :)', email_content, sender, [address])
    msg.content_subtype = "html"  # Main content is now text/html
    return msg.send()


def main():
    reminder_config = get_config()
    turned_on_types = [x for x in reminder_config['turned_on'] if reminder_config['turned_on'][x]]
    reminder_periodicity = int(reminder_config['days_until_reminder'])

    # all events that require reminders:
    reminder_array = []

    today = datetime.now()

    for each_type in turned_on_types:
        last_event_date = get_last_event_date(each_type)
        print last_event_date

        if last_event_date is None:  # means event type has never been recorded.
            continue

        days_since = (today - datetime.strptime(last_event_date, '%Y-%m-%d')).days
        if days_since >= reminder_periodicity:
            reminder_unit = {'name': each_type, 'days_since': days_since}
            reminder_array.append(reminder_unit)

    # okay, now we know our event types that need reminding on.  Let's construct reminders.
    for each_reminder_type in reminder_array:
        # try and get a suggestion:
        each_reminder_type['suggestion'] = get_suggestion_for_event(each_reminder_type['name'])

    # should be all good,
    # send off our reminders + suggestions :)
    send_email(reminder_array, reminder_config['email_address'])

    print 'done!'



if __name__ == '__main__':
    main()
