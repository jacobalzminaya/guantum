// controls.js - Quantum Alpha PRO v22 | Ultimate Edition

// --- VARIABLES DE ESTADO AUTÓNOMO ---
let autoPilotMode = false;

// --- MANEJO DE RADAR Y MOUSE ---
function toggleMouse() {
    // 1. Inversión de estado
    mouseEnabled = !mouseEnabled;
    
    // 2. Inicialización de Audio (Solo la primera vez)
    if(typeof AudioEngine !== 'undefined') AudioEngine.init();

    // 3. Referencias del DOM
    const overlay = document.getElementById('mouse-overlay');
    const btn = document.getElementById('mouseBtn');
    const touchZone = document.getElementById('manual-touch-zone'); // Contenedor UP/DOWN

    if (mouseEnabled) {
        // --- ESTADO ACTIVO ---
        if(overlay) overlay.classList.add('active-radar');
        
        if(btn) {
            btn.classList.add('radar-on');
            btn.innerText = "SENSOR ACTIVO";
            
            // --- CAMBIO DE COLOR QUIRÚRGICO (ACTIVO) ---
            btn.style.backgroundColor = "var(--up-neon)"; 
            btn.style.color = "#000";
            btn.style.boxShadow = "0 0 15px var(--up-neon)";
            btn.style.border = "none";
        }
        
        // MOSTRAR BOTONES UP/DOWN (Añade clase para flex horizontal)
        if(touchZone) {
            touchZone.classList.add('active-radar-ui');
            // Forzamos visibilidad en caso de que el CSS sea restrictivo
            touchZone.style.display = "flex"; 
        }

        console.log("🚀 Radar iniciado: Botones de entrada activados.");

    } else {
        // --- ESTADO INACTIVO ---
        if(overlay) overlay.classList.remove('active-radar');
        
        if(btn) {
            btn.classList.remove('radar-on');
            btn.innerText = "INICIAR SENSOR RADAR";
            
            // --- RESTAURAR COLOR ORIGINAL (INACTIVO) ---
            btn.style.backgroundColor = "var(--accent)";
            btn.style.color = "#fff";
            btn.style.boxShadow = "none";
            btn.style.border = "none";
        }
        
        // OCULTAR BOTONES UP/DOWN
        if(touchZone) {
            touchZone.classList.remove('active-radar-ui');
            touchZone.style.display = "none";
        }
        
        // Limpiar interfaz y señales activas al apagar
        if(typeof resetUI === 'function') resetUI(true); 
    }
    
    // 4. Actualizar visualización de secuencia
    if(typeof updateSymbols === 'function') updateSymbols();
}

// --- FUNCIÓN FLEX (CON AUTO-APAGADO DE NEURAL) ---
function toggleFlex() {
    if (isSignalActive) return; 

    flexMode = !flexMode;
    const fBtn = document.getElementById('flexBtn');
    const nBtn = document.getElementById('neuralBtn');
    
    // SI ACTIVAMOS FLEX, APAGAMOS NEURAL (Lógica de tu ADN)
    if(flexMode) {
        neuralMode = false;
        if(nBtn) {
            nBtn.classList.remove('active');
            nBtn.style.backgroundColor = "transparent";
            nBtn.style.color = "#00f3ff";
        }
    }

    // Actualización visual del botón Flex
    if(fBtn) {
        if(flexMode) {
            fBtn.classList.add('active');
            fBtn.style.backgroundColor = "#8957e5";
            fBtn.style.color = "#ffffff";
        } else {
            fBtn.classList.remove('active');
            fBtn.style.backgroundColor = "transparent";
            fBtn.style.color = "#8957e5";
        }
    }
refreshVisualButtons();
    // --- EL TRUCO PARA LA ACTUALIZACIÓN INSTANTÁNEA ---
    // Llamamos a la UI usando el cache que creamos en el Paso 1
    if (typeof updateAnalyticUI === 'function') {
        updateAnalyticUI(
            lastTelemetryCache.noise,
            lastTelemetryCache.power,
            lastTelemetryCache.ms,
            lastTelemetryCache.recent,
            lastTelemetryCache.trend
        );
    }

    if(typeof saveConfig === 'function') saveConfig();
    if(typeof AudioEngine !== 'undefined') AudioEngine.play("CLICK");
}
refreshVisualButtons();
// --- REGISTRO DE ENTRADAS (CLICS/TOUCH) ---
function registerInput(val) {
    // 1. Validación de Configuración con Limpieza Automática
    if (selectedTime === null || riskLevel === null) {
        const statusMsg = document.getElementById('op-status');
        if(statusMsg) {
            statusMsg.innerHTML = "<span style='color:var(--down-neon)'>⚠️ CONFIGURACIÓN PENDIENTE</span>";
        }
        if(typeof AudioEngine !== 'undefined') AudioEngine.play("CLICK"); 
        return; 
    }

    // 2. Filtros de Estado (Radar apagado o Señal en curso)
    if (!mouseEnabled || isSignalActive || (typeof signalCooldown !== 'undefined' && signalCooldown)) return;

    const now = Date.now();
    const diff = (lastClickTime === 0) ? 0 : now - lastClickTime;
    
    // Evitar ruidos de clics demasiado rápidos (menores a 60ms suelen ser errores de hardware)
    if (diff > 0 && diff < 60) return;

    lastClickTime = now;

    if(typeof AudioEngine !== 'undefined') AudioEngine.play("CLICK");

    // 3. Gestión de Memoria de Secuencia
    sequence.push({ val, diff });
    if (sequence.length > 30) sequence.shift(); 

    // 4. Actualización del Gráfico con Límites (Safe-Flow)
    const lastPoint = chartData[chartData.length - 1];
    let nextPoint = val === 'A' ? lastPoint + 5 : lastPoint - 5;
    
    // Mantener el gráfico dentro de un rango visible (entre 10 y 70 para base 40)
    if (nextPoint > 80) nextPoint = 78;
    if (nextPoint < 10) nextPoint = 12;

    chartData.push(nextPoint);
    if (chartData.length > 40) chartData.shift();

    // 5. Orquestación de Actualización
    if(typeof drawChart === 'function') drawChart();
    if(typeof updateSymbols === 'function') updateSymbols();
    
    // Limpiar mensajes de advertencia previos al recibir datos válidos
    const statusMsg = document.getElementById('op-status');
    if(statusMsg && statusMsg.innerText.includes("SELECCIONE")) {
        statusMsg.innerText = "RADAR ESCANEANDO...";
        statusMsg.style.color = "var(--up-neon)";
    }

    // 6. Disparo del Motor IA (Asíncrono)
    if(typeof analyze === 'function') {
        // Usamos un pequeño delay o requestAnimationFrame para no saturar el hilo principal
        setTimeout(analyze, 10);
    }
}

