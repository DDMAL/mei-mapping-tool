/*Function to delete images from the uploads folder if 
they were removed from the dropzone
@param file to remove from dropzone */

function rmImgDropzone(file) {
var fs = require('fs-js');
fs.unlink(file.upload.uuid + ".jpg", (err) => {
  if (err) throw err;
  console.log('successfully removed image');
});
}