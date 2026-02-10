// main.js - Orquestador Único del Tiempo y Seguridad Adaptado | Super-IA v23

let lastSignalSide = null; 
let lastPowerSnapshot = 0; // Captura la fuerza exacta al momento de la señal

window.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    initCanvas(); 
    
    const hSaved = localStorage.getItem('tradeHistory');
    if(hSaved) { 
        tradeHistory = JSON.parse(hSaved); 
        updateStats(); 
    }
});

function handleWinClick() {
    const resultStep = document.getElementById('result-step');
    const colorStep = document.getElementById('color-step');
    
    if(resultStep && colorStep) {
        // --- SONIDO ---
        if(typeof AudioEngine !== 'undefined') {
            AudioEngine.play("CLICK");
        }

        // 1. TRANSICIÓN DE INTERFAZ
        resultStep.style.display = 'none';
        
        // CORRECCIÓN AQUÍ: Usamos directamente .style o setAttribute sobre el elemento
        colorStep.style.cssText = "display: flex !important; gap: 8px; width: 100%;";

        console.log("%c 🎨 MODO COLOR: Esperando confirmación de vela...", 'color: #4a90e2; font-weight: bold;');

        // 2. BLINDADO DE TIEMPO
        if (window.colorTimeout) {
            clearTimeout(window.colorTimeout);
        }

        window.colorTimeout = setTimeout(() => {
            // Verificamos si colorStep sigue visible (si el usuario no ha hecho clic aún)
            if(isSignalActive && colorStep.style.display !== 'none') {
                console.warn("⚠️ AUTO-COMPLETADO: Tiempo límite excedido.");
                const defaultColor = (lastSignalSide === 'COMPRA') ? 'A' : 'B';
                recordResult(true, defaultColor);
            }
        }, 60000); 
    }
}

