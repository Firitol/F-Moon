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

### 1. Initialize Git
To push this code to your own repository, run:

```bash
git init
git add .
git commit -m "Initial commit of F-Moon"
```

### 2. Connect to GitHub
Create a repository on GitHub and add it as a remote:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 3. Connect to Vercel
1. Go to the [Vercel Dashboard](https://vercel.com/new).
2. Import the repository you just created.
3. **Environment Variables**: Add your Firebase configuration keys and `GOOGLE_GENAI_API_KEY`.
4. **Deploy**: Vercel will handle the build automatically.

## Key Features

- **Real-time Feed**: Like, comment, and bookmark posts instantly using non-blocking Firestore updates.
- **Business Discovery**: Explore verified Ethiopian businesses by category.
- **Direct Messaging**: Chat in real-time with friends and business owners.
- **AI Tools**: Generate promotional text and post captions using Gemini.
- **Admin Panel**: Moderation tools for users, businesses, and content.
