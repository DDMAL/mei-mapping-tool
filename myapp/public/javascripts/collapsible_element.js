
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
// var name = document.getElementById("elementName").value;
// var buttonCollapse = document.createElement("BUTTON");
 //var collapsibleAttribute = document.createAttribute("class");
 //collapsibleAttribute.value = "collapsible";
 //buttonCollapse.setAttributeNode(collapsibleAttribute);

//Appending it to the bounding box for the collapsible
 //buttonCollapse.innerText = name;
 //var boxContainer = document.getElementById("roundedBoxId");
 //boxContainer.appendChild(buttonCollapse);

//Submit button adds a new collapsible element
var name = document.getElementById("elementName").value; //name submitted by the person
var buttonClone = document.getElementById("collapsibleButton");
var buttonCloned = buttonClone.cloneNode(true);
buttonCloned.innerText = name;
var boxContainer = document.getElementById("roundedBoxId");
boxContainer.appendChild(buttonCloned);
//document.getElementById("collapsibleButton").innerText = name;

//Maling the element for cloning the content of the collapsible
var meiEncodingToClone = document.getElementById("template");
var meiEncodingCloned = meiEncodingToClone.cloneNode(true);

meiEncodingCloned.value = "";
//Changing the background of the element collapsible
meiEncodingCloned.style.backgroundColor = "#f1f1f1";


///////CREATING A NEW DROPZONE EACH TIME THE CODE IS RESET :
//Creating a new Dropzone form : 

var dropzoneForm = document.createElement("form");

var actionAttribute = document.createAttribute("action");
actionAttribute.value = "/images";

var classAttribute = document.createAttribute("class");
classAttribute.value = "dropzone";

var methodAttribute = document.createAttribute("method");
methodAttribute.value = "post";

var idAttribute = document.createAttribute("id");
idAttribute.value = "myNewDropzoneElement";

dropzoneForm.setAttributeNode(actionAttribute);
dropzoneForm.setAttributeNode(classAttribute);
dropzoneForm.setAttributeNode(methodAttribute);
dropzoneForm.setAttributeNode(idAttribute);

//Creating a divison fallback
var divisionFallback = document.createElement("div");
var classFallback = document.createAttribute("class");
classFallback.value = "fallback";
divisionFallback.setAttributeNode(classFallback);

//creating an input
var inputDrop = document.createElement("input");
var typeAttribute = document.createAttribute("type");
typeAttribute.value = "file";
var nameAttribute = document.createAttribute("name");
nameAttribute.value = "pic";
var multipleAttribute = document.createAttribute("multiple")

inputDrop.setAttributeNode(typeAttribute);
inputDrop.setAttributeNode(nameAttribute);
inputDrop.setAttributeNode(multipleAttribute);

//Creating a span message:
 var classSpan = document.createAttribute("class");
classSpan.value = 'span';

var classNote = document.createAttribute("class");
classNote.value = "note";

var classneedsclick = document.createAttribute("class")
classneedsclick.value = "needsclick";

///////SETTING THE DROPZONE IN THE MEIENCODING PANEL

 var boxContainer = document.getElementById("roundedBoxId");
 boxContainer.appendChild(dropzoneForm);

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

//Appending the meiEncodingCloned to the document
boxContainer.appendChild(meiEncodingCloned);

//Shutting off the autodiscovery element of the specific elements 
Dropzone.autoDiscover = false; 
}

//Delete elements
var closebtns = document.getElementsByClassName("close");
var i;

for (i = 0; i < closebtns.length; i++) {
  closebtns[i].addEventListener("click", function() {
    document.getElementById("collapsibleButton").style.display = 'none';
    meiEncodingToClone.remove();
  });
}


