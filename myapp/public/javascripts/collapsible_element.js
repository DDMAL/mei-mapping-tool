
/////Jquery to add multiple items and keep the event listeners
var $addButton = $(".z_plus");
$addButton.on("click", function(e) {
    e.preventDefault();
    var $cloner = $(this).closest(".clone");    
    $cloned.clone(true, true).insertAfter($cloner);
    var $classifier = $('.glyphicon.glyphicon-plus')
    
    //Any button with a black + will be able to add input fields
    $classifier.on("click", function(e) {  
      $('<input>').insertBefore(this);
    });
   
    //Adding ace editors each time the button is pressed :
    var $editor = ace.edit("editor");
    $editor.setTheme("ace/theme/monokai");
    $editor.getSession().setMode("ace/mode/javascript");

   
    $("<div>").dropzone({ url: "/file/post" }).insertBefore(this);

});
var $cloned = $('.clone').clone(true, true);

//Adding css files : 
$('head').append('<link rel="stylesheet" href="/stylesheets/dropzone.css" type="text/css" />');
/////Modal button with the submit button

// Get the modal and cloned element
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("button");
var buttonSubmit = document.getElementById("newCollapsible")

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

 var editor = ace.edit("editor");
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/javascript");
