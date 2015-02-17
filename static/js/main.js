/**
 * Created by jmadison on 1/2/15.
 */


get_historical_data({'amount': null});



// Helper stuff:
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


document.getElementById('close').onclick = function(){
        this.parentNode.parentNode.parentNode
        .style.display = "none";

        return false;
    };

document.getElementById('event_close').onclick = function(){
        this.parentNode.parentNode
        .style.display = "none";

        return false;
    };


$('.modal').on('hidden.bs.modal', function() {
    console.log('hiding of modal is happening...');
    $('#modal_textArea').hide();
    $('.modal_notes').show();
    $('#click_to_edit').show();
    $('#save_changes_btn').addClass('disabled');

    $('.event_text').val('');
    $('.modal_entry').hide();


});

// Some Outer Scope Vars:
var active_date;
var active_day;
var data;
var category_array = ['arts', 'smarts', 'wealth', 'health'];
var total_record_length = 4;
var colour_array = ["#ff8c00", "#d0743c", "#7b6888", "#98abc5"];
var radius = 40;  // this should be altered so we only need to change the one number to affect inner & outer...


function get_active_day_data() {
    for (var x=0; x < data.length; x++) {
        if (data[x].day === active_day) {
           return data[x];
        }
    }
}


$('#save_changes_btn').on('click', function () {

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
            return
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


function send_event_from_modal(position, value, arc_pos, is_update, old_text, remove_event) {

    console.log('send event from modal received: ', remove_event);

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
            }

            else {
                for (var each_datum in data) {
                    if (data[each_datum].day === active_day) {
                        console.log('found the event day that I need to update');
                        console.log(data[each_datum]);



                        // crap.. so after adding to the array, it also needs to:
                        // redraw the modal, update the main view, and update the table.. ugh.
                        if (data[each_datum][category][0]===null) {
                            console.log('yep, its null');
                            data[each_datum][category][0] = event_text;
                        }
                        else if (data[each_datum][category][1]===null) {
                            console.log('nope, second one is empty though');
                            data[each_datum][category][1] = event_text;
                        }
                        else {
                            console.log('nothing at all, apaparently... what is going on here? Buggin out!!');

                        }


                    }

                }
            }

            console.log('i received a result from the server!!!', result);

    })


}


// Main data-getter function:
function get_historical_data(options) {

    console.log('change month function active...');

    if ($('#has_prev_btn').hasClass('disabled') && options.amount < 0) {
        return
    }
    if ($('#has_next_btn').hasClass('disabled') && options.amount > 0) {
        return
    }

    options.current = $('#month_name').text();

    $.get('get_historical_data', options,

        function (result) {
            console.log('I received a result!!', result);
            $('#month_name').text(result.month);
            active_date = result.month;

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

            populate_page(result);
            create_donut();

    });

}


// Build our table:
function populate_page(result) {

    function build_row(row_data) {
        //console.log('building a new row...');

        //var notes = row_data.notes || '-';

        var day_array = row_data.day.split(" ");
        var day = day_array[1] + ' ' + day_array[2];

        var health = row_data.health[0] || '-';
        var wealth = row_data.wealth[0] || '-';
        var arts = row_data.arts[0] || '-';
        var smarts = row_data.smarts[0] || '-';

        health = (row_data.health[1] ? health + ' <b>+</b> ' + row_data.health[1] : health);
        wealth = (row_data.wealth[1] ? wealth + ' <b>+</b> ' + row_data.wealth[1] : wealth);
        arts = (row_data.arts[1] ? arts + ' <b>+</b> ' + row_data.arts[1] : arts);
        smarts = (row_data.smarts[1] ? smarts + ' <b>+</b> ' + row_data.smarts[1] : smarts);

        return '<tr class="row_data"> <td>'+day+':</td><td class="health_row">'+
            health+'</td><td class="wealth_row">'+ wealth+'</td><td class="arts_row">'+arts+
            '</td><td class="smarts_row">'+smarts+'</td></tr>';


    }

    $('.row_data').remove();

    var test_table = $('.test_body');
    for (var i=0; i<result.data.length; i++) {
        //console.log('building row: ', result.data[i]);

        var this_row = build_row(result.data[i]);

        //console.log('this row: ', this_row);
        test_table.append(this_row);

    }

    $('#health_badge').text(result.category_counts.health);
    $('#wealth_badge').text(result.category_counts.wealth);
    $('#arts_badge').text(result.category_counts.arts);
    $('#smarts_badge').text(result.category_counts.smarts);



}