// --- DESHACER ÚLTIMA ENTRADA ---
function undoLastInput(e) {
    if(e) e.preventDefault(); 
    if (sequence.length === 0 || isSignalActive) return;

    sequence.pop();
    chartData = Array(40).fill(40);
    sequence.forEach(s => {
        const lastPoint = chartData[chartData.length - 1];
        chartData.push(s.val === 'A' ? lastPoint + 5 : lastPoint - 5);
    });

    lastClickTime = 0; 
    if(typeof AudioEngine !== 'undefined') AudioEngine.play("CLICK");
    
    if(typeof drawChart === 'function') drawChart();
    if(typeof updateSymbols === 'function') updateSymbols();
    if(typeof analyze === 'function') analyze();
}

// --- CONFIGURACIÓN DE PARÁMETROS ---

function setTime(s, btn) {
    if (isSignalActive) return;
    selectedTime = s;
    const buttons = document.querySelectorAll('#time-group .btn');
    buttons.forEach(b => b.classList.remove('active'));
    
    if(btn) {
        btn.classList.add('active');
    } else {
        document.getElementById(`t${s}`)?.classList.add('active');
    }
    saveConfig();
    if(typeof AudioEngine !== 'undefined') AudioEngine.play("CLICK");
}

function setRisk(r, btn) {
    if (isSignalActive) return;

    // 1. Actualizamos la variable global de riesgo
    riskLevel = r;

    // 2. Localizamos los botones de riesgo por sus IDs específicos (r1, r2, r3)
    // Esto es más preciso que usar selectores genéricos de clase
    const riskIds = ['r1', 'r2', 'r3'];
    
    riskIds.forEach(id => {
        const b = document.getElementById(id);
        if (b) {
            b.classList.remove('active');
            b.style.boxShadow = "none";
            b.style.borderColor = "var(--border)"; // Reset al color original
        }
    });

    // 3. Activamos el botón seleccionado (ya sea por clic o por carga de config)
    const activeBtn = btn || document.getElementById(`r${r}`);
    
    if(activeBtn) {
        activeBtn.classList.add('active');
        
        // --- ESTÉTICA SUPER-IA V23 ---
        // Asignamos colores de advertencia: R1 (Verde), R2 (Amarillo), R3 (Rojo Sniper)
        const levelColors = ["#00ff88", "#f1c40f", "#ff2e63"];
        const selectedColor = levelColors[r - 1];
        
        activeBtn.style.borderColor = selectedColor;
        activeBtn.style.boxShadow = `0 0 12px ${selectedColor}66`;
    }

    // 4. Guardar y Sonido
    saveConfig();
    if(typeof AudioEngine !== 'undefined') AudioEngine.play("CLICK");
    
    console.log(`🎯 Nivel de Riesgo ajustado: N${r}`);
}

