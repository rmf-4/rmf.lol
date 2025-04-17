// Simple initialization without Firebase
document.addEventListener('DOMContentLoaded', function() {
    console.log("RMF.lol initialized");
    
    // Set up tabs
    setupTabs();
    
    // Set up position buttons
    const positionButtons = document.querySelectorAll('.position-btn');
    positionButtons.forEach(button => {
        button.addEventListener('click', function() {
            positionButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            console.log('Position selected:', this.textContent);
            analyzeHand();
            updateRangeVisualizer(this.textContent);
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
    
    // Initialize board texture section
    initializeBoardTexture();
    
    // Initialize range visualizer
    initializeRangeVisualizer();
    
    // Initialize theme toggle
    initializeThemeToggle();
    
    // Remove or comment out this line if not needed
    // initializeStudyTools();
});

function setupTabs() {
    const mainContent = document.querySelector('main');
    
    // Create range visualizer section if it doesn't exist
    if (!document.getElementById('range-section')) {
        const rangeSection = document.createElement('section');
        rangeSection.id = 'range-section';
        rangeSection.innerHTML = `
            <h2>Range Visualizer</h2>
            <div class="position-buttons range-positions">
                <button class="position-btn" data-position="UTG">UTG</button>
                <button class="position-btn" data-position="MP">MP</button>
                <button class="position-btn" data-position="CO">CO</button>
                <button class="position-btn" data-position="BTN">BTN</button>
                <button class="position-btn" data-position="SB">SB</button>
                <button class="position-btn" data-position="BB">BB</button>
            </div>
            <div class="range-grid">
                <div class="matrix-grid"></div>
            </div>
            <div class="range-legend">
                <div class="legend-item"><span class="legend-color raise"></span> Raise</div>
                <div class="legend-item"><span class="legend-color pot"></span> Pot</div>
                <div class="legend-item"><span class="legend-color call"></span> Call</div>
                <div class="legend-item"><span class="legend-color fold"></span> Fold</div>
            </div>
        `;
        mainContent.appendChild(rangeSection);
        
        // Initialize the matrix grid
        createMatrixGrid();
        
        // Add event listeners to position buttons
        const buttons = document.querySelectorAll('.position-btn');
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                buttons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                updateRangeVisualizer(this.dataset.position);
            });
        });
        
        // Set BTN as default active position
        document.querySelector('[data-position="BTN"]').classList.add('active');
        updateRangeVisualizer('BTN');
    }
}

