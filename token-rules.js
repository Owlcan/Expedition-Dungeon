export class TokenController {
    constructor() {
        this.activeToken = null;
        this.dragEnabled = true;
        this.init();
    }

    init() {
        // Enforce our rules globally
        window._tokenController = this;
        Object.freeze(window._tokenController);

        // Force our event handlers
        document.addEventListener('mousedown', this.handleMouseDown.bind(this), true);
        document.addEventListener('mousemove', this.handleMouseMove.bind(this), true);
        document.addEventListener('mouseup', this.handleMouseUp.bind(this), true);
    }

    handleMouseDown(e) {
        const token = e.target.closest('.cell-monster, .cell-player');
        if (!token) return;

        // Always prevent map from interfering
        e.stopPropagation();
        e.preventDefault();

        this.activeToken = {
            element: token,
            startX: e.clientX - token.offsetLeft,
            startY: e.clientY - token.offsetTop,
            initialPosition: {
                left: token.offsetLeft,
                top: token.offsetTop
            }
        };

        token.classList.add('dragging');
    }

    handleMouseMove(e) {
        if (!this.activeToken) return;

        // Force event handling
        e.stopPropagation();
        e.preventDefault();

        const { element, startX, startY } = this.activeToken;

        // Calculate new position
        const x = e.clientX - startX;
        const y = e.clientY - startY;

        // Force position update
        element.style.setProperty('left', `${x}px`, 'important');
        element.style.setProperty('top', `${y}px`, 'important');
        element.style.setProperty('position', 'absolute', 'important');
        element.style.setProperty('z-index', '999999', 'important');
    }

    handleMouseUp(e) {
        if (!this.activeToken) return;

        const { element } = this.activeToken;
        element.classList.remove('dragging');

        // Get target cell
        const targetCell = document.elementFromPoint(e.clientX, e.clientY)
            .closest('td:not(.cell-wall)');

        if (targetCell) {
            this.moveTokenToCell(element, targetCell);
        } else {
            // Reset position if no valid target
            this.resetTokenPosition(element);
        }

        this.activeToken = null;
    }

    moveTokenToCell(token, cell) {
        if (!cell || cell.classList.contains('cell-wall')) {
            this.resetTokenPosition(token);
            return;
        }

        // Remove token from old cell
        const oldCell = token.parentElement;
        oldCell.classList.remove('cell-monster', 'cell-player');

        // Add token to new cell
        cell.appendChild(token);
        cell.classList.add(token.classList.contains('cell-monster') ? 'cell-monster' : 'cell-player');

        // Reset token styles
        token.style.removeProperty('left');
        token.style.removeProperty('top');
        token.style.removeProperty('position');
    }

    resetTokenPosition(token) {
        const { initialPosition } = this.activeToken;
        token.style.left = `${initialPosition.left}px`;
        token.style.top = `${initialPosition.top}px`;
    }
}

// Initialize immediately
new TokenController();
