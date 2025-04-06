// TreasureGenerator.js - Adds traditional treasure and traps to dungeons

// Export all the functions for use in other files
export {
    TREASURE_TYPES,
    TRAP_TYPES,
    generateTreasure,
    generateCoinTreasure,
    generateGemTreasure,
    generateItemTreasure,
    generateMagicalTreasure,
    generateTreasureHoard,
    getTreasureDisplayName,
    treasureSanitizer,
    SeededRandom
};

/**
 * Traditional dungeon treasure types
 */
const TREASURE_TYPES = {
    coins: [
        { name: "Copper Pieces", value: 1, rarity: 0.4 },
        { name: "Silver Pieces", value: 10, rarity: 0.3 },
        { name: "Gold Pieces", value: 100, rarity: 0.2 },
        { name: "Platinum Pieces", value: 1000, rarity: 0.1 }
    ],
    gems: [
        { name: "Quartz", value: 10, rarity: 0.2 },
        { name: "Lapis Lazuli", value: 15, rarity: 0.15 },
        { name: "Pearl", value: 25, rarity: 0.12 },
        { name: "Jade", value: 40, rarity: 0.10 },
        { name: "Moonstone", value: 50, rarity: 0.08 },
        { name: "Topaz", value: 80, rarity: 0.08 },
        { name: "Garnet", value: 100, rarity: 0.07 },
        { name: "Amber", value: 120, rarity: 0.06 },
        { name: "Amethyst", value: 150, rarity: 0.05 },
        { name: "Sapphire", value: 300, rarity: 0.04 },
        { name: "Emerald", value: 500, rarity: 0.03 },
        { name: "Ruby", value: 800, rarity: 0.015 },
        { name: "Diamond", value: 1000, rarity: 0.01 },
        { name: "Clear Crystal", value: 50, rarity: 0.09 },
        { name: "Rock Salt", value: 5, rarity: 0.25 },
        { name: "Robusca", value: 200, rarity: 0.05 },
        { name: "Vitalium", value: 400, rarity: 0.02 },
        { name: "Vitalocanum", value: 700, rarity: 0.01 }
    ],
    valuables: [
        { name: "Silver Ring", value: 20, rarity: 0.15 },
        { name: "Gold Amulet", value: 50, rarity: 0.12 },
        { name: "Ornate Dagger", value: 80, rarity: 0.10 },
        { name: "Silver Mirror", value: 100, rarity: 0.10 },
        { name: "Decorated Goblet", value: 120, rarity: 0.08 },
        { name: "Platinum Ring", value: 150, rarity: 0.08 },
        { name: "Golden Statuette", value: 200, rarity: 0.07 },
        { name: "Jeweled Idol", value: 250, rarity: 0.05 },
        { name: "Carved Ivory Figurine", value: 300, rarity: 0.05 },
        { name: "Silver Censer", value: 350, rarity: 0.04 },
        { name: "Bejeweled Crown", value: 500, rarity: 0.03 },
        { name: "Golden Scepter", value: 800, rarity: 0.02 },
        { name: "Treasure Chest", value: 1000, rarity: 0.01 },
        { name: "Iron Dust", value: 15, rarity: 0.18 }
    ],
    magical: [
        { name: "Mysterious Scroll", value: 50, rarity: 0.15, magical: true },
        { name: "Strange Potion", value: 75, rarity: 0.12, magical: true },
        { name: "Magical Trinket", value: 100, rarity: 0.10, magical: true },
        { name: "Enchanted Amulet", value: 150, rarity: 0.08, magical: true },
        { name: "Arcane Focus", value: 200, rarity: 0.07, magical: true },
        { name: "Glowing Rune Stone", value: 250, rarity: 0.06, magical: true },
        { name: "Enchanted Weapon", value: 400, rarity: 0.05, magical: true },
        { name: "Magic Wand", value: 500, rarity: 0.04, magical: true },
        { name: "Spellbook", value: 700, rarity: 0.03, magical: true },
        { name: "Greater Magical Artifact", value: 1000, rarity: 0.01, magical: true },
        { name: "Health Potion", value: 100, rarity: 0.09, magical: true }
    ],
    ingredients: [
        { name: "Adhesive", value: 15, rarity: 0.2 },
        { name: "Barkgum", value: 20, rarity: 0.18 },
        { name: "Berrimaters", value: 10, rarity: 0.25 },
        { name: "Cotton Fluff", value: 8, rarity: 0.3 },
        { name: "Cream", value: 5, rarity: 0.35 },
        { name: "Egg", value: 3, rarity: 0.4 },
        { name: "Common Herb", value: 5, rarity: 0.35 },
        { name: "Savoury Herb", value: 12, rarity: 0.2 },
        { name: "Water Essence", value: 40, rarity: 0.15 },
        { name: "Plasticizer", value: 35, rarity: 0.12 },
        { name: "Petrodistillate", value: 30, rarity: 0.13 },
        { name: "Solvent", value: 25, rarity: 0.14 },
        { name: "Touch of Love", value: 60, rarity: 0.08 },
        { name: "Vanilla", value: 15, rarity: 0.2 },
        { name: "Yarn", value: 7, rarity: 0.3 }
    ],
    legendary: [
        { name: "Azure Moon Cream", value: 500, rarity: 0.03, magical: true },
        { name: "Lunar-Dodo Egg", value: 600, rarity: 0.025, magical: true },
        { name: "Phoenix Feather", value: 800, rarity: 0.02, magical: true },
        { name: "Distillation of a Night Sky", value: 750, rarity: 0.022, magical: true },
        { name: "Star Sugar", value: 400, rarity: 0.04, magical: true },
        { name: "Starsoaked Vanilla", value: 450, rarity: 0.035, magical: true },
        { name: "Darkessence", value: 700, rarity: 0.023, magical: true }
    ],
    food: [
        { name: "Butter", value: 8, rarity: 0.3 },
        { name: "Herb Butter", value: 20, rarity: 0.15 },
        { name: "White Sugar", value: 12, rarity: 0.25 },
        { name: "Turbinado Sugar", value: 40, rarity: 0.1 },
        { name: "Vanilla Ice Cream", value: 25, rarity: 0.12 },
        { name: "Azure Harvest Blue Moon Ice Cream", value: 200, rarity: 0.02 },
        { name: "Quiche", value: 30, rarity: 0.1 }
    ],
    crafting: [
        { name: "Plastic Sheeting", value: 15, rarity: 0.2 },
        { name: "Diaper", value: 10, rarity: 0.15 },
        { name: "Lovely Diaper", value: 25, rarity: 0.08 }
    ]
};

