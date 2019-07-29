var url = window.location.href;
		var urlDOM = document.getElementById("URL").innerHTML = url;
		var array = urlDOM.split("/");
		var projectID = array[4];
		console.log(projectID);
		//console.log(array);
		document.getElementById("inputID").value = projectID;
		document.getElementById("inputID").style.visibility = "hidden";
var editor = ace.edit("editor");
var textareaNew = $('#mei');
editor.getSession().on("change", function () {
	textareaNew.val(editor.getSession().getValue());
	localStorage.setItem("ace",textareaNew.val());
});
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/html");//Html mode parsing
var aceEditor = localStorage.getItem("ace");

Dropzone.autoDiscover = false;
var myDropzone = new Dropzone("#dropzone-example", {
	maxFileSize: 10,
	acceptedFiles: ".png, .jpg, .tiff, .tif, .jpeg",
	addRemoveLinks: true,
});
myDropzone.on('removedfile', function (file) {
//Need to add the remove file to true from the dropzone.
	var fs = require('fs');
	fs.unlinkSync(file);
	  console.log(file);

	/* here do AJAX call to your server ... */
	//try an ajax call with a php file
	});