function createMatrixGrid() {
    const matrixGrid = document.querySelector('.matrix-grid');
    const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
    
    // Create header row
    const headerRow = document.createElement('div');
    headerRow.className = 'matrix-row header';
    headerRow.innerHTML = '<div class="matrix-cell"></div>' + 
        ranks.map(rank => `<div class="matrix-cell">${rank}</div>`).join('');
    matrixGrid.appendChild(headerRow);
    
    // Create matrix rows
    ranks.forEach(rank1 => {
        const row = document.createElement('div');
        row.className = 'matrix-row';
        
        // Add row header
        const rowHeader = document.createElement('div');
        rowHeader.className = 'matrix-cell header';
        rowHeader.textContent = rank1;
        row.appendChild(rowHeader);
        
        // Add cells
        ranks.forEach(rank2 => {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell';
            cell.dataset.hand = `${rank1}${rank2}`;
            cell.textContent = `${rank1}${rank2}`;
            row.appendChild(cell);
        });
        
        matrixGrid.appendChild(row);
    });
}

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
            
            // Check if this is a board card
            if (cardInput.classList.contains('board-card')) {
                // If all flop cards are selected, enable analyze button
                const flopCards = document.querySelectorAll('.board-card');
                const allFlopSelected = Array.from(flopCards).slice(0, 3).every(card => 
                    card.textContent !== 'Flop 1' && 
                    card.textContent !== 'Flop 2' && 
                    card.textContent !== 'Flop 3'
                );
                
                if (allFlopSelected) {
                    document.getElementById('analyze-board').disabled = false;
                }
            } else {
                analyzeHand();
            }
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
    const cardInputs = document.querySelectorAll('.card-input:not(.board-card)');
    const cards = Array.from(cardInputs).map(input => input.textContent);
    
    // Check if all cards are selected
    if (cards.includes('Select')) {
        document.getElementById('preflop-content').innerHTML = `
            <div class="analysis-result">
                <h3>Hand Analysis</h3>
                <p>Please select all four cards to analyze your hand.</p>
            </div>
        `;
        return;
    }
    
    const activePosition = document.querySelector('.position-btn.active');
    if (!activePosition) {
        document.getElementById('preflop-content').innerHTML = `
            <div class="analysis-result">
                <h3>Hand Analysis: ${cards.join(' ')}</h3>
                <p>Please select a position to get a complete analysis.</p>
            </div>
        `;
        return;
    }
    
    const position = activePosition.textContent;
    
    // Extract ranks and suits
    const ranks = cards.map(card => card[0]);
    const suits = cards.map(card => card.slice(1));
    
    // Count rank frequencies
    const rankCounts = {};
    ranks.forEach(rank => {
        rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    });
    
    // Count suit frequencies
    const suitCounts = {};
    suits.forEach(suit => {
        suitCounts[suit] = (suitCounts[suit] || 0) + 1;
    });
    
    // Calculate hand strength based on PLO principles
    let handStrength = 0;
    let strengthFactors = [];
    let weaknesses = [];
    
    // Convert ranks to numerical values for easier comparison
    const rankValues = ranks.map(rank => {
        if (rank === 'A') return 14;
        if (rank === 'K') return 13;
        if (rank === 'Q') return 12;
        if (rank === 'J') return 11;
        if (rank === 'T') return 10;
        return parseInt(rank);
    });
    
    // Sort rank values in descending order
    const sortedRanks = [...rankValues].sort((a, b) => b - a);
    
    // 1. Evaluate high cards (but not as important as in Hold'em)
    const highCards = rankValues.filter(rank => rank >= 10).length;
    if (highCards >= 3) {
        handStrength += 5;
        strengthFactors.push(`${highCards} high cards (T or higher)`);
    }
    
    // 2. Check for double pairs (good in PLO)
    const pairs = Object.values(rankCounts).filter(count => count === 2).length;
    if (pairs === 2) {
        // Double pairs are good, especially high ones
        const pairRanks = Object.entries(rankCounts)
            .filter(([_, count]) => count === 2)
            .map(([rank, _]) => rank);
        
        const highPairs = pairRanks.filter(rank => 
            rank === 'A' || rank === 'K' || rank === 'Q' || rank === 'J' || rank === 'T'
        ).length;
        
        if (highPairs === 2) {
            handStrength += 18;
            strengthFactors.push(`High double pair (${pairRanks.join(', ')})`);
        } else if (highPairs === 1) {
            handStrength += 14;
            strengthFactors.push(`Double pair with one high pair (${pairRanks.join(', ')})`);
        } else {
            handStrength += 10;
            strengthFactors.push(`Double pair (${pairRanks.join(', ')})`);
        }
    } else if (pairs === 1) {
        // Single pair is okay but not great
        const pairRank = Object.entries(rankCounts)
            .find(([_, count]) => count === 2)[0];
        
        if (pairRank === 'A') {
            handStrength += 8;
            strengthFactors.push('Pair of Aces');
        } else if (pairRank === 'K' || pairRank === 'Q') {
            handStrength += 6;
            strengthFactors.push(`Pair of ${pairRank === 'K' ? 'Kings' : 'Queens'}`);
        } else {
            handStrength += 4;
            strengthFactors.push(`Pair of ${pairRank}s`);
        }
    }
    
    // 3. Check for trips or quads (generally bad in PLO)
    const hasTrips = Object.values(rankCounts).some(count => count === 3);
    const hasQuads = Object.values(rankCounts).some(count => count === 4);
    
    if (hasQuads) {
        handStrength -= 20;
        weaknesses.push('Four of a kind in starting hand severely reduces drawing potential');
    } else if (hasTrips) {
        handStrength -= 10;
        weaknesses.push('Three of a kind in starting hand reduces drawing potential');
    }
    
    // 4. Check for suited cards (good in PLO)
    const suitedCounts = Object.values(suitCounts).filter(count => count >= 2);
    if (suitedCounts.length === 2 && suitedCounts.every(count => count === 2)) {
        // Double suited (two pairs of suited cards)
        handStrength += 20;
        const suitedPairs = Object.entries(suitCounts)
            .filter(([_, count]) => count === 2)
            .map(([suit, _]) => suit);
        strengthFactors.push(`Double suited (${suitedPairs.join(' and ')})`);
    } else if (suitedCounts.includes(3)) {
        handStrength += 12;
        const dominantSuit = Object.entries(suitCounts).find(([_, count]) => count === 3)[0];
        strengthFactors.push(`Three cards of the same suit (${dominantSuit})`);
    } else if (suitedCounts.includes(2)) {
        handStrength += 8;
        const dominantSuit = Object.entries(suitCounts).find(([_, count]) => count === 2)[0];
        strengthFactors.push(`Two cards of the same suit (${dominantSuit})`);
    } else {
        weaknesses.push('No suited cards (reduces flush potential)');
    }
    
    // 5. Check for connectedness (good in PLO)
    let gapSizes = [];
    for (let i = 0; i < sortedRanks.length - 1; i++) {
        gapSizes.push(sortedRanks[i] - sortedRanks[i + 1]);
    }
    
    const connectedCount = gapSizes.filter(gap => gap === 1).length;
    const oneGapCount = gapSizes.filter(gap => gap === 2).length;
    const twoGapCount = gapSizes.filter(gap => gap === 3).length;
    
    if (connectedCount >= 3) {
        handStrength += 20;
        strengthFactors.push('Highly connected hand (three or more connected cards)');
    } else if (connectedCount === 2) {
        handStrength += 15;
        strengthFactors.push('Well connected hand (two connected cards)');
    } else if (connectedCount === 1) {
        handStrength += 8;
        strengthFactors.push('Partially connected hand');
    } else if (oneGapCount >= 2) {
        handStrength += 6;
        strengthFactors.push('Contains multiple one-gap connections');
    } else if (oneGapCount === 1) {
        handStrength += 4;
        strengthFactors.push('Contains a one-gap connection');
    } else if (twoGapCount >= 1) {
        handStrength += 2;
        strengthFactors.push('Contains a two-gap connection');
    } else {
        weaknesses.push('Disconnected hand (reduces straight potential)');
    }
    
    // 6. Check for rundowns (very good in PLO)
    if (connectedCount >= 3 && Math.max(...sortedRanks) - Math.min(...sortedRanks) <= 4) {
        handStrength += 15;
        strengthFactors.push('Rundown hand (four cards within a 5-card range)');
    }
    
    // 7. Check for nut potential
    if (ranks.includes('A')) {
        const aceSuits = [];
        for (let i = 0; i < ranks.length; i++) {
            if (ranks[i] === 'A') {
                aceSuits.push(suits[i]);
            }
        }
        
        if (aceSuits.length >= 2) {
            handStrength += 8;
            strengthFactors.push(`Contains multiple aces (${aceSuits.join(', ')})`);
        } else {
            handStrength += 5;
            strengthFactors.push(`Contains an ace (${aceSuits[0]})`);
        }
    }
    
    // 8. Check for wheel potential (A-5 straight)
    const hasAce = ranks.includes('A');
    const hasFive = ranks.includes('5') || ranks.includes('5');
    const hasFour = ranks.includes('4') || ranks.includes('4');
    const hasThree = ranks.includes('3') || ranks.includes('3');
    const hasTwo = ranks.includes('2') || ranks.includes('2');
    
    if (hasAce && hasFive && hasFour && (hasThree || hasTwo)) {
        handStrength += 12;
        strengthFactors.push('Strong wheel potential (A-5 straight draw)');
    } else if (hasAce && hasFive && (hasFour || hasThree || hasTwo)) {
        handStrength += 6;
        strengthFactors.push('Partial wheel potential');
    }
    
    // 9. Check for broadway potential (T-A straight)
    const hasTen = ranks.includes('T');
    const hasJack = ranks.includes('J');
    const hasQueen = ranks.includes('Q');
    const hasKing = ranks.includes('K');
    
    if (hasAce && hasKing && hasQueen && (hasJack || hasTen)) {
        handStrength += 12;
        strengthFactors.push('Strong broadway potential (T-A straight draw)');
    } else if (hasAce && hasKing && (hasQueen || hasJack || hasTen)) {
        handStrength += 6;
        strengthFactors.push('Partial broadway potential');
    }
    
    // 10. Check for danglers (bad in PLO)
    let hasDangler = false;
    for (let i = 0; i < 4; i++) {
        let worksWith = 0;
        for (let j = 0; j < 4; j++) {
            if (i === j) continue;
            
            // Check if cards work together (same suit or connected or one-gap)
            if (suits[i] === suits[j] || Math.abs(rankValues[i] - rankValues[j]) <= 3) {
                worksWith++;
            }
        }
        
        if (worksWith === 0) {
            hasDangler = true;
            weaknesses.push(`${ranks[i]}${suits[i]} is a dangler (doesn't work well with other cards)`);
            handStrength -= 12;
            break;
        }
    }
    
    // 11. Position adjustment
    let positionAdjustment = 0;
    let positionAdvice = '';
    
    switch (position) {
        case 'UTG':
            positionAdjustment = -12;
            positionAdvice = 'Play very tight from UTG. Only continue with premium hands.';
            break;
        case 'MP':
            positionAdjustment = -6;
            positionAdvice = 'Play tight from middle position. You can open with strong hands.';
            break;
        case 'CO':
            positionAdjustment = 6;
            positionAdvice = 'Cutoff allows you to play more hands as you have position on most players.';
            break;
        case 'BTN':
            positionAdjustment = 12;
            positionAdvice = 'Button is the best position. You can play more speculative hands.';
            break;
        case 'SB':
            positionAdjustment = -10;
            positionAdvice = 'Small blind is a tough position. Play tight unless the pot is unraised.';
            break;
        case 'BB':
            positionAdjustment = -4;
            positionAdvice = 'In the big blind, you can defend more widely against late position raises.';
            break;
    }
    
    handStrength += positionAdjustment;
    
    // Normalize hand strength to 0-100 range
    handStrength = Math.max(0, Math.min(100, handStrength));
    
    // Calculate approximate equity against random hands
    let equity = Math.min(Math.max(handStrength * 0.8, 40), 80).toFixed(1);
    
    // Determine action based on hand strength and position
    let action = '';
    let explanation = '';
    
    if (handStrength >= 65) {
        action = 'Raise';
        explanation = 'This is a premium PLO hand with multiple ways to make strong hands.';
    } else if (handStrength >= 50) {
        action = 'Pot';
        explanation = 'This is a strong hand worth potting, especially if there are limpers.';
    } else if (handStrength >= 35) {
        action = 'Call';
        explanation = 'This hand has potential but be cautious against raises.';
    } else {
        action = 'Fold';
        explanation = 'This hand lacks the connectivity and coordination needed for PLO.';
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
            <div class="strength-meter">
                <div class="meter-label">Hand Strength</div>
                <div class="meter">
                    <div class="meter-fill" style="width: ${handStrength}%"></div>
                    <span>${handStrength.toFixed(0)}/100</span>
                </div>
            </div>
            <div class="equity-estimate">
                <h4>Estimated Equity vs Random Hand</h4>
                <div class="equity-bar">
                    <div class="equity-fill" style="width: ${equity}%"></div>
                    <span>${equity}%</span>
                </div>
            </div>
            <p>Recommended Action: <span class="${actionClass}">${action}</span></p>
            <p>${explanation}</p>
            
            <div class="strength-factors">
                <h4>Strength Factors:</h4>
                <ul>
                    ${strengthFactors.map(factor => `<li>${factor}</li>`).join('')}
                </ul>
            </div>
            
            ${weaknesses.length > 0 ? `
                <div class="weaknesses">
                    <h4>Weaknesses:</h4>
                    <ul>
                        ${weaknesses.map(weakness => `<li>${weakness}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <div class="position-advice">
                <h4>Position Advice:</h4>
                <p>${positionAdvice}</p>
            </div>
        </div>
    `;
    
    // Update postflop considerations
    updatePostflopConsiderations(cards, position);
}

function initializeBoardTexture() {
    // Set up board card selection
    const boardCards = document.querySelectorAll('.board-card');
    boardCards.forEach(card => {
        card.addEventListener('click', function() {
            showCardSelector(this);
        });
    });
    
    // Set up analyze button
    const analyzeButton = document.getElementById('analyze-board');
    if (analyzeButton) {
        analyzeButton.disabled = true;
        analyzeButton.addEventListener('click', analyzeBoardTexture);
    }
}

function analyzeBoardTexture() {
    const flopCards = [
        document.getElementById('flop1').textContent,
        document.getElementById('flop2').textContent,
        document.getElementById('flop3').textContent
    ];
    
    // Check if flop is complete
    if (flopCards.includes('Flop 1') || flopCards.includes('Flop 2') || flopCards.includes('Flop 3')) {
        document.getElementById('board-analysis').innerHTML = `
            <div class="analysis-result">
                <h3>Board Analysis</h3>
                <p>Please select all three flop cards to analyze the board texture.</p>
            </div>
        `;
        return;
    }
    
    const turnCard = document.getElementById('turn').textContent !== 'Turn' ? 
                     document.getElementById('turn').textContent : null;
    
    const riverCard = document.getElementById('river').textContent !== 'River' ? 
                      document.getElementById('river').textContent : null;
    
    // Collect all selected board cards
    const boardCards = [...flopCards];
    if (turnCard) boardCards.push(turnCard);
    if (riverCard) boardCards.push(riverCard);
    
    // Get the player's hand
    const handCards = Array.from(document.querySelectorAll('.card-input:not(.board-card)'))
                          .map(input => input.textContent);
    
    // Check if hand is complete
    if (handCards.some(card => card === 'Select')) {
        document.getElementById('board-analysis').innerHTML = `
            <div class="analysis-result">
                <h3>Board Analysis: ${boardCards.join(' ')}</h3>
                <p>Please select your four hole cards to get a complete analysis with your hand.</p>
                <div id="board-texture-analysis"></div>
            </div>
        `;
        analyzeBoardTextureOnly(boardCards);
        return;
    }
    
    // Analyze board texture with hand
    analyzeBoardWithHand(boardCards, handCards);
}

function analyzeBoardTextureOnly(boardCards) {
    // Extract ranks and suits from board
    const boardRanks = boardCards.map(card => card[0]);
    const boardSuits = boardCards.map(card => card.slice(1));
    
    // Check for pairs on board
    const rankCounts = {};
    boardRanks.forEach(rank => {
        rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    });
    
    const pairs = Object.values(rankCounts).filter(count => count >= 2).length;
    const hasTrips = Object.values(rankCounts).some(count => count >= 3);
    const hasQuads = Object.values(rankCounts).some(count => count >= 4);
    
    // Check for flush possibilities
    const suitCounts = {};
    boardSuits.forEach(suit => {
        suitCounts[suit] = (suitCounts[suit] || 0) + 1;
    });
    
    const flushDraw = Object.values(suitCounts).some(count => count >= 3);
    const flushComplete = Object.values(suitCounts).some(count => count >= 5);
    const flushDrawSuit = flushDraw ? 
                          Object.entries(suitCounts).find(([_, count]) => count >= 3)[0] : null;
    
    // Check for straight possibilities
    const rankValues = boardRanks.map(rank => {
        if (rank === 'A') return 14;
        if (rank === 'K') return 13;
        if (rank === 'Q') return 12;
        if (rank === 'J') return 11;
        if (rank === 'T') return 10;
        return parseInt(rank);
    });
    
    const sortedRanks = [...rankValues].sort((a, b) => a - b);
    let straightDraw = false;
    let straightComplete = false;
    
    // Check for 3-card straight on board
    for (let i = 0; i < sortedRanks.length - 2; i++) {
        if (sortedRanks[i+1] === sortedRanks[i] + 1 && sortedRanks[i+2] === sortedRanks[i] + 2) {
            straightDraw = true;
            break;
        }
    }
    
    // Check for 4-card straight on board
    for (let i = 0; i < sortedRanks.length - 3; i++) {
        if (sortedRanks[i+1] === sortedRanks[i] + 1 && 
            sortedRanks[i+2] === sortedRanks[i] + 2 && 
            sortedRanks[i+3] === sortedRanks[i] + 3) {
            straightDraw = true;
            break;
        }
    }
    
    // Check for 5-card straight on board
    for (let i = 0; i < sortedRanks.length - 4; i++) {
        if (sortedRanks[i+1] === sortedRanks[i] + 1 && 
            sortedRanks[i+2] === sortedRanks[i] + 2 && 
            sortedRanks[i+3] === sortedRanks[i] + 3 &&
            sortedRanks[i+4] === sortedRanks[i] + 4) {
            straightComplete = true;
            break;
        }
    }
    
    // Analyze board texture
    let textureDescription = '';
    let strategyAdvice = '';
    
    // Wetness score (0-5)
    let wetness = 0;
    if (flushDraw) wetness += 2;
    if (flushComplete) wetness += 3;
    if (straightDraw) wetness += 2;
    if (straightComplete) wetness += 3;
    if (pairs > 0) wetness += 1;
    
    if (wetness >= 4) {
        textureDescription += '<p><strong>Wet Board:</strong> Many drawing possibilities exist.</p>';
        strategyAdvice += '<p>On wet boards, be cautious with one-pair hands. Strong draws have significant equity.</p>';
    } else if (wetness <= 1) {
        textureDescription += '<p><strong>Dry Board:</strong> Few drawing possibilities exist.</p>';
        strategyAdvice += '<p>On dry boards, strong made hands have more value. Bluffs are less likely to succeed.</p>';
    } else {
        textureDescription += '<p><strong>Medium Texture:</strong> Some drawing possibilities exist.</p>';
        strategyAdvice += '<p>On medium-textured boards, consider both made hands and draws.</p>';
    }
    
    // Paired board
    if (hasQuads) {
        textureDescription += '<p><strong>Four of a Kind on Board:</strong> The board has quads.</p>';
        strategyAdvice += '<p>With quads on board, the best hand is a full house using your hole cards.</p>';
    } else if (hasTrips) {
        textureDescription += '<p><strong>Three of a Kind on Board:</strong> The board has trips.</p>';
        strategyAdvice += '<p>With trips on board, full houses are possible. Single pairs lose value.</p>';
    } else if (pairs > 0) {
        textureDescription += `<p><strong>Paired Board:</strong> The board has ${pairs} pair(s).</p>`;
        strategyAdvice += '<p>On paired boards, full houses are possible. Single pairs lose value.</p>';
    }
    
    // Flush possibilities
    if (flushComplete) {
        textureDescription += `<p><strong>Flush Complete:</strong> A flush is possible with the ${flushDrawSuit} suit.</p>`;
        strategyAdvice += '<p>When a flush is possible, be cautious with non-flush hands.</p>';
    } else if (flushDraw) {
        textureDescription += `<p><strong>Flush Draw:</strong> Three ${flushDrawSuit} cards on the board.</p>`;
        strategyAdvice += `<p>With three ${flushDrawSuit} cards on board, any player with two ${flushDrawSuit} cards has a flush draw.</p>`;
    }
    
    // Straight possibilities
    if (straightComplete) {
        textureDescription += '<p><strong>Straight Complete:</strong> A straight is possible using all board cards.</p>';
        strategyAdvice += '<p>When a straight is possible on the board, be cautious with lower straights or non-straight hands.</p>';
    } else if (straightDraw) {
        textureDescription += '<p><strong>Straight Draw:</strong> The board has connected cards.</p>';
        strategyAdvice += '<p>With connected cards on board, straight draws are common.</p>';
    }
    
    // High card analysis
    const highCards = rankValues.filter(rank => rank >= 10).length;
    if (highCards >= 2) {
        textureDescription += '<p><strong>High Card Board:</strong> Multiple high cards (T or higher) are present.</p>';
        strategyAdvice += '<p>On high card boards, top pair needs a strong kicker. Many players will have connected with this board.</p>';
    } else if (highCards === 0) {
        textureDescription += '<p><strong>Low Card Board:</strong> No high cards (T or higher) are present.</p>';
        strategyAdvice += '<p>On low card boards, overpairs have significant value. Watch for straights with connected low cards.</p>';
    }
    
    // Display the analysis
    document.getElementById('board-analysis').innerHTML = `
        <div class="analysis-result">
            <h3>Board Analysis: ${boardCards.join(' ')}</h3>
            <div class="texture-description">
                <h4>Board Texture</h4>
                ${textureDescription}
            </div>
            <div class="strategy-advice">
                <h4>General Strategy Considerations</h4>
                ${strategyAdvice}
                <p>Remember that in PLO, players have four cards, making draws more common than in Hold'em.</p>
            </div>
        </div>
    `;
}

function analyzeBoardWithHand(boardCards, handCards) {
    // First analyze the board texture
    analyzeBoardTextureOnly(boardCards);
    
    // Now analyze how the hand interacts with the board
    const boardRanks = boardCards.map(card => card[0]);
    const boardSuits = boardCards.map(card => card.slice(1));
    const handRanks = handCards.map(card => card[0]);
    const handSuits = handCards.map(card => card.slice(1));
    
    // Convert ranks to numerical values
    const boardRankValues = boardRanks.map(rank => {
        if (rank === 'A') return 14;
        if (rank === 'K') return 13;
        if (rank === 'Q') return 12;
        if (rank === 'J') return 11;
        if (rank === 'T') return 10;
        return parseInt(rank);
    });
    
    const handRankValues = handRanks.map(rank => {
        if (rank === 'A') return 14;
        if (rank === 'K') return 13;
        if (rank === 'Q') return 12;
        if (rank === 'J') return 11;
        if (rank === 'T') return 10;
        return parseInt(rank);
    });
    
    // Analyze hand interaction with board
    let handAnalysis = '';
    let handStrength = 0;
    let handEquity = 0;
    
    // Check for pairs with board
    let pairCount = 0;
    let pairRanks = [];
    for (let i = 0; i < handRanks.length; i++) {
        if (boardRanks.includes(handRanks[i])) {
            pairCount++;
            pairRanks.push(handRanks[i]);
        }
    }
    
    if (pairCount > 0) {
        handAnalysis += `<p><strong>Pairs with Board:</strong> You have ${pairCount} card(s) that pair with the board (${pairRanks.join(', ')}).</p>`;
        handStrength += pairCount * 10;
        handEquity += pairCount * 5;
    }
    
    // Check for two pair or better
    const allRanks = [...handRanks, ...boardRanks];
    const rankCounts = {};
    allRanks.forEach(rank => {
        rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    });
    
    const twoPairs = Object.entries(rankCounts)
        .filter(([_, count]) => count >= 2)
        .map(([rank, _]) => rank);
    
    if (twoPairs.length >= 2) {
        handAnalysis += `<p><strong>Two Pair or Better:</strong> You have ${twoPairs.length} pairs (${twoPairs.join(', ')}).</p>`;
        handStrength += 20;
        handEquity += 15;
    }
    
    // Check for trips or full house
    const trips = Object.entries(rankCounts)
        .filter(([_, count]) => count >= 3)
        .map(([rank, _]) => rank);
    
    if (trips.length > 0) {
        if (twoPairs.length >= 2) {
            handAnalysis += `<p><strong>Full House:</strong> You have trips (${trips.join(', ')}) and a pair.</p>`;
            handStrength += 60;
            handEquity += 40;
        } else {
            handAnalysis += `<p><strong>Three of a Kind:</strong> You have trips (${trips.join(', ')}).</p>`;
            handStrength += 40;
            handEquity += 25;
        }
    }
    
    // Check for flush draws and made flushes
    let flushDraws = [];
    for (let suit of ['♠', '♥', '♣', '♦']) {
        const boardSuitCount = boardSuits.filter(s => s === suit).length;
        const handSuitCount = handSuits.filter(s => s === suit).length;
        
        if (boardSuitCount + handSuitCount >= 5) {
            flushDraws.push({
                suit: suit,
                boardCount: boardSuitCount,
                handCount: handSuitCount,
                total: boardSuitCount + handSuitCount,
                isNut: handSuits.includes(suit) && handRanks[handSuits.indexOf(suit)] === 'A'
            });
        } else if (boardSuitCount >= 3 && handSuitCount >= 1) {
            flushDraws.push({
                suit: suit,
                boardCount: boardSuitCount,
                handCount: handSuitCount,
                total: boardSuitCount + handSuitCount,
                isNut: handSuits.includes(suit) && handRanks[handSuits.indexOf(suit)] === 'A',
                isDraw: true
            });
        }
    }
    
    if (flushDraws.length > 0) {
        for (let draw of flushDraws) {
            if (draw.total >= 5) {
                const nutText = draw.isNut ? ' (nut flush)' : '';
                handAnalysis += `<p><strong>Flush Made:</strong> You have a ${draw.suit} flush with ${draw.handCount} cards from your hand${nutText}.</p>`;
                handStrength += draw.isNut ? 70 : 50;
                handEquity += draw.isNut ? 45 : 35;
            } else if (draw.isDraw) {
                const nutText = draw.isNut ? ' (nut flush draw)' : '';
                handAnalysis += `<p><strong>Flush Draw:</strong> You have ${draw.handCount} ${draw.suit} card(s) with ${draw.boardCount} on the board${nutText}.</p>`;
                handStrength += draw.isNut ? 25 : 15;
                handEquity += draw.isNut ? 20 : 15;
            }
        }
    }
    
    // Check for straight possibilities
    const allRankValues = [...handRankValues, ...boardRankValues];
    // Handle Ace as both high and low
    if (allRankValues.includes(14)) {
        allRankValues.push(1);
    }
    
    const uniqueRanks = [...new Set(allRankValues)].sort((a, b) => a - b);
    
    // Find the longest straight
    let maxStraightLength = 1;
    let currentLength = 1;
    
    for (let i = 1; i < uniqueRanks.length; i++) {
        if (uniqueRanks[i] === uniqueRanks[i-1] + 1) {
            currentLength++;
            maxStraightLength = Math.max(maxStraightLength, currentLength);
        } else if (uniqueRanks[i] > uniqueRanks[i-1] + 1) {
            currentLength = 1;
        }
    }
    
    // Check if we can make a straight using exactly 2 cards from hand
    let straightPossible = false;
    let straightRanks = [];
    
    // This is a simplified check - a full implementation would be more complex
    if (maxStraightLength >= 5) {
        // Find a 5-card sequence
        for (let i = 0; i <= uniqueRanks.length - 5; i++) {
            if (uniqueRanks[i+4] === uniqueRanks[i] + 4) {
                const straightCards = uniqueRanks.slice(i, i+5);
                // Count how many cards from hand are in this straight
                const handCardsInStraight = straightCards.filter(rank => 
                    handRankValues.includes(rank)
                ).length;
                
                if (handCardsInStraight >= 2) {
                    straightPossible = true;
                    straightRanks = straightCards.map(rank => {
                        if (rank === 14 || rank === 1) return 'A';
                        if (rank === 13) return 'K';
                        if (rank === 12) return 'Q';
                        if (rank === 11) return 'J';
                        if (rank === 10) return 'T';
                        return rank.toString();
                    });
                    break;
                }
            }
        }
    }
    
    if (straightPossible) {
        handAnalysis += `<p><strong>Straight Made:</strong> You have a straight (${straightRanks.join('-')}).</p>`;
        handStrength += 45;
        handEquity += 30;
    } else if (maxStraightLength === 4) {
        handAnalysis += `<p><strong>Open-Ended Straight Draw:</strong> You need one more card for a straight.</p>`;
        handStrength += 20;
        handEquity += 15;
    }
    
    // Overall hand strength assessment
    let strengthAssessment = '';
    if (handStrength >= 70) {
        strengthAssessment = 'Very Strong';
    } else if (handStrength >= 40) {
        strengthAssessment = 'Strong';
    } else if (handStrength >= 20) {
        strengthAssessment = 'Moderate';
    } else {
        strengthAssessment = 'Weak';
    }
    
    // Calculate approximate equity
    handEquity = Math.min(Math.max(handEquity, 20), 90);
    
    // Generate strategy advice based on hand strength
    let strategyAdvice = '';
    if (handStrength >= 70) {
        strategyAdvice = 'You have a very strong hand. Consider betting for value and building the pot.';
    } else if (handStrength >= 40) {
        strategyAdvice = 'You have a strong hand. Consider betting for value but be cautious of draws.';
    } else if (handStrength >= 20) {
        strategyAdvice = 'You have a moderate hand. Consider checking or making a small bet to control the pot size.';
    } else {
        strategyAdvice = 'You have a weak hand. Consider checking and folding to significant pressure.';
    }
    
    // Display the hand analysis
    document.getElementById('board-analysis').innerHTML += `
        <div class="hand-board-analysis">
            <h4>Your Hand on This Board</h4>
            <p><strong>Hand Strength:</strong> ${strengthAssessment}</p>
            <div class="equity-estimate">
                <h4>Estimated Equity</h4>
                <div class="equity-bar">
                    <div class="equity-fill" style="width: ${handEquity}%"></div>
                    <span>${handEquity}%</span>
                </div>
            </div>
            ${handAnalysis}
            <p><strong>Strategy Advice:</strong></p>
            <p>${strategyAdvice}</p>
            <p><em>Remember in PLO you must use exactly 2 cards from your hand and 3 from the board.</em></p>
        </div>
    `;
}

function initializeRangeVisualizer() {
    const rangeGrid = document.getElementById('range-grid');
    if (!rangeGrid) return;
    
    const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
    
    // Clear existing grid
    rangeGrid.innerHTML = '';
    
    // Create PLO combination categories
    const categories = [
        {
            title: "Double Suited Aces",
            hands: [
                "AAKKds", "AAQQds", "AAJJds", "AATTds", "AA99ds", "AA88ds",
                "AAKQds", "AAKJds", "AAKTds", "AAQJds", "AAQTds", "AAJTds"
            ]
        },
        {
            title: "Single Suited Aces",
            hands: [
                "AAKKs", "AAQQs", "AAJJs", "AATTs", "AA99s", "AA88s",
                "AAKQs", "AAKJs", "AAKTs", "AAQJs", "AAQTs", "AAJTs"
            ]
        },
        {
            title: "Double Suited Kings",
            hands: [
                "KKQQds", "KKJJds", "KKTTds", "KK99ds", "KK88ds",
                "KKQJds", "KKQTds", "KKJTds", "KKT9ds"
            ]
        },
        {
            title: "Premium Rundowns",
            hands: [
                "AKQJds", "KQJTds", "QJT9ds", "JT98ds", "T987ds",
                "AKQJs", "KQJTs", "QJT9s", "JT98s", "T987s"
            ]
        },
        {
            title: "Medium Rundowns",
            hands: [
                "9876ds", "8765ds", "7654ds", "6543ds", "5432ds",
                "9876s", "8765s", "7654s", "6543s", "5432s"
            ]
        },
        {
            title: "Double Paired",
            hands: [
                "AAKK", "AAQQ", "AAJJ", "AATT", "AA99", "AA88",
                "KKQQ", "KKJJ", "KKTT", "KK99", "KK88",
                "QQJJ", "QQTT", "QQ99", "QQ88",
                "JJTT", "JJ99", "JJ88",
                "TT99", "TT88",
                "9988"
            ]
        },
        {
            title: "Three to an Ace",
            hands: [
                "AKQx", "AKJx", "AKTx", "AQJx", "AQTx", "AJTx",
                "AK9x", "AQ9x", "AJ9x", "AT9x",
                "AK8x", "AQ8x", "AJ8x", "AT8x"
            ]
        },
        {
            title: "Three to a King",
            hands: [
                "KQJx", "KQTx", "KJTx", "KT9x",
                "KQ9x", "KJ9x", "KT9x",
                "KQ8x", "KJ8x", "KT8x"
            ]
        }
    ];
    
    // Create grid with categories
    categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'plo-category';
        
        const title = document.createElement('h3');
        title.textContent = category.title;
        categoryDiv.appendChild(title);
        
        const handsGrid = document.createElement('div');
        handsGrid.className = 'hands-grid';
        
        category.hands.forEach(hand => {
            const handDiv = document.createElement('div');
            handDiv.className = 'hand-cell';
            handDiv.textContent = hand;
            handDiv.dataset.hand = hand;
            handsGrid.appendChild(handDiv);
        });
        
        categoryDiv.appendChild(handsGrid);
        rangeGrid.appendChild(categoryDiv);
    });
}

function updateRangeVisualizer(position) {
    const handCells = document.querySelectorAll('.hand-cell');
    
    // Clear previous classes
    handCells.forEach(cell => {
        cell.classList.remove('raise', 'pot', 'call', 'fold');
    });
    
    // Define comprehensive PLO ranges for each position
    const ranges = {
        'UTG': {
            'raise': [
                // Premium double suited aces
                'AAKKds', 'AAQQds', 'AAJJds', 'AAKQds',
                // Premium rundowns
                'AKQJds', 'KQJTds',
                // Top double paired
                'AAKK', 'AAQQ'
            ],
            'pot': [
                // Other double suited aces
                'AATTds', 'AAJTds', 'AAQJds',
                // Double suited kings
                'KKQQds', 'KKJJds',
                // Strong rundowns
                'QJT9ds', 'JT98ds',
                // Strong double paired
                'KKQQ', 'KKJJ'
            ],
            'call': [
                // Single suited aces
                'AAKKs', 'AAQQs', 'AAJJs',
                // Medium rundowns
                '9876ds', '8765ds',
                // Connected hands
                'KQJTs', 'QJT9s'
            ]
        },
        'MP': {
            'raise': [
                // All premium double suited aces
                'AAKKds', 'AAQQds', 'AAJJds', 'AAKQds', 'AAKJds',
                // Premium rundowns
                'AKQJds', 'KQJTds', 'QJT9ds',
                // Top double paired
                'AAKK', 'AAQQ', 'AAJJ'
            ],
            'pot': [
                // More double suited hands
                'AATTds', 'AAJTds', 'KKQQds', 'KKJJds',
                // Strong rundowns
                'JT98ds', 'T987ds',
                // Strong double paired
                'KKQQ', 'KKJJ', 'QQJJ'
            ],
            'call': [
                // Single suited aces and kings
                'AAKKs', 'AAQQs', 'AAJJs', 'KKQQs',
                // Medium rundowns
                '9876ds', '8765ds', '7654ds',
                // Connected hands
                'KQJTs', 'QJT9s', 'JT98s'
            ]
        },
        'CO': {
            'raise': [
                // All premium hands from above positions
                'AAKKds', 'AAQQds', 'AAJJds', 'AAKQds', 'AAKJds',
                'AKQJds', 'KQJTds', 'QJT9ds',
                'AAKK', 'AAQQ', 'AAJJ',
                // Additional premium hands
                'AATTds', 'KKQQds', 'JT98ds'
            ],
            'pot': [
                // More double suited and rundown hands
                'AA99ds', 'AA88ds', 'KKJJds', 'KKTTds',
                'T987ds', '9876ds',
                // More double paired
                'KKQQ', 'KKJJ', 'QQJJ', 'JJTT'
            ],
            'call': [
                // Wider range of suited and connected hands
                'AAKKs', 'AAQQs', 'AAJJs', 'KKQQs',
                '8765ds', '7654ds', '6543ds',
                'KQJTs', 'QJT9s', 'JT98s', 'T987s'
            ]
        },
        'BTN': {
            'raise': [
                // All premium hands
                'AAKKds', 'AAQQds', 'AAJJds', 'AAKQds', 'AAKJds', 'AATTds',
                'AKQJds', 'KQJTds', 'QJT9ds', 'JT98ds',
                'AAKK', 'AAQQ', 'AAJJ', 'KKQQ'
            ],
            'pot': [
                // Wide range of strong hands
                'AA99ds', 'AA88ds', 'KKJJds', 'KKTTds',
                'T987ds', '9876ds', '8765ds',
                'KKJJ', 'QQJJ', 'JJTT', 'TT99'
            ],
            'call': [
                // Very wide range of playable hands
                'AAKKs', 'AAQQs', 'AAJJs', 'KKQQs',
                '7654ds', '6543ds', '5432ds',
                'KQJTs', 'QJT9s', 'JT98s', 'T987s', '9876s'
            ]
        },
        'SB': {
            'raise': [
                // Premium hands only
                'AAKKds', 'AAQQds', 'AAJJds', 'AAKQds',
                'AKQJds', 'KQJTds',
                'AAKK', 'AAQQ'
            ],
            'pot': [
                // Strong hands
                'AATTds', 'KKQQds', 'QJT9ds',
                'KKQQ', 'KKJJ', 'QQJJ'
            ],
            'call': [
                // Selective calling range
                'AAKKs', 'AAQQs', 'AAJJs',
                'JT98ds', '9876ds',
                'KQJTs', 'QJT9s'
            ]
        },
        'BB': {
            'raise': [], // BB typically 3-bets or calls
            'pot': [
                // Strong hands to 3-bet
                'AAKKds', 'AAQQds', 'AAJJds', 'AAKQds',
                'AKQJds', 'KQJTds',
                'AAKK', 'AAQQ', 'AAJJ'
            ],
            'call': [
                // Wide defending range
                'AAKKs', 'AAQQs', 'AAJJs', 'KKQQs',
                'JT98ds', '9876ds', '8765ds', '7654ds',
                'KQJTs', 'QJT9s', 'JT98s', 'T987s',
                'KKJJ', 'QQJJ', 'JJTT', 'TT99'
            ]
        }
    };
    
    // Apply classes based on position
    handCells.forEach(cell => {
        const hand = cell.dataset.hand;
        if (ranges[position].raise.includes(hand)) {
            cell.classList.add('raise');
        } else if (ranges[position].pot.includes(hand)) {
            cell.classList.add('pot');
        } else if (ranges[position].call.includes(hand)) {
            cell.classList.add('call');
        } else {
            cell.classList.add('fold');
        }
    });
}

function initializeThemeToggle() {
    // Add theme toggle button to the header
    const header = document.querySelector('h1');
    const themeToggle = document.createElement('button');
}

function updatePostflopConsiderations(cards, position) {
    // Extract ranks and suits
    const ranks = cards.map(card => card[0]);
    const suits = cards.map(card => card.slice(1));
    
    // Count suit frequencies
    const suitCounts = {};
    suits.forEach(suit => {
        suitCounts[suit] = (suitCounts[suit] || 0) + 1;
    });
    
    // Convert ranks to numerical values
    const rankValues = ranks.map(rank => {
        if (rank === 'A') return 14;
        if (rank === 'K') return 13;
        if (rank === 'Q') return 12;
        if (rank === 'J') return 11;
        if (rank === 'T') return 10;
        return parseInt(rank);
    });
    
    // Sort rank values
    const sortedRanks = [...rankValues].sort((a, b) => b - a);
    
    // Generate postflop advice
    let postflopAdvice = '';
    
    // Flush potential
    const maxSuitedCount = Math.max(...Object.values(suitCounts));
    const dominantSuit = Object.entries(suitCounts).find(([_, count]) => count === maxSuitedCount)[0];
    
    if (maxSuitedCount >= 3) {
        postflopAdvice += `<p><strong>Strong Flush Potential:</strong> You have ${maxSuitedCount} ${dominantSuit} cards, giving you excellent flush possibilities. Look for two more ${dominantSuit} on the board.</p>`;
    } else if (maxSuitedCount === 2 && Object.values(suitCounts).filter(count => count === 2).length === 2) {
        const suits = Object.entries(suitCounts)
            .filter(([_, count]) => count === 2)
            .map(([suit, _]) => suit);
        postflopAdvice += `<p><strong>Double Flush Potential:</strong> You have two pairs of suited cards (${suits.join(' and ')}), giving you two different flush draws to look for.</p>`;
    } else if (maxSuitedCount === 2) {
        postflopAdvice += `<p><strong>Flush Draw Potential:</strong> You have two ${dominantSuit} cards, which can contribute to a flush draw if the board shows more ${dominantSuit} cards.</p>`;
    }
    
    // Straight potential
    let gapSizes = [];
    for (let i = 0; i < sortedRanks.length - 1; i++) {
        gapSizes.push(sortedRanks[i] - sortedRanks[i + 1]);
    }
    
    const hasConnected = gapSizes.some(gap => gap === 1);
    const hasOneGap = gapSizes.some(gap => gap === 2);
    const hasTwoGap = gapSizes.some(gap => gap === 3);
    
    if (hasConnected) {
        postflopAdvice += `<p><strong>Strong Straight Potential:</strong> You have connected cards which gives you excellent straight possibilities. Look for boards that connect with your hand.</p>`;
    } else if (hasOneGap) {
        postflopAdvice += `<p><strong>Moderate Straight Potential:</strong> You have cards with one-gap connections, which can still make straights with the right board cards.</p>`;
    } else if (hasTwoGap) {
        postflopAdvice += `<p><strong>Weak Straight Potential:</strong> You have cards with two-gap connections, which can occasionally make straights but require specific board cards.</p>`;
    }
    
    // Nut potential
    if (ranks.includes('A')) {
        const suitOfAce = suits[ranks.indexOf('A')];
        postflopAdvice += `<p><strong>Nut Flush Potential:</strong> Your hand contains the A${suitOfAce}, giving you the nut flush draw when three or more ${suitOfAce} appear on the board.</p>`;
    }
    
    if (sortedRanks[0] === 14 && sortedRanks[1] === 13 && sortedRanks[2] === 12 && sortedRanks[3] === 11) {
        postflopAdvice += `<p><strong>Nut Straight Potential:</strong> Your hand contains A-K-Q-J, giving you the nut straight on any Ten-high straight board.</p>`;
    } else if (sortedRanks.includes(14) && sortedRanks.includes(5) && sortedRanks.includes(4) && sortedRanks.includes(3) && sortedRanks.includes(2)) {
        postflopAdvice += `<p><strong>Wheel Straight Potential:</strong> Your hand can make the A-5-4-3-2 wheel straight.</p>`;
    }
    
    // Set potential
    const rankCounts = {};
    ranks.forEach(rank => {
        rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    });
    
    const pairs = Object.entries(rankCounts).filter(([_, count]) => count === 2);
    if (pairs.length > 0) {
        const pairRanks = pairs.map(([rank, _]) => rank).join(', ');
        postflopAdvice += `<p><strong>Set Potential:</strong> You have pairs of ${pairRanks}, giving you set potential if one of these ranks appears on the board.</p>`;
    }
    
    // PLO-specific advice
    postflopAdvice += `
        <p><strong>PLO Strategy Tips:</strong></p>
        <ul>
            <li>Remember that in PLO you must use exactly 2 cards from your hand and 3 from the board.</li>
            <li>The nuts change more frequently in PLO than in Hold'em - always be aware of the current nut hand.</li>
            <li>Position is even more important in PLO - play more cautiously out of position.</li>
            <li>Draws are more valuable in PLO due to having more outs and implied odds.</li>
            <li>Be careful with non-nut draws, especially on wet boards where opponents may have better draws.</li>
        </ul>
    `;
    
    // Display postflop considerations
    document.getElementById('postflop-content').innerHTML = `
        <div class="postflop-advice">
            <h3>Postflop Considerations</h3>
            ${postflopAdvice || '<p>No specific postflop advantages detected.</p>'}
        </div>
    `;
}
