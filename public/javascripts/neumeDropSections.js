function allowDrop(event) {
	//Here we want to have a popup, ask for the section name and 
	//create a section at the end of the page with the neumes inside that
	//will have as name the name of the section 
  event.preventDefault();
  document.getElementById("demo").innerHTML = "The p element is OVER the droptarget.";
  event.target.style.border = "4px dotted green";
}