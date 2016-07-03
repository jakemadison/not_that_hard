/**
 * Created by jmadison on 1/2/15.
 */

// Helper stuff:
//function getCookie(name) {


// year modal stuff:
// this should get moved.  This file is already too bloated.
function build_year_modal() {
    "use strict";

    $('.year_modal').modal('show');

    function create_year(year_data) {

        // btw, here (or probable in the controller actually) we should deliver data as a
        // percentage of total days (total events / days in month * 2) to normalize across
        // different month lengths, including whatever the current month is.

        //year_data = [1,2,3,4,5];

        console.log('create year is active with data: ', year_data);

        var radius_year = 60,
            year_chart = d3.select('.year_modal_chart'),
            //.append('svg')
            //.attr("class", 'year_chart')
            //.attr("width", 500)
            //.attr("height", 200);

            keyFnYr = function (d, i) { console.log('me! keyfn!', d, i); return d.date; },

            years_pie = year_chart.selectAll('.years_pie').data(year_data, keyFnYr),
            year_pies_enter = years_pie.enter(),
            year_pie_group = year_pies_enter.append('svg').attr('class', 'years_pie')
                .attr('width', radius_year * 2)
                .attr('height', radius_year * 2).append('g')
                .attr('transform', 'translate(' + radius_year + ',' + radius_year + ')'),

        //var year_pie_group = year_pre_group;
            keyArcFn = function (y_data) {
                console.log('i am the arc key fn!', y_data);

                var ratio_array = [];

                for (var x=0; x<category_array.length; x++) {
                    var curr_cat = category_array[x];
                    ratio_array.push(y_data.cat_data[curr_cat]/(y_data.total_days*2));
                }

                //category_array.forEach(function(e, i, a) {
                //    ratio_array
                //})

                console.log('ratio array: ', ratio_array);

                return ratio_array;
            };

        var year_arc = create_arc_new({'r':radius_year, 'r_minus':radius_year-20, 'l': 4, 'space_offset': 0});
        var year_arc_enter = year_pie_group.selectAll('.year_arc').data(function(d, i) {return keyArcFn(year_data[i])}).enter();

        //var each_year_data = year_pie_group.selectAll('.year_arc').data(function(d) {return d});

        year_arc_enter
            .append("path").attr("class", "year_arc")
            .attr("d", year_arc())
            .style("fill", function (d, i) {
                console.log('color here: ', d, i);
                return colour_array[i];
                //return '#DDDADA';
            })
            .style('opacity', function(d) { return d;});


        year_pie_group.append("text")
            .attr("dy", ".35em")
            .attr("class", "legend")
            .attr("fill", "rgb(128,128,128)")
            .style("text-anchor", "middle")
            .text(function (d) {
                return d.date;
            });

    }

    $.get('get_year_data', function(result) {
        console.log('received year data: ', result);
        create_year(result.data);
    });


}


// on init, grab our historical data:
//get_historical_data({'amount': null});

get_historical_data({'amount': null, 'has_prev': null, 'has_next': null, 'full_year': false});


// destroy year chart on modal hidden:
$('.year_modal').on('hidden.bs.modal', function() {
    console.log('year modal hidden!');
    d3.select('.year_chart').remove();
});



// closes the event input box in the modal:
document.getElementById('event_close').onclick = function(){
        this.parentNode.parentNode
        .style.display = "none";
        return false;
    };


// some cleanup to do when a modal gets dismissed:
$('.day_modal').on('hidden.bs.modal', function() {
    console.log('hiding of modal is happening...');

    save_slider_info();

    $('#modal_textArea').hide();
    $('.modal_notes').show();
    $('#click_to_edit').show();
    $('#save_changes_btn').addClass('disabled');

    $('.event_text').val('');
    $('.modal_entry').hide();

    $('.modal_alert').hide();

    console.log('what is in data now?', data, 'active day:', active_date);

    //somewhere in here I could attempt to reload whatever is in 'data' on the arcs...

    //get_historical_data({'amount': null});
    console.log('ran a create donut...');

});


