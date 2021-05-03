const socket = io();

Dropzone.autoDiscover = false;


$('.mei').each((i, obj) => {
  console.log(obj.id)
  var editor = ace.edit(obj.id);
  //- editor.setTheme("ace/theme/monokai");
  editor.session.setMode("ace/mode/xml");
  editor.session.on('change', () => {
    socket.emit('neume edit', [editor.session.getValue(), obj.id, 'mei'])
  });
});

$('.projectName').on('input', function(e) {
  socket.emit('project name edit', [$(this).val(), $(this).attr('id')])
})


$('.neumeSection input').on('input', function(e) {
  e.preventDefault();
  socket.emit('neume edit', [$(this).val(), $(this).attr('id'), $(this).attr('class')]);
});

$('.neume-add-button').on('click', function(e) {
  socket.emit('neume add', [$('.projectName').val(), $('.projectName').attr('id').split('_')[1]]);
})


// CSV modal upload

$('#imageCSVButton').on('click', function() {
  $('#imageCSV').css({'display': 'block'});
})

$(window).on('click', function(event) {
    if (event.target.id == 'imageCSV') {
        $(event.target).css({'display': "none"});
    }
});

function submitCSV(e) {
  e.preventDefault();
  $('#imageCSV').css({'display': 'none'});
  var data = new FormData(e.target)
  console.log(data)
  for (const [name,value] of data) {
   console.log(name, value)
  }
 socket.emit('spreadsheet upload', [data.get('IdOfProject'), data.get('fileType'), data.get('fileImage')])
 $('#ImportFile').val("");
}


$('.neumeSection')
  .on('mouseover', '.neume-row', function(e) {
    $(this).find('.neume-delete-button').fadeIn();
    // $(this).find('.change-image-button').fadeIn();
    // $(this).css('background-color', 'blue');
    if (!['neume-button-wrapper', 'neume-delete-button'].includes($(e.target).attr('class'))) {
      $(this).find('.neume-delete-button').removeClass('active');
      $(this).find('.neume-delete-button').blur();
    }
  })
  .on('mouseleave', '.neume-row', function(e) {
    $(this).find('.neume-delete-button').removeClass('active');
    $(this).find('.neume-delete-button').blur();
    $(this).find('.neume-delete-button').fadeOut();
  })
  .on('click', '.neume-delete-button', function(e) {
    if ($(this).hasClass('active')) {
      socket.emit('neume delete', $(this).parents('.neume-row').attr('id'));
      $(this).parents('.neume-row').remove();
      return
    }
    $(this).addClass('active');
  })

socket.on('new neume info', (msg) => {
  $('.neumeSection').append(
    `<div class="neume-row" id=${msg[1]}>
      <div class="image-wrap">
        <div method='post' action='/image' name="image" required id="dropzone_${msg[1]}" class="dropzone">
          <div class="drag-zone"></div>
          <div class="dz-message" data-dz-message>
            <i class="fa fa-upload fa-lg"></i>
          </div>
        </div>
      </div>
      <input type="text" value='' autocomplete="off" name="name" id="neume-name_${msg[1]}" class="name" />
      <input type="text" value='' autocomplete="off" name="generic-name" id="generic-name_${msg[1]}" class="genericName" />
      <input type="text" value='' autocomplete="off" name="folio" id="folio_${msg[1]}" class="folio" />
      <input type="text" value='' autocomplete="off" name="description" id="description_${msg[1]}" class="description" />
      <input type="text" value='' autocomplete="off" name="classification" id="classification_${msg[1]}" class="classification" />
      <div name="mei" id="mei_${msg[1]}" autocomplete="off" class="mei"></div>
      <div class="neume-button-wrapper">
        <button class="neume-delete-button" style="display: none;"><i class="fa fa-trash fa-lg"></i></div>
      </div>
    </div>
    `
  );

  var editor = ace.edit($('.neumeSection').find('.mei').last().attr('id'));

  editor.session.setMode("ace/mode/xml");
  editor.session.on('change', () => {
    socket.emit('neume edit', [editor.session.getValue(), obj.id, 'mei'])
  });
  $('.neumeSection input').on('input', function(e) {
    e.preventDefault();
    socket.emit('neume edit', [$(this).val(), $(this).attr('id'), $(this).attr('class')]);
  });

  var myDropzone = new Dropzone('#' + $('.neumeSection').find('.dropzone').last().attr('id'), {
    maxFileSize: 2000,
    resizeWidth: 128,
    acceptedFiles: 'image/*',
    addRemoveLinks: false,
  });
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
        socket.emit('neume image add', [this.element.id.split('_')[1], file, this.files[0].name])
      }
  });
  myDropzone.on('removedfile', function(file) {
      //Function from rm_image_dropzone.js to remove file from folder
      //console.log(file);
  });
})

