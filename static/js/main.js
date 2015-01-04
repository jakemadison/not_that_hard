/**
 * Created by jmadison on 1/2/15.
 */

// get some data:
$.get('get_historical_data', function(result) {

    console.log('received a result!  woo!', result);

    console.log('yessssssss');


    console.log(result.data);
    // now do something with data...

    var test_table = $('.test_body');
    for (var i=0; i<result.data.length; i++) {
        console.log(result.data[i]);


        var this_row = '<tr> <td>'+i+'</td><td>'+
                                    result.data[i].date+'</td><td>'+
                                   result.data[i].yoga+'</td><td>'+
                                result.data[i].music+'</td><td>'+
                                result.data[i].biking+'</td><td>'+
                                result.data[i].coding+'</td></tr>';


        console.log('this row: ', this_row);
        test_table.append(this_row);


    }


    create_donut(result.data);

});


function create_donut(data) {

    console.log('create donut... ');

    var number_donuts = data.length;
    var number_of_segments = 4;
    var colour_array = ["#AA8888", "#88BB88", "#8888CC", "#AA88CC"];


    var radius = 74;
    var padding = 10;


    var vis = d3.select('.chart');

    // map 0 - 100 on to 0 - 2*Pi:
    var arcScale = d3.scale.linear().domain([0, 100]).range([0, 2*Math.PI]);

    var arc = d3.svg.arc().innerRadius(radius - 30)
        .outerRadius(radius)
        .startAngle(function(d, i) {
            return arcScale(i*25);
        })
        .endAngle(function(d, i) {
            return arcScale(25 + (i*25));
        });

      var color = d3.scale.ordinal()
        .domain(colour_array)
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);


    vis.selectAll("path").data(data).enter()
        .append("path")
        .attr("d", arc)

        //.style("fill", function(d, i) {
        //    return colour_array[i];
        //})

        .style("fill", color)
        .attr("transform", "translate(300,200)");

    console.log('donut done.');

}





























