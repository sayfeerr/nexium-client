const { makeDraggable } = require('./utils.js');
let contenedorTeclas;

function inicializarTeclas() {
    const estilo = document.createElement('style');
    estilo.textContent = `
        #ds-keystrokes {
            position: fixed; 
            top: 60vh; left: 20px;
            z-index: 999998;
            display: grid; 
            grid-template-columns: repeat(5, 50px);
            gap: 10px; 
            padding: 12px;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            user-select: none;
        }
        
        .ds-key {
            width: 50px; height: 50px; 
            background: transparent;
            border: 2px solid rgba(255, 255, 255, 0.3); 
            border-radius: 8px;
            color: #ffffff; 
            font-family: 'Segoe UI', sans-serif; font-size: 15px; font-weight: bold;
            display: flex; justify-content: center; align-items: center;
            transition: transform 0.15s ease-out, box-shadow 0.15s ease-out, background-color 0.15s, border-color 0.15s, color 0.15s;
            user-select: none;
        }
        
        .ds-key.pressed { 
            transform: scale(1.1); 
            background: var(--active-bg, rgba(255, 255, 255, 0.9));
            color: #ffffff;
            border-color: var(--active-border, #ffffff);
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
        }
        
        #key-lmb, #key-rmb { font-size: 11px; }
        #ds-keys-drag { position: absolute; inset: 0; cursor: move; z-index: -1; }
    `;
    document.head.appendChild(estilo);

    contenedorTeclas = document.createElement('div');
    contenedorTeclas.id = 'ds-keystrokes';
    contenedorTeclas.innerHTML = `
        <div id="ds-keys-drag"></div>
        <div class="ds-key" id="key-f">F</div>
        <div class="ds-key" id="key-w">W</div>
        <div class="ds-key" id="key-r">R</div>
        <div class="ds-key" id="key-space">␣</div>
        <div class="ds-key" id="key-shift">⇧</div>
        
        <div class="ds-key" id="key-a">A</div>
        <div class="ds-key" id="key-s">S</div>
        <div class="ds-key" id="key-d">D</div>
        <div class="ds-key" id="key-lmb">LMB</div>
        <div class="ds-key" id="key-rmb">RMB</div>
    `;
    document.body.appendChild(contenedorTeclas);

    makeDraggable(contenedorTeclas, 'ds_keys_pos');

    const mapaTeclas = {
        'f': 'key-f',
        'w': 'key-w',
        'r': 'key-r',
        'a': 'key-a',
        's': 'key-s',
        'd': 'key-d'
    };

    function actualizarTema() {
        const colorTexto = localStorage.getItem('ds_theme_text') || '#ffffff';
        contenedorTeclas.querySelectorAll('.ds-key').forEach(k => {
            if (!k.classList.contains('pressed')) {
                k.style.color = colorTexto;
            }
        });
    }

    window.updateKeystrokesTheme = actualizarTema;
    actualizarTema();

    function pulsarTecla(el, esAccion = false) {
        if (!el) return;
        el.classList.add('pressed');
        const colorMovimiento = localStorage.getItem('ds_theme_movement') || '#3b82f6';
        const colorAccion = localStorage.getItem('ds_theme_action') || '#ef4444';
        const color = esAccion ? colorAccion : colorMovimiento;
        el.style.backgroundColor = color;
        el.style.borderColor = color;
        el.style.color = '#ffffff';
    }

    function soltarTecla(el) {
        if (!el) return;
        el.classList.remove('pressed');
        el.style.backgroundColor = 'transparent';
        el.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        el.style.color = localStorage.getItem('ds_theme_text') || '#ffffff';
    }

    window.addEventListener('keydown', (e) => {
        if (contenedorTeclas.style.display === 'none') return;
        const tecla = e.key.toLowerCase();
        const idTecla = mapaTeclas[tecla] || (e.code === 'Space' ? 'key-space' : null) || (e.key === 'Shift' ? 'key-shift' : null);
        if (idTecla) {
            const esAccion = ['key-f', 'key-r', 'key-space', 'key-shift'].includes(idTecla);
            pulsarTecla(document.getElementById(idTecla), esAccion);
        }
    });

    window.addEventListener('keyup', (e) => {
        if (contenedorTeclas.style.display === 'none') return;
        const tecla = e.key.toLowerCase();
        const idTecla = mapaTeclas[tecla] || (e.code === 'Space' ? 'key-space' : null) || (e.key === 'Shift' ? 'key-shift' : null);
        if (idTecla) {
            soltarTecla(document.getElementById(idTecla));
        }
    });

    window.addEventListener('mousedown', (e) => {
        if (contenedorTeclas.style.display === 'none') return;
        if (e.button === 0) pulsarTecla(document.getElementById('key-lmb'), true);
        if (e.button === 2) pulsarTecla(document.getElementById('key-rmb'), true);
    });

    window.addEventListener('mouseup', (e) => {
        if (contenedorTeclas.style.display === 'none') return;
        if (e.button === 0) soltarTecla(document.getElementById('key-lmb'));
        if (e.button === 2) soltarTecla(document.getElementById('key-rmb'));
    });
}

function toggleKeystrokes(activo) {
    if (!contenedorTeclas) inicializarTeclas();
    contenedorTeclas.style.display = activo ? 'grid' : 'none';
}

module.exports = { toggleKeystrokes };