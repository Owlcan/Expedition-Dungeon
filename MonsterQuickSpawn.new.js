// Monster Quick Spawn functionality
export function initializeQuickSpawnMonsters(currentDungeon, renderDungeon, renderEntities, setupDragAndDrop, 
                                           addMonsterGroupToList, monsterXInput, monsterYInput, filterMonstersByKeywords, CATEGORIZED_MONSTERS) {
    // Check if the quick spawn container already exists
    let quickSpawnContainer = document.getElementById('quickSpawnContainer');
    
    if (!quickSpawnContainer) {
        console.error('Quick spawn container not found!');
        return;
    }
    
    // Define monster groups for quick spawning
    const monsterGroups = [
        { name: "Patrol", types: ["dark"], size: 3, icon: "👁️" },
        { name: "Guardians", types: ["bone"], size: 2, icon: "💀" },
        { name: "Ambush", types: ["small", "medium"], size: 4, icon: "🗡️" },
        { name: "Boss & Minions", types: ["huge", "tiny"], size: 5, icon: "👑" }
    ];
    
    // Create quick spawn buttons
    monsterGroups.forEach(group => {
        const button = document.createElement('button');
        button.className = 'quick-spawn-button';
        button.innerHTML = `${group.icon} ${group.name}`;
        button.title = `Add ${group.size} ${group.types.join('/')} monsters near a selected point`;
        
        button.addEventListener('click', () => {
            if (!currentDungeon) {
                alert('Please generate a dungeon first');
                return;
            }
            
            // Get coordinate from inputs or use center of map
            let x = parseInt(monsterXInput.value);
            let y = parseInt(monsterYInput.value);
            
            // If coordinates aren't provided, use center of dungeon
            if (isNaN(x) || isNaN(y)) {
                x = Math.floor(currentDungeon.width / 2);
                y = Math.floor(currentDungeon.height / 2);
            }
            
            // Quick spawn the monster group
            spawnMonsterGroup(
                x, y, group.types, group.size, group.name, 
                currentDungeon, renderDungeon, renderEntities, 
                setupDragAndDrop, addMonsterGroupToList, filterMonstersByKeywords, CATEGORIZED_MONSTERS
            );
        });
        
        quickSpawnContainer.appendChild(button);
    });
    
    console.log('Quick spawn buttons initialized');
}