function triggerSignal(side, strength) {
    if (isSignalActive) return;
    
    // --- INYECCIÓN QUIRÚRGICA: FILTRO INSTITUCIONAL SMC/ICT 2026 ---
    const ms = lastClickTime > 0 ? Date.now() - lastClickTime : 0;
    const power = parseFloat(document.getElementById('power-index')?.innerText.replace('POWER: ', '') || strength);
    const finalScore = SuperIA.calculateSuperScore(strength, ms, power);
    
    if (finalScore < 4.5) {
        console.log(`%c 🚫 SEÑAL BLOQUEADA: Score Institucional Insuficiente (${finalScore.toFixed(2)})`, 'color: #ff2e63; font-weight: bold;');
        return; 
    }

    // 1. BLOQUEO DE SEGURIDAD Y CAPTURA DE ESTADO V23
    isSignalActive = true;
    signalCooldown = true;
    lastSignalSide = side; 
    lastPowerSnapshot = strength;
    window.currentSignalScore = finalScore; 

    // 2. REFERENCIAS DOM
    const feedbackGrid = document.getElementById('f-grid'); 
    const winBtn = document.getElementById('winBtn');
    const lossBtn = document.getElementById('lossBtn');
    const resultStep = document.getElementById('result-step');
    const colorStep = document.getElementById('color-step');
    const statusMsg = document.getElementById('op-status');
    const timerEl = document.getElementById('op-timer');
    const bigIcon = document.getElementById('big-icon');
    const timerBar = document.getElementById('timer-bar');

    // 3. PREPARAR INTERFAZ Y EFECTOS
    if(resultStep) resultStep.style.display = 'none'; 
    if(colorStep) colorStep.style.display = 'none';
    if(feedbackGrid) feedbackGrid.classList.add('show'); 
    document.body.classList.add('signal-active'); 

    if(winBtn && lossBtn) {
        winBtn.disabled = false;
        lossBtn.disabled = false;
        winBtn.style.opacity = "1";
        lossBtn.style.opacity = "1";
    }

    const color = side === 'COMPRA' ? 'var(--up-neon)' : 'var(--down-neon)';

    if(statusMsg) {
        const activeSetup = (typeof QuantumSMC !== 'undefined') ? QuantumSMC.detectSetups() : null;
        const modelLabel = activeSetup ? `<br><small style="font-size:10px; color:gold;">MODELO: ${activeSetup.name}</small>` : '';
        statusMsg.innerHTML = `<span style="color:${color}; font-weight:bold; text-shadow: 0 0 10px ${color}44;">${side} DETECTADA</span>${modelLabel}`;
    }

    if(bigIcon) {
        bigIcon.innerText = side === 'COMPRA' ? "▲" : "▼";
        bigIcon.style.color = color;
        bigIcon.style.display = "flex";
    }

    // 4. CONTROL DEL TEMPORIZADOR BLINDADO
    if (countdownInterval) clearInterval(countdownInterval);

    let count = parseInt(window.selectedTime) || parseInt(document.getElementById('timeList')?.value) || 30; 
    const initialTime = count; 

    if(timerEl) timerEl.innerText = count < 10 ? "0" + count : count; 
    if(timerBar) {
        timerBar.style.width = '100%';
        timerBar.style.backgroundColor = color;
    }

    console.log(`🚀 Señal Validada: ${side} | Tiempo: ${count}s`);

    countdownInterval = setInterval(() => {
        count--;
        
        if(timerEl) {
            if (count >= 60) {
                let m = Math.floor(count / 60);
                let s = count % 60;
                timerEl.innerText = `${m}m ${s < 10 ? "0" + s : s}s`;
            } else {
                timerEl.innerText = count < 10 ? "0" + count : count;
            }
            if(count <= 5) timerEl.style.color = "var(--down-neon)";
            else timerEl.style.color = "var(--text-main)";
        }

        if(timerBar) {
            const pct = (count / initialTime) * 100;
            timerBar.style.width = pct + '%';
        }
        
        if(count <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            if(timerEl) timerEl.innerText = "00";
            
            // --- INYECCIÓN DE EMERGENCIA: PRIORIDAD MÁXIMA ---
            if(typeof AudioEngine !== 'undefined') AudioEngine.play("CLICK"); 
            
            if(resultStep) {
                // Forzamos al elemento a romper cualquier restricción de espacio
                resultStep.style.cssText = `
                    display: flex !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    position: relative !important;
                    z-index: 999999 !important;
                    width: 100% !important;
                    height: auto !important;
                    min-height: 60px !important;
                    gap: 10px !important;
                    justify-content: center !important;
                    margin-top: 15px !important;
                    pointer-events: all !important;
                `;
                
                // Aseguramos que los botones internos sean visibles
                const internalBtns = resultStep.querySelectorAll('button');
                internalBtns.forEach(btn => {
                    btn.style.display = "block";
                    btn.style.opacity = "1";
                    btn.disabled = false;
                });

                if(bigIcon) bigIcon.style.display = "none";
                
                console.log("🎯 INTERFAZ FORZADA: Los botones deben ser visibles ahora.");
            }
            // ---------------------------------------------------------
            
            setTimeout(() => {
                const isChoosingColor = colorStep && colorStep.style.display === 'flex';
                const isShowingResult = resultStep && (resultStep.style.display === 'flex' || resultStep.getAttribute('style')?.includes('flex'));
                
                if(isSignalActive && !isChoosingColor && isShowingResult) {
                    console.log("🧹 Limpieza automática por inactividad.");
                    if(typeof resetUI === 'function') resetUI(false);
                    isSignalActive = false;
                    signalCooldown = false;
                    document.body.classList.remove('signal-active');
                }
            }, 30000); 
        }
    }, 1000);
    
    if(typeof AudioEngine !== 'undefined') AudioEngine.play(side);
}
function resetUI(fullReset = true) {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    const timerEl = document.getElementById('op-timer');
    if (timerEl) timerEl.innerText = "00";

    isSignalActive = false;
    
    const feedbackGrid = document.getElementById('f-grid');
    const resultStep = document.getElementById('result-step');
    const colorStep = document.getElementById('color-step');
    const winBtn = document.getElementById('winBtn');
    const lossBtn = document.getElementById('lossBtn');

    if(feedbackGrid) feedbackGrid.classList.remove('show'); 
    if(resultStep) resultStep.style.display = 'flex';
    if(colorStep) colorStep.style.display = 'none';

    if (winBtn && lossBtn) {
        winBtn.style.opacity = "0.3";
        winBtn.style.filter = "grayscale(1)";
        lossBtn.style.opacity = "0.3";
        lossBtn.style.filter = "grayscale(1)";
        winBtn.disabled = true;
        lossBtn.disabled = true;
    }

    const bigIcon = document.getElementById('big-icon');
    if(bigIcon) bigIcon.style.display = "none";
    
    const statusMsg = document.getElementById('op-status');
    if(statusMsg) {
        statusMsg.innerText = fullReset ? "SISTEMA STANDBY" : "ESPERANDO SEÑAL";
        statusMsg.style.color = "var(--text-dim)";
    }

    document.body.classList.remove('signal-active');
    console.log("♻️ UI Reiniciada. Memoria de Super-IA lista para el siguiente ciclo.");
}

