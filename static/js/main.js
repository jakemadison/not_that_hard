/**
 * Created by jmadison on 1/2/15.
 */


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


});

var vis = d3.select('.chart');

var arc = d3.svg.arc().innerRadius(50)
    .outerRadius(100)
    .startAngle(0)
    .endAngle(1.5*Math.PI);

vis.append("path")
    .attr("d", arc)
    .attr("transform", "translate(300,200)");