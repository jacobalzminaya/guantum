// engine.js - Quantum Alpha PRO v22 | Ultimate Edition

const AudioEngine = {
    ctx: null,
    init() { 
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); 
    },
    async play(type) {
        this.init();
        if (this.ctx.state === 'suspended') await this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain); 
        gain.connect(this.ctx.destination);

        if(type === "CLICK") {
            osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
            osc.start(); 
            osc.stop(this.ctx.currentTime + 0.03);
        } else {
            // Audio para Señales de COMPRA o VENTA
            osc.frequency.setValueAtTime(type === "COMPRA" ? 880 : 330, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.6);
            osc.start(); 
            osc.stop(this.ctx.currentTime + 0.6);
        }
        if(navigator.vibrate) navigator.vibrate(type === "COMPRA" ? [30, 10, 30] : [70]);
    }
};

function drawChart() {
    const canvas = document.getElementById('flow-chart');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Obtener dimensiones reales del CSS para el dibujo
    const logicalWidth = canvas.width / dpr;
    const logicalHeight = canvas.height / dpr;
    
    // Limpieza de frame
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
    
    if (!mouseEnabled && sequence.length === 0) return;

    // --- CUADRÍCULA DE FONDO ---
    ctx.strokeStyle = 'rgba(74, 144, 226, 0.05)';
    ctx.lineWidth = 1;
    for(let i=0; i < logicalWidth; i += 25) {
        ctx.beginPath(); 
        ctx.moveTo(i, 0); 
        ctx.lineTo(i, logicalHeight); 
        ctx.stroke();
    }

    // --- CONFIGURACIÓN DE LÍNEA ---
    ctx.beginPath();
    const lastVal = sequence[sequence.length-1]?.val;
    
    if (perfectFlow) {
        ctx.lineWidth = 4;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = lastVal === 'A' ? '#00ff88' : '#ff2e63';
        ctx.shadowColor = lastVal === 'A' ? '#00ff88' : '#ff2e63';
    } else {
        ctx.lineWidth = 2;
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#4a90e2';
    }
    
    // --- DIBUJO DEL TRAZO AUTO-AJUSTABLE ---
    const step = logicalWidth / (chartData.length - 1);
    
    chartData.forEach((val, i) => {
        const x = i * step;
        
        // DINÁMICA DE ALTURA:
        // Centramos en la mitad exacta del contenedor
        const centerY = logicalHeight / 2;
        
        /**
         * MULTIPLICADOR QUIRÚRGICO 0.8:
         * Con 1.2 o 3, en contenedores de 80px-110px, la línea se sale.
         * Con 0.8, la "volatilidad" se comprime para que siempre veas el pico.
         */
        const y = centerY - (val - 40) * 0.8; 
        
        if(i === 0) ctx.moveTo(x, y); 
        else ctx.lineTo(x, y);
    });
    
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function initCanvas() {
    const canvas = document.getElementById('flow-chart');
    if(canvas) {
        const dpr = window.devicePixelRatio || 1;
        
        // Esto obliga al canvas a medir su espacio asignado por el CSS
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        const ctx = canvas.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Limpia transformaciones previas
        ctx.scale(dpr, dpr);
        
        drawChart();
    }
}