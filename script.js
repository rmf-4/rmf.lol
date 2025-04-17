console.log("RMF.lol initialized");

// Firebase configuration
const firebaseConfig = {
    // Add your Firebase config here
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Complete PLO Hand Rankings
const PLOHandRankings = {
    tier1: {
        doubleSuited: [
            { hand: 'AAKKds', equity: 0.82, description: 'Premium double-suited aces' },
            { hand: 'AAQQds', equity: 0.79, description: 'Premium double-suited aces' },
            // Add more hands
        ],
        singleSuited: [
            { hand: 'AAKKss', equity: 0.78, description: 'Premium single-suited aces' },
            // Add more hands
        ],
        rainbow: [
            { hand: 'AAKKr', equity: 0.75, description: 'Premium rainbow aces' },
            // Add more hands
        ]
    },
    tier2: {
        // Similar structure for other tiers
    }
};

// Equity Calculator
class EquityCalculator {
    constructor() {
        this.deck = this.generateDeck();
    }

    generateDeck() {
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
        const suits = ['h', 'd', 'c', 's'];
        return ranks.flatMap(r => suits.map(s => r + s));
    }

    calculateEquity(hand1, hand2, board = []) {
        // Monte Carlo simulation for equity calculation
        const iterations = 10000;
        let wins = 0;

        for (let i = 0; i < iterations; i++) {
            const result = this.runSimulation(hand1, hand2, board);
            if (result === 1) wins++;
        }

        return wins / iterations;
    }

    runSimulation(hand1, hand2, board) {
        // Implement PLO hand comparison logic
        // Return 1 if hand1 wins, 0 if hand2 wins, 0.5 for tie
    }
}

// User Authentication
class UserAuth {
    constructor() {
        this.user = null;
        this.setupAuthListeners();
    }

    async signUp(email, password) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            this.user = userCredential.user;
            return this.user;
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    }

    async signIn(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            this.user = userCredential.user;
            return this.user;
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    }

    setupAuthListeners() {
        auth.onAuthStateChanged(user => {
            this.user = user;
            if (user) {
                this.loadUserData();
            }
        });
    }
}

// Hand History Database
class HandHistory {
    constructor(userId) {
        this.userId = userId;
    }

    async saveHand(handData) {
        try {
            await db.collection('hands').add({
                userId: this.userId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                ...handData
            });
        } catch (error) {
            console.error('Error saving hand:', error);
            throw error;
        }
    }

    async getHandHistory() {
        try {
            const snapshot = await db.collection('hands')
                .where('userId', '==', this.userId)
                .orderBy('timestamp', 'desc')
                .limit(100)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting hand history:', error);
            throw error;
        }
    }
}

// Quiz System
class PLOQuiz {
    constructor() {
        this.quizzes = {
            preflop: [
                {
                    id: 1,
                    hand: ['Ah', 'Ad', 'Ks', 'Kc'],
                    position: 'UTG',
                    question: 'What is the correct play?',
                    options: ['Raise 2.5x', 'Raise 3x', 'Raise 4x', 'Fold'],
                    correct: 2,
                    explanation: 'AAKKds is a premium hand that should be raised 3x from UTG.'
                },
                // Add more quiz questions
            ],
            postflop: [
                {
                    id: 1,
                    hand: ['Ah', 'Ad', 'Ks', 'Kc'],
                    board: ['Qh', 'Jh', 'Td'],
                    position: 'BTN',
                    question: 'What is your equity on this board?',
                    options: ['25-35%', '35-45%', '45-55%', '55%+'],
                    correct: 3,
                    explanation: 'You have the nut flush draw and straight draws.'
                },
                // Add more quiz questions
            ]
        };
    }

    getRandomQuiz(type) {
        const quizzes = this.quizzes[type];
        return quizzes[Math.floor(Math.random() * quizzes.length)];
    }

    checkAnswer(quizId, answer) {
        // Implement answer checking logic
    }
}

// Now we can use the auth and db objects that were made global
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Test Firebase connection
        const auth = window.auth;
        const db = window.db;
        
        console.log('Firebase initialized successfully');
        
        // Initialize your app
        initializeApp();
    } catch (error) {
        console.error('Error initializing Firebase:', error);
    }
});

function initializeApp() {
    // Add authentication UI
    const authUI = document.createElement('div');
    authUI.innerHTML = `
        <div class="auth-container">
            <input type="email" id="email" placeholder="Email">
            <input type="password" id="password" placeholder="Password">
            <button id="signIn">Sign In</button>
            <button id="signUp">Sign Up</button>
        </div>
    `;
    document.body.prepend(authUI);

    // Add event listeners
    document.getElementById('signIn').addEventListener('click', signIn);
    document.getElementById('signUp').addEventListener('click', signUp);
}

async function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
        console.log('Signed in:', userCredential.user);
        // Handle successful sign in
    } catch (error) {
        console.error('Sign in error:', error);
        // Handle errors
    }
}

async function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
        console.log('Signed up:', userCredential.user);
        // Handle successful sign up
    } catch (error) {
        console.error('Sign up error:', error);
        // Handle errors
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const NEWS_API_KEY = '7df5dc02304a40bfa1e4961141cc5ae2';
    const analyzeBtn = document.getElementById('analyzeBtn');
    const stockInput = document.getElementById('stockInput');
    const results = document.getElementById('results');

    const auth = new UserAuth();
    const equityCalc = new EquityCalculator();
    const quiz = new PLOQuiz();
    
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
