const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("nexium", {
    getSwapFiles: () => ipcRenderer.invoke("get-swap-files").catch(() => []),
    checkSwapExists: (data) => ipcRenderer.invoke("check-swap-exists", data),
    saveWeaponSkin: (data) => ipcRenderer.invoke("save-weapon-skin", data),
    deleteSwapFile: (data) => ipcRenderer.invoke("delete-swap-file", data),
    reiniciarCliente: () => ipcRenderer.invoke("reiniciar-cliente")
});

let toggleKeys = () => {};
let toggleStats = () => {};
let toggleCrosshair = () => {};
let applyCrosshairSettings = () => {};

try { toggleKeys = require('../modules/keystrokes.js').toggleKeystrokes; } catch (e) {}
try { toggleStats = require('../modules/stats.js').toggleStats; } catch (e) {}
try { 
    const crosshairMod = require('../modules/crosshair.js');
    toggleCrosshair = crosshairMod.toggleCrosshair; 
    applyCrosshairSettings = crosshairMod.applySettings;
} catch (e) {}

const menuData = require('../ui/menu.js');
const menuCss = menuData ? menuData.css : '';
const menuHtml = menuData ? menuData.html : '';

window.addEventListener('DOMContentLoaded', () => {
    if (menuCss) {
        const styleEl = document.createElement('style');
        styleEl.textContent = menuCss;
        document.documentElement.appendChild(styleEl);
    }

    if (menuHtml) {
        const container = document.createElement('div');
        container.innerHTML = menuHtml;
        while (container.firstElementChild) {
            document.body.appendChild(container.firstElementChild);
        }
    }

    const menuEl = document.getElementById('ds-menu');
    if (menuEl) {
        let dragging = false, startX, startY;
        menuEl.addEventListener('mousedown', (e) => {
            if (e.target.closest('.menu-header') || menuEl.classList.contains('minimized')) {
                dragging = true; 
                startX = e.clientX - menuEl.offsetLeft; 
                startY = e.clientY - menuEl.offsetTop; 
                e.preventDefault();
            }
        });
        window.addEventListener('mousemove', (e) => { 
            if (!dragging) return; 
            menuEl.style.left = (e.clientX - startX) + 'px'; 
            menuEl.style.top = (e.clientY - startY) + 'px'; 
        });
        window.addEventListener('mouseup', () => { dragging = false; });
    }

    const minBtn = document.getElementById('btn-min');
    const minLogo = document.getElementById('logo-min');
    if (minBtn && menuEl) {
        minBtn.addEventListener('click', () => menuEl.classList.toggle('minimized'));
    }
    if (minLogo && menuEl) {
        minLogo.addEventListener('click', () => menuEl.classList.remove('minimized'));
    }

    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active')); 
            tabPanes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active'); 
            const pane = document.getElementById(`pane-${btn.dataset.tab}`); 
            if (pane) pane.classList.add('active');
        });
    });

    function applyThemeStyles() {
        const accent = localStorage.getItem('ds_theme_accent') || '#ebf0ff';
        const text = localStorage.getItem('ds_theme_text') || '#ffffff';
        const movement = localStorage.getItem('ds_theme_movement') || '#3b82f6';
        const action = localStorage.getItem('ds_theme_action') || '#ef4444';

        let dynamicStyle = document.getElementById('ds-dynamic-theme');
        if (!dynamicStyle) {
            dynamicStyle = document.createElement('style');
            dynamicStyle.id = 'ds-dynamic-theme';
            document.head.appendChild(dynamicStyle);
        }
        dynamicStyle.textContent = `
            :root {
                --accent-color: ${accent};
                --text-color: ${text};
                --movement-color: ${movement};
                --action-color: ${action};
            }
        `;
    }

    function setupThemeColor(idInput, storageKey) {
        const input = document.getElementById(idInput);
        if (!input) return;
        const savedValue = localStorage.getItem(storageKey);
        if (savedValue) input.value = savedValue;
        input.addEventListener('input', (e) => {
            localStorage.setItem(storageKey, e.target.value);
            applyThemeStyles();
        });
    }

    setupThemeColor('theme-accent', 'ds_theme_accent');
    setupThemeColor('theme-text', 'ds_theme_text');
    setupThemeColor('theme-movement', 'ds_theme_movement');
    setupThemeColor('theme-action', 'ds_theme_action');
    applyThemeStyles();

    const crossType = document.getElementById('cross-type');
    const crossColor = document.getElementById('cross-color');
    const crossSize = document.getElementById('cross-size');
    const crossThick = document.getElementById('cross-thick');

    function syncCrosshairControls() {
        if (crossType) crossType.value = localStorage.getItem('ds_cross_type') || 'cross';
        if (crossColor) crossColor.value = localStorage.getItem('ds_cross_color') || '#ffffff';
        if (crossSize) crossSize.value = localStorage.getItem('ds_cross_size') || '12';
        if (crossThick) crossThick.value = localStorage.getItem('ds_cross_thick') || '2';
    }

    if (crossType) {
        crossType.addEventListener('change', (e) => {
            localStorage.setItem('ds_cross_type', e.target.value);
            applyCrosshairSettings();
        });
    }
    if (crossColor) {
        crossColor.addEventListener('input', (e) => {
            localStorage.setItem('ds_cross_color', e.target.value);
            applyCrosshairSettings();
        });
    }
    if (crossSize) {
        crossSize.addEventListener('input', (e) => {
            localStorage.setItem('ds_cross_size', e.target.value);
            applyCrosshairSettings();
        });
    }
    if (crossThick) {
        crossThick.addEventListener('input', (e) => {
            localStorage.setItem('ds_cross_thick', e.target.value);
            applyCrosshairSettings();
        });
    }

    syncCrosshairControls();
    applyCrosshairSettings();

    async function updateSwapList() {
        const listContainer = document.getElementById('swap-files-list');
        if (!listContainer) return;
        
        try {
            const files = await ipcRenderer.invoke("get-swap-files");
            if (!files || files.length === 0) {
                listContainer.innerHTML = '<div style="font-size:11px; color:#888; text-align:center; padding:4px;">No textures installed.</div>';
                return;
            }

            listContainer.innerHTML = '';
            files.forEach(f => {
                const item = document.createElement('div');
                item.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.06); padding:5px 8px; border-radius:4px; margin-bottom:4px; font-size:11px;";
                item.innerHTML = `<span title="${f.name}"><b>[${f.category}]</b> ${f.name}</span> <button style="background:#ef4444; border:none; color:#fff; border-radius:3px; cursor:pointer; padding:3px 6px; font-size:10px;" data-cat="${f.category}" data-name="${f.name}" class="del-swap-btn">Delete</button>`;
                listContainer.appendChild(item);
            });

            document.querySelectorAll('.del-swap-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const category = e.target.dataset.cat;
                    const fileName = e.target.dataset.name;
                    await ipcRenderer.invoke("delete-swap-file", { category, fileName });
                    updateSwapList();
                });
            });
        } catch (err) {
            listContainer.innerHTML = '<div style="font-size:11px; color:#ef4444;">Error reading textures.</div>';
        }
    }

    const restartModal = document.getElementById('restart-modal');
    const restartAppBtn = document.getElementById('btn-restart-app');
    if (restartAppBtn) {
        restartAppBtn.addEventListener('click', () => {
            ipcRenderer.invoke("reiniciar-cliente");
        });
    }

    const uploadBtn = document.getElementById('btn-upload-swap');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            const targetSelect = document.getElementById('swap-target-select');
            if (!targetSelect) return;
            const [subfolder, fileName] = targetSelect.value.split('|');

            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*,.webp';

            fileInput.onchange = async (e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;

                try {
                    const exists = await ipcRenderer.invoke("check-swap-exists", { subfolder, fileName });
                    if (exists) {
                        const confirmReplace = confirm("⚠ You already have a texture installed for this item.\n\nThe system will replace it with the new one.\nDo you want to continue?");
                        if (!confirmReplace) return;
                    }
                } catch(err) {}

                uploadBtn.textContent = "Processing...";

                if (file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp')) {
                    const reader = new FileReader();
                    reader.onload = async () => {
                        try {
                            uploadBtn.textContent = "Saving...";
                            const res = await ipcRenderer.invoke("save-weapon-skin", { subfolder, fileName, base64Data: reader.result });
                            uploadBtn.textContent = "Select and Replace Image...";
                            if (res && res.success) {
                                updateSwapList();
                                if (restartModal) restartModal.style.display = 'flex';
                            } else {
                                alert("Save error: " + (res?.error || "Unknown"));
                            }
                        } catch (err) {
                            uploadBtn.textContent = "Select and Replace Image...";
                            alert("Save error: " + err.message);
                        }
                    };
                    reader.readAsDataURL(file);
                    return;
                }

                const reader = new FileReader();
                reader.onload = (ev) => {
                    const img = new Image();
                    img.onload = async () => {
                        try {
                            const canvas = document.createElement('canvas');
                            canvas.width = img.naturalWidth || img.width;
                            canvas.height = img.naturalHeight || img.height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            
                            const webpBase64 = canvas.toDataURL('image/webp', 0.95);
                            uploadBtn.textContent = "Saving...";

                            const res = await ipcRenderer.invoke("save-weapon-skin", { subfolder, fileName, base64Data: webpBase64 });

                            uploadBtn.textContent = "Select and Replace Image...";
                            if (res && res.success) {
                                updateSwapList();
                                if (restartModal) restartModal.style.display = 'flex';
                            } else {
                                alert("Error saving to disk.");
                            }
                        } catch (err) {
                            uploadBtn.textContent = "Select and Replace Image...";
                            alert("Error converting to WebP: " + err.message);
                        }
                    };
                    img.src = ev.target.result;
                };
                reader.readAsDataURL(file);
            };
            fileInput.click();
        });
    }

    updateSwapList();

    function setupToggle(id, storageKey, cb) {
        const btn = document.getElementById(id);
        if (!btn) return;
        const enabled = localStorage.getItem(storageKey) === 'true';
        if (enabled) btn.classList.add('active');
        cb(enabled);
        btn.addEventListener('click', () => {
            const newState = !btn.classList.contains('active');
            btn.classList.toggle('active', newState);
            localStorage.setItem(storageKey, newState);
            cb(newState);
        });
    }

    setupToggle('toggle-keys', 'ds_keystrokes_enabled', (state) => toggleKeys(state));
    setupToggle('toggle-stats', 'ds_stats_enabled', (state) => toggleStats(state));
    setupToggle('toggle-crosshair', 'ds_crosshair_enabled', (state) => { toggleCrosshair(state); });

    window.addEventListener('keydown', (e) => { 
        if (e.key === 'Insert' && menuEl) { 
            menuEl.style.display = menuEl.style.display === 'none' ? 'block' : 'none'; 
        } 
    });
});