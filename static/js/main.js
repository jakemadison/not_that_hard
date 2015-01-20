/**
 * Created by jmadison on 1/2/15.
 */

// get some data:
$.get('get_historical_data', function(result) {

    console.log('received a result!  woo!', result);

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
    var radius = 74;
    var padding = 10;

    var total_record_length = Object.keys(data[0]).length;

    // map 0 - 100 on to 0 - 2*Pi:
    var arcScale = d3.scale.linear().domain([0, 100]).range([0, 2*Math.PI]);



    function create_arc_new(config) {

        return function myArc() {
              var arc_obj = d3.svg.arc().innerRadius(config.r - 20)
                .outerRadius(config.r)
                .startAngle(function(d, i) {
                    console.log('start angle for i: ', i, 'on data point d: ', d);

                    return arcScale((i+1)*(100/config.l));
                })
                .endAngle(function(d, i) {
                    return arcScale(25 + ((i+1)*(100/config.l)));
                });

                return arc_obj;
        }
    }

    var create_arc = function(r, l) {
      var arc_obj = d3.svg.arc().innerRadius(r - 20)
        .outerRadius(r)
        .startAngle(function(d, i) {
            console.log('start angle for i: ', i, 'on data point d: ', d);

            return arcScale((i+1)*(100/l));
        })
        .endAngle(function(d, i) {
            return arcScale(25 + ((i+1)*(100/l)));
        });

        return arc_obj;

    };

    var arc = create_arc_new({'r': radius, 'l': total_record_length});
    var arc_old = create_arc({'r': radius, 'l': total_record_length});
    var second_arc = create_arc_new({'r': 50, 'l': total_record_length});


    console.log('old arc was returned as: ', arc_old);
    console.log('new arc was returned as: ', arc);

    //var arc = d3.svg.arc().innerRadius(radius - 20)
    //    .outerRadius(radius)
    //    .startAngle(function(d, i) {
    //        console.log('start angle for i: ', i, 'on data point d: ', d);
    //
    //        return arcScale((i+1)*(100/total_record_length));
    //    })
    //    .endAngle(function(d, i) {
    //        return arcScale(25 + ((i+1)*(100/total_record_length)));
    //    });


      var colour_array = ["#AA8888", "#88BB88", "#8888CC", "#AA88CC"];
      var color = d3.scale.ordinal()
        //.domain(colour_array)
          .domain(d3.keys(data[0]).filter(function(key) {
              var ignore_vals = ['id', 'date'];
              return ignore_vals.indexOf(key) === -1}))
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);


    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) {return d;});


    var test_data = [1,2,3,4];


    console.log('starting svg building.');
    var test = [[0,2,3,1],[4,4,4,4],[1,2,2,4],[1,2,3,4],[1,2,3,4],[1,2,3,4],[1,2,3,4],[1,2,3,4]];
    var svg =d3.select('.chart').selectAll('.pie')
        .data(data)
        .enter().append('svg')
        .attr('class', 'pie')
        .attr('width', radius * 2)
        .attr('height', radius * 2)
        .append('g')
        .attr('transform', 'translate(' + radius + ',' + radius + ')');


    console.log('finished svg building.  starting arc/path building');
    svg.selectAll('.arc')

        //.data(function(d, i) {return test[i];})
        //        .data(function(d) {return d;}) <- this worked when what was coming back was
        // [1,2,3,4].  What it's doing is building the path element...

        .data(function(d, i) {
            //console.log('arc data: ', d);

            var ignore_vals = ['id', 'day'];
            var arc_array = [];
            var outer_arc_array = [];

            for (prop in d) {
                //console.log('checking prop ', prop, 'in d ', d);
                if (!d.hasOwnProperty(prop)){
                    continue;
                }

                if (ignore_vals.indexOf(prop) === -1 ){
                    //console.log(d[prop][0]);
                    arc_array.push(true);

                    if (d[prop].length == 2) {
                        //console.log('second val found: ', d[prop][1]);
                        outer_arc_array.push(true);
                    }

                }

                //console.log('property of d: ', prop, d[prop]);

            }

            //console.log(Object.keys(d).length);
            //console.log(arc_array);
            return arc_array

        })
        .enter()
        .append("path")
        .attr("class", "arc")
        .attr("d", arc())
        .attr("d", second_arc())
        .style("fill", function(d, i) {return color(i+1)});

    svg.append("text")
        .attr("dy", ".35em")
        .attr("class", "legend")
        .attr("fill", "rgb(128,128,128)")
        .style("text-anchor", "middle")
        .text(function(d) {return d.day;});

    console.log('donut done.');
}





























