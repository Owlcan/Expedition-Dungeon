/**
 * map-functions.js - Granular utility functions for dungeon map generation
 * This file contains specialized functions that can be used by DungeonGenerator.js
 * without modifying the core generation logic.
 */

import { 
    generateTreasure,
    generateCoinTreasure,
    generateGemTreasure,
    generateItemTreasure,
    generateMagicalTreasure,
    generateTreasureHoard
} from './TreasureGenerator.js';

// Helper function to check if a position is within map boundaries
function isInBounds(x, y, width, height) {
    return x >= 0 && y >= 0 && x < width && y < height;
}

// Add control system check
function isMapControlBlocked() {
    return window.mapControl?._blocked || false;
}

// Add to validateDragOperation
export function validateDragOperation(element) {
    if (isMapControlBlocked()) return false;
    return element.hasAttribute('data-map-protocols-draggable');
}

/**
 * Applies cellular automata rules to smooth dungeon maps
 * @param {Array} cells - 2D array of cells
 * @param {number} iterations - Number of iterations to run
 * @param {number} birthLimit - Number of neighbors to birth a new cell
 * @param {number} deathLimit - Number of neighbors below which a cell dies
 * @returns {Array} Smoothed map
 */
export function smoothMap(cells, iterations = 1, birthLimit = 4, deathLimit = 3) {
    // Create a deep copy of the original grid to avoid modifying the input directly
    let currentMap = [];
    for (let y = 0; y < cells.length; y++) {
        currentMap[y] = [];
        for (let x = 0; x < cells[0].length; x++) {
            currentMap[y][x] = { ...cells[y][x] };
        }
    }
    
    // Run cellular automata for specified iterations
    for (let iter = 0; iter < iterations; iter++) {
        // Create a new map for this iteration
        let newMap = [];
        for (let y = 0; y < cells.length; y++) {
            newMap[y] = [];
            for (let x = 0; x < cells[0].length; x++) {
                // Start by copying the cell
                newMap[y][x] = { ...currentMap[y][x] };
                
                // Count neighboring walls
                let wallCount = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue; // Skip the cell itself
                        
                        // Check boundary
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx < 0 || ny < 0 || nx >= cells[0].length || ny >= cells.length) {
                            wallCount++; // Count out-of-bounds as walls
                            continue;
                        }
                        
                        if (currentMap[ny][nx].type === 'wall') {
                            wallCount++;
                        }
                    }
                }
                
                // Apply cellular automata rules
                if (currentMap[y][x].type === 'wall') {
                    // If a wall has few wall neighbors, make it a corridor (erosion)
                    if (wallCount < deathLimit) {
                        newMap[y][x] = { type: 'corridor', blocked: false };
                    }
                } else {
                    // If a corridor has many wall neighbors, make it a wall (accretion)
                    if (wallCount > birthLimit) {
                        newMap[y][x] = { type: 'wall', blocked: true };
                    }
                }
            }
        }
        
        // Update the current map for the next iteration
        currentMap = newMap;
    }
    
    return currentMap;
}

// Implementation for generating a maze using a recursive backtracking algorithm
export function generateMaze(width, height, random) {
    const maze = Array(height).fill().map(() => 
        Array(width).fill().map(() => ({ type: 'wall', blocked: true }))
    );
    
    // Starting point
    const startX = 1;
    const startY = 1;
    maze[startY][startX] = { type: 'corridor', blocked: false };
    
    const stack = [[startX, startY]];
    const directions = [[0, -2], [2, 0], [0, 2], [-2, 0]]; // Up, Right, Down, Left
    
    while (stack.length > 0) {
        const [currentX, currentY] = stack[stack.length - 1];
        
        // Find unvisited neighbors
        const neighbors = [];
        for (const [dx, dy] of directions) {
            const nx = currentX + dx;
            const ny = currentY + dy;
            
            if (isInBounds(nx, ny, width, height) && maze[ny][nx].type === 'wall') {
                neighbors.push([nx, ny, dx/2, dy/2]);
            }
        }
        
        if (neighbors.length > 0) {
            // Choose a random unvisited neighbor
            const [nx, ny, wallX, wallY] = neighbors[Math.floor(random ? random.next() * neighbors.length : Math.random() * neighbors.length)];
            
            // Carve passage
            maze[currentY + wallY][currentX + wallX] = { type: 'corridor', blocked: false };
            maze[ny][nx] = { type: 'corridor', blocked: false };
            
            // Push the new cell onto stack
            stack.push([nx, ny]);
        } else {
            // Backtrack
            stack.pop();
        }
    }
    
    return maze;
}

