# 🧗 CodeClimb

An AI-powered, gamified Python practice app. Pick a difficulty, get an AI-generated coding question, write your solution, and get instant AI feedback — with XP, levels, and achievements to keep you motivated.

**Live demo:** https://python-tutor-app-vert.vercel.app

## Features

- 🐍 AI-generated Python questions across Easy, Medium, and Hard difficulty levels
- 🤖 AI-powered answer checking with explanations (Google Gemini API)
- ⭐ XP, player levels, and unlockable achievements
- 🔐 User accounts with sign up, login, and profiles (Firebase Authentication)
- 🎨 Dark, game-style dashboard UI built with React and Tailwind CSS

## Tech stack

**Frontend:** React (Vite), Tailwind CSS, deployed on Vercel
**Backend:** Python (Flask), deployed on Render
**AI:** Google Gemini API
**Auth:** Firebase Authentication
**Database:** Firestore (security rules configured; not yet used for storing app data — see Roadmap)

## Architecture

```
Browser → Frontend (React, Vercel) → Backend API (Flask, Render) → Google Gemini API
                ↓
        Firebase Authentication
```

## Getting started locally

**Backend**
```
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
python app.py
```
Create a `.env` file inside `backend/` with:
```
GEMINI_API_KEY=your_key_here
```

**Frontend**
```
cd frontend
npm install
npm run dev
```
Create a `frontend/src/firebase.js` file with your own Firebase project config.

## Roadmap

- [ ] Persist XP and progress to Firestore (currently stored client-side only, resets on refresh)
- [ ] Verify Firebase auth tokens on backend API requests
- [ ] Daily streak tracking (currently a static placeholder)

## About

Built solo by [Binil Babu George](https://github.com/BinilBabuGeorge) as a portfolio project — an MCA graduate learning full-stack development by shipping something real, end to end.