/**
 * Trap types for dungeon generation
 */
const TRAP_TYPES = [
    { name: "Poison Dart", danger: "low", description: "Fires a small poisoned dart when triggered.", detectionDC: 12, disarmDC: 14 },
    { name: "Falling Net", danger: "low", description: "A weighted net drops from above to entangle creatures.", detectionDC: 10, disarmDC: 12 },
    { name: "Tripwire", danger: "low", description: "A nearly invisible wire that triggers another trap or alarm.", detectionDC: 13, disarmDC: 13 },
    { name: "Pit", danger: "medium", description: "A concealed pit that opens beneath those who step on it.", detectionDC: 15, disarmDC: 15 },
    { name: "Swinging Blade", danger: "medium", description: "A sharp blade swings down from the ceiling when triggered.", detectionDC: 15, disarmDC: 16 },
    { name: "Sleeping Gas", danger: "medium", description: "Releases a colorless gas that induces sleep.", detectionDC: 16, disarmDC: 16 },
    { name: "Flame Jet", danger: "high", description: "A jet of intense flames shoots out from a hidden nozzle.", detectionDC: 17, disarmDC: 17 },
    { name: "Crushing Walls", danger: "high", description: "Walls on either side of a corridor begin to close in.", detectionDC: 18, disarmDC: 18 },
    { name: "Lightning Rune", danger: "high", description: "A magical rune that discharges electricity when triggered.", detectionDC: 19, disarmDC: 19 },
    { name: "Teleportation Circle", danger: "special", description: "Teleports creatures to another location in the dungeon.", detectionDC: 20, disarmDC: 20 }
];

/**
 * Generate a random treasure based on dungeon level
 * @param {number} level - Dungeon level (affects treasure value)
 * @param {Object} random - Seeded random generator
 * @param {string} dungeonType - Type of dungeon (affects treasure types)
 * @returns {Object} Generated treasure
 */
function generateTreasure(level = 1, random, dungeonType = 'standard') {
    if (!random) {
        random = new SeededRandom(Math.floor(Math.random() * 10000));
    }
    
    // Choose treasure type based on random and dungeon type
    const treasureTypes = ['coins', 'gems', 'valuables', 'magical', 'ingredients'];
    
    // Adjust probabilities based on dungeon type
    let typeWeights;
    if (dungeonType === 'bone-crypt') {
        typeWeights = [0.25, 0.3, 0.2, 0.2, 0.05];
    } else if (dungeonType === 'library') {
        typeWeights = [0.15, 0.2, 0.15, 0.45, 0.05];
    } else {
        typeWeights = [0.4, 0.25, 0.15, 0.1, 0.1];
    }
    
    // Choose treasure type based on weights
    const roll = random.next();
    let cumulativeWeight = 0;
    let chosenType;
    
    for (let i = 0; i < treasureTypes.length; i++) {
        cumulativeWeight += typeWeights[i];
        if (roll <= cumulativeWeight) {
            chosenType = treasureTypes[i];
            break;
        }
    }
    
    // Generate specific treasure based on chosen type
    let treasure;
    switch (chosenType) {
        case 'coins':
            treasure = generateCoinTreasure(level, random);
            break;
        case 'gems':
            treasure = generateGemTreasure(level, random);
            break;
        case 'valuables':
            treasure = generateItemTreasure(level, random);
            break;
        case 'magical':
            treasure = generateMagicalTreasure(level, random);
            break;
        case 'ingredients':
            treasure = generateItemTreasure(level, random, 'ingredients');
            break;
        default:
            treasure = generateCoinTreasure(level, random);
            break;
    }
    
    // Ensure treasure has a value property
    if (!treasure.value && treasure.totalValue) {
        treasure.value = treasure.totalValue;
    }
    
    if (!treasure.totalValue && treasure.value) {
        treasure.totalValue = treasure.value;
    }
    
    // Ensure there's always at least some value
    if (!treasure.value && !treasure.totalValue) {
        treasure.value = level * 5;
        treasure.totalValue = treasure.value;
    }
    
    return treasure;
}

/**
 * Generate coin-based treasure
 * @param {number|Object} level - Dungeon level or random object
 * @param {Object} [random] - Seeded random generator
 * @returns {Object} Coin treasure
 */
function generateCoinTreasure(level = 1, random) {
    // Handle case where level is actually the random object
    if (typeof level === 'object' && level !== null) {
        random = level;
        level = 1;
    }
    
    // Create a new random generator if none provided
    if (!random) {
        random = new SeededRandom(Math.floor(Math.random() * 10000));
    }
    
    const baseAmount = 5 * level;
    const multiplier = 0.5 + random.next() * 2.5; // 0.5x to 3x
    const totalCoins = Math.max(1, Math.floor(baseAmount * multiplier));
    
    // Distribute coins by type
    const result = { coins: {} };
    
    if (level >= 5 && random.next() < 0.2) {
        // Small chance of platinum for higher levels
        result.coins.PP = random.nextInt(1, 1 + Math.floor(level / 5));
        result.totalValue = result.coins.PP * 1000;
    } else if (level >= 3 || random.next() < 0.5) {
        // Gold pieces
        result.coins.GP = random.nextInt(1, totalCoins);
        result.totalValue = result.coins.GP * 100;
    } else if (level >= 1 || random.next() < 0.7) {
        // Silver pieces
        result.coins.SP = random.nextInt(1, totalCoins * 2);
        result.totalValue = result.coins.SP * 10;
    } else {
        // Copper pieces
        result.coins.CP = random.nextInt(5, totalCoins * 5);
        result.totalValue = result.coins.CP;
    }
    
    return result;
}

