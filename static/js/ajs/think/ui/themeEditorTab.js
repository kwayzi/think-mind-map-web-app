/**
 * @fileoverview A collection of functions relating to the Theme 'section' of the Thought Options.
 * @requires jQuery libary.
 */


goog.provide('ajs.think.ui.themeEditorTab');
goog.provide('ajs.think.ui.themeEditorTab.ids');
goog.provide('ajs.think.ui.themeEditorTab.ajax');

//TODO: server problems causes by goog script requirements.
//goog.require('goog.color');
//goog.require('goog.dom');
//goog.require('goog.dom.DomHelper');
//goog.require('goog.events');
//goog.require('goog.events.Event');
//goog.require('goog.events.EventHandler');
//goog.require('goog.events.InputHandler');
//goog.require('goog.events.EventType');
//goog.require('goog.ui.Component');
//goog.require('goog.ui.HsvPalette');
//goog.require('goog.style');
//goog.require('goog.userAgent');
goog.require('ajs.utils');
goog.require('ajs.think');;
goog.require('ajs.think.thoughtMenu.globals');
goog.require('ajs.think.thoughtMenu.metaData');
goog.require('ajs.think.ui.thoughtOptions');
goog.require('ajs.think.uri');


// IDs
ajs.think.ui.themeEditorTab.ids.themePreviewThoughtCanvas = 'theme-preview';
ajs.think.ui.themeEditorTab.ids.colorBox = 'colorBox';
ajs.think.ui.themeEditorTab.ids.selectedColorBox = 'selectedColorBox';
ajs.think.ui.themeEditorTab.ids.themeColorPicker = 'colorPicker';

/**
 * Gets the selected color box in the Theme Tab.
 * 
 * @returns {DivElement} the selected color box.
 */
ajs.think.ui.themeEditorTab.getSelectedColorBox = function() {
  var selected = goog.dom.getElementsByTagNameAndClass('div', ajs.think.ui.themeEditorTab.ids.selectedColorBox);
  if (selected.length > 1) {
    throw 'There is more than one selected colour box.';
  } else if (selected.length < 1) {
    return null;
  }
  return selected[0];
}

/**
 * Handles the event generated by the color picker when its value has changed.
 * 
 * @param {Event} e the event.
 */
ajs.think.ui.themeEditorTab.colorChanged = function(e) {
  var theme = ajs.think.thoughtMenu.globals.themeThoughtContext.thought.theme;
  var box = ajs.think.ui.themeEditorTab.getSelectedColorBox();
  if (box != null) {
    theme[ajs.think.thoughtMenu.globals.themeSelectedProperty] = e.target.getColor();
    box.style.background = theme[box.id];
  }
}

/**
 * Handles the Color Box click events.
 * 
 * @param {Event} e the event.
 */
ajs.think.ui.themeEditorTab.colorBoxOnclick = function(e) {
  var box = e.srcElement;
  var selectedBox = ajs.think.ui.themeEditorTab.getSelectedColorBox();
  
  // Unselect current selected color box.
  goog.dom.classes.remove(selectedBox, ajs.think.ui.themeEditorTab.ids.selectedColorBox);
  
  // Set color picker to new color box's color.
  // This block of code must be executed before selecting a new colour box and after delesecting the current one.
  // This is because of an event generated by changing the color of the ColorPicker.
  var selectedColor = ajs.think.thoughtMenu.globals.themeThoughtContext.thought.theme[box.id];
  ajs.think.thoughtMenu.globals.colorPickerHsvPalette.setColor(selectedColor);
  
  // Select new color box.
  ajs.think.thoughtMenu.globals.themeSelectedProperty = box.id;
  goog.dom.classes.add(box, ajs.think.ui.themeEditorTab.ids.selectedColorBox);
}

/**
 * Initialises all the color boxes in the Theme 'part' of the Thought Options.
 */
ajs.think.ui.themeEditorTab.initialiseColorBoxes = function() {
  var colorBoxes = goog.dom.getElementsByTagNameAndClass('div', ajs.think.ui.themeEditorTab.ids.colorBox);
  for (var i=0; i < colorBoxes.length; i++) {
    var box = colorBoxes[i];
    box.style.background = ajs.think.thoughtMenu.globals.themeThoughtContext.thought.theme[box.id];
    box.onclick = ajs.think.ui.themeEditorTab.colorBoxOnclick;
  }
  
  // Set Color to Selected Color Box.
  var selectedBox = ajs.think.ui.themeEditorTab.getSelectedColorBox();
  var selectedColor = ajs.think.thoughtMenu.globals.themeThoughtContext.thought.theme[selectedBox.id];
  ajs.think.thoughtMenu.globals.colorPickerHsvPalette.setColor(selectedColor);
}