export function generateRoomsAndCorridors(width, height, random, options = {}) {
    const {
        minRooms = 10,
        maxRooms = 15,
        minRoomSize = 3,
        maxRoomSize = 8,
        corridorWidth = 1,
        roomSpacing = 1,
        removeDeadEnds = true
    } = options;

    // Create empty dungeon filled with walls
    const dungeon = Array(height).fill().map(() => 
        Array(width).fill().map(() => ({ type: 'wall', blocked: true }))
    );
    
    const rooms = [];
    
    // Generate rooms
    const roomAttempts = maxRooms * 2; // Give enough attempts to place rooms
    
    for (let i = 0; i < roomAttempts && rooms.length < maxRooms; i++) {
        const roomWidth = Math.floor(random.next() * (maxRoomSize - minRoomSize + 1) + minRoomSize);
        const roomHeight = Math.floor(random.next() * (maxRoomSize - minRoomSize + 1) + minRoomSize);
        
        const roomX = Math.floor(random.next() * (width - roomWidth - 2) + 1);
        const roomY = Math.floor(random.next() * (height - roomHeight - 2) + 1);
        
        // Check if the room overlaps with any existing room (including spacing)
        let overlaps = false;
        for (const room of rooms) {
            if (roomX - roomSpacing <= room.x + room.width && 
                roomX + roomWidth + roomSpacing >= room.x && 
                roomY - roomSpacing <= room.y + room.height && 
                roomY + roomHeight + roomSpacing >= room.y) {
                overlaps = true;
                break;
            }
        }
        
        if (!overlaps && rooms.length < maxRooms) {
            // Place the room
            for (let y = roomY; y < roomY + roomHeight; y++) {
                for (let x = roomX; x < roomX + roomWidth; x++) {
                    dungeon[y][x] = { type: 'room', blocked: false };
                }
            }
            
            rooms.push({ x: roomX, y: roomY, width: roomWidth, height: roomHeight });
        }
    }

    // Make sure we have at least minRooms
    if (rooms.length < minRooms) {
        return generateRoomsAndCorridors(width, height, random, options);
    }
    
    // Connect rooms with corridors
    for (let i = 0; i < rooms.length - 1; i++) {
        const startRoom = rooms[i];
        const endRoom = rooms[i + 1];
        
        // Start and end points from room centers
        const startX = Math.floor(startRoom.x + startRoom.width / 2);
        const startY = Math.floor(startRoom.y + startRoom.height / 2);
        const endX = Math.floor(endRoom.x + endRoom.width / 2);
        const endY = Math.floor(endRoom.y + endRoom.height / 2);
        
        // Create L-shaped corridor with specified width
        const horizontalFirst = random.next() > 0.5;
        
        if (horizontalFirst) {
            // Horizontal then vertical
            for (let x = Math.min(startX, endX); x <= Math.max(startX, endX); x++) {
                for (let w = 0; w < corridorWidth; w++) {
                    const y = startY + w;
                    if (y < height && dungeon[y][x].type === 'wall') {
                        dungeon[y][x] = { type: 'corridor', blocked: false };
                    }
                }
            }
            for (let y = Math.min(startY, endY); y <= Math.max(startY, endY); y++) {
                for (let w = 0; w < corridorWidth; w++) {
                    const x = endX + w;
                    if (x < width && dungeon[y][x].type === 'wall') {
                        dungeon[y][x] = { type: 'corridor', blocked: false };
                    }
                }
            }
        } else {
            // Vertical then horizontal
            for (let y = Math.min(startY, endY); y <= Math.max(startY, endY); y++) {
                for (let w = 0; w < corridorWidth; w++) {
                    const x = startX + w;
                    if (x < width && dungeon[y][x].type === 'wall') {
                        dungeon[y][x] = { type: 'corridor', blocked: false };
                    }
                }
            }
            for (let x = Math.min(startX, endX); x <= Math.max(startX, endX); x++) {
                for (let w = 0; w < corridorWidth; w++) {
                    const y = endY + w;
                    if (y < height && dungeon[y][x].type === 'wall') {
                        dungeon[y][x] = { type: 'corridor', blocked: false };
                    }
                }
            }
        }
    }
    
    // Remove dead ends if requested
    if (removeDeadEnds) {
        let hasDeadEnds;
        do {
            hasDeadEnds = false;
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    if (dungeon[y][x].type === 'corridor') {
                        // Count adjacent walls
                        let wallCount = 0;
                        if (dungeon[y-1][x].type === 'wall') wallCount++;
                        if (dungeon[y+1][x].type === 'wall') wallCount++;
                        if (dungeon[y][x-1].type === 'wall') wallCount++;
                        if (dungeon[y][x+1].type === 'wall') wallCount++;
                        
                        // If this is a dead end (3 adjacent walls), remove it
                        if (wallCount >= 3) {
                            dungeon[y][x] = { type: 'wall', blocked: true };
                            hasDeadEnds = true;
                        }
                    }
                }
            }
        } while (hasDeadEnds);
    }
    
    return dungeon;
}

