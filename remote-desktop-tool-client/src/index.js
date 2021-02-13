// LIBRARIES
const { app, ipcMain, BrowserWindow } = require('electron');
const robot = require("robotjs");
const path = require('path');

// Controls the client based on control events received from viewer
ipcMain.on('mouse-move', (event, { x, y }) => {
    try {
      robot.moveMouse(x, y);
    } catch (error) {
      console.log(error);
    }
});

ipcMain.on('mouse-click', (event, {}) => {
    try {
      robot.mouseClick();
    } catch (error) {
      console.log(error);
    }
});

ipcMain.on('type', (event, key) => {
    try {
      robot.keyTap(key.toLowerCase());
    } catch (error) {
      console.log(error);
    }
});

// Creates a browser window where streaming functions run
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences:{
      nodeIntegration:true,
      contextIsolation: false
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'main.html'));
  // Makes the window "invisible"
  mainWindow.setOpacity(0);
  mainWindow.setSkipTaskbar(true);
  // mainWindow.webContents.openDevTools();
};

// Runs createWindow function when app is ready
app.on('ready', () => {
    createWindow();
});

// Quits the app if all windows were closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Creates a window if it has not been create it when app starts
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
