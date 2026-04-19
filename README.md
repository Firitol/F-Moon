
# F-Moon | Ethiopian Social & Business Discovery

F-Moon is a modern, real-time social platform designed for the Ethiopian community to discover local businesses, share updates, and connect with others.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + ShadCN UI
- **Database**: Firebase Firestore (Real-time)
- **Auth**: Firebase Authentication
- **AI**: Genkit (Google Gemini)

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
3. **Environment Variables**: Add your configuration keys:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `GOOGLE_GENAI_API_KEY` (CRITICAL for AI features)

### 3. CRITICAL: Authorize Domain & Emails
If you see a `400 Bad Request` or password reset emails aren't arriving:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. **Domain Authorization**:
   - Navigate to **Authentication** > **Settings** > **Authorized Domains**.
   - Click **Add Domain** and add your Vercel URL (e.g., `f-moon-*.vercel.app`).
4. **Email Configuration**:
   - Navigate to **Authentication** > **Templates**.
   - Ensure the **Password Reset** template is enabled.
   - (Recommended) Verify your project's sender email address to ensure deliverability.

## Key Features

- **Real-time Feed**: Like, comment, and bookmark posts instantly.
- **Business Discovery**: Explore verified Ethiopian businesses by category.
- **Direct Messaging**: Chat in real-time with friends and business owners.
- **AI Tools**: Generate promotional text and post captions using Gemini.
