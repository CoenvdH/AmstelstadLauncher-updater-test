const {
  app,
  BrowserWindow
} = require('electron');
const ipc = require('electron').ipcMain

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent(app)) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

const nativeImage = require('electron').nativeImage;
var image = nativeImage.createFromPath(__dirname + '/icon.ico');

// Modules to control application life and create native browser window
const path = require('path');
const {
  timeStamp
} = require('console');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 800,
    icon: image,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.setMenuBarVisibility(false)

  mainWindow.webContents.on('new-window', function (e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });

  mainWindow.webContents.on("devtools-opened", () => { mainWindow.webContents.closeDevTools(); });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()
})


// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

var currPlayers = 0;
var maxPlayers = 0;
var queue = 0;
var request = require('request');

function fetchInfo() {
  return new Promise(resolve => {
    request('test', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body)
        console.log(info);
        currPlayers = info.clients
        maxPlayers = info.sv_maxclients
        resolve(currPlayers + " / " + maxPlayers);
      }
    })
  })
}

function fetchInfo2() {
  return new Promise(resolve => {
    request('test', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body)
        console.log(info);
        queue = info.count
        console.log("YEETER " + queue);
        resolve(queue)
      }
    })
  })
}
// fetchInfo2();

async function runFetch() {
  var result = await fetchInfo()
  var result2 = await fetchInfo2()
  console.log("OUTPUT2 " + result + " " + result2)
}

ipc.on('synchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  runFetch()
  setTimeout(() => {
    // event.returnValue = currPlayers + " / " + maxPlayers + " ( " + queue + " )"
    event.returnValue = {"currentPlayers": currPlayers, "maximumPlayers": maxPlayers, "currentQueue": queue}
  }, 200);
})

function handleSquirrelEvent(application) {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function (command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {
        detached: true
      });
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function (args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(application.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(application.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      application.quit();
      return true;
  }
};