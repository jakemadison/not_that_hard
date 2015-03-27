/**
 * Created by Madison on 15-03-22.
 */




function build_must_modal() {
    console.log('build must modal is active now');
    $('.must_modal').modal('show');


    $.get('/get_must_do_data', function(result) {
        console.log('getting must do data....');
        do_something_with_data(result);
    });



    function do_something_with_data(data) {
        console.log('i have data! ', data, 'I should do something with it...');

    }



}


$('.must_modal').on('hidden.bs.modal', function() {
    console.log('must modal hidden!');
    d3.select('.must_chart').remove();
});