/**
 * Generate gem-based treasure
 * @param {number|Object} level - Dungeon level or random object
 * @param {Object} [random] - Seeded random generator
 * @returns {Object} Gem treasure
 */
function generateGemTreasure(level = 1, random) {
    // Handle case where level is actually the random object
    if (typeof level === 'object' && level !== null) {
        random = level;
        level = 1;
    }
    
    // Create a new random generator if none provided
    if (!random) {
        random = new SeededRandom(Math.floor(Math.random() * 10000));
    }
    
    const gems = TREASURE_TYPES.gems;
    const maxGemValue = 50 * level;
    
    // Filter gems that are appropriate for this dungeon level
    const appropriateGems = gems.filter(gem => gem.value <= maxGemValue);
    
    if (appropriateGems.length === 0) {
        return generateCoinTreasure(level, random); // Fallback
    }
    
    // Select a gem based on rarity-weighted random selection
    const totalRarity = appropriateGems.reduce((sum, gem) => sum + gem.rarity, 0);
    let randomRoll = random.next() * totalRarity;
    let selectedGem;
    
    for (const gem of appropriateGems) {
        randomRoll -= gem.rarity;
        if (randomRoll <= 0) {
            selectedGem = gem;
            break;
        }
    }
    
    if (!selectedGem) {
        selectedGem = random.select(appropriateGems);
    }
    
    // Determine quantity (usually 1, but sometimes more for lower-value gems)
    const quantity = selectedGem.value < 50 ? random.nextInt(1, 3) : 1;
    
    return {
        gems: [{
            name: selectedGem.name,
            quantity,
            value: selectedGem.value
        }],
        totalValue: quantity * selectedGem.value
    };
}

/**
 * Generate valuable item treasure
 * @param {number|Object} level - Dungeon level or random object
 * @param {Object} [random] - Seeded random generator
 * @param {string} type - Type of items ('valuables', 'ingredients', etc)
 * @returns {Object} Item treasure
 */
function generateItemTreasure(level = 1, random, type = 'valuables') {
    // Handle case where level is actually the random object
    if (typeof level === 'object' && level !== null) {
        type = random || 'valuables';  // Type might be in the second parameter
        random = level;
        level = 1;
    }
    
    // Create a new random generator if none provided
    if (!random) {
        random = new SeededRandom(Math.floor(Math.random() * 10000));
    }
    
    const items = TREASURE_TYPES[type] || TREASURE_TYPES.valuables;
    const maxItemValue = 100 * level;
    
    // Filter items that are appropriate for this level
    const appropriateItems = items.filter(item => item.value <= maxItemValue);
    
    if (appropriateItems.length === 0) {
        return generateCoinTreasure(level, random); // Fallback
    }
    
    // Select an item based on rarity-weighted random selection
    const totalRarity = appropriateItems.reduce((sum, item) => sum + item.rarity, 0);
    let randomRoll = random.next() * totalRarity;
    let selectedItem;
    
    for (const item of appropriateItems) {
        randomRoll -= item.rarity;
        if (randomRoll <= 0) {
            selectedItem = item;
            break;
        }
    }
    
    if (!selectedItem) {
        selectedItem = random.select(appropriateItems);
    }
    
    return {
        items: [{
            name: selectedItem.name,
            quantity: 1,
            value: selectedItem.value
        }],
        totalValue: selectedItem.value
    };
}

/**
 * Generate magical treasure
 * @param {number|Object} level - Dungeon level or random object
 * @param {Object} [random] - Seeded random generator
 * @returns {Object} Magical treasure
 */
function generateMagicalTreasure(level = 1, random) {
    // Handle case where level is actually the random object
    if (typeof level === 'object' && level !== null) {
        random = level;
        level = 1;
    }
    
    // Create a new random generator if none provided
    if (!random) {
        random = new SeededRandom(Math.floor(Math.random() * 10000));
    }
    
    // At lower levels, magical items are rare
    if (level < 3 && random.next() > 0.3) {
        return generateGemTreasure(level, random);
    }
    
    const items = TREASURE_TYPES.magical;
    const maxItemValue = 150 * level;
    
    // Filter items that are appropriate for this level
    const appropriateItems = items.filter(item => item.value <= maxItemValue);
    
    if (appropriateItems.length === 0) {
        return generateGemTreasure(level, random); // Fallback
    }
    
    // Select an item based on rarity-weighted random selection
    const totalRarity = appropriateItems.reduce((sum, item) => sum + item.rarity, 0);
    let randomRoll = random.next() * totalRarity;
    let selectedItem;
    
    for (const item of appropriateItems) {
        randomRoll -= item.rarity;
        if (randomRoll <= 0) {
            selectedItem = item;
            break;
        }
    }
    
    if (!selectedItem) {
        selectedItem = random.select(appropriateItems);
    }
    
    return {
        magical: [{
            name: selectedItem.name,
            quantity: 1,
            value: selectedItem.value
        }],
        totalValue: selectedItem.value
    };
}

/**
 * Generate a treasure hoard based on parameters
 * @param {number|Object} baseValue - Base value of the hoard or random object
 * @param {number|Object} [level] - Dungeon level or random object
 * @param {Object} [random] - Seeded random generator 
 * @param {string} [dungeonType] - Type of dungeon
 * @returns {Object} Generated treasure hoard
 */
