var url = window.location.href;
var urlDOM = document.getElementById("URL").innerHTML = url;
var array = urlDOM.split("/");
var projectID = array[4];
console.log(projectID);
document.getElementById("inputID").value = projectID;
document.getElementById("inputID").style.visibility = "hidden";