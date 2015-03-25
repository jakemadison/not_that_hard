from django.contrib import admin
from main.models import Day, Event, MustDoCategories, MustDoHistory

# Register your models here.


class DayAdmin(admin.ModelAdmin):
    list_display = ('id', 'date', 'number_events')


class EventAdmin(admin.ModelAdmin):
    list_display = ('day_link', 'category', 'name')


class MDCAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'schedule')


class MDHAdmin(admin.ModelAdmin):
    list_display = ('date', 'category_link', 'done')

admin.site.register(Day, DayAdmin)
admin.site.register(Event, EventAdmin)
admin.site.register(MustDoCategories, MDCAdmin)
admin.site.register(MustDoHistory, MDHAdmin)