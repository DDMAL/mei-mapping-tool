
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

//Submit button adds a new collapsible element
var name = document.getElementById("elementName").value; //name submitted by the person
var buttonClone = document.getElementById("collapsibleButton");
var buttonCloned = buttonClone.cloneNode(true);
buttonCloned.innerText = name;
document.body.appendChild(buttonCloned);
//document.getElementById("collapsibleButton").innerText = name;

//Maling the element for cloning the content of the collapsible
var meiEncodingToClone = document.getElementById("template");
var meiEncodingCloned = meiEncodingToClone.cloneNode(true);


meiEncodingCloned.style.backgroundColor = "#f1f1f1";

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
document.body.appendChild(meiEncodingCloned);

//Shutting off the autodiscovery element of the specific elements 
Dropzone.autoDiscover = false; 
}


//Delete element
var deleteElement = document.getElementsByClassName("close")[0];
deleteElement.onclick = function() {
document.getElementById("collapsibleButton").remove();
}
