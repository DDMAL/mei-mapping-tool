
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
 var modal = document.getElementById("projectModal");

// Get the button that opens the modal
 var btn = document.getElementById("projectButton");
 var buttonSubmit = document.getElementById("submitProject")

// Get the <span> element that closes the modal
 var span = document.getElementsByClassName("close")[0];

//Variables for the new button project
var newProject = document.createElement("BUTTON");


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

////Submit button clicked events 

buttonSubmit.onclick = function() {

//Submit button closes pop-up
 modal.style.display = "none";
var name = document.getElementById("elementName").value; 
//Submit button adds a new element
//name submitted by the person
newProject.innerText = name;
document.body.appendChild(newProject);  

}

newProject.onclick = function(){
   window.location.href= '/meiMapping'
  }