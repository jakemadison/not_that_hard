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






