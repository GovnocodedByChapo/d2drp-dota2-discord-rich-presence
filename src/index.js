const { Notification, shell, dialog, app, BrowserWindow, Menu, Tray, ipcMain } = require('electron');
const updateSystem = require('./update.js')
const path = require('path');
if (require('electron-squirrel-startup')) {
    app.quit();
}

let appIcon = null
const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 500,
        height: 470,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
        },
        resizable: false,
        icon: './icon.png',
        skipTaskbar: true
    });

    ipcMain.on('reloadWindow', (event) => {
        mainWindow.reload()
    })
    //new Notification({ title: 'D2DRP - Dota2 Discord Rich Presence (by chapo)', message: 'Ready, wait for dota 2.' }).show()
    dialog.showMessageBox(mainWindow, {title: 'D2DRP - Dota2 Discord Rich Presence (by chapo)', message: 'Ready, waiting for dota 2.\n\n(app will hide in tray)'});
    mainWindow.minimize()
    mainWindow.setMenu(null)
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    //mainWindow.webContents.openDevTools();
    app.whenReady().then(() => {
        let iconPath = path.join(__dirname, 'icon.png');
        appIcon = new Tray(iconPath)
        appIcon.on('click', () => { 
            mainWindow.show() 
        })
    })
    checkVersion()
};

const checkVersion = async() => {
    const update = await updateSystem.checkForUpdates();
    if (update) {
        const dialogResponse = await dialog.showMessageBox({
            title: 'D2DRP - update available',
            type: 'question',
            buttons: ['Download new version', 'No, thanks'],
            message: `Update available!\nCurrent version: ${updateSystem.VERSION}\nLast: ${update.last}\n\nChange log:\n${update.changelog ?? 'no changes found'}`
        })
        if (await dialogResponse.response == 0) {
            shell.openExternal(update.url ?? 'WTF, URL NOT FOUND')
        }
    }
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
