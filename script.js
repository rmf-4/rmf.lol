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
    
    // Initialize study tools
    initializeStudyTools();
});

function setupTabs() {
    // Add tab navigation
    const nav = document.querySelector('nav');
    nav.innerHTML = `
        <a href="#hand-selector" class="tab active" data-tab="hand-selector">Hand Analysis</a>
        <a href="#range-visualizer" class="tab" data-tab="range-visualizer">Range Visualizer</a>
        <a href="#board-texture" class="tab" data-tab="board-texture">Board Texture</a>
        <a href="#study-tools" class="tab" data-tab="study-tools">Study Tools</a>
    `;
    
    // Add tab sections if they don't exist
    const mainContent = document.querySelector('body');
    
    if (!document.getElementById('range-visualizer')) {
        const rangeSection = document.createElement('section');
        rangeSection.id = 'range-visualizer';
        rangeSection.className = 'tab-content';
        rangeSection.style.display = 'none';
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
            <div class="range-grid-container">
                <div id="range-grid"></div>
            </div>
            <div class="range-legend">
                <div class="legend-item"><span class="legend-color raise"></span> Raise</div>
                <div class="legend-item"><span class="legend-color pot"></span> Pot</div>
                <div class="legend-item"><span class="legend-color call"></span> Call</div>
                <div class="legend-item"><span class="legend-color fold"></span> Fold</div>
            </div>
        `;
        mainContent.appendChild(rangeSection);
    }
    
    if (!document.getElementById('board-texture')) {
        const boardSection = document.createElement('section');
        boardSection.id = 'board-texture';
        boardSection.className = 'tab-content';
        boardSection.style.display = 'none';
        boardSection.innerHTML = `
            <h2>Board Texture Analysis</h2>
            <div class="board-cards">
                <div class="card-input board-card" id="flop1">Flop 1</div>
                <div class="card-input board-card" id="flop2">Flop 2</div>
                <div class="card-input board-card" id="flop3">Flop 3</div>
                <div class="card-input board-card" id="turn">Turn</div>
                <div class="card-input board-card" id="river">River</div>
            </div>
            <button id="analyze-board" class="action-button">Analyze Board</button>
            <div id="board-analysis"></div>
        `;
        mainContent.appendChild(boardSection);
    }
    
    // Set up tab switching
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content, section');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(content => {
                if (content.id) {
                    content.style.display = 'none';
                }
            });
            
            // Show selected tab content
            const tabId = this.getAttribute('data-tab');
            const selectedContent = document.getElementById(tabId);
            if (selectedContent) {
                selectedContent.style.display = 'block';
            }
        });
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
            <div class="equity-estimate">
                <h4>Estimated Equity vs Random Hand</h4>
                <div class="equity-bar">
                    <div class="equity-fill" style="width: ${Math.min(Math.max(handStrength * 0.8, 40), 80)}%"></div>
                    <span>${Math.min(Math.max(handStrength * 0.8, 40), 80).toFixed(1)}%</span>
                </div>
            </div>
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
            <button id="save-hand" class="action-button">Save Hand</button>
        </div>
    `;
    
    // Add event listener to save hand button
    document.getElementById('save-hand').addEventListener('click', function() {
        saveHandToHistory(cards, position, action, handStrength);
    });
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
    
    const turnCard = document.getElementById('turn').textContent;
    const riverCard = document.getElementById('river').textContent;
    
    let boardCards = [...flopCards];
    if (turnCard !== 'Turn') boardCards.push(turnCard);
    if (riverCard !== 'River') boardCards.push(riverCard);
    
    // Get hand cards
    const handCards = Array.from(document.querySelectorAll('.card-input:not(.board-card)'))
        .map(input => input.textContent)
        .filter(card => card !== 'Select');
    
    // Analyze board texture
    const boardRanks = boardCards.map(card => card[0]);
    const boardSuits = boardCards.map(card => card.slice(1));
    
    // Check for paired board
    const boardRankCounts = {};
    boardRanks.forEach(rank => {
        boardRankCounts[rank] = (boardRankCounts[rank] || 0) + 1;
    });
    
    const pairedBoard = Object.values(boardRankCounts).some(count => count >= 2);
    const tripBoard = Object.values(boardRankCounts).some(count => count >= 3);
    
    // Check for flush possibilities
    const boardSuitCounts = {};
    boardSuits.forEach(suit => {
        boardSuitCounts[suit] = (boardSuitCounts[suit] || 0) + 1;
    });
    
    const flushPossible = Object.values(boardSuitCounts).some(count => count >= 3);
    const flushDraw = Object.values(boardSuitCounts).some(count => count === 3);
    const flushComplete = Object.values(boardSuitCounts).some(count => count >= 4);
    
    // Check for straight possibilities
    const boardRankValues = boardRanks.map(rank => {
        if (rank === 'A') return 14;
        if (rank === 'K') return 13;
        if (rank === 'Q') return 12;
        if (rank === 'J') return 11;
        if (rank === 'T') return 10;
        return parseInt(rank);
    });
    
    const sortedBoardRanks = [...boardRankValues].sort((a, b) => a - b);
    const straightPossible = sortedBoardRanks[sortedBoardRanks.length - 1] - sortedBoardRanks[0] <= 4 || 
                            (sortedBoardRanks.includes(14) && sortedBoardRanks.includes(2)); // A-5 straight
    
    // Generate board analysis
    let boardAnalysis = `<div class="board-analysis-result">`;
    boardAnalysis += `<h3>Board: ${boardCards.join(' ')}</h3>`;
    
    // Board texture description
    boardAnalysis += `<h4>Board Texture</h4><ul>`;
    
    if (tripBoard) {
        boardAnalysis += `<li>The board is paired with trips.</li>`;
    } else if (pairedBoard) {
        boardAnalysis += `<li>The board is paired.</li>`;
    } else {
        boardAnalysis += `<li>The board is unpaired.</li>`;
    }
    
    if (flushComplete) {
        const flushSuit = Object.entries(boardSuitCounts).find(([suit, count]) => count >= 4)[0];
        boardAnalysis += `<li>There is a flush possible with ${flushSuit}.</li>`;
    } else if (flushDraw) {
        const flushSuit = Object.entries(boardSuitCounts).find(([suit, count]) => count === 3)[0];
        boardAnalysis += `<li>There is a flush draw with ${flushSuit}.</li>`;
    }
    
    if (straightPossible) {
        boardAnalysis += `<li>There are straight possibilities on this board.</li>`;
    }
    
    // Board wetness
    let wetness = 0;
    if (pairedBoard) wetness += 1;
    if (flushPossible) wetness += 2;
    if (straightPossible) wetness += 2;
    
    let wetnessDescription = '';
    if (wetness >= 4) wetnessDescription = 'very wet';
    else if (wetness >= 2) wetnessDescription = 'moderately wet';
    else wetnessDescription = 'dry';
    
    boardAnalysis += `<li>Overall, this is a <strong>${wetnessDescription}</strong> board.</li>`;
    boardAnalysis += `</ul>`;
    
    // Hand interaction with board
    if (handCards.length === 4) {
        boardAnalysis += `<h4>Your Hand on This Board</h4>`;
        
        const allCards = [...handCards, ...boardCards];
        const allRanks = allCards.map(card => card[0]);
        const allSuits = allCards.map(card => card.slice(1));
        
        // Check for made hands
        const allRankCounts = {};
        allRanks.forEach(rank => {
            allRankCounts[rank] = (allRankCounts[rank] || 0) + 1;
        });
        
        const hasPair = Object.values(allRankCounts).some(count => count >= 2);
        const hasTrips = Object.values(allRankCounts).some(count => count >= 3);
        const hasQuads = Object.values(allRankCounts).some(count => count >= 4);
        
        const allSuitCounts = {};
        allSuits.forEach(suit => {
            allSuitCounts[suit] = (allSuitCounts[suit] || 0) + 1;
        });
        
        const hasFlush = Object.values(allSuitCounts).some(count => count >= 5);
        const hasFlushDraw = Object.values(allSuitCounts).some(count => count === 4);
        
        boardAnalysis += `<ul>`;
        
        if (hasQuads) {
            boardAnalysis += `<li>You have four of a kind!</li>`;
        } else if (hasTrips) {
            boardAnalysis += `<li>You have three of a kind.</li>`;
        } else if (hasPair) {
            boardAnalysis += `<li>You have a pair.</li>`;
        }
        
        if (hasFlush) {
            boardAnalysis += `<li>You have a flush!</li>`;
        } else if (hasFlushDraw) {
            boardAnalysis += `<li>You have a flush draw.</li>`;
        }
        
        boardAnalysis += `</ul>`;
        
        // Strategy advice
        boardAnalysis += `<h4>Strategy Advice</h4><ul>`;
        
        if (wetnessDescription === 'very wet') {
            boardAnalysis += `<li>On this wet board, be cautious with marginal hands as many draws are possible.</li>`;
            if (hasTrips || hasFlush) {
                boardAnalysis += `<li>With your strong made hand, bet for value but be aware of possible better hands.</li>`;
            } else if (hasPair) {
                boardAnalysis += `<li>A single pair is vulnerable on this board. Consider checking or betting small.</li>`;
            }
        } else if (wetnessDescription === 'moderately wet') {
            boardAnalysis += `<li>This board has some draw possibilities but isn't extremely dangerous.</li>`;
            if (hasTrips || hasFlush) {
                boardAnalysis += `<li>With your strong hand, bet for value.</li>`;
            }
        } else {
            boardAnalysis += `<li>This dry board favors the player with the strongest made hand.</li>`;
            if (hasPair) {
                boardAnalysis += `<li>Even a pair has good value on this dry board.</li>`;
            }
        }
        
        boardAnalysis += `</ul>`;
    }
    
    boardAnalysis += `</div>`;
    
    document.getElementById('board-analysis').innerHTML = boardAnalysis;
}

function initializeRangeVisualizer() {
    const rangeGrid = document.getElementById('range-grid');
    if (!rangeGrid) return;
    
    const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
    
    // Create grid
    let gridHTML = '';
    for (let i = 0; i < ranks.length; i++) {
        for (let j = 0; j < ranks.length; j++) {
            const hand = ranks[i] + ranks[j];
            gridHTML += `<div class="range-cell" data-hand="${hand}">${hand}</div>`;
        }
    }
    
    rangeGrid.innerHTML = gridHTML;
    
    // Set up position buttons in range visualizer
    const rangePositionButtons = document.querySelectorAll('.range-positions .position-btn');
    rangePositionButtons.forEach(button => {
        button.addEventListener('click', function() {
            rangePositionButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            updateRangeVisualizer(this.dataset.position);
        });
    });
    
    // Default to UTG range
    updateRangeVisualizer('UTG');
}

function updateRangeVisualizer(position) {
    const rangeCells = document.querySelectorAll('.range-cell');
    
    // Clear previous classes
    rangeCells.forEach(cell => {
        cell.className = 'range-cell';
    });
    
    // Define hand ranges for each position
    const ranges = {
        'UTG': {
            'raise': ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AK'],
            'pot': ['99', '88', 'AQ', 'AJ', 'KQ'],
            'call': ['77', '66', 'AT', 'KJ', 'QJ'],
            'fold': []  // Everything else is fold
        },
        'MP': {
            'raise': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AK', 'AQ'],
            'pot': ['88', '77', 'AJ', 'AT', 'KQ', 'KJ'],
            'call': ['66', '55', 'A9', 'KT', 'QJ', 'QT', 'JT'],
            'fold': []
        },
        'CO': {
            'raise': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AK', 'AQ', 'AJ'],
            'pot': ['77', '66', '55', 'AT', 'A9', 'KQ', 'KJ', 'KT', 'QJ'],
            'call': ['44', '33', '22', 'A8', 'A7', 'K9', 'QT', 'Q9', 'JT', 'J9', 'T9'],
            'fold': []
        },
        'BTN': {
            'raise': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AK', 'AQ', 'AJ', 'AT', 'KQ', 'KJ'],
            'pot': ['66', '55', '44', 'A9', 'A8', 'A7', 'KT', 'K9', 'QJ', 'QT', 'Q9', 'JT'],
            'call': ['33', '22', 'A6', 'A5', 'A4', 'A3', 'A2', 'K8', 'K7', 'K6', 'Q8', 'J9', 'J8', 'T9', 'T8', '98'],
            'fold': []
        },
        'SB': {
            'raise': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AK', 'AQ', 'AJ'],
            'pot': ['77', '66', '55', 'AT', 'A9', 'KQ', 'KJ', 'KT', 'QJ', 'QT'],
            'call': ['44', '33', '22', 'A8', 'A7', 'A6', 'K9', 'K8', 'Q9', 'Q8', 'JT', 'J9', 'T9', '98'],
            'fold': []
        },
        'BB': {
            'raise': [],  // BB typically calls or raises as a 3-bet
            'pot': ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AK', 'AQ'],
            'call': ['99', '88', '77', '66', '55', '44', '33', '22', 'AJ', 'AT', 'A9', 'A8', 'A7', 'A6', 'A5', 'A4', 'A3', 'A2',
                    'KQ', 'KJ', 'KT', 'K9', 'K8', 'K7', 'K6', 'K5', 'K4', 'K3', 'K2',
                    'QJ', 'QT', 'Q9', 'Q8', 'Q7', 'Q6', 'Q5', 'Q4', 'Q3', 'Q2',
                    'JT', 'J9', 'J8', 'J7', 'J6', 'J5', 'J4', 'J3', 'J2',
                    'T9', 'T8', 'T7', 'T6', 'T5', 'T4', 'T3', 'T2',
                    '98', '97', '96', '95', '94', '93', '92',
                    '87', '86', '85', '84', '83', '82',
                    '76', '75', '74', '73', '72',
                    '65', '64', '63', '62',
                    '54', '53', '52',
                    '43', '42',
                    '32'],
            'fold': []
        }
    };
    
    // Apply classes based on position
    rangeCells.forEach(cell => {
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
