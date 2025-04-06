export const RoomDesignations = {
    // Combat Rooms
    GUARD_POST: {
        type: 'combat',
        features: ['weapon_racks', 'tables', 'chairs'],
        monsters: ['guards', 'sentries'],
        decoration_chance: 0.7,
        loot_table: 'military'
    },

    MONSTER_LAIR: {
        type: 'combat',
        features: ['bone_piles', 'nest', 'debris'],
        decoration_chance: 0.8,
        loot_table: 'monster'
    },

    ARENA: {
        type: 'combat',
        features: ['columns', 'pit', 'weapon_racks'],
        decoration_chance: 0.9,
        loot_table: 'military'
    },

    // Treasure Rooms
    TREASURY: {
        type: 'treasure',
        features: ['chests', 'shelves', 'strongboxes'],
        traps: true,
        decoration_chance: 0.9,
        loot_table: 'treasury'
    },

    VAULT: {
        type: 'treasure',
        features: ['vault_door', 'pedestals', 'display_cases'],
        traps: true,
        decoration_chance: 1.0,
        loot_table: 'vault'
    },

    // Utility Rooms
    ARMORY: {
        type: 'utility',
        features: ['weapon_racks', 'armor_stands', 'workbench'],
        decoration_chance: 0.6,
        loot_table: 'armory'
    },

    BARRACKS: {
        type: 'utility',
        features: ['beds', 'footlockers', 'tables'],
        decoration_chance: 0.5,
        loot_table: 'military'
    },

    STORAGE: {
        type: 'utility',
        features: ['crates', 'barrels', 'shelves'],
        decoration_chance: 0.4,
        loot_table: 'storage'
    },

    // Special Rooms
    RITUAL_CHAMBER: {
        type: 'special',
        features: ['altar', 'braziers', 'runes'],
        decoration_chance: 1.0,
        loot_table: 'arcane'
    },

    THRONE_ROOM: {
        type: 'special',
        features: ['throne', 'columns', 'tapestries'],
        decoration_chance: 1.0,
        loot_table: 'royal'
    },

    LIBRARY: {
        type: 'special',
        features: ['bookshelves', 'desks', 'scrolls'],
        decoration_chance: 0.8,
        loot_table: 'library'
    },

    // Theme-specific Rooms
    OSSUARY: {
        type: 'bone_crypt',
        features: ['bone_walls', 'skull_piles', 'sarcophagi'],
        decoration_chance: 0.9,
        loot_table: 'undead'
    },

    VOID_CHAMBER: {
        type: 'dark_dimension',
        features: ['void_portals', 'floating_crystals', 'shadow_veils'],
        decoration_chance: 0.9,
        loot_table: 'void'
    }
};

export function assignRoomDesignation(room, theme = 'standard') {
    // Weight table for room type selection
    const weights = {
        combat: 0.3,
        treasure: 0.2,
        utility: 0.3,
        special: 0.1,
        [theme]: 0.1
    };

    // Select room type based on weights
    const roll = Math.random();
    let selectedType = 'utility';
    let cumulative = 0;

    for (const [type, weight] of Object.entries(weights)) {
        cumulative += weight;
        if (roll < cumulative) {
            selectedType = type;
            break;
        }
    }

    // Filter room designations by selected type
    const possibleRooms = Object.entries(RoomDesignations)
        .filter(([_, data]) => data.type === selectedType)
        .map(([key]) => key);

    // Select random room designation from filtered list
    const designation = possibleRooms[Math.floor(Math.random() * possibleRooms.length)];
    
    return {
        ...room,
        designation,
        features: RoomDesignations[designation].features,
        decorationChance: RoomDesignations[designation].decoration_chance,
        lootTable: RoomDesignations[designation].loot_table
    };
}

export function decorateRoom(room) {
    if (!room.designation) return room;

    const designationData = RoomDesignations[room.designation];
    if (!designationData) return room;

    // Apply features based on decoration chance
    if (Math.random() < designationData.decoration_chance) {
        room.decorations = [];
        
        // Add 1-3 random features
        const numFeatures = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numFeatures; i++) {
            const feature = designationData.features[
                Math.floor(Math.random() * designationData.features.length)
            ];
            if (!room.decorations.includes(feature)) {
                room.decorations.push(feature);
            }
        }
    }

    // Add traps if specified
    if (designationData.traps && Math.random() < 0.5) {
        room.trap = {
            type: 'trap',
            discovered: false
        };
    }

    return room;
}
