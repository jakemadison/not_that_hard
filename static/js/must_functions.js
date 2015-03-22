/**
 * Created by Madison on 15-03-22.
 */




function build_must_modal() {
    console.log('build must modal is active now');
    $('.must_modal').modal('show');

}


$('.must_modal').on('hidden.bs.modal', function() {
    console.log('must modal hidden!');
    d3.select('.must_chart').remove();
});