export function generateCaveDungeon(width, height, random, initialDensity = 0.45) {
    let cells = Array(height).fill().map(() => 
        Array(width).fill().map(() => {
            const r = random ? random.next() : Math.random();
            return r < initialDensity ? 
                { type: 'wall', blocked: true } : 
                { type: 'corridor', blocked: false };
        })
    );
    
    // Use cellular automata to form cave-like structures
    cells = smoothMap(cells, 4, 5, 4);
    
    return cells;
}

export function generateOpenPlanDungeon(width, height, random, pillarsFrequency = 0.1) {
    // Create mostly open space
    const dungeon = Array(height).fill().map(() => 
        Array(width).fill().map(() => ({ type: 'room', blocked: false }))
    );
    
    // Add borders
    for (let x = 0; x < width; x++) {
        dungeon[0][x] = { type: 'wall', blocked: true };
        dungeon[height-1][x] = { type: 'wall', blocked: true };
    }
    
    for (let y = 0; y < height; y++) {
        dungeon[y][0] = { type: 'wall', blocked: true };
        dungeon[y][width-1] = { type: 'wall', blocked: true };
    }
    
    // Add random pillars
    for (let y = 2; y < height - 2; y++) {
        for (let x = 2; x < width - 2; x++) {
            if ((random ? random.next() : Math.random()) < pillarsFrequency) {
                dungeon[y][x] = { type: 'pillar', blocked: true };
            }
        }
    }
    
    return dungeon;
}

