

Dropzone.autoDiscover = false;
$(document).ready(function() {
  $('.dropzone').each(function(i, el) {
    var myDropzone = new Dropzone('#' + $(this).attr('id'), {
        maxFileSize: 10,
        acceptedFiles: ".png, .jpg, .tiff, .tif, .jpeg",
        addRemoveLinks: false,
    });
      myDropzone.displayExistingFile(mockFile, `data:image/jpeg;base64,${neumes[i]['imagesBinary'][0]}`, callback, crossOrigin, resizeThumbnail);
    myDropzone.on("success", function(file, serverResponse) {
        if (this.files.length > 1) {
          this.removeFile(this.files[0]);
        }
        console.log(this.element.id);
        if (file.size > (1024 * 1024 * 10)) // not more than 5mb
        {
          this.removeFile(file); // if you want to remove the file or you can add alert or presentation of a message
          alert("The image uploaded is too large. You cannot upload an image bigger than 10 MB. You will be redirected to the main page.")
        } else {
          console.log('Image size ok');
          var imgBuf = file;
          console.log(this.files[0].imagepath)
          socket.emit('neume image add', [this.element.id.split('_')[1], file, this.files[0].name])
        }
    });
    myDropzone.on('removedfile', function(file) {
        //Function from rm_image_dropzone.js to remove file from folder
        //console.log(file);
    });
  });

  var dragTimer;
  $(document).on('dragover', function(e) {
    var dt = e.originalEvent.dataTransfer;
    if (dt.types && (dt.types.indexOf ? dt.types.indexOf('Files') != -1 : dt.types.contains('Files'))) {
      $(".dropzone .drag-zone").css({'background-color': '#afafaf52'});
      window.clearTimeout(dragTimer);
    }
  });
  $(document).on('dragleave', function(e) {
    dragTimer = window.setTimeout(function() {
      $(".dropzone .drag-zone").css({'background-color': 'transparent'});
    }, 25);
  });

  $('.neumeSection').on('click', '.dz-preview', function() {
    $(this).parents('.dropzone').get(0).dropzone.hiddenFileInput.click();
  })
})
