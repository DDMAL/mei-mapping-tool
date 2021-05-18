const socket = io();


//Collapsible function for each neume element
var coll = document.getElementsByClassName("collapsible");
var i;
for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
}

// Get the modal and cloned element
var modal = document.getElementById("projectModal");

// Get the button that opens the modal
var btn = document.getElementById("projectButton");
var buttonSubmit = document.getElementById("submitProject")

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

//Variables for the new button project
var newProject = document.createElement("BUTTON");

// When the user clicks on the button, open the modal
// btn.onclick = function() {
//     modal.style.display = "block";
// }
//On click of the x button, the modal disappears.
// span.onclick = function() {
//     modal.style.display = "none";
// }

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

//Making a test button :
var newProject = document.createElement("BUTTON");
newProject.setAttribute("style", "   background-color: #659abb; border-radius: 10px; /* Green */ border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;");


//name submitted by the person
var section = document.getElementById("section");
newProject.innerText = "Test Project";
section.appendChild(newProject);
newProject.onclick = function() {
    window.location.href = '/meiMapping'
}

// buttonSubmit.onclick = function() {
//     var newProject = document.createElement("BUTTON");
//     newProject.setAttribute("style", "   background-color: #659abb; border-radius: 10px; /* Green */ border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;");
//
//     //Submit button closes pop-up
//     modal.style.display = "none";
//     var name = document.getElementById("elementName").value;
//
//     //name submitted by the person
//     var section = document.getElementById("section");
//     newProject.innerText = name;
//     section.appendChild(newProject);
//     newProject.onclick = function() {
//         window.location.href = '/meiMapping'
//     }
// }

$('.project-wrapper .project-delete-modal input').on('input', function(e) {
  e.preventDefault();
  var project_id = $(this).parent().attr('id').split('_')[1];
  console.log(project_id);
  console.log($(this).val())
  console.log($(`#${project_id}`).find('.project-button')[0].innerText)
  if ($(this).val() == $(`#${project_id}`).find('.project-button')[0].innerText) {
    $(this).next('.finalize-delete-button').addClass('active');
    $(this).next('.finalize-delete-button').attr('rel', 'modal:close');
  } else {
    $(this).next('.finalize-delete-button').removeClass('active');
    $(this).next('.finalize-delete-button').attr('rel', '');
  }
})

$('.project-delete-modal').on('click', '.finalize-delete-button.active', function() {
  var project_id = $(this).parent().attr('id').split('_')[1];
  console.log('ok');
  socket.emit('project delete', project_id);
})