async function recordResult(win, manualColor = null) {
    // --- LIMPIEZA QUIRÚRGICA DE SEGURIDAD V23 ---
    // Matamos el timer de autocierre del panel de color para evitar cierres fantasma
    if (window.colorTimeout) {
        clearTimeout(window.colorTimeout);
        window.colorTimeout = null;
        console.log("🧹 Ciclo de Feedback cerrado: colorTimeout eliminado.");
    }

    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    const timerEl = document.getElementById('op-timer');
    if (timerEl) timerEl.innerText = "00";

    const signalType = lastSignalSide === 'COMPRA' ? 'A' : 'B';
    let finalColor = manualColor;
    
    // Lógica de color automática si no se provee manual
    if (!finalColor) {
        finalColor = win ? signalType : (signalType === 'A' ? 'B' : 'A');
    }

    // --- MEJORA V23: CAPTURA DE ADN Y CONTEXTO SNIPER ---
    const currentDNA = (typeof sequence !== 'undefined') ? sequence.slice(-5).map(s => s.val).join('') : "";
    
    const tradeData = {
        win: win,
        color: finalColor,
        side: lastSignalSide,
        timestamp: Date.now(),
        power: lastPowerSnapshot,
        dna: currentDNA,                                     // ADN para el DNAMatcher de la v23
        riskAtTrade: typeof riskLevel !== 'undefined' ? riskLevel : 3, 
        trend: typeof getMajorTrend === 'function' ? getMajorTrend() : "NEUTRAL",
        neuralAtTrade: typeof neuralMode !== 'undefined' ? neuralMode : true,
        scoreAtTrade: typeof window.currentSignalScore !== 'undefined' ? window.currentSignalScore : 0 
    };

    // 2. GUARDAR DATOS (Historial optimizado)
    tradeHistory.push(tradeData);
    if(tradeHistory.length > 50) tradeHistory.shift(); 
    localStorage.setItem('tradeHistory', JSON.stringify(tradeHistory));

    // 3. APRENDIZAJE HÍBRIDO
    if(typeof AICore !== 'undefined' && typeof AICore.learn === 'function') {
        AICore.learn(); 
    }
    if(typeof NeuralCore !== 'undefined' && typeof lastData !== 'undefined' && lastData !== null) {
        NeuralCore.train(lastData, win);
    }

    // 4. DESBLOQUEO DE SEGURIDAD 
    // Mantenemos el estado activo hasta este punto para proteger la UI
    isSignalActive = false; 
    signalCooldown = false; 
    
    if (win) {
        consecutiveLosses = 0;
    } else {
        if (typeof consecutiveLosses !== 'undefined') consecutiveLosses++;
    }

    // 5. CIERRE VISUAL TOTAL
    updateStats();
    if (typeof resetUI === 'function') resetUI(false); 
    
    // ELIMINACIÓN DEL LATIDO: El terminal deja de brillar solo cuando los datos están a salvo
    document.body.classList.remove('signal-active');
    
    if(typeof updateHourlyIntelligence === 'function') updateHourlyIntelligence();
    
    console.log(`✅ Operación Registrada | Resultado: ${win ? 'WIN' : 'LOSS'} | ADN: ${currentDNA}`);
}

function updateStats() {
    const wins = tradeHistory.filter(x => x && x.win === true).length;
    const total = tradeHistory.length;
    const totalEl = document.getElementById('stat-total');
    const winRateEl = document.getElementById('stat-winrate');
    if(totalEl) totalEl.innerText = total;
    if(winRateEl) winRateEl.innerText = total > 0 ? Math.round((wins/total)*100) + "%" : "0%";
}

// --- CONTROL DE ENTRADAS (RADAR Y TÁCTIL) ---
const radarOverlay = document.getElementById('mouse-overlay');
if(radarOverlay) {
    radarOverlay.addEventListener('mousedown', (e) => {
        if (isSignalActive || (typeof signalCooldown !== 'undefined' && signalCooldown)) return;
        e.preventDefault();
        if (e.button === 0) registerInput('A');
        else if (e.button === 2) registerInput('B');
    });
    
    radarOverlay.addEventListener('touchstart', (e) => {
        if (isSignalActive || (typeof signalCooldown !== 'undefined' && signalCooldown)) {
            e.preventDefault();
            return;
        }
    }, { passive: false });

    radarOverlay.addEventListener('contextmenu', e => e.preventDefault());
}
function undoLastInput(event) {
    // 1. Detener la propagación para que el radar no registre un nuevo triángulo al tocar el botón
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // 2. Solo borrar si hay datos y NO hay una señal activa analizando
    if (sequence.length > 0 && !isSignalActive) {
        sequence.pop(); // Elimina el último dato
        
        // 3. Actualizar la interfaz visual de los triángulos
        if (typeof updateSymbols === 'function') updateSymbols();
        
        // 4. Feedback auditivo
        if (typeof AudioEngine !== 'undefined') AudioEngine.play("CLICK");
        
        console.log("↶ ADN corregido. Última entrada eliminada.");
    } else {
        console.warn("⚠️ No se puede borrar: secuencia vacía o señal en curso.");
    }
}
function clearFullHistory() {
    // 1. Limpiar datos físicos
    tradeHistory = [];
    localStorage.removeItem('tradeHistory');
    
    // 2. Limpiar logs detallados (si los usas)
    localStorage.removeItem('quantum_detailed_logs');
    
    // 3. Forzar actualización de la UI
    if (typeof updateStats === 'function') updateStats();
    
    // 4. BLOQUEO MANUAL DEL BOTÓN (Esto es lo que te falta)
    const autoBtn = document.getElementById('autoPilotBtn');
    if (autoBtn) {
        autoBtn.disabled = true;
        autoBtn.style.opacity = "0.5";
        autoBtn.style.cursor = "not-allowed";
        autoBtn.innerText = "BLOQUEADO (10)";
    }
    
    // 5. Resetear la IA en el footer
    const iaLogic = document.getElementById('ia-logic');
    if (iaLogic) {
        iaLogic.innerText = "IA APRENDIENDO... (10 ops)";
        iaLogic.style.color = "var(--text-dim)";
    }

    console.log("🧹 Historial y memoria de IA reseteados con éxito.");
}