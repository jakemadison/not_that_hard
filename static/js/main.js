/**
 * Created by jmadison on 1/2/15.
 */


get_historical_data({'amount': null});




// using jQuery
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


$('.modal').on('hidden.bs.modal', function() {
    console.log('hiding of modal is happening...');
    $('#modal_textArea').hide();
    $('.modal_notes').show();
    $('#click_to_edit').show();

});


var active_date;
var active_day;

$('#save_changes_btn').on('click', function () {

       $('.modal').modal('hide');
        var new_text = $('#modal_textArea').val();
        var old_text = $('.modal_notes').text();

        if (old_text === new_text) {
            console.log('no changes detected');
            return
        }

        var csrftoken = getCookie('csrftoken');

        $.post('/update_stuff', {'new_notes': new_text, 'date':active_date, 'day': active_day}, function(result) {

            console.log('finished updating stuff');

        })

});




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

            populate_page(result);
            create_donut(result.data);

    });

}


function populate_page(result) {

    function build_row(row_data) {
        //console.log('building a new row...');

        var notes = row_data.notes || '-';
        var day = row_data.day;
        var health = row_data.health || '-';
        var wealth = row_data.wealth || '-';
        var arts = row_data.arts || '-';
        var smarts = row_data.smarts || '-';

        var row = '<tr class="row_data" title='+notes+'> <td>'+day+'</td><td>'+
            health+'</td><td>'+ wealth+'</td><td>'+arts+'</td><td>'+smarts+'</td></tr>';

        return row
    }

    $('.row_data').remove();

    var test_table = $('.test_body');
    for (var i=0; i<result.data.length; i++) {
        //console.log(result.data[i]);

        var this_row = build_row(result.data[i]);

        //console.log('this row: ', this_row);
        test_table.append(this_row);

    }

}


function create_donut(data) {

    console.log('create donut... ');

    console.log('data ->', data);

    //data.forEach(function(d) {console.log(d); console.log(d.yoga)});

    var number_donuts = data.length;

    //var radius = 74;
    var radius = 40;  // this should be altered so we only need to change the one number to affect inner & outer...

    console.log('object keys: ', Object.keys(data[0]));
    var total_record_length = 4;

    var colour_array = ["#AA8888", "#88BB88", "#8888CC", "#AA88CC"];

    var color = d3.scale.ordinal()
        //.domain(colour_array)
          .domain(d3.keys(data[0]).filter(function(key) {
              var ignore_vals = ['id', 'date'];
              console.log('anything???', d3.keys(data[0]));

              return ignore_vals.indexOf(key) === -1}))
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);


    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) {return d;});


    function build_modal(d, i) {

            console.log('i have been clicked! with data point and i: ', d, i, d.day);
            $('.modal').modal('show');
            $('.modal-title').text(d.day);
            active_day = d.day;

            var modal_notes_sel = $('.modal_notes');
            modal_notes_sel.text(d.notes);
            $('#modal_textArea').val(d.notes);

            modal_notes_sel.on('click', function() {
               modal_notes_sel.hide();
                $('#modal_textArea').show();
                $('#click_to_edit').hide();
            });

        d3.select('.modal_chart').select('svg').remove();

            var modal_chart = d3.select('.modal_chart')
                .append('svg')
                .attr("class", 'modal_pie')
                .attr("width", radius * 4)
                .attr("height", radius * 4)
                    .append('g')
                .attr('transform', 'translate(' + radius*2 + ',' + radius*2 + ')');

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
                                return color(i + 1);  // why does this change on exit/update?
                            }
                            else {
                                return '#DDDADA';
                            }});


            modal_chart.selectAll('.modal_arc')
                        .data(compute_arc_array(d, {outer: true}))
                        .enter().append("path").attr("d", modal_outer_arc())
                .attr("class", "modal_path")
                        .style("fill", function(d, i) {
                            if (d) {
                                return color(i + 1);  // why does this change on exit/update?
                            }
                            else {
                                return '#DDDADA';
                            }});



        //
        //    svg.selectAll('.arc_outer')
        //.data(function(d) {return compute_arc_array(d, {outer: true})})
        //.enter()
        //.append("path")
        //.attr("class", "arc_outer")
        //.attr("d", outer_arc())
        //.style("fill", function(d, i) {
        //    if (d) {
        //        return color(i + 1);
        //    }
        //    else {
        //        return '#E9E2E2';
        //    }
        //});
        //







            //    selectAll('.modal_pie').data(d).enter()
            //.append('svg')
            //.attr('class', 'modal_pie')
            //.attr('width', radius * 2)
            //.attr('height', radius * 2)
            //.append('g')
            //.attr('transform', 'translate(' + radius + ',' + radius + ')')
            //    .selectAll('.modal_arc')
            //    .data(compute_arc_array(d, {outer: false}))
            //    .enter().append("path").attr("d", inner_arc()).style("fill", color(i+1));

            console.log('modal chart building done');

        // this should probably destroy chart data on modal dismiss...

    }

    console.log('starting svg building.');

    var chart = d3.select('.chart');
    var pies = chart.selectAll('.pie').data(data);
    pies.exit().remove();

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
                return color(i + 1);  // why does this change on exit/update?
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
                return color(i + 1);
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
        .text(function(d) {return d.day.split(' ')[1];});

    console.log('donut done.');
}





























