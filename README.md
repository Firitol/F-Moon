# F-Moon | Ethiopian Social & Business Discovery

F-Moon is a modern, real-time social platform designed for the Ethiopian community to discover local businesses, share updates, and connect with others.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + ShadCN UI
- **Database**: Firebase Firestore (Real-time)
- **Auth**: Firebase Authentication
- **AI**: Genkit (Google Gemini)
- **Deployment**: Optimized for Vercel

## Deployment Instructions

### 1. Initialize Git & Push
To push this code to your own repository, run:

```bash
git init
git add .
git commit -m "Initial commit of F-Moon"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 2. Connect to Vercel
1. Go to the [Vercel Dashboard](https://vercel.com/new).
2. Import your repository.
3. **Environment Variables**: Add your Firebase configuration keys:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `GOOGLE_GENAI_API_KEY`
4. **Deploy**: Vercel will handle the build automatically.

### 3. IMPORTANT: Firebase Auth Setup
To fix login errors (`400 Bad Request`) on Vercel:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. Navigate to **Authentication** > **Settings** > **Authorized Domains**.
4. Click **Add Domain**.
5. Add your Vercel deployment domain (e.g., `f-moon-*.vercel.app`).

## Key Features

- **Real-time Feed**: Like, comment, and bookmark posts instantly.
- **Business Discovery**: Explore verified Ethiopian businesses by category.
- **Direct Messaging**: Chat in real-time with friends and business owners.
- **AI Tools**: Generate promotional text and post captions using Gemini.
- **Admin Panel**: Moderation tools for users, businesses, and content.