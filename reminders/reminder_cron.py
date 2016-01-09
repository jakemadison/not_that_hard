"""
Regular cron job that runs once per day, reads a config for options, checks the DB for the last time something
was done, creates suggestions if appropriate, and emails out.

Could also have a 'hey, you're on track, good job!' option every x number of days in a streak.

For now the config will be a simple json file, later it will probably be a DB thing.

"""