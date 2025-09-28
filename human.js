// Human Activity Simulator v1.0
// Simulador de Atividade Humana com Interface Flutuante

(function() {
    'use strict';
    
    // Evita múltiplas instâncias
    if (window.humanSimulatorActive) {
        console.log('Human Simulator já está ativo');
        return;
    }
    window.humanSimulatorActive = true;

    // Configurações padrão
    let config = {
        permanenceTime: 5 * 60 * 1000, // 5 minutos em ms
        minClickInterval: 2000, // 2 segundos
        maxClickInterval: 15000, // 15 segundos
        clickVariation: 0.3, // 30% de variação
        scrollEnabled: true,
        mouseMoveEnabled: true,
        keyboardEnabled: false,
        isActive: false
    };

    let simulatorInterval = null;
    let clickTimeout = null;
    let mouseMoveInterval = null;
    let scrollInterval = null;

    // Utility functions para comportamento humano
    const utils = {
        // Gera número aleatório com distribuição mais humana
        humanRandom: (min, max) => {
            const r1 = Math.random();
            const r2 = Math.random();
            const gaussian = (r1 + r2) / 2; // Aproxima distribuição normal
            return min + (max - min) * gaussian;
        },

        // Gera delay com variação humana
        generateDelay: (base, variation = 0.3) => {
            const min = base * (1 - variation);
            const max = base * (1 + variation);
            return utils.humanRandom(min, max);
        },

        // Encontra elementos clicáveis
        getClickableElements: () => {
            const selectors = [
                'button', 'a', '[onclick]', '[role="button"]',
                'input[type="button"]', 'input[type="submit"]',
                '.btn', '.button', '.clickable'
            ];
            
            const elements = [];
            selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    if (utils.isElementVisible(el)) {
                        elements.push(el);
                    }
                });
            });
            return elements;
        },

        // Verifica se elemento está visível
        isElementVisible: (element) => {
            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);
            return (
                rect.width > 0 && 
                rect.height > 0 && 
                style.visibility !== 'hidden' && 
                style.display !== 'none' &&
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= window.innerHeight &&
                rect.right <= window.innerWidth
            );
        },

        // Simula movimento natural do mouse
        simulateMouseMove: () => {
            const x = utils.humanRandom(100, window.innerWidth - 100);
            const y = utils.humanRandom(100, window.innerHeight - 100);
            
            const event = new MouseEvent('mousemove', {
                bubbles: true,
                cancelable: true,
                clientX: x,
                clientY: y
            });
            
            document.dispatchEvent(event);
        },

        // Simula scroll natural
        simulateScroll: () => {
            const maxScroll = document.body.scrollHeight - window.innerHeight;
            if (maxScroll <= 0) return;
            
            const currentScroll = window.pageYOffset;
            const direction = Math.random() > 0.5 ? 1 : -1;
            const scrollAmount = utils.humanRandom(50, 200) * direction;
            const newScroll = Math.max(0, Math.min(maxScroll, currentScroll + scrollAmount));
            
            window.scrollTo({
                top: newScroll,
                behavior: 'smooth'
            });
        }
    };

    // Sistema de cliques inteligentes
    const clickSystem = {
        performClick: () => {
            const elements = utils.getClickableElements();
            if (elements.length === 0) return;
            
            // Evita elementos perigosos
            const safeElements = elements.filter(el => {
                const tagName = el.tagName.toLowerCase();
                const classes = el.className.toLowerCase();
                const text = el.textContent.toLowerCase();
                
                // Lista de elementos/textos a evitar
                const dangerousPatterns = [
                    'delete', 'remove', 'logout', 'sign out',
                    'purchase', 'buy', 'pay', 'submit',
                    'close', 'exit', 'cancel'
                ];
                
                return !dangerousPatterns.some(pattern => 
                    text.includes(pattern) || classes.includes(pattern)
                );
            });
            
            if (safeElements.length === 0) return;
            
            const element = safeElements[Math.floor(Math.random() * safeElements.length)];
            clickSystem.clickElement(element);
        },

        clickElement: (element) => {
            const rect = element.getBoundingClientRect();
            const x = rect.left + utils.humanRandom(5, rect.width - 5);
            const y = rect.top + utils.humanRandom(5, rect.height - 5);
            
            // Simula sequência natural: mousedown -> mouseup -> click
            const events = ['mousedown', 'mouseup', 'click'];
            events.forEach((eventType, index) => {
                setTimeout(() => {
                    const event = new MouseEvent(eventType, {
                        bubbles: true,
                        cancelable: true,
                        clientX: x,
                        clientY: y,
                        button: 0
                    });
                    element.dispatchEvent(event);
                }, index * utils.humanRandom(10, 50));
            });
        },

        scheduleNextClick: () => {
            if (!config.isActive) return;
            
            const delay = utils.generateDelay(
                utils.humanRandom(config.minClickInterval, config.maxClickInterval),
                config.clickVariation
            );
            
            clickTimeout = setTimeout(() => {
                if (config.isActive) {
                    clickSystem.performClick();
                    clickSystem.scheduleNextClick();
                }
            }, delay);
        }
    };

    // Interface do usuário
    const ui = {
        createMenu: () => {
            // Remove menu existente se houver
            const existingMenu = document.getElementById('humanSimulatorMenu');
            if (existingMenu) existingMenu.remove();

            const menu = document.createElement('div');
            menu.id = 'humanSimulatorMenu';
            menu.innerHTML = `
                <div style="
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    width: 300px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 15px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                    color: white;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 14px;
                    z-index: 999999;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                ">
                    <div style="
                        padding: 15px;
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                        cursor: move;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    " id="menuHeader">
                        <strong>🤖 Human Simulator</strong>
                        <span style="cursor: pointer; font-size: 18px;" id="closeMenu">×</span>
                    </div>
                    <div style="padding: 15px;" id="menuContent">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px;">⏱️ Tempo de Permanência (min):</label>
                            <input type="number" id="permanenceTime" value="5" min="1" max="60" style="
                                width: 100%;
                                padding: 8px;
                                border: none;
                                border-radius: 8px;
                                background: rgba(255,255,255,0.1);
                                color: white;
                                font-size: 14px;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px;">🖱️ Intervalo de Cliques (seg):</label>
                            <div style="display: flex; gap: 10px;">
                                <input type="number" id="minInterval" value="2" min="1" max="30" placeholder="Min" style="
                                    flex: 1;
                                    padding: 8px;
                                    border: none;
                                    border-radius: 8px;
                                    background: rgba(255,255,255,0.1);
                                    color: white;
                                    font-size: 14px;
                                ">
                                <input type="number" id="maxInterval" value="15" min="5" max="120" placeholder="Max" style="
                                    flex: 1;
                                    padding: 8px;
                                    border: none;
                                    border-radius: 8px;
                                    background: rgba(255,255,255,0.1);
                                    color: white;
                                    font-size: 14px;
                                ">
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input type="checkbox" id="scrollEnabled" checked style="margin-right: 8px;">
                                📜 Simular Scroll
                            </label>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input type="checkbox" id="mouseMoveEnabled" checked style="margin-right: 8px;">
                                🖱️ Movimento do Mouse
                            </label>
                        </div>
                        
                        <div style="display: flex; gap: 10px;">
                            <button id="startSimulator" style="
                                flex: 1;
                                padding: 10px;
                                border: none;
                                border-radius: 8px;
                                background: #4CAF50;
                                color: white;
                                font-weight: bold;
                                cursor: pointer;
                                transition: all 0.3s;
                            ">▶️ Iniciar</button>
                            <button id="stopSimulator" style="
                                flex: 1;
                                padding: 10px;
                                border: none;
                                border-radius: 8px;
                                background: #f44336;
                                color: white;
                                font-weight: bold;
                                cursor: pointer;
                                transition: all 0.3s;
                            ">⏹️ Parar</button>
                        </div>
                        
                        <div style="margin-top: 15px; text-align: center;">
                            <div id="status" style="
                                padding: 8px;
                                border-radius: 8px;
                                background: rgba(255,255,255,0.1);
                                font-size: 12px;
                            ">Status: Inativo</div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(menu);
            ui.bindEvents();
            ui.makeDraggable();
        },

        bindEvents: () => {
            // Botão fechar
            document.getElementById('closeMenu').onclick = () => {
                simulator.stop();
                document.getElementById('humanSimulatorMenu').remove();
                window.humanSimulatorActive = false;
            };

            // Botões de controle
            document.getElementById('startSimulator').onclick = () => {
                ui.updateConfig();
                simulator.start();
            };

            document.getElementById('stopSimulator').onclick = () => {
                simulator.stop();
            };

            // Atualização em tempo real das configurações
            ['permanenceTime', 'minInterval', 'maxInterval'].forEach(id => {
                document.getElementById(id).oninput = ui.updateConfig;
            });

            ['scrollEnabled', 'mouseMoveEnabled'].forEach(id => {
                document.getElementById(id).onchange = ui.updateConfig;
            });
        },

        updateConfig: () => {
            config.permanenceTime = parseInt(document.getElementById('permanenceTime').value) * 60 * 1000;
            config.minClickInterval = parseInt(document.getElementById('minInterval').value) * 1000;
            config.maxClickInterval = parseInt(document.getElementById('maxInterval').value) * 1000;
            config.scrollEnabled = document.getElementById('scrollEnabled').checked;
            config.mouseMoveEnabled = document.getElementById('mouseMoveEnabled').checked;
        },

        updateStatus: (status) => {
            const statusEl = document.getElementById('status');
            if (statusEl) statusEl.textContent = `Status: ${status}`;
        },

        makeDraggable: () => {
            const menu = document.getElementById('humanSimulatorMenu');
            const header = document.getElementById('menuHeader');
            let isDragging = false;
            let startX, startY, initialX, initialY;

            header.onmousedown = (e) => {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                const rect = menu.getBoundingClientRect();
                initialX = rect.left;
                initialY = rect.top;
                e.preventDefault();
            };

            document.onmousemove = (e) => {
                if (!isDragging) return;
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                menu.style.left = (initialX + deltaX) + 'px';
                menu.style.top = (initialY + deltaY) + 'px';
                menu.style.right = 'auto';
            };

            document.onmouseup = () => {
                isDragging = false;
            };
        }
    };

    // Sistema principal do simulador
    const simulator = {
        start: () => {
            if (config.isActive) return;
            
            config.isActive = true;
            ui.updateStatus('Ativo');
            
            // Inicia sistema de cliques
            clickSystem.scheduleNextClick();
            
            // Inicia movimento do mouse
            if (config.mouseMoveEnabled) {
                mouseMoveInterval = setInterval(() => {
                    if (config.isActive) utils.simulateMouseMove();
                }, utils.humanRandom(3000, 8000));
            }
            
            // Inicia scroll
            if (config.scrollEnabled) {
                scrollInterval = setInterval(() => {
                    if (config.isActive) utils.simulateScroll();
                }, utils.humanRandom(10000, 30000));
            }
            
            // Timer de permanência
            if (config.permanenceTime > 0) {
                simulatorInterval = setTimeout(() => {
                    simulator.stop();
                    ui.updateStatus('Tempo esgotado - Parando...');
                }, config.permanenceTime);
            }
            
            console.log('Human Simulator iniciado');
        },

        stop: () => {
            config.isActive = false;
            
            // Limpa todos os timers
            if (simulatorInterval) {
                clearTimeout(simulatorInterval);
                simulatorInterval = null;
            }
            
            if (clickTimeout) {
                clearTimeout(clickTimeout);
                clickTimeout = null;
            }
            
            if (mouseMoveInterval) {
                clearInterval(mouseMoveInterval);
                mouseMoveInterval = null;
            }
            
            if (scrollInterval) {
                clearInterval(scrollInterval);
                scrollInterval = null;
            }
            
            ui.updateStatus('Inativo');
            console.log('Human Simulator parado');
        }
    };

    // Inicialização
    ui.createMenu();
    console.log('Human Simulator carregado com sucesso!');
    
    // Cleanup quando a página for recarregada
    window.addEventListener('beforeunload', () => {
        simulator.stop();
        window.humanSimulatorActive = false;
    });

})();
