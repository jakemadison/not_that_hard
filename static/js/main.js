/**
 * Created by jmadison on 1/2/15.
 */

// get some data:
$.get('get_historical_data', function(result) {

    console.log('received a result!  woo!', result);

    $('#month_name').text(result.month);

    console.log('yessssssss');
    console.log(result.data);
    // now do something with data...


    function build_row(row_data) {
        //console.log('building a new row...');

        var notes = row_data.notes || '-';
        var day = row_data.day;
        var health = row_data.health || '-';
        var wealth = row_data.wealth || '-';
        var arts = row_data.arts || '-';
        var smarts = row_data.smarts || '-';

        var row = '<tr title='+notes+'> <td>'+day+'</td><td>'+
            health+'</td><td>'+ wealth+'</td><td>'+arts+'</td><td>'+smarts+'</td></tr>';

        return row
    }


    var test_table = $('.test_body');
    for (var i=0; i<result.data.length; i++) {
        //console.log(result.data[i]);

        var this_row = build_row(result.data[i]);

        //console.log('this row: ', this_row);
        test_table.append(this_row);

    }

    create_donut(result.data);

});


function create_donut(data) {

    console.log('create donut... ');

    console.log('data ->', data);

    //data.forEach(function(d) {console.log(d); console.log(d.yoga)});

    var number_donuts = data.length;
    var number_of_segments = 4;

    //var radius = 74;
    var radius = 40;
    var padding = 10;

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

    console.log('starting svg building.');

    var svg = d3.select('.chart')
        .selectAll('.pie')
        .data(data)
        .enter()
            .append('svg')
            .attr('class', 'pie')
            .attr('width', radius * 2)
            .attr('height', radius * 2)
            .append('g')
            .attr('transform', 'translate(' + radius + ',' + radius + ')');


    console.log('finished svg building.  starting arc/path building');


    // map 0 - 100 on to 0 - 2*Pi:
    var arcScale = d3.scale.linear().domain([0, 100]).range([0, 2*Math.PI]);

    function create_arc_new(config) {

            return function myArc() {
                  var arc_obj = d3.svg.arc().innerRadius(config.r - 13)
                    .outerRadius(config.r)
                    .startAngle(function(d, i) {
                        //console.log('start angle for i: ', i, 'on data point d: ', d);

                        return arcScale((i)*(100/config.l));
                    })
                    .endAngle(function(d, i) {
                        return arcScale(25 + ((i)*(100/config.l)));
                    });

                    return arc_obj;
            }
        }

    var outer_arc = create_arc_new({'r': radius, 'l': total_record_length});
    var inner_arc = create_arc_new({'r': 25, 'l': total_record_length});

    function compute_arc_array(d, config) {
        var ignore_vals = ['id', 'day'];
            var arc_array = [];
            var outer_arc_array = [];

        console.log('this is d for arc array: ', d);

            for (var prop in d) {
                //console.log('checking prop ', prop, 'in d ', d);
                if (!d.hasOwnProperty(prop)){
                    continue;
                }

                if (ignore_vals.indexOf(prop) === -1 ){

                    console.log('index of d: ', d);
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
        .data(function(d) {console.log('this is d before: ', d); return compute_arc_array(d, {outer: false})})
        .enter()
        .append("path")
        .attr("class", "arc")
        .attr("d", inner_arc())
        .style("fill", function(d, i) {
            if (d) {
                return color(i + 1);
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
            console.log('what is the i of this d?', i, d);
            if (d) {
                return color(i + 1);
            }
            else {
                return '#DDDADA';
            }
        })

        //.style("fill", function (d, i) {
        //  return color(function(d) {
        //
        //      return colour_array[mapping.indexOf(d[0])]
        //  })

        //})
;


    // this should only happen once...
    svg.append("text")
        .attr("dy", ".35em")
        .attr("class", "legend")
        .attr("fill", "rgb(128,128,128)")
        .style("text-anchor", "middle")
        .text(function(d) {return d.day;});

    console.log('donut done.');
}





























