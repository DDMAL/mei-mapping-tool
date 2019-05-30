//Geting the elements to be independent of one another

window.onbeforeunload = function() {
    localStorage.setItem("name", $('#inputName').val());
    localStorage.setItem("folio", $('#inputFolio').val());
    localStorage.setItem("description", $('#inputDescription').val());
    localStorage.setItem("classification", $('#inputClassification').val());
    localStorage.setItem("classification", $('#inputClassification').val());
    localStorage.setItem("classification", $('#inputClassification').val());
}

window.onload = function() {

    var name = localStorage.getItem("name");
    if (name !== null) $('#inputName').val(name);
    var folio = localStorage.getItem("folio");
    if (folio !== null) $('#inputFolio').val(folio);
    var description = localStorage.getItem("description");
    if (description !== null) $('#inputDescription').val(description);
    var classification = localStorage.getItem("classification");
    if (classification !== null) $('#inputClassification').val(classification);


    // ...
}
var $classifier = $('.glyphicon.glyphicon-plus')

Dropzone.autoDiscover = false;    
//Dropzone function to get:

$(function() {
    var mockFile = { name: "Punctum_example_3.png", size: 12345 };
    var myDropzone = new Dropzone("#my-dropzone-element-id");
    myDropzone.options.addedfile.call(myDropzone, mockFile);
    myDropzone.options.thumbnail.call(myDropzone, file, "http://" + window.location.hostname + '/images/' + value.server)
})


 //Any button with a black + will be able to add input fields
$classifier.on("click", function(e) {
  $('<input>').insertBefore(this);
  $('<br>').insertBefore(this);  
})

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "none") {
      content.style.display = "block";
    } else {
      content.style.display = "none";
    }
  });
}

// Get the modal and cloned element
// Get the modal and cloned element
var modal = document.getElementById("myModal");


// Get the button that opens the modal
var btn = $("#button");

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

/////Jquery to add multiple items and keep the event listeners
var $addButton = $(".z_plus");
$addButton.on("click", function(e) {
modal.style.display = "block";
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
var buttonSubmit = document.getElementById("newCollapsible");
Dropzone.autoDiscover = false;
buttonSubmit.onclick = function(e) {

  //Submit button closes pop-up
  modal.style.display = "none";
  var buttonClone = $("#collapsibleButton");
  var $cloner = $classifier.closest(".clone");    
//Creating a button element
  var name = document.getElementById("elementName").value;
  var buttonClone = $("#collapsibleButton");
  var $body = $(".roundedCorners")
  var clonedButton = buttonClone.clone();
  
  clonedButton.html(name);
  clonedButton.appendTo($body);
  var collapse = clonedButton;
  var el;

for (el = 0; el < collapse.length; el++) {
  collapse[el].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "none") {
      content.style.display = "block";
    } else {
      content.style.display = "none";
    }
  });
}
Dropzone.autoDiscover = false;
    $(function() {
        // Now that the DOM is fully loaded, create the dropzone, and setup the
        // event listeners
        var myDropzone = new Dropzone(document.getElementById("dropzoneSection"));
        myDropzone.on("complete", function(file) {
            alert("halo");
            /* Maybe display some more file information on your page */
        });
    })
    e.preventDefault();
  //var $body = $(".roundedCorners")
  $cloner.clone(true).appendTo($body);
  
}
 var $cloned = $('.clone').clone(true, true);
});





