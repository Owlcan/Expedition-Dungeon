/**
 * MonsterQuickSpawn.js - Handles quick spawning of monsters with better token control
 */

// Make sure we can always initialize this module
const INITIALIZATION_RETRIES = 10;
let initializationAttempts = 0;

// Ensure we have global placeholder for current dungeon
window.currentDungeon = window.currentDungeon || null;

// Main initialization function
export function initializeQuickSpawnMonsters(
    currentDungeon,
    renderDungeon,
    renderEntities,
    setupDragAndDrop,
    addMonsterGroupToList,
    monsterXInput,
    monsterYInput,
    filterMonstersByKeywords,
    CATEGORIZED_MONSTERS
) {
    // Store references in case they're needed later
    const refs = {
        currentDungeon: currentDungeon || window.currentDungeon,
        renderDungeon: renderDungeon || window.renderDungeon,
        renderEntities: renderEntities || window.renderEntities,
        setupDragAndDrop: setupDragAndDrop || window.setupDragAndDrop,
        addMonsterGroupToList: addMonsterGroupToList || window.addMonsterGroupToList,
        monsterXInput: monsterXInput || document.getElementById('monsterX'),
        monsterYInput: monsterYInput || document.getElementById('monsterY'),
        filterMonstersByKeywords: filterMonstersByKeywords || window.filterMonstersByKeywords,
        CATEGORIZED_MONSTERS: CATEGORIZED_MONSTERS || window.CATEGORIZED_MONSTERS
    };

    // If monster data isn't loaded yet, retry
    if (!refs.CATEGORIZED_MONSTERS) {
        console.warn(`Monster data not loaded yet (attempt ${initializationAttempts + 1}/${INITIALIZATION_RETRIES})`);
        if (initializationAttempts++ < INITIALIZATION_RETRIES) {
            setTimeout(() => {
                initializeQuickSpawnMonsters(
                    window.currentDungeon,
                    window.renderDungeon,
                    window.renderEntities,
                    window.setupDragAndDrop,
                    window.addMonsterGroupToList,
                    document.getElementById('monsterX'),
                    document.getElementById('monsterY'),
                    window.filterMonstersByKeywords,
                    window.CATEGORIZED_MONSTERS
                );
            }, 500);
        }
        return;
    }

    console.log('MonsterQuickSpawn: Monster data loaded successfully');

    // Get UI elements
    const quickSpawnCategory = document.getElementById('quickSpawnCategory');
    const monsterSearch = document.getElementById('monsterSearch');
    const quickSpawnContainer = document.getElementById('quickSpawnContainer');
    const quickSpawnList = document.getElementById('quickSpawnMonsterList');
    
    if (!quickSpawnCategory || !monsterSearch || !quickSpawnContainer || !quickSpawnList) {
        console.error('Required UI elements not found, retrying...');
        if (initializationAttempts++ < INITIALIZATION_RETRIES) {
            setTimeout(() => initializeQuickSpawnMonsters(...Object.values(refs)), 500);
        }
        return;
    }
    
    // Setup event listeners for filtering
    quickSpawnCategory.addEventListener('change', updateMonsterList);
    monsterSearch.addEventListener('input', updateMonsterList);
    
    // Populate spawn categories
    populateCategories(quickSpawnCategory);
    
    // Populate initial monster list
    updateMonsterList();
    
    // Set global reference for the rest of the application
    window.quickSpawn = {
        updateMonsterList,
        spawnMonster
    };
    
    console.log('MonsterQuickSpawn: System initialized successfully');
    
    // Main function to update the monster list based on filters
    function updateMonsterList() {
        // Clear existing list
        quickSpawnList.innerHTML = '';
        
        // Get filters
        const category = quickSpawnCategory.value;
        const searchTerm = monsterSearch.value.toLowerCase().trim();
        
        // Get filtered monsters
        const monsters = getFilteredMonsters(category, searchTerm);
        
        // If no monsters found
        if (!monsters || monsters.length === 0) {
            quickSpawnList.innerHTML = '<div class="monster-item">No monsters found matching your criteria</div>';
            return;
        }
        
        // Limit to 20 for performance
        const displayMonsters = monsters.slice(0, 20);
        
        // Create monster cards
        displayMonsters.forEach(monster => {
            const monsterCard = createMonsterCard(monster);
            quickSpawnList.appendChild(monsterCard);
        });
        
        // Show count if there are more
        if (monsters.length > 20) {
            const moreInfo = document.createElement('div');
            moreInfo.className = 'monster-item more-monsters';
            moreInfo.textContent = `Showing 20 of ${monsters.length} monsters. Refine your search to see more.`;
            quickSpawnList.appendChild(moreInfo);
        }
    }
    
    // Helper to get filtered monsters based on category and search
    function getFilteredMonsters(category, searchTerm) {
        let monsters = [];
        
        // Get monsters based on category
        switch(category) {
            case 'tiny':
                monsters = refs.CATEGORIZED_MONSTERS.tiny || [];
                break;
            case 'small':
                monsters = refs.CATEGORIZED_MONSTERS.small || [];
                break;
            case 'medium':
                monsters = refs.CATEGORIZED_MONSTERS.medium || [];
                break;
            case 'large':
                monsters = refs.CATEGORIZED_MONSTERS.large || [];
                break;
            case 'huge':
                monsters = refs.CATEGORIZED_MONSTERS.huge || [];
                break;
            case 'dark':
                monsters = refs.filterMonstersByKeywords(['dark', 'shadow', 'void', 'dimension', 'nightmare']);
                break;
            case 'bone':
                monsters = refs.filterMonstersByKeywords(['bone', 'skeleton', 'crypt', 'ossuary', 'undead']);
                break;
            case 'all':
            default:
                monsters = [
                    ...(refs.CATEGORIZED_MONSTERS.tiny || []),
                    ...(refs.CATEGORIZED_MONSTERS.small || []),
                    ...(refs.CATEGORIZED_MONSTERS.medium || []),
                    ...(refs.CATEGORIZED_MONSTERS.large || []),
                    ...(refs.CATEGORIZED_MONSTERS.huge || [])
                ];
                break;
        }
        
        // Apply search filter if needed
        if (searchTerm) {
            monsters = monsters.filter(monster => 
                monster.name && monster.name.toLowerCase().includes(searchTerm)
            );
        }
        
        // Sort alphabetically
        monsters.sort((a, b) => {
            const nameA = a.name || 'Unknown Monster';
            const nameB = b.name || 'Unknown Monster';
            return nameA.localeCompare(nameB);
        });
        
        return monsters;
    }
    
    // Create individual monster card
    function createMonsterCard(monster) {
        const card = document.createElement('div');
        card.className = 'monster-item';
        
        // Create challenge rating text if available
        let crText = '';
        if (monster.stats && monster.stats.challengeRating) {
            crText = `CR ${monster.stats.challengeRating}`;
        }
        
        // Create size text if available
        let sizeText = '';
        if (monster.size && Array.isArray(monster.size)) {
            sizeText = monster.size[0];
        }
        
        card.innerHTML = `
            <div class="monster-card-info">
                <div class="monster-card-name">${monster.name || 'Unknown Monster'}</div>
                <div class="monster-card-details">
                    ${sizeText} ${monster.type || ''}
                    ${crText ? `• ${crText}` : ''}
                </div>
            </div>
            <button class="add-monster-btn" title="Click to spawn this monster">Spawn</button>
        `;
        
        // Add click handler for spawn button
        const addButton = card.querySelector('.add-monster-btn');
        addButton.addEventListener('click', () => spawnMonster(monster));
        
        return card;
    }
    
    // Function to populate the category dropdown
    function populateCategories(selectElement) {
        const categories = [
            { value: 'all', text: 'All Monsters' },
            { value: 'tiny', text: 'Tiny Monsters' },
            { value: 'small', text: 'Small Monsters' },
            { value: 'medium', text: 'Medium Monsters' },
            { value: 'large', text: 'Large Monsters' },
            { value: 'huge', text: 'Huge Monsters' },
            { value: 'dark', text: 'Dark Creatures' },
            { value: 'bone', text: 'Bone Creatures' }
        ];
        
        selectElement.innerHTML = '';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.value;
            option.textContent = category.text;
            selectElement.appendChild(option);
        });
    }
    
    // Function to spawn a monster
    function spawnMonster(monster) {
        console.log('Attempting to spawn monster:', monster.name);
        
        // Force dungeon creation if it doesn't exist
        if (!window.currentDungeon) {
            console.warn('No dungeon found - creating one now');
            
            // Try to use the global generator first
            if (typeof window.generateDungeon === 'function') {
                try {
                    console.log('Using global generateDungeon');
                    window.generateDungeon();
                    // Give it time to render
                    setTimeout(() => spawnMonster(monster), 100);
                    return true;
                } catch (e) {
                    console.error("Failed to generate dungeon:", e);
                }
            }
            
            // If that fails, create our own placeholder
            if (!window.currentDungeon) {
                const defaultDungeon = generatePlaceholderDungeon();
                window.currentDungeon = defaultDungeon;
                console.log('Created placeholder dungeon');
                
                // Render the placeholder
                if (typeof window.renderDungeon === 'function') {
                    window.renderDungeon(defaultDungeon);
                }
            }
        }
        
        // Use a robust way to get the input values
        const xInput = refs.monsterXInput || document.getElementById('monsterX');
        const yInput = refs.monsterYInput || document.getElementById('monsterY');
        
        const x = parseInt(xInput?.value);
        const y = parseInt(yInput?.value);
        
        console.log(`Monster spawn coordinates: ${x}, ${y}`);
        
        // If coordinates aren't specified, prompt the user
        if (isNaN(x) || isNaN(y) || x < 0 || y < 0 || !isValidCoordinate(x, y, window.currentDungeon)) {
            console.log('Invalid coordinates, prompting user for placement');
            alert('Please click on the map to place the monster');
            highlightCellsForMonsterPlacement();
            
            // Store the monster for delayed placement
            window._pendingMonster = monster;
            
            // Set up one-time click handler for placement
            const dungeonMap = document.getElementById('dungeonMap');
            if (dungeonMap) {
                const clickHandler = function(e) {
                    // Get the cell that was clicked
                    const cell = e.target.closest('td:not(.cell-wall):not(.grid-label)');
                    if (!cell) {
                        console.log('Invalid cell clicked');
                        return; // Click wasn't on a valid cell
                    }
                    
                    // Get the cell coordinates
                    const row = parseInt(cell.dataset.row);
                    const col = parseInt(cell.dataset.col);
                    
                    console.log(`Cell clicked: ${col}, ${row}`);
                    
                    if (!isNaN(row) && !isNaN(col)) {
                        // Update input fields if they exist
                        if (xInput) xInput.value = col;
                        if (yInput) yInput.value = row;
                        
                        // Place the monster
                        console.log('Placing monster at', col, row);
                        const success = placeMonster(window._pendingMonster, col, row);
                        
                        if (success) {
                            console.log('Monster placed successfully');
                            window._pendingMonster = null;
                            removeHighlight();
                        } else {
                            console.error('Failed to place monster');
                            alert('Failed to place monster. Please try a different location.');
                        }
                    }
                    
                    // Always cleanup even if placement failed
                    dungeonMap.removeEventListener('click', clickHandler);
                };
                
                // Clean up any existing handlers first
                dungeonMap.removeEventListener('click', window._lastClickHandler);
                window._lastClickHandler = clickHandler;
                
                // Add the new handler
                dungeonMap.addEventListener('click', clickHandler);
            } else {
                console.error('Dungeon map element not found');
                alert('Please enter X,Y coordinates manually');
            }
            
            return false;
        }
        
        // Otherwise place the monster directly
        return placeMonster(monster, x, y);
    }
    
    // Check if coordinates are valid for the given dungeon
    function isValidCoordinate(x, y, dungeon) {
        if (!dungeon) return false;
        if (!dungeon.cells) return false;
        if (y < 0 || y >= dungeon.cells.length) return false;
        if (x < 0 || x >= (dungeon.cells[0]?.length || 0)) return false;
        return true;
    }
    
    // Generate a minimal placeholder dungeon if none exists
    function generatePlaceholderDungeon() {
        const width = 20;
        const height = 20;
        
        // Create cells
        const cells = Array(height).fill().map(() => 
            Array(width).fill().map(() => ({ 
                type: 'wall', 
                blocked: true 
            }))
        );
        
        // Create an open room in the center
        for (let y = 8; y < 12; y++) {
            for (let x = 8; x < 12; x++) {
                cells[y][x] = { type: 'room', blocked: false };
            }
        }
        
        return {
            width,
            height,
            cells,
            entities: [],
            theme: 'standard',
            isPlaceholder: true
        };
    }
    
    // Helper function to place a monster at coordinates
    function placeMonster(monster, x, y) {
        // Ensure we have a valid dungeon
        const dungeon = window.currentDungeon;
        if (!dungeon) {
            console.error('No dungeon available for monster placement');
            return false;
        }
        
        // Additional safety checks
        try {
            if (!isValidCoordinate(x, y, dungeon)) {
                console.error(`Invalid coordinates: ${x}, ${y}`);
                return false;
            }
            
            // Check if the cell isn't blocked
            if (dungeon.cells[y][x].blocked) {
                console.error(`Cell at ${x},${y} is blocked`);
                return false;
            }
            
            // Generate a unique ID for this monster
            const monsterId = `monster_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            
            // Create monster entity
            const monsterEntity = {
                row: y,
                col: x,
                type: 'monster',
                monster: { ...monster },
                custom: true,
                id: monsterId
            };
            
            // Ensure entities array exists
            dungeon.entities = dungeon.entities || [];
            
            // Add to dungeon entities
            dungeon.entities.push(monsterEntity);
            console.log(`Added monster ${monster.name} at ${x},${y}`);
            
            // Try all possible ways to re-render
            const renderFunctions = [
                // Direct references
                refs.renderDungeon,
                refs.renderEntities,
                refs.setupDragAndDrop,
                
                // Global functions
                window.renderDungeon,
                window.renderEntities,
                window.setupDragAndDrop
            ];
            
            // Call each function safely
            renderFunctions.forEach(fn => {
                if (typeof fn === 'function') {
                    try {
                        fn(dungeon);
                    } catch (e) {
                        console.warn('Error in render function:', e);
                    }
                }
            });
            
            // Add to custom monster list if function exists
            const addToListFunctions = [
                refs.addMonsterGroupToList,
                window.addMonsterGroupToList,
                window.addCustomMonsterToList
            ];
            
            // Try each list function
            for (const fn of addToListFunctions) {
                if (typeof fn === 'function') {
                    try {
                        fn(monsterEntity);
                        break; // Stop after first success
                    } catch (e) {
                        console.warn('Error adding monster to list:', e);
                    }
                }
            }
            
            // Clear inputs
            if (refs.monsterXInput) refs.monsterXInput.value = '';
            if (refs.monsterYInput) refs.monsterYInput.value = '';
            
            // Also try by direct element ID
            try {
                const xInput = document.getElementById('monsterX');
                const yInput = document.getElementById('monsterY');
                if (xInput) xInput.value = '';
                if (yInput) yInput.value = '';
            } catch (e) {
                console.warn('Error clearing input fields:', e);
            }
            
            return true;
        } catch (error) {
            console.error('Error adding monster:', error);
            return false;
        }
    }
    
    // Helper to highlight valid placement cells
    function highlightCellsForMonsterPlacement() {
        try {
            // Select all valid cells
            const cells = document.querySelectorAll('td.cell-room, td.cell-corridor, td.cell-crypt, td.cell-dark-room, td.cell-dark-corridor, td.cell-crypt-corridor');
            cells.forEach(cell => cell.classList.add('highlight-placement'));
            
            // Add an animated border to the dungeon map to draw attention
            const dungeonMap = document.getElementById('dungeonMap');
            if (dungeonMap) {
                dungeonMap.classList.add('awaiting-placement');
            }
            
            // Automatically remove highlight after 5 seconds if not placed
            setTimeout(removeHighlight, 5000);
        } catch (e) {
            console.warn('Error highlighting cells:', e);
        }
    }
    
    // Helper to remove highlight from cells
    function removeHighlight() {
        try {
            const cells = document.querySelectorAll('.highlight-placement');
            cells.forEach(cell => cell.classList.remove('highlight-placement'));
            
            const dungeonMap = document.getElementById('dungeonMap');
            if (dungeonMap) {
                dungeonMap.classList.remove('awaiting-placement');
            }
        } catch (e) {
            console.warn('Error removing highlight:', e);
        }
    }
    
    // Return public API for this module
    return {
        updateMonsterList,
        spawnMonster,
        isInitialized: true
    };
}

// Global safe initialization
function safeInitialize() {
    try {
        console.log('Monster Quick Spawn initializing...');
        
        if (!window.CATEGORIZED_MONSTERS) {
            console.log('Monster data not available yet, waiting...');
            setTimeout(safeInitialize, 1000);
            return;
        }
        
        const controller = initializeQuickSpawnMonsters(
            window.currentDungeon,
            window.renderDungeon,
            window.renderEntities, 
            window.setupDragAndDrop,
            window.addMonsterGroupToList,
            document.getElementById('monsterX'),
            document.getElementById('monsterY'),
            window.filterMonstersByKeywords,
            window.CATEGORIZED_MONSTERS
        );
        
        if (controller && controller.isInitialized) {
            console.log('Monster Quick Spawn initialized successfully');
        } else {
            console.log('Monster Quick Spawn initialization incomplete, will retry');
            setTimeout(safeInitialize, 1000);
        }
    } catch (e) {
        console.error('Error initializing Monster Quick Spawn:', e);
        setTimeout(safeInitialize, 2000); // Retry with increased delay
    }
}

// Make style additions
function addMissingStyles() {
    const styleId = 'quickSpawnStyles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .highlight-placement {
                animation: pulse-placement 1s infinite alternate;
                cursor: pointer !important;
                position: relative;
                z-index: 100;
            }
            
            @keyframes pulse-placement {
                0% { background-color: rgba(100, 255, 100, 0.3); }
                100% { background-color: rgba(100, 255, 100, 0.7); }
            }
            
            .awaiting-placement {
                animation: border-pulse 1s infinite alternate;
            }
            
            @keyframes border-pulse {
                0% { box-shadow: 0 0 0 2px rgba(100, 255, 100, 0.3); }
                100% { box-shadow: 0 0 0 5px rgba(100, 255, 100, 0.7); }
            }
        `;
        document.head.appendChild(style);
        console.log('Added Monster Quick Spawn styles');
    }
}

// Initialize when DOM is ready or immediately if already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        addMissingStyles();
        safeInitialize();
    });
} else {
    addMissingStyles();
    safeInitialize();
}

// Also try after window load (in case scripts load in different order)
window.addEventListener('load', () => {
    addMissingStyles();
    if (!window.quickSpawn?.isInitialized) {
        safeInitialize();
    }
});

