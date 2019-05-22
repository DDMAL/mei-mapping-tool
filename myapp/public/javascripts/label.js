
//Button elements for the label and the folio

var buttonLabel = document.getElementById("folioButton");
var buttonFolio = document.getElementById("classifierButton");
var form = document.getElementById("form");
var classifierInputForm = document.getElementById("inputClassifier");
//Function to make a new folio
buttonLabel.onclick = function() {

var input = document.createElement("input");
form.append(input);
 }

buttonFolio.onclick = function() {

var input = document.createElement("input");
classifierInputForm.prepend(input);
 }