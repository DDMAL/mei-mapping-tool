// function initializeModal(modalID, buttonID) {
//     //Modal id not getting the information
//     // Get the modal element
//     var modal = document.getElementById(modalID);
//
//     // Get the button that opens the modal
//     var btn = document.getElementById(buttonID);
//
//     // Get the <span> element that closes the modal
//     var span = document.getElementById("closingModal");
//     var noButton = document.getElementById("NoButton#{collaborator._id}");
//
//     // When the user clicks on the button, open the modal
//     btn.addEventListener('click', function() {
//         modal.style.display = "block";
//     });
//
//     // When the user clicks on <span> (x), close the modal
//
//
//     // When the user clicks anywhere outside of the modal, close it
//     window.addEventListener('click', function(event) {
//         if (event.target == modal) {
//             modal.style.display = "none";
//         }
//     });
// }

$('#imageCSVButton').on('click', function() {
  console.log('bruh');
  $('#imageCSV').css({'display': 'block'});
})

$(window).on('click', function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
});
