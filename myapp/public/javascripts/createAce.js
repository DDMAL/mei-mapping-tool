function createAceEditor() {

    // array containing all the editors we will create
    var editors = [];

    // initialize button listener
    btn.on('click', function() {


        // the panel id is a timestamp plus a random number from 0 to 10000
        var tabUniqueId = new Date().getTime() + Math.floor(Math.random()*10000);

        // create the editor dom
        var newEditorElement = $('<div id="editor_' + tabUniqueId + '">// some code here</div>');

        document.body.append(newEditorElement);

        // initialize the editor in the tab
        var editor = ace.edit('editor_' + tabUniqueId);
        editor.setTheme("ace/theme/eclipse");
        editor.getSession().setMode("ace/mode/javascript");

        // set the size of the panel
        newTabPanelElement.width('600');
        newTabPanelElement.height('600');

        // set the size of the editor
        newEditorElement.width('500');
        newEditorElement.height('500');

    });

});