export function generateModularDungeon(width, height, random, roomModules = []) {
    // Create empty dungeon
    const dungeon = Array(height).fill().map(() => 
        Array(width).fill().map(() => ({ type: 'wall', blocked: true }))
    );
    
    // If no room modules provided, generate some default ones
    if (roomModules.length === 0) {
        const moduleTypes = ['rectangular', 'circular', 'diamond', 'cross'];
        for (let i = 0; i < 4; i++) {
            const moduleType = moduleTypes[i % moduleTypes.length];
            const moduleWidth = Math.floor(random ? random.next() * 6 + 5 : Math.random() * 6 + 5);
            const moduleHeight = Math.floor(random ? random.next() * 6 + 5 : Math.random() * 6 + 5);
            
            roomModules.push(createRoomPattern(moduleWidth, moduleHeight, moduleType, 'room'));
        }
    }
    
    // Place modules in a grid fashion
    const gridSize = Math.floor(Math.sqrt(roomModules.length));
    const cellWidth = Math.floor(width / (gridSize + 1));
    const cellHeight = Math.floor(height / (gridSize + 1));
    
    let placedRooms = [];
    
    for (let i = 0; i < roomModules.length && i < gridSize * gridSize; i++) {
        const gridX = i % gridSize;
        const gridY = Math.floor(i / gridSize);
        
        const startX = (gridX + 1) * cellWidth - Math.floor(roomModules[i][0].length / 2);
        const startY = (gridY + 1) * cellHeight - Math.floor(roomModules[i].length / 2);
        
        if (placeRoomPattern(dungeon, startX, startY, roomModules[i])) {
            placedRooms.push({
                x: startX,
                y: startY,
                width: roomModules[i][0].length,
                height: roomModules[i].length
            });
        }
    }
    
    // Connect rooms with corridors
    for (let i = 0; i < placedRooms.length - 1; i++) {
        const startRoom = placedRooms[i];
        const endRoom = placedRooms[i + 1];
        
        const startX = Math.floor(startRoom.x + startRoom.width / 2);
        const startY = Math.floor(startRoom.y + startRoom.height / 2);
        const endX = Math.floor(endRoom.x + endRoom.width / 2);
        const endY = Math.floor(endRoom.y + endRoom.height / 2);
        
        // Draw corridors
        const horizontalFirst = (random ? random.next() : Math.random()) > 0.5;
        
        if (horizontalFirst) {
            // Horizontal then vertical
            for (let x = Math.min(startX, endX); x <= Math.max(startX, endX); x++) {
                dungeon[startY][x] = { type: 'corridor', blocked: false };
            }
            for (let y = Math.min(startY, endY); y <= Math.max(startY, endY); y++) {
                dungeon[y][endX] = { type: 'corridor', blocked: false };
            }
        } else {
            // Vertical then horizontal
            for (let y = Math.min(startY, endY); y <= Math.max(startY, endY); y++) {
                dungeon[y][startX] = { type: 'corridor', blocked: false };
            }
            for (let x = Math.min(startX, endX); x <= Math.max(startX, endX); x++) {
                dungeon[endY][x] = { type: 'corridor', blocked: false };
            }
        }
    }
    
    return { dungeon, placedRooms };
}

export function addWaterFeatures(cells, coverage = 0.1, random) {
    const width = cells[0].length;
    const height = cells.length;
    
    // Create water pools
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            // Only place water in open areas
            if (cells[y][x].type !== 'wall' && cells[y][x].type !== 'door') {
                if ((random ? random.next() : Math.random()) < coverage) {
                    cells[y][x] = { type: 'water', blocked: true };
                }
            }
        }
    }
    
    // Apply cellular automata to smooth water features
    for (let iter = 0; iter < 2; iter++) {
        const newCells = JSON.parse(JSON.stringify(cells));
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let waterCount = 0;
                
                // Count neighboring water cells
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        
                        if (cells[y + dy][x + dx].type === 'water') {
                            waterCount++;
                        }
                    }
                }
                
                // Apply water spreading rules
                if (cells[y][x].type === 'water') {
                    if (waterCount < 3) {
                        newCells[y][x] = { type: 'corridor', blocked: false };
                    }
                } else if (cells[y][x].type !== 'wall' && cells[y][x].type !== 'door') {
                    if (waterCount > 4) {
                        newCells[y][x] = { type: 'water', blocked: true };
                    }
                }
            }
        }
        
        cells = newCells;
    }
    
    return cells;
}

