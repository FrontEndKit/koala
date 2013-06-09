/**
 * main window contextmenu 
 */

"use strict";

var path           = require('path'),
	fs             = require('fs-extra'),
	projectManager = require('./projectManager.js'),
	projectSettings= require('./projectSettings.js'),
	il8n           = require('./il8n.js');

var gui = global.gui,
	$              = global.jQuery,
	document       = global.mainWindow.window.document;

/**
 * folder contextmenu
 */
var folderMenu = new gui.Menu(),
	currentContextFolderId;

folderMenu.append(new gui.MenuItem({
	label: il8n.__('Open Folder'),
	click: function () {
		var src = $('#' + currentContextFolderId).data('src');
		gui.Shell.showItemInFolder(src);
	}
}));
folderMenu.append(new gui.MenuItem({
	label: il8n.__('Rename'),
	click: function () {
		var target = $('#' + currentContextFolderId);
		var oldName = target.text(),
			input = $('<input class="changeName"/>').val(oldName).focus();

		target.html(input);
		input.focus();
		target.trigger('click');
	}
}));

//Project Settings
var projectSettingsMenu = new gui.MenuItem({label: il8n.__('Project Settings')});

//Create a project settings file 
var createSettingsMenu = new gui.MenuItem({label: il8n.__('Create')});
var createSubmenu = new gui.Menu();
	createSubmenu.append(new gui.MenuItem({
		label: 'Sass',
		click: function () {
			// Sass project
			projectSettings.create('sass', $('#' + currentContextFolderId).data('src'), function (settingsFilePath) {
				// edit
				console.log(settingsFilePath)
			});
		}
	}));
	createSubmenu.append(new gui.MenuItem({
		label: 'LESS',
		click: function () {
			// TODO
		}
	}));
	createSubmenu.append(new gui.MenuItem({
		label: 'CoffeeScript',
		click: function () {
			// TODO
		}
	}));

	createSettingsMenu.submenu = createSubmenu;

var projectSubmenu = new gui.Menu();
	projectSubmenu.append(createSettingsMenu);
	projectSubmenu.append(new gui.MenuItem({
		label: il8n.__('Edit'),
		click: function () {
			// TODO
		}
	}));
	projectSettingsMenu.submenu = projectSubmenu;

folderMenu.append(projectSettingsMenu);

folderMenu.append(new gui.MenuItem({type: 'separator'}));
folderMenu.append(new gui.MenuItem({
	label: il8n.__('Reload'),
	click: function () {
		var loading = $.koalaui.loading();
		projectManager.reloadProject(currentContextFolderId, function () {
			$('#filelist').html('');
			$('#' + currentContextFolderId).removeClass('active').trigger('click');
			loading.hide();
			$.koalaui.tooltip('Success');
		});
	}
}));

folderMenu.append(new gui.MenuItem({type: 'separator'}));
folderMenu.append(new gui.MenuItem({
	label: il8n.__('Delete'),
	click: function () {
		$('#folders').trigger('deleteItem',[currentContextFolderId]);
	}
}));

//bind folders  contextmenu  event 
$(document).on('contextmenu', '#folders li', function (e) {
	currentContextFolderId = $(this).data('id');
	folderMenu.popup(e.pageX, e.pageY);
	return false;
});

/**
 * single selected file item contextmenu
 */
var fileMenuOfSingle = new gui.Menu(),
	currentContextFileId;

//Open The File With Default Edit App
fileMenuOfSingle.append(new gui.MenuItem({
	label: il8n.__('Open File'),
	click: function () {
		var src = $('#' + currentContextFileId).data('src');
		gui.Shell.openItem(src);
	}
}));

//Open Containing Folder
fileMenuOfSingle.append(new gui.MenuItem({
	label: il8n.__('Open Containing Folder'),
	click: function () {
		var src = $('#' + currentContextFileId).data('src');
		gui.Shell.showItemInFolder(src);
	}
}));

//Open Output Folder
fileMenuOfSingle.append(new gui.MenuItem({
	label: il8n.__('Open Output Folder'),
	click: function () {
		var dir = $('#folders .active').data('src'),
			name = $('#' + currentContextFileId).find('.output span').text();

		var src = path.resolve(dir, name);
		if (fs.existsSync(src)) {
			gui.Shell.showItemInFolder(src);
		} else {
			gui.Shell.showItemInFolder(path.dirname(src));
		}
	}
}));

//Set Output Path
fileMenuOfSingle.append(new gui.MenuItem({
	label: il8n.__('Set Output Path'),
	click: function () {
		$('#' + currentContextFileId).trigger('setOutputPath');
	}
}));

//compile File Item  
fileMenuOfSingle.append(new gui.MenuItem({type: 'separator'}));
fileMenuOfSingle.append(new gui.MenuItem({
	label: il8n.__('Compile'),
	click: function () {
		$('#' + currentContextFileId).trigger('compile')
	}
}));

//Delete File Item
fileMenuOfSingle.append(new gui.MenuItem({type: 'separator'}));
fileMenuOfSingle.append(new gui.MenuItem({
	label: il8n.__('Delete'),
	click: function () {
		$('#' + currentContextFileId).trigger('removeFileItem')
	}
}));


/**
 * Multiple selected file item contextmenu
 */
var fileMenuOfMultiple = new gui.Menu();
fileMenuOfMultiple.append(new gui.MenuItem({
	label: il8n.__('Set Output Path'),
	click: function () {
		$('#' + currentContextFileId).trigger('setOutputPath');
	}
}));
fileMenuOfMultiple.append(new gui.MenuItem({type: 'separator'}));
fileMenuOfMultiple.append(new gui.MenuItem({
	label: il8n.__('Compile'),
	click: function () {
		$('#' + currentContextFileId).trigger('compile')
	}
}));
fileMenuOfMultiple.append(new gui.MenuItem({type: 'separator'}));
fileMenuOfMultiple.append(new gui.MenuItem({
	label: il8n.__('Delete'),
	click: function () {
		$('#' + currentContextFileId).trigger('removeFileItem')
	}
}));

//bind folders  contextmenu  event 
$(document).on('contextmenu', '#filelist li' ,function (e) {
	currentContextFileId = $(this).data('id');
	
	if ($('#filelist li.ui-selected').length <= 1) {
		$('#filelist li.ui-selected').removeClass('ui-selected');
		$(this).addClass('ui-selected');
		fileMenuOfSingle.popup(e.pageX, e.pageY);
	} else {
		fileMenuOfMultiple.popup(e.pageX, e.pageY);
	}
	return false;
});