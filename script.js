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
            
            // Update analysis based on selected position and cards
            updateAnalysis(this.dataset.position);
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
            
            // Check if all cards are selected and update analysis
            checkCardsAndUpdateAnalysis();
        } else if (e.target === modal) {
            modal.remove();
        }
    });
}

function checkCardsAndUpdateAnalysis() {
    const cardInputs = document.querySelectorAll('.card-input');
    const allSelected = Array.from(cardInputs).every(input => input.textContent !== 'Select');
    
    if (allSelected) {
        const activePosition = document.querySelector('.position-btn.active');
        if (activePosition) {
            updateAnalysis(activePosition.dataset.position);
        }
    }
}

function updateAnalysis(position) {
    const cardInputs = document.querySelectorAll('.card-input');
    const cards = Array.from(cardInputs).map(input => input.textContent);
    
    // Skip if not all cards are selected
    if (cards.includes('Select')) {
        return;
    }
    
    // Get card ranks for simple analysis
    const ranks = cards.map(card => card.charAt(0));
    
    // Check if hand has pairs
    const rankCounts = {};
    ranks.forEach(rank => {
        rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    });
    
    const pairs = Object.values(rankCounts).filter(count => count >= 2).length;
    
    // Check if hand is suited
    const suits = cards.map(card => card.charAt(1));
    const suitCounts = {};
    suits.forEach(suit => {
        suitCounts[suit] = (suitCounts[suit] || 0) + 1;
    });
    
    const maxSuitedCards = Math.max(...Object.values(suitCounts));
    
    // Check if hand has high cards (A, K, Q, J)
    const highCards = ranks.filter(rank => ['A', 'K', 'Q', 'J'].includes(rank)).length;
    
    // Simple hand strength calculation
    let handStrength = 0;
    
    // Add value for pairs
    handStrength += pairs * 20;
    
    // Add value for suited cards
    if (maxSuitedCards >= 3) {
        handStrength += 15;
    } else if (maxSuitedCards === 2) {
        handStrength += 5;
    }
    
    // Add value for high cards
    handStrength += highCards * 10;
    
    // Position-based adjustments
    const positionValue = {
        'UTG': -10,
        'MP': -5,
        'CO': 0,
        'BTN': 10,
        'SB': 0,
        'BB': 5
    };
    
    handStrength += positionValue[position] || 0;
    
    // Determine action based on hand strength
    let action = '';
    let explanation = '';
    
    if (handStrength >= 60) {
        action = 'Raise';
        explanation = 'This is a strong hand that plays well from any position.';
    } else if (handStrength >= 40) {
        action = position === 'UTG' || position === 'MP' ? 'Call/Fold' : 'Raise';
        explanation = 'This hand has potential but be cautious from early positions.';
    } else if (handStrength >= 25) {
        action = ['BTN', 'SB', 'BB'].includes(position) ? 'Call' : 'Fold';
        explanation = 'This hand is playable from late position but weak from early position.';
    } else {
        action = 'Fold';
        explanation = 'This hand is too weak to play profitably.';
    }
    
    // Display analysis
    const preflopContent = document.getElementById('preflop-content');
    preflopContent.innerHTML = `
        <div class="analysis-result">
            <h3>Hand Analysis: ${cards.join(' ')}</h3>
            <p>Position: ${position}</p>
            <p>Hand Strength: ${handStrength}/100</p>
            <p>Recommended Action: <strong>${action}</strong></p>
            <p>${explanation}</p>
        </div>
    `;
    
    // Update postflop considerations
    updatePostflopConsiderations(cards, position);
}

function updatePostflopConsiderations(cards, position) {
    const ranks = cards.map(card => card.charAt(0));
    const suits = cards.map(card => card.charAt(1));
    
    // Check for potential straights
    const rankValues = ranks.map(rank => {
        if (rank === 'A') return 14;
        if (rank === 'K') return 13;
        if (rank === 'Q') return 12;
        if (rank === 'J') return 11;
        if (rank === 'T') return 10;
        return parseInt(rank);
    });
    
    const sortedRanks = [...rankValues].sort((a, b) => a - b);
    const hasGaps = sortedRanks[3] - sortedRanks[0] > 4;
    
    // Check for flush potential
    const suitCounts = {};
    suits.forEach(suit => {
        suitCounts[suit] = (suitCounts[suit] || 0) + 1;
    });
    
    const flushPotential = Math.max(...Object.values(suitCounts)) >= 3;
    
    // Generate postflop advice
    let postflopAdvice = '';
    
    if (flushPotential) {
        postflopAdvice += '<p><strong>Flush Potential:</strong> You have 3+ cards of the same suit. Look for flush draws on the flop.</p>';
    }
    
    if (!hasGaps) {
        postflopAdvice += '<p><strong>Straight Potential:</strong> Your cards are connected or have small gaps. Watch for straight draws.</p>';
    }
    
    // Add general advice based on hand composition
    postflopAdvice += '<p><strong>General Advice:</strong> ';
    
    if (ranks.includes('A')) {
        postflopAdvice += 'With an ace in your hand, you have good top pair potential. ';
    }
    
    if (Object.values(suitCounts).some(count => count >= 2)) {
        postflopAdvice += 'You have suited cards which increases your flush draw possibilities. ';
    }
    
    postflopAdvice += '</p>';
    
    // Display postflop considerations
    const postflopContent = document.getElementById('postflop-content');
    postflopContent.innerHTML = `
        <div class="postflop-advice">
            <h3>Postflop Considerations</h3>
            ${postflopAdvice}
            <p>Remember that board texture is crucial in PLO. Your hand strength can change dramatically based on the community cards.</p>
        </div>
    `;
}
