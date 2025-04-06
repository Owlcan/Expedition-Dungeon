/**
 * Map_Protocols.js - Nuclear map control system
 */

// Global initialization guard with forced override
if (window._mapControllerInitialized) {
    window._mapController.destroy();
}
window._mapControllerInitialized = true;

// Global transform intercept
const originalTransform = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'transform');
let globalTransformLock = false;

export class MapController {
    constructor(container) {
        // Core elements
        this.container = container;
        this.mapInner = container.querySelector('.dungeon-map-inner');
        this.dungeonMap = container.querySelector('#dungeonMap');
        this.miniMapContent = container.querySelector('.mini-map-content');
        this.viewBox = container.querySelector('.view-box');
        this.scaleIndicator = container.querySelector('.scale-indicator');

        // Control state
        this._scale = 1;
        this._translateX = 0;
        this._translateY = 0;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.scrollLeft = 0;
        this.scrollTop = 0;

        // Force singleton pattern
        if (window._mapController) {
            throw new Error('Only one map controller instance allowed');
        }
        window._mapController = this;

        // Initialize
        this.setupEventListeners();
        this.overrideExistingControls();

        // Ensure our transform takes precedence
        requestAnimationFrame(() => this.updateTransform());

        // Add mutation observer to protect our transform
        this.setupMutationObserver();

        // Block other scripts from manipulating map transforms
        this.lockMapControl();

        // Debug trace manipulation attempts
        this.setupDebugTracing();

        // Nuclear override of all transform operations
        this.hijackTransforms();

        // Force our control
        this.enforceControl();
    }

    // Getters/setters to ensure single source of truth
    get scale() { return this._scale; }
    set scale(value) {
        this._scale = Math.max(0.2, Math.min(5, value));
        this.updateTransform();
    }

    get translateX() { return this._translateX; }
    set translateX(value) {
        this._translateX = value;
        this.updateTransform();
    }

    get translateY() { return this._translateY; }
    set translateY(value) {
        this._translateY = value;
        this.updateTransform();
    }

