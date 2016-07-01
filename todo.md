okay, this is just getting fucking stupid.

I
1) This needs to be a SIMPLE project.
2) Just use the god damn django admin as an entry point to DB ops
2a) Fuck doing it client side for now.  That can come later

II
Devise a way to have major completion and minor completion events.  
There is a distinct difference there.  How do we model that?
How do we present that? (without minor looking like a failure).

III
SERIOUSLY rethink using D3 for this.  Or if D3 is going to be used,
WAY more research is needed on it to do what we want.

IT SHOULD NOT BE THIS FUCKING UNINTUITIVE AND HARD TO MAKE SIMPLE SHIT.

coding without smoking is hard... :<

/RANT.


=====

Add a weekly = which overlays the past 7 days? showing you patterns in how dark things are?

-> it would be nice if they just kinda mashed together in the JS. Accordion style.

=====
Create two rings.  One is basic/minor, the other is advanced/major.

How does this work again?

1 minor is OK
1 major is better
2 * minor = 1 major

Oh, a major one should take up two minor blocks.  That's easy.


====
Let's also make this a journal of sorts.  I'm terrible at sticking to journals too, 
so this might make it simpler for that too.  Or they'll each reinforce the other.

Whatever, anyways, major iteration #2 is to move from django admin to:
double click a day, gives you an enter/edit data modal.

we don't need a new day button.  We just go from start date to now, filling in missing DB days
with empty donuts.

Iteration 3 might be to add some hover labels on a day when you hover... hrrrrm.



If we're going the major/minor route, grouped by category type, I need to change the data model around
anyways.

It needs to be:

Event:
event_id [PK]
day = [FK on Day table]
category => [health, wealth, smarts, arts]
name => [biking, coding, swimming, reading] (should these be arbitrary or fixed?)
major_event => [true, false]


Day:
day_id [PK]
date = [date]
notes [varchar] (journal stuff basically)
number_events = (sum of events for associated for that day, convenience data, really)


This allows for a day to have a variable number of possible events.




the backend should probably deal with turning this into an acceptable array for JS to process.
at the same time, it can create our missing null days.




Major Items Left:
- properly parse data into a usable state for front end 
- create secondary ring to differentiate major/minor
- hover to show tag for that event
- figure out fill/lack of fill for missing stuff.
- properly connect data -> presentation

nice-to-haves:
- click to edit
- Month Choropleth as top row??
- actually more choropleth-y.. don't limit to two events per day, but number of items in 
pie ring segment are determined by events in that category, and the color tone of overall segment
is determined by that number.  although min of 2 is still good.. it just gets better after that:
minor (1/2), major (1 full), 3 minor (3 eq segments filling major, diff colour), etc.
- streak/longest streak info.

- suggestion box?  It looks like it's been a while since you've done this... maybe you'd like to...


======

- Click on column name should do some kind of transition to only showing that grouping
- still need input on front end modal
- need to finish month transitions and controller work
- auto-add current day in DB (or just build from max(day) vs sysdate?)


