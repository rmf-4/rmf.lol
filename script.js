console.log("RYFR Trading initialized");

const API_KEY = 'cl0tqbhr01qjqc6gk2egcl0tqbhr01qjqc6gk2f0';

async function updateAllPrices() {
    const stocks = [
        { symbol: 'RKLB', entry: 8.92 },
        { symbol: 'PLTR', entry: 31.28 },
        { symbol: 'HUT', entry: 19.61 },
        { symbol: 'CVNA', entry: 113.48 },
        { symbol: 'AI', entry: 27.32 },
        { symbol: 'LCID', entry: 2.03 }
    ];

    for (const stock of stocks) {
        try {
            const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${API_KEY}`, {
                headers: {
                    'X-Finnhub-Token': API_KEY
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.c) {
                const currentPrice = data.c;
                const priceElement = document.querySelector(`#${stock.symbol}-price`);
                const gainElement = document.querySelector(`#${stock.symbol}-gain`);
                
                if (priceElement) {
                    priceElement.textContent = `$${currentPrice.toFixed(2)}`;
                }
                
                if (gainElement) {
                    const gainPercent = ((currentPrice - stock.entry) / stock.entry * 100).toFixed(2);
                    gainElement.textContent = `${gainPercent}%`;
                    gainElement.className = `gain-loss ${gainPercent >= 0 ? 'positive' : 'negative'}`;
                }
            }
        } catch (error) {
            console.error(`Error updating ${stock.symbol}:`, error);
        }
    }
}

// Initial update when page loads
document.addEventListener('DOMContentLoaded', updateAllPrices);

// Update prices every 10 seconds
setInterval(updateAllPrices, 10000);
