//DungeonGenerator.js - Integration layer between C++ dungeon and JS monsters/items

import { items } from './master-items.js';
import { BESTIARY, CATEGORIZED_MONSTERS } from './bestiary/index.js';
import { 
    smoothMap, 
    generateMaze, 
    generateRoomsAndCorridors,
    generateCaveDungeon,
    generateOpenPlanDungeon,
    generateModularDungeon,
    addWaterFeatures,
    populateWithTreasure, 
    createRoomPattern, 
    placeRoomPattern,
    createTreasureVault,
    addColumns,
    createSecretPassage,
    populateWithMonsters,
    generateMonster,
    addKeysAndPuzzles
} from './map-functions.js';

import { 
    generateTreasure,
    generateCoinTreasure,
    generateGemTreasure,
    generateItemTreasure,
    generateMagicalTreasure,
    generateTreasureHoard,
    TREASURE_TYPES,
    TRAP_TYPES,
    treasureSanitizer
} from './TreasureGenerator.js';

/**
 * Traditional dungeon treasure types (imported from TreasureGenerator)
// Using the imported TREASURE_TYPES instead of redefining it

/**
 * Maps a C++-generated monster ID to the corresponding monster from the bestiary
 * @param {number} monsterId - The monster ID from the C++ generator
 * @param {string} dungeonType - The type of dungeon (affects monster selection)
 * @returns {Object} The corresponding monster object or null if not found
 */
function mapMonsterIdToMonster(monsterId, dungeonType = 'standard') {
    const allMonsters = BESTIARY[0].creatures;
    
    // If we have a specific dungeon type, filter monsters accordingly
    if (dungeonType === 'bone-crypt') {
        // Create a filtered set of bone-themed monsters
        const boneMonsters = filterBoneThemeMonsters();
        const tinyBones = boneMonsters.tiny;
        const smallBones = boneMonsters.small;
        const mediumBones = boneMonsters.medium;
        const largeBones = boneMonsters.large;
        const hugeBones = boneMonsters.huge;
        
        // Return a monster based on the ID, but only from the bone-themed monsters
        if (monsterId < 100) {
            return tinyBones[monsterId % tinyBones.length];
        } else if (monsterId < 200) {
            return smallBones[(monsterId - 100) % smallBones.length];
        } else if (monsterId < 300) {
            return mediumBones[(monsterId - 200) % mediumBones.length];
        } else if (monsterId < 400) {
            return largeBones[(monsterId - 300) % largeBones.length];
        } else if (monsterId < 500) {
            return hugeBones[(monsterId - 400) % hugeBones.length];
        }
    } else if (dungeonType === 'dark-dimension') {
        // Create a filtered set of dark-themed monsters (darklings, darkformes, shadow creatures)
        const darkMonsters = filterDarkThemeMonsters();
        const tinyDark = darkMonsters.tiny;
        const smallDark = darkMonsters.small;
        const mediumDark = darkMonsters.medium;
        const largeDark = darkMonsters.large;
        const hugeDark = darkMonsters.huge;
        
        // Return a monster based on the ID, but only from the dark-themed monsters
        if (monsterId < 100) {
            return tinyDark[monsterId % tinyDark.length];
        } else if (monsterId < 200) {
            return smallDark[(monsterId - 100) % smallDark.length];
        } else if (monsterId < 300) {
            return mediumDark[(monsterId - 200) % mediumDark.length];
        } else if (monsterId < 400) {
            return largeDark[(monsterId - 300) % largeDark.length];
        } else if (monsterId < 500) {
            return hugeDark[(monsterId - 400) % hugeDark.length];
        }
    } else {
        // Standard monster selection logic
        // C++ ID ranges:
        // 0-99: Tiny monsters
        // 100-199: Small monsters
        // 200-299: Medium monsters
        // 300-399: Large monsters
        // 400-499: Huge monsters
        
        let indexInCategory;
        
        if (monsterId < 100) {
            indexInCategory = monsterId % CATEGORIZED_MONSTERS.tiny.length;
            return CATEGORIZED_MONSTERS.tiny[indexInCategory];
        } else if (monsterId < 200) {
            indexInCategory = (monsterId - 100) % CATEGORIZED_MONSTERS.small.length;
            return CATEGORIZED_MONSTERS.small[indexInCategory];
        } else if (monsterId < 300) {
            indexInCategory = (monsterId - 200) % CATEGORIZED_MONSTERS.medium.length;
            return CATEGORIZED_MONSTERS.medium[indexInCategory];
        } else if (monsterId < 400) {
            indexInCategory = (monsterId - 300) % CATEGORIZED_MONSTERS.large.length;
            return CATEGORIZED_MONSTERS.large[indexInCategory];
        } else if (monsterId < 500) {
            indexInCategory = (monsterId - 400) % CATEGORIZED_MONSTERS.huge.length;
            return CATEGORIZED_MONSTERS.huge[indexInCategory];
        }
    }
    
    return null;
}

