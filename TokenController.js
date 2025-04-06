export class TokenController {
    constructor() {
        this.draggedToken = null;
        this.init();
    }

    init() {
        document.addEventListener('mousedown', this.handleMouseDown.bind(this), true);
        document.addEventListener('mousemove', this.handleMouseMove.bind(this), true);
        document.addEventListener('mouseup', this.handleMouseUp.bind(this), true);

        // Force global access
        window._tokenController = this;
        Object.freeze(window._tokenController);
    }

    handleMouseDown(e) {
        const token = e.target.closest('.cell-monster, .cell-player');
        if (!token) return;

        // Take control of token events
        e.stopPropagation();
        e.preventDefault();

        this.draggedToken = {
            element: token,
            startX: e.clientX,
            startY: e.clientY,
            originalCell: token.parentElement
        };

        token.classList.add('dragging');
    }

    handleMouseMove(e) {
        if (!this.draggedToken) return;

        e.preventDefault();
        e.stopPropagation();

        const dx = e.clientX - this.draggedToken.startX;
        const dy = e.clientY - this.draggedToken.startY;

        // Move token with pointer
        this.draggedToken.element.style.position = 'fixed';
        this.draggedToken.element.style.left = `${e.clientX}px`;
        this.draggedToken.element.style.top = `${e.clientY}px`;
        this.draggedToken.element.style.zIndex = '10000';
        this.draggedToken.element.style.pointerEvents = 'none';

        // Highlight potential drop targets
        this.updateDropTargets(e);
    }

    handleMouseUp(e) {
        if (!this.draggedToken) return;

        const token = this.draggedToken.element;
        token.classList.remove('dragging');
        
        // Find drop target under pointer
        token.style.display = 'none';  // Hide token to find element underneath
        const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
        token.style.display = '';

        const targetCell = dropTarget?.closest('td');
        if (targetCell && !targetCell.classList.contains('cell-wall')) {
            // Move token to new cell
            targetCell.appendChild(token);
        } else {
            // Return to original position
            this.draggedToken.originalCell.appendChild(token);
        }

        // Reset token styles
        token.style.position = '';
        token.style.left = '';
        token.style.top = '';
        token.style.zIndex = '';
        token.style.pointerEvents = '';

        // Remove all drop target highlights
        document.querySelectorAll('.drop-target').forEach(el => {
            el.classList.remove('drop-target');
        });

        this.draggedToken = null;
    }

    updateDropTargets(e) {
        // Remove previous highlights
        document.querySelectorAll('.drop-target').forEach(el => {
            el.classList.remove('drop-target');
        });

        // Hide token to find element underneath
        const token = this.draggedToken.element;
        token.style.display = 'none';
        
        const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
        const cellBelow = elemBelow?.closest('td');
        
        token.style.display = '';

        // Highlight valid drop target
        if (cellBelow && !cellBelow.classList.contains('cell-wall')) {
            cellBelow.classList.add('drop-target');
        }
    }
}

// Initialize immediately
new TokenController();
