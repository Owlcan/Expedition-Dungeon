/**
 * Primary Map Control System - Loaded before all other scripts
 */

// Force this script to load first
document.currentScript.setAttribute('priority', 'nuclear');

const MapControl = {
    _initialized: false,
    _blocked: false,

    init() {
        if (this._initialized) return;
        this._initialized = true;

        // Block other scripts from taking control
        Object.defineProperty(window, 'mapControl', {
            value: this,
            writable: false,
            configurable: false
        });

        // Force our event handlers
        this._hijackEvents();
    },

    _hijackEvents() {
        // Capture all events that could affect map
        const events = ['mousedown', 'mousemove', 'mouseup', 'wheel', 'touchstart', 'touchmove', 'touchend'];
        
        events.forEach(type => {
            document.addEventListener(type, (e) => {
                if (this._blocked) return;

                // Allow drag operations only on monsters/players
                if (e.target.closest('.cell-monster, .cell-player')) {
                    this._blocked = true;
                    return;
                }

                // Block other handlers if we're controlling the map
                if (e.target.closest('.dungeon-map-container')) {
                    e.stopPropagation();
                }
            }, true);
        });

        // Reset block after drag operations
        document.addEventListener('dragend', () => {
            this._blocked = false;
        }, true);
    }
};

// Initialize immediately
MapControl.init();

// Export for Map_Protocols.js to use
export { MapControl };
