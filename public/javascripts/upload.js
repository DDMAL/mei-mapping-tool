 function show_link(link){
    document.getElementById('hide').style.display = 'block';
    var image_list = document.getElementById("image_list");
    var aTag = document.createElement('a');
    aTag.setAttribute('href', link);
    aTag.innerHTML = link;
    image_list.appendChild(aTag);
    var lineBreak = document.createElement('br');
    image_list.appendChild(lineBreak);
  }

  function hide_link(){
    document.getElementById('hide').style.display = 'none';
  }

  function saveToDB(id, link){

        var http = new XMLHttpRequest();
        var url = "/image";
        var params= {
            "id" : id,
            "link" : link
        }

        http.open("POST", url, true);
        //Send the proper header information along with the request
        http.setRequestHeader("Content-type", "application/json");
        http.send(JSON.stringify(params));
  }

  Dropzone.options.myId = {
    init: function() {
      this.on("success", function(file, res) {
        console.log(file);
        show_link(res.data.link)
        saveToDB(res.data.id, res.data.link);
      });

      this.on("reset", function(){
        hide_link();
      });
    },
    paramName: "image",
    url : "https://api.imgur.com/3/upload",
    addRemoveLinks: true,
    headers: { "Authorization" : "Client-ID 3d0295885297563",  "Cache-Control": null, "X-Requested-With": null} 
  };