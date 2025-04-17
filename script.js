// First, let's check if the function exists and remove it
function setupTabs() {
    // This is an empty implementation to prevent errors
    console.log("setupTabs function called but disabled");
    return; // Do nothing
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("RMF.lol initialized");
    
    // Set up card selection first
    const cardInputs = document.querySelectorAll('.card-input');
    cardInputs.forEach(input => {
        input.textContent = 'Select';
        input.style.backgroundColor = '#2c2c2c';
        
        input.addEventListener('click', function() {
            showCardSelector(this);
        });
    });
    
    // Set up position buttons
    const positionButtons = document.querySelectorAll('.position-btn');
    positionButtons.forEach(button => {
        button.addEventListener('click', function() {
            positionButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            console.log('Position selected:', this.textContent);
            if (typeof analyzeHand === 'function') {
                analyzeHand();
            }
        });
    });
    
    // Initialize sections directly without using setupTabs
    const sections = {
        'preflop': true,  // Default visible
        'postflop': false,
        'hand-simulator': false,
        'study-room': false
    };
    
    // Set initial visibility
    Object.entries(sections).forEach(([id, isVisible]) => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = isVisible ? 'block' : 'none';
        }
    });
    
    // Set up navigation
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Update visibility
            Object.keys(sections).forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.style.display = id === targetId ? 'block' : 'none';
                }
            });
        });
    });
    
    // Initialize other components with safety checks
    if (typeof initializeBoardTexture === 'function') {
        initializeBoardTexture();
    }
    
    if (typeof initializeRangeVisualizer === 'function') {
        initializeRangeVisualizer();
    }
    
    if (typeof initializeThemeToggle === 'function') {
        initializeThemeToggle();
    }
    
    // IMPORTANT: Make sure we're not calling setupTabs anywhere
    // setupTabs is now disabled
});

