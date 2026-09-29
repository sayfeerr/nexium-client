const { app, BrowserWindow, protocol, session, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { ElectronBlocker } = require("@ghostery/adblocker-electron");
const fetch = require("cross-fetch");
const betterWebRequest = require("electron-better-web-request");

app.commandLine.appendSwitch("disable-blink-features", "AutomationControlled");
protocol.registerSchemesAsPrivileged([{ scheme: "custom", privileges: { secure: true, standard: true, supportFetchAPI: true } }]);

const baseDir = app.isPackaged 
    ? process.resourcesPath 
    : path.resolve(__dirname, "../../");

function asegurarDirectorios() {
    try {
        const swapDir = path.join(baseDir, "swap");
        if (!fs.existsSync(swapDir)) {
            fs.mkdirSync(swapDir, { recursive: true });
        }
        const categorias = ["ar", "awp", "smg", "shotgun"];
        categorias.forEach(cat => {
            const catPath = path.join(swapDir, "weapons", cat);
            if (!fs.existsSync(catPath)) {
                fs.mkdirSync(catPath, { recursive: true });
            }
        });
        const promoPath = path.join(swapDir, "promo");
        if (!fs.existsSync(promoPath)) {
            fs.mkdirSync(promoPath, { recursive: true });
        }
    } catch (e) {}
}

ipcMain.handle("get-swap-files", () => {
    try {
        asegurarDirectorios();
        const swapDir = path.join(baseDir, "swap");
        if (!fs.existsSync(swapDir)) { 
            return []; 
        }
        
        const filesList = [];
        const items = fs.readdirSync(swapDir, { withFileTypes: true });
        for (const item of items) {
            const itemPath = path.join(swapDir, item.name);
            if (item.isDirectory()) {
                const subItems = fs.readdirSync(itemPath, { withFileTypes: true });
                for (const subItem of subItems) {
                    const subItemPath = path.join(itemPath, subItem.name);
                    if (subItem.isDirectory()) {
                        const weaponFiles = fs.readdirSync(subItemPath, { withFileTypes: true });
                        for (const wf of weaponFiles) {
                            if (wf.isFile()) {
                                filesList.push({ category: `${item.name}/${subItem.name}`, name: wf.name });
                            }
                        }
                    } else if (subItem.isFile()) {
                        filesList.push({ category: item.name, name: subItem.name });
                    }
                }
            }
        }
        return filesList;
    } catch (err) { 
        console.error("Error al listar los ficheros del swapper:", err);
        return []; 
    }
});

ipcMain.handle("save-weapon-skin", async (event, { subfolder, fileName, base64Data }) => {
    try {
        const targetDir = path.join(baseDir, "swap", subfolder);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const targetPath = path.join(targetDir, fileName);

        if (fs.existsSync(targetPath)) {
            try { fs.unlinkSync(targetPath); } catch (e) {}
        }

        const base64Image = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
        const buffer = Buffer.from(base64Image, "base64");
        fs.writeFileSync(targetPath, buffer);

        return { success: true };
    } catch (err) {
        console.error("Error al guardar la skin:", err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle("delete-swap-file", async (event, { category, fileName }) => {
    try {
        let destPath = path.join(baseDir, "swap", category, fileName);
        if (fs.existsSync(destPath)) {
            fs.unlinkSync(destPath);
            return { success: true };
        }
        
        const found = findFileRecursive(path.join(baseDir, "swap"), fileName);
        if (found && fs.existsSync(found)) {
            fs.unlinkSync(found);
            return { success: true };
        }
        return { success: false };
    } catch (err) { 
        console.error("Error al borrar el archivo:", err);
        return { success: false }; 
    }
});

ipcMain.handle("reiniciar-cliente", () => {
    app.relaunch();
    app.exit(0);
});

function findFileRecursive(dir, targetName) {
    if (!fs.existsSync(dir)) return null;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isFile() && entry.name === targetName) return fullPath;
        if (entry.isDirectory()) {
            const result = findFileRecursive(fullPath, targetName);
            if (result) return result;
        }
    }
    return null;
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1280, height: 800, title: "Nexium Client", frame: false, backgroundColor: "#0c0c0c",
        webPreferences: { 
            preload: path.join(__dirname, "../preload/index.js"), 
            nodeIntegration: false, 
            contextIsolation: true, 
            sandbox: false 
        }
    });

    win.setMenuBarVisibility(false);
    win.webContents.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36");
    
    try {
        ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then(blocker => {
            blocker.enableBlockingInSession(session.defaultSession);
        }).catch(() => {});
    } catch (e) {}

    win.loadURL("https://deadshot.io");
    return win;
}

app.whenReady().then(() => {
    asegurarDirectorios();
    betterWebRequest.default(session.defaultSession);
    
    session.defaultSession.webRequest.setResolver("onBeforeRequest", async (listeners) => {
        let finalResponse = { cancel: false };
        for (const listener of listeners) {
            const result = await listener.apply();
            finalResponse = { ...finalResponse, ...result };
        }
        return finalResponse;
    });

    protocol.handle("custom", async (req) => {
        const relativePath = req.url.slice(9);
        const localPath = path.join(baseDir, "swap", relativePath);
        try {
            const fileData = await fs.promises.readFile(localPath);
            return new Response(fileData, { headers: { "Content-Type": "image/webp" } });
        } catch (err) { return new Response("Not Found", { status: 404 }); }
    });

    const resourceFilter = { urls: ["*://deadshot.io/weapons/*", "*://deadshot.io/skins/*", "*://deadshot.io/promo/*", "*://deadshot.io/textures/*"] };
    
    session.defaultSession.webRequest.onBeforeRequest(resourceFilter, (reqDetails, next) => {
        const fileName = path.basename(new URL(reqDetails.url).pathname);
        const swapRoot = path.join(baseDir, "swap");
        let foundFile = null;
        if (fs.existsSync(swapRoot)) foundFile = findFileRecursive(swapRoot, fileName);
        
        if (foundFile) {
            const relative = path.relative(swapRoot, foundFile);
            next({ redirectURL: "custom://" + relative.replace(/\\/g, "/") });
        } else {
            next({ cancel: false });
        }
    });

    createWindow();
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });