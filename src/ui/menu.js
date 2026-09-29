const css = `
    #aContainer, .ad-box, #ad-bottom, #ad-left, .ad-container, 
    .ad-right, #ad-right, [class*="advertisement"], [id*="advertisement"],
    iframe[src*="fotocasa"], div:has(> iframe[src*="fotocasa"]), 
    div:has(> a[href*="fotocasa"]), div[style*="width: 300px"] { 
        display: none !important; 
        pointer-events: none !important; 
    }
    
    #ds-menu {
        position: fixed; top: 20px; left: 20px; width: 480px;
        background: rgba(12, 12, 12, 0.95); backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 14px;
        color: #ebf0ff; font-family: 'Segoe UI', sans-serif; z-index: 999999;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7); overflow: hidden;
    }
    
    #ds-menu.minimized {
        width: 55px; height: 55px; border-radius: 16px; cursor: move;
        display: flex; align-items: center; justify-content: center;
        background: rgba(12, 12, 12, 0.95);
        border: 1.5px solid rgba(235, 240, 255, 0.4);
    }

    #ds-menu.minimized .menu-body, #ds-menu.minimized .menu-header { display: none; }
    #ds-menu:not(.minimized) .minimized-logo { display: none; }
    .minimized-logo { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; cursor: move; }

    .menu-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: rgba(0, 0, 0, 0.6); border-bottom: 1px solid rgba(255, 255, 255, 0.08); user-select: none; cursor: move; }
    .logo-container { display: flex; align-items: center; gap: 10px; }
    .logo-text { font-size: 15px; font-weight: 800; letter-spacing: 1.5px; color: white; }
    .btn-minimize { background: none; border: none; color: white; cursor: pointer; font-size: 20px; line-height: 1; opacity: 0.5; transition: 0.2s; }
    .btn-minimize:hover { opacity: 1; }

    .menu-body { display: flex; height: 350px; }
    .menu-tabs { width: 130px; background: rgba(0, 0, 0, 0.4); border-right: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; }
    .tab-btn { padding: 14px 16px; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.4); cursor: pointer; border-left: 3px solid transparent; transition: 0.2s; }
    .tab-btn:hover { color: white; background: rgba(255,255,255,0.03); }
    .tab-btn.active { color: white; background: rgba(255,255,255,0.06); border-left-color: #ebf0ff; }

    .menu-content-area { flex: 1; padding: 18px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
    .tab-pane { display: none; flex-direction: column; gap: 12px; }
    .tab-pane.active { display: flex; }
    
    .menu-row { display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 500; width: 100%; gap: 12px; }
    .menu-row span.label { flex-shrink: 0; }
    .custom-input { background: rgba(20,20,20,0.9); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 8px 10px; border-radius: 6px; outline: none; font-size: 12px; cursor: pointer; width: 100%; }
    
    .toggle-switch { width: 40px; height: 20px; background: rgba(255, 255, 255, 0.15); border-radius: 12px; position: relative; cursor: pointer; transition: 0.3s; flex-shrink: 0; }
    .toggle-switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background: white; border-radius: 50%; transition: left 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
    .toggle-switch.active { background: #ebf0ff; }
    .toggle-switch.active::after { left: 22px; background: #0c0c0c; }
    
    .ov-btn { padding: 10px; border-radius: 6px; border: none; background: #ebf0ff; color: #0c0c0c; font-weight: bold; cursor: pointer; transition: 0.2s; width: 100%; font-size: 12px; }
    .ov-btn:hover { opacity: 0.85; }
`;

