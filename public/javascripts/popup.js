// Function to initialise modals
// Get the modal
window.onload = function(){ 
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
// When the user clicks on the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}
// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}


var uploadModal = document.getElementById("uploadCSV");

// Get the button that opens the modal
var btnCSV = document.getElementById("uploadCSVButton");

// Get the <span> element that closes the modal
var spanCSV = document.getElementsByClassName("close")[1];
// When the user clicks on the button, open the modal 
btnCSV.onclick = function() {
  uploadModal.style.display = "block";
}
// When the user clicks on <span> (x), close the modal
spanCSV.onclick = function() {
  uploadModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == uploadModal) {
     uploadModal.style.display = "none";
  }
  if (event.target == modal) {
     modal.style.display = "none";
  }
}
};

function initializeModal(modalID, buttonID) {
  //Modal id not getting the information
  // Get the modal element
  var modal = document.getElementById(modalID);

  // Get the button that opens the modal
  var btn = document.getElementById(buttonID);

  // Get the <span> element that closes the modal
  var span = modal.querySelector('.close');

  // When the user clicks on the button, open the modal
  btn.addEventListener('click', function() {
    modal.style.display = "block";
  });

  // When the user clicks on <span> (x), close the modal
  span.addEventListener('click', function() {
    modal.style.display = "none";
  });

  // When the user clicks anywhere outside of the modal, close it
  window.addEventListener('click', function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
}