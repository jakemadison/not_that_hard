from django.contrib import admin
from main.models import Day

# Register your models here.


class DayAdmin(admin.ModelAdmin):
    list_display = ('id', 'date')


admin.site.register(Day, DayAdmin)