// Some Outer Scope Vars:

var journal_mode = true;

var active_date;
var active_day;
var data;
var category_array = ['arts', 'smarts', 'wealth', 'health'];
var total_record_length = 4;
var colour_array = ["#ff8c00", "#d0743c", "#7b6888", "#98abc5"];
var radius = 39;  // this should be altered so we only need to change the one number to affect inner & outer...
var outer_radius = 34;
// var radius = 40;

// using "active day" find & return the full range of data for that day:
function get_active_day_data() {

    // console.log('active day test: ');

    var active = data.filter(function (d) {return d.day === active_day});
    return active[0];

    // for (var x=0; x < data.length; x++) {
    //     if (data[x].day === active_day) {
    //         console.log(data[x]);
    //        return data[x];
    //     }
    // }
}


function get_proper_date() {
    /*
    * This is a horrible hack.
    *
    * */

    var current_day = get_active_day_data().day;
    var day_of_month = current_day.split(' ')[2];
    var proper_date = day_of_month + ' ' + active_date;
    console.log(proper_date);
    return proper_date;
}



function save_slider_info() {
    console.log('saving slider data...');

    var sliders = $('.feeling_slider');

    var slider_results = {};

    sliders.map(function (s) {
        slider_results[sliders[s].name] = sliders[s].value;
    });

    console.log(slider_results);
    get_proper_date();

    slider_results['proper_date'] = get_proper_date();

    var csrftoken = getCookie('csrftoken');

    for (var each_datum in data) {
        if (data[each_datum].day === active_day) {

            console.log('got my day....');
            for (var k in data[each_datum].feelings) {
                data[each_datum].feelings[k] = $('#'+k+'_slider').val();
            }
        }
    }

    $.post('/update_sliders', slider_results, function (result) {
        console.log(result);
        if (result.message !== 'success') {
            console.log('failure!!');
            $('#modal_error_message').text(result.message);
            $('.modal_alert').show();
        }
    });

}





$('#save_changes_btn').on('click', function () {

    /*
     for saving changes to a day's notes, post the new value (if new) to server:
     */

        console.log('saving.....');

    save_slider_info();

       //$('.modal').modal('hide');
        var modal_text_select = $('#modal_textArea');
        var modal_notes_select = $('.modal_notes');

        var new_text = modal_text_select.val();
        var old_text = modal_notes_select.text();

            modal_text_select.hide();
            modal_notes_select.show();
            $('#click_to_edit').show();

        $('#save_changes_btn').addClass('disabled');

        if (old_text === new_text) {
            console.log('no changes detected');
            return;
        }

        modal_notes_select.text(new_text);


        var csrftoken = getCookie('csrftoken');

        $.post('/update_stuff', {'new_notes': new_text, 'date':active_date, 'day': active_day}, function(result) {

            console.log('finished updating stuff result:', result.message);

            if (result.message !== 'success') {
               console.log('failure!!');
                modal_notes_select.text(old_text);
                $('#modal_error_message').text(result.message);
                $('.modal_alert').show();
            }

            else {
                for (var each_datum in data) {
                    if (data[each_datum].day === active_day) {
                        data[each_datum].notes = new_text;
                    }
                }

            }

        })

});


