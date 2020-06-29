//Javascript for the undo button :
/*
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * Matthias Jouan wrote this piece of software. 
 * As long as you retain this notice you can do whatever you want with this 
 * stuff. 
 * If we meet some day, and you think this stuff is worth it, you can buy me a 
 * beer in return.
 * ----------------------------------------------------------------------------
 */

'use strict';

function updateButtons(history) {
  $('#undo').attr('disabled',!history.canUndo());
  $('#redo').attr('disabled',!history.canRedo());
}

function setEditorContents(position) {
  //This is where we set the content we want to keep before the undo button
  //We're going to have to store the positions of the sortable elements
  $('#editor').val(contents);
}


$(function(){
  var history = new SimpleUndo({
    maxLength: 200,
    provider: function(done) {
      done($('#editor').val());
    },
    onUpdate: function() {
      //onUpdate is called in constructor, making history undefined
      if (!history) return; 
      
      updateButtons(history);
    }
  });
  
  $('#undo').click(function() {
    history.undo(setEditorContents);
  });

  $('#editor').keypress(function() {
    //This is the action that saves the state of the positions
    //So we'll need to have a save everytime the sortable is on update
    history.save();
  });
  
  updateButtons(history);
});