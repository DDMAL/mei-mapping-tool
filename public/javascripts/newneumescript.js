

Dropzone.autoDiscover = false;
$(document).ready(function() {
  $('.dropzone').each(function(i, el) {
    var myDropzone = new Dropzone('#' + $(this).attr('id'), {
        maxFileSize: 10,
        acceptedFiles: ".png, .jpg, .tiff, .tif, .jpeg",
        addRemoveLinks: false,
    });
    myDropzone.on("success", function(file, serverResponse) {
        console.log(this.element.id);
        if (file.size > (1024 * 1024 * 10)) // not more than 5mb
        {
            this.removeFile(file); // if you want to remove the file or you can add alert or presentation of a message
            alert("The image uploaded is too large. You cannot upload an image bigger than 10 MB. You will be redirected to the main page.")
        } else {
          console.log('Image size ok');
          var imgBuf = file;
          socket.emit('neume image add', [this.element.id.split('_')[1], file])
        }
    });
    myDropzone.on('removedfile', function(file) {
        //Function from rm_image_dropzone.js to remove file from folder
        //console.log(file);
    });
  })
})