/**
 * Filter monsters to include only those with bone/ossuary themes
 * @returns {Object} Filtered monsters by size category
 */
function filterBoneThemeMonsters() {
    // Keywords to identify bone-themed monsters
    const boneKeywords = ['osso', 'bone', 'skeletal', 'crypt', 'ossuar'];
    
    // Filter each category by name containing bone keywords
    const filterByKeywords = (monsterList) => {
        return monsterList.filter(monster => {
            // Check if monster name contains any of our keywords
            return boneKeywords.some(keyword => 
                monster.name.toLowerCase().includes(keyword.toLowerCase())
            );
        });
    };
    
    // Apply filter to each size category
    const tinyBones = filterByKeywords(CATEGORIZED_MONSTERS.tiny);
    const smallBones = filterByKeywords(CATEGORIZED_MONSTERS.small);
    const mediumBones = filterByKeywords(CATEGORIZED_MONSTERS.medium);
    const largeBones = filterByKeywords(CATEGORIZED_MONSTERS.large);
    const hugeBones = filterByKeywords(CATEGORIZED_MONSTERS.huge);
    
    // If any category is empty, add at least one generic monster to prevent errors
    const ensureNonEmpty = (category, fallback) => {
        if (category.length === 0) {
            return [fallback || category[0] || CATEGORIZED_MONSTERS.medium[0]];
        }
        return category;
    };
    
    return {
        tiny: ensureNonEmpty(tinyBones),
        small: ensureNonEmpty(smallBones),
        medium: ensureNonEmpty(mediumBones),
        large: ensureNonEmpty(largeBones),
        huge: ensureNonEmpty(hugeBones)
    };
}

/**
 * Filter monsters to include only those with dark/dimension themes
 * @returns {Object} Filtered monsters by size category
 */
function filterDarkThemeMonsters() {
    // Keywords to identify dark-themed monsters
    const darkKeywords = ['dark', 'shadow', 'void', 'dimension', 'nightmare'];
    
    // Filter each category by name containing dark keywords
    const filterByKeywords = (monsterList) => {
        return monsterList.filter(monster => {
            // Check if monster name contains any of our keywords
            return darkKeywords.some(keyword => 
                monster.name.toLowerCase().includes(keyword.toLowerCase())
            );
        });
    };
    
    // Apply filter to each size category
    const tinyDark = filterByKeywords(CATEGORIZED_MONSTERS.tiny);
    const smallDark = filterByKeywords(CATEGORIZED_MONSTERS.small);
    const mediumDark = filterByKeywords(CATEGORIZED_MONSTERS.medium);
    const largeDark = filterByKeywords(CATEGORIZED_MONSTERS.large);
    const hugeDark = filterByKeywords(CATEGORIZED_MONSTERS.huge);
    
    // If any category is empty, add at least one generic monster to prevent errors
    const ensureNonEmpty = (category, fallback) => {
        if (category.length === 0) {
            return [fallback || category[0] || CATEGORIZED_MONSTERS.medium[0]];
        }
        return category;
    };
    
    return {
        tiny: ensureNonEmpty(tinyDark),
        small: ensureNonEmpty(smallDark),
        medium: ensureNonEmpty(mediumDark),
        large: ensureNonEmpty(largeDark),
        huge: ensureNonEmpty(hugeDark)
    };
}

/**
 * Maps a C++-generated item ID to the corresponding item
 * @param {number} itemId - The item ID from the C++ generator
 * @param {string} dungeonType - The type of dungeon (affects item selection)
 * @returns {Object} The corresponding item object or null if not found
 */
