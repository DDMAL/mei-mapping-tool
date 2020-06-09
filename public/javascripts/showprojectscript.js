console.log(neume);

var imagePaths = neume.imagePaths;
var canvas = document.createElement('canvas');
var ctx = canvas.getContext("2d");
var image = new Image();
var imageCard = document.getElementById(neume._id); //getting
imageCard.appendChild(canvas);

/*Function to create a canvas for each image inside of the imagepath array of the neume
@param element : single imagepath of the array*/
var imagesBinary = neume.imagesBinary;
//console.log(imageArray);
imagesBinary.forEach(function(element) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
    canvas.className += "resize";
    var image = new Image();

    image.onload = function() {

        // set size proportional to image
        canvas.height = image.height * 0.5;
        canvas.width = image.width * 0.5;

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
    image.src = "data:image/png;base64," + element; //getting the file paths
    var imageCard = document.getElementById("image" + neume._id); //getting
    imageCard.appendChild(canvas);
    canvas.appendChild(image); //the image is appended
});

/*On click function of the collapsible buttons. It makes the immediate children of the collapsible 
appear if the collapsible button is clicked.*/

var coll = document.getElementById("collapsible" + neume._id);
coll.addEventListener("click", function() {

    var deleteButtonCollapse = document.getElementById("deleteNeumeButton" + neume._id);

    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "none") {
        $.cookie(this.id, "true")
        console.log($.cookie(this.id))

        content.style.display = "block";

        deleteButtonCollapse.style.display = "block"
    } else {
        $.cookie(this.id, "false")
        console.log($.cookie(this.id))
        content.style.display = "none";
        deleteButtonCollapse.style.display = "none";
    }

});

//To save the collapsible state of the neumes
var content = document.getElementById("collapsible" + neume._id).nextElementSibling;
content.style.display = "block";
$(document).ready(function() {
    var deleteButtonCollapse = document.getElementById("deleteNeumeButton" + neume._id);
    var element = "collapsible" + neume._id;
    var content = document.getElementById("collapsible" + neume._id).nextElementSibling;
    if ($.cookie(element) == "false") {

        content.style.display = "none";

        deleteButtonCollapse.style.display = "none"
    } else {
        content.style.display = "block";

        deleteButtonCollapse.style.display = "block"
    }
})

document.getElementById("NoButton" + neume._id).onclick = function() {
    document.getElementById("DeleteModal" + neume._id).style.display = 'none';
};

//Function for the collapse all button
function collapseAll() {
    var elements = document.getElementsByClassName("paddingCollapsible");
    console.log(elements)
    for (var x = 0; x < elements.length; x++) {
        var content = elements[x].nextElementSibling;
        if (content.style.display === "none") {
            document.getElementById("compress").style.display = "block";
            $.cookie(elements[x].id, "true");
            document.getElementById("expand").style.display = "none";
            content.style.display = "block";
        } else {
            content.style.display = "none";
            $.cookie(elements[x].id, "false");
            document.getElementById("expand").style.display = "block";
            document.getElementById("compress").style.display = "none";
        }

    }
    var deleteButtonCollapse = document.getElementsByClassName("button3");
    console.log(elements)
    for (var x = 0; x < deleteButtonCollapse.length; x++) {
        var content = deleteButtonCollapse[x];
        if (content.style.display === "none") {
            content.style.display = "block";
        } else {
            content.style.display = "none";
        }
    }

}

//Modals event listeners for every modal
window.addEventListener('load', function() {
    initializeModal('myModal', 'myBtn');
    initializeModal('DeleteModal' + neume._id, 'deleteNeumeButton' + neume._id);
    initializeModal('modalSection', 'modalSectionButton');
    initializeModal("editImages" + neume._id, "editImagesButton" + neume._id);
    initializeModal('modalSection', 'sectionButton');
    initializeModal('uploadCSV', 'uploadCSVButton');
    initializeModal('imageCSV', 'imageCSVButton');
});