export function createTreasureVault(width, height, random) {
    // Create a special treasure vault room with extra security features
    const vault = Array(height).fill().map(() => 
        Array(width).fill().map(() => ({ type: 'wall', blocked: true }))
    );
    
    // Inner chamber dimensions
    const innerWidth = Math.max(3, Math.floor(width * 0.6));
    const innerHeight = Math.max(3, Math.floor(height * 0.6));
    
    const startX = Math.floor((width - innerWidth) / 2);
    const startY = Math.floor((height - innerHeight) / 2);
    
    // Create inner chamber
    for (let y = startY; y < startY + innerHeight; y++) {
        for (let x = startX; x < startX + innerWidth; x++) {
            vault[y][x] = { type: 'room', blocked: false };
        }
    }
    
    // Place entrance with a door
    const doorSide = Math.floor((random ? random.next() : Math.random()) * 4); // 0: top, 1: right, 2: bottom, 3: left
    
    let doorX, doorY;
    
    switch (doorSide) {
        case 0: // top
            doorX = startX + Math.floor(innerWidth / 2);
            doorY = startY;
            break;
        case 1: // right
            doorX = startX + innerWidth - 1;
            doorY = startY + Math.floor(innerHeight / 2);
            break;
        case 2: // bottom
            doorX = startX + Math.floor(innerWidth / 2);
            doorY = startY + innerHeight - 1;
            break;
        case 3: // left
            doorX = startX;
            doorY = startY + Math.floor(innerHeight / 2);
            break;
    }
    
    vault[doorY][doorX] = { type: 'door', blocked: false };
    
    // Add treasure marker in center
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    vault[centerY][centerX] = { type: 'treasure', blocked: false };
    
    return vault;
}

export function addColumns(cells, frequency = 0.02, random) {
    const width = cells[0].length;
    const height = cells.length;
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            // Only add columns to open areas
            if (cells[y][x].type === 'room' || cells[y][x].type === 'corridor') {
                if ((random ? random.next() : Math.random()) < frequency) {
                    cells[y][x] = { type: 'pillar', blocked: true };
                }
            }
        }
    }
    
    return cells;
}

export function createSecretPassage(cells, startX, startY, endX, endY, random) {
    // Create a hidden passage between two points
    const path = [];
    let x = startX;
    let y = startY;
    
    // Simple A* pathfinding to create winding passage
    while (x !== endX || y !== endY) {
        path.push([x, y]);
        
        const dx = endX - x;
        const dy = endY - y;
        
        // Choose direction with some randomness
        if (Math.abs(dx) > Math.abs(dy)) {
            // Move horizontally
            x += dx > 0 ? 1 : -1;
        } else {
            // Move vertically
            y += dy > 0 ? 1 : -1;
        }
        
        // Occasionally make a random turn for more organic passages
        if ((random ? random.next() : Math.random()) < 0.2) {
            const randomDir = Math.floor((random ? random.next() : Math.random()) * 4);
            switch (randomDir) {
                case 0: y -= 1; break;
                case 1: x += 1; break;
                case 2: y += 1; break;
                case 3: x -= 1; break;
            }
        }
        
        // Stay within bounds
        x = Math.max(1, Math.min(cells[0].length - 2, x));
        y = Math.max(1, Math.min(cells.length - 2, y));
    }
    
    // Mark the path as secret passage
    for (const [px, py] of path) {
        if (isInBounds(px, py, cells[0].length, cells.length)) {
            cells[py][px] = { type: 'secret', blocked: false, discovered: false };
        }
    }
    
    // Make secret door at start and end
    if (isInBounds(startX, startY, cells[0].length, cells.length)) {
        cells[startY][startX] = { type: 'secret-door', blocked: false, discovered: false };
    }
    if (isInBounds(endX, endY, cells[0].length, cells.length)) {
        cells[endY][endX] = { type: 'secret-door', blocked: false, discovered: false };
    }
    
    return cells;
}

export function populateWithTreasure(cells, treasureRatio = 0.05, random) {
    const width = cells[0].length;
    const height = cells.length;
    const treasurePositions = [];
    
    // Create a default random generator if none is provided
    if (!random) {
        random = {
            next: () => Math.random(),
            nextInt: (min, max) => Math.floor(Math.random() * (max - min) + min),
            select: (array) => array[Math.floor(Math.random() * array.length)]
        };
    }
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            // Only place treasure in valid locations
            if (cells[y][x].type === 'room' || cells[y][x].type === 'corridor') {
                if (random.next() < treasureRatio) {
                    // Generate treasure using the TreasureGenerator
                    const treasureType = Math.floor(random.next() * 4);
                    let treasure;
                    
                    try {
                        switch (treasureType) {
                            case 0: treasure = generateCoinTreasure(random); break;
                            case 1: treasure = generateGemTreasure(random); break;
                            case 2: treasure = generateItemTreasure(random); break;
                            case 3: treasure = generateMagicalTreasure(random); break;
                        }
                    } catch (error) {
                        console.error("Error generating treasure:", error);
                        treasure = { type: 'coins', value: 10 };
                    }
                    
                    cells[y][x] = { 
                        type: 'treasure', 
                        blocked: false, 
                        treasure: treasure || { type: 'coins', value: 10 }
                    };
                    
                    treasurePositions.push({ x, y, treasure: cells[y][x].treasure });
                }
            }
        }
    }
    
    return { cells, treasurePositions };
}

