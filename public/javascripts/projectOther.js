Dropzone.autoDiscover = false;

$('input').attr('readonly', 'readonly');
$('.mei').each((i, obj) => {
  console.log(obj.id)
  var editor = ace.edit(obj.id);
  //- editor.setTheme("ace/theme/monokai");
  editor.session.setMode("ace/mode/xml");
  editor.setReadOnly(true);
});
