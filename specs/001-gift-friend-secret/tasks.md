# Tasks: Gift Friend - Secret Santa Platform

**Input**: Design documents from `/specs/001-gift-friend-secret/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual testing only - no automated test tasks included per specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Next.js App Router structure: `src/app/[locale]/` for pages
- API routes: `src/app/api/` directory
- Components: `src/components/` directory
- Models: `src/models/` directory
- All paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure per quickstart.md and plan.md

- [x] T001 Create project structure with Next.js 14 App Router using `npx create-next-app@latest gift-friend --typescript --tailwind --app --src-dir --import-alias "@/*"`
- [x] T002 [P] Install core dependencies in package.json: mongoose, next-auth, zod, framer-motion, next-intl, nodemailer, bcrypt, @types/bcrypt
- [x] T003 [P] Configure TypeScript in tsconfig.json with strict mode and path aliases
- [x] T004 [P] Configure Tailwind CSS in tailwind.config.js with custom Christmas theme colors (red, green, gold)
- [x] T005 [P] Create .env.example file with all required environment variables (MONGODB*URI, NEXTAUTH_SECRET, NEXTAUTH_URL, ENCRYPTION_KEY, SMTP*\*)
- [x] T006 [P] Configure Next.js in next.config.js with i18n support and environment variables
- [x] T007 [P] Create .gitignore entries for .env.local, node_modules, .next, and IDE files
- [x] T008 Create project folder structure: src/app/[locale]/, src/components/, src/lib/, src/models/, src/types/, public/locales/, public/images/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create MongoDB connection utility in src/lib/db/connection.ts with connection pooling
- [x] T010 Create encryption utility in src/lib/crypto/encryption.ts for AES-256-GCM assignment encryption
- [x] T011 [P] Configure NextAuth.js in src/app/api/auth/[...nextauth]/route.ts with credentials provider
- [ ] T012 [P] Create Zod validation schemas in src/lib/validations/schemas.ts for all entities
- [ ] T013 [P] Set up next-intl configuration in src/middleware.ts for PT-BR and EN
- [ ] T014 Create base layout with language switcher in src/app/[locale]/layout.tsx
- [ ] T015 [P] Create reusable UI components (Button, Input, Card, Modal) in src/components/ui/
- [ ] T016 [P] Create email service configuration in src/lib/email/config.ts with Nodemailer
- [ ] T017 [P] Create email templates in src/lib/email/templates/ for all notification types
- [ ] T018 Configure Next.js middleware for authentication and i18n in src/middleware.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Event Join Without Account (Priority: P1) 🎯 MVP

**Goal**: Enable participants to quickly join events with name+email only, view basic event info, and be prompted to create account for protected features

**Independent Test**: Generate event code, provide name/email only, join event, view event details, attempt to view assignment (should prompt for account creation)

### Implementation for User Story 1

- [ ] T019 [P] [US1] Create Participant model in src/models/Participant.ts with guest token support
- [ ] T020 [P] [US1] Create Event model in src/models/Event.ts with unique code generation
- [ ] T021 [US1] Create participant service in src/lib/services/participantService.ts with guest token generation
- [ ] T022 [US1] Implement POST /api/auth/guest route in src/app/api/auth/guest/route.ts for guest token generation
- [ ] T023 [US1] Implement POST /api/events/[eventId]/participants route in src/app/api/events/[eventId]/participants/route.ts
- [ ] T024 [US1] Implement GET /api/events/[eventId] route in src/app/api/events/[eventId]/route.ts for event details
- [ ] T025 [US1] Create quick join page in src/app/[locale]/(public)/join/page.tsx with code input form
- [ ] T026 [US1] Create join form component in src/components/features/events/JoinForm.tsx with validation
- [ ] T027 [US1] Create event details view component in src/components/features/events/EventDetails.tsx
- [ ] T028 [US1] Add upgrade prompt component in src/components/features/auth/UpgradePrompt.tsx for protected features
- [ ] T029 [US1] Add authentication check middleware for guest vs full account in src/lib/auth/checkAuth.ts

**Checkpoint**: User Story 1 complete - participants can join events as guests and view basic information

---

## Phase 4: User Story 2 - Event Creation and Management (Priority: P1)

**Goal**: Allow authenticated users to create events with all details, generate unique codes, manage participants, and update event settings

**Independent Test**: Create account, create event with all details, verify unique code generated, update event, view participant list

### Implementation for User Story 2

- [ ] T030 [P] [US2] Create User model in src/models/User.ts with bcrypt password hashing
- [ ] T031 [US2] Implement POST /api/auth/register route in src/app/api/auth/register/route.ts
- [ ] T032 [US2] Implement user authentication service in src/lib/services/authService.ts
- [ ] T033 [US2] Create registration page in src/app/[locale]/(public)/register/page.tsx
- [ ] T034 [US2] Create login page in src/app/[locale]/(public)/login/page.tsx
- [ ] T035 [US2] Implement POST /api/events route in src/app/api/events/route.ts for event creation
- [ ] T036 [US2] Implement PATCH /api/events/[eventId] route in src/app/api/events/[eventId]/route.ts
- [ ] T037 [US2] Implement GET /api/events route in src/app/api/events/route.ts for user's events
- [ ] T038 [US2] Implement GET /api/events/[eventId]/participants route for participant list
- [ ] T039 [US2] Create event creation page in src/app/[locale]/(auth)/events/create/page.tsx
- [ ] T040 [US2] Create event form component in src/components/features/events/EventForm.tsx with all fields
- [ ] T041 [US2] Create dashboard page in src/app/[locale]/(auth)/dashboard/page.tsx showing user's events
- [ ] T042 [US2] Create event management page in src/app/[locale]/(auth)/events/[id]/page.tsx
- [ ] T043 [US2] Create participant list component in src/components/features/events/ParticipantList.tsx
- [ ] T044 [US2] Add unique code generator utility in src/lib/utils/codeGenerator.ts

**Checkpoint**: User Stories 1 AND 2 complete - full event creation and joining workflow functional

---

## Phase 5: User Story 3 - Interactive Random Draw Process (Priority: P2)

**Goal**: Enable admin to initiate draw, each participant draws their Secret Santa individually with animation, assignments are encrypted and stored

**Independent Test**: Create event with 5+ participants, initiate draw as admin, have each participant draw with animation, verify all assignments valid and encrypted

### Implementation for User Story 3

- [ ] T045 [P] [US3] Create DrawAssignment model in src/models/DrawAssignment.ts with encrypted receiverId field
- [ ] T046 [US3] Implement draw algorithm in src/lib/services/drawService.ts with random assignment logic
- [ ] T047 [US3] Implement POST /api/events/[eventId]/draw/initiate route in src/app/api/events/[eventId]/draw/initiate/route.ts
- [ ] T048 [US3] Implement POST /api/events/[eventId]/draw/execute route in src/app/api/events/[eventId]/draw/execute/route.ts
- [ ] T049 [US3] Implement GET /api/events/[eventId]/draw/status route in src/app/api/events/[eventId]/draw/status/route.ts
- [ ] T050 [US3] Implement GET /api/participants/[participantId]/assignment route in src/app/api/participants/[participantId]/assignment/route.ts
- [ ] T051 [US3] Create draw initiation button in event management page with admin check
- [ ] T052 [US3] Create draw page in src/app/[locale]/(auth)/events/[id]/draw/page.tsx
- [ ] T053 [US3] Create draw animation component in src/components/features/draw/DrawAnimation.tsx using Framer Motion
- [ ] T054 [US3] Create assignment reveal component in src/components/features/draw/AssignmentReveal.tsx
- [ ] T055 [US3] Add draw status indicator component in src/components/features/draw/DrawStatus.tsx
- [ ] T056 [US3] Add encryption/decryption hooks in mongoose model pre-save and post-find

**Checkpoint**: All User Stories 1-3 complete - core Secret Santa draw functionality working

---

## Phase 6: User Story 4 - Gift List Management and Public Viewing (Priority: P2)

**Goal**: Allow participants to create and manage wishlists, add/edit/delete items, and view other participants' wishlists publicly within event

**Independent Test**: Create wishlist, add multiple items with details, edit items, delete items, view other participant's wishlist from event page

### Implementation for User Story 4

- [ ] T057 [P] [US4] Create Wishlist model in src/models/Wishlist.ts with userId reference
- [ ] T058 [P] [US4] Create GiftItem model in src/models/GiftItem.ts with wishlistId reference
- [ ] T059 [US4] Implement GET /api/wishlists/[userId] route in src/app/api/wishlists/[userId]/route.ts
- [ ] T060 [US4] Implement POST /api/wishlists/[wishlistId]/items route in src/app/api/wishlists/[wishlistId]/items/route.ts
- [ ] T061 [US4] Implement PATCH /api/wishlists/items/[itemId] route in src/app/api/wishlists/items/[itemId]/route.ts
- [ ] T062 [US4] Implement DELETE /api/wishlists/items/[itemId] route in src/app/api/wishlists/items/[itemId]/route.ts
- [ ] T063 [US4] Create wishlist page in src/app/[locale]/(auth)/wishlists/page.tsx
- [ ] T064 [US4] Create wishlist management component in src/components/features/wishlists/WishlistManager.tsx
- [ ] T065 [US4] Create gift item form component in src/components/features/wishlists/GiftItemForm.tsx
- [ ] T066 [US4] Create gift item list component in src/components/features/wishlists/GiftItemList.tsx
- [ ] T067 [US4] Add wishlist viewing in participant list with click-to-view functionality
- [ ] T068 [US4] Create public wishlist view component in src/components/features/wishlists/PublicWishlistView.tsx

**Checkpoint**: User Stories 1-4 complete - full gift exchange workflow with wishlists functional

---

## Phase 7: User Story 5 - Anonymous Chat with Assigned Secret Santa (Priority: P3)

**Goal**: Enable givers to initiate anonymous chat with their assigned receiver, maintain anonymity until reveal

**Independent Test**: Complete draw, initiate chat from giver side, send messages, reply from receiver side, verify anonymity maintained

### Implementation for User Story 5

- [ ] T069 [P] [US5] Create ChatSession model in src/models/ChatSession.ts with giver/receiver references
- [ ] T070 [P] [US5] Create ChatMessage model in src/models/ChatMessage.ts with sessionId reference
- [ ] T071 [US5] Implement POST /api/chat/sessions route in src/app/api/chat/sessions/route.ts
- [ ] T072 [US5] Implement GET /api/chat/sessions/[sessionId]/messages route in src/app/api/chat/sessions/[sessionId]/messages/route.ts
- [ ] T073 [US5] Implement POST /api/chat/sessions/[sessionId]/messages route in src/app/api/chat/sessions/[sessionId]/messages/route.ts
- [ ] T074 [US5] Implement PATCH /api/chat/messages/[messageId]/read route in src/app/api/chat/messages/[messageId]/read/route.ts
- [ ] T075 [US5] Create chat page in src/app/[locale]/(auth)/events/[id]/chat/page.tsx
- [ ] T076 [US5] Create chat interface component in src/components/features/chat/ChatInterface.tsx
- [ ] T077 [US5] Create message list component in src/components/features/chat/MessageList.tsx with anonymity handling
- [ ] T078 [US5] Create message input component in src/components/features/chat/MessageInput.tsx
- [ ] T079 [US5] Add "Start Chat" button in assignment view component
- [ ] T080 [US5] Add real-time message polling or WebSocket setup in chat service

**Checkpoint**: User Stories 1-5 complete - anonymous communication feature working

---

## Phase 8: User Story 6 - Automated Email Notifications (Priority: P3)

**Goal**: Send automated emails at key events (join, draw complete, reminders, reveal) in user's preferred language

**Independent Test**: Trigger each email type (join, draw, reminders, reveal), verify emails sent with correct content and language

### Implementation for User Story 6

- [ ] T081 [P] [US6] Create email templates in src/lib/email/templates/welcome.ts for PT-BR and EN
- [ ] T082 [P] [US6] Create email templates in src/lib/email/templates/drawComplete.ts for PT-BR and EN
- [ ] T083 [P] [US6] Create email templates in src/lib/email/templates/reminder.ts for PT-BR and EN
- [ ] T084 [P] [US6] Create email templates in src/lib/email/templates/reveal.ts for PT-BR and EN
- [ ] T085 [US6] Implement email sending service in src/lib/email/sender.ts with template rendering
- [ ] T086 [US6] Implement POST /api/email/send route in src/app/api/email/send/route.ts (internal use)
- [ ] T087 [US6] Add welcome email trigger in participant join API route
- [ ] T088 [US6] Add draw complete email trigger in draw execute API route
- [ ] T089 [US6] Create scheduled job for 7-day reminder emails (Vercel Cron or external scheduler)
- [ ] T090 [US6] Create scheduled job for 1-day reminder emails (Vercel Cron or external scheduler)
- [ ] T091 [US6] Add reveal email trigger in reveal activation API route

**Checkpoint**: User Stories 1-6 complete - email notification system functional

---

## Phase 9: User Story 7 - Multi-Language Support (Priority: P3)

**Goal**: Support Portuguese (BR) and English across entire interface with language switching and persistence

**Independent Test**: Switch between languages, navigate all pages, verify translations, check language persistence in session/account

### Implementation for User Story 7

- [ ] T092 [P] [US7] Add all interface translations to public/locales/pt-BR.json
- [ ] T093 [P] [US7] Add all interface translations to public/locales/en.json
- [ ] T094 [US7] Create language switcher component in src/components/ui/LanguageSwitcher.tsx
- [ ] T095 [US7] Add language switcher to main layout header
- [ ] T096 [US7] Implement language preference saving in User model
- [ ] T097 [US7] Update all page components to use next-intl translation hooks
- [ ] T098 [US7] Update all email templates to support both languages based on user preference
- [ ] T099 [US7] Add browser language detection in middleware for first-time visitors
- [ ] T100 [US7] Add language parameter to all API routes that return user-facing messages
- [ ] T101 [US7] Test and fix any missing translations across all pages

**Checkpoint**: User Stories 1-7 complete - full multi-language support functional

---

## Phase 10: User Story 8 - Event History and Post-Event Reveal (Priority: P3)

**Goal**: Allow participants to view past events in history, enable admin to activate reveal showing all assignments

**Independent Test**: Complete event (set date to past), view in event history, activate reveal as admin, verify all participants see complete assignment matrix

### Implementation for User Story 8

- [ ] T102 [US8] Implement GET /api/events/history route in src/app/api/events/history/route.ts for past events
- [ ] T103 [US8] Implement POST /api/events/[eventId]/reveal route in src/app/api/events/[eventId]/reveal/route.ts
- [ ] T104 [US8] Implement GET /api/events/[eventId]/reveal route in src/app/api/events/[eventId]/reveal/route.ts
- [ ] T105 [US8] Update Event model status transitions to support 'REVEALED' status
- [ ] T106 [US8] Create event history page in src/app/[locale]/(auth)/events/history/page.tsx
- [ ] T107 [US8] Create event history list component in src/components/features/events/EventHistoryList.tsx
- [ ] T108 [US8] Add reveal button in event management page with date validation
- [ ] T109 [US8] Create reveal visualization component in src/components/features/events/RevealMatrix.tsx
- [ ] T110 [US8] Update chat interface to show real identities after reveal
- [ ] T111 [US8] Add past event filtering in dashboard

**Checkpoint**: All User Stories 1-8 complete - full feature set implemented

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, optimizations, and deployment preparation

- [ ] T112 [P] Create beautiful landing page in src/app/[locale]/(public)/page.tsx with Christmas theme
- [ ] T113 [P] Add loading states and skeletons to all pages
- [ ] T114 [P] Add error handling and user-friendly error messages across all API routes
- [ ] T115 [P] Implement rate limiting middleware in src/middleware.ts for API routes
- [ ] T116 [P] Add input sanitization for all user-generated content (XSS prevention)
- [ ] T117 [P] Optimize images and add Next.js Image component throughout
- [ ] T118 [P] Add meta tags and SEO optimization for public pages
- [ ] T119 [P] Create 404 and error pages with Christmas theme
- [ ] T120 [P] Add accessibility improvements (ARIA labels, keyboard navigation)
- [ ] T121 Test mobile responsiveness across all pages (Chrome DevTools)
- [ ] T122 Test all user flows end-to-end in localhost
- [ ] T123 Configure Vercel environment variables in dashboard
- [ ] T124 Create README.md with setup instructions and features overview
- [ ] T125 Deploy to Vercel and test preview URL
- [ ] T126 Fix any issues found in preview deployment
- [ ] T127 Merge to main branch for production deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - User Stories can proceed in parallel (if staffed) or sequentially by priority
  - Recommended order: US1 → US2 → US3 → US4 → US5 → US6 → US7 → US8
- **Polish (Phase 11)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - No dependencies on other stories (but US1+US2 form the MVP together)
- **User Story 3 (P2)**: Requires US1 and US2 (needs events and participants)
- **User Story 4 (P2)**: Requires US2 (needs user accounts)
- **User Story 5 (P3)**: Requires US3 (needs draw assignments)
- **User Story 6 (P3)**: Requires US1, US2, US3 (sends emails for various events)
- **User Story 7 (P3)**: Independent - can be done anytime after Foundational
- **User Story 8 (P3)**: Requires US2, US3 (needs events and assignments to reveal)

### Critical Path (MVP)

**Minimum Viable Product** consists of:

1. Setup (Phase 1)
2. Foundational (Phase 2)
3. User Story 1 (Phase 3) - Quick Join
4. User Story 2 (Phase 4) - Event Creation

This gives you a working Secret Santa platform where users can create events and invite participants.

### Incremental Delivery Strategy

**Stage 1 - MVP** (Deploy after Phase 4):

- Setup + Foundational + US1 + US2
- Users can create events, join as guests, manage basic details
- **Test**: Create event, join with code, view event details

**Stage 2 - Core Features** (Deploy after Phase 6):

- Add US3 (Draw Process) + US4 (Wishlists)
- Complete Secret Santa exchange functionality
- **Test**: Full draw process, wishlist management

**Stage 3 - Enhanced Experience** (Deploy after Phase 10):

- Add US5 (Chat) + US6 (Email) + US7 (i18n) + US8 (History)
- Full-featured platform with all enhancements
- **Test**: Chat, emails, language switching, reveal

**Stage 4 - Production Ready** (Deploy after Phase 11):

- Polish, security, optimization
- Ready for public launch
- **Test**: End-to-end all flows, mobile, performance

---

## Parallel Opportunities

### Setup Phase (All can run in parallel after T001-T006):

```bash
T007 [P] - Git setup
T008 [P] - Translation files
```

### Foundational Phase:

```bash
# After T009 complete, these can run in parallel:
T011 [P] - NextAuth config
T012 [P] - Zod schemas
T013 [P] - next-intl setup
T015 [P] - UI components
T016 [P] - Email config
T017 [P] - Email templates
```

### User Story 1:

```bash
# These can run in parallel:
T019 [P] [US1] - Participant model
T020 [P] [US1] - Event model
```

### User Story 2:

```bash
# This can run in parallel with others:
T030 [P] [US2] - User model (independent)
```

### User Story 3:

```bash
# This can run in parallel:
T045 [P] [US3] - DrawAssignment model
```

### User Story 4:

```bash
# These can run in parallel:
T057 [P] [US4] - Wishlist model
T058 [P] [US4] - GiftItem model
```

### User Story 5:

```bash
# These can run in parallel:
T069 [P] [US5] - ChatSession model
T070 [P] [US5] - ChatMessage model
```

### User Story 6:

```bash
# All email templates can be created in parallel:
T081 [P] [US6] - Welcome template
T082 [P] [US6] - Draw complete template
T083 [P] [US6] - Reminder template
T084 [P] [US6] - Reveal template
```

### User Story 7:

```bash
# Translations can be done in parallel:
T092 [P] [US7] - PT-BR translations
T093 [P] [US7] - EN translations
```

### Polish Phase:

```bash
# Most polish tasks are independent:
T112 [P] - Landing page
T113 [P] - Loading states
T114 [P] - Error handling
T115 [P] - Rate limiting
T116 [P] - Input sanitization
T117 [P] - Image optimization
T118 [P] - SEO
T119 [P] - Error pages
T120 [P] - Accessibility
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T018) - **CRITICAL CHECKPOINT**
3. Complete Phase 3: User Story 1 (T019-T029)
4. Complete Phase 4: User Story 2 (T030-T044)
5. **STOP and VALIDATE**: Test event creation and joining flow
6. Deploy MVP to Vercel preview
7. Test preview URL, confirm working
8. **Decision Point**: Continue to next features or iterate on MVP

