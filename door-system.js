export class DoorSystem {
    constructor() {
        this.doors = new Map();
        this.keys = new Map();
    }

    addDoor(x, y, keyId) {
        this.doors.set(`${x},${y}`, {
            x, y,
            keyId,
            locked: true,
            type: 'normal' // or 'secret', 'magic', etc.
        });
    }

    addKey(x, y, keyId) {
        this.keys.set(keyId, {
            x, y,
            keyId,
            found: false
        });
    }

    unlockDoor(x, y, keyId) {
        const door = this.doors.get(`${x},${y}`);
        if (door && door.keyId === keyId) {
            door.locked = false;
            return true;
        }
        return false;
    }

    generateKeyPattern() {
        // Creates a logical sequence for key/door placement
        // Placeholder for future implementation
    }
}

export function setupDoorSystem(dungeon) {
    const doorSystem = new DoorSystem();
    
    // Add to existing dungeon generation
    dungeon.doors = doorSystem;
    
    // Setup door event handlers
    document.querySelector('.dungeon-map').addEventListener('click', (e) => {
        const cell = e.target.closest('td');
        if (!cell) return;
        
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        
        if (cell.classList.contains('door-locked')) {
            tryUnlockDoor(x, y, doorSystem);
        }
    });
    
    return doorSystem;
}

function tryUnlockDoor(x, y, doorSystem) {
    const door = doorSystem.doors.get(`${x},${y}`);
    if (!door || !door.locked) return;

    const keyId = prompt("Enter the key ID to unlock the door:");
    if (doorSystem.unlockDoor(x, y, keyId)) {
        alert("Door unlocked!");
        const cell = document.querySelector(`td[data-x="${x}"][data-y="${y}"]`);
        if (cell) {
            cell.classList.remove('door-locked');
            cell.classList.add('door-unlocked');
        }
    } else {
        alert("Failed to unlock the door. Check the key ID.");
    }
}