function allowDrop(event) {
  event.preventDefault();
  //Here we want to have a popup, ask for the section name and 
  var modal = document.getElementById("modalSection");

  // When the user clicks on the button, open the modal
  modal.style.display = "block";

  var span = modal.querySelector('.closingSectionModal');
  
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

	//create a section at the end of the page with the neumes inside that
	//will have as name the name of the section 
  event.preventDefault();
  document.getElementById("demo").innerHTML = "The p element is OVER the droptarget.";
  event.target.style.border = "4px dotted green";
}

  