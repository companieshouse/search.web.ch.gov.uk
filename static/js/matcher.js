$(function() {
    $(".nearest").parent().addClass("near");

    $('html, body').animate({
        scrollTop: $('.near').offset().top
    }, 'slow');
});

function changeThis(sender) { 
    if (document.getElementById("alphabetical").checked){
        document.getElementById("which-company-name-to-search").checked = true;
        document.getElementById("which-company-name-to-search-2").disabled = true;
    } else {
        document.getElementById("which-company-name-to-search-2").removeAttribute('disabled');
    }
};
