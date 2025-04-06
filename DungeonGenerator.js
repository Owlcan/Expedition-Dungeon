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

import { RoomDesignations, assignRoomDesignation, decorateRoom } from './RoomDesignations.js';

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
            return mediumDark[(monsterId - 200) % smallDark.length];
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
    constructor(options = {}) {
        // Default options
        this.options = {
            width: 50,
            height: 50,
            roomCount: 15,
            minRoomSize: 3,
            maxRoomSize: 8,
            corridorWidth: 1,
            roomSpacing: 1,
            dungeonType: 'standard',
            theme: 'standard',
            seed: Math.floor(Math.random() * 1000000),
            ...options  // Merge provided options
        };

        // Initialize random generator with seed
        this.random = {
            next: () => Math.random(),  // Replace with seeded random if needed
            seed: this.options.seed
        };
    }

    generate() {
        const dungeon = {
            width: this.options.width,
            height: this.options.height,
            cells: Array(this.options.height).fill().map(() => 
                Array(this.options.width).fill().map(() => ({ 
                    type: 'wall', 
                    blocked: true 
                }))
            ),
            rooms: [],
            entities: [],
            theme: this.options.theme,
            options: this.options  // Store options with dungeon
        };

        // Generate rooms first
        dungeon.rooms = this.generateRooms(dungeon);

        // Connect rooms
        this.connectRooms(dungeon);

        // Add features based on theme
        this.applyTheme(dungeon);

        return dungeon;
    }

    generateRooms(dungeon) {
        const rooms = [];
        const attempts = this.options.roomCount * 2;

        for (let i = 0; i < attempts && rooms.length < this.options.roomCount; i++) {
            const width = Math.floor(this.random.next() * 
                (this.options.maxRoomSize - this.options.minRoomSize + 1) + 
                this.options.minRoomSize);
            const height = Math.floor(this.random.next() * 
                (this.options.maxRoomSize - this.options.minRoomSize + 1) + 
                this.options.minRoomSize);

            const x = Math.floor(this.random.next() * (dungeon.width - width - 2) + 1);
            const y = Math.floor(this.random.next() * (dungeon.height - height - 2) + 1);

            // Check for room overlap
            let overlaps = false;
            for (const room of rooms) {
                if (x < room.x + room.width + this.options.roomSpacing && 
                    x + width + this.options.roomSpacing > room.x && 
                    y < room.y + room.height + this.options.roomSpacing && 
                    y + height + this.options.roomSpacing > room.y) {
                    overlaps = true;
                    break;
                }
            }

            if (!overlaps) {
                const room = {
                    x, y, width, height,
                    type: this.options.dungeonType,
                    theme: this.options.theme
                };
                rooms.push(room);

                // Carve room into dungeon cells
                for (let ry = y; ry < y + height; ry++) {
                    for (let rx = x; rx < x + width; rx++) {
                        dungeon.cells[ry][rx] = { 
                            type: 'room',
                            blocked: false,
                            roomId: rooms.length - 1
                        };
                    }
                }
            }
        }

        return rooms;
    }

    connectRooms(dungeon) {
        const { rooms } = dungeon;
        
        // Create edges between all rooms
        for (let i = 0; i < rooms.length - 1; i++) {
            const startRoom = rooms[i];
            const endRoom = rooms[i + 1];
            
            // Get room centers
            const startX = Math.floor(startRoom.x + startRoom.width / 2);
            const startY = Math.floor(startRoom.y + startRoom.height / 2);
            const endX = Math.floor(endRoom.x + endRoom.width / 2);
            const endY = Math.floor(endRoom.y + endRoom.height / 2);
            
            // Randomly choose horizontal-first or vertical-first corridor
            if (this.random.next() > 0.5) {
                this.createHorizontalCorridor(dungeon, startX, endX, startY);
                this.createVerticalCorridor(dungeon, startY, endY, endX);
            } else {
                this.createVerticalCorridor(dungeon, startY, endY, startX);
                this.createHorizontalCorridor(dungeon, startX, endX, endY);
            }
        }
    }

    createHorizontalCorridor(dungeon, startX, endX, y) {
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        
        for (let x = minX; x <= maxX; x++) {
            if (dungeon.cells[y][x].type === 'wall') {
                dungeon.cells[y][x] = { type: 'corridor', blocked: false };
                
                // Add corridor walls
                if (y > 0 && dungeon.cells[y-1][x].type === 'wall') {
                    dungeon.cells[y-1][x] = { type: 'wall', blocked: true };
                }
                if (y < dungeon.height-1 && dungeon.cells[y+1][x].type === 'wall') {
                    dungeon.cells[y+1][x] = { type: 'wall', blocked: true };
                }
            }
        }
    }

    createVerticalCorridor(dungeon, startY, endY, x) {
        const minY = Math.min(startY, endY);
        const maxY = Math.max(startY, endY);
        
        for (let y = minY; y <= maxY; y++) {
            if (dungeon.cells[y][x].type === 'wall') {
                dungeon.cells[y][x] = { type: 'corridor', blocked: false };
                
                // Add corridor walls
                if (x > 0 && dungeon.cells[y][x-1].type === 'wall') {
                    dungeon.cells[y][x-1] = { type: 'wall', blocked: true };
                }
                if (x < dungeon.width-1 && dungeon.cells[y][x+1].type === 'wall') {
                    dungeon.cells[y][x+1] = { type: 'wall', blocked: true };
                }
            }
        }
    }

    applyTheme(dungeon) {
        // Apply theme-specific modifications
        switch(dungeon.theme) {
            case 'boneyard':
                this.applyBoneyardTheme(dungeon);
                break;
            case 'darkzone':
                this.applyDarkzoneTheme(dungeon);
                break;
            case 'standard':
            default:
                // Standard theme is the default
                break;
        }

        // Add theme-specific features
        this.addThemeFeatures(dungeon);

        return dungeon;
    }

    applyBoneyardTheme(dungeon) {
        // Convert standard rooms/corridors to bone crypt variants
        for (let y = 0; y < dungeon.height; y++) {
            for (let x = 0; x < dungeon.width; x++) {
                const cell = dungeon.cells[y][x];
                
                if (cell.type === 'room') {
                    cell.type = 'crypt';
                } else if (cell.type === 'corridor') {
                    cell.type = 'crypt-corridor';
                }
            }
        }

        // Add special features like tombs and altars
        this.addBoneCryptFeatures(dungeon);
    }

    applyDarkzoneTheme(dungeon) {
        // Convert standard rooms/corridors to dark dimension variants
        for (let y = 0; y < dungeon.height; y++) {
            for (let x = 0; x < dungeon.width; x++) {
                const cell = dungeon.cells[y][x];
                
                if (cell.type === 'room') {
                    cell.type = 'dark-room';
                } else if (cell.type === 'corridor') {
                    cell.type = 'dark-corridor';
                }
            }
        }

        // Add special features like void rifts and portals
        this.addDarkzoneFeatures(dungeon);
    }

    addThemeFeatures(dungeon) {
        // Add theme-specific decorative features based on dungeon theme
        switch(dungeon.theme) {
            case 'boneyard':
                // Already handled in applyBoneyardTheme
                break;
            case 'darkzone':
                // Already handled in applyDarkzoneTheme
                break;
            case 'standard':
            default:
                this.addStandardFeatures(dungeon);
                break;
        }
    }

    addBoneCryptFeatures(dungeon) {
        const featureChance = 0.05; // 5% chance per suitable cell
        const rooms = dungeon.rooms;
        
        // Add bone crypt features to some rooms
        for (const room of rooms) {
            // Select larger rooms for special features
            if (room.width >= 4 && room.height >= 4) {
                // Add tomb to center of room
                if (this.random.next() < 0.3) {
                    const centerX = Math.floor(room.x + room.width / 2);
                    const centerY = Math.floor(room.y + room.height / 2);
                    
                    dungeon.cells[centerY][centerX].type = 'tomb';
                }
                
                // Add altar to some rooms
                if (this.random.next() < 0.2) {
                    const altarX = room.x + 1 + Math.floor(this.random.next() * (room.width - 2));
                    const altarY = room.y + 1 + Math.floor(this.random.next() * (room.height - 2));
                    
                    dungeon.cells[altarY][altarX].type = 'altar';
                }
            }
        }
    }

    addDarkzoneFeatures(dungeon) {
        const featureChance = 0.05; // 5% chance per suitable cell
        const rooms = dungeon.rooms;
        
        // Add void portals to some rooms
        for (const room of rooms) {
            // Select larger rooms for portals
            if (room.width >= 5 && room.height >= 5) {
                // Add portal to center of room
                if (this.random.next() < 0.3) {
                    const centerX = Math.floor(room.x + room.width / 2);
                    const centerY = Math.floor(room.y + room.height / 2);
                    
                    dungeon.cells[centerY][centerX].type = 'portal';
                }
            }
        }
        
        // Add void rifts to some corridors
        for (let y = 1; y < dungeon.height - 1; y++) {
            for (let x = 1; x < dungeon.width - 1; x++) {
                if (dungeon.cells[y][x].type === 'dark-corridor' && this.random.next() < 0.02) {
                    dungeon.cells[y][x].type = 'void';
                }
            }
        }
    }

    addStandardFeatures(dungeon) {
        // Add standard dungeon features like torches, pillars, etc.
        const featureChance = 0.03; // 3% chance per suitable cell
        
        for (let y = 1; y < dungeon.height - 1; y++) {
            for (let x = 1; x < dungeon.width - 1; x++) {
                if (dungeon.cells[y][x].type === 'room' && this.random.next() < featureChance) {
                    // Add decorative features to room
                    dungeon.cells[y][x].feature = this.random.next() < 0.5 ? 'torch' : 'pillar';
                }
            }
        }
    }
}