// Helper function to spawn a group of monsters
function spawnMonsterGroup(centerX, centerY, monsterTypes, groupSize, groupName, 
                          currentDungeon, renderDungeon, renderEntities, 
                          setupDragAndDrop, addMonsterGroupToList, filterMonstersByKeywords, CATEGORIZED_MONSTERS) {
    if (!currentDungeon) return;
    
    // Filter monsters by the requested types
    let availableMonsters = [];
    
    // Handle special categories and standard size categories
    monsterTypes.forEach(type => {
        switch(type) {
            case 'dark':
                availableMonsters = availableMonsters.concat(
                    filterMonstersByKeywords(['dark', 'shadow', 'void', 'dimension', 'nightmare'])
                );
                break;
            case 'bone':
                availableMonsters = availableMonsters.concat(
                    filterMonstersByKeywords(['bone', 'skeleton', 'crypt', 'ossuary', 'undead', 'ossokin'])
                );
                break;
            case 'tiny':
                availableMonsters = availableMonsters.concat(CATEGORIZED_MONSTERS.tiny || []);
                break;
            case 'small':
                availableMonsters = availableMonsters.concat(CATEGORIZED_MONSTERS.small || []);
                break;
            case 'medium':
                availableMonsters = availableMonsters.concat(CATEGORIZED_MONSTERS.medium || []);
                break;
            case 'large':
                availableMonsters = availableMonsters.concat(CATEGORIZED_MONSTERS.large || []);
                break;
            case 'huge':
                availableMonsters = availableMonsters.concat(CATEGORIZED_MONSTERS.huge || []);
                break;
        }
    });
    
    if (availableMonsters.length === 0) {
        alert('No monsters available for this group type');
        return;
    }
    
    // Create a seeded random number generator
    const seededRandom = new SeededRandom(Math.floor(Math.random() * 10000));
    const addedMonsters = [];
    
    // Place the first monster at the specified coordinates
    let firstMonsterPlaced = false;
    
    // Try to place first monster at specific coordinates
    if (!currentDungeon.cells[centerY][centerX].blocked) {
        const firstMonster = seededRandom.select(availableMonsters);
        addedMonsters.push({
            row: centerY,
            col: centerX,
            type: 'monster',
            monster: firstMonster,
            custom: true,
            group: groupName
        });
        firstMonsterPlaced = true;
    }
    
    // If we couldn't place the first monster at the exact coordinates, try nearby
    if (!firstMonsterPlaced) {
        // Try in a 3x3 area around the specified point
        for (let offsetY = -1; offsetY <= 1 && !firstMonsterPlaced; offsetY++) {
            for (let offsetX = -1; offsetX <= 1 && !firstMonsterPlaced; offsetX++) {
                const newY = centerY + offsetY;
                const newX = centerX + offsetX;
                
                // Check if position is valid
                if (newX >= 0 && newX < currentDungeon.width && 
                    newY >= 0 && newY < currentDungeon.height &&
                    !currentDungeon.cells[newY][newX].blocked) {
                    
                    const firstMonster = seededRandom.select(availableMonsters);
                    addedMonsters.push({
                        row: newY,
                        col: newX,
                        type: 'monster',
                        monster: firstMonster,
                        custom: true,
                        group: groupName
                    });
                    
                    // Update the center coordinates
                    centerX = newX;
                    centerY = newY;
                    firstMonsterPlaced = true;
                }
            }
        }
    }
    
    // If we still couldn't place the first monster, give up
    if (!firstMonsterPlaced) {
        alert('Cannot place the monster group at the specified location');
        return;
    }
    
    // Place additional monsters nearby
    for (let i = 1; i < groupSize; i++) {
        // Try to find a free adjacent cell
        const directions = [
            { dy: -1, dx: 0 }, // up
            { dy: 1, dx: 0 },  // down
            { dy: 0, dx: -1 }, // left
            { dy: 0, dx: 1 },  // right
            { dy: -1, dx: -1 }, // up-left
            { dy: -1, dx: 1 }, // up-right
            { dy: 1, dx: -1 }, // down-left
            { dy: 1, dx: 1 }   // down-right
        ];
        
        // Randomize direction order
        for (let j = directions.length - 1; j > 0; j--) {
            const k = Math.floor(seededRandom.next() * (j + 1));
            [directions[j], directions[k]] = [directions[k], directions[j]];
        }
        
        // Try each direction with increasing distance
        let placed = false;
        let maxDistance = 3; // Try up to 3 cells away
        
        for (let distance = 1; distance <= maxDistance && !placed; distance++) {
            for (const dir of directions) {
                const newY = centerY + (dir.dy * distance);
                const newX = centerX + (dir.dx * distance);
                
                // Check if position is valid
                if (newX >= 0 && newX < currentDungeon.width && 
                    newY >= 0 && newY < currentDungeon.height &&
                    !currentDungeon.cells[newY][newX].blocked) {
                    
                    // Check if there's already a monster here
                    const hasMonster = currentDungeon.entities.some(e => 
                        e.type === 'monster' && e.row === newY && e.col === newX
                    );
                    
                    if (!hasMonster) {
                        // Select appropriate monster based on position in group
                        let monster;
                        
                        // For boss & minions, first monster is boss, rest are minions
                        if (groupName === "Boss & Minions" && i > 0) {
                            // Minions should be smaller monsters
                            const tinySmallMonsters = [
                                ...(CATEGORIZED_MONSTERS.tiny || []),
                                ...(CATEGORIZED_MONSTERS.small || [])
                            ];
                            monster = seededRandom.select(tinySmallMonsters);
                        } else {
                            monster = seededRandom.select(availableMonsters);
                        }
                        
                        addedMonsters.push({
                            row: newY,
                            col: newX,
                            type: 'monster',
                            monster: monster,
                            custom: true,
                            group: groupName
                        });
                        
                        placed = true;
                        break;
                    }
                }
            }
        }
        
        // If we couldn't place a monster, continue to the next one
        if (!placed) continue;
    }
    
    // Add monsters to the dungeon
    currentDungeon.entities.push(...addedMonsters);
    
    // Add group to the monster groups list
    addMonsterGroupToList(groupName, addedMonsters.length);
    
    // Re-render the dungeon
    renderDungeon(currentDungeon);
    renderEntities(currentDungeon);
    setupDragAndDrop();
    
    console.log(`Added ${addedMonsters.length} monsters for ${groupName} group`);
}

// Simple seeded random number generator
class SeededRandom {
    constructor(seed) {
        this.seed = seed || Math.floor(Math.random() * 999999);
    }
    
    next() {
        // Simple LCG algorithm
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
    
    select(array) {
        if (!array || array.length === 0) return null;
        const index = Math.floor(this.next() * array.length);
        return array[index];
    }
}