const html = `
    <div id="ds-menu">
        <div class="menu-header" id="ds-header">
            <div class="logo-container">
                <svg viewBox="0 0 32 32" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 2L4 8v16l12 6 12-6V8L16 2z" stroke="#ebf0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="rgba(235,240,255,0.15)"/><circle cx="16" cy="16" r="4.5" fill="#ebf0ff"/></svg>
                <span class="logo-text">NEXIUM</span>
            </div>
            <button class="btn-minimize" id="btn-min">−</button>
        </div>
        <div class="minimized-logo" id="logo-min">
            <svg viewBox="0 0 32 32" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 2L4 8v16l12 6 12-6V8L16 2z" stroke="#ebf0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="rgba(235,240,255,0.15)"/><circle cx="16" cy="16" r="4.5" fill="#ebf0ff"/></svg>
        </div>
        <div class="menu-body">
            <div class="menu-tabs">
                <div class="tab-btn active" data-tab="main">General</div>
                <div class="tab-btn" data-tab="crosshair">Crosshair</div>
                <div class="tab-btn" data-tab="theme">Theme</div>
                <div class="tab-btn" data-tab="swapper">Auto-Swapper</div>
            </div>
            <div class="menu-content-area">
                <div class="tab-pane active" id="pane-main">
                    <div class="menu-row"><span class="label">Keystrokes</span><div class="toggle-switch" id="toggle-keys"></div></div>
                    <div class="menu-row"><span class="label">FPS / Stats Monitor</span><div class="toggle-switch" id="toggle-stats"></div></div>
                    <div style="margin-top:auto; font-size: 11px; color: rgba(255,255,255,0.4); text-align: center;">Press [INSERT] to toggle menu</div>
                </div>
                
                <div class="tab-pane" id="pane-crosshair">
                    <div class="menu-row"><span class="label">Enable Crosshair</span><div class="toggle-switch" id="toggle-crosshair"></div></div>
                    <div class="menu-row"><span class="label">Style</span>
                        <select id="cross-type" class="custom-input" style="width:130px;"><option value="cross">Standard Cross</option><option value="dot">Dot</option><option value="circle">Circle</option><option value="circleDot">Circle with Dot</option><option value="tshape">T-Shape</option></select>
                    </div>
                    <div class="menu-row"><span class="label">HEX Color</span><input type="color" id="cross-color" value="#ffffff" style="width:50px;height:30px;padding:0;background:#111;border:1px solid rgba(255,255,255,0.2);border-radius:6px;"></div>
                    <div class="menu-row"><span class="label">Size</span><input type="range" id="cross-size" min="4" max="40" value="12" style="width:100%;"></div>
                    <div class="menu-row"><span class="label">Thickness</span><input type="range" id="cross-thick" min="1" max="8" value="2" style="width:100%;"></div>
                </div>

                <div class="tab-pane" id="pane-theme">
                    <div class="menu-row"><span class="label">Accent Color</span><input type="color" id="theme-accent" value="#ebf0ff" style="width:50px;height:30px;padding:0;background:#111;border:1px solid rgba(255,255,255,0.2);border-radius:6px;"></div>
                    <div class="menu-row"><span class="label">Text Color</span><input type="color" id="theme-text" value="#ffffff" style="width:50px;height:30px;padding:0;background:#111;border:1px solid rgba(255,255,255,0.2);border-radius:6px;"></div>
                    <div class="menu-row"><span class="label">Movement Keys</span><input type="color" id="theme-movement" value="#3b82f6" style="width:50px;height:30px;padding:0;background:#111;border:1px solid rgba(255,255,255,0.2);border-radius:6px;"></div>
                    <div class="menu-row"><span class="label">Action Keys</span><input type="color" id="theme-action" value="#ef4444" style="width:50px;height:30px;padding:0;background:#111;border:1px solid rgba(255,255,255,0.2);border-radius:6px;"></div>
                </div>

                <div class="tab-pane" id="pane-swapper">
                    <div style="font-size: 12px; font-weight: bold; color: #ebf0ff; margin-bottom: 5px;">Select weapon to modify:</div>
                    <select id="swap-target-select" class="custom-input" style="margin-bottom: 8px;">
                        <option value="weapons/ar|arcomp.webp">Assault Rifle (arcomp)</option>
                        <option value="weapons/awp|newawpcomp.webp">Sniper (newawpcomp)</option>
                        <option value="weapons/shotgun|shotguncomp.webp">Shotgun (shotguncomp)</option>
                        <option value="weapons/smg|smgcomp.webp">SMG (smgcomp)</option>
                        <option value="promo|logo.webp">Main Logo (logo)</option>
                    </select>

                    <button id="btn-upload-swap" class="ov-btn">Select and Replace Image...</button>
                    
                    <div style="font-size: 11px; color: #a3a3a3; margin-top: 10px;">Installed textures:</div>
                    <div id="swap-files-list" style="flex: 1; overflow-y: auto; background: rgba(0,0,0,0.4); border-radius: 6px; padding: 6px;"></div>
                </div>
            </div>
        </div>
    </div>
    
    <div id="restart-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999999; align-items:center; justify-content:center;">
        <div style="background:#141414; border:1px solid rgba(255,255,255,0.2); padding:20px; border-radius:10px; text-align:center; width:300px; color:#fff; font-family:'Segoe UI',sans-serif;">
            <div style="font-size:14px; font-weight:bold; margin-bottom:10px;">Texture Uploaded</div>
            <div style="font-size:12px; color:#aaa; margin-bottom:15px;">Please restart the client to apply changes.</div>
            <button id="btn-restart-app" class="ov-btn" style="background:#22c55e; color:#fff; border:none; cursor:pointer;">Restart Client</button>
        </div>
    </div>
`;
module.exports = { css, html };