function generateTreasureHoard(baseValue, level = 1, random, dungeonType = 'standard') {
    // Handle different parameter combinations
    if (typeof baseValue === 'object' && baseValue !== null) {
        // First parameter is random object
        dungeonType = level || 'standard';
        random = baseValue;
        baseValue = null;
        level = 1;
    } else if (typeof level === 'object' && level !== null) {
        // Second parameter is random object
        dungeonType = random || 'standard';
        random = level;
        level = 1;
    }
    
    // Create a new random generator if none provided
    if (!random) {
        random = new SeededRandom(Math.floor(Math.random() * 10000));
    }
    
    const hoard = {
        coins: [],
        gems: [],
        valuables: [],
        magical: []
    };
    
    // Determine hoard value by dungeon type and provided base value
    const actualBaseValue = baseValue || (dungeonType === 'bone-crypt' ? 500 : 300);
    const valueMultiplier = 0.5 + random.next() * 2.0; // 0.5x to 2.5x value
    const totalValue = Math.floor(actualBaseValue * valueMultiplier);
    
    // Assign values to different categories
    const coinRatio = 0.4 + random.next() * 0.2; // 40-60% in coins
    const gemRatio = 0.1 + random.next() * 0.2;  // 10-30% in gems
    const valuableRatio = 0.1 + random.next() * 0.15; // 10-25% in valuables
    const magicalRatio = 1 - coinRatio - gemRatio - valuableRatio; // Remainder in magical items
    
    // Generate coins
    let coinValue = Math.floor(totalValue * coinRatio);
    if (coinValue > 0) {
        // Start with higher value coins
        let remaining = coinValue;
        
        // Add platinum pieces
        if (remaining >= 1000 && random.next() < 0.5) {
            const platinum = Math.floor(remaining / 1000);
            const platToAdd = Math.min(platinum, random.nextInt(1, 10));
            if (platToAdd > 0) {
                hoard.coins.push({ name: "Platinum Pieces", amount: platToAdd, value: platToAdd * 1000 });
                remaining -= platToAdd * 1000;
            }
        }
        
        // Add gold pieces
        if (remaining >= 100) {
            const gold = Math.floor(remaining / 100);
            const goldToAdd = Math.min(gold, random.nextInt(1, 50));
            if (goldToAdd > 0) {
                hoard.coins.push({ name: "Gold Pieces", amount: goldToAdd, value: goldToAdd * 100 });
                remaining -= goldToAdd * 100;
            }
        }
        
        // Add silver pieces
        if (remaining >= 10) {
            const silver = Math.floor(remaining / 10);
            const silverToAdd = Math.min(silver, random.nextInt(1, 100));
            if (silverToAdd > 0) {
                hoard.coins.push({ name: "Silver Pieces", amount: silverToAdd, value: silverToAdd * 10 });
                remaining -= silverToAdd * 10;
            }
        }
        
        // Add copper pieces
        if (remaining > 0) {
            const copperToAdd = Math.min(remaining, random.nextInt(1, 200));
            if (copperToAdd > 0) {
                hoard.coins.push({ name: "Copper Pieces", amount: copperToAdd, value: copperToAdd });
            }
        }
    }
    
    // Generate gems
    let gemValue = Math.floor(totalValue * gemRatio);
    if (gemValue > 10) {
        const availableGems = [...TREASURE_TYPES.gems].sort((a, b) => random.next() - 0.5);
        
        let remaining = gemValue;
        let attempts = 3; // Limit attempts to prevent infinite loops
        
        while (remaining > 0 && attempts > 0 && availableGems.length > 0) {
            // Pick a random gem type that's affordable
            const affordableGems = availableGems.filter(g => g.value <= remaining);
            
            if (affordableGems.length === 0) {
                attempts--;
                continue;
            }
            
            const gem = random.select(affordableGems);
            const maxAmount = Math.floor(remaining / gem.value);
            const amount = Math.max(1, random.nextInt(1, Math.min(5, maxAmount)));
            
            hoard.gems.push({
                name: gem.name,
                amount,
                valueEach: gem.value,
                value: amount * gem.value
            });
            
            remaining -= amount * gem.value;
            attempts--;
        }
    }
    
    // Generate valuable items
    let valuableValue = Math.floor(totalValue * valuableRatio);
    if (valuableValue > 20) {
        const availableValuables = [...TREASURE_TYPES.valuables]
            .filter(v => v.value <= valuableValue)
            .sort((a, b) => random.next() - 0.5);
        
        if (availableValuables.length > 0) {
            const valuable = random.select(availableValuables);
            hoard.valuables.push({
                name: valuable.name,
                amount: 1,
                value: valuable.value
            });
            
            valuableValue -= valuable.value;
            
            // Possibly add a second valuable if there's value remaining
            if (valuableValue > 20) {
                const remainingValuables = availableValuables.filter(v => v.value <= valuableValue);
                if (remainingValuables.length > 0) {
                    const secondValuable = random.select(remainingValuables);
                    hoard.valuables.push({
                        name: secondValuable.name,
                        amount: 1,
                        value: secondValuable.value
                    });
                }
            }
        }
    }
    
    // Generate magical items - lower chance but possible
    let magicalValue = Math.floor(totalValue * magicalRatio);
    if (magicalValue > 50 && random.next() < 0.3) { // 30% chance for magical items
        const availableMagical = TREASURE_TYPES.magical
            .filter(m => m.value <= magicalValue)
            .sort((a, b) => random.next() - 0.5);
        
        if (availableMagical.length > 0) {
            const magical = random.select(availableMagical);
            hoard.magical.push({
                name: magical.name,
                amount: 1,
                value: magical.value
            });
        }
    }
    
    // Calculate total actual value of the hoard
    const actualValue = [
        ...hoard.coins.map(c => c.value),
        ...hoard.gems.map(g => g.value),
        ...hoard.valuables.map(v => v.value),
        ...hoard.magical.map(m => m.value)
    ].reduce((sum, val) => sum + val, 0);
    
    return {
        ...hoard,
        totalValue: actualValue
    };
}

