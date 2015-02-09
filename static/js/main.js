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


function send_event_from_modal(position, value, arc_pos, is_update, old_text) {



    var category = category_array[position];

    var event_text_sel = $('.event_text');
    var event_text = event_text_sel.val();

    var modal_entry_sel = $('.modal_entry');

    if (event_text.trim() === '') {
        console.log('nothing to send... ');
        modal_entry_sel.hide();
        return;
    }

    console.log('outer btn has', event_text);
    event_text_sel.val('');
    modal_entry_sel.hide();

    $.post('/update_event', {'category': category, 'value': value, 'event_text': event_text,
                             'arc_pos': arc_pos, 'date':active_date, 'day': active_day, 'is_update': is_update,
                             'old_text': old_text},

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


// Draw out our pies:
function create_donut() {

    console.log('create donut... ');

    console.log('data ->', data);

    //data.forEach(function(d) {console.log(d); console.log(d.yoga)});

    var number_donuts = data.length;

    //var radius = 74;
    var radius = 40;  // this should be altered so we only need to change the one number to affect inner & outer...

    console.log('object keys: ', Object.keys(data[0]));
    var total_record_length = 4;

    var colour_array = ["#ff8c00", "#d0743c", "#7b6888", "#98abc5"];

    var color = d3.scale.ordinal()
        //.domain(colour_array)
          .domain(d3.keys(data[0]).filter(function(key) {
              var ignore_vals = ['id', 'date'];
              //console.log('anything???', d3.keys(data[0]));

              return ignore_vals.indexOf(key) === -1}))
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);


    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) {return d;});


    function build_modal(d, i) {

            console.log('i have been clicked! with data point and i: ', d, i, d.day, data.length);

            if (i === 0) {
                $('#has_prev_day_btn').addClass('disabled')
            }
            else {
                $('#has_prev_day_btn').removeClass('disabled')
            }

            if (i+1 === data.length){
                $('#has_next_day_btn').addClass('disabled')
            }
            else {
                $('#has_next_day_btn').removeClass('disabled')
            }


            $('.modal').modal('show');
            $('.modal-title').text(d.day);
            active_day = d.day;

            var modal_notes_sel = $('.modal_notes');
            var modal_notes_well_sel = $('.modal_note_well');

            modal_notes_sel.text(d.notes);
            $('#modal_textArea').val(d.notes);

            modal_notes_well_sel.on('click', function() {
               modal_notes_sel.hide();
                $('#modal_textArea').show();
                $('#click_to_edit').hide();
                $('#save_changes_btn').removeClass('disabled');
            });

        d3.select('.modal_chart').select('svg').remove();

            // Define 'div' for tooltips
                var div = d3.select("body")
                .append("div") // declare the tooltip div
                .attr("class", "tooltip") // apply the 'tooltip' class
                .style("opacity", 0); // set the opacity to nil


            var modal_chart = d3.select('.modal_chart')
                .append('svg')
                .attr("class", 'modal_pie')
                .attr("width", radius * 8)
                .attr("height", radius * 4)
                    .append('g')
                .attr('transform', 'translate(' + radius*4 + ',' + radius*2 + ')');

            modal_chart.append('g')
                .attr("class", "labels");


            var modal_outer_arc = create_arc_new({'r': radius*2, 'r_minus': 26,
                                                  'l': total_record_length, 'space_offset': 2});
            var modal_inner_arc = create_arc_new({'r': 50, 'r_minus': 26,
                                                  'l': total_record_length, 'space_offset': 2});


            modal_chart.selectAll('.modal_arc')
                        .data(compute_arc_array(d, {outer: false}))
                        .enter().append("path").attr("d", modal_inner_arc())
                .attr("class", "modal_path")
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

                    if (current_data[category][0]) {
                        $('.event_title').text(': '+current_data[category][0]);


                    div.transition()
                        .duration(300)
                        .style("opacity", .9);
                    div	.html(current_data[category][0] + "<br/>")
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
                    $('.modal_entry').show();

                    var is_update;
                    var old_text;

                    if (d) {
                        console.log('i can see a d!', i);
                        console.log('this is parent?', j);
                        var category = category_array[i];
                        var current_data = get_active_day_data();
                        //console.log(current_data[category][0]);
                        //$('.event_text').val(current_data[category][0]);
                        $('.event_text').attr('placeholder', current_data[category][0]);
                        is_update = true;
                        old_text = current_data[category][0];
                    }
                    else {
                        $('.event_text').val('');
                        $('.event_text').attr('placeholder', '');
                        is_update = false;
                    }

                    $('.event_text').focus();

                    $('.event_btn').unbind().on('click', function() {
                        send_event_from_modal(i, d, 'inner', is_update, old_text);
                    })

                });


            var outer_arc_group = modal_chart.selectAll('.modal_arc')
                .attr("class", 'modal_arc_outer')
                        .data(compute_arc_array(d, {outer: true}))
                        .enter().append('g').attr('class', 'outer_arc group');

                outer_arc_group.append("path").attr("d", modal_outer_arc())
                .attr("class", function(d, i) {
                    //console.log('outer modal path is dealing with: ', d, i);
                    //console.log('check for inner?');
                    return "modal_path";
                })
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

                    if (current_data[category][1]) {
                        $('.event_title').text(': '+current_data[category][1]);

                        div.transition()
                            .duration(300)
                            .style("opacity", .9);
                        div	.html(current_data[category][1] + "<br/>")
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    }



                })
                .on("mouseout", function(d, i) {
                    $('.category_title').text('');
                    $('.event_title').text('');

                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                })

                .on('click', function (d, i, j) {
                    $('.modal_entry').show();

                    var is_update;
                    var old_text;

                    if (d) {
                        console.log('i can see a d!', i);
                        console.log('this is j: ', j);
                        var category = category_array[i];
                        var current_data = get_active_day_data();
                        //console.log(current_data[category][1]);
                        //$('.event_text').val(current_data[category][1]);
                        $('.event_text').attr('placeholder', current_data[category][1]);
                        is_update = true;
                        old_text = current_data[category][1]
                    }
                    else {
                        $('.event_text').val('');
                        $('.event_text').attr('placeholder', '');
                        is_update = false;
                    }

                    $('.event_text').focus();

                    $('.event_btn').unbind().on('click', function() {
                        send_event_from_modal(i, d, 'outer', is_update, old_text);
                    })

                });

            outer_arc_group.append('svg:text')
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

            console.log('modal chart building done');



        var key = function(d) {
            var ignore_values = ['day', 'id', 'notes'];
            if (ignore_values.indexOf(d) === -1) {
                return 'something!';
            }
        };

        //    Time to build labels...

        // let's start with category labels:


        // Computes the angle of an arc, converting from radians to degrees.
        function angle(d) {
             var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
            return a > 90 ? a - 180 : a;
            }

            // Add a magnitude value to the larger arcs, translated to the arc centroid and rotated.
        //modal_chart.append("g").filter(function(d) {
        //    console.log('i am seeing: ', d);
        //    return d.endAngle - d.startAngle > .2; })
        //
        //    .append("svg:text")
        //      .attr("dy", ".35em")
        //      .attr("text-anchor", "middle")
        //      .attr("transform", function(d) { //set the label's origin to the center of the arc
        //        //we have to make sure to set these before calling arc.centroid
        //        d.outerRadius = radius; // Set Outer Coordinate
        //        d.innerRadius = radius/2; // Set Inner Coordinate
        //        return "translate(" + modal_outer_arc().centroid(d) + ")rotate(" + angle(d) + ")";
        //      })
        //      .style("fill", "White")
        //      .style("font", "bold 12px Arial")
        //      .text(function(d) { return 'blah'; });









        var text = d3.select(".labels").selectAll("text")
            //.data(pie(get_active_day_data()), key)
		                //.data(pie(data), key);
                        .data(function (d, i) {
                            console.log('wtf....', d, i);
                            return pie(['1','2','3','4']);
                            //return get_active_day_data();
            });

        console.log(text);

        text.enter()
            .append("text")
            .attr("dy", ".35em")
            .style("opacity", 1)
            .text(function(d) {
                console.log('is this getting hit?');
                return '';
            })
            .each(function(d) {
                this._current = d;
            });

        console.log(text);


        function midAngle(d){
	    	return d.startAngle + (d.endAngle - d.startAngle)/2;
	    }

        text.transition().duration(500)
		.attrTween("transform", function(d) {
			var interpolate = d3.interpolate(this._current, d);
			var _this = this;
			return function(t) {
				var d2 = interpolate(t);
				_this._current = d2;
				var pos = modal_outer_arc().centroid(d2);
				pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
				return "translate("+ pos +")";
			};
		})
		.styleTween("text-anchor", function(d){
			var interpolate = d3.interpolate(this._current, d);
			return function(t) {
				var d2 = interpolate(t);
				return midAngle(d2) < Math.PI ? "start":"end";
			};
		});

        text = svg.select(".labels").selectAll("text")
		    .data(pie(['1', '2', '3', '4']), key);


        console.log('modal chart label building is done');

        // this should probably destroy chart data on modal dismiss...

    }  // End of Build Modal


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
                return
            }
        }

    });


    console.log('starting svg building.');

    var chart = d3.select('.chart');
    chart.selectAll('.pie').remove();
    var pies = chart.selectAll('.pie').data(data);
    pies.exit().remove();

    //var test_thing = chart.selectAll('.tests').append('g')
    //    .data(["#98ABC5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"])
    //    .enter()
    //    .append('svg')
    //    .attr('class', 'tests')
    //    .attr('height', 20)
    //    .attr('width', 20)
    //    .attr('fill', function(d) {
    //        return d;
    //    });

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

    // map 0 - 100 on to 0 - 2*Pi:
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

    var outer_arc = create_arc_new({'r': radius, 'r_minus': 13, 'l': total_record_length, 'space_offset': 0});
    var inner_arc = create_arc_new({'r': 25, 'r_minus': 13, 'l': total_record_length, 'space_offset': 0});

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


    svg.selectAll('.arc')
        .data(function(d) {return compute_arc_array(d, {outer: false})})
        .enter()
        .append("path")
        .attr("class", "arc")
        .attr("d", inner_arc())
        .style("fill", function(d, i) {
            if (d) {
                //return color(i + 1);  // why does this change on exit/update?
                return colour_array[i];
            }
            else {
                return '#DDDADA';
            }
        });


    svg.selectAll('.arc_outer')
        .data(function(d) {return compute_arc_array(d, {outer: true})})
        .enter()
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


    // this should only happen once...
    svg.append("text")
        .attr("dy", ".35em")
        .attr("class", "legend")
        .attr("fill", "rgb(128,128,128)")
        .style("text-anchor", "middle")
        .text(function(d) {return d.day.split(' ')[2];});

    console.log('donut done.');
}





