export function populateWithMonsters(cells, monsterDensity = 0.03, random, dungeonType = 'standard') {
    const width = cells[0].length;
    const height = cells.length;
    const monsterPositions = [];
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            // Only place monsters in valid locations
            if (cells[y][x].type === 'room' || cells[y][x].type === 'corridor') {
                if ((random ? random.next() : Math.random()) < monsterDensity) {
                    // Generate a monster ID that will be mapped to a real monster later
                    // The ID ranges match those in the mapMonsterIdToMonster function
                    const sizeDie = random ? random.next() : Math.random();
                    let monsterId;
                    
                    if (sizeDie < 0.2) {
                        // Tiny monster (0-99)
                        monsterId = Math.floor((random ? random.next() : Math.random()) * 100);
                    } else if (sizeDie < 0.4) {
                        // Small monster (100-199)
                        monsterId = 100 + Math.floor((random ? random.next() : Math.random()) * 100);
                    } else if (sizeDie < 0.7) {
                        // Medium monster (200-299)
                        monsterId = 200 + Math.floor((random ? random.next() : Math.random()) * 100);
                    } else if (sizeDie < 0.9) {
                        // Large monster (300-399)
                        monsterId = 300 + Math.floor((random ? random.next() : Math.random()) * 100);
                    } else {
                        // Huge monster (400-499)
                        monsterId = 400 + Math.floor((random ? random.next() : Math.random()) * 100);
                    }
                    
                    cells[y][x] = { 
                        type: 'monster', 
                        blocked: false,
                        monsterId: monsterId
                    };
                    
                    monsterPositions.push({ x, y, monsterId });
                }
            }
        }
    }
    
    return { cells, monsterPositions };
}

export function generateMonster(monsterId, dungeonType = 'standard') {
    // This is just a wrapper for mapMonsterIdToMonster which is defined in DungeonGenerator.js
    // In a real implementation, we'd either import that function or implement it here
    // For now, we'll return a placeholder monster object
    return {
        id: monsterId,
        type: dungeonType,
        name: `Monster #${monsterId}`,
        challenge: Math.floor(monsterId / 100) + 1,
        // Add more monster properties as needed
    };
}