// Define analyzeHand if it doesn't exist
if (typeof analyzeHand !== 'function') {
    function analyzeHand() {
        console.log("Hand analysis function called");
        // Implement your hand analysis logic here
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

function showCardSelector(inputElement) {
    // Create card selector overlay
    const overlay = document.createElement('div');
    overlay.className = 'card-selector-overlay';
    
    const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
    const suits = ['♠', '♥', '♦', '♣'];
    
    const selectorContent = document.createElement('div');
    selectorContent.className = 'card-selector-content';
    
    ranks.forEach(rank => {
        suits.forEach(suit => {
            const cardOption = document.createElement('div');
            cardOption.className = 'card-option';
            cardOption.textContent = rank + suit;
            
            // Add color for hearts and diamonds
            if (suit === '♥' || suit === '♦') {
                cardOption.style.color = '#ff0000';
            }
            
            cardOption.addEventListener('click', () => {
                inputElement.textContent = rank + suit;
                inputElement.style.backgroundColor = '#333';
                if (suit === '♥' || suit === '♦') {
                    inputElement.style.color = '#ff0000';
                } else {
                    inputElement.style.color = '#ffffff';
                }
                document.body.removeChild(overlay);
                analyzeHand();
            });
            
            selectorContent.appendChild(cardOption);
        });
    });
    
    overlay.appendChild(selectorContent);
    document.body.appendChild(overlay);
    
    // Close on click outside
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
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
    const mainContent = document.querySelector('main') || document.body;
    
    // Create range visualizer section
    const rangeSection = document.createElement('div');
    rangeSection.id = 'range-visualizer';
    rangeSection.innerHTML = `
        <h2>Range Visualizer</h2>
        <div class="position-buttons">
            <button class="position-btn" data-position="UTG">UTG</button>
            <button class="position-btn" data-position="MP">MP</button>
            <button class="position-btn" data-position="CO">CO</button>
            <button class="position-btn" data-position="BTN">BTN</button>
            <button class="position-btn" data-position="SB">SB</button>
            <button class="position-btn" data-position="BB">BB</button>
        </div>
        <div id="range-grid"></div>
    `;
    mainContent.appendChild(rangeSection);
    
    createRangeGrid();
    
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

function createRangeGrid() {
    const rangeGrid = document.getElementById('range-grid');
    const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
    
    // Create header row
    const headerRow = document.createElement('div');
    headerRow.className = 'range-row';
    headerRow.innerHTML = '<div class="range-cell header"></div>' + 
        ranks.map(rank => `<div class="range-cell header">${rank}</div>`).join('');
    rangeGrid.appendChild(headerRow);
    
    // Create grid rows
    ranks.forEach(rank1 => {
        const row = document.createElement('div');
        row.className = 'range-row';
        
        // Add row header
        row.innerHTML = `<div class="range-cell header">${rank1}</div>`;
        
        // Add cells
        ranks.forEach(rank2 => {
            const cell = document.createElement('div');
            cell.className = 'range-cell';
            if (rank1 === rank2) {
                cell.dataset.hand = `${rank1}${rank1}xx`; // Double paired
                cell.textContent = `${rank1}${rank1}`;
            } else {
                cell.dataset.hand = `${rank1}${rank2}ds`; // Double suited
                cell.textContent = `${rank1}${rank2}`;
            }
            row.appendChild(cell);
        });
        
        rangeGrid.appendChild(row);
    });
}

function updateRangeVisualizer(position) {
    const rangeCells = document.querySelectorAll('.range-cell:not(.header)');
    
    // Clear previous classes
    rangeCells.forEach(cell => {
        cell.classList.remove('raise', 'pot', 'call', 'fold');
    });
    
    // Updated PLO ranges with correct hand rankings
    const ranges = {
        'UTG': {
            'raise': [
                'AKds', 'AQds', 'AJds', // Premium double suited
                'AAKKds', 'AAQQds', 'AAJJds', // Double suited aces
                'AAKK', 'AAQQ', // Double paired aces
                'KKQQds' // Premium double suited kings
            ],
            'pot': [
                'KQds', 'KJds', 'QJds', // Strong double suited
                'AATTds', 'KKJJds', 
                'KKQQ', 'KKJJ',
                'JT98ds', 'T987ds' // Premium rundowns
            ],
            'call': [
                'KTds', 'QTds', 'JTds',
                'AA99ds', 'KK99ds',
                'QQJJ', 'JJTT',
                '9876ds', '8765ds' // Connected rundowns
            ]
        },
        'MP': {
            'raise': [
                'AKds', 'AQds', 'AJds', 'KQds',
                'AAKKds', 'AAQQds', 'AAJJds',
                'AAKK', 'AAQQ', 'AAJJ',
                'KKQQds', 'KKJJds'
            ],
            'pot': [
                'KJds', 'QJds', 'JTds',
                'AATTds', 'AA99ds',
                'KKQQ', 'KKJJ', 'QQJJ',
                'JT98ds', 'T987ds', '9876ds'
            ],
            'call': [
                'KTds', 'QTds', 'T9ds',
                'KK99ds', 'QQ99ds',
                'JJTT', 'TT99',
                '8765ds', '7654ds'
            ]
        },
        'CO': {
            'raise': [
                'AKds', 'AQds', 'AJds', 'KQds', 'KJds',
                'AAKKds', 'AAQQds', 'AAJJds', 'AATTds',
                'AAKK', 'AAQQ', 'AAJJ',
                'KKQQds', 'KKJJds'
            ],
            'pot': [
                'QJds', 'JTds', 'T9ds',
                'AA99ds', 'KK99ds',
                'KKQQ', 'KKJJ', 'QQJJ', 'JJTT',
                'JT98ds', 'T987ds', '9876ds', '8765ds'
            ],
            'call': [
                '98ds', '87ds', '76ds',
                'QQ99ds', 'JJ99ds',
                'TT99', '9988',
                '7654ds', '6543ds'
            ]
        },
        'BTN': {
            'raise': [
                'AKds', 'AQds', 'AJds', 'KQds', 'KJds', 'QJds',
                'AAKKds', 'AAQQds', 'AAJJds', 'AATTds',
                'AAKK', 'AAQQ', 'AAJJ', 'AATT',
                'KKQQds', 'KKJJds', 'KKTTds'
            ],
            'pot': [
                'JTds', 'T9ds', '98ds',
                'AA99ds', 'KK99ds', 'QQ99ds',
                'KKQQ', 'KKJJ', 'QQJJ', 'JJTT',
                'JT98ds', 'T987ds', '9876ds', '8765ds'
            ],
            'call': [
                '87ds', '76ds', '65ds',
                'JJ99ds', 'TT99ds', '9988ds',
                'TT99', '9988', '8877',
                '7654ds', '6543ds', '5432ds'
            ]
        },
        'SB': {
            'raise': [
                'AKds', 'AQds', 'AJds',
                'AAKKds', 'AAQQds',
                'AAKK', 'AAQQ'
            ],
            'pot': [
                'KQds', 'KJds',
                'AAJJds', 'AATTds',
                'AAJJ', 'KKQQ',
                'JT98ds'
            ],
            'call': [
                'QJds', 'JTds',
                'KK99ds', 'QQ99ds',
                'KKJJ', 'QQJJ',
                'T987ds', '9876ds'
            ]
        },
        'BB': {
            'raise': [], // BB typically 3-bets or calls
            'pot': [
                'AKds', 'AQds', 'AJds', 'KQds',
                'AAKKds', 'AAQQds', 'AAJJds',
                'AAKK', 'AAQQ', 'AAJJ'
            ],
            'call': [
                'KJds', 'QJds', 'JTds', 'T9ds',
                'AATTds', 'KKJJds', 'QQJJds',
                'KKQQ', 'KKJJ', 'QQJJ',
                'JT98ds', 'T987ds', '9876ds', '8765ds'
            ]
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
