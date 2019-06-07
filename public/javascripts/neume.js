//Adding the object oriented with the website : 
var neume = {
  name: String,
  dragAndDrop: String,
  folio: String,
  description: String,
  classificationLabel: String,
  meiSnippet: String
};

//Function to add the name of a neume (Constructor): 
function Neume (name, dragAndDrop, folio, description, classificationLabel,meiSnippet) {
  // Note: Don't worry about 'this' yet. You'll understand it later. Follow along for now.
  this.name = name
  this.dragAndDrop = dragAndDrop
  this.folio = folio
  this.description = description
  this.classificationLabel = classificationLabel
  this.meiSnippet = meiSnippet

  this.sayName = function () {
    console.log(`I am ${name} ${dragAndDrop}`)
  }
}