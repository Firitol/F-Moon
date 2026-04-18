# F-Moon | Ethiopian Social & Business Discovery

F-Moon is a modern, real-time social platform designed for the Ethiopian community to discover local businesses, share updates, and connect with others.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + ShadCN UI
- **Database**: Firebase Firestore (Real-time)
- **Auth**: Firebase Authentication
- **AI**: Genkit (Google Gemini)
- **Deployment**: Optimized for Vercel

## Production Deployment to Vercel

This application is ready to be deployed to Vercel. Follow these steps:

1. **Push your code** to a GitHub, GitLab, or Bitbucket repository.
2. **Import the project** into the [Vercel Dashboard](https://vercel.com/new).
3. **Configure Environment Variables**:
   - Ensure your Firebase configuration matches your production project in `src/firebase/config.ts`.
   - Add `GOOGLE_GENAI_API_KEY` to your Vercel project settings for AI features.
4. **Deploy**: Vercel will automatically detect Next.js and handle the build process.

## Key Features

- **Real-time Feed**: Like, comment, and bookmark posts instantly.
- **Business Discovery**: Explore verified Ethiopian businesses by category.
- **Direct Messaging**: Chat in real-time with friends and business owners.
- **AI Tools**: Generate promotional text and post captions using Gemini.
- **Admin Panel**: Moderation tools for users, businesses, and content.
