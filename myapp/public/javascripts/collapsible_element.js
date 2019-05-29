//Geting the elements to be independent of one another

var $classifier = $('.glyphicon.glyphicon-plus')
    
 //Any button with a black + will be able to add input fields
$classifier.on("click", function(e) {  
  $('<input>').insertBefore(this);
})

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
}


/////Jquery to add multiple items and keep the event listeners
var $addButton = $(".z_plus");
// Get the modal and cloned element
// Get the modal and cloned element
var modal = document.getElementById("myModal");


// Get the button that opens the modal
var btn = $("#button");
var buttonSubmit = $("#newCollapsible");

//Creating a button element
  //var name = document.getElementById("elementName").value;

   //Value of the container for the dropzone : 
  var dropContainer = document.getElementById("hey");
  var buttonClone = document.getElementById("collapsibleButton");
  //var buttonCloned = buttonClone.cloneNode(true);
  //buttonCloned.innerText = name;

  var boxContainer = document.getElementById("roundedBoxId");
  //boxContainer.appendChild(buttonCloned); //This works!

  //Appending it to the bounding box for the collapsible
   //buttonCloned.innerText = name;


// Get the <span> element that closes the modal
var span = $(".close");
buttonSubmit.onclick = function(e) {

  //Submit button closes pop-up
  modal.style.display = "none";

  var $cloner = $addButton.closest(".clone");    
//Creating a button element
  var name = document.getElementById("elementName").value;
  var buttonClone = $("#collapsibleButton");
  //buttonClone.clone().insertAfter($addButton);
  buttonClone.innerText = name;
  //buttonClone.insertAfter($addButton);
    e.preventDefault();
    
    $cloned.clone(true, true).insertAfter($cloner);
  
}

var $cloned = $('.clone').clone(true, true);

var $collapsibleButton = $("#collapsibleButton");
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

 
});