// --- BOTONES DE MODOS ---

function toggleFlexMode() { 
    toggleFlex();
}

function toggleNeuralMode() { 
    if (isSignalActive) return;
    
    if (tradeHistory.length < 10 && !neuralMode) {
        alert("IA requiere al menos 10 operaciones de entrenamiento.");
        return;
    }
    
    neuralMode = !neuralMode;
    const nBtn = document.getElementById('neuralBtn');
    const fBtn = document.getElementById('flexBtn');

    if(neuralMode) {
        flexMode = false;
        if(fBtn) {
            fBtn.classList.remove('active');
            fBtn.style.backgroundColor = "transparent";
            fBtn.style.color = "#8957e5"; 
        }
    }

    if(nBtn) {
        if(neuralMode) {
            nBtn.classList.add('active');
            nBtn.style.backgroundColor = "#00f3ff";
            nBtn.style.color = "#000000";
        } else {
            nBtn.classList.remove('active');
            nBtn.style.backgroundColor = "transparent";
            nBtn.style.color = "#00f3ff";
        }
    }

    saveConfig();
    if(typeof AudioEngine !== 'undefined') AudioEngine.play("CLICK");
}

function toggleTrendMode() {
    if (isSignalActive) return;
    trendFilterMode = !trendFilterMode;
    const tBtn = document.getElementById('trendBtn');
    if(tBtn) tBtn.classList.toggle('active', trendFilterMode);
    saveConfig();
    if(typeof AudioEngine !== 'undefined') AudioEngine.play("CLICK");
}

function toggleConfluence() {
    if (isSignalActive) return;
    confluenceMode = !confluenceMode;
    const btn = document.getElementById('confluenceBtn');
    if(btn) btn.classList.toggle('active', confluenceMode);
    saveConfig();
    if(typeof AudioEngine !== 'undefined') AudioEngine.play("CLICK");
}

function toggleAdaptive() {
    if (isSignalActive) return;
    adaptiveVolatility = !adaptiveVolatility;
    const btn = document.getElementById('adaptiveBtn');
    if(btn) btn.classList.toggle('active', adaptiveVolatility);
    saveConfig();
    if(typeof AudioEngine !== 'undefined') AudioEngine.play("CLICK");
}

// --- NUEVAS FUNCIONES DE MODO AUTÓNOMO ---

function toggleAutoPilot() {
    if (isSignalActive) return;
    
    autoPilotMode = !autoPilotMode;
    const btn = document.getElementById('autoPilotBtn');
    
    if(btn) {
        if(autoPilotMode) {
            btn.classList.add('active');
            btn.style.boxShadow = "0 0 15px #ff9f43";
            btn.innerText = "PILOTO AUTO: ON";
        } else {
            btn.classList.remove('active');
            btn.style.boxShadow = "none";
            btn.innerText = "MODO AUTÓNOMO";
        }
    }
    saveConfig();
    if(typeof AudioEngine !== 'undefined') AudioEngine.play("CLICK");
}


// --- ATAJOS DE TECLADO ---
window.addEventListener('keydown', (e) => {
    if (isSignalActive) return;
    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') registerInput('A');
    if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') registerInput('B');
    if ((e.key.toLowerCase() === 'z') && e.ctrlKey) undoLastInput();
});

