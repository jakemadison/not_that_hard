from django.db import models

# Create your models here.


class Day(models.Model):

    date = models.DateField()
    number_events = models.IntegerField(default=0)
    notes = models.TextField(default='', blank=True, null=True)

    def __unicode__(self):
        return 'day: {0}'.format(self.date)

    def __str__(self):
        return unicode(self).encode('utf-8')


class Event(models.Model):

    day_link = models.ForeignKey('Day', related_name='events')

    category_choices = (
        ('health', 'health'), ('wealth', 'wealth'),
        ('arts', 'arts'), ('smarts', 'smarts')
    )

    category = models.CharField(max_length=30, choices=category_choices)
    name = models.CharField(max_length=30)

    def __unicode__(self):
        return 'event instance id: {0}, cat: {1}, name: {2}'.format(self.id, self.category, self.name)

    def __str__(self):
        return unicode(self).encode('utf-8')


# Trigger that *should* update event count in our day model:
def update_event_count(sender, instance, **kwargs):
    day = instance.day_link
    day.number_events = day.events.count()
    day.save(force_update=True)

models.signals.post_save.connect(update_event_count, sender=Event)
models.signals.post_delete.connect(update_event_count, sender=Event)