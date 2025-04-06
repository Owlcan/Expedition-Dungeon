export const DungeonThemes = {
    standard: {
        walls: '#555555',
        floor: '#e8e8e8',
        corridor: '#d0d0d0',
        door: '#8B4513',
        patterns: ['rectangular', 'cross'],
        features: ['columns', 'torches']
    },
    cave: {
        walls: '#4a3b22',
        floor: '#695438',
        corridor: '#5c4831',
        features: ['stalagmites', 'pools'],
        patterns: ['organic', 'circular'],
        generation: 'cellular'
    },
    crypt: {
        walls: '#686868',
        floor: '#8a7b6c',
        corridor: '#776b5e',
        door: '#4a3b22',
        patterns: ['symmetric', 'rectangular'],
        features: ['tombs', 'crypts', 'bones']
    },
    temple: {
        walls: '#a89b8c',
        floor: '#c4b5a2',
        corridor: '#b5a795',
        door: '#8b7355',
        patterns: ['symmetric', 'circular'],
        features: ['altars', 'statues', 'pools']
    },
    mine: {
        walls: '#595959',
        floor: '#776d63',
        corridor: '#6b6359',
        patterns: ['organic', 'grid'],
        features: ['supports', 'carts', 'ore']
    },
    castle: {
        walls: '#6b6b6b',
        floor: '#8c8c8c',
        corridor: '#7a7a7a',
        door: '#5c4d3b',
        patterns: ['rectangular', 'symmetric'],
        features: ['arrow_slits', 'fireplaces']
    }
};

export const CavernPatterns = {
    organic: (width, height, random) => {
        // Cellular automata with irregular edges
        return generateCellularPattern(width, height, random);
    },
    circular: (width, height, random) => {
        // Connected cave chambers
        return generateCircularCaverns(width, height, random);
    },
    winding: (width, height, random) => {
        // Winding passages
        return generateWindingCaverns(width, height, random);
    }
};

function generateCellularPattern(width, height, random) {
    // Implementation for cellular automata cave generation
    return Array(height).fill().map(() => 
        Array(width).fill().map(() => {
            const r = random ? random.next() : Math.random();
            return r < 0.45 ? 
                { type: 'wall', blocked: true } : 
                { type: 'corridor', blocked: false };
        })
    );
}

function generateCircularCaverns(width, height, random) {
    // Implementation for circular cave chambers
    const cells = Array(height).fill().map(() => 
        Array(width).fill().map(() => ({ type: 'wall', blocked: true }))
    );

    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const radius = Math.min(centerX, centerY) - 1;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= radius) {
                cells[y][x] = { type: 'corridor', blocked: false };
            }
        }
    }

    return cells;
}

function generateWindingCaverns(width, height, random) {
    // Implementation for winding passages
    const cells = Array(height).fill().map(() => 
        Array(width).fill().map(() => ({ type: 'wall', blocked: true }))
    );

    let x = Math.floor(width / 2);
    let y = Math.floor(height / 2);

    for (let i = 0; i < width * height * 0.2; i++) {
        cells[y][x] = { type: 'corridor', blocked: false };

        const direction = Math.floor(random ? random.next() * 4 : Math.random() * 4);
        switch (direction) {
            case 0: y = Math.max(1, y - 1); break;
            case 1: x = Math.min(width - 2, x + 1); break;
            case 2: y = Math.min(height - 2, y + 1); break;
            case 3: x = Math.max(1, x - 1); break;
        }
    }

    return cells;
}