/**
 * Initialises the Theme Tab of the Thought Options.
 */
ajs.think.ui.themeEditorTab.initialiseThemeTab = function() {
   $('button').button();
  var canvas = document.getElementById(ajs.think.ui.themeEditorTab.ids.themePreviewThoughtCanvas);
  
  ajs.think.thoughtMenu.globals.themeThoughtContext = ajs.think.thoughtMenu.metaData.getThemePreviewThoughtContext(canvas, ajs.think.ui.themeEditorTab.createTheme());
  ajs.think.thoughtMenu.globals.themeSelectedProperty = ajs.think.thoughtMenu.metaData.defaultSelectedThemeProperty;
    
  ajs.think.thoughtMenu.globals.colorPickerHsvPalette = new goog.ui.HsvPalette(null, null, 'goog-hsv-palette-sm'); 
  
  var colorPickerDiv = document.getElementById(ajs.think.ui.themeEditorTab.ids.themeColorPicker);
  ajs.think.thoughtMenu.globals.colorPickerHsvPalette.render(colorPickerDiv);
    
  goog.events.listen(ajs.think.thoughtMenu.globals.colorPickerHsvPalette, goog.ui.Component.EventType.ACTION, ajs.think.ui.themeEditorTab.colorChanged);
    
  ajs.think.ui.themeEditorTab.initialiseColorBoxes();
  ajs.think.initialiseThoughtContextCanvas(ajs.think.thoughtMenu.globals.themeThoughtContext);

  ajs.think.ui.thoughtOptions.checkThatDialogIsInitialised();
}

/**
 * Creates a new Theme with useful values.
 * 
 * @returns {ajs.think.thought.Theme} a new theme.
 */
ajs.think.ui.themeEditorTab.createTheme = function() {
  return ajs.utils.clone(ajs.think.globals.getTheme());
}

/**
 * Restores the original Theme in the Theme Tab.
 */
ajs.think.ui.themeEditorTab.restoreTheme = function() {
  var theme = ajs.think.globals.thought.theme;
  if (!ajs.utils.isEmptyOrNull(theme.id)) {
    ajs.think.ui.themeEditorTab.ajax._delete(theme, function(response) {
      if (response.success) {
        ajs.think.globals.thought.theme = null;
        // The following line must run after the one above.
        ajs.think.thoughtMenu.globals.themeThoughtContext.thought.theme = ajs.think.ui.themeEditorTab.createTheme();
      } else {
        alert(response.errorMsg);
      }
    });
  }
}

/**
 * Saves the modified Theme in the Theme Tab.
 */
ajs.think.ui.themeEditorTab.saveThoughtAndTheme = function() {  
  var theme = ajs.think.thoughtMenu.globals.themeThoughtContext.thought.theme;
  if (ajs.utils.equals(theme, ajs.think.globals.getTheme())) {
    return null;
  } else {
    if (theme != null) {
      ajs.think.ui.themeEditorTab.ajax.createOrUpdate(theme, function(response) {
        if (response.success) {
          if (!ajs.utils.isEmptyOrNull(response.id)) {
            theme.id = response.id;

            ajs.think.globals.thought.theme = ajs.utils.clone(theme);
            ajs.think.thought.ajax.createOrUpdateThought(ajs.think.globals.thought, function(response) {
              if (response.success) {
                // Nothing.
              } else {
                alert(response.errorMsg);
              }
            });
          } else {
            alert("AJAX response do not contain Theme's new id.");
          }
        } else {
          alert(response.errorMsg);
        }
      });
    }
  }
}

/**
 * Gets the Theme.
 * 
 * @param {ajs.think.thought.Theme} theme the theme to get.
 * @param {function} callback the function that is called back when the AJAX requested is responded to.
 */
ajs.think.ui.themeEditorTab.ajax.get = function(id, callback) {
  ajs.ajax.getRequest(ajs.think.uri.theme, {'id': id}, callback, true);
}

/**
 * Creates or Updates the Theme.
 * 
 * @param {ajs.think.thought.Theme} theme the theme to create/update.
 * @param {function} callback the function that is called back when the AJAX requested is responded to.
 */
ajs.think.ui.themeEditorTab.ajax.createOrUpdate = function(theme, callback) {
  ajs.ajax.putRequest(ajs.think.uri.theme, {'theme': theme}, callback, true);
}

/**
 * Deletes the Theme.
 * 
 * @param {ajs.think.thought.Theme} theme the theme to delete.
 * @param {function} callback the function that is called back when the AJAX requested is responded to.
 */
ajs.think.ui.themeEditorTab.ajax._delete = function(theme, callback) {
  ajs.ajax.deleteRequest(ajs.think.uri.theme, {'id': theme.id}, callback, true);
}
