# 🌍 Pack-n-Track
**AI-Powered Travel Itinerary Generator**

> **Live Demo:** [Click here to view the App](https://pack-n-track-me.vercel.app/)

## 📖 About
**Pack-n-Track** is a modern travel application that builds personalized itineraries in seconds. 

By leveraging **Groq's LPU inference engine** (Llama 3), it generates detailed day-by-day travel plans 10x faster than traditional AI models. It features an interactive map that visualizes your route with custom pins for each day.

## ✨ Features
* **⚡ Lightning Fast:** Generates full 3-7 day itineraries in under 1 second using Groq API.
* **🗺️ Interactive Map:** Dynamic **Leaflet.js** map with custom-colored pins for each day.
* **🎨 Personalized:** filters for "Hidden Gems," "Nature," "Nightlife," and more.
* **🔒 Secure:** API keys are protected using a Vercel Serverless Function (Backend-for-Frontend pattern).
* **📱 Responsive:** Fully responsive UI with smooth entry animations and particle effects.

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3, Vanilla JavaScript, React (via CDN)
* **Mapping:** Leaflet.js, OpenStreetMap
* **AI / LLM:** Groq API (Llama-3.3-70b-Versatile)
* **Backend:** Node.js (Vercel Serverless Functions)
* **Deployment:** Vercel

## 🚀 How to Run Locally

Since this project uses Serverless Functions for security, you cannot just open `index.html`. You need the Vercel CLI to simulate the backend.

### 1. Clone the repo
```bash
git clone [https://github.com/yourusername/pack-n-track.git](https://github.com/yourusername/pack-n-track.git)
cd pack-n-track
npm install -g vercel
vercel login
vercel link
vercel env pull .env.development.local
vercel dev