function mapItemIdToItem(itemId, dungeonType = 'standard') {
    // For bone crypt, we could emphasize bone/necromantic items
    const boneThemeItems = ['robusca', 'darkessence', 'vitalium', 'vitalocanum'];
    
    if (dungeonType === 'bone-crypt') {
        // Filter items to prefer bone-related ones
        const cryptItems = items.filter(item => 
            boneThemeItems.includes(item.id) || 
            item.description.toLowerCase().includes('bone') ||
            item.category.includes('crystal')
        );
        
        // If we have themed items, use those
        if (cryptItems.length > 0) {
            return cryptItems[itemId % cryptItems.length];
        }
    }
    
    // Standard behavior - C++ ID ranges: 1000-1999 for items
    const itemIndex = (itemId - 1000) % items.length;
    return items[itemIndex];
}

/**
 * A better PRNG for deterministic results based on seed
 */
class SeededRandom {
    constructor(seed) {
        this.seed = seed % 2147483647;
        if (this.seed <= 0) this.seed += 2147483646;
    }

    /**
     * Returns a deterministic random value between 0 and 1
     * @returns {number} Random number between 0 and 1
     */
    next() {
        this.seed = (this.seed * 16807) % 2147483647;
        return this.seed / 2147483647;
    }

    /**
     * Returns a random integer between min (inclusive) and max (exclusive)
     * @param {number} min - Minimum value (inclusive)
     * @param {number} max - Maximum value (exclusive)
     * @returns {number} Random integer in range [min, max)
     */
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min)) + min;
    }

    /**
     * Randomly selects an item from an array
     * @param {Array} array - Array to select from
     * @returns {*} Randomly selected item
     */
    select(array) {
        return array[this.nextInt(0, array.length)];
    }
}

/**
 * Helper function to get a display name for treasure objects
 * @param {Object} treasure - Treasure object
 * @returns {string} Display name for the treasure
 */
function getTreasureDisplayName(treasure) {
    // First ensure the treasure is fully defined
    const sanitizedTreasure = treasureSanitizer(treasure);
    
    const value = sanitizedTreasure.totalValue || sanitizedTreasure.value || 0;
    
    if (value > 1000) {
        return "Treasure Chest";
    } else if (value > 500) {
        return "Valuable Treasure";
    } else if (value > 200) {
        return "Treasure Pile";
    } else if (value > 50) {
        return "Small Cache";
    } else {
        return "Meager Findings";
    }
}

/**
 * Class representing a room in the dungeon
 */
class Room {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.connected = false;
    }

    /**
     * Check if this room overlaps with another room
     * @param {Room} other - Room to check overlap with
     * @param {number} padding - Minimum space between rooms
     * @returns {boolean} True if rooms overlap
     */
    overlaps(other, padding = 0) {
        return this.x - padding < other.x + other.width &&
               this.x + this.width + padding > other.x &&
               this.y - padding < other.y + other.height &&
               this.y + this.height + padding > other.y;
    }

    /**
     * Get center point of room
     * @returns {Object} Center coordinates {x, y}
     */
    getCenter() {
        return {
            x: Math.floor(this.x + this.width / 2),
            y: Math.floor(this.y + this.height / 2)
        };
    }
}

/**
 * Main DungeonGenerator class for creating and managing procedural dungeons
 */
export class DungeonGenerator {
    /**
     * Create a new DungeonGenerator
     * @param {Object} options - Generator options
     */
    constructor(options = {}) {
        this.width = options.width || 50;
        this.height = options.height || 50;
        this.seed = options.seed || Math.floor(Math.random() * 1000000);
        this.dungeonType = options.dungeonType || 'standard';
        this.mapType = options.mapType || 'maze'; // Default to maze for backward compatibility
        this.roomDensity = options.roomDensity || 0.5;
        this.corridorWidth = options.corridorWidth || 1;
        this.waterPools = options.waterPools || 0;
        this.treasureDensity = options.treasureDensity || 1.0;
        this.monsterDensity = options.monsterDensity || 1.0;
        this.random = new SeededRandom(this.seed);
        
        // Map generation specific options
        this.roomSizeMin = options.roomSizeMin || 4;
        this.roomSizeMax = options.roomSizeMax || 10;
        this.caveRoundness = options.caveRoundness || 0.5; // For cave generation (higher = rounder)
        this.openSpaceAmount = options.openSpaceAmount || 0.8; // For open plan (higher = more open)
        this.moduleSize = options.moduleSize || 10; // For modular dungeons
        
        // Grid will be populated upon generate()
        this.grid = null;
        this.rooms = [];
        this.monsters = [];
        this.treasures = [];
    }
    
