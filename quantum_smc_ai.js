// quantum_smc_ai.js - Módulo de Inteligencia Institucional 2025-2026
const QuantumSMC = {
    // 1. PD ARRAY MATRIX (Jerarquía Octubre 2025)
    matrix: {
        SUSPENSION: { level: 7, weight: 15, name: "Suspension Block" }, 
        PROPULSION: { level: 6, weight: 12, name: "Propulsion Block" },
        BREAKER:    { level: 5, weight: 10, name: "Breaker Block" },
        ORDER_BLOCK:{ level: 4, weight: 8,  name: "Order Block" },
        IFVG:       { level: 3, weight: 7,  name: "Inverted FVG" },
        FVG:        { level: 2, weight: 5,  name: "Fair Value Gap" },
        LIQUIDITY:  { level: 1, weight: 3,  name: "Liquidity Void" }
    },

    // 2. IPDA ENGINE (Tiempo > Precio)
    getIPDAStatus() {
        const now = new Date();
        const hr = now.getUTCHours() - 5; // Ajuste NY (EST)
        
        if (hr === 0) return { phase: "MIDNIGHT_OPEN", power: 1.5 };
        if (hr >= 2 && hr <= 5) return { phase: "LONDON_OPEN", power: 2.0 };
        if (hr >= 8 && hr <= 10) return { phase: "NY_OPEN_VENOM", power: 2.5 }; 
        if (hr >= 10 && hr <= 11) return { phase: "SILVER_BULLET", power: 2.2 };
        return { phase: "MACRO_CONSOLIDATION", power: 0.5 };
    },

    // 3. DETECTOR DE MODELOS AVANZADOS (Venom, Zircon, Judas)
    detectSetups() {
        const ipda = this.getIPDAStatus();
        const mss = this.checkMarketStructureShift();
        const sweep = this.checkLiquiditySweep();
        const currentPower = this.getDynamicPower();
        const currentNoise = this.getDynamicNoise();
        
        if (ipda.phase === "NY_OPEN_VENOM" && sweep && currentPower > 8) {
            return { name: "VENOM MODEL", signal: "HIGH_PROB", target: "50-80 Ticks" };
        }
        if (currentNoise < 20 && currentPower > 9 && this.isProtectedLevel()) {
            return { name: "ZIRCON MODEL", signal: "ULTRA_PRECISION", target: "Extreme Liquidity" };
        }
        if (ipda.phase.includes("OPEN") && currentPower > 7 && mss === "FAKE") {
            return { name: "JUDAS SWING", signal: "TRAP", action: "AVOID_OR_REVERSE" };
        }
        return null;
    },

    // 4. LÓGICA DE ESTRUCTURA (BOS, MSS, CHOCH)
    checkMarketStructureShift() {
        if (typeof getMajorTrend !== 'function') return "CONTINUATION";
        const trend = getMajorTrend();
        const currentPower = this.getDynamicPower();
        
        if (trend === "BEARISH" && currentPower > 8.5) return "BULLISH_MSS";
        if (trend === "BULLISH" && currentPower > 8.5) return "BEARISH_MSS";
        return "CONTINUATION";
    },

    // 5. CÁLCULO DE CONFLUENCIA MAESTRA
    getSMCConfluenceScore() {
        let score = 0;
        const setup = this.detectSetups();
        const ipda = this.getIPDAStatus();
        
        if (setup) score += 10; 
        score *= ipda.power;    

        return score;
    },

    // --- AUXILIARES TÉCNICOS SINCRONIZADOS CON EL DOM ---
    getDynamicPower() {
        const el = document.getElementById('power-index');
        return el ? parseFloat(el.innerText.replace('POWER: ', '')) : 0;
    },
    
    getDynamicNoise() {
        const el = document.getElementById('noise-index');
        return el ? parseFloat(el.innerText.replace('NOISE: ', '').replace('%', '')) : 0;
    },

    checkLiquiditySweep() { 
        if (typeof sequence === 'undefined' || sequence.length < 5) return false;
        return sequence.slice(-5).every(s => s.val === 'A') || sequence.slice(-5).every(s => s.val === 'B'); 
    },

    isProtectedLevel() { 
        if (typeof tradeHistory === 'undefined') return false;
        return tradeHistory.slice(-10).filter(t => !t.win).length < 2; 
    },

    isPremiumDiscount() {
        if (typeof chartData === 'undefined' || chartData.length === 0) return "NEUTRAL";
        const avg = chartData.reduce((a,b)=>a+b,0)/chartData.length;
        return chartData[chartData.length-1] > avg ? "PREMIUM" : "DISCOUNT";
    },

    // --- NUEVAS FUNCIONES DE FILTRADO QUIRÚRGICO (INTEGRACIÓN SUPER-IA) ---

    /**
     * Verifica si el movimiento actual tiene cuerpo y fuerza real (Expansión)
     */
    checkExpansion() {
        if (typeof chartData === 'undefined' || chartData.length < 5) return false;
        const lastFive = chartData.slice(-5);
        const range = Math.max(...lastFive) - Math.min(...lastFive);
        return range > 15; // Mínimo de desplazamiento para validar el bono
    },

    /**
     * Detecta si el precio ha corrido demasiado sin retroceso (Agotamiento)
     * Basado en una racha de 7 impulsos unidireccionales
     */
    isPriceExhausted() {
        if (typeof sequence === 'undefined' || sequence.length < 7) return false;
        const lastSeven = sequence.slice(-7).map(s => s.val);
        // Si las últimas 7 son idénticas, hay agotamiento institucional
        return lastSeven.every(v => v === lastSeven[0]);
    }
};