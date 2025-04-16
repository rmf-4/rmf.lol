console.log("RYFR Trading initialized");

document.addEventListener('DOMContentLoaded', () => {
    const NEWS_API_KEY = '7df5dc02304a40bfa1e4961141cc5ae2';
    const analyzeBtn = document.getElementById('analyzeBtn');
    const stockInput = document.getElementById('stockInput');
    const results = document.getElementById('results');

    analyzeBtn.addEventListener('click', async () => {
        const symbol = stockInput.value.toUpperCase();
        if (!symbol) return;

        try {
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = 'Analyzing...';
            
            // Fetch news data
            const newsData = await fetchNewsData(symbol);
            const redditData = await fetchRedditSentiment(symbol);
            
            // Calculate overall sentiment
            const overallScore = calculateOverallSentiment(newsData.sentiment, redditData.sentiment);
            
            // Update UI
            updateUI(symbol, newsData, redditData, overallScore);
            
            results.classList.remove('hidden');
        } catch (error) {
            console.error('Error:', error);
            alert('Error analyzing sentiment. Please try again.');
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = 'Analyze';
        }
    });

    async function fetchNewsData(symbol) {
        try {
            const response = await fetch(
                `https://newsapi.org/v2/everything?q=${symbol}&apiKey=${NEWS_API_KEY}&pageSize=20&language=en&sortBy=publishedAt`
            );
            const data = await response.json();
            
            if (data.status !== 'ok') {
                throw new Error('News API request failed');
            }

            const articles = data.articles.map(article => ({
                title: article.title,
                description: article.description,
                url: article.url,
                sentiment: 'neutral' // You can add sentiment analysis here
            }));

            return {
                articles,
                sentiment: calculateNewsSentiment(articles)
            };
        } catch (error) {
            console.error('News API Error:', error);
            return {
                articles: [],
                sentiment: 50 // Neutral sentiment as fallback
            };
        }
    }
});

function calculateNewsSentiment(articles) {
    // Simple sentiment calculation (replace with more sophisticated analysis)
    return 50 + (Math.random() * 50 - 25);
}

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
