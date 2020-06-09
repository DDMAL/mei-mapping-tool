var editor = ace.edit("editor");
var textareaNew = $('#mei');
editor.getSession().on("change", function() {
    textareaNew.val(editor.getSession().getValue());
    localStorage.setItem("ace", textareaNew.val());
});
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/xml"); //xml mode parsing



var aceEditor = localStorage.getItem("ace");
Dropzone.autoDiscover = false;
var myDropzone = new Dropzone("#dropzone-example", {
    maxFileSize: 10,
    acceptedFiles: ".png, .jpg, .tiff, .tif, .jpeg",
    addRemoveLinks: false,
});
myDropzone.on("success", function(file, serverResponse) {
    if (file.size > (1024 * 1024 * 10)) // not more than 5mb
    {
        this.removeFile(file); // if you want to remove the file or you can add alert or presentation of a message
        alert("The image uploaded is too large. You cannot upload an image bigger than 10 MB. You will be redirected to the main page.")
        document.getElementById("cancelButton").click();
    }
});
myDropzone.on('removedfile', function(file) {
    //Function from rm_image_dropzone.js to remove file from folder
    //console.log(file);
});