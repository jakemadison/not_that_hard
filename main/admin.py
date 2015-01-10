from django.contrib import admin
from main.models import Day, Event

# Register your models here.


class DayAdmin(admin.ModelAdmin):
    list_display = ('id', 'date')


class EventAdmin(admin.ModelAdmin):
    list_display = ('day', 'category', 'name', 'major_event')


admin.site.register(Day, DayAdmin)
admin.site.register(Event, EventAdmin)