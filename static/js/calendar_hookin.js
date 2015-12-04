/**
 * Created by Madison on 15-10-12.
 */


function journal_toggle() {

    console.log('journal toggle is now active');

    // the rest of the function should concern itself with what the mode should be,
    // not what it was.  Do the inversion first:
    journal_mode = !journal_mode;

    var journal_text = $('#journal_toggle_text');

    if (journal_mode) {
        journal_text.html('Journal');
        get_historical_data({'amount': null});
        return;
    }

    // otherwise...
    journal_text.html('Calendar');
    get_google_cal_data();

}

var calendar_data = null;

function get_google_cal_data(options) {

    console.log('getting google cal data');
    // I wonder if we can just mash our data in the global var and call create data and see if everything explodes
    // or not.  Except that donuts are maybe not the best repr of calendar data.  What is?  Should Future things
    // mirror journal things?  Should we plan for H, W, A, S? Should we only have two events?  That doesn't really
    // make any sense though, because actually planning things involves a lot of other factors.

    if (calendar_data === null) {  // NB this will need to check for current day or whatever.

        console.log('calendar data is null.  getting server to retrieve it please..');

        $.get('get_calendar_data', options,
            function (result) {
                calendar_data = result.data;
                build_calendar_data();
                populate_page(result);  // actually builds out the table data
            });

    } else {
        build_calendar_data();
    }
}


function build_calendar_data() {
        console.log("building calendar data.");
        console.log('now ready to build front end with calendar data: ', calendar_data);
        data = calendar_data;
        create_donut();  // creates our donuts based on new global data

}