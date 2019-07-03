
                  //Getting the canvas for the mei snippets : 
                  var imagePaths = "#{neume.imagePath}";
                  var imageArray = imagePaths.split(',');
                  imageArray.forEach(function(element){
                  var canvas = document.createElement('canvas');
                  var ctx = canvas.getContext("2d");
                  var image = new Image();

                  image.onload = function () {

                      // set size proportional to image
                      canvas.height = 95;
                      canvas.width = 100;

                      // step 1 - resize to 50%
                      var oc = document.createElement('canvas'),
                          octx = oc.getContext('2d');

                      oc.width = image.width;
                      oc.height = image.height;
                      octx.drawImage(image, 0, 0, oc.width, oc.height);

                      // step 2
                      octx.drawImage(oc, 0, 0, oc.width, oc.height);

                      // step 3, resize to final size
                      ctx.drawImage(oc, 0, 0, oc.width, oc.height,
                      0, 0, canvas.width, canvas.height);
                  }
                  image.src = "/gallery/" + element; //getting the file paths
                  var imageCard = document.getElementById("#{neume.id}");//getting
                  imageCard.appendChild(canvas);
                  canvas.appendChild(image);//the image is appended
                  });


                  var imagePaths = "#{neume.imagePath}";
                  var imageArray = imagePaths.split(',');
                  //console.log(imageArray);
                  imageArray.forEach(function(element) {
                  var canvas = document.createElement('canvas');
                  var ctx = canvas.getContext("2d");
                  var image = new Image();

                  image.onload = function () {

                      // set size proportional to image
                      canvas.height = 60;
                      canvas.width = 60;

                      // step 1 - resize to 50%
                      var oc = document.createElement('canvas'),
                          octx = oc.getContext('2d');

                      oc.width = image.width;
                      oc.height = image.height;
                      octx.drawImage(image, 0, 0, oc.width, oc.height);

                      // step 2
                      octx.drawImage(oc, 0, 0, oc.width, oc.height);

                      // step 3, resize to final size
                      ctx.drawImage(oc, 0, 0, oc.width, oc.height,
                      0, 0, canvas.width, canvas.height);
                  }
                  image.src = "/gallery/" + element; //getting the file paths
                  var imageCard = document.getElementById("#{neume.name}");//getting
                  imageCard.appendChild(canvas);
                  canvas.appendChild(image);//the image is appended
                  });
                    var coll = document.getElementsByClassName("collapsible");
                    var i;

                    for (i = 0; i < coll.length; i++) {
                    coll[i].addEventListener("click", function() {
                    this.classList.toggle("active");
                    var content = this.nextElementSibling;
                    if (content.style.display === "none") {
                    content.style.display = "block";
                    } else {
                    content.style.display = "none";
                    }
                    });
                    }
                    // Get the modal
                  var modal = document.getElementById("myModal");

                  // Get the button that opens the modal
                  var btn = document.getElementById("myBtn");

                  // Get the <span> element that closes the modal
                  var span = document.getElementsByClassName("close")[0];

                  // When the user clicks on the button, open the modal 
                  btn.onclick = function() {
                    modal.style.display = "block";
                  }

                  // When the user clicks on <span> (x), close the modal
                  span.onclick = function() {
                    modal.style.display = "none";
                  }

                  // When the user clicks anywhere outside of the modal, close it
                  window.onclick = function(event) {
                    if (event.target == modal) {
                      modal.style.display = "none";
                    }
                  }
                  $('#on_off').click(function() {

                    $('.FullName [name="email"]').attr('disabled', $(this).is(':checked') ? false : true);
                  });
                  