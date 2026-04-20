# 🥗 Calorie Tracker
A premium, AI-powered calorie and nutrition tracking mobile application built with React Native and Expo. Designed with a "Deep Nature" aesthetic, the app delivers a seamless and beautiful experience for users who want to take control of their health and diet.

## ✨ Features
- 📸 AI Food Recognition — Snap a photo of any meal and let Google Gemini AI instantly estimate calories and macros
- 🔍 Food Search — Search millions of foods powered by the Open Food Facts database
- 📷 Barcode Scanner — Scan packaged foods to instantly log nutritional data
- 📊 Macro Tracking — Track Protein, Carbs, and Fat alongside your daily calorie goal
- 📈 Weekly Stats — Interactive charts showing calorie trends and weight progress over time
- 🍽️ Meal Sections — Organize entries by Breakfast, Lunch, Dinner, and Snacks
- 🎯 Progress Ring — Animated circular progress indicator for your daily calorie goal
- 🔐 Secure Auth — Full authentication flow with email/password via Supabase
- 👤 User Profiles — Personalized goals based on user profile data
- 💡 AI Insights — Smart suggestions and nutritional insights powered by AI
- 🛠️ Tech Stack

## Layer	Technology

- Framework	React Native + Expo (SDK 54)
- Navigation	Expo Router (file-based)
- Backend / DB	Supabase (PostgreSQL + Auth)
- AI	Google Gemini API
- Food Data	Open Food Facts API
- Animations	Moti + React Native Reanimated
- Charts	React Native Gifted Charts
- UI	Expo Linear Gradient, Expo Blur, Lucide Icons
- Language	TypeScript

## 🚀 Getting Started

- Prerequisites
- Node.js 18+
- Expo CLI
- Supabase account
- Google Gemini API key
- Installation
- bash
- git clone https://github.com/itsabdul-dev/Calorie-tracker-app.git
- cd Calorie-tracker-app
- npm install
- Environment Variables

## Create a .env file in the root directory:

- env
- EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
- EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
- EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
- Run the App
- bash
- npx expo start
## Scan the QR code with Expo Go on your phone, or press i for iOS simulator / a for Android emulator.
