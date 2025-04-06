export const DungeonThemes = {
    standard: {
        name: 'Standard Dungeon',
        roomType: 'room',
        corridorType: 'corridor',
        colors: {
            room: '#e8e8e8',
            corridor: '#d0d0d0',
            wall: '#555555'
        }
    },
    boneyard: {
        name: 'Boneyard Ossuary',
        roomType: 'crypt',
        corridorType: 'crypt-corridor',
        colors: {
            room: '#d8d0c8',
            corridor: '#c0b8b0',
            wall: '#8a7b6c',
            altar: '#a3927d',
            tomb: '#8a7b6c'
        },
        features: ['tombs', 'bones', 'altars']
    },
    darkzone: {
        name: 'Dark Dimension',
        roomType: 'dark-room',
        corridorType: 'dark-corridor',
        colors: {
            room: '#3a3a5e',
            corridor: '#282840',
            wall: '#1a1a2e',
            void: '#1a1a2e',
            portal: '#5a3696'
        },
        features: ['void', 'portals']
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