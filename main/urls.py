from django.conf.urls import patterns, url
from main import views


urlpatterns = patterns('',
                       url(r'^$', views.index, name='index'),
                       # url(r'^get_historical_data$', views.get_historical_data, name='get_historical_data'),
                       )