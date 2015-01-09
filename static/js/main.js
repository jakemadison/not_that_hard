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

    console.log('data ->', data);

    data.forEach(function(d) {console.log(d); console.log(d.yoga)});

    var number_donuts = data.length;
    var number_of_segments = 4;

    var radius = 74;
    var padding = 10;

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


      var colour_array = ["#AA8888", "#88BB88", "#8888CC", "#AA88CC"];
      var color = d3.scale.ordinal()
        .domain(colour_array)
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);


    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) {return 25;});


    var test_data = [1,2,3,4];

    var svg =d3.select('.chart').selectAll('.pie')
        .data([2,3,4,5,6,7,8])
        .enter().append('svg')
        .attr('class', 'pie')
        .attr('width', radius * 2)
        .attr('height', radius * 2)
        .append('g')
        .attr('transform', 'translate(' + radius + ',' + radius + ')');

    var test = [[1,2,3,4],[1,2,3,4],[1,2,3,4],[1,2,3,4]];

    var t2 = [];

    for (var i=1; i<5; i++) {
        t2.push(pie(i));
    }

    svg.selectAll('.arc')
        //.data(function(d, i) {return test[i];})
        .data(t2)
        .enter()
        .append("path")
        .attr("class", "arc")
        .attr("d", function(d) {return pie(d);})
        .style("fill", color);



    console.log('donut done.');
}





