export function addKeysAndPuzzles(cells, rooms, lockRatio = 0.2, random) {
    if (!rooms || rooms.length < 2) return cells;
    
    // Select rooms to place locks and keys
    const lockedRoomIndices = [];
    const keyRoomIndices = [];
    
    // Determine which rooms to lock
    for (let i = 1; i < rooms.length; i++) {
        if ((random ? random.next() : Math.random()) < lockRatio) {
            lockedRoomIndices.push(i);
            
            // For each locked room, find a room to place a key
            let keyRoomIdx;
            do {
                keyRoomIdx = Math.floor((random ? random.next() : Math.random()) * i);
            } while (keyRoomIndices.includes(keyRoomIdx));
            
            keyRoomIndices.push(keyRoomIdx);
        }
    }
    
    // Place locked doors
    for (const roomIdx of lockedRoomIndices) {
        const room = rooms[roomIdx];
        
        // Find a suitable door position on the room's perimeter
        let doorX, doorY;
        const side = Math.floor((random ? random.next() : Math.random()) * 4); // 0: top, 1: right, 2: bottom, 3: left
        
        switch (side) {
            case 0: // Top
                doorX = room.x + Math.floor((random ? random.next() : Math.random()) * room.width);
                doorY = room.y;
                break;
            case 1: // Right
                doorX = room.x + room.width - 1;
                doorY = room.y + Math.floor((random ? random.next() : Math.random()) * room.height);
                break;
            case 2: // Bottom
                doorX = room.x + Math.floor((random ? random.next() : Math.random()) * room.width);
                doorY = room.y + room.height - 1;
                break;
            case 3: // Left
                doorX = room.x;
                doorY = room.y + Math.floor((random ? random.next() : Math.random()) * room.height);
                break;
        }
        
        // Place a locked door
        if (isInBounds(doorX, doorY, cells[0].length, cells.length)) {
            cells[doorY][doorX] = { 
                type: 'locked-door', 
                blocked: true,
                keyId: `key-${roomIdx}`
            };
        }
    }
    
    // Place keys
    for (let i = 0; i < keyRoomIndices.length; i++) {
        const roomIdx = keyRoomIndices[i];
        const lockedRoomIdx = lockedRoomIndices[i];
        const room = rooms[roomIdx];
        
        // Find a position inside the room
        const keyX = room.x + Math.floor((random ? random.next() : Math.random()) * room.width);
        const keyY = room.y + Math.floor((random ? random.next() : Math.random()) * room.height);
        
        // Place a key
        if (isInBounds(keyX, keyY, cells[0].length, cells.length) && 
            (cells[keyY][keyX].type === 'room' || cells[keyY][keyX].type === 'corridor')) {
            cells[keyY][keyX] = { 
                type: 'key', 
                blocked: false,
                keyId: `key-${lockedRoomIdx}`
            };
        }
    }
    
    return cells;
}

/**
 * Room function types for dungeon room designation
 */
export const RoomFunctions = {
    ENTRANCE: 'entrance',
    EXIT: 'exit',
    MONSTER_DEN: 'monsterDen',
    TREASURE_ROOM: 'treasureRoom',
    TRAP_ROOM: 'trapRoom',
    PUZZLE_ROOM: 'puzzleRoom',
    BARRACKS: 'barracks',
    DINING_HALL: 'diningHall',
    PRISON: 'prison',
    LIBRARY: 'library',
    RITUAL_CHAMBER: 'ritualChamber',
    ARMORY: 'armory',
    STORAGE: 'storage',
    COMMON: 'common' // Standard room with no special function
};

/**
 * Assigns functions to rooms in a dungeon
 * @param {Array} rooms - Array of room objects
 * @param {Object} random - Seeded random generator
 * @param {Object} options - Room assignment options
 * @returns {Array} Rooms with assigned functions
 */
export function assignRoomFunctions(rooms, random, options = {}) {
    const {
        entranceRoom = 'entrance',
        exitRoom = 'exit',
        monsterRoomChance = 0.3,
        treasureRoomChance = 0.2,
        trapRoomChance = 0.1,
        puzzleRoomChance = 0.1
    } = options;

    const roomFunctions = Object.values(RoomFunctions);
    const assignedRooms = [];

    for (const room of rooms) {
        let assignedFunction = RoomFunctions.COMMON;

        if (room.isEntrance) {
            assignedFunction = entranceRoom;
        } else if (room.isExit) {
            assignedFunction = exitRoom;
        } else {
            const roll = random.next();
            if (roll < monsterRoomChance) {
                assignedFunction = RoomFunctions.MONSTER_DEN;
            } else if (roll < monsterRoomChance + treasureRoomChance) {
                assignedFunction = RoomFunctions.TREASURE_ROOM;
            } else if (roll < monsterRoomChance + treasureRoomChance + trapRoomChance) {
                assignedFunction = RoomFunctions.TRAP_ROOM;
            } else if (roll < monsterRoomChance + treasureRoomChance + trapRoomChance + puzzleRoomChance) {
                assignedFunction = RoomFunctions.PUZZLE_ROOM;
            }
        }

        assignedRooms.push({ ...room, function: assignedFunction });
    }

    return assignedRooms;
}

