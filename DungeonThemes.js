export const DungeonThemes = {
    standard: {
        name: 'Standard Dungeon',
        colors: {
            room: '#e8e8e8',
            corridor: '#d0d0d0',
            wall: '#555555'
        },
        roomTypes: ['armory', 'barracks', 'storage', 'common'],
        decorations: ['torches', 'columns', 'rubble', 'crates'],
        features: ['iron_bars', 'weapon_racks', 'tables', 'chairs']
    },

    boneyard: {
        name: 'Bone Crypt Ossuary',
        colors: {
            room: '#d8d0c8',
            corridor: '#c0b8b0',
            wall: '#8a7b6c',
            altar: '#a3927d',
            tomb: '#8a7b6c'
        },
        roomTypes: ['tomb', 'ritual', 'ossuary', 'catacombs'],
        decorations: ['bones', 'skulls', 'candles', 'cobwebs'],
        features: ['sarcophagi', 'bone_piles', 'altars', 'urns']
    },

    darkzone: {
        name: 'Dark Dimension',
        colors: {
            room: '#3a3a5e',
            corridor: '#282840',
            wall: '#1a1a2e',
            void: '#1a1a2e',
            portal: '#5a3696'
        },
        roomTypes: ['void_chamber', 'portal_room', 'shadow_sanctum', 'abyss'],
        decorations: ['void_rifts', 'shadow_tendrils', 'floating_crystals'],
        features: ['portals', 'void_pools', 'dark_altars', 'shadow_veils']
    }
};

export const RoomDesignations = {
    // Combat-focused rooms
    MONSTER_LAIR: {
        type: 'combat',
        features: ['bone_piles', 'claw_marks', 'debris'],
        decoration_chance: 0.7
    },
    
    GUARD_POST: {
        type: 'combat',
        features: ['weapon_racks', 'tables', 'chairs'],
        decoration_chance: 0.5
    },

    // Treasure rooms
    VAULT: {
        type: 'treasure',
        features: ['strong_boxes', 'pedestals', 'locked_chests'],
        decoration_chance: 0.9
    },

    TREASURY: {
        type: 'treasure',
        features: ['coin_piles', 'gem_displays', 'treasure_chests'],
        decoration_chance: 0.8
    },

    // Utility rooms
    ARMORY: {
        type: 'utility',
        features: ['weapon_racks', 'armor_stands', 'forge'],
        decoration_chance: 0.6
    },

    STORAGE: {
        type: 'utility',
        features: ['crates', 'barrels', 'shelves'],
        decoration_chance: 0.4
    },

    // Special rooms
    RITUAL_CHAMBER: {
        type: 'special',
        features: ['altars', 'runes', 'candles', 'magical_circles'],
        decoration_chance: 0.9
    },

    THRONE_ROOM: {
        type: 'special',
        features: ['throne', 'pillars', 'tapestries', 'braziers'],
        decoration_chance: 1.0
    }
};

export const RoomDecorations = {
    // Universal decorations
    universal: [
        'torch',
        'pillar',
        'rubble',
        'crack'
    ],

    // Theme-specific decorations
    standard: [
        'barrel',
        'crate',
        'table',
        'chair',
        'weapon_rack'
    ],

    boneyard: [
        'bones',
        'skull',
        'coffin',
        'gravestone',
        'cobweb'
    ],

    darkzone: [
        'void_rift',
        'shadow_tendril',
        'floating_crystal',
        'dark_mist'
    ]
};

export function applyThemeToRoom(room, theme, designation) {
    const themeData = DungeonThemes[theme];
    const designationData = RoomDesignations[designation];
    
    if (!themeData || !designationData) return room;

    // Apply base theme colors
    room.style = {
        floor: themeData.colors.room,
        wall: themeData.colors.wall
    };

    // Add theme-specific features
    if (Math.random() < designationData.decoration_chance) {
        room.decorations = [];
        
        // Add designation-specific features
        const numFeatures = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numFeatures; i++) {
            const feature = designationData.features[Math.floor(Math.random() * designationData.features.length)];
            if (!room.decorations.includes(feature)) {
                room.decorations.push(feature);
            }
        }

        // Add theme-specific decorations
        const numDecorations = Math.floor(Math.random() * 4) + 1;
        for (let i = 0; i < numDecorations; i++) {
            const decoration = themeData.decorations[Math.floor(Math.random() * themeData.decorations.length)];
            if (!room.decorations.includes(decoration)) {
                room.decorations.push(decoration);
            }
        }
    }

    return room;
}

export function getRandomRoomDesignation(roomType) {
    const designations = Object.entries(RoomDesignations)
        .filter(([_, data]) => data.type === roomType)
        .map(([key]) => key);
    
    return designations[Math.floor(Math.random() * designations.length)];
}

export function getThemeDecorations(theme, count = 1) {
    const themeData = DungeonThemes[theme];
    if (!themeData) return [];

    const decorations = [
        ...RoomDecorations.universal,
        ...(RoomDecorations[theme] || [])
    ];

    const selected = [];
    for (let i = 0; i < count; i++) {
        const decoration = decorations[Math.floor(Math.random() * decorations.length)];
        if (!selected.includes(decoration)) {
            selected.push(decoration);
        }
    }

    return selected;
}