    /**
     * Generate a complete dungeon with all features
     * @returns {Object} Generated dungeon data
     */
    generate() {
        // Generate base dungeon structure based on selected map type
        switch (this.mapType) {
            case 'maze':
                this.grid = generateMaze(this.width, this.height, this.random);
                break;
                
            case 'rooms':
                this.grid = generateRoomsAndCorridors(this.width, this.height, this.random, {
                    minRooms: Math.floor(10 * this.roomDensity),
                    maxRooms: Math.floor(20 * this.roomDensity),
                    minRoomSize: this.roomSizeMin,
                    maxRoomSize: this.roomSizeMax,
                    corridorWidth: this.corridorWidth,
                    roomSpacing: 1,
                    removeDeadEnds: true
                });
                break;
                
            case 'cave':
                this.grid = generateCaveDungeon(this.width, this.height, this.random, {
                    initialDensity: 0.45,
                    birthLimit: 4,
                    deathLimit: 3,
                    iterations: 4
                });
                break;
                
            case 'open':
                this.grid = generateOpenPlanDungeon(this.width, this.height, this.random, {
                    pillarDensity: 0.05,
                    obstacleChance: 0.2,
                    withPartitions: true,
                    openness: this.openSpaceAmount
                });
                break;
                
            case 'modular':
                const result = generateModularDungeon(this.width, this.height, this.random, {
                    roomModules: 'mixed',
                    hallwayWidth: 2,
                    moduleSize: this.moduleSize
                });
                this.grid = result.dungeon;
                this.rooms = result.placedRooms;
                break;
                
            default:
                // Fallback to maze generation
                this.grid = generateMaze(this.width, this.height, this.random);
                break;
        }
        
        // Apply smoothing if required
        if (this.smoothMap && this.smoothIterations > 0) {
            this.grid = smoothMap(this.grid, this.smoothIterations, 4, 3);
        }
        
        // Add water features if specified
        if (this.waterPools > 0) {
            const waterType = this.waterType || 'water';
            this.grid = addWaterFeatures(this.grid, this.waterPools / 100, this.random);
        }
        
        // Find all rooms in the grid if not already set by modular generation
        if (!this.rooms || this.rooms.length === 0) {
            this.findRooms();
        }
        
        // Populate the dungeon
        const monsterResult = populateWithMonsters(this.grid, this.monsterDensity * 0.03, this.random, this.dungeonType);
        this.grid = monsterResult.cells;
        this.monsters = monsterResult.monsterPositions.map(pos => ({
            x: pos.x,
            y: pos.y,
            monster: mapMonsterIdToMonster(pos.monsterId, this.dungeonType)
        }));
        
        // Make sure to pass the random object to populateWithTreasure
        const treasureResult = populateWithTreasure(this.grid, this.treasureDensity * 0.05, this.random);
        this.grid = treasureResult.cells;
        
        // Process the treasure positions to ensure each treasure has valid properties
        this.treasures = treasureResult.treasurePositions.map(pos => {
            let treasure = pos.treasure;
            
            // If the treasure is undefined or missing required properties, generate a new one
            if (!treasure || (!treasure.totalValue && !treasure.value)) {
                const treasureTypes = ['coins', 'gems', 'items', 'magic', 'hoard']; 
                const treasureType = this.random.select(treasureTypes);
                
                switch (treasureType) {
                    case 'coins':
                        treasure = generateCoinTreasure(this.random);
                        break;
                    case 'gems':
                        treasure = generateGemTreasure(this.random);
                        break;
                    case 'items':
                        treasure = generateItemTreasure(this.random);
                        break;
                    case 'magic':
                        treasure = generateMagicalTreasure(this.random);
                        break;
                    case 'hoard':
                        treasure = generateTreasureHoard(this.random);
                        break;
                    default:
                        treasure = generateCoinTreasure(this.random);
                        break;
                }
            }
            
            // Ensure the treasure has correct structure
            if (!treasure.totalValue && treasure.value) {
                treasure.totalValue = treasure.value;
            } else if (!treasure.value && treasure.totalValue) {
                treasure.value = treasure.totalValue;
            }
            
            // If still no value, set a default
            if (!treasure.totalValue) {
                treasure.totalValue = 10;
                treasure.value = 10;
            }
            
            return {
                x: pos.x,
                y: pos.y,
                treasure: treasure
            };
        });
        
        // Add columns at a low density if in open areas
        if (this.mapType === 'open' || this.mapType === 'modular') {
            this.grid = addColumns(this.grid, 0.02, this.random);
        }
        
        // Create entities array combining monsters and treasures
        const entities = [];
        
        // Add monsters to entities
        this.monsters.forEach(monster => {
            entities.push({
                row: monster.y,
                col: monster.x,
                type: 'monster',
                monster: monster.monster
            });
        });
        
        // Add treasures to entities
        this.treasures.forEach(treasure => {
            entities.push({
                row: treasure.y,
                col: treasure.x,
                type: 'treasure',
                treasure: treasure.treasure,
                displayName: getTreasureDisplayName(treasure.treasure)
            });
        });
        
        return {
            grid: this.grid,
            cells: this.grid,
            width: this.width,
            height: this.height,
            rooms: this.rooms,
            monsters: this.monsters,
            treasures: this.treasures,
            entities: entities,
            seed: this.seed,
            type: this.dungeonType,
            mapType: this.mapType
        };
    }
    
