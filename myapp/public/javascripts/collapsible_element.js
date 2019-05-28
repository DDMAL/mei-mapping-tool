
/////Jquery to add multiple items and keep the event listeners
var $addButton = $(".z_plus");
// Get the modal and cloned element
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

$addButton.on("click", function(e) {

//Getting the elements for the collapsible element:
var btn = $("#button");
// Get the <span> element that closes the modal
var span = $(".close")[0];
  //Open modal : 
  btn.onclick = function() {
  modal.style.display = "block";
}
//Closing the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
    e.preventDefault();
    var $cloner = $(this).closest(".clone");    
    $cloned.clone(true, true).insertAfter($cloner);
    var $classifier = $('.glyphicon.glyphicon-plus')
    
    //Any button with a black + will be able to add input fields
    $classifier.on("click", function(e) {  
      $('<input>').insertBefore(this);
    });
    


});
var $cloned = $('.clone').clone(true, true);

var $collapsibleButton = $("#collapsibleButton");


