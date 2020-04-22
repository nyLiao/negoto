'use strict';
const path = require('path');
const child_process = require('child_process')

const {app, BrowserWindow, Menu} = require('electron');
/// const {autoUpdater} = require('electron-updater');
// const {is} = require('electron-util');
const unhandled = require('electron-unhandled');
const debug = require('electron-debug');
const contextMenu = require('electron-context-menu');

const config = require('./js/config');
const menu = require('./js/menu');

unhandled();
debug();
contextMenu();


// Uncomment this before publishing your first version.
// It's commented out as it throws an error if there are no published versions.
// if (!is.development) {
// 	const FOUR_HOURS = 1000 * 60 * 60 * 4;
// 	setInterval(() => {
// 		autoUpdater.checkForUpdates();
// 	}, FOUR_HOURS);
//
// 	autoUpdater.checkForUpdates();
// }

// Window management
let mainWindow;
// Prevent window from being garbage collected
const createMainWindow = async () => {
	const win = new BrowserWindow({
		title: app.name,
		show: false,
		width: 600,
		height: 900,
		'min-width': 200,
	    'min-height': 100,
		// 'title-bar-style': 'hidden',
		webPreferences: {
            nodeIntegration: true
        }
	});

	win.on('ready-to-show', () => {
		win.show();
	});
	win.on('closed', () => {
		// Dereference the window
		// For multiple windows store them in an array
		mainWindow = undefined;
	});
	await win.loadFile(path.join(__dirname, 'index.html'));
	return win;
};

// App management
// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
	app.quit();
}
app.on('second-instance', () => {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}
		mainWindow.show();
	}
});
// app.on('window-all-closed', () => {
// 	if (!is.macos) {
// 		app.quit();
// 	}
// })
app.on('activate', async () => {
	if (!mainWindow) {
		mainWindow = await createMainWindow();
	}
});
(async () => {
	await app.whenReady();
	Menu.setApplicationMenu(menu);
	mainWindow = await createMainWindow();
})()


// Run a python server as child process
var pyProc = null
config.set('serverStarted', false)
config.set('genProgress', -1)

app.on('ready', () => {
	let port = '6161'
	let script = path.join(__dirname, 'python', 'pyServer.py')

	pyProc = child_process.spawn('python', ['-u', script, port])
	if (pyProc != null) {
		console.log('Child process success.')
		pyProc.stdout.on('data', (data) => {
			let dataStr = data.toString()
			if (dataStr.indexOf('started') != -1) {
				config.set('serverStarted', true)
				console.log("Server started. Flag set: " + config.get('serverStarted'))
			}
			else if (dataStr.indexOf('=i') != -1) {
				let val = parseInt(dataStr)
				// electron-store does not work, so choose executeJavaScript()
				// config.set('genProgress', val)
				// console.log("Progress set: " + config.get('genProgress'))
				mainWindow.webContents.executeJavaScript(
					`for (var i = 0; i < document.querySelectorAll(".progress-num").length; i++) {
						document.querySelectorAll(".progress-num")[i].innerHTML = ${val}+"%"}`
					)
				mainWindow.webContents.executeJavaScript(
					`for (var i = 0; i < document.querySelectorAll("progress").length; i++) {
						document.querySelectorAll("progress")[i].value = ${val}}`
					)
			}
			else {
				console.log(dataStr)
			}
		})
		pyProc.stderr.on('data', (data) => {
			console.log('PyProc Error:\n' + data)
		})
	}
	else {
		console.log('Child process failed.')
	}
})
app.on('will-quit', () => {
	pyProc.kill()
	pyProc = null
	console.log('PyProc exited.')
})