    /**
     * Find all rooms in the dungeon grid
     */
    findRooms() {
        this.rooms = [];
        const visited = Array(this.height).fill().map(() => Array(this.width).fill(false));
        
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                // Find room cells that haven't been visited
                if ((this.grid[y][x].type === 'room' || this.grid[y][x].type === 'corridor') && !visited[y][x]) {
                    // Found a new room, flood fill to find its extent
                    let minX = x, maxX = x, minY = y, maxY = y;
                    const queue = [{ x, y }];
                    visited[y][x] = true;
                    
                    while (queue.length > 0) {
                        const cell = queue.shift();
                        minX = Math.min(minX, cell.x);
                        maxX = Math.max(maxX, cell.x);
                        minY = Math.min(minY, cell.y);
                        maxY = Math.max(maxY, cell.y);
                        
                        // Check adjacent cells
                        const directions = [
                            { dx: -1, dy: 0 },
                            { dx: 1, dy: 0 },
                            { dx: 0, dy: -1 },
                            { dx: 0, dy: 1 }
                        ];
                        
                        for (const dir of directions) {
                            const nx = cell.x + dir.dx;
                            const ny = cell.y + dir.dy;
                            
                            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height &&
                                !visited[ny][nx] && this.grid[ny][nx].type === this.grid[y][x].type) {
                                visited[ny][nx] = true;
                                queue.push({ x: nx, y: ny });
                            }
                        }
                    }
                    
                    // Add room to list
                    const roomWidth = maxX - minX + 1;
                    const roomHeight = maxY - minY + 1;
                    
                    // Only add if the room is large enough
                    if (roomWidth >= 3 && roomHeight >= 3) {
                        this.rooms.push(new Room(minX, minY, roomWidth, roomHeight));
                    }
                }
            }
        }
        
        return this.rooms;
    }
    
    /**
     * Populate the dungeon with monsters
     */
    populateMonsters() {
        this.monsters = [];
        
        // Place monsters in rooms or open areas
        const monsterCount = Math.floor(this.rooms.length * this.monsterDensity * 1.5);
        
        for (let i = 0; i < monsterCount; i++) {
            // Try to place each monster
            let attempts = 0;
            let placed = false;
            
            // First try rooms
            if (this.rooms.length > 0 && this.random.next() < 0.7) {
                while (!placed && attempts < 10) {
                    // Pick a random room
                    const roomIndex = this.random.nextInt(0, this.rooms.length);
                    const room = this.rooms[roomIndex];
                    
                    // Pick a random position in the room
                    const x = this.random.nextInt(room.x, room.x + room.width);
                    const y = this.random.nextInt(room.y, room.y + room.height);
                    
                    // Check if the position is valid (not blocked, not an entrance/exit)
                    if (!this.grid[y][x].blocked && 
                        this.grid[y][x].type !== 'entrance' && 
                        this.grid[y][x].type !== 'exit' &&
                        this.grid[y][x].type !== 'water' &&
                        !this.monsterAt(x, y)) {
                        
                        // Generate a monster
                        const monsterId = this.random.nextInt(0, 500);
                        const monster = mapMonsterIdToMonster(monsterId, this.dungeonType);
                        
                        if (monster) {
                            this.monsters.push({ x, y, monster });
                            placed = true;
                        }
                    }
                    
                    attempts++;
                }
            }
            
            // If we couldn't place in a room, try anywhere
            if (!placed) {
                attempts = 0;
                
                while (!placed && attempts < 20) {
                    // Pick a random position
                    const x = this.random.nextInt(1, this.width - 1);
                    const y = this.random.nextInt(1, this.height - 1);
                    
                    // Check if the position is valid
                    if (!this.grid[y][x].blocked && 
                        this.grid[y][x].type !== 'wall' &&
                        this.grid[y][x].type !== 'entrance' && 
                        this.grid[y][x].type !== 'exit' &&
                        this.grid[y][x].type !== 'water' &&
                        !this.monsterAt(x, y)) {
                        
                        // Generate a monster
                        const monsterId = this.random.nextInt(0, 500);
                        const monster = mapMonsterIdToMonster(monsterId, this.dungeonType);
                        
                        if (monster) {
                            this.monsters.push({ x, y, monster });
                            placed = true;
                        }
                    }
                    
                    attempts++;
                }
            }
        }
        
        return this.monsters;
    }
    
    /**
     * Populate the dungeon with treasure
     */
    populateTreasure() {
        this.treasures = [];
        
        // Place treasures in rooms or open areas
        const treasureCount = Math.floor(this.rooms.length * this.treasureDensity * 0.7);
        
        for (let i = 0; i < treasureCount; i++) {
            // Try to place each treasure
            let attempts = 0;
            let placed = false;
            
            // First try rooms
            if (this.rooms.length > 0 && this.random.next() < 0.8) {
                while (!placed && attempts < 10) {
                    // Pick a random room
                    const roomIndex = this.random.nextInt(0, this.rooms.length);
                    const room = this.rooms[roomIndex];
                    
                    // Pick a random position in the room
                    const x = this.random.nextInt(room.x, room.x + room.width);
                    const y = this.random.nextInt(room.y, room.y + room.height);
                    
                    // Check if the position is valid
                    if (!this.grid[y][x].blocked && 
                        this.grid[y][x].type !== 'entrance' && 
                        this.grid[y][x].type !== 'exit' &&
                        this.grid[y][x].type !== 'water' &&
                        !this.treasureAt(x, y) &&
                        !this.monsterAt(x, y)) {
                        
                        // Generate treasure
                        const treasureType = this.random.select(TREASURE_TYPES);
                        let treasure;
                        
                        switch (treasureType) {
                            case 'coins':
                                treasure = generateCoinTreasure(this.random); // Explicitly pass random
                                break;
                            case 'gems':
                                treasure = generateGemTreasure(this.random); // Explicitly pass random
                                break;
                            case 'items':
                                treasure = generateItemTreasure(this.random); // Explicitly pass random
                                break;
                            case 'magic':
                                treasure = generateMagicalTreasure(this.random); // Explicitly pass random
                                break;
                            case 'hoard':
                                treasure = generateTreasureHoard(this.random); // Explicitly pass random
                                break;
                            default:
                                treasure = generateTreasure(this.random); // Explicitly pass random
                        }
                        
                        this.treasures.push({ x, y, treasure });
                        placed = true;
                    }
                    
                    attempts++;
                }
            }
            
            // If we couldn't place in a room, try anywhere
            if (!placed) {
                attempts = 0;
                
                while (!placed && attempts < 20) {
                    // Pick a random position
                    const x = this.random.nextInt(1, this.width - 1);
                    const y = this.random.nextInt(1, this.height - 1);
                    
                    // Check if the position is valid
                    if (!this.grid[y][x].blocked && 
                        this.grid[y][x].type !== 'wall' &&
                        this.grid[y][x].type !== 'entrance' && 
                        this.grid[y][x].type !== 'exit' &&
                        this.grid[y][x].type !== 'water' &&
                        !this.treasureAt(x, y) &&
                        !this.monsterAt(x, y)) {
                        
                        // Generate treasure (simpler treasures in corridors)
                        const treasureType = this.random.select(['coins', 'gems', 'items']);
                        let treasure;
                        
                        switch (treasureType) {
                            case 'coins':
                                treasure = generateCoinTreasure(this.random); // Explicitly pass random
                                break;
                            case 'gems':
                                treasure = generateGemTreasure(this.random); // Explicitly pass random
                                break;
                            case 'items':
                                treasure = generateItemTreasure(this.random); // Explicitly pass random
                                break;
                            default:
                                treasure = generateTreasure(this.random); // Explicitly pass random
                        }
                        
                        this.treasures.push({ x, y, treasure });
                        placed = true;
                    }
                    
                    attempts++;
                }
            }
        }
        
        return this.treasures;
    }
    
    /**
     * Creates a room pattern that can be placed in the dungeon
     * @param {number} width - Width of the pattern
     * @param {number} height - Height of the pattern
     * @param {string} patternType - Type of pattern to create
     * @returns {Array} 2D grid representing the pattern
     */
    createRoomPattern(width, height, patternType = 'standard') {
        return createRoomPattern(width, height, this.random, patternType);
    }
    
    /**
     * Places a room pattern in the dungeon grid
     * @param {Array} pattern - The pattern to place
     * @param {number} x - X coordinate for placement
     * @param {number} y - Y coordinate for placement
     * @returns {boolean} True if pattern was successfully placed
     */
    placeRoomPattern(pattern, x, y) {
        if (!this.grid) {
            throw new Error("Dungeon grid must be generated before placing patterns");
        }
        return placeRoomPattern(this.grid, pattern, x, y);
    }
    
    /**
     * Creates a treasure vault in the dungeon
     * @param {number} x - X coordinate for the vault
     * @param {number} y - Y coordinate for the vault
     * @param {number} size - Size of the vault
     * @returns {Object} Vault details including position and treasures
     */
    createTreasureVault(x, y, size = 5) {
        if (!this.grid) {
            throw new Error("Dungeon grid must be generated before creating a vault");
        }
        const vault = createTreasureVault(this.grid, x, y, size, this.random);
        
        // Add vault treasures to the dungeon's treasure list
        if (vault && vault.treasures) {
            this.treasures = [...this.treasures, ...vault.treasures];
        }
        
        return vault;
    }
    
    /**
     * Creates a secret passage between two points in the dungeon
     * @param {number} x1 - Starting X coordinate
     * @param {number} y1 - Starting Y coordinate
     * @param {number} x2 - Ending X coordinate
     * @param {number} y2 - Ending Y coordinate
     * @returns {boolean} True if passage was created successfully
     */
    createSecretPassage(x1, y1, x2, y2) {
        if (!this.grid) {
            throw new Error("Dungeon grid must be generated before creating secret passages");
        }
        return createSecretPassage(this.grid, x1, y1, x2, y2);
    }
    
    /**
     * Generate a monster based on dungeon parameters
     * @param {number} challenge - Challenge rating (optional)
     * @returns {Object} Generated monster
     */
    generateMonster(challenge = null) {
        const monster = generateMonster(this.dungeonType, challenge, this.random);
        return mapMonsterIdToMonster(monster.monsterId, this.dungeonType);
    }
    
    /**
     * Add keys and puzzles to the dungeon
     * @param {number} complexity - Complexity level of puzzles/keys
     * @returns {Object} Updated grid and key/puzzle positions
     */
    addKeysAndPuzzles(complexity = 1) {
        if (!this.grid) {
            throw new Error("Dungeon grid must be generated before adding keys and puzzles");
        }
        
        const result = addKeysAndPuzzles(this.grid, complexity, this.random);
        this.grid = result.grid;
        return result;
    }
    
    /**
     * Check if there's a monster at a specific location
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if a monster exists at this location
     */
    monsterAt(x, y) {
        return this.monsters.some(monster => monster.x === x && monster.y === y);
    }
    
    /**
     * Check if there's treasure at a specific location
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if treasure exists at this location
     */
    treasureAt(x, y) {
        return this.treasures.some(treasure => treasure.x === x && treasure.y === y);
    }
}