/**
 * Creates a specialized room pattern (e.g., circular, diamond, cross-shaped)
 * @param {number} width - Room width
 * @param {number} height - Room height
 * @param {string} pattern - Room pattern type
 * @param {string} cellType - Type of cell to use for the room
 * @returns {Array} 2D array of cells for the room
 */
export function createRoomPattern(width, height, pattern = 'rectangular', cellType = 'room') {
    // Ensure minimum dimensions
    width = Math.max(width, 5);
    height = Math.max(height, 5);
    
    // Create an empty room filled with walls
    const roomCells = Array(height).fill(0).map(() => 
        Array(width).fill(0).map(() => ({
            type: 'wall',
            blocked: true
        }))
    );
    
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    switch (pattern) {
        case 'circular':
            // Create a circular room
            const radius = Math.min(centerX, centerY) - 1;
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const dx = x - centerX;
                    const dy = y - centerY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance <= radius) {
                        roomCells[y][x] = { type: cellType, blocked: false };
                    }
                }
            }
            break;
            
        case 'diamond':
            // Create a diamond-shaped room
            const diamondRadius = Math.min(centerX, centerY) - 1;
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const dx = Math.abs(x - centerX);
                    const dy = Math.abs(y - centerY);
                    
                    if (dx + dy <= diamondRadius) {
                        roomCells[y][x] = { type: cellType, blocked: false };
                    }
                }
            }
            break;
            
        case 'cross':
            // Create a cross-shaped room
            const armWidth = Math.max(1, Math.floor(Math.min(width, height) / 3));
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    // Horizontal arm
                    if (y >= centerY - armWidth && y <= centerY + armWidth) {
                        roomCells[y][x] = { type: cellType, blocked: false };
                    }
                    // Vertical arm
                    else if (x >= centerX - armWidth && x <= centerX + armWidth) {
                        roomCells[y][x] = { type: cellType, blocked: false };
                    }
                }
            }
            break;
            
        default:
            // Default rectangular room
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    roomCells[y][x] = { type: cellType, blocked: false };
                }
            }
    }
    
    return roomCells;
}

/**
 * Places a pre-designed room pattern into the dungeon map
 * @param {Array} cells - 2D array of cells (dungeon map)
 * @param {number} startX - Starting X coordinate
 * @param {number} startY - Starting Y coordinate
 * @param {Array} roomPattern - 2D array representing the room pattern
 * @returns {boolean} Success status of placement
 */
export function placeRoomPattern(cells, startX, startY, roomPattern) {
    const dungeonHeight = cells.length;
    const dungeonWidth = cells[0].length;
    const roomHeight = roomPattern.length;
    const roomWidth = roomPattern[0].length;
    
    // Check if the room fits within dungeon bounds
    if (startX < 1 || startY < 1 || 
        startX + roomWidth > dungeonWidth - 1 || 
        startY + roomHeight > dungeonHeight - 1) {
        return false;
    }
    
    // Check if the placement area is clear of important structures
    for (let y = 0; y < roomHeight; y++) {
        for (let x = 0; x < roomWidth; x++) {
            const cellY = startY + y;
            const cellX = startX + x;
            
            // Skip if the pattern cell is a wall
            if (roomPattern[y][x].type === 'wall') continue;
            
            // Don't overwrite special cells
            if (cells[cellY][cellX].type === 'stairs-up' || 
                cells[cellY][cellX].type === 'stairs-down' ||
                cells[cellY][cellX].type === 'door' ||
                cells[cellY][cellX].type === 'entrance' ||
                cells[cellY][cellX].type === 'exit') {
                return false;
            }
        }
    }
    
    // Place the room pattern
    for (let y = 0; y < roomHeight; y++) {
        for (let x = 0; x < roomWidth; x++) {
            const cellY = startY + y;
            const cellX = startX + x;
            
            // Only overwrite if the pattern cell is not a wall
            if (roomPattern[y][x].type !== 'wall') {
                cells[cellY][cellX] = { ...roomPattern[y][x] };
            }
        }
    }
    
    return true;
}
