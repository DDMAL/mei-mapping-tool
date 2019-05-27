//add function for Ace editor : 

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

////Submit button clicked events for creating a new element
buttonSubmit.onclick = function() {

//Submit button closes pop-up
 modal.style.display = "none";


//Creating a button element
 var name = document.getElementById("elementName").value;
// var buttonCollapse = document.createElement("BUTTON");
 //var collapsibleAttribute = document.createAttribute("class");
 //collapsibleAttribute.value = "collapsible";
 //buttonCollapse.setAttributeNode(collapsibleAttribute);
var buttonClone = document.getElementById("collapsibleButton");
var buttonCloned = buttonClone.cloneNode(true);
buttonCloned.innerText = name;

var boxContainer = document.getElementById("roundedBoxId");
boxContainer.appendChild(buttonCloned);
//Appending it to the bounding box for the collapsible
 buttonCloned.innerText = name;
 //var boxContainer = document.getElementById("roundedBoxId");
 //boxContainer.appendChild(buttonCloned);

//Submit button adds a new collapsible element
//var name = document.getElementById("elementName").value; //name submitted by the person
/*var buttonClone = document.getElementById("collapsibleButton");
var buttonCloned = buttonClone.cloneNode(true);
buttonCloned.innerText = name;
var boxContainer = document.getElementById("roundedBoxId");
boxContainer.appendChild(buttonCloned);
//document.getElementById("collapsibleButton").innerText = name;*/

//Maling the element for cloning the content of the collapsible
var meiEncodingToClone = document.getElementById("template");
var meiEncodingCloned = meiEncodingToClone.cloneNode(true);
var elementCloned = document.getElementById("template");

meiEncodingCloned.value = "";
//Changing the background of the element collapsible
meiEncodingCloned.style.backgroundColor = "#f1f1f1";
boxContainer.appendChild(meiEncodingCloned);


//Event listener for the click button of the collapsible element
buttonCloned.addEventListener("click", function() {
  this.classList.toggle("active");
  var content = meiEncodingCloned;
  if (content.style.display === "block") {
  content.style.display = "none";
  } else {
  content.style.display = "block";
  }
  });
meiEncodingCloned
//Appending the meiEncodingCloned to the document
boxContainer.appendChild(meiEncodingCloned);

//Making dividers for the dropzone : 

//Dropzone element multiple times
var x = document.getElementsByName("hey");
var i;
  for (i = 0; i < x.length; i++) {
      x[i].onclick = function() {
     var divisionDrop = document.createElement("div");
     var divisionId = document.createAttribute("id");
     divisionId.value = x[i];
     divisionDrop.setAttributeNode(divisionId);
     var formDropzone = document.getElementsByName("sectionDrop");
     document.body.appendChild(divisionDrop);
    // Dropzone class:
    var myDropzone = new Dropzone(divisionDrop, { url: "/file/post"});

    //Shutting off the autodiscovery element of the specific elements 
    Dropzone.autoDiscover = false; 
}
}}

//Delete elements
var closebtns = document.getElementsByClassName("close");
var i;

for (i = 0; i < closebtns.length; i++) {
  closebtns[i].addEventListener("click", function() {
    document.getElementById("collapsibleButton").style.display = 'none';
    meiEncodingToClone.remove();
  });

}