======
Needed still:
- on init page load, update days table if needed (after that, we're pretty single-pagey)
- A way to edit/add events in the modal
- clean up the table view
- transitions!  also, definitely need some tweaking to the way our exit/update d3 works
- some way to fit in "must do dailies" eg, french, that fits with the current model/presentation
- more generalization, less hardcoding of stuff
- pills showing number of events per thing?
- the ability to click a particular category and show the month view of that?


- we should just refactor out "major event" as a thing.  It's useless and unnecessarily complex.
--> there's no reason someone can't fill two blocks with the same activity, and doesn't require that junk.
.....



======
Okay where are we at?
-> (enhance) add a to-do list popup?
-> (enhance) add a user model/login
-> (enhance) deploy to an actual site?
-> (enhance) view only one category
-> (enhance) actual choropleth for month-view

-> update main page pie when event added/removed
-> update modal when event removed
-> update table when event added/removed
-> update main text
-> update screenshots
-> add a requirements.txt


======
new idea here: 'must do's.  This is based on the realization that I'm a lot better at sticking to stuff
if there is absolutely no room for rationalization/compromise.  Things that will go in this type of category:
- not smoking
- not drinking on weekdays
- some kind of exercise

could be added later:
- 20-30 mins of french


Layout will be another modal.  This will be a lot more like githubs.  I like the small squares look too, we'll keep that.
each category will get a left-aligned title, followed by a series of squares, ranging from start date of the must do
to the current date.

Data model:
each item will have a category name, a schedule (cron based?), and a historical record.
historical record can be as simple as: date_link-true/false

problems to think about:
anything that is not scheduled for daily.
do we just autofill a true box for days off?
if we don't do that, how do we adjust the schedule?
logically a streak should be # of days performing the action, and shouldn't include scheduled days off.

Ah, okay.  schedule should only determine if a new day/event element should be created.  This means that historical
data and present data can be inconsistent, that's fine.  That also makes more sense in terms of what this is accomplishing
what we care about is: given schedule X at whatever point, how successful were we at actually doing that?

Okay, so click-to-fill (or empty) any given point point, hover will get tool tip with day info.
We'll show current streak, best streak.

It would also be nice to integrate into the main cal view.  So checking off a "must do" automatically gives you an
event in the main view.

hard deadline on this is: April 1st.

Ha Ha Just kidding.

======

Okay, so where from here?  There are a couple of possibilities.  1) incorporate future plans as well.  Somehow call
in to Google Cal Services?  So make a switch that goes from Backward-looking to Forward-Looking?  I really like the idea
of that kind of integration and because it ties in what you've done, with what you're planning to do, and you can
look back on your history and kind of plan accordingly.  Plus with the google events, it makes that part accessible
on multiple devices, while the reflective, journal parts are only once you've settled down.

Okay, I like that.  Also, there are still a metric shit tonne of bugs to correct on this fucking thing.

=====

For non-auth'd usage, how about randomly creating events?  I guess that's tricky if you also want to showcase the
saving/editing of days..  but how else do you keep it current to today??  Hm... some combination of the two, possibly.



=====
An easier way to START doing the event stuff would just be to copy the db tables/logic of the existing days
and basically just move data between them.  Fuck, you could even just make a flag of some kind.

Another option would be to make a different format for planned events.  Like, a list of possible things, for managing
the day.  Hrrrrm.  What's the most useful?

The nice thing about integration with google, is that suddenly your planner is everywhere, and your journal is at home.
That kind of makes intuitive sense doesn't it?

More thought clearly needed on how to go forward on this.

====

Here's an easy one to start with: create a year view that just dumps everything from Jan 1st to present in one
page.  May need to change the keyFn that it uses.  Not sure where month labels will go.



====
here's an idea for the weekend:
- send an email after x days (3?, config?) mentioning, hey, it's been this long since you've done one of these.
Beacause it's always shocking how long it's been since, eg, exercise.


=====
Really, all days in the table view (at least) should be drawn out for the month.  Just greyed out lightly for 
future days vs today.

=====
Something that would be really cool to have is a min number per day (2) that gets drawn out.  But, if there are
more events than just the two, split that section up into its constituent events.  keep splitting each area up
i guess until a max.

- problems are going to be with rendering the table itself, how to add a new event past two rather than overwriting
the existing event.

=====

Incorporate historical weather patterns for analysis??  That might be kind of cool... Hmm...

Okay, so immediate hover gives you the day, and then calls to some api (that hopefully exists) and gets you what the
weather that day was, and renders it in the tool tip...


=====

I realize that I've been keeping a bunch of "fake events" in my iCal calendar that are just kind of reminders to do
things on certain days, or "sometime in the future", and they just kind of float around like that and are dumb.

-> feature request: make a collapsable sidebar that holds these items, does not care about what month it is,
i guess for now, are not tied to any particular day (although could be down the line).  And are just sort of little
reminders to hang out with people, or vague plans for future.

each one can be killable with a click, moveable?, add a little box for adding them to the sidebar.


=======
Nice easy-ish thing would be to have the front end be able to drill down on categories with a click.
hopefully just a class change thing?  maybe use opacity to just make the remaining categories pop out?

- could do the same for items in a category too.

========

Break down the "notes" part into sections?  At some point I want to move from using this as my journal, and get back
into writing an actual, physical journal.  So the notes here will actually be truer to their name.

========

Some kind of emotional marker would be really good.  I'd really like to track that stuff.  What dimensions would it
have though?  What scale?  What implementation? 

High/Low Energy 
Happy/Sad
Anxious/Confident
Stressed/Relaxed









