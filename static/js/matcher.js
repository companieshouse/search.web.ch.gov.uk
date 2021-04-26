$(function() {
    $(".nearest").parent().addClass("near");

    $('html, body').animate({
        scrollTop: $('.near').offset().top
    }, 'slow');
});

function changeThis(sender) { 
    if (document.getElementById("alphabetical").checked){
        document.getElementById("changed-name").checked = true;
        document.getElementById("changed-name-2").disabled = true;
    } else {
        document.getElementById("changed-name-2").removeAttribute('disabled');
    }
};
