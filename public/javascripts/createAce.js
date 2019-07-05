$(document).ready(function() {

    // initialize tabs
    $('#tabs').tabs();

    // array containing all the editors we will create
    var editors = [];

    // initialize button listener
    $('#addTab').on('click', function() {

        console.log('add a tab with an ace editor instance');

        var tabsElement = $('#tabs');
        var tabsUlElement = tabsElement.find('ul');

        // the panel id is a timestamp plus a random number from 0 to 10000
        var tabUniqueId = new Date().getTime() + Math.floor(Math.random()*10000);

        // create a navigation bar item for the new panel
        var newTabNavElement = $('<li id="panel_nav_' + tabUniqueId + '"><a href="#panel_' + tabUniqueId + '">' + tabUniqueId + '</a></li>');

        // add the new nav item to the DOM
        tabsUlElement.append(newTabNavElement);

        // create a new panel DOM
        var newTabPanelElement = $('<div id="panel_' + tabUniqueId + '" data-tab-id="' + tabUniqueId + '">New editor ' + tabUniqueId + ': <br/></div>');

        tabsElement.append(newTabPanelElement);

        // refresh the tabs widget
        tabsElement.tabs('refresh');

        var tabIndex = $('#tabs ul li').index($('#panel_nav_' + tabUniqueId));

        console.log('tabIndex: ' + tabIndex);

        // activate the new panel
        tabsElement.tabs('option', 'active', tabIndex);

        // create the editor dom
        var newEditorElement = $('<div id="editor_' + tabUniqueId + '">// some code here</div>');

        newTabPanelElement.append(newEditorElement);

        // initialize the editor in the tab
        var editor = ace.edit('editor_' + tabUniqueId);
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/javascript");

        // set the size of the panel
        newTabPanelElement.width('600');
        newTabPanelElement.height('600');

        // set the size of the editor
        newEditorElement.width('500');
        newEditorElement.height('500');

        // resize the editor
        editor.resize();

        editors.push({ id: tabUniqueId, instance: editor });

        // add an editor/panel close button to the panel dom
        var closeButton = $('<button class="close">close</button>');

        newTabPanelElement.prepend(closeButton);

    });

    $('#tabs').on('click', '.close', function() {

        console.log('close a tab and destroy the ace editor instance');

        console.log($(this).parent());

        var tabUniqueId = $(this).parent().attr('data-tab-id');

        console.log(tabUniqueId);        

        var resultArray = $.grep(editors, function(n,i){
            return n.id === tabUniqueId;
        }, true);

        var editor = resultArray[0].instance;

        // destroy the editor instance
        editor.destroy();

        // remove the panel and panel nav dom
        $('#tabs').find('#panel_nav_' + tabUniqueId).remove();
        $('#tabs').find('#panel_' + tabUniqueId).remove();

    });

});