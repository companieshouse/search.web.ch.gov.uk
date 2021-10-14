$(function() {
    $(".nearest").parent().addClass("near");

    $('html, body').animate({
        scrollTop: $('.near').offset().top
    }, 'slow');
});

function changeThis() { 
    if (document.getElementById("alphabetical").checked){
        document.getElementById("changed-name").checked = true;
        document.getElementById("changed-name-2").disabled = true;
    } else {
        document.getElementById("changed-name-2").removeAttribute('disabled');
    }
};

// Save data to sessionStorage
function createItem() {
    sessionStorage.setItem("enteredName", document.getElementById("companyName").value);
};

function readValue(){
    var enteredName = sessionStorage.getItem("enteredName");
    document.getElementById("companyName").value = enteredName;
};

function clearForm(form) {
  var formElements = form.elements;
  for(i=0; i<formElements.length; i++) {
    if(formElements[i].type.toLowerCase() === "text") {
    formElements[i].value ="";
    };
  };
};