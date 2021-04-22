const socket = io();

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

$('.neumeSection')
  .on('mouseover', '.neume-row', function(e) {
    $(this).find('.neume-delete-button').fadeIn();
    // $(this).css('background-color', 'blue');
  })
  .on('mouseleave', '.neume-row', function(e) {
    $(this).find('.neume-delete-button').fadeOut();
    // $(this).css('background-color', 'blue');
  })

  .on('click', '.neume-delete-button', function(e) {
    socket.emit('neume delete', $(this).parents('.neume-row').attr('id'));
    $(this).parents('.neume-row').remove();
  })

socket.on('new neume info', (msg) => {
  $('.neumeSection').append(
    `<div class="neume-row" id=${msg[1]}>
      <div class="image-wrap"></div>
      <input type="text" value='' autocomplete="off" name="name" id="neume-name_${msg[1]}" class="name" />
      <input type="text" value='' autocomplete="off" name="generic-name" id="generic-name_${msg[1]}" class="genericName" />
      <input type="text" value='' autocomplete="off" name="folio" id="folio_${msg[1]}" class="folio" />
      <input type="text" value='' autocomplete="off" name="description" id="description_${msg[1]}" class="description" />
      <input type="text" value='' autocomplete="off" name="classification" id="classification_${msg[1]}" class="classification" />
      <div name="mei" id="mei_${msg[1]}" autocomplete="off" class="mei"></div>
      <button class="neume-delete-button" style="display: none;"> X</div>
    </div>
    `
  )
  var editor = ace.edit($('.neumeSection').find('.mei').last().attr('id'));
  editor.session.setMode("ace/mode/xml");
  editor.session.on('change', () => {
    socket.emit('neume edit', [editor.session.getValue(), obj.id, 'mei'])
  });
  $('.neumeSection input').on('input', function(e) {
    e.preventDefault();
    socket.emit('neume edit', [$(this).val(), $(this).attr('id'), $(this).attr('class')]);
  });
})
