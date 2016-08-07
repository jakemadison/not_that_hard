from __future__ import print_function
from datetime import datetime, timedelta
import main.models as models


def update_slider_data(slider_data):

    print('updating_slider_data')

    try:
        target_date = slider_data['proper_date']
        parsed_date = datetime.strptime(target_date, '%d %B %Y')
        print(parsed_date)
        day_record = models.Day.objects.filter(date=parsed_date).first()
        slider_record = models.Slider.objects.filter(day_link=day_record).first()

        if slider_record is None:
            slider_record = models.Slider(day_link=day_record)

        slider_record.happysad = int(slider_data['happysad_slider'])
        slider_record.anxiety = int(slider_data['anxiety_slider'])
        slider_record.energy = int(slider_data['energy_slider'])
        slider_record.stress = int(slider_data['stress_slider'])

        slider_record.save()

    except Exception, e:
        return 'major exception! {} {}'.format(e, e.message)

    return 'success'


def get_day_feelings(feeling_record):
    
    feelings_values = {}
    
    if feeling_record is not None:
        feelings_values['happysad'] = feeling_record.happysad
        feelings_values['anxiety'] = feeling_record.anxiety
        feelings_values['energy'] = feeling_record.energy
        feelings_values['stress'] = feeling_record.stress
    else:
        feelings_values['happysad'] = 50
        feelings_values['anxiety'] = 50
        feelings_values['energy'] = 50
        feelings_values['stress'] = 50

    return feelings_values
