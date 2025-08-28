## Frontend UI Revamp Plan

Goal: Refresh UI with animations, icons, and micro-interactions while preserving existing className, id, and logic. Update page-by-page, route-by-route.

### Routes and Pages Map
- `/` Home (components: `components/home/index.tsx`)
- `/challenges` List (components: `components/challenges/ChallengeList.tsx`, `ChallengeCard.tsx`)
- `/challenge/:id` Detail (components: `components/challenges/ChallengeDetail.tsx`, `CodeEditor.tsx`)
- `/leaderboard` (components: `components/leaderboard/index.tsx`)
- `/learning` Skill Tree (components: `components/learning/LearningPath.tsx`)
- `/concept/:slug` Concept Detail (components: `components/learning/ConceptDetail.tsx`)
- `/concept/:conceptTag/complete` Concept Complete (components: `components/challenges/ConceptCompletePage.tsx`)
- `/tutorials` List (components: `components/tutorials/TutorialList.tsx`)
- `/tutorials/:slug` Detail (components: `components/tutorials/TutorialDetail.tsx`)
- `/profile/badges` User Badges (components: `components/challenges/UserBadges.tsx`)
- `/profile/certificates` User Certificates (components: `components/certificates/UserCertificates.tsx`)
- `/dashboard` (auth) (components: `components/dashboard/index.tsx`)
- `/login`, `/auth/github/callback` (components: `components/auth/index.tsx`)

Shared/Layout:
- `components/layout/Layout.tsx`
- `components/layout/Navbar.tsx`
- UI: `components/ui/Button.tsx`, `components/ui/Badge.tsx`
- AI: `components/ai/AIAssistant.tsx`

### Principles
- Preserve existing `className`, `id`, props and data flow.
- Only enhance visuals (Tailwind, Heroicons, subtle animations).
- Keep accessibility (focus rings, contrast).
- No breaking changes to APIs or routes.

### Checklist (work in small PRs)
- [ ] Global: Add animation tokens/utilities and consistent shadows
- [ ] Layout: Background effects, mouse parallax, footer polish
- [ ] Navbar: Hover/active states, dropdown polish, mobile transitions
- [ ] Home: Hero improvements, features cards, CTA animations
- [ ] UI/Button: Gradients, loading, icon slots, sizes
- [ ] UI/Badge: Variants and glow options
- [ ] Challenges/List: Card hover states, info density
- [ ] Challenges/Detail: Editor header, run/test toolbar, results panel
- [ ] CodeEditor: Status indicators, stats popover
- [ ] LearningPath: Node/edge visuals, progress markers
- [ ] ConceptDetail: Section headers, examples formatting
- [ ] Tutorials/List+Detail: Cards and reading layout polish
- [ ] Dashboard: Cards, stats, and list visuals
- [ ] Certificates/Badges: Display polish and empty states
- [ ] Auth screens: Minimal, branded

### Notes
- Use `@heroicons/react` icons where helpful.
- Prefer Tailwind utility classes; avoid custom CSS unless needed.
- Keep transitions <=300ms; ease-out or standard curves.
- Validate performance; avoid heavy DOM effects.

### Tracking
Update this file as tasks complete, and link PRs next to checklist items.
