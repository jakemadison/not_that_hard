from django.conf.urls import url, include

from django.contrib import admin
from main import views

admin.autodiscover()

urlpatterns = [
    # Examples:
    # url(r'^$', 'not_that_hard.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', include('main.urls')),
    url(r'^get_historical_data$', views.get_historical_data, name='get_historical_data'),
    # url(r'^get_calendar_data$', views.get_calendar_data, name='get_calendar_data'),
    # url(r'^get_year_data$', views.get_year_data, name='get_year_data'),
    url(r'^update_stuff$', views.update_stuff, name='update_stuff'),
    url(r'^update_event$', views.update_event, name='update_event'),
    url(r'^get_git_info$', views.get_git_info, name='get_git_info')
    # url(r'^update_sliders$', views.update_sliders, name='update_sliders'),
    # url(r'^get_must_do_data$', views.get_must_do_data, name='get_must_do_data'),
]
