
console.log(neumes);
Dropzone.autoDiscover = false;
$(document).ready(function() {
  $('.dropzone').each(function(i, el) {
    var myDropzone = new Dropzone('#' + $(this).attr('id'), {
        maxFileSize: 2000,
        resizeWidth: 128,
        acceptedFiles: 'image/*',
        addRemoveLinks: false,
    });
    // ALWAYS AS MANY DROPZONES AS NEUMES, just check if there is an existing image binary at same index in neumes array
    if (neumes[i].imagesBinary[0]) {
      let mockFile = {name: neumes[i]['imagePath'][0], size: 12345};
      let callback = null;
      let crossOrigin = null;
      let resizeThumbnail = false;
      myDropzone.displayExistingFile(mockFile, `data:image/jpeg;base64,${neumes[i]['imagesBinary'][0]}`, callback, crossOrigin, resizeThumbnail);
      myDropzone.files.length += 1;
      myDropzone.files[0] = mockFile;
    }

    myDropzone.on("success", function(file, serverResponse) {
        if (this.files.length > 1) {
          console.log('more than one file')
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