    setupEventListeners() {
        if (!this.mapInner) return;

        this.mapInner.addEventListener('mousedown', (e) => {
            // Completely ignore any token-related events
            if (e.target.closest('.cell-monster, .cell-player')) {
                e.stopPropagation();
                return;
            }
            
            this.handleDragStart(e);
        });

        // Remove the global mousemove prevention
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.handleDragMove(e);
            }
        });

        document.addEventListener('mouseup', () => this.handleDragEnd());
        
        // Keep zoom handlers
        this.container.addEventListener('wheel', (e) => {
            if (!e.target.closest('.cell-monster, .cell-player')) {
                this.handleWheel(e);
            }
        });
        
        // Button handlers
        const zoomInBtn = this.container.querySelector('#zoomIn');
        const zoomOutBtn = this.container.querySelector('#zoomOut');
        const resetViewBtn = this.container.querySelector('#resetView');

        if (zoomInBtn) zoomInBtn.addEventListener('click', () => this.zoom('in'), { capture: true });
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => this.zoom('out'), { capture: true });
        if (resetViewBtn) resetViewBtn.addEventListener('click', () => this.resetView(), { capture: true });

        // Mini-map handler
        const miniMap = this.container.querySelector('.mini-map');
        if (miniMap) {
            miniMap.addEventListener('click', this.handleMiniMapClick.bind(this), { capture: true });
        }

        // Allow dungeon controls to work
        const dungeonControls = document.querySelector('.dungeon-controls');
        if (dungeonControls) {
            dungeonControls.addEventListener('click', (e) => {
                window._allowDungeonGeneration = true;
                return true;
            }, true);
        }
    }

    handleDragStart(e) {
        // Always allow token dragging
        if (e.target.closest('.cell-monster, .cell-player')) return true;

        if (e.defaultPrevented) return; // Respect token dragging

        // Don't interfere with draggable tokens
        if (e.target.hasAttribute('draggable') || 
            e.target.closest('[draggable="true"]') ||
            e.target.closest('.cell-monster') ||
            e.target.closest('.cell-player')) {
            return;
        }

        // Only allow panning when clicking map background or middle mouse
        if (e.button === 1 || (e.button === 0 && 
            (e.target === this.mapInner || e.target.classList.contains('dungeon-map')))) {
            this.isDragging = true;
            this.mapInner.classList.add('grabbing');
            this.startX = e.pageX - this.translateX;
            this.startY = e.pageY - this.translateY;
            this.scrollLeft = -this.translateX;
            this.scrollTop = -this.translateY;
            
            // Only prevent default if we're actually starting a pan
            if (this.isDragging) {
                e.preventDefault();
            }
        }
    }

    handleDragMove(e) {
        if (!this.isDragging) return;

        // Don't interfere with token dragging
        if (e.target.hasAttribute('draggable') || 
            e.target.closest('[draggable="true"]')) {
            return;
        }

        const x = e.pageX - this.mapInner.offsetLeft;
        const y = e.pageY - this.mapInner.offsetTop;
        const walkX = (x - this.startX);
        const walkY = (y - this.startY);

        this.translateX = -(this.scrollLeft - walkX);
        this.translateY = -(this.scrollTop - walkY);

        // Only prevent default if we're actually panning
        if (this.isDragging) {
            e.preventDefault();
        }
    }

    handleDragEnd() {
        if (this.isDragging) {
            this.isDragging = false;
            this.mapInner.classList.remove('grabbing');
        }
    }

    handleWheel(e) {
        if (!this.mapInner) return;
        e.preventDefault();
        e.stopPropagation();

        // Simple zoom calculation
        const delta = e.deltaY * -0.001;
        const newScale = Math.max(0.2, Math.min(5, this.scale * (1 + delta)));
        
        // Get mouse position relative to map
        const rect = this.mapInner.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate new position to zoom toward mouse
        const scale = newScale / this.scale;
        this.translateX = x - (x - this.translateX) * scale;
        this.translateY = y - (y - this.translateY) * scale;
        this.scale = newScale;

        this.updateTransform();
    }

    handleMiniMapClick(e) {
        if (!this.dungeonMap) return;

        const miniMap = e.currentTarget;
        const rect = miniMap.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();

        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const mapWidth = this.dungeonMap.offsetWidth;
        const mapHeight = this.dungeonMap.offsetHeight;

        const miniMapWidth = miniMap.offsetWidth;
        const miniMapHeight = miniMap.offsetHeight;
        const miniMapScale = Math.min(miniMapWidth / mapWidth, miniMapHeight / mapHeight) * 0.9;

        const targetX = (clickX / miniMapScale) * this.scale;
        const targetY = (clickY / miniMapScale) * this.scale;

        this.translateX = (containerRect.width / 2) - targetX;
        this.translateY = (containerRect.height / 2) - targetY;

        e.stopPropagation();
    }

    zoom(direction) {
        const rect = this.container.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const mapCenterBeforeZoomX = (centerX - this.translateX) / this.scale;
        const mapCenterBeforeZoomY = (centerY - this.translateY) / this.scale;

        if (direction === 'in') {
            this.scale = Math.min(this.scale * 1.2, 5);
        } else if (direction === 'out') {
            this.scale = Math.max(this.scale / 1.2, 0.2);
        }

        const mapCenterAfterZoomX = mapCenterBeforeZoomX * this.scale;
        const mapCenterAfterZoomY = mapCenterBeforeZoomY * this.scale;

        this.translateX = centerX - mapCenterAfterZoomX;
        this.translateY = centerY - mapCenterAfterZoomY;
    }

    resetView() {
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
    }

    updateTransform() {
        try {
            this._updatingTransform = true;
            const transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
            
            this.mapInner.style.setProperty('transform', transform, 'important');
            this.mapInner.style.setProperty('transform-origin', '0 0', 'important');
            
            if (this.scaleIndicator) {
                this.scaleIndicator.textContent = `${Math.round(this.scale * 100)}%`;
            }
            
            this.updateMiniMap();
        } finally {
            this._updatingTransform = false;
        }
    }

    updateMiniMap() {
        if (!this.miniMapContent || !this.viewBox || !this.dungeonMap) return;

        try {
            const mapWidth = this.dungeonMap.offsetWidth;
            const mapHeight = this.dungeonMap.offsetHeight;
            const containerWidth = this.container.offsetWidth;
            const containerHeight = this.container.offsetHeight;

            const miniMap = this.container.querySelector('.mini-map');
            const miniMapWidth = miniMap.offsetWidth;
            const miniMapHeight = miniMap.offsetHeight;
            const miniMapScale = Math.min(miniMapWidth / mapWidth, miniMapHeight / mapHeight) * 0.9;

            this.miniMapContent.innerHTML = this.dungeonMap.innerHTML;
            this.miniMapContent.style.transform = `scale(${miniMapScale})`;

            const viewBoxWidth = Math.min(containerWidth / mapWidth / this.scale * miniMapWidth, miniMapWidth);
            const viewBoxHeight = Math.min(containerHeight / mapHeight / this.scale * miniMapHeight, miniMapHeight);

            this.viewBox.style.width = `${viewBoxWidth}px`;
            this.viewBox.style.height = `${viewBoxHeight}px`;

            const viewBoxX = Math.abs(this.translateX) / mapWidth * miniMapWidth * miniMapScale;
            const viewBoxY = Math.abs(this.translateY) / mapHeight * miniMapHeight * miniMapScale;

            this.viewBox.style.left = `${viewBoxX}px`;
            this.viewBox.style.top = `${viewBoxY}px`;

            this.miniMapContent.querySelectorAll('td').forEach(td => {
                td.removeAttribute('title');
                td.style.cursor = 'default';
                td.style.pointerEvents = 'none';
            });
        } catch (err) {
            console.error('Error updating mini-map:', err);
        }
    }

    setupMutationObserver() {
        if (!this.mapInner) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const currentTransform = this.mapInner.style.transform;
                    const expectedTransform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
                    
                    if (currentTransform !== expectedTransform) {
                        requestAnimationFrame(() => this.updateTransform());
                    }
                }
            });
        });

        observer.observe(this.mapInner, {
            attributes: true,
            attributeFilter: ['style']
        });
    }

    lockMapControl() {
        const mapInner = this.mapInner;
        const originalSetAttribute = mapInner.setAttribute.bind(mapInner);
        const originalStyleSetter = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'style').set;
        
        // Lock transform manipulation
        Object.defineProperty(mapInner, 'style', {
            get() {
                return this._style;
            },
            set(value) {
                console.warn('Blocked direct style manipulation attempt');
                return false;
            }
        });

        // Override setAttribute to block transform changes
        mapInner.setAttribute = function(attr, value) {
            if (attr === 'style' && value.includes('transform')) {
                console.warn('Blocked transform manipulation attempt');
                return;
            }
            return originalSetAttribute(attr, value);
        };

        // Override style.transform
        Object.defineProperty(mapInner.style, 'transform', {
            get: () => this._currentTransform,
            set: (value) => {
                // Only allow changes from this controller
                if (this._updatingTransform) {
                    this._currentTransform = value;
                } else {
                    console.warn('Blocked unauthorized transform change');
                }
            }
        });
    }

    setupDebugTracing() {
        const trace = console.trace.bind(console);
        this.mapInner.addEventListener('transitionstart', () => {
            console.warn('Transform transition detected:');
            trace();
        }, true);
    }

    overrideExistingControls() {
        Object.defineProperties(window, {
            mapScale: {
                value: this.scale,
                writable: false,
                configurable: false
            },
            mapTranslateX: {
                value: this.translateX,
                writable: false,
                configurable: false
            },
            mapTranslateY: {
                value: this.translateY,
                writable: false,
                configurable: false
            },
            // Block any attempts to override our functions
            updateMapTransform: {
                value: () => this.updateTransform(),
                writable: false,
                configurable: false
            },
            updateMiniMap: {
                value: () => this.updateMiniMap(),
                writable: false,
                configurable: false
            },
            zoomMap: {
                value: (direction) => this.zoom(direction),
                writable: false,
                configurable: false
            },
            resetView: {
                value: () => this.resetView(),
                writable: false,
                configurable: false
            }
        });

        // Make this instance immutable
        Object.freeze(this);
    }

    hijackTransforms() {
        // Completely override transform property globally
        Object.defineProperty(CSSStyleDeclaration.prototype, 'transform', {
            get() {
                return this._transform;
            },
            set(value) {
                if (globalTransformLock) {
                    throw new Error('Unauthorized transform manipulation');
                }
                this._transform = value;
            },
            configurable: false
        });

        // Block all other transform methods
        ['translate', 'scale', 'rotate', 'matrix'].forEach(method => {
            Object.defineProperty(CSSStyleDeclaration.prototype, method, {
                value: () => { throw new Error('Transform methods blocked'); },
                writable: false,
                configurable: false
            });
        });
    }

    enforceControl() {
        // Skip all map controls if token is being dragged
        this._mouseMoveHandler = (e) => {
            if (window._tokenController?.draggedToken) return true;
            if (e.target.closest('.cell-monster, .cell-player')) return true;
            if (window._allowDungeonGeneration && e.target.closest('.dungeon-controls')) return true;
            
            if (!e._processedByController) {
                e.preventDefault();
                e.stopPropagation();
            }
        };
        
        // Remove the global mousemove handler that was breaking things
        if (this._mouseMoveHandler) {
            window.removeEventListener('mousemove', this._mouseMoveHandler, true);
        }
        
        // Only protect map transforms
        Object.defineProperties(this.mapInner, {
            style: {
                get: () => this._safeStyle,
                set: (value) => {
                    if (value.includes('transform') && !this._updatingTransform) {
                        console.warn('Blocked unauthorized transform');
                        return;
                    }
                    this._safeStyle = value;
                }
            }
        });
    }

    validateDragOperation(element) {
        // Always allow token operations
        if (element.closest('.cell-monster, .cell-player')) return true;
        if (window._tokenController?.draggedToken) return true;
        
        // Allow tokens and dungeon generation
        if (window._allowDungeonGeneration && element.closest('.dungeon-controls')) return true;
        
        return element.hasAttribute('data-map-protocols-draggable');
    }

    destroy() {
        // Clean up in a way that forces reinitialize
        globalTransformLock = false;
        Object.defineProperty(CSSStyleDeclaration.prototype, 'transform', originalTransform);
        window._mapControllerInitialized = false;
        this.mapInner.style.transform = 'none';
    }
}

// Force immediate initialization
window._mapController = new MapController(
    document.querySelector('.dungeon-map-container')
);

// Break anything that tries to remove our control
Object.defineProperty(window, '_mapController', {
    configurable: false,
    writable: false
});