### Incremental Feature Addition

After MVP validation:

1. Add User Story 3 (Draw) → Test → Deploy
2. Add User Story 4 (Wishlists) → Test → Deploy
3. Add remaining P3 features as desired
4. Final polish → Production deployment

### Daily Development Cycle

1. **Morning**: Pick next task(s) from list
2. **Implement**: Code the feature with file path from task
3. **Test Locally**: Manual testing in `http://localhost:3000`
4. **Commit**: After confirming it works
5. **Push**: After user confirmation
6. **Repeat**: Next task

### Testing Workflow

Since tests are manual:

1. After each task, test the specific feature
2. Test in both Portuguese and English
3. Test on desktop and mobile (DevTools)
4. Test edge cases from spec.md
5. Report any issues immediately for fixing
6. Don't move to next task until current works

### Commit Strategy

**Good commit messages**:

- `feat(auth): implement guest token generation (T022)`
- `feat(events): add event creation form with validation (T040)`
- `feat(draw): add animated draw sequence (T053)`
- `fix(wishlists): correct item deletion logic (T062)`
- `style: add Christmas theme to landing page (T112)`

**Commit after**:

- Each completed task or logical group of tasks
- User confirms functionality works
- Before pushing to GitHub

---

## Notes

- Manual testing strategy: Test each feature immediately after implementation in browser
- File paths included in every task for precise implementation
- Each user story is independently testable at its checkpoint
- Parallel opportunities clearly marked with [P]
- Story labels [US1]-[US8] map directly to spec.md user stories
- Foundation phase (T009-T018) is critical blocker for all features
- MVP = Phase 1-4 (Setup + Foundation + US1 + US2)
- Total: 127 tasks organized across 11 phases
- Estimated MVP: ~44 tasks (T001-T044)
- All tasks follow strict checklist format with IDs, labels, and file paths