socket.on('new neume info spreadsheet', (msg) => {
  console.log(msg[1])
  $('.neumeSection').append(
    `<div class="neume-row" id=${msg[1]._id}>
      <div class="image-wrap">
        <div method='post' action='/image' name="image" required id="dropzone_${msg[1]._id}" class="dropzone">
          <div class="drag-zone"></div>
          <div class="dz-message" data-dz-message>
            <i class="fa fa-upload fa-lg"></i>
          </div>
        </div>
      </div>
      <input type="text" value="${msg[1].name}" autocomplete="off" name="name" id="neume-name_${msg[1]._id}" class="name" />
      <input type="text" value="${msg[1].genericName}" autocomplete="off" name="generic-name" id="generic-name_${msg[1]._id}" class="genericName" />
      <input type="text" value="${msg[1].folio}" autocomplete="off" name="folio" id="folio_${msg[1]._id}" class="folio" />
      <input type="text" value="${msg[1].description}" autocomplete="off" name="description" id="description_${msg[1]._id}" class="description" />
      <input type="text" value="${msg[1].classification}" autocomplete="off" name="classification" id="classification_${msg[1]._id}" class="classification" />
      <div name="mei" id="mei_${msg[1]._id}" autocomplete="off" class="mei"></div>
      <div class="neume-button-wrapper">
        <button class="neume-delete-button" style="display: none;"><i class="fa fa-trash fa-lg"></i></div>
      </div>
    </div>
    `
  );

  var editor = ace.edit($('.neumeSection').find('.mei').last().attr('id'));

  editor.session.setMode("ace/mode/xml");
  editor.setValue(msg[1].mei);
  editor.clearSelection();
  editor.session.on('change', () => {
    socket.emit('neume edit', [editor.session.getValue(), obj.id, 'mei'])
  });

  $('.neumeSection input').on('input', function(e) {
    e.preventDefault();
    socket.emit('neume edit', [$(this).val(), $(this).attr('id'), $(this).attr('class')]);
  });

  var myDropzone = new Dropzone('#' + $('.neumeSection').find('.dropzone').last().attr('id'), {
    maxFileSize: 2000,
    resizeWidth: 128,
    acceptedFiles: 'image/*',
    addRemoveLinks: false,
  });
  if (msg[1].imagesBinary[0]) {
    let mockFile = {name: msg[1].imagePath, size: 12345};
    let callback = null;
    let crossOrigin = null;
    let resizeThumbnail = false;
    myDropzone.displayExistingFile(mockFile, `data:image/jpeg;base64,${msg[1].imagesBinary[0]}`, callback, crossOrigin, resizeThumbnail);
    myDropzone.files.length += 1;
    myDropzone.files[0] = mockFile;
  }
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
        socket.emit('neume image add', [this.element.id.split('_')[1], file, this.files[0].name])
      }
  });
  myDropzone.on('removedfile', function(file) {
      //Function from rm_image_dropzone.js to remove file from folder
      //console.log(file);
  });
})

function append(bool) {
  $('#append-delete-modal').css({'display': 'none'});
  if (!bool) {
    $('.neumeSection').find('.neume-row').remove();
  }
  socket.emit('append_delete', bool)
}

socket.on('append check', () => {
  $('#append-delete-modal').css({'display': 'block'});
})