// send a new event, or updated/deleted event to the server:
function send_event_from_modal(position, value, arc_pos, is_update, old_text, remove_event) {

    //console.log('send event from modal received: ', remove_event);

    var category = category_array[position];

    var event_text_sel = $('.event_text');
    var event_text = event_text_sel.val();

    var modal_entry_sel = $('.modal_entry');

    if (event_text.trim() === '' && !remove_event) {
        console.log('nothing to send... ');
        modal_entry_sel.hide();
        return;
    }

    console.log('outer btn has', event_text);
    event_text_sel.val('');
    modal_entry_sel.hide();

    $.post('/update_event', {'category': category, 'value': value, 'event_text': event_text,
                             'arc_pos': arc_pos, 'date':active_date, 'day': active_day, 'is_update': is_update,
                             'old_text': old_text, 'remove_event': remove_event},

        function(result) {
            if (result.message !== 'success') {
               console.log('failure!!');
                $('#modal_error_message').text(result.message);
                $('.modal_alert').show();
                return;
            }

            // TODO: replace with filter/map?
            for (var i=0; i < data.length; i++) {
                if (data[i].day === active_day) {
                    console.log('found the event day that I need to update....');
                    console.log(data[i]);

                    if (is_update) {  // if this is an update, just assign text directly.
                        data[i][category][arc_pos] = event_text;
                        build_modal(data[i], i);
                        populate_page({'data': data});
                        return;
                    }

                    // crap.. so after adding to the array, it also needs to:
                    // redraw the modal, update the main view, and update the table.. ugh.
                    if (data[i][category][0] === null) {  //pretty sure here we're not accounting for updates to existing events.. <-------
                        console.log('yep, its null');   //probably just need to incorporate "is_update" in if statement.
                        data[i][category][0] = event_text;
                    }
                    else if (data[i][category][1] === null) {
                        console.log('nope, second one is empty though');
                        data[i][category][1] = event_text;
                    }
                    else {
                        console.log('nothing at all, apparently... what is going on here? Buggin" out!!');
                    }

                    populate_page({'data': data});
                    build_modal(data[i], i);
                    return;
                }

            }

    })

}


// Main data-getter function:
function get_historical_data(options) {

    console.log('change month function active...');

    // don't actually get data if there is no data for those days:
    if ($('#has_prev_btn').hasClass('disabled') && options.amount < 0) {
        return
    }
    if ($('#has_next_btn').hasClass('disabled') && options.amount > 0) {
        return
    }

    if (options.full_year === true) {
        options.current = 'year';
    }
    else {
        options.current = $('#month_name').text();
    }

    $.get('get_historical_data', options,

        function (result) {
            console.log('I received a result!!', result);
            $('#month_name').text(result.month);
            active_date = result.month;

            // change the state of the forward/backward navigation of months:
            if (result.has_prev === 'false' || result.has_prev === false) {
                $('#has_prev_btn').addClass('disabled')
            }
            else {
                $('#has_prev_btn').removeClass('disabled')
            }

            if (result.has_next === 'false' || result.has_next === false) {
                $('#has_next_btn').addClass('disabled')
            }
            else {
                $('#has_next_btn').removeClass('disabled')
            }

            data = result.data;

            populate_page(result);  // actually builds out the table data
            create_donut();  // creates our donuts based on new global data

    });

}


//// Build our table:
//function populate_page(result) {



// maps our 0-100 values to pi based values that arcs can understand:
var arcScale = d3.scale.linear().domain([0, 100]).range([0, 2*Math.PI]);


function create_arc_new(config) {

        return function myArc() {

              return d3.svg.arc().innerRadius(config.r - config.r_minus)
                .outerRadius(config.r)
                .startAngle(function(d, i) {
                    //console.log('start angle for i: ', i, 'on data point d: ', d);
                    return arcScale((config.space_offset/2) + ((i)*(100/config.l)));
                })
                .endAngle(function(d, i) {
                    return arcScale((25 - (config.space_offset/2) ) + ((i)*(100/config.l)));
                });

        }
    }


function compute_arc_array(d, config) {

            if (config.feelings) {
                var feeling_array = [];
                console.log('d!', d['feelings']);

                for (var k in d.feelings) {
                    feeling_array.push(d.feelings[k]);
                }
                // console.log(feeling_array);
                return feeling_array;

            }




            var ignore_vals = ['id', 'day', 'notes', 'feelings'];
            var arc_array = [];
            var outer_arc_array = [];

        //console.log('this is d for arc array: ', d);

            for (var prop in d) {
                //console.log('checking prop ', prop, 'in d ', d);
                if (!d.hasOwnProperty(prop)){
                    continue;
                }

                if (ignore_vals.indexOf(prop) === -1 ){

                    //console.log('index of d: ', d);
                    if (d[prop][0]) {
                        arc_array.push(true);
                    }
                    else {
                        arc_array.push(false)
                    }
                    if (d[prop][1]) {
                        outer_arc_array.push(true);
                    }
                    else {
                        //console.log('nothing to see here....');
                        outer_arc_array.push(false);
                    }
                }
            }

            if (config.outer) {
                return outer_arc_array;
            }
        else {
                return arc_array;
            }

    }



