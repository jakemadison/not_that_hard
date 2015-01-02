from django.db import models

# Create your models here.


class Day(models.Model):

    date = models.DateField()

    # health:
    yoga = models.NullBooleanField(null=True, blank=True, default=None)
    work_out = models.NullBooleanField(null=True, blank=True, default=None)
    biking = models.NullBooleanField(null=True, blank=True, default=None)
    swimming = models.NullBooleanField(null=True, blank=True, default=None)
    limit_boozes = models.NullBooleanField(null=True, blank=True, default=None)

    # art:
    reading = models.NullBooleanField(null=True, blank=True, default=None)
    music = models.NullBooleanField(null=True, blank=True, default=None)

    # intellectually stimulating:
    coding = models.NullBooleanField(null=True, blank=True, default=None)
    podcast = models.NullBooleanField(null=True, blank=True, default=None)

    # finance:
    spend_limit_maintained = models.NullBooleanField(null=True, blank=True, default=None)

    def __unicode__(self):
        return 'day instance id: {0} date: {1}'.format(self.id, self.date)

    def __str__(self):
        return unicode(self).encode('utf-8')