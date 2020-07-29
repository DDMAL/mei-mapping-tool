//Function for the collapse all button
function collapseAll() {
    var elements = document.getElementsByClassName("paddingCollapsible");
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
    for (var x = 0; x < deleteButtonCollapse.length; x++) {
        var content = deleteButtonCollapse[x];
        if (content.style.display === "none") {
            content.style.display = "block";
        } else {
            content.style.display = "none";
        }
    }
}

function initNeume(neume, project, owned) {

    var imagePaths = neume.imagePaths;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
    var image = new Image();
    var imageCard = document.getElementById(neume._id); //getting
    imageCard.appendChild(canvas);

    /*Function to create a canvas for each image inside of the imagepath array of the neume
    @param element : single imagepath of the array*/
    var imagesBinary = neume.imagesBinary;
    // only append two images to the front page to reduce space
    // if there are more than 2 indicate that
    if (imagesBinary.length > 2) {
        console.log(neume._id);
        $('#editImagesButton' + neume._id).html('Edit/See all');
    }
    imagesBinary.slice(0,2).forEach(function(element) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext("2d");
        canvas.className += "resize";
        var image = new Image();

        image.onload = function() {

            // set size proportional to image
            canvas.height = image.height * 0.4;
            canvas.width = image.width * 0.4;

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

            content.style.display = "block";

            deleteButtonCollapse.style.display = "block"
        } else {
            $.cookie(this.id, "false")
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
    });

    if (owned) {
       document.getElementById("NoButton" + neume._id).onclick = function() {
           document.getElementById("DeleteModal" + neume._id).style.display = 'none';
       }; 
    }  

    $(document).scroll(function() {
        var y = $(document).scrollTop(), //get page y value 
            header = $(".row");
        roundedCorners = $(".roundedCorners");

        header.css({ position: "fixed", "top": "120px" });
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

                document.getElementById("inputPosition" + neume._id).value = positionArray;
            },
            stop: function(event, ui) {
                var data = $(this).sortable('serialize');
            },
            cancel: 'input,textarea,select,option',
            connectWith: ".ui-state-default",
            items: ".sorting-initialize"

        });
        $sortable1.find(".ui-state-default").one("mouseenter", function() {
            $(this).addClass("sorting-initialize");
            $sortable1.sortable('refresh');
        });

        t2 = window.performance.now();
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
    if (document.getElementById("toggle" + neume._id).value == "Yes") {
        document.getElementById("toggle" + neume._id).checked = true;
    }

    // When the draggable p element enters the droptarget, change the DIVS's border style
    document.addEventListener("dragenter", function(event) {
        if (event.target.className == "droptarget") {
            event.target.style.border = "3px dotted red";
        }
    });

    /*
    document.getElementById("editButton").onclick = function() {
        document.getElementsByClassName("editing").style.display = "block";
    };
    */

    //Array for the position of elements from the database. split into the drop
    //Values of div and changing their positions by appending them depending on the order in the database.
    //(The string is already ordered in the database from the neume sortable positions)
    var array = project.positionArray;

    array.forEach(function(element) {
        document.getElementById("sortable1").appendChild(document.getElementById(element));
        var elementNeume = document.getElementById(element);
    });
    var undoValue = "";
    if (!owned) {
        var x = document.getElementById('editImagesButton' + neume._id);
        x.style.display = "none";
    }
}

//submits the position of the neumes on click of the button
function buttonSaveLoad() {
    document.getElementById("position" + neume._id).submit();
}

function undo() {
    $("#sortable1").sortable('cancel');
    var changedList = this.id;
    var order = $("#sortable1").sortable('toArray');
    var positionArray = [];
    order.forEach(function(element) {
        positionArray.push(element);
    })
    var positions = order.join(';');
    //Change position here

    document.getElementById("inputPosition" + neume._id).value = positionArray;

}

function initSection(section) {
    document.getElementById("NoButton" + section._id).onclick = function() {
        document.getElementById("DeleteModal" + section._id).style.display = 'none';
    };
    window.addEventListener('load', function() {
        initializeModal('DeleteModal' + section._id, 'deleteNeumeButton' + section._id);
    });
    var idSection = document.getElementById("section" + section._id)
    $(idSection).sortable({
        connectWith: '.ui-state-default',
        helper: 'clone',
        handle: 'button',
        cancel: 'input,textarea,select,option, .deleteSection',
        update: function(event, ui) {
            var changedList = this.id;
            var order = $(idSection).sortable('toArray');
            var positionArray = [];
            order.forEach(function(element) {
                var neumeid = element.replace(/^\D+/g, '');
                if (neumeid == "") { console.log("null") } else { positionArray.push(neumeid); }
            })
            var positions = positionArray.join(';');
            $.cookie('sortOrder' + this.id, positions);
            console.log($.cookie('sortOrder' + this.id))
        }
    });
    $(idSection).droppable({

        //On out, the name of the section of the neume is "";
        //On out, the section neumeIDs array pulls the neumeID
        out: function(event, ui) {
            var id = ui.draggable.attr("id");
        },



        drop: function(event, ui) {
            var id = ui.draggable.attr("id"); //This is the element we have. 

            //On drop, the name of the section of the neume is #{section.name}
            var neume = document.getElementById(id);

            var neumeID = id.replace(/^\D+/g, ''); // replace all leading non-digits with nothing, which gives us the id of the neume we are adding to the section

            /////Value for the inputs added to the arrays
            //On drop, the section neumeIDs array gets added the neumeID
            neumeArray.push(neumeID);

            document.getElementById("inputArraySection" + section._id).value = neumeArray; //This needs to be defined


            //Get that element on drop and put it as the section Id
            var IdOfTarget = "" + section._id
            var IDWithSectionName = IdOfTarget;

            //classOfTarget is the Id of the section
            document.getElementById("sectionID" + section._id).value = IdOfTarget; //This needs to be defined
            document.getElementById("buttonSection" + section._id).disabled = false;

            //Show the section id (the class target) and the neumeArray linked to it.

            //Should probably also use the cookie for the neume position on sort.
        },
        greedy: true,
        hoverClass: 'highlight'
    });

    //Appending the neumes to the sections : 
    //Get the #{section.neumeIDs}
    //For each element separated by a comma, append the child to the element #{section._id}, this is the p of the element

    var neumesInSection = section.neumeIDs;
    if (neumesInSection.length > 0) {
        var neumeArrays = neumesInSection.split(",");
        neumeArrays.forEach(function(neume) {
            try {
                document.getElementById("section" + section._id).appendChild(document.getElementById("drop" + neume));
            } catch (err) {
                console.error(err + 'for: ' + section._id + ' and neume ' + neume);
            }
        })
    }

    if (document.getElementById("sectionID" + section._id).value == "")
        document.getElementById("buttonSection" + section._id).disabled = true;
    else if (document.getElementById("inputArraySection" + section._id).value == "")
        document.getElementById("buttonSection" + section._id).disabled = true;
    else
        document.getElementById("buttonSection" + section._id).disabled = false;

}