function build_modal(modal_data, modal_data_position) {

            console.log('i have been clicked! with data point and i: ', modal_data, modal_data_position, modal_data.day,
                data.length);

            function update_pager_buttons(offset) {
                                    //Update pager buttons:
                        if (offset === 0) {
                            $('#has_prev_day_btn').addClass('disabled')
                        }
                        else {
                            $('#has_prev_day_btn').removeClass('disabled')
                        }

                        if (offset+1 === data.length){
                            $('#has_next_day_btn').addClass('disabled')
                        }
                        else {
                            $('#has_next_day_btn').removeClass('disabled')
                        }


                    }
            update_pager_buttons(modal_data_position);


            $('.day_modal').modal('show');


        // modal init stuff:

            $('.modal-title').text(modal_data.day);
            active_day = modal_data.day;

            var modal_notes_sel = $('.modal_notes');
            var modal_notes_well_sel = $('.modal_note_well');

            modal_notes_sel.text(modal_data.notes);
            $('#modal_textArea').val(modal_data.notes);

            modal_notes_well_sel.on('click', function() {
               modal_notes_sel.hide();
                $('#modal_textArea').show();
                $('#click_to_edit').hide();
                $('#save_changes_btn').removeClass('disabled');
            });

        console.log('modal data: ', modal_data);
        console.log('setting feelings sliders');

    for (var k in modal_data.feelings) {
        var cur_slider = '#' + k + '_slider';
        $(cur_slider).val(modal_data.feelings[k]);
    }


        console.log('removing original chart.');
        d3.select('.modal_chart').select('svg').remove();  //<------ remove chart cut in.


            // Define 'div' for tooltips
                var div = d3.select("body")
                .append("div") // declare the tooltip div
                .attr("class", "tooltip") // apply the 'tooltip' class
                .style("opacity", 0); // set the opacity to nil


            // start defining our chart area:
            var modal_chart = d3.select('.modal_chart')
                .append('svg')
                .attr("class", 'modal_pie')
                .attr("width", 40 * 8)
                .attr("height", 40 * 4)
                    .append('g')
                .attr('transform', 'translate(' + 40*4 + ',' + 40*2 + ')');

            modal_chart.append('g')
                .attr("class", "labels");



            function build_arcs(arc_obj, arc_position) {

                            // This function takes in an inner/outer arc group object and adds all the window dressing
                            // That is, mouseover junk, fill, category labels, etc.

                            arc_obj.attr("class", "modal_path")
                                    .style("fill", '#DDDADA').transition().duration(500)
                                    .style("fill", function(d, i) {
                                        if (d) {
                                            return colour_array[i];
                                        }
                                        else {
                                            return '#DDDADA';
                                            }

                                });


                            arc_obj.on("mouseover", function(d, i) {
                                var category = category_array[i];
                                var current_data = get_active_day_data();

                                $('.category_title').text(category);

                                if (current_data[category][arc_position]) {
                                    $('.event_title').text(': '+current_data[category][arc_position]);


                                div.transition()
                                    .duration(300)
                                    .style("opacity", .9);
                                div	.html(current_data[category][arc_position] + "<br/>")
                                    .style("left", (d3.event.pageX) + "px")
                                    .style("top", (d3.event.pageY - 28) + "px");
                                }


                            })
                            .on("mouseout", function(d, i) {
                                $('.event_title').text('');
                                $('.category_title').text('');

                                div.transition()
                                    .duration(500)
                                    .style("opacity", 0);

                            })
                            .on('click', function (d, i, j) {

                                function update_button() {
                                    var current_text = $('.event_text').val();
                                    //console.log('d', d, 'event text', current_text);

                                    var event_btn_sel = $('.event_btn');

                                    if (d && current_text) {
                                        event_btn_sel.removeClass('disabled');
                                        event_btn_sel.text('update');
                                        return false;
                                    }
                                    else if (d && !current_text) {
                                        event_btn_sel.removeClass('disabled');
                                        event_btn_sel.text('remove');
                                        return true;
                                    }
                                    else if (!d && current_text) {
                                        event_btn_sel.removeClass('disabled');
                                        event_btn_sel.text('submit');
                                        return false;
                                    }
                                    else if (!d && !current_text) {
                                        event_btn_sel.addClass('disabled');
                                        event_btn_sel.text('submit');
                                        return false;
                                    }
                                }


                                $('.modal_entry').show();

                                    $('.category_label.'+category_array[i]).addClass('modal_active_'+category_array[i]); // does not work?
                                    //$('.category_label.'+category_array[i]).text('modal_ac');

                                var is_update;
                                var old_text;
                                var delete_event = false;
                                var event_text_sel = $('.event_text');

                                if (d) {
                                    console.log('i can see a d!', i);
                                    console.log('this is parent?', j);
                                    var category = category_array[i];
                                    var current_data = get_active_day_data();
                                    //console.log(current_data[category][0]);
                                    //$('.event_text').val(current_data[category][0]);
                                    event_text_sel.attr('placeholder', current_data[category][arc_position]);
                                    is_update = true;
                                    old_text = current_data[category][arc_position];
                                    $('.delete_event_btn').show();
                                }
                                else {
                                    event_text_sel.val('');
                                    event_text_sel.attr('placeholder', '');
                                    is_update = false;
                                    $('.delete_event_btn').hide();
                                }

                                event_text_sel.focus();
                                delete_event = update_button();

                                $('.event_btn').unbind().on('click', function() {
                                    send_event_from_modal(i, d, arc_position, is_update, old_text, delete_event);
                                });

                                event_text_sel.unbind().on('input', function() {
                                        delete_event = update_button();
                                });

                            });



                        }


            // Start Building our inner arcs:
            var modal_inner_arc = create_arc_new({'r': 50, 'r_minus': 26,
                                                  'l': total_record_length, 'space_offset': 2});

            var inner_modal_arcs = modal_chart.selectAll('.modal_arc')
                        .data(compute_arc_array(modal_data, {outer: false}));

            inner_modal_arcs.enter().append("path").attr("d", modal_inner_arc());
            build_arcs(inner_modal_arcs, 0);  // here we're passing in path elements, and adding modal_path class


            // Start building our outer arcs:
            var modal_outer_arc = create_arc_new({'r': 40*2, 'r_minus': 26,
                                                  'l': total_record_length, 'space_offset': 2});

            var outer_arcs = modal_chart.selectAll('.modal_arc').attr("class", 'modal_arc_outer');

            var outer_arc_data = compute_arc_array(modal_data, {outer: true});

            var outer_arc_group_data = outer_arcs.data(outer_arc_data);  //the data that we are binding is to outer arcs, and from arc_array

            console.log('outer_arc_group_data', outer_arc_group_data);

            var outer_arc_group_enter = outer_arc_group_data.enter();

            var outer_arc_group = outer_arc_group_enter.append('g');
            var outer_arc_paths = outer_arc_group.append("path").attr("d", modal_outer_arc());

            build_arcs(outer_arc_paths, 1);  // here we're passing in paths now.

            var outer_arc_group_exit = outer_arc_group_data.exit();
            outer_arc_group_exit.transition().duration(500).style("fill-opacity", 0).remove();

         console.log('this is modal before data: ', modal_data);

            function update_arc_group(new_data, new_offset) {

                update_pager_buttons(new_offset);

                var outer_arc_maybe = modal_chart.selectAll('g.modal_path');
                console.log('outer arc_maybe: ', outer_arc_maybe);

                var inner_arc_maybe = modal_chart.selectAll('path.modal_path');
                console.log('inner arc_maybe: ', inner_arc_maybe);

                outer_arc_maybe.forEach(function(d, i) {
                    console.log('this is the value of d, i that I see: ', d, i);
                });

                console.log('old outer array: ', outer_arc_data);
                outer_arc_data = compute_arc_array(new_data, {outer: true});
                console.log('new outer array: ', outer_arc_data);
                outer_arc_group.forEach(function(d, i) {console.log(d);});
                outer_arc_paths.data(outer_arc_data);
                outer_arc_paths.forEach(function(d, i) {console.log(d);});
                build_arcs(outer_arc_paths, 1);


                var recomputed_inner_data = compute_arc_array(new_data, {outer: false});

                //outer_arc_maybe.transition().duration(500).style("fill", function(d, i) {
                //                        //console.log('whaaaaat?', d, i, re)
                //                        if (recomputed_outer_data[i]) {
                //                            //return color(i + 1);  // why does this change on exit/update?
                //                            return colour_array[i];
                //                        }
                //                        else {
                //                            return '#DDDADA';
                //                        }});
                //
                //inner_arc_maybe.transition().duration(500).style("fill", function(d, i) {
                //                        //console.log('whaaaaat?', d, i, re)
                //                        if (recomputed_inner_data[i]) {
                //                            //return color(i + 1);  // why does this change on exit/update?
                //                            return colour_array[i];
                //                        }
                //                        else {
                //                            return '#DDDADA';
                //                        }});




            //    OK, so the plan is, get the updated true/false values for the new day.  from compute_arc_array.
            //    select all of the arc group, feed in a new path d and maybe transition or whatever.
            //    I don't actually need to draw the arcs.. i just need to change their colour..



            }




            // Build our category labels attached to arc group:
            build_category_labels(outer_arc_group);

            function build_category_labels(arc_group) {

                var current_data = get_active_day_data();

                var label_group = arc_group.append('g').append('svg:text');

                label_group
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .attr('class', function(d, i) {
                     return 'category_label '+category_array[i];
                    });

                label_group.style("fill", "#DDDADA");

                label_group.transition().duration(500).style("fill", function(d, i) {


                    if (!current_data[category_array[i]][0] && !current_data[category_array[i]][1]) {
                        return '#DDDADA';
                    }
                    else {
                        return colour_array[i];
                    }
                });

                label_group.style("font", "bold 14px Helvetica")
                        .attr("transform", function(d, i) { //set the label's origin to the center of the arc
                //we have to make sure to set these before calling arc.centroid
                    console.log(d);
                    var pos;

                    //var category_array = ['arts', 'smarts', 'wealth', 'health'];

                    switch (i) {
                        case 0:
                            pos = '(85, -75)';
                            break;
                        case 1:
                            pos = '(85, 75)';
                            break;
                        case 2:
                            pos = '(-85, 75)';
                            break;
                        case 3:
                            pos = '(-85, -75)';
                            break;
                    }

                return "translate"+pos;
              })
                .text(function (d, i) {
                    return category_array[i];
                });
            }


            console.log('modal chart building done');




        $('.pager_control').unbind('click').on('click', function () {

            this.blur();

           console.log('day pager is active');
            save_slider_info();

            var offset;
            if (this.parentNode.id == 'has_prev_day_btn') {

                if ($('#has_prev_day_btn').hasClass('disabled')) {
                    return
                }
                offset = -1;

            }
            else if (this.parentNode.id == 'has_next_day_btn') {
                if ($('#has_next_day_btn').hasClass('disabled')) {
                    return
                }
                offset = 1;

            }
            console.log('continuing pager...');

            $('.event_text').val('');
            $('.modal_entry').hide();

            for (var j=0; j < data.length; j++) {
                if (data[j].day === active_day) {
                    //console.log('sending off to build modal now...', data.length, j, offset);
                    build_modal(data[j+offset], j+offset);  //works
                    //update_arc_group(data[j+offset], j+offset);

                    //var oac = outer_arcs.data(compute_arc_array(data[j+offset], {'outer': true})).append('g').attr('class', 'outer_arc group');
                    //outer_arc_group.append("path").attr("d", modal_outer_arc());

                    //build_arcs(outer_arc_group, 1);
                    //console.log('outer arcs: ', oac); //this is giving the selection just an array...

                    //modal_data = data[j+offset];
                    //inner_modal_arcs.data(compute_arc_array(data[j+offset], {'outer': false}));
                    return
                }
            }

    });

        console.log('modal chart labeling is done');

        // this should probably destroy chart data on modal dismiss...


    }  // End of Build Modal

