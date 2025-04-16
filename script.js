console.log("RYFR Trading initialized");

document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const stockInput = document.getElementById('stockInput');
    const results = document.getElementById('results');

    analyzeBtn.addEventListener('click', async () => {
        const symbol = stockInput.value.toUpperCase();
        if (!symbol) return;

        try {
            // Show loading state
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = 'Analyzing...';

            // Simulate API call (replace with actual sentiment analysis API)
            const sentiment = await analyzeSentiment(symbol);
            
            // Update UI
            document.getElementById('stockSymbol').textContent = symbol;
            document.getElementById('sentimentScore').textContent = sentiment.score;
            
            // Update sentiment bars
            updateSentimentBar('newsSentiment', sentiment.news);
            updateSentimentBar('socialSentiment', sentiment.social);
            
            results.classList.remove('hidden');
        } catch (error) {
            console.error('Error:', error);
            alert('Error analyzing sentiment. Please try again.');
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = 'Analyze';
        }
    });
});

function updateSentimentBar(elementId, value) {
    const bar = document.getElementById(elementId);
    const innerBar = document.createElement('div');
    innerBar.style.width = `${value}%`;
    bar.innerHTML = '';
    bar.appendChild(innerBar);
}

// Simulate sentiment analysis (replace with actual API call)
async function analyzeSentiment(symbol) {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    return {
        score: (Math.random() * 100).toFixed(1),
        news: Math.random() * 100,
        social: Math.random() * 100
    };
}
