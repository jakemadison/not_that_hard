/**
 * Created by jmadison on 3/9/15.
 */

/*global $ */

// Build our table:
function populate_page(result) {

    console.log('populate page running');

    function build_row(row_data) {
        //console.log('building a new row...');

        //var notes = row_data.notes || '-';

        var day_array = row_data.day.split(" ");
        var day = day_array[0].substring(0, 3); // + ' ' + day_array[1] + ' ' + day_array[2];

        var health = row_data.health[0] || '-';
        var wealth = row_data.wealth[0] || '-';
        var arts = row_data.arts[0] || '-';
        var smarts = row_data.smarts[0] || '-';

        health = (row_data.health[1] ? health + ' <b>+</b> ' + row_data.health[1] : health);
        wealth = (row_data.wealth[1] ? wealth + ' <b>+</b> ' + row_data.wealth[1] : wealth);
        arts = (row_data.arts[1] ? arts + ' <b>+</b> ' + row_data.arts[1] : arts);
        smarts = (row_data.smarts[1] ? smarts + ' <b>+</b> ' + row_data.smarts[1] : smarts);

        return '<tr class="row_data"> <td class="day_label">' + day + ':</td><td class="health_row">' +
            health + '</td><td class="wealth_row">' +  wealth + '</td><td class="arts_row">' + arts +
            '</td><td class="smarts_row">' + smarts + '</td></tr>';


    }

    $('.row_data').remove();

    var test_table = $('.test_body');
    for (var i=0; i<result.data.length; i++) {
        var this_row = build_row(result.data[i]);
        test_table.append(this_row);
    }

    // calendar data is not setting category counts yet.  I guess that could be added.
    if (result.category_counts !== undefined) {

        $('#health_badge').text(result.category_counts.health);
        $('#wealth_badge').text(result.category_counts.wealth);
        $('#arts_badge').text(result.category_counts.arts);
        $('#smarts_badge').text(result.category_counts.smarts);
    }


}

