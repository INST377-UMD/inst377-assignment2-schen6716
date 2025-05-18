// API Key 
const POLYGON_API_KEY = 'nvCcfC82wqz2GnQbOcaKPUQh0j8dzl9W';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Chart setup
    let stockChart = null;
    const ctx = document.getElementById('stock-chart').getContext('2d');
    
    // Initialize chart with empty data
    initializeChart();
    
    // Time range buttons
    const timeRangeBtns = document.querySelectorAll('.time-range-btn');
    timeRangeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            timeRangeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Get current ticker and fetch data
            const ticker = document.getElementById('stock-ticker').value.trim();
            const days = parseInt(this.dataset.days);
            if (ticker) {
                fetchStockData(ticker, days);
            }
        });
    });

    // Search button
    document.getElementById('search-stock').addEventListener('click', function() {
        const ticker = document.getElementById('stock-ticker').value.trim();
        if (ticker) {
            const days = document.querySelector('.time-range-btn.active').dataset.days;
            fetchStockData(ticker, parseInt(days));
        } else {
            alert('Please enter a stock ticker');
        }
    });

    // Initial load with default stock (AAPL)
    fetchStockData('AAPL', 30);
    fetchRedditStocks();
    
    // Voice commands setup
    setupVoiceCommands();
    
    // Audio control buttons
    document.getElementById('audio-on').addEventListener('click', function() {
        // First request microphone permission
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => {
                annyang.start({ autoRestart: true, continuous: false });
                alert("Voice commands activated! Try saying 'Lookup AAPL'");
            })
            .catch(err => {
                console.error("Microphone error:", err);
                alert("Could not access microphone. Please check permissions.");
            });
    });
    
    document.getElementById('audio-off').addEventListener('click', function() {
        annyang.abort();
        alert("Voice commands deactivated");
    });
}); // This was the missing closing parenthesis

// Voice Command Setup
function setupVoiceCommands() {
    // Check if Annyang is available
    if (typeof annyang === 'undefined') {
        console.warn("Annyang not loaded - voice commands disabled");
        return;
    }

    // Define commands
    const commands = {
        'hello': function() {
            alert("Hello! Voice commands are working!");
        },
        'change the color to *color': function(color) {
            document.body.style.backgroundColor = color.toLowerCase();
        },
        'navigate to *page': function(page) {
            page = page.toLowerCase();
            if (['home', 'stocks', 'dogs'].includes(page)) {
                window.location.href = page === 'home' ? 'home.html' : `${page}.html`;
            }
        },
        'lookup *stock': function(stock) {
            const ticker = stock.toUpperCase();
            document.getElementById('stock-ticker').value = ticker;
            const days = document.querySelector('.time-range-btn.active').dataset.days;
            fetchStockData(ticker, parseInt(days));
        }
    };

    // Add commands
    annyang.addCommands(commands);

    // Debugging callbacks
    annyang.addCallback('start', () => console.log("Voice recognition started"));
    annyang.addCallback('end', () => console.log("Voice recognition ended"));
    annyang.addCallback('error', (err) => console.error("Voice error:", err));
    annyang.addCallback('errorNetwork', (err) => console.error("Network error:", err));
    annyang.addCallback('errorPermissionBlocked', () => {
        alert("Microphone access blocked. Please enable it in browser settings.");
    });
    annyang.addCallback('errorPermissionDenied', () => {
        alert("Microphone access denied. Please allow microphone access.");
    });
}

function initializeChart() {
    stockChart = new Chart(document.getElementById('stock-chart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Closing Price',
                data: [],
                borderColor: '#d94f33',
                backgroundColor: 'rgba(217, 79, 51, 0.1)',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Stock Price History'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price ($)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}

async function fetchStockData(ticker, days) {
    try {
        // Show loading state
        document.getElementById('stock-chart').style.opacity = '0.5';
        
        // Calculate date range
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);
        
        // Format dates for API (YYYY-MM-DD)
        const formatDate = (date) => date.toISOString().split('T')[0];
        const fromStr = formatDate(fromDate);
        const toStr = formatDate(toDate);
        
        // Fetch data from Polygon.io
        const response = await fetch(
            `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${fromStr}/${toStr}?adjusted=true&sort=asc&apiKey=${POLYGON_API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            throw new Error('No data available for this time period');
        }
        
        // Process data for chart
        const chartData = data.results.map(item => ({
            date: new Date(item.t).toLocaleDateString(),
            price: item.c
        }));
        
        // Update chart
        updateChart(chartData, ticker);
        
    } catch (error) {
        console.error('Error fetching stock data:', error);
        alert(`Error loading stock data: ${error.message}`);
    } finally {
        document.getElementById('stock-chart').style.opacity = '1';
    }
}

function updateChart(data, ticker) {
    const chart = Chart.getChart('stock-chart');
    
    // Update chart data
    chart.data.labels = data.map(item => item.date);
    chart.data.datasets[0].data = data.map(item => item.price);
    chart.data.datasets[0].label = `${ticker} Closing Price`;
    
    // Update chart title
    chart.options.plugins.title.text = `${ticker} Price History`;
    
    chart.update();
}

// fetchRedditStocks function
function fetchRedditStocks() {
    // Sample data - replace with actual API call
    const stocks = [
        { ticker: 'AMC', comments: 53, sentiment: 'Bullish' },
        { ticker: 'TSLA', comments: 27, sentiment: 'Bullish' },
        { ticker: 'GME', comments: 42, sentiment: 'Bullish' },
        { ticker: 'AAPL', comments: 18, sentiment: 'Bearish' },
        { ticker: 'MSFT', comments: 15, sentiment: 'Bullish' }
    ];

    const tableBody = document.querySelector('#reddit-stocks tbody');
    tableBody.innerHTML = '';

    stocks.forEach(stock => {
        const row = document.createElement('tr');
        
        // Ticker with link
        const tickerCell = document.createElement('td');
        const link = document.createElement('a');
        link.href = `https://finance.yahoo.com/quote/${stock.ticker}`;
        link.target = '_blank';
        link.textContent = stock.ticker;
        tickerCell.appendChild(link);
        row.appendChild(tickerCell);
        
        // Comment count
        const commentCell = document.createElement('td');
        commentCell.textContent = stock.comments;
        row.appendChild(commentCell);
        
        // Sentiment with custom icon
        const sentimentCell = document.createElement('td');
        const icon = document.createElement('img');
        icon.className = 'sentiment-icon';
        icon.alt = stock.sentiment;
        
        if (stock.sentiment === 'Bullish') {
            icon.src = 'https://static.thenounproject.com/png/3328202-200.png';
            sentimentCell.classList.add('sentiment-bullish');
        } else {
            icon.src = 'https://cdn.iconscout.com/icon/premium/png-256-thumb/bearish-1850183-1570390.png';
            sentimentCell.classList.add('sentiment-bearish');
        }
        
        sentimentCell.appendChild(icon);
        sentimentCell.appendChild(document.createTextNode(` ${stock.sentiment}`));
        row.appendChild(sentimentCell);
        
        tableBody.appendChild(row);
    });
}