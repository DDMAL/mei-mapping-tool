/*Function to create a canvas for each image inside of the imagepath array of the neume
@param element : single imagepath of the array*/
var imagePaths = "#{neume.imagePath}";
var imageArray = imagePaths.split(',');
//console.log(imageArray);
imageArray.forEach(function(element) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
    var image = new Image();

    image.onload = function() {

        // set size proportional to image
        canvas.height = image.height * 0.5;
        canvas.width = image.width * 0.5;

        // step 1 - resize to 50%
        var oc = document.createElement('canvas'),
            octx = oc.getContext('2d');

        oc.width = image.width;
        oc.height = image.height;
        octx.drawImage(image, 0, 0, oc.width, oc.height);

        // step 2
        octx.drawImage(oc, 0, 0, oc.width, oc.height);

        // step 3, resize to final size
        ctx.drawImage(oc, 0, 0, oc.width, oc.height,
            0, 0, canvas.width, canvas.height);
    }
    image.src = "/gallery/" + element; //getting the file paths
    var imageCard = document.getElementById("image#{neume.id}"); //getting
    imageCard.appendChild(canvas);
    canvas.appendChild(image); //the image is appended
});

/*On click function of the collapsible buttons. It makes the immediate children of the collapsible 
appear if the collapsible button is clicked.*/

var coll = document.getElementById("collapsible#{neume.id}");

coll.addEventListener("click", function() {

    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "none") {
        content.style.display = "block";
    } else {
        content.style.display = "none";
    }

});