// --- LIMPIEZA ---
function clearFullHistory() {
    if (confirm("¿RESET TOTAL?")) {
        localStorage.clear();
        location.reload();
    }
}
function exportHistoryToCSV() {
    if (tradeHistory.length === 0) {
        alert("No hay datos en la sesión actual.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    // Cabeceras de las columnas para tu análisis
    csvContent += "Fecha,Resultado,Riesgo,Tiempo,Modo_Neural,Modo_Flex,Tendencia,Confluencia,Fuerza_IA\r\n";

    tradeHistory.forEach(trade => {
        const row = [
            new Date(trade.timestamp || Date.now()).toLocaleTimeString(),
            trade.win ? "WIN" : "LOSS",
            trade.riskAtTrade || riskLevel,
            trade.timeAtTrade || selectedTime,
            trade.neuralAtTrade ? "ON" : "OFF",
            trade.flexAtTrade ? "ON" : "OFF",
            trade.trendAtTrade || "N/A",
            trade.confluenceAtTrade ? "ON" : "OFF",
            trade.strength || "0"
        ].join(",");
        csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Quantum_Alpha_Session_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
/**
 * Sincroniza el tiempo seleccionado con el motor del sistema
 */
function syncSelectedTime(seconds) {
    if (!isNaN(seconds) && seconds > 0) {
        selectedTime = seconds;
        console.log(`⏱️ SISTEMA: Tiempo actualizado a ${seconds}s`);
        
        // Efecto de sonido si existe el motor
        if(typeof AudioEngine !== 'undefined') AudioEngine.play("CLICK");
    }
}

/**
 * Intérprete de tiempo manual (5m, 1h, 10s)
 */
function parseManualTime(str) {
    str = str.toLowerCase().trim();
    let seconds = 0;

    if (str.endsWith('s')) seconds = parseInt(str);
    else if (str.endsWith('m')) seconds = parseInt(str) * 60;
    else if (str.endsWith('h')) seconds = parseInt(str) * 3600;
    else if (str.endsWith('d')) seconds = parseInt(str) * 86400;
    else seconds = parseInt(str); // Por defecto segundos

    const inputEl = document.getElementById('manualTime');
    if (!isNaN(seconds) && seconds > 0) {
        syncSelectedTime(seconds);
        inputEl.style.color = "var(--up-neon)"; // Verde si es válido
    } else {
        inputEl.style.color = "var(--down-neon)"; // Rojo si hay error
    }
}
function cycleRisk() {
    // 1. Ciclo de niveles (1 -> 2 -> 3 -> 1)
    riskLevel = (riskLevel % 3) + 1;

    // 2. Referencias a la UI
    const riskBtn = document.getElementById('risk-cycle-btn');
    const opDetails = document.getElementById('op-details');
    
    // 3. Configuración visual por nivel
    const config = {
        1: { label: "N1: CONSERVADOR", color: "#00ff88", detail: "FILTRO DE RIESGO MÁXIMO" },
        2: { label: "N2: MODERADO", color: "#4a90e2", detail: "EQUILIBRIO INSTITUCIONAL" },
        3: { label: "N3: SNIPER", color: "#ff9f43", detail: "ALTA PRECISIÓN V23" }
    };

    // 4. Aplicar cambios al botón (USANDO SETPROPERTY PARA FORZAR COLOR)
    if(riskBtn) {
        riskBtn.innerText = `R: N${riskLevel}`;
        // Usamos setProperty con 'important' para vencer al CSS original
        riskBtn.style.setProperty('border-color', config[riskLevel].color, 'important');
        riskBtn.style.setProperty('color', config[riskLevel].color, 'important');
        
        // Efecto de brillo extra si es N3
        if(riskLevel === 3) {
            riskBtn.style.setProperty('box-shadow', '0 0 10px rgba(255, 159, 67, 0.3)', 'important');
        } else {
            riskBtn.style.setProperty('box-shadow', 'none', 'important');
        }
    }

    // 5. Dinamizar el detalle de la señal (OP-DETAILS)
    if(opDetails) {
        opDetails.innerText = config[riskLevel].detail;
        opDetails.style.setProperty('color', config[riskLevel].color, 'important');
    }

    // 6. Persistencia y Audio
    if(typeof saveConfig === 'function') saveConfig();
    if(typeof AudioEngine !== 'undefined') AudioEngine.play("CLICK");
    
    // Sincronizar por si hay otras funciones escuchando
    if(typeof refreshVisualButtons === 'function') refreshVisualButtons();

    console.log(`⚖️ RIESGO V23: Nivel ${riskLevel} activo`);
}






// --- NUEVA FUNCIÓN: ADAPTAR INTERFAZ AL DISPOSITIVO ---
function toggleAdaptativeView() {
    const terminal = document.getElementById('main-terminal');
    
    if (!document.fullscreenElement) {
        // Entrar en modo Adaptativo (Pantalla Completa)
        if (terminal.requestFullscreen) {
            terminal.requestFullscreen();
        } else if (terminal.webkitRequestFullscreen) { // iOS/Safari
            terminal.webkitRequestFullscreen();
        }
        
        terminal.classList.add('terminal-fullscreen');
        console.log("📱 Interfaz adaptada al dispositivo.");
    } else {
        // Salir del modo Adaptativo
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        terminal.classList.remove('terminal-fullscreen');
    }
    
    // Forzar redibujado del gráfico para evitar distorsión
    setTimeout(() => {
        if(typeof initCanvas === 'function') initCanvas();
    }, 300);
}

// --- NUEVA FUNCIÓN: REINICIO TOTAL ---
function hardResetApp() {
    if (confirm("⚠️ ¿ADVERTENCIA: Reiniciar todo el sistema? Se borrarán datos temporales.")) {
        // 1. Limpiar todos los intervalos activos
        if (countdownInterval) clearInterval(countdownInterval);
        
        // 2. Limpiar Storage si es necesario (Opcional: puedes comentar esto si quieres guardar historial)
        // localStorage.clear(); 

        // 3. Efecto visual de apagado
        document.body.style.opacity = "0";
        
        // 4. Recarga total de la aplicación
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }
}