/**
 * Function to get display name for a treasure
 * @param {Object} treasure - The treasure object 
 * @returns {string} - Display name for the treasure
 */
function getTreasureDisplayName(treasure) {
    const value = treasure.totalValue || treasure.value || 0;
    
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
 * A robust sanitizer function that ensures treasure objects always have defined values.
 * This function is used as a safety net to prevent undefined treasure values.
 * @param {Object} treasure - The treasure object to sanitize
 * @param {number} [dungeonLevel=1] - The dungeon level for default value calculation
 * @returns {Object} - The sanitized treasure object with guaranteed defined values
 */
function treasureSanitizer(treasure, dungeonLevel = 1) {
    if (!treasure) {
        // Create a default treasure object if none exists
        return {
            type: 'coins',
            value: dungeonLevel * 10,
            totalValue: dungeonLevel * 10,
            coins: { GP: dungeonLevel },
            description: `${dungeonLevel} Gold Pieces`
        };
    }
    
    // Create a deep copy to avoid modifying the original object
    const sanitized = JSON.parse(JSON.stringify(treasure));
    
    // Ensure base properties exist
    if (!sanitized.type) {
        sanitized.type = 'coins';
    }
    
    // Ensure value properties exist and are numbers
    const defaultValue = dungeonLevel * 10;
    
    // Handle value property
    if (typeof sanitized.value !== 'number') {
        // Try to calculate from other properties
        if (typeof sanitized.totalValue === 'number') {
            sanitized.value = sanitized.totalValue;
        } else if (sanitized.coins) {
            let value = 0;
            // Calculate from coins
            Object.entries(sanitized.coins).forEach(([type, amount]) => {
                const multiplier = 
                    type === 'PP' ? 1000 :
                    type === 'GP' ? 100 :
                    type === 'SP' ? 10 : 1;
                value += (amount || 0) * multiplier;
            });
            sanitized.value = value > 0 ? value : defaultValue;
        } else if (sanitized.gems && sanitized.gems.length) {
            // Calculate from gems
            sanitized.value = sanitized.gems.reduce((sum, gem) => {
                const quantity = gem.quantity || gem.amount || 1;
                const value = gem.value || gem.valueEach || 10;
                return sum + (quantity * value);
            }, 0);
        } else if (sanitized.items && sanitized.items.length) {
            // Calculate from items
            sanitized.value = sanitized.items.reduce((sum, item) => {
                const quantity = item.quantity || 1;
                const value = item.value || 10;
                return sum + (quantity * value);
            }, 0);
        } else if (sanitized.magical && sanitized.magical.length) {
            // Calculate from magical items
            sanitized.value = sanitized.magical.reduce((sum, item) => {
                const value = item.value || 50;
                return sum + value;
            }, 0);
        } else {
            sanitized.value = defaultValue;
        }
    }
    
    // Handle totalValue property
    if (typeof sanitized.totalValue !== 'number') {
        sanitized.totalValue = sanitized.value;
    }
    
    // Ensure we have a textual representation for display
    sanitized.totalValueGP = `${sanitized.value} gp`;
    
    // Handle coin objects
    if (sanitized.coins) {
        Object.entries(sanitized.coins).forEach(([type, amount]) => {
            if (typeof amount !== 'number' || isNaN(amount)) {
                sanitized.coins[type] = 1;
            }
        });
        
        // If coins object is empty, add a default coin
        if (Object.keys(sanitized.coins).length === 0) {
            sanitized.coins.GP = Math.max(1, Math.floor(sanitized.value / 100));
        }
    }
    
    // Ensure arrays are properly defined
    ['gems', 'items', 'valuables', 'magical'].forEach(propName => {
        if (sanitized[propName] && !Array.isArray(sanitized[propName])) {
            sanitized[propName] = [];
        }
    });
    
    // If the treasure is completely empty (no coins, gems, items, etc.), add default coins
    const hasContent = (
        (sanitized.coins && Object.keys(sanitized.coins).length > 0) ||
        (Array.isArray(sanitized.gems) && sanitized.gems.length > 0) ||
        (Array.isArray(sanitized.items) && sanitized.items.length > 0) ||
        (Array.isArray(sanitized.valuables) && sanitized.valuables.length > 0) ||
        (Array.isArray(sanitized.magical) && sanitized.magical.length > 0)
    );
    
    if (!hasContent) {
        sanitized.coins = { GP: Math.max(1, Math.floor(sanitized.value / 100)) };
    }
    
    return sanitized;
}

/**
 * Class for adding traditional treasures and traps to a dungeon
 */
export class TreasureGenerator {
    /**
     * Add traps to a dungeon
     * @param {Object} dungeon - The dungeon object with cells and rooms
     * @param {Object} options - Options for trap generation
     * @param {number} options.trapDensity - Number of traps (0-10)
     * @param {number} options.seed - Seed for random number generation
     * @returns {Array} - Array of trap locations with details
     */
    static addTraps(dungeon, options = {}) {
        const { cells, rooms } = dungeon;
        const trapDensity = options.trapDensity || 3;
        const traps = [];
        
        if (!cells || !rooms || trapDensity <= 0) return traps;
        
        // Create a seeded random generator
        const random = new SeededRandom(options.seed || Math.floor(Math.random() * 10000));
        
        // Calculate number of traps based on trapDensity (0-10)
        const trapCount = Math.floor((trapDensity * rooms.length) / 3);
        
        // Determine eligible positions for traps (corridors and room edges)
        const trapPositions = [];
        
        // Find corridor cells that are good for traps (chokepoints)
        for (let y = 1; y < cells.length - 1; y++) {
            for (let x = 1; x < cells[0].length - 1; x++) {
                const cell = cells[y][x];
                
                // Check if it's a corridor cell
                if (cell.type === 'corridor' || cell.type === 'crypt-corridor') {
                    // Count neighboring corridor/room cells
                    let pathwayNeighbors = 0;
                    if (!cells[y-1][x].blocked) pathwayNeighbors++;
                    if (!cells[y+1][x].blocked) pathwayNeighbors++;
                    if (!cells[y][x-1].blocked) pathwayNeighbors++;
                    if (!cells[y][x+1].blocked) pathwayNeighbors++;
                    
                    // Chokepoints have exactly 2 neighboring pathway cells
                    if (pathwayNeighbors === 2) {
                        trapPositions.push({x, y});
                    }
                }
            }
        }

        // If not enough positions found, add room entrance/exit cells
        if (trapPositions.length < trapCount * 2) {
            // Identify room entrance/exit points
            for (const room of rooms) {
                // Check perimeter cells of the room
                // Top and bottom walls
                for (let x = room.x; x < room.x + room.width; x++) {
                    // Check cell above top wall
                    if (room.y > 1 && !cells[room.y-1][x].blocked) {
                        trapPositions.push({x, y: room.y-1});
                    }
                    // Check cell below bottom wall
                    if (room.y + room.height < cells.length - 1 && !cells[room.y+room.height][x].blocked) {
                        trapPositions.push({x, y: room.y+room.height});
                    }
                }
                
                // Left and right walls
                for (let y = room.y; y < room.y + room.height; y++) {
                    // Check cell to the left of left wall
                    if (room.x > 1 && !cells[y][room.x-1].blocked) {
                        trapPositions.push({x: room.x-1, y});
                    }
                    // Check cell to the right of right wall
                    if (room.x + room.width < cells[0].length - 1 && !cells[y][room.x+room.width].blocked) {
                        trapPositions.push({x: room.x+room.width, y});
                    }
                }
            }
        }
        
        // Shuffle trap positions
        for (let i = trapPositions.length - 1; i > 0; i--) {
            const j = Math.floor(random.next() * (i + 1));
            [trapPositions[i], trapPositions[j]] = [trapPositions[j], trapPositions[i]];
        }
        
        // Place traps up to the calculated amount
        const actualTrapCount = Math.min(trapCount, trapPositions.length);
        for (let i = 0; i < actualTrapCount; i++) {
            const pos = trapPositions[i];
            const trapType = random.select(TRAP_TYPES);
            
            // Add trap to the cell
            cells[pos.y][pos.x].trap = {
                ...trapType,
                discovered: false,
                triggered: false
            };
            
            // Add to traps array
            traps.push({
                row: pos.y,
                col: pos.x,
                type: 'trap',
                trap: trapType
            });
        }
        
        return traps;
    }

    /**
     * Create a themed treasure vault
     * @param {Array} cells - 2D array of cells
     * @param {Object} random - Seeded random generator
     * @param {string} theme - Vault theme ('gold', 'magic', 'weapon', etc.)
     * @returns {Object} Vault details including position and contents
     */
    static createTreasureVault(cells, random, theme = 'gold') {
        const height = cells.length;
        const width = cells[0].length;
        
        // Determine vault size
        const vaultSize = random.nextInt(5, 9);
        
        // Find a suitable location for the vault
        let vaultX, vaultY;
        let attempts = 100;
        let placed = false;
        
        while (attempts > 0 && !placed) {
            vaultX = random.nextInt(3, width - vaultSize - 3);
            vaultY = random.nextInt(3, height - vaultSize - 3);
            
            // Check if area is suitable for vault placement
            let suitable = true;
            for (let y = -1; y <= vaultSize && suitable; y++) {
                for (let x = -1; x <= vaultSize && suitable; x++) {
                    const cellX = vaultX + x;
                    const cellY = vaultY + y;
                    
                    if (cellX < 0 || cellX >= width || cellY < 0 || cellY >= height) {
                        suitable = false;
                        break;
                    }
                    
                    // Don't place vault over special cells
                    if (cells[cellY][cellX].type === 'stairs-up' || 
                        cells[cellY][cellX].type === 'stairs-down' ||
                        cells[cellY][cellX].type === 'tomb' ||
                        cells[cellY][cellX].type === 'altar' ||
                        cells[cellY][cellX].type === 'water' ||
                        cells[cellY][cellX].type === 'lava' ||
                        cells[cellY][cellX].type === 'acid') {
                        suitable = false;
                        break;
                    }
                }
            }
            
            if (suitable) {
                placed = true;
                
                // Create a room pattern for the vault
                const vaultPattern = createRoomPattern(vaultSize, vaultSize, 'rectangular', 'vault');
                
                // Place the vault in the dungeon
                placeRoomPattern(cells, vaultX, vaultY, vaultPattern);
                
                // Add a door to the vault
                const doorSides = ['north', 'east', 'south', 'west'];
                const doorSide = random.select(doorSides);
                let doorX, doorY;
                
                switch (doorSide) {
                    case 'north':
                        doorX = vaultX + Math.floor(vaultSize / 2);
                        doorY = vaultY - 1;
                        break;
                    case 'east':
                        doorX = vaultX + vaultSize;
                        doorY = vaultY + Math.floor(vaultSize / 2);
                        break;
                    case 'south':
                        doorX = vaultX + Math.floor(vaultSize / 2);
                        doorY = vaultY + vaultSize;
                        break;
                    case 'west':
                        doorX = vaultX - 1;
                        doorY = vaultY + Math.floor(vaultSize / 2);
                        break;
                }
                
                // Place the door if it's within bounds
                if (doorX >= 0 && doorX < width && doorY >= 0 && doorY < height) {
                    cells[doorY][doorX] = { 
                        type: 'door', 
                        blocked: false,
                        locked: true
                    };
                }
                
                // Add a corridor leading to the door
                const corridorLength = random.nextInt(2, 5);
                let currentX = doorX;
                let currentY = doorY;
                
                for (let i = 0; i < corridorLength; i++) {
                    switch (doorSide) {
                        case 'north': currentY--; break;
                        case 'east': currentX++; break;
                        case 'south': currentY++; break;
                        case 'west': currentX--; break;
                    }
                    
                    if (currentX >= 0 && currentX < width && currentY >= 0 && currentY < height) {
                        // Only place corridor if not overwriting something important
                        if (cells[currentY][currentX].type !== 'stairs-up' && 
                            cells[currentY][currentX].type !== 'stairs-down' &&
                            cells[currentY][currentX].type !== 'tomb' &&
                            cells[currentY][currentX].type !== 'altar') {
                            cells[currentY][currentX] = { 
                                type: 'corridor', 
                                blocked: false
                            };
                        }
                    }
                }
                
                return {
                    x: vaultX,
                    y: vaultY,
                    width: vaultSize,
                    height: vaultSize,
                    theme,
                    locked: true
                };
            }
            
            attempts--;
        }
        
        return null;
    }
    
    /**
     * Add treasure to a dungeon - Uses map-functions.js for generation
     * @param {Object} dungeon - The dungeon object with cells and rooms
     * @param {Array} entities - Current entities array to add treasures to
     * @param {Object} options - Options for treasure generation
     * @param {number} options.treasureDensity - Treasure density multiplier (0.1-10.0)
     * @param {string} options.dungeonType - Type of dungeon (affects treasure generation)
     * @param {number} options.seed - Seed for random number generation
     * @returns {Array} - Array of treasure entities added
     */
    static addTreasure(dungeon, entities = [], options = {}) {
        const { cells, rooms } = dungeon;
        const treasureDensity = options.treasureDensity || 1.0;
        const dungeonType = options.dungeonType || 'standard';
        const treasures = [];
        
        if (!cells || !rooms || treasureDensity <= 0) return treasures;
        
        // Create a seeded random generator
        const random = new SeededRandom(options.seed || Math.floor(Math.random() * 10000));
        
        // Base number of treasure placements
        const baseTreasureCount = Math.ceil(rooms.length * 0.7);
        
        // Enhanced scaling formula for higher treasure densities
        let treasureCount = Math.max(1, Math.floor(baseTreasureCount * (treasureDensity <= 3.0 ? 
            treasureDensity : // Linear scaling up to 3.0
            3.0 + (treasureDensity - 3.0) * 0.5)) // Reduced scaling above 3.0 to avoid overcrowding
        );
        
        // Also scale up treasure quality/value for higher densities
        const valueBoost = treasureDensity > 3.0 ? 1.0 + (treasureDensity - 3.0) * 0.2 : 1.0;
        
        // Function to check if position is valid
        const isValidPosition = (x, y) => {
            if (cells[y][x].blocked) return false;
            // Check existing entities
            if (entities.some(e => e.row === y && e.col === x)) return false;
            // Check newly added treasures
            if (treasures.some(t => t.row === y && t.col === x)) return false;
            return true;
        };
        
        // For each treasure placement, determine what kind of treasure to place
        for (let i = 0; i < treasureCount; i++) {
            // Use map-functions.js to generate treasure based on dungeon level
            const dungeonLevel = options.dungeonLevel || 1;
            
            // Determine if this should be a hoard (more valuable treasure)
            // Higher chance of hoards with higher treasure density
            const hoardChance = Math.min(0.5, 0.1 + (treasureDensity * 0.05));
            const isHoard = random.next() < hoardChance;
            
            let treasureValue;
            if (isHoard) {
                // Value boost for higher density settings
                const boostedValue = dungeonLevel * 15 * valueBoost;
                treasureValue = generateTreasureHoard(boostedValue, dungeonLevel, random, dungeonType);
            } else {
                // Boost dungeon level for higher density settings to get better treasure
                const effectiveLevel = Math.floor(dungeonLevel * valueBoost);
                treasureValue = generateTreasure(effectiveLevel, random, dungeonType);
            }
            
            // Sanitize treasure object
            treasureValue = treasureSanitizer(treasureValue, dungeonLevel);
            
            // Find a suitable room for the treasure
            if (rooms.length === 0) return treasures;
            
            // Prefer larger rooms for larger treasures
            let room;
            if (treasureValue.value > 500 && rooms.length > 2) {
                // For valuable treasures, find one of the larger rooms
                const sortedRooms = [...rooms].sort((a, b) => 
                    (b.width * b.height) - (a.width * a.height));
                room = sortedRooms[random.nextInt(0, Math.min(3, rooms.length))];
            } else {
                // Otherwise pick any room
                room = random.select(rooms);
            }
            
            // Find a valid position in the room
            let x, y, found = false;
            let attempts = 20;
            
            while (attempts > 0 && !found) {
                x = random.nextInt(room.x + 1, room.x + room.width - 2);
                y = random.nextInt(room.y + 1, room.y + room.height - 2);
                
                // Check if position is empty
                if (isValidPosition(x, y)) {
                    found = true;
                }
                
                attempts--;
            }
            
            if (found) {
                // Add treasure entity
                const treasure = {
                    row: y,
                    col: x,
                    type: 'treasure',
                    treasure: treasureValue,
                    displayName: this.getTreasureDisplayName(treasureValue)
                };
                
                treasures.push(treasure);
                entities.push(treasure);
            }
        }
        
        return treasures;
    }

    /**
     * Generate a treasure hoard appropriate to the dungeon
     * @param {Object} random - Seeded random generator
     * @param {string} dungeonType - Type of dungeon
     * @returns {Object} Generated treasure
     */
    static generateTreasureHoard(random, dungeonType) {
        const hoard = {
            coins: [],
            gems: [],
            valuables: [],
            magical: []
        };
        
        // Determine hoard value by dungeon type
        const baseValue = dungeonType === 'bone-crypt' ? 500 : 300;
        const valueMultiplier = 0.5 + random.next() * 2.0; // 0.5x to 2.5x value
        const totalValue = Math.floor(baseValue * valueMultiplier);
        
        // Assign values to different categories
        const coinRatio = 0.4 + random.next() * 0.2; // 40-60% in coins
        const gemRatio = 0.1 + random.next() * 0.2;  // 10-30% in gems
        const valuableRatio = 0.1 + random.next() * 0.15; // 10-25% in valuables
        const magicalRatio = 1 - coinRatio - gemRatio - valuableRatio; // Remainder in magical items
        
        // Generate coins
        let coinValue = Math.floor(totalValue * coinRatio);
        if (coinValue > 0) {
            // Start with higher value coins
            let remaining = coinValue;
            
            // Add platinum pieces
            if (remaining >= 1000 && random.next() < 0.5) {
                const platinum = Math.floor(remaining / 1000);
                const platToAdd = Math.min(platinum, random.nextInt(1, 10));
                if (platToAdd > 0) {
                    hoard.coins.push({ name: "Platinum Pieces", amount: platToAdd, value: platToAdd * 1000 });
                    remaining -= platToAdd * 1000;
                }
            }
            
            // Add gold pieces
            if (remaining >= 100) {
                const gold = Math.floor(remaining / 100);
                const goldToAdd = Math.min(gold, random.nextInt(1, 50));
                if (goldToAdd > 0) {
                    hoard.coins.push({ name: "Gold Pieces", amount: goldToAdd, value: goldToAdd * 100 });
                    remaining -= goldToAdd * 100;
                }
            }
            
            // Add silver pieces
            if (remaining >= 10) {
                const silver = Math.floor(remaining / 10);
                const silverToAdd = Math.min(silver, random.nextInt(1, 100));
                if (silverToAdd > 0) {
                    hoard.coins.push({ name: "Silver Pieces", amount: silverToAdd, value: silverToAdd * 10 });
                    remaining -= silverToAdd * 10;
                }
            }
            
            // Add copper pieces
            if (remaining > 0) {
                const copperToAdd = Math.min(remaining, random.nextInt(1, 200));
                if (copperToAdd > 0) {
                    hoard.coins.push({ name: "Copper Pieces", amount: copperToAdd, value: copperToAdd });
                }
            }
        }
        
        // Generate gems
        let gemValue = Math.floor(totalValue * gemRatio);
        if (gemValue > 10) {
            const availableGems = [...TREASURE_TYPES.gems].sort((a, b) => random.next() - 0.5);
            
            let remaining = gemValue;
            let attempts = 3; // Limit attempts to prevent infinite loops
            
            while (remaining > 0 && attempts > 0 && availableGems.length > 0) {
                // Pick a random gem type that's affordable
                const affordableGems = availableGems.filter(g => g.value <= remaining);
                
                if (affordableGems.length === 0) {
                    attempts--;
                    continue;
                }
                
                const gem = random.select(affordableGems);
                const maxAmount = Math.floor(remaining / gem.value);
                const amount = Math.max(1, random.nextInt(1, Math.min(5, maxAmount)));
                
                hoard.gems.push({
                    name: gem.name,
                    amount,
                    valueEach: gem.value,
                    value: amount * gem.value
                });
                
                remaining -= amount * gem.value;
                attempts--;
            }
        }
        
        // Generate valuable items
        let valuableValue = Math.floor(totalValue * valuableRatio);
        if (valuableValue > 20) {
            const availableValuables = [...TREASURE_TYPES.valuables]
                .filter(v => v.value <= valuableValue)
                .sort((a, b) => random.next() - 0.5);
            
            if (availableValuables.length > 0) {
                const valuable = random.select(availableValuables);
                hoard.valuables.push({
                    name: valuable.name,
                    amount: 1,
                    value: valuable.value
                });
                
                valuableValue -= valuable.value;
                
                // Possibly add a second valuable if there's value remaining
                if (valuableValue > 20) {
                    const remainingValuables = availableValuables.filter(v => v.value <= valuableValue);
                    if (remainingValuables.length > 0) {
                        const secondValuable = random.select(remainingValuables);
                        hoard.valuables.push({
                            name: secondValuable.name,
                            amount: 1,
                            value: secondValuable.value
                        });
                    }
                }
            }
        }
        
        // Generate magical items - lower chance but possible
        let magicalValue = Math.floor(totalValue * magicalRatio);
        if (magicalValue > 50 && random.next() < 0.3) { // 30% chance for magical items
            const availableMagical = TREASURE_TYPES.magical
                .filter(m => m.value <= magicalValue)
                .sort((a, b) => random.next() - 0.5);
            
            if (availableMagical.length > 0) {
                const magical = random.select(availableMagical);
                hoard.magical.push({
                    name: magical.name,
                    amount: 1,
                    value: magical.value
                });
            }
        }
        
        // Calculate total actual value of the hoard
        const actualValue = [
            ...hoard.coins.map(c => c.value),
            ...hoard.gems.map(g => g.value),
            ...hoard.valuables.map(v => v.value),
            ...hoard.magical.map(m => m.value)
        ].reduce((sum, val) => sum + val, 0);
        
        return {
            ...hoard,
            totalValue: actualValue
        };
    }

    /**
     * Get a display name for a treasure hoard
     * @param {Object} treasure - Treasure hoard data
     * @returns {string} Display name
     */
    static getTreasureDisplayName(treasure) {
        const value = treasure.totalValue || treasure.value || 0;
        
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
}

/**
 * A seeded random number generator for deterministic results
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
