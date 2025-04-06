import { DungeonThemes } from './dungeon-themes.js';

export class ControlPanel {
    static init() {
        this.setupRoomSlider();
        this.setupThemeSelector();
    }

    static setupRoomSlider() {
        const slider = document.getElementById('roomCountSlider');
        const output = slider.nextElementSibling;

        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            output.value = value;
            window.dungeonOptions = window.dungeonOptions || {};
            window.dungeonOptions.roomCount = parseInt(value);
        });

        // Initialize with default value
        output.value = slider.value;
        window.dungeonOptions = { roomCount: parseInt(slider.value) };
    }

    static setupThemeSelector() {
        const container = document.querySelector('.dungeon-controls');
        const themeSelect = document.createElement('select');
        themeSelect.id = 'dungeonTheme';
        
        // Add theme options
        Object.entries(DungeonThemes).forEach(([id, theme]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = theme.name;
            themeSelect.appendChild(option);
        });

        const wrapper = document.createElement('div');
        wrapper.className = 'control-group';
        wrapper.innerHTML = `
            <label for="dungeonTheme">Theme:</label>
        `;
        wrapper.appendChild(themeSelect);
        container.appendChild(wrapper);

        // Theme change handler
        themeSelect.addEventListener('change', (e) => {
            window.dungeonOptions = window.dungeonOptions || {};
            window.dungeonOptions.theme = e.target.value;
        });

        // Initialize with default theme
        window.dungeonOptions = window.dungeonOptions || {};
        window.dungeonOptions.theme = 'standard';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => ControlPanel.init());
