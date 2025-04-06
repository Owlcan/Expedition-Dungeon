// Initialize room count slider
const roomSlider = document.getElementById('roomCountSlider');
const roomOutput = roomSlider.nextElementSibling;

roomSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    roomOutput.value = value;
    dungeonOptions.roomCount = parseInt(value);
});