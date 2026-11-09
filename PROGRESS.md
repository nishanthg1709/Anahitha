# ANAHITHA Implementation Progress

Project: Dr. Anahitha Healthcare AI Companion
Rules: Zero-cost, privacy-first, safety-biased, strict emergency guardrails (112 India primary), English-only.

---

## Phase Summary

| Phase | Description | Status | Tests Passed | Notes / Problems |
|---|---|---|---|---|
| **Phase 1** | Chat screen (`/chat`) | **DONE** | Backend: 31/31, Frontend: 48/48, Build: Clean | Full markdown, 5 mode chips, pre-send safety interception, error/retry state, >5s wait indicator. |
| **Phase 2** | Accounts and database (Supabase, env vars only) | **DONE** | Backend: 37/37, Frontend: 53/53, Build: Clean | SQL migrations with RLS, user isolation tested, guest chat stores nothing, protected routes. |
| **Phase 3** | Knowledge base (RAG) | **PENDING** | - | Check `knowledge_base/documents`. |
| **Phase 4** | Dashboard, history, privacy | **PENDING** | - | Dashboard, conversation history, profile, settings, privacy policy. |
| **Phase 5** | English voice | **PENDING** | - | Web Speech API speech-to-text and text-to-speech. |
| **Phase 6** | Security hardening | **PENDING** | - | Rate limiting, CORS env var, prompt injection tests, diagnosis check. |

---

## Phase Details

### PHASE 1 - Chat screen (`/chat`)
- **Status**: **DONE**
- **What was built**:
  - Replaced temporary placeholder at `/chat` with full `ChatPage.jsx`.
  - Header displays `/dr-anahitha.png` avatar, `"AI Companion, not a doctor"` badge, and permanent `"Call 112"` tap-to-call button.
  - Message bubbles styled with plum text (`#3A2A5E`) on soft blush (`#FFD9E6`) for user and soft white/lavender for Dr. Anahitha.
  - Text input with real-time `1000-character counter` (`{length}/1000`) and `maxLength={1000}`.
  - Five mode chips: *Understand Symptoms*, *Health Information*, *Personalized Guidance*, *Lifestyle & Wellness*, and *24/7 Chat*, dynamically setting the `mode` parameter sent to `POST http://127.0.0.1:8000/api/chat`.
  - Client-side pre-send safety screening: `detectEmergency()` runs before any network call. If triggered (physical emergency or crisis self-harm), it intercepts immediately, prevents backend call, and displays an emergency alert card with a large `Call 112` button and a direct link to `/emergency`.
  - Consistent backend emergency card: If the backend returns `emergency=true`, the identical emergency card is shown.
  - Markdown rendering with `react-markdown` for Dr. Anahitha's answers.
  - Typing indicator with automated 5-second timer adding the text: *"Still thinking, this can take up to 15 seconds."*
  - Friendly error card with a **Retry** button and 112 emergency reminder when the backend is unreachable or slow.
  - Demo notice banner: *"Demo only. Please don't share real personal health details."*
- **What was tested**:
  - `frontend/src/pages/ChatPage.test.jsx`:
    - Header avatar, AI companion label, permanent Call 112 link.
    - All 5 mode chips rendering and mode toggling.
    - 1000-character counter and maxlength enforcement.
    - Pre-send emergency interception (physical and self-harm) without calling fetch.
    - Backend emergency response handling.
    - ReactMarkdown rendering for bold, list, and structured content.
    - Friendly error display, 112 reminder, and working Retry button.
    - Typing indicator with 5-second wait notice.
  - `frontend/src/utils/emergencyDetector.test.js`: 39 unit tests for all emergency phrases, misspellings, and crisis wording.
  - `backend/tests/`: 31 pytest tests for API safety interception, Gemini fallbacks, rate limiting, and emergency rules.
- **Problems encountered & resolutions**:
  - Initial test query clashed with starter prompt chips sharing the label "Understand Symptoms"; resolved by scoping the navigation bar queries.
  - All tests passed cleanly.

### PHASE 2 - Accounts and database (Supabase, env vars only)
- **Status**: **DONE**
- **What was built**:
  - `supabase/migrations/20261110000000_init_schema.sql`: Full SQL schema for `profiles`, `conversations`, and `messages` with indexes on `user_id` and `created_at`, plus Row Level Security (RLS) enabled on all tables (each user can only select/insert/update/delete their own rows). Includes user creation trigger on `auth.users`.
  - Frontend Supabase client & environment configuration (`frontend/src/lib/supabase.js`, `frontend/.env.example`, `backend/.env.example`).
  - Auth context and state provider (`frontend/src/context/AuthContext.jsx`) handling sign up, login, logout, and guest detection without breaking offline/demo mode.
  - `LoginPage.jsx` and `SignupPage.jsx` with guest bypass links ("Continue as Guest"), validation, and emergency 112 links.
  - Protected routes (`ProtectedRoute.jsx`) safeguarding `/dashboard` (`DashboardPage.jsx`) and `/history` (`HistoryPage.jsx`). Guests can freely access `/emergency` and `/chat`.
  - Backend JWT verification (`backend/app/auth.py`) decoding Supabase tokens and enforcing 401s on unauthorized endpoints.
  - Database repository (`backend/app/database.py`) enforcing strict Row Level Security.
  - `GET /api/chat/history`: Returns the authenticated user's saved conversations and nested messages.
  - `POST /api/chat`: Saves message exchanges only for authenticated users. For guest users, **stores nothing**.
- **What was tested**:
  - `backend/tests/test_accounts_database.py` (6 new pytest tests):
    - `test_guest_chat_stores_nothing`: Verifies zero messages/conversations are stored when guests chat.
    - `test_guest_emergency_chat_stores_nothing`: Verifies zero storage when guests trigger emergency flows.
    - `test_authenticated_chat_saves_messages`: Verifies logged-in chat exchanges save and return via `/api/chat/history`.
    - `test_row_level_security_isolation_between_two_users`: Generates tokens for User A and User B; verifies User A cannot read any of User B's rows and User B cannot read any of User A's rows.
    - `test_history_endpoint_rejects_unauthenticated_requests`: Verifies HTTP 401 on missing auth.
    - `test_history_endpoint_rejects_malformed_tokens`: Verifies HTTP 401 on invalid token strings.
  - `frontend/src/context/AuthContext.test.jsx` (5 new vitest tests):
    - AuthProvider initialization as guest.
    - Sign in and sign out state transitions.
    - ProtectedRoute redirection to `/login` for unauthenticated guests.
    - LoginPage and SignupPage rendering and guest bypass links.
  - Total tests: Backend 37/37 passed, Frontend 53/53 passed, Frontend build clean.
- **Problems encountered & resolutions**:
  - InsecureKeyLengthWarning in PyJWT test helper resolved by using a 32-byte secret.
  - Typo in ChatPage `try:` statement fixed to `try {`.
