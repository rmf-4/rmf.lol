// Simple initialization without Firebase
document.addEventListener('DOMContentLoaded', () => {
    console.log("RMF.lol initialized");
    
    // Setup UI components
    setupPositionButtons();
    setupCardSelection();
});

function setupPositionButtons() {
    const positionButtons = document.querySelectorAll('.position-btn');
    positionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            positionButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            console.log('Position selected:', this.dataset.position);
        });
    });
}

function setupCardSelection() {
    const cardInputs = document.querySelectorAll('.card-input');
    cardInputs.forEach((input, index) => {
        // Add default styling
        input.style.backgroundColor = '#2c2c2c';
        input.textContent = 'Select';
        
        input.addEventListener('click', () => showCardSelector(input, index));
    });
}

function showCardSelector(input, index) {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
    
    const modal = document.createElement('div');
    modal.className = 'card-selector-modal';
    modal.innerHTML = `
        <div class="card-selector-content">
            ${ranks.map(rank => 
                suits.map(suit => 
                    `<div class="card-option" data-card="${rank}${suit}">${rank}${suit}</div>`
                ).join('')
            ).join('')}
        </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('card-option')) {
            const card = e.target.dataset.card;
            input.textContent = card;
            input.style.backgroundColor = card.includes('♥') || card.includes('♦') ? '#ff6b6b' : '#4d4d4d';
            modal.remove();
        } else if (e.target === modal) {
            modal.remove();
        }
    });
}
