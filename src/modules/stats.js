const { makeDraggable } = require('./utils.js');
const os = require('os');

let contenedorStats;
let idAnimationFrame;
let intervaloStats;
let intervaloPing;

function inicializarStats() {
    const estilo = document.createElement('style');
    estilo.textContent = `
        #ds-stats {
            position: fixed; 
            top: 20px; right: 20px; 
            z-index: 999998;
            padding: 16px;
            background: linear-gradient(135deg, rgba(15,15,15,0.85), rgba(25,25,25,0.7));
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.1);
            border-top: 1px solid rgba(255,255,255,0.2);
            border-radius: 12px;
            color: #ebf0ff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            flex-direction: column;
            gap: 14px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.6);
            min-width: 190px;
            user-select: none;
        }
        .stat-block { display: flex; flex-direction: column; gap: 6px; }
        .stat-top { display: flex; justify-content: space-between; align-items: flex-end; }
        .stat-name { font-size: 11px; font-weight: 800; letter-spacing: 1px; color: rgba(255,255,255,0.5); text-transform: uppercase; }
        .stat-val { font-size: 16px; font-weight: 800; text-shadow: 0 0 10px rgba(255,255,255,0.2); }
        
        .bar-bg { width: 100%; height: 6px; background: rgba(0,0,0,0.6); border-radius: 3px; overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.8); }
        .bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s; }
        
        #ds-stats-drag { position: absolute; inset: 0; cursor: move; z-index: -1; }
    `;
    document.head.appendChild(estilo);

    contenedorStats = document.createElement('div');
    contenedorStats.id = 'ds-stats';
    contenedorStats.innerHTML = `
        <div id="ds-stats-drag"></div>
        
        <div class="stat-block">
            <div class="stat-top">
                <span class="stat-name">FPS</span>
                <span class="stat-val" id="st-fps-val">0</span>
            </div>
        </div>

        <div class="stat-block">
            <div class="stat-top">
                <span class="stat-name">Ping</span>
                <span class="stat-val" id="st-ping-val">0 ms</span>
            </div>
        </div>

        <div class="stat-block">
            <div class="stat-top">
                <span class="stat-name">System RAM</span>
                <span class="stat-val" id="st-ram-val">0%</span>
            </div>
            <div class="bar-bg"><div class="bar-fill" id="st-ram-bar" style="width: 0%; background: #3b82f6;"></div></div>
        </div>

        <div class="stat-block">
            <div class="stat-top">
                <span class="stat-name">System CPU</span>
                <span class="stat-val" id="st-cpu-val">0%</span>
            </div>
            <div class="bar-bg"><div class="bar-fill" id="st-cpu-bar" style="width: 0%; background: #8b5cf6;"></div></div>
        </div>
    `;
    document.body.appendChild(contenedorStats);

    makeDraggable(contenedorStats, 'ds_stats_pos');
}

function obtenerInfoCPU() {
    const cpus = os.cpus();
    let idle = 0, total = 0;
    for (let i = 0; i < cpus.length; i++) {
        for (let type in cpus[i].times) { total += cpus[i].times[type]; }
        idle += cpus[i].times.idle;
    }
    return { idle, total };
}

function iniciarMonitoreo() {
    let frames = 0;
    let ultimoTiempoFps = performance.now();
    
    function trackFps() {
        frames++;
        const ahora = performance.now();
        if (ahora >= ultimoTiempoFps + 1000) {
            const elementoFps = document.getElementById('st-fps-val');
            if (elementoFps) {
                elementoFps.textContent = frames;
                if (frames >= 144) elementoFps.style.color = '#c084fc';
                else if (frames >= 60) elementoFps.style.color = '#4ade80';
                else if (frames >= 30) elementoFps.style.color = '#fbbf24';
                else elementoFps.style.color = '#ef4444';
            }
            frames = 0;
            ultimoTiempoFps = ahora;
        }
        idAnimationFrame = requestAnimationFrame(trackFps);
    }
    trackFps();

    let ultimoCpu = obtenerInfoCPU();
    
    intervaloStats = setInterval(() => {
        const totalMem = os.totalmem();
        const libreMem = os.freemem();
        const usadaMem = totalMem - libreMem;
        const porcRam = Math.round((usadaMem / totalMem) * 100);
        
        const valorRam = document.getElementById('st-ram-val');
        const barraRam = document.getElementById('st-ram-bar');
        if (valorRam && barraRam) {
            valorRam.textContent = porcRam + '%';
            barraRam.style.width = porcRam + '%';
            barraRam.style.background = porcRam > 85 ? '#ef4444' : '#3b82f6';
        }

        const cpuActual = obtenerInfoCPU();
        const difIdle = cpuActual.idle - ultimoCpu.idle;
        const difTotal = cpuActual.total - ultimoCpu.total;
        const porcCpu = difTotal === 0 ? 0 : Math.round(100 - (100 * difIdle / difTotal));
        ultimoCpu = cpuActual;

        const valorCpu = document.getElementById('st-cpu-val');
        const barraCpu = document.getElementById('st-cpu-bar');
        if (valorCpu && barraCpu) {
            valorCpu.textContent = porcCpu + '%';
            barraCpu.style.width = porcCpu + '%';
            barraCpu.style.background = porcCpu > 85 ? '#ef4444' : '#8b5cf6';
        }

    }, 1000);

    intervaloPing = setInterval(async () => {
        const inicio = performance.now();
        try {
            await fetch('https://deadshot.io/favicon.png', { method: 'HEAD', mode: 'no-cors', cache: 'no-store' });
            const duracion = Math.round(performance.now() - inicio);
            const elementoPing = document.getElementById('st-ping-val');
            if (elementoPing) {
                elementoPing.textContent = duracion + ' ms';
                if (duracion < 50) elementoPing.style.color = '#4ade80';
                else if (duracion < 120) elementoPing.style.color = '#fbbf24';
                else elementoPing.style.color = '#ef4444';
            }
        } catch (e) {
            const elementoPing = document.getElementById('st-ping-val');
            if (elementoPing) {
                elementoPing.textContent = 'N/A';
                elementoPing.style.color = '#ef4444';
            }
        }
    }, 3000);
}

function toggleStats(activo) {
    if (!contenedorStats) inicializarStats();
    
    if (activo) {
        contenedorStats.style.display = 'flex';
        iniciarMonitoreo();
    } else {
        contenedorStats.style.display = 'none';
        if (idAnimationFrame) cancelAnimationFrame(idAnimationFrame);
        if (intervaloStats) clearInterval(intervaloStats);
        if (intervaloPing) clearInterval(intervaloPing);
    }
}

module.exports = { toggleStats };