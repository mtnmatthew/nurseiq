# NurseIQ — AI Nursing School Study Companion

Your all-in-one AI-powered study app for nursing students. Built with React + Vite, powered by Claude AI.

---

## What's inside

- **AI Tutor** — Nursing-specific AI that knows NCLEX thinking, pharmacology, patho, care plans
- **Flashcard Generator** — Paste notes, get 8 high-yield flashcards instantly. Tap to flip.
- **Study Guide Builder** — Full structured guides with patho, interventions, meds, NCLEX pearls
- **Practice Questions** — NCLEX-style questions with clinical rationales and scoring

---

## Launch in 4 steps

### Step 1 — Get your Anthropic API key
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Click "API Keys" → "Create Key"
4. Copy the key (starts with `sk-ant-...`)

### Step 2 — Set up the project locally
```bash
# In the nurseiq folder:
npm install

# Copy the env file and add your key
cp .env.example .env
# Open .env and paste your API key
```

### Step 3 — Run locally to test
```bash
npm run dev
# Opens at http://localhost:5173
```

### Step 4 — Deploy to Vercel (free)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# When prompted:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name: nurseiq
# - Directory: ./
# - Override settings? N

# Add your API key to Vercel:
vercel env add VITE_ANTHROPIC_API_KEY
# Paste your key when prompted

# Redeploy with the env var
vercel --prod
```

Your app is now live at a public URL like `nurseiq.vercel.app`.

---

## Cost estimates

| Users | API Cost/mo | Hosting | Net Revenue (at $9/mo) |
|-------|------------|---------|----------------------|
| 100   | ~$50-150   | Free    | ~$750                |
| 500   | ~$250-750  | Free    | ~$3,500              |
| 1,000 | ~$500-2000 | $25     | ~$7,000              |
| 5,000 | ~$2500-8000| $50     | ~$32,000             |

---

## Adding Stripe payments (when you're ready)

1. Sign up at https://stripe.com
2. Create a product: "NurseIQ Pro" at $9/month
3. Use Stripe Checkout for the payment flow
4. Gate the app behind auth using Supabase (free tier)

Ask Claude to help you add Stripe + Supabase auth when you're ready — it's the natural next step.

---

## File structure

```
nurseiq/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   └── Sidebar.module.css
│   ├── pages/
│   │   ├── TutorPage.jsx       # AI tutor chat
│   │   ├── FlashcardsPage.jsx  # Flashcard generator
│   │   ├── StudyGuidePage.jsx  # Study guide builder
│   │   └── QuizPage.jsx        # Practice questions
│   ├── lib/
│   │   └── api.js              # Anthropic API + system prompts
│   ├── App.jsx                 # Main app shell
│   ├── App.module.css
│   ├── main.jsx
│   └── index.css               # Global design tokens
├── index.html
├── vite.config.js
├── vercel.json
├── .env.example
└── README.md
```

---

## Customizing the AI

All AI behavior lives in `src/lib/api.js`. The system prompts define how the tutor talks, what the flashcards focus on, and how study guides are structured. You can tune these at any time without touching anything else.

---

## Next features to build (roadmap)

- [ ] User auth (Supabase) + Stripe subscriptions
- [ ] Save flashcard decks to account
- [ ] Progress tracking dashboard
- [ ] Care plan builder
- [ ] NCLEX exam countdown + study scheduler
- [ ] Mobile app (React Native)
- [ ] Spaced repetition for flashcards

---

## Marketing your app

**Where nursing students actually are:**
- Reddit: r/nursing, r/StudentNurse, r/NCLEX
- Facebook: nursing school groups (search "nursing school 2025")
- TikTok: #nursingschool #nclex #nursingStudent — post study tips, show the app
- Instagram: nursing student accounts
- Discord: nursing study servers

**Your pitch:** "I'm a nursing student who built an AI tutor that actually understands nursing school. $9/month. Try it free for 7 days."

That's authentic. That sells.
