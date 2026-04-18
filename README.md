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

### 1. Push to GitHub
To push this code to your own repository, you can use the following commands in your local terminal:

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit of F-Moon"

# Add your remote (Replace <username> and <repo-name>)
# If using a token, it is safer to authenticate via the GitHub CLI (gh auth login)
git remote add origin https://github.com/<username>/<repo-name>.git

# Push the code
git branch -M main
git push -u origin main
```

### 2. Connect to Vercel
1. Go to the [Vercel Dashboard](https://vercel.com/new).
2. Import the repository you just created.
3. **Configure Environment Variables**:
   - Ensure your Firebase configuration matches your production project.
   - Add `GOOGLE_GENAI_API_KEY` to your Vercel project settings for AI features.
4. **Deploy**: Vercel will automatically handle the build process.

## Key Features

- **Real-time Feed**: Like, comment, and bookmark posts instantly.
- **Business Discovery**: Explore verified Ethiopian businesses by category.
- **Direct Messaging**: Chat in real-time with friends and business owners.
- **AI Tools**: Generate promotional text and post captions using Gemini.
- **Admin Panel**: Moderation tools for users, businesses, and content.
# ETH-CONNECT
