# IT Sentiment Analyser

**Week 3 Individual Project — AI for Data Analysis & Insights**

A browser-based sentiment analysis dashboard for IT industry feedback, powered by the Claude AI API. Analyses support tickets, vendor reviews, cloud platform feedback, dev tool comments, and cybersecurity reports.

---

## Features

- AI-powered sentiment scoring (–1.0 to +1.0) via Claude
- Five IT categories: Cloud & infra, Cybersecurity, Dev tools, IT support, Vendor feedback
- Automatic theme extraction (performance, cost, reliability, UX, security…)
- Per-category sentiment bars and overall breakdown
- AI-generated executive summary / insights report
- Dark mode support

---

## Project structure

```
it-sentiment-analyser/
├── public/
│   └── index.html       # App entry point
├── src/
│   ├── styles.css       # All styling
│   ├── data.js          # Sample dataset & category labels
│   ├── api.js           # Claude API calls (analyse + summarise)
│   ├── ui.js            # DOM rendering helpers
│   └── app.js           # Main controller & event wiring
└── README.md
```

---

## Setup in VS Code

### Prerequisites
- [VS Code](https://code.visualstudio.com/)
- [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) (by Ritwick Dey)
- A [Groq API key](https://console.groq.com/) (free tier available)

### Steps

1. **Open the project folder in VS Code**
   ```
   File → Open Folder → select it-sentiment-analyser/
   ```

2. **Add your Groq API key**

   Open `src/api.js` and replace the placeholder on line 4:
   ```js
   const API_KEY = 'gsk_...your-key-here...';
   ```

   > **Note:** For a production app, never expose your API key in frontend code.
   > Use a backend proxy (Node.js/Express) to keep it server-side.

3. **(Optional) Change the model**

   The default is `llama-3.3-70b-versatile`. Other fast Groq options:
   ```js
   const MODEL = 'mixtral-8x7b-32768';   // larger context window
   const MODEL = 'llama-3.1-8b-instant'; // fastest / cheapest
   ```

3. **Launch with Live Server**
   - Right-click `public/index.html` in the Explorer
   - Select **"Open with Live Server"**
   - The app opens at `http://127.0.0.1:5500/public/`

---

## Usage

| Action | How |
|--------|-----|
| Analyse a single entry | Fill in the form and click **Analyse entry** (or Ctrl+Enter) |
| Load sample data | Click **Load sample IT data** to populate 6 pre-built entries |
| Filter by category | Use the dropdown in the top-right |
| Generate report | Click **Generate insights report** after adding entries |
| Clear everything | Click **Clear all** |

---

## How it works

1. User submits IT feedback text with a category and source label
2. `api.js → analyseEntries()` sends a structured prompt to Claude asking for sentiment, score, themes, and a one-line insight
3. Claude returns a JSON array; the app merges results with the original entries
4. `ui.js` renders metric cards, bar charts, theme cloud, and the results list
5. `api.js → generateSummary()` sends all results to Claude for an executive paragraph

---

## Technologies

- **Vanilla HTML/CSS/JS** — no build tools required
- **Claude API** (`claude-sonnet-4-20250514`) — sentiment analysis & summarisation
- **Live Server** — local development server

---

## Portfolio notes

This project demonstrates:
- Consuming a live AI API from the browser
- Prompt engineering for structured JSON output
- Modular JavaScript architecture (data / api / ui / app separation)
- Responsive CSS with dark mode support
- IT domain knowledge applied to NLP tasks
