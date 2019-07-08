// Get the modal
var modalProject = document.getElementById("createProject");

// Get the button that opens the modal
var btnProject = document.getElementById("addBtnProject");

// Get the <span> element that closes the modal
var spanProject = document.getElementsByClassName("closeProject")[0];

// When the user clicks on the button, open the modal 
btnProject.onclick = function() {
  modalProject.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
spanProject.onclick = function() {
  modalProject.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modalProject) {
    modalProject.style.display = "none";
  }
}