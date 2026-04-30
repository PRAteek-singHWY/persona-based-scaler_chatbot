# Scaler Persona-Based AI Chatbot

A persona-based AI chatbot featuring three distinct personalities from Scaler Academy: Anshuman Singh, Abhimanyu Saxena, and Kshitij Mishra. Built with Next.js, React, and the Groq API using the Llama 3 model.

## Features
- **Three Distinct Personas**: Each persona has a unique system prompt, tone, and constraints.
- **Persona Switcher**: Seamlessly switch between mentors (resets the conversation context).
- **Suggestion Chips**: Quick-start questions tailored to each persona.
- **Typing Indicator**: Visual feedback while the API call is in progress.
- **Responsive UI**: Works perfectly on both mobile and desktop.
- **Secure API Calling**: API keys are securely stored in environment variables and calls are routed through a Next.js backend API route to prevent exposure on the client-side.

## Tech Stack
- **Frontend**: Next.js (App Router), React, CSS Modules
- **Backend**: Next.js API Routes
- **AI/LLM**: Groq API (Llama 3 8B)
- **Icons**: Lucide React

## Setup Instructions

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd scaler-chatbot
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up Environment Variables**
   - Copy the example environment file:
     \`\`\`bash
     cp .env.example .env.local
     \`\`\`
   - Open \`.env.local\` and add your Groq API Key:
     \`\`\`
     GROQ_API_KEY="your_actual_api_key_here"
     \`\`\`
   *(You can get a free API key from [Groq Console](https://console.groq.com/keys))*

4. **Run the Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`
   Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the chatbot.

## Documentation
- `prompts.md`: Contains the three system prompts with annotations explaining the rationale behind the design choices.
- `reflection.md`: Contains a reflection on the prompt engineering process, the GIGO principle, and potential improvements.

## Deployment
This project is optimized for deployment on Vercel. 
1. Push this repository to GitHub.
2. Import the project in Vercel.
3. Add the `GROQ_API_KEY` to Vercel's Environment Variables during setup.
4. Deploy.
