# FitCheck AI 

FitCheck AI is a premium, AI-powered fashion assistant designed to elevate your personal style. Built with a stunning "Midnight Aurora" aesthetic, it leverages Google Gemini 1.5 to provide personalized outfit analysis and virtual try-on capabilities.

![FitCheck AI Banner](public/screenshot.png) <!-- Replace with actual screenshot if available, otherwise maybe remove or use a placeholder -->

## ✨ Key Features

- **🎨 Premium "Midnight Aurora" UI**: A visually immersive experience featuring deep dark modes, glassmorphism, and dynamic mesh gradients inspired by modern fashion aesthetics.
- **🤖 AI Style Advisor**: Powered by **Google Gemini 1.5**, get instant, intelligent feedback on your outfits with personalized improvement tips.
- **👕 Virtual Try-On**: Visualize how different clothes look on you before making a choice (Powered by AI).
- **🔒 Secure Authentication**: Robust user management and security provided by **Firebase**.
- **🛡️ Smart Rate Limiting**: Advanced API protection using **Arcjet** to ensure fair usage and stability.
- **⚡ Real-time Feedback**: Instant analysis and interactions with a responsive interface.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & Vanilla CSS
- **AI Model**: Google Gemini 1.5 Flash
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Security**: Arcjet
- **Animations**: Framer Motion & GSAP
- **Icons**: Lucide React & Remix Icon

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js 18+ installed
- A Firebase project
- A Google Cloud project with Gemini API enabled
- An Arcjet account

### 1. Clone the Repository

```bash
git clone https://github.com/adityanarayan26/FitCheck-AI.git
cd fitcheck_ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and add the following keys:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Arcjet Configuration
ARCJET_KEY=your_arcjet_key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `/app`: Next.js App Router pages and layouts.
- `/components`: Reusable UI components.
- `/lib`: Utility functions and configuration (Firebase, etc.).
- `/public`: Static assets.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
