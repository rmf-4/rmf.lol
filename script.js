// Simple initialization without Firebase
document.addEventListener('DOMContentLoaded', function() {
    console.log("RMF.lol initialized");
    
    // Set up position buttons
    const positionButtons = document.querySelectorAll('.position-btn');
    positionButtons.forEach(button => {
        button.addEventListener('click', function() {
            positionButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            console.log('Position selected:', this.textContent);
            analyzeHand();
        });
    });
    
    // Set up card selection
    const cardInputs = document.querySelectorAll('.card-input');
    cardInputs.forEach(input => {
        input.textContent = 'Select';
        input.style.backgroundColor = '#2c2c2c';
        
        input.addEventListener('click', function() {
            showCardSelector(this);
        });
    });
    
    function showCardSelector(cardInput) {
        const suits = ['♠', '♥', '♣', '♦']; // Ordered: spades, hearts, clubs, diamonds
        const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'card-selector-modal';
        
        let html = '<div class="card-selector-content">';
        
        // Generate cards organized by suit
        for (let suit of suits) {
            for (let rank of ranks) {
                const isRed = suit === '♥' || suit === '♦';
                html += `<div class="card-option ${isRed ? 'red-card' : ''}" data-rank="${rank}" data-suit="${suit}">${rank}${suit}</div>`;
            }
        }
        
        html += '</div>';
        
        modal.innerHTML = html;
        document.body.appendChild(modal);
        
        // Add CSS for red cards
        const style = document.createElement('style');
        style.textContent = `
            .card-selector-content {
                display: grid;
                grid-template-columns: repeat(13, 1fr);
                gap: 5px;
            }
            .red-card {
                color: #ff6b6b !important;
            }
        `;
        document.head.appendChild(style);
        
        // Handle card selection
        const options = modal.querySelectorAll('.card-option');
        options.forEach(option => {
            option.addEventListener('click', function() {
                const rank = this.getAttribute('data-rank');
                const suit = this.getAttribute('data-suit');
                
                cardInput.textContent = rank + suit;
                cardInput.style.backgroundColor = (suit === '♥' || suit === '♦') ? '#ff6b6b' : '#4d4d4d';
                
                modal.remove();
                analyzeHand();
            });
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    function analyzeHand() {
        const cardInputs = document.querySelectorAll('.card-input');
        const cards = Array.from(cardInputs).map(input => input.textContent);
        
        // Check if all cards are selected
        if (cards.includes('Select')) {
            return;
        }
        
        const activePosition = document.querySelector('.position-btn.active');
        if (!activePosition) {
            return;
        }
        
        const position = activePosition.textContent;
        
        // Simple hand analysis
        let handStrength = 0;
        let explanation = '';
        
        // Count high cards
        const highCards = cards.filter(card => ['A', 'K', 'Q', 'J'].includes(card[0])).length;
        handStrength += highCards * 10;
        
        // Check for pairs
        const ranks = cards.map(card => card[0]);
        const rankCounts = {};
        ranks.forEach(rank => {
            rankCounts[rank] = (rankCounts[rank] || 0) + 1;
        });
        
        const pairs = Object.values(rankCounts).filter(count => count >= 2).length;
        handStrength += pairs * 15;
        
        // Check for suited cards
        const suits = cards.map(card => card.slice(1));
        const suitCounts = {};
        suits.forEach(suit => {
            suitCounts[suit] = (suitCounts[suit] || 0) + 1;
        });
        
        const maxSuited = Math.max(...Object.values(suitCounts));
        if (maxSuited >= 3) {
            handStrength += 15;
        }
        
        // Position adjustment
        if (position === 'UTG') handStrength -= 10;
        if (position === 'MP') handStrength -= 5;
        if (position === 'BTN') handStrength += 10;
        
        // Determine action
        let action = '';
        if (handStrength >= 60) {
            action = 'Raise';
            explanation = 'This is a premium hand that plays well from any position.';
        } else if (handStrength >= 45) {
            action = 'Pot';
            explanation = 'This is a strong hand worth potting, especially if there are limpers.';
        } else if (handStrength >= 35) {
            action = 'Call';
            explanation = 'This hand has potential but be cautious.';
        } else {
            action = 'Fold';
            explanation = 'This hand is too weak to play profitably.';
        }
        
        // Adjust action based on position
        if (action === 'Call' && (position === 'BTN' || position === 'CO')) {
            action = 'Pot';
            explanation += ' From late position, you can play this hand more aggressively.';
        }
        
        // Display analysis with color-coded action
        let actionClass = '';
        if (action === 'Raise') actionClass = 'action-raise';
        else if (action === 'Pot') actionClass = 'action-pot';
        else if (action === 'Call') actionClass = 'action-call';
        else actionClass = 'action-fold';
        
        document.getElementById('preflop-content').innerHTML = `
            <div class="analysis-result">
                <h3>Hand Analysis: ${cards.join(' ')}</h3>
                <p>Position: ${position}</p>
                <p>Hand Strength: ${handStrength}/100</p>
                <p>Recommended Action: <span class="${actionClass}">${action}</span></p>
                <p>${explanation}</p>
            </div>
        `;
        
        // Display postflop considerations
        let postflopAdvice = '';
        
        if (maxSuited >= 3) {
            postflopAdvice += '<p><strong>Flush Potential:</strong> You have 3+ cards of the same suit. Look for flush draws.</p>';
        }
        
        if (ranks.includes('A')) {
            postflopAdvice += '<p><strong>Top Pair Potential:</strong> With an ace in your hand, you have good top pair potential.</p>';
        }
        
        // Check for double pairs
        if (pairs >= 2) {
            postflopAdvice += '<p><strong>Set Potential:</strong> With multiple pairs, you have good set potential.</p>';
        }
        
        // Check for connected cards
        const rankValues = ranks.map(rank => {
            if (rank === 'A') return 14;
            if (rank === 'K') return 13;
            if (rank === 'Q') return 12;
            if (rank === 'J') return 11;
            if (rank === 'T') return 10;
            return parseInt(rank);
        });
        
        const sortedRanks = [...rankValues].sort((a, b) => a - b);
        const hasConnected = sortedRanks.some((val, i) => i > 0 && val - sortedRanks[i-1] === 1);
        
        if (hasConnected) {
            postflopAdvice += '<p><strong>Straight Potential:</strong> You have connected cards which gives you straight possibilities.</p>';
        }
        
        document.getElementById('postflop-content').innerHTML = `
            <div class="postflop-advice">
                <h3>Postflop Considerations</h3>
                ${postflopAdvice || '<p>No specific postflop advantages detected.</p>'}
                <p>Remember that board texture is crucial in PLO. Your hand strength can change dramatically based on the community cards.</p>
            </div>
        `;
    }
});
