from django.contrib import admin
from main.models import Day, Event, MustDoCategories, MustDoHistory

# Register your models here.


class DayAdmin(admin.ModelAdmin):
    list_display = ('id', 'date', 'number_events')


class EventAdmin(admin.ModelAdmin):
    list_display = ('day_link', 'category', 'name')


admin.site.register(Day, DayAdmin)
admin.site.register(Event, EventAdmin)
admin.site.register(MustDoCategories)
admin.site.register(MustDoHistory)