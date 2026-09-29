let elementoCruz;

function inicializarCruz() {
    if (elementoCruz || !document.body) return;
    
    const estilo = document.createElement('style');
    estilo.textContent = `
        #ds-crosshair {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 999999;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    `;
    document.head.appendChild(estilo);

    elementoCruz = document.createElement('div');
    elementoCruz.id = 'ds-crosshair';
    document.body.appendChild(elementoCruz);
    aplicarConfiguracionCruz();
}

function aplicarConfiguracionCruz() {
    if (!elementoCruz) {
        inicializarCruz();
        return;
    }
    
    const estaHabilitado = localStorage.getItem('ds_crosshair_enabled') === 'true';
    elementoCruz.style.display = estaHabilitado ? 'flex' : 'none';
    if (!estaHabilitado) return;

    const tipo = localStorage.getItem('ds_cross_type') || 'cross';
    const tamano = parseInt(localStorage.getItem('ds_cross_size') || '12');
    const color = localStorage.getItem('ds_cross_color') || '#ffffff';
    const grosor = parseInt(localStorage.getItem('ds_cross_thick') || '2');

    let htmlCruz = '';
    const tamDoble = tamano * 2;

    switch (tipo) {
        case 'dot':
            htmlCruz = `<div style="width:${tamano}px; height:${tamano}px; background:${color}; border-radius:50%; box-shadow: 0 0 6px rgba(0,0,0,0.9);"></div>`;
            break;
        case 'circle':
            htmlCruz = `<div style="width:${tamDoble}px; height:${tamDoble}px; border:${grosor}px solid ${color}; border-radius:50%; box-sizing:border-box; box-shadow: 0 0 6px rgba(0,0,0,0.9);"></div>`;
            break;
        case 'circleDot':
            htmlCruz = `
                <div style="position:relative; width:${tamDoble}px; height:${tamDoble}px; border:${grosor}px solid ${color}; border-radius:50%; box-sizing:border-box; box-shadow: 0 0 6px rgba(0,0,0,0.9);">
                    <div style="position:absolute; top:50%; left:50%; width:${Math.max(2, tamano/3)}px; height:${Math.max(2, tamano/3)}px; background:${color}; border-radius:50%; transform:translate(-50%,-50%);"></div>
                </div>`;
            break;
        case 'tshape':
            htmlCruz = `
                <div style="position:relative; width:${tamDoble}px; height:${tamDoble}px;">
                    <div style="position:absolute; left:50%; top:0; transform:translateX(-50%); width:${grosor}px; height:50%; background:${color}; box-shadow: 0 0 6px rgba(0,0,0,0.9);"></div>
                    <div style="position:absolute; top:50%; left:0; transform:translateY(-50%); height:${grosor}px; width:100%; background:${color}; box-shadow: 0 0 6px rgba(0,0,0,0.9);"></div>
                </div>`;
            break;
        case 'cross':
        default:
            htmlCruz = `
                <div style="position:relative; width:${tamDoble}px; height:${tamDoble}px;">
                    <div style="position:absolute; left:50%; top:0; transform:translateX(-50%); width:${grosor}px; height:100%; background:${color}; box-shadow: 0 0 6px rgba(0,0,0,0.9);"></div>
                    <div style="position:absolute; top:50%; left:0; transform:translateY(-50%); height:${grosor}px; width:100%; background:${color}; box-shadow: 0 0 6px rgba(0,0,0,0.9);"></div>
                </div>`;
            break;
    }
    elementoCruz.innerHTML = htmlCruz;
}

function toggleCrosshair(activo) {
    localStorage.setItem('ds_crosshair_enabled', activo);
    if (!elementoCruz) {
        inicializarCruz();
    } else {
        elementoCruz.style.display = activo ? 'flex' : 'none';
        aplicarConfiguracionCruz();
    }
}

module.exports = { toggleCrosshair, applySettings: aplicarConfiguracionCruz };