// Draw out our pies:
function create_donut() {

    //console.log('create donut... ');
    console.log('data ->', data);
    //console.log('object keys: ', Object.keys(data[0]));

    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) {return d;});

    console.log('starting svg building.');


    // Define 'div' for tooltips on days
    var day_div = d3.select("body")
        .append("div") // declare the tooltip div
        .attr("class", "tooltip") // apply the 'tooltip' class
        .style("opacity", 0); // set the opacity to nil


    var chart = d3.select('.chart');
    //chart.selectAll('.pie').remove();

    // data binding is done by index, but we need to specify keys instead:
    var keyFn = function(d) {
        if (journal_mode) {
            return 'journal ' + d.day;
        }
        else {

            return 'calendar ' + d.day;  // this should force a refresh of the page.
        }
    };

    // each datum on pies_data is a full day, including notes, etc.
    var pies_data = chart.selectAll('.pie').data(data, keyFn);


    // on new full day datum being added to our join, do this for each datum:
    var pies_data_enter = pies_data.enter();

    // this returns the g element on each group that was created by the enter:
    var pies_pre_group = pies_data_enter.append('svg')
            .attr('class', 'pie')
        .attr('id', function (d) {
            //console.log('adding id: ', d.day);
            return d.day;
        })
        .attr('width', function(d) {
                //console.log('this is pies_data enter datum: ', d);
                 return (radius) * 2
        })
        .attr('height', (radius) * 2).style('fill-opacity', 0);

        //.on("mouseout", function(d, i) {
        //    $('.event_title').text('');
        //    $('.category_title').text('');
        //

    pies_pre_group.transition().duration(function(d, i) { return i*5+500}).style('fill-opacity', 1);

    // main group for each day group.  controls click for building a modal for the day, hover stuff on month view, etc.
    var pies_group = pies_pre_group.append('g')
            // .attr('transform', 'translate(' + 40 + ',' + 40 + ')')
            .attr('transform', 'translate(' + radius + ',' + radius + ')')
        .on("click", function(d, i) {
                day_div.transition().duration(50).style("opacity", 0);
            build_modal(d, i);
        })
        .on("mouseover", function(d, i, j) {

                // controls the hover text and position for individual days:

                var tt_day = d.day;
                var hover_pos = $(this).position();

            // switch up tool tip opacity and position:
            day_div.transition()
                .duration(500)
                .style("opacity", .7);
            day_div.html(function(d, i) {
                //console.log(d, i);
                //return d.day + "<br/>"
                return tt_day.split(" ")[0];

            })
                //.style("left", (d3.event.pageX) + "px")
                //.style("top", (d3.event.pageY - 28) + "px");
                .style("left", hover_pos.left + 'px')
                .style("top", hover_pos.top -20 + 'px');


        })
            .on("mouseout", function () {
                day_div.transition()
                    .duration(100)
                    .style("opacity", 0)
            })
        ;

    console.log('pies enter is: ', pies_data_enter);
    console.log('pies group though is: ', pies_group);

    // this specifies what to do on each removal of a full day
    pies_data.exit()
        //.transition()
        //.duration(function(d, i) {
        //    console.log('removing pie: ', d);
        //    return i*50;
            //return 0;
        //})
        .style("fill-opacity", 0)
    .remove();

    console.log('finished pie building.  starting arc/path building');

    // TODO: these need to not be so terribly hardcoded here.
    var outer_arc = create_arc_new({'r': outer_radius, 'r_minus': 8, 'l': total_record_length, 'space_offset': 0});  // was r/8
    var inner_arc = create_arc_new({'r': 25, 'r_minus': 13, 'l': total_record_length, 'space_offset': 0});  //was 25/13

    var f_r = 50;
    var feelings_arc = create_arc_new({'r': 44, 'r_minus': 7, 'l': total_record_length, 'space_offset': 0});  //was 25/13

    // this binds our arc elements to a new set of data.  That data is taken by each day, and is an array
    // of true/false values based on whether there is an event there or not

    var compute_arrays = function(d) {
        return compute_arc_array(d, {outer: false})
    };

    var arcKeyFn = function(d, i) {
        if (journal_mode) {
            return i;
        } else {
            return 'cal: ' + i;
        }
    };

    var svg_inner_arcs_data = pies_group.selectAll('.arc').data(compute_arrays, arcKeyFn);
        //.data(function(d) {
        //    return compute_arc_array(d, {outer: false})
        //});

    // define the "enter" selection for what to do on new data entering
    var svg_inner_arc_enter = svg_inner_arcs_data.enter();

    svg_inner_arc_enter.append("path").attr("class", "arc")
        .attr("d", inner_arc())
        .style("fill", function(d, i) {
            if (d) {
                return colour_array[i];
            }
            else {
                return '#DDDADA';
            }
        });

    //svg_inner_arcs_data.exit().style("fill", function(d, i) {
    //    if (d) {
    //        return colour_array[i];
    //    }
    //    else {
    //        return '#DDDADA';
    //    }
    //});

    var svg_outer_arcs = pies_group.selectAll('.arc_outer')
        .data(function(d) {return compute_arc_array(d, {outer: true})});


    svg_outer_arcs.enter()
        .append("path")
        .attr("class", "arc_outer")
        .attr("d", outer_arc())
        .style("fill", function(d, i) {
            if (d) {
                //return color(i + 1);
                return colour_array[i];

            }
            else {
                return '#E9E2E2';
            }
        });


        var feelings_colour_scale = d3.scale.linear()
        .domain([0, 50, 100])
        .interpolate(d3.interpolateRgb)
        // .range(['#061c38', '#ff720e']);
            .range(["darkgrey",
                '#f4f4f4',  // this is actually the background, so in theory, vals of 50% should be invisible.
                "#ffc800"]);


    var svg_feelings_arc = pies_group.selectAll('.feelings_arc')
        .data(function (d) {
            return compute_arc_array(d, {feelings: true})
        });

    console.log('svg_feelings_arc', svg_feelings_arc);

    svg_feelings_arc.enter()
        .append("path")
        .attr("class", "feelings_arc")
        .attr("d", feelings_arc())
        .style("fill", function(d, i) {
            return feelings_colour_scale(d);
        });

    // svg at this point is our D3 groups:
    console.log('svg ->', pies_group);

    // this should only happen once...
    pies_group.append("text")
        .attr("dy", ".35em")
        .attr("class", function(d) {
            // if we have notes for this day, add the "journal done" class to change day layout
            if (d.notes !== "") {
                return "legend journal_done";
            }
            else {
                return "legend";
            }

        })
        .attr("fill", function(d) {
            if (d.notes === "") {
                return "rgb(128,128,128)";
            }
        })
        .style("text-anchor", "middle")
        .text(function(d, i, j) {
            //console.log('text function has this d: ', d, j);
            if (d.day) {
                return d.day.split(' ')[2];
            }
            else {
                return 'test';
            }
        });

    //d3.selectAll('.legend').exit().transition().duration(2000).remove();

    console.log('done.');
}