//Modals event listeners for every modal
window.addEventListener('load', function() {
    initializeModal('myModal', 'myBtn');
    initializeModal('editImages' + neume._id, 'editImagesButton' + neume._id);
});
$(document).scroll(function() {
    var y = $(document).scrollTop(), //get page y value 
        header = $(".row");
    roundedCorners = $(".roundedCorners");

    if (y >= 50) {
        header.css({ position: "fixed", "top": "57px" });

    } else {
        header.css({ position: "fixed", "top": "165px" });
    }
});


//Function to get collapsibles sorted
$(function() {
    t1 = window.performance.now()
    //$("#sortable1").sortable().disableSelection();
    // $("#sortable1").sortable().enableSelection();

    //Everytime a neume is added or deleted, the drop array needs to be updated too!

    var $sortable1 = $("#sortable1").sortable({
        axis: 'y',
        handle: 'button',
        over: function(event) {
            console.log("hovered!");
            //We need to create the rectangle element
            var myDroppable = event.target; //This is the element where it's being dropped
        },
        out: function() {
            //Delete the rectangle element
        },
        //On load page, get the position of the neume
        //On stop sorting, set the position of the neume as the new index.
        //Send this on update button.
        update: function(event, ui) {
            document.getElementById("buttonSavePosition").disabled = false;
            var changedList = this.id;
            var order = $(this).sortable('toArray');
            var positionArray = [];
            order.forEach(function(element) {
                positionArray.push(element);
            })
            var positions = order.join(';');
            console.log({
                id: changedList,
                positions: positions
            });

            document.getElementById("inputPosition" + neume._id).value = positionArray;
        },
        stop: function(event, ui) {
            var data = $(this).sortable('serialize');
            console.log(data);
        },
        cancel: 'input,textarea,select,option',
        connectWith: ".ui-state-default",
        items: ".sorting-initialize"

    });
    $sortable1.find(".ui-state-default").one("mouseenter", function() {
        $(this).addClass("sorting-initialize");
        $sortable1.sortable('refresh');
    });

    t2 = window.performance.now()
    console.log(t2 - t1)
});
var height = " ";
$(".ui-state-default").droppable({
    over: function(event, ui) {}, //This worked!
    out: function(event, ui) {
        event.target.style.border = "none";
        var id = ui.draggable.attr("id");
    },
    drop: function(event, ui) {
        var id = ui.draggable.attr("id"); //This is the element we have. 
    },
    greedy: true,
    hoverClass: 'highlight'
});
//Get toggle value : 
console.log(document.getElementById("toggle" + neume._id).value);
if (document.getElementById("toggle" + neume._id).value == "Yes") {
    document.getElementById("toggle" + neume._id).checked = true;
}
//submits the position of the neumes on click of the button
function buttonSaveLoad() {
    document.getElementById("position" + neume._id).submit();
}

// When the draggable p element enters the droptarget, change the DIVS's border style
document.addEventListener("dragenter", function(event) {
    if (event.target.className == "droptarget") {
        event.target.style.border = "3px dotted red";
    }
});
document.getElementById("editButton").onclick = function() {
    document.getElementsByClassName("editing").style.display = "block";
};

//Array for the position of elements from the database. split into the drop
 + neume._id//Values of div and changing their positions by appending them depending on the order in the database.
//(The string is already ordered in the database from the neume sortable positions)
var array = project.positionArray

array.forEach(function(element) {
    document.getElementById("sortable1").appendChild(document.getElementById(element));
    var elementNeume = document.getElementById(element);
})
var undoValue = "";

function undo() {
    $("#sortable1").sortable('cancel');
    var changedList = this.id;
    var order = $("#sortable1").sortable('toArray');
    var positionArray = [];
    order.forEach(function(element) {
        positionArray.push(element);
    })
    var positions = order.join(';');
    console.log({
        id: changedList,
        positions: positions
    });
    //Change position here

    document.getElementById("inputPosition" + neume._id).value = positionArray;

}