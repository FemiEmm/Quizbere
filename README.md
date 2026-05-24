# Quizbere

Quizbere is a fast-paced Christian quiz game built with Vue 3 and Supabase where players answer Bible and knowledge questions, compete in challenge modes, earn points, and stand a chance to win rewards.

---

# Features

## Quizbere Main Quiz
- Answer 10 questions
- Win prizes and rewards
- Reward probability system handled securely with Supabase Edge Functions
- Username system with account creation and login

## Braindrill
- Fast survival quiz mode
- Multiple unlockable levels
- Timed gameplay
- Leaderboard support

## Topic Challenge
- Pick a topic and answer 10 classroom-style questions
- Pass mark system
- Teacher-style marked result page
- Challenge points reward system

## Challenge Modes
- Multiple special challenge game modes
- Time-based survival challenges
- Football challenge
- Sudden death challenge
- Speed challenge modes

## Versus Mode
- Challenge another player directly
- Random challenger system
- Timed versus battles
- Live score comparison
- Winner reward system

## Tracking System
- Tracks:
  - Quizbere plays
  - Braindrill plays
  - Topic Challenge plays
  - Challenge mode plays

---

# Tech Stack

- Vue 3
- Vue Router
- Tailwind CSS
- Supabase
- Supabase Edge Functions
- Vite
- Lottie Animations

---

# Installation

Clone the repository:

```bash
git clone https://github.com/FemiEmm/Quizbere.git
```

Enter project folder:

```bash
cd Quizbere
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

---

# Environment Variables

Create a `.env` file in the project root.

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

# Supabase Setup

Create these tables:

- examinity_users
- examinity_leaderboard
- examinity_winners
- versus_matches
- quizbere_userate

Enable Row Level Security and add policies.

---

# Deployment

Recommended deployment:

- Vercel

Build command:

```bash
npm run build
```

Output directory:

```bash
dist
```

---

# Creator

Created by Olufemi Olaniyi.

---

# License

copyright