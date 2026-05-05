# Assignment 02 — AI Agent CLI Tool 🤖

> A conversational CLI agent that reasons step-by-step to clone the Scaler Academy website, generating production-quality HTML, CSS, and JavaScript files.

---

## 🎬 Demo

> **YouTube:** _[Add your 2–3 min demo link here]_

---

## ✨ Features

| Feature | Description |
|---|---|
| **Agent Loop** | START → THINK → TOOL → OBSERVE → OUTPUT — never completes in one shot |
| **Colored Output** | Every reasoning step is rendered with unique color + icon in the terminal |
| **File Tools** | `createDirectory`, `writeFile`, `readFile`, `listFiles`, `executeCommand` |
| **Safety Guard** | Blocks destructive shell commands; caps file reads to prevent token overflow |
| **Conversational CLI** | Natural language input, persistent chat session, type `exit` to quit |
| **Scaler Clone** | Generates a pixel-close HTML/CSS/JS clone of the Scaler Academy homepage |

---

## 🚀 Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/PRAteek-singHWY/persona-based-scaler_chatbot.git
cd persona-based-scaler_chatbot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set your OpenAI API key

```bash
cp .env.example .env
# Edit .env and paste your key:  OPENAI_API_KEY=sk-...
```

### 4. Run the agent

```bash
npm start
```

### 5. Give the agent an instruction

```
You › Clone the Scaler Academy website into a folder called scaler_clone
```

The agent will:
1. **START** — understand the task
2. **THINK** — plan which tools to use and in what order
3. **TOOL** — create the directory, write HTML, CSS, JS files
4. **OBSERVE** — verify each file was written successfully
5. **OUTPUT** — summarise what was built and how to open it

---

## 🗂 Project Structure

```
02-scaler-ai-agent-cli/
├── agent.js           ← Main CLI entry point & agent loop
├── tools/
│   └── fileTools.js   ← All tools the agent can use
├── .env.example       ← Environment variable template
├── package.json
└── README.md
```

---

## 🔧 Available Tools

| Tool | Signature | Description |
|---|---|---|
| `createDirectory` | `(path)` | Creates a directory recursively |
| `writeFile` | `(path, content)` | Writes/overwrites a file |
| `readFile` | `(path)` | Returns file contents (capped at 4 KB) |
| `listFiles` | `(path)` | Lists directory contents |
| `executeCommand` | `(cmd)` | Runs any shell command |

---

## 🧠 Agent Loop Architecture

```
User Input
    │
    ▼
 [START]  ──→  Understand the task
    │
    ▼
 [THINK]  ──→  Plan the next action (repeats multiple times)
    │
    ▼
 [TOOL]   ──→  Call a filesystem or shell tool
    │
    ▼
[OBSERVE] ──→  Read tool result, adjust plan
    │
    ▼
 [THINK]  ──→  Plan next action (loop continues)
    ...
    │
    ▼
[OUTPUT]  ──→  Final summary, agent exits
```

---

## 📄 Scaler Clone Output

The generated `index.html` includes:

- **Header** — Sticky nav with Scaler logo, nav links, and an orange "Request A Callback" CTA button
- **Hero Section** — Bold headline, sub-headline, dual CTA buttons, animated gradient background, and stats row (37K+ learners, 900+ partners)
- **Features Strip** — AI-Integrated Curriculum, Fundamentals First, Lifelong Learning cards
- **Footer** — Four-column link grid, social icons, copyright line

---

## 🎨 Marking Scheme

| Criterion | Marks |
|---|---|
| GitHub Repository | 2 |
| YouTube Demo Video | 2 |
| Agent Loop & Reasoning | 2 |
| Quality of Cloned Website | 2 |
| Code Quality & Documentation | 2 |
| **Total** | **10** |

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `openai` | GPT-4o-mini API calls |
| `dotenv` | Load `.env` secrets |
| `chalk` | Terminal color rendering |
| `ora` | Spinner while waiting for API |

---

## 🛡 License

MIT — for educational use as part of Scaler Academy coursework.
