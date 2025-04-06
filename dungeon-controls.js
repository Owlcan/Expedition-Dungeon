export class DungeonControls {
    static init() {
        this.addRoomSlider();
        this.addThemeSelector();
    }

    static addRoomSlider() {
        const controls = document.querySelector('.dungeon-controls');
        const sliderHtml = `
            <div class="control-group">
                <label for="roomCount">Room Count:</label>
                <div class="room-count-slider">
                    <input type="range" id="roomCount" min="5" max="30" value="15">
                    <output for="roomCount">15</output>
                </div>
            </div>
        `;
        controls.insertAdjacentHTML('beforeend', sliderHtml);

        const slider = document.getElementById('roomCount');
        const output = slider.nextElementSibling;
        slider.addEventListener('input', () => {
            output.value = slider.value;
            window.dungeonOptions.roomCount = parseInt(slider.value);
        });
    }

    static addThemeSelector() {
        const controls = document.querySelector('.dungeon-controls');
        const themes = [
            { id: 'standard', name: 'Standard Dungeon' },
            { id: 'cave', name: 'Natural Cavern' },
            { id: 'crypt', name: 'Ancient Crypt' },
            { id: 'temple', name: 'Temple Ruins' },
            { id: 'mine', name: 'Abandoned Mine' },
            { id: 'castle', name: 'Castle Ruins' }
        ];

        const themeHtml = `
            <div class="control-group">
                <label for="dungeonTheme">Theme:</label>
                <select id="dungeonTheme">
                    ${themes.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                </select>
            </div>
        `;
        controls.insertAdjacentHTML('beforeend', themeHtml);

        const themeSelect = document.getElementById('dungeonTheme');
        themeSelect.addEventListener('change', () => {
            window.dungeonOptions.theme = themeSelect.value;
        });
    }
}
