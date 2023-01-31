import { app, BrowserWindow, ipcMain, session, autoUpdater } from "electron";
import { join } from "path";
import os from "os";

var platform = os.platform() + "_" + os.arch();
var version = "0.1.0";

console.log(platform, version);

autoUpdater.setFeedURL({
  url: `http://localhost:8081/update/flavor/default/${platform}/${version}/stable`,
});

autoUpdater.checkForUpdates();

autoUpdater.on("error", (err) => {
  console.log("autoUpdater error", err);
});
autoUpdater.on("checking-for-update", () => {
  console.log("autoUpdater checking-for-update");
});
autoUpdater.on("update-available", () => {
  console.log("autoUpdater update-available");
});
autoUpdater.on("update-not-available", () => {
  console.log("autoUpdater update-not-available");
});
autoUpdater.on("update-downloaded", () => {
  console.log("autoUpdater update-downloaded");
  autoUpdater.quitAndInstall();
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === "development") {
    const rendererPort = process.argv[2];
    mainWindow.loadURL(`http://localhost:${rendererPort}`);
  } else {
    mainWindow.loadFile(join(app.getAppPath(), "renderer", "index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": ["script-src 'self'"],
      },
    });
  });

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("message", (event, message) => {
  console.log(message);
});