var arcScale = d3.scale.linear().domain([0, 100]).range([0, 2*Math.PI]);

function create_arc_new(config) {

        return function myArc() {
              var arc_obj = d3.svg.arc().innerRadius(config.r - config.r_minus)
                .outerRadius(config.r)
                .startAngle(function(d, i) {
                    //console.log('start angle for i: ', i, 'on data point d: ', d);
                    return arcScale((config.space_offset/2) + ((i)*(100/config.l)));
                })
                .endAngle(function(d, i) {
                    return arcScale((25 - (config.space_offset/2) ) + ((i)*(100/config.l)));
                });

                return arc_obj;
        }
    }

function compute_arc_array(d, config) {
            var ignore_vals = ['id', 'day', 'notes'];
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

            //Update pager buttons:
            if (modal_data_position === 0) {
                $('#has_prev_day_btn').addClass('disabled')
            }
            else {
                $('#has_prev_day_btn').removeClass('disabled')
            }

            if (modal_data_position+1 === data.length){
                $('#has_next_day_btn').addClass('disabled')
            }
            else {
                $('#has_next_day_btn').removeClass('disabled')
            }


            $('.modal').modal('show');
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
                .attr("width", radius * 8)
                .attr("height", radius * 4)
                    .append('g')
                .attr('transform', 'translate(' + radius*4 + ',' + radius*2 + ')');

            modal_chart.append('g')
                .attr("class", "labels");

            function build_arcs(arc_obj, arc_position) {
                            arc_obj.attr("class", "modal_path")
                                    .style("fill", function(d, i) {
                                        if (d) {
                                            //return color(i + 1);  // why does this change on exit/update?
                                            return colour_array[i];

                                        }
                                        else {
                                            return '#DDDADA';
                                        }})

                            .on("mouseover", function(d, i) {
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

                                    if (d && current_text) {
                                        $('.event_btn').removeClass('disabled');
                                        $('.event_btn').text('update');
                                        return false;
                                    }
                                    else if (d && !current_text) {
                                        $('.event_btn').removeClass('disabled');
                                        $('.event_btn').text('remove');
                                        return true;
                                    }
                                    else if (!d && current_text) {
                                        $('.event_btn').removeClass('disabled');
                                        $('.event_btn').text('submit');
                                        return false;
                                    }
                                    else if (!d && !current_text) {
                                        $('.event_btn').addClass('disabled');
                                        $('.event_btn').text('submit');
                                        return false;
                                    }
                                }



                                $('.modal_entry').show();

                                var is_update;
                                var old_text;
                                var delete_event = false;

                                if (d) {
                                    console.log('i can see a d!', i);
                                    console.log('this is parent?', j);
                                    var category = category_array[i];
                                    var current_data = get_active_day_data();
                                    //console.log(current_data[category][0]);
                                    //$('.event_text').val(current_data[category][0]);
                                    $('.event_text').attr('placeholder', current_data[category][arc_position]);
                                    is_update = true;
                                    old_text = current_data[category][arc_position];
                                    $('.delete_event_btn').show();
                                }
                                else {
                                    $('.event_text').val('');
                                    $('.event_text').attr('placeholder', '');
                                    is_update = false;
                                    $('.delete_event_btn').hide();
                                }

                                $('.event_text').focus();
                                delete_event = update_button();

                                $('.event_btn').unbind().on('click', function() {
                                    send_event_from_modal(i, d, 'inner', is_update, old_text, delete_event);
                                });

                                $('.event_text').unbind().on('input', function() {
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
            build_arcs(inner_modal_arcs, 0);


            // Start building our outer arcs:
            var modal_outer_arc = create_arc_new({'r': radius*2, 'r_minus': 26,
                                                  'l': total_record_length, 'space_offset': 2});

            var outer_arc_group = modal_chart.selectAll('.modal_arc')
                .attr("class", 'modal_arc_outer')
                        .data(compute_arc_array(modal_data, {outer: true}))
                        .enter().append('g').attr('class', 'outer_arc group');

            outer_arc_group.append("path").attr("d", modal_outer_arc());

            build_arcs(outer_arc_group, 1);



            // Build our category labels attached to arc group:
            function build_category_labels(arc_group) {

                arc_group.append('svg:text')
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .attr('class','category_label')
                .style("fill", function(d, i) {

                    var current_data = get_active_day_data();
                    if (!current_data[category_array[i]][0] && !current_data[category_array[i]][1]) {
                        return '#DDDADA';
                    }
                    else {
                        return colour_array[i];
                    }
                })
                .style("font", "bold 14px Helvetica")
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

            build_category_labels(outer_arc_group);



            inner_modal_arcs.exit()
                .style('fill', function(d, i){
                   console.log('the exit function was triggered: ', d, i);
                    return 'black';
                })
                .remove();




            console.log('modal chart building done');




        $('.pager_control').unbind('click').on('click', function () {
           console.log('day pager is active');

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
                    console.log('sending off to build modal now...', data.length, j, offset);
                    build_modal(data[j+offset], j+offset);
                    //inner_modal_arcs.data(compute_arc_array(data[j+offset], {'outer': false}));
                    return
                }
            }

    });


        console.log('modal chart label building is done');

        // this should probably destroy chart data on modal dismiss...

    }  // End of Build Modal

// Draw out our pies:
function create_donut() {

    console.log('create donut... ');
    console.log('data ->', data);
    console.log('object keys: ', Object.keys(data[0]));


    //var color = d3.scale.ordinal()
    //    //.domain(colour_array)
    //      .domain(d3.keys(data[0]).filter(function(key) {
    //          var ignore_vals = ['id', 'date'];
    //          //console.log('anything???', d3.keys(data[0]));
    //
    //          return ignore_vals.indexOf(key) === -1}))
    //    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) {return d;});

    console.log('starting svg building.');

    var chart = d3.select('.chart');
    //chart.selectAll('.pie').remove();
    var pies = chart.selectAll('.pie').data(data);


    pies.exit()
        //.transition()
        //.duration(1000)
        //.style("fill-opacity", 0)
        .remove();



    var svg = pies.enter()
            .append('svg')
            .attr('class', 'pie')
            .attr('width', radius * 2)
            .attr('height', radius * 2)
            .append('g')
            .attr('transform', 'translate(' + radius + ',' + radius + ')')
        .on("click", function(d, i) {
            build_modal(d, i);
        });


    console.log('finished svg building.  starting arc/path building');

    var outer_arc = create_arc_new({'r': radius, 'r_minus': 13, 'l': total_record_length, 'space_offset': 0});
    var inner_arc = create_arc_new({'r': 25, 'r_minus': 13, 'l': total_record_length, 'space_offset': 0});

    var svg_inner_arcs = svg.selectAll('.arc').data(function(d) {return compute_arc_array(d, {outer: false})});

    svg_inner_arcs
        .enter()
        .append("path");


    svg_inner_arcs.attr("class", "arc")
        .attr("d", inner_arc());

    svg_inner_arcs
        .style("fill", function(d, i) {
            if (d) {
                return colour_array[i];
            }
            else {
                return '#DDDADA';
            }
        })
        .style('fill-opacity', 1);

    svg_inner_arcs.exit().remove();



    svg_inner_arcs.transition()
        .attr("d", inner_arc())
        .style("fill", function(d, i) {
            console.log('inner arcs say this! : ', d);
            if (d) {
                console.log('is there no D?');
                return colour_array[i];
            }
            else {
                return '#DDDADA';
            }
        });



    var svg_outer_arcs = svg.selectAll('.arc_outer')
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


    d3.selectAll('.path').data(data).append("path")
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



    // svg at this point is our D3 groups:
    console.log('svg ->', svg);



    // this should only happen once...
    svg.append("text").transition().duration(2500)
        .attr("dy", ".35em")
        .attr("class", "legend")
        .attr("fill", "rgb(128,128,128)")
        .style("text-anchor", "middle")
        .text(function(d, i, j) {
            console.log('text function has this d: ', d, j);
            if (d.day) {
                return d.day.split(' ')[2];
            }
            else {
                return 'test';
            }
        });



    //console.log('text labels: ', text_labels);
    //d3.selectAll('.legend').exit().transition().duration(2000).remove();



    console.log('donut done.');
}





























