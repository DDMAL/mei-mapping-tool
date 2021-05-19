Dropzone.autoDiscover = false;

$('.dropzone').each((i, obj) => {
  $(obj).css({'display': 'none'});
})

$('input').attr('readonly', 'readonly');
$('.neume-button-wrapper').css({'display': 'none'});
$('.mei').each((i, obj) => {
  console.log(obj.id)
  var editor = ace.edit(obj.id);
  //- editor.setTheme("ace/theme/monokai");
  editor.session.setMode("ace/mode/xml");
  editor.setReadOnly(true);
});
