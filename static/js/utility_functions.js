/**
 * Created by jmadison on 3/9/15.
 */


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


// closes the info box:
document.getElementById('close').onclick = function(){
        this.parentNode.parentNode.parentNode
        .style.display = "none";

        return false;
    };
