from __future__ import print_function
from datetime import datetime, timedelta
import main.models as models


def construct_year_data():

    # this function should build out totals per category, per month, which will get used to build a real
    # choropleth map of each month:

    # {'Jan 2015': {'arts': 10, 'smarts': 5, 'health': 10, 'wealth': 15}
    #  'Feb 2015': {'arts': 12, 'smarts': 25, 'health': 13, 'wealth': 10}
    #  (etc...)
    # } [{date: 'blah', data: {blah, blah, blah}},
    # [date, arts, smarts, health, wealth, total]

    historical_data = models.Day.objects.all().order_by('date')

    year_array = []
    year_datum = {'date': datetime.strftime(historical_data[0].date, '%b %y'), 'total_days': 0}

    for each_day in historical_data:
        year_datum['total_days'] += 1

        event_data = each_day.events.all()
        for each_event in event_data:

            if datetime.strftime(each_day.date, '%b %y') == year_datum['date']:
                if 'cat_data' in year_datum:
                    year_datum['cat_data'][each_event.category] += 1
                else:
                    year_datum['cat_data'] = {'arts': 0, 'smarts': 0, 'health': 0, 'wealth': 0}
                    year_datum['cat_data'][each_event.category] += 1

            else:
                year_array.append(year_datum)
                year_datum = {'date': datetime.strftime(each_day.date, '%b %y'), 'total_days': 0,
                              'cat_data': {'arts': 0, 'smarts': 0, 'health': 0, 'wealth': 0}}
                year_datum['cat_data'][each_event.category] += 1

    year_array.append(year_datum)

    print(year_array)

    return year_array
