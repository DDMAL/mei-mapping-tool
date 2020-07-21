function initEditNeume(neume) {
    Dropzone.autoDiscover = false;
    if (document.getElementById('dropzone' + neume._id)) {
        var myDropzone = new Dropzone("div#dropzone" + neume._id, {
            maxFileSize: 10, //MB
            acceptedFiles: ".png, .jpg, .tiff, .tif, .jpeg",
            addRemoveLinks: false,
        });
    }

    myDropzone.on("success", function(file, serverResponse) {
        if (file.size > (1024 * 1024 * 10)) // not more than 5mb
        {
            this.removeFile(file); // if you want to remove the file or you can add alert or presentation of a message
            alert("The image uploaded is too large. You cannot upload an image bigger than 10 MB. You will be redirected to the main page.")
            document.getElementById("cancelButton").click();
        }
    });
    myDropzone.on('removedfile', function(file) {
        //document.getElementById
        //Need to add the remove file to true from the dropzone.
        var fs = require('fs');

        /* here do AJAX call to your server ... */
        //try an ajax call with a php file
    });
    //Getting the canvas for the images : 
    var images = neume.imagesBinary;

    // the form can't be submitted if the input empty
    // or if it is an empty array or empty string
    // so we have to use some non-empty string as default input
    var imagesToDelete = 'none';
    try {
        document.getElementById("imageToDelete" + neume._id).value = imagesToDelete;
    } catch(e) {
        console.error(e);
    }
    

    //For each image in the neume
    images.forEach(function(element) {
        //creating a canvas
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext("2d");
        canvas.className += "resize";
        //creating an image object
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
        //getting the source of the image from the gallery
        image.src = "data:image/png;base64," + element; //getting the file paths
        var imageSrc = image.src;
        //This element is linked to multiple neumes. We need to change 
        //its id so that it is unique to the neume we want to delete the image from.
        var imageDeletedPath = document.getElementById("imageToDelete" + neume._id);
        imageDeletedPath.name = "imageDeleted";
        imageDeletedPath.hidden = true;

        var imageCard = document.getElementById("images" + neume._id);
        imageCard.appendChild(canvas);
        canvas.appendChild(image);

        //We can create a delete button here 
        var buttonDeleteImage = document.createElement("BUTTON");
        buttonDeleteImage.id = "buttonDeleteImage" + element;
        buttonDeleteImage.innerHTML = "x";
        buttonDeleteImage.className = "button3DeleteImage";
        buttonDeleteImage.type = "button";

        //Hide the button is there is no image
        if (element == "") {
            console.log("no image");
            $(buttonDeleteImage).hide();
        }
        //Append the button to the image card.
        imageCard.appendChild(buttonDeleteImage);
        buttonDeleteImage.onclick = ('click', function() {
            if (imagesToDelete == 'none') {
                imagesToDelete = [];
            }
            imagesToDelete.push(element);
            try {
                document.getElementById("imageToDelete" + neume._id).value = imagesToDelete;
            } catch(e) {
                console.error(e);
            }
            //Delete the image :
            canvas.style.display = "none";
            buttonDeleteImage.style.display = "none";
        })
    });
    document.getElementById('cancelButton').onclick = function() {
        imagesToDelete = 'none';
    };
}