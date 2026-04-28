# Stupid Small: beat procrastination by going stupidly small

> An AI-powered Android app that breaks scary tasks into stupidly small steps you'll actually finish. Kotlin + Jetpack Compose, Material 3, on-device persistence, AI-assisted breakdowns.

<p align="center">
  <img src="/stupid-small-icon.png" width="160" alt="Stupid Small app icon">
</p>

<p align="center">
  <img src="/apps/stupid-small/01_launch.png" width="22%" alt="Launch screen">
  <img src="/apps/stupid-small/03_breakdown.png" width="22%" alt="AI breakdown">
  <img src="/apps/stupid-small/04_focus.png" width="22%" alt="Focus timer">
  <img src="/apps/stupid-small/06_stats.png" width="22%" alt="Stats">
</p>

---

## Why Stupid Small exists

Most "productivity" apps are good at cataloguing tasks. They're not good at making you start them. You end up with a tagged, sorted backlog you still won't open, because the tasks themselves are still too big: writing a thesis, cleaning the garage, filing taxes. The problem isn't organisation. It's that step one is invisible.

Stupid Small flips that. Instead of writing down "Write thesis," you ask the AI to break it apart. It hands back five tiny steps:

1. Open the doc and re-read the last paragraph (2 min)
2. Write three bullets for the next section (3 min)
3. Turn the first bullet into a sentence (3 min)
4. Take a 5-minute break, you earned it
5. Turn the second bullet into a sentence (3 min)

That first step is always doable.

- **Stupidly small steps.** The AI is system-prompted to never propose a step longer than 5 minutes.
- **One step at a time.** The focus screen shows only the current step. No list, no scrolling, no checkboxes.
- **Wall-clock focus timer.** Picks a duration based on the AI's estimate. Runs Do Not Disturb while active. Immune to coroutine drift.
- **Built-in escape hatch.** If a step still feels too big mid-timer, tap "Break it down" and the AI hands you something even smaller.
- **Confetti.** Every finished step gets a celebration.

---

## Features

### Core loop

- **AI task breakdown** powered by Llama 3.3 70B (Groq) via a Cloudflare Worker proxy. Your API key never leaves the worker.
- **Per-step time estimates** the focus timer reads from. A 3-minute step gets a 3-minute timer.
- **"Use these steps" → straight into focus.** Save flow drops you on the first step instead of a task list, removing one click between intent and action.
- **One-step-at-a-time focus screen** with start/pause/done, current step text, optional task title, and the count "Step 2 of 5".
- **Mid-step breakdown.** Stuck? Tap **Break it down**, get an even smaller AI suggestion, current step is shifted back so the new step fires first.
- **Celebration screen** after each step. Confetti, encouragement, and a "next step" button when one exists.
- **Recurring tasks.** Mark a task daily or weekly and it auto-clones with fresh micro-steps when complete.
- **Soft-delete with undo.** Swipe to delete shows a snackbar; orphans get purged on app launch so a missed dismiss doesn't leak rows.

### Built around finishing

- **Wall-clock-based timer.** Tracks elapsed time via `System.currentTimeMillis()` deltas, not coroutine `delay()`. Survives doze, app backgrounding, and slow recompositions without drift.
- **Auto Do Not Disturb.** Starting the timer flips DnD on; pausing or finishing flips it off. No nagging notifications during focus.
- **Leave guard.** Pressing back during an active timer shows a confirmation dialog. Accidental dismiss can't lose your progress.
- **Daily reminder** at a user-picked time (Material 3 time picker, 12-hour with AM/PM display).
- **Streak tracking + stats screen.** Total tasks finished, total steps completed, total focus time, current and longest streak.

### Polish

- **5 hand-tuned colour themes** × light / dark variants (Sunset, Ocean, Forest, Lavender, Rose), each with consistent Material 3 ColorScheme.
- **Home-screen widget** (Glance + Material 3) showing the next pending step with one-tap launch into focus.
- **Animated boulder + smiling cubes empty state** on the task list (commissioned art, not a stock illustration).
- **Confetti celebration engine.** Particle system with continuous spawn loop, gravity tuned for natural fall, capped at 350-450 live particles to keep frame times tight.
- **Premium tier** via Google Play Billing v7. Unlocks a higher AI request quota and is fully optional. The base loop works without it.

### Privacy

- **Database lives on-device.** Tasks, micro-steps, completion timestamps, and streaks all live in a single Room database in app-private storage.
- **AI calls go through a Cloudflare Worker** that proxies to Groq. The worker logs request counts only. No task content is persisted server-side.
- **No analytics SDK, no crash reporter, no ad networks.** The only third-party code that runs is Google Play Billing (loaded only if you tap the Premium upgrade button).
- **Uninstall removes everything.** No cloud sync, no shadow copy of your tasks living somewhere else.

---

## Tech stack

| Layer | Technology |
|---|---|
| Language | Kotlin 2.0.21 |
| UI | Jetpack Compose, Material 3 |
| Compose BOM | 2024.09.03 |
| DI | Hilt 2.52 |
| Architecture | Single-activity, `HiltViewModel` + `StateFlow` + `mutableStateOf` |
| Persistence | Room 2.6.1 (KSP-generated) |
| Background work | WorkManager 2.9.1 (daily reminder scheduling) |
| Home-screen widget | Glance 1.1.1 |
| Networking | OkHttp 4.12 (against a Cloudflare Worker proxy) |
| Billing | Google Play Billing v7.1.1 |
| AI | Llama 3.3 70B via Groq, brokered by a Cloudflare Worker |
| Build | AGP 8.7.0, Gradle KTS, R8 minification + resource shrinking |
| Min / Target SDK | 26 / 35 |

### Architecture overview

```
app/src/main/java/com/stupidsmall/app/
├── MainActivity.kt
├── StupidSmallApp.kt          @HiltAndroidApp + WorkManager bootstrap
├── billing/
│   └── BillingManager.kt      Play Billing v7 wrapper (subscription product, ack, restore)
├── data/
│   ├── ai/
│   │   └── GeminiApiClient.kt OkHttp client → Cloudflare Worker → Groq
│   ├── db/
│   │   ├── AppDatabase.kt     Room DB with TypeConverters
│   │   ├── TaskDao.kt
│   │   ├── MicroStepDao.kt
│   │   └── StreakDao.kt
│   ├── model/                 @Entity data classes (Task, MicroStep, Streak)
│   ├── repository/            Single source of truth for DB access
│   └── TaskTemplates.kt       Built-in starter templates for empty-state demo
├── di/                        @Module / @InstallIn for Room, OkHttp, repos
├── notification/
│   ├── FocusModeManager.kt    NotificationManager.setInterruptionFilter()
│   ├── NotificationHelper.kt  Channel creation + builders
│   ├── ReminderManager.kt     Schedules daily WorkManager job at user's chosen time
│   └── ReminderWorker.kt      Posts the daily nudge
├── premium/
│   └── PremiumManager.kt      SharedPreferences-backed entitlement flag
├── ui/
│   ├── Navigation.kt          NavHost + animated transitions per route
│   ├── theme/                 5 ColorScheme palettes × light + dark
│   ├── tasklist/              All-tasks screen, drag-to-reorder, swipe-to-delete
│   ├── addtask/               Two-step flow: title → AI suggestions
│   ├── focus/                 One-step-at-a-time timer screen
│   ├── celebration/           Confetti particle engine + post-step screen
│   ├── stats/                 Lifetime + streak metrics
│   ├── coach/                 In-app coach (FAQs, tips)
│   ├── settings/              Theme picker, reminders sheet, premium sheet
│   ├── onboarding/            3-page first-run flow
│   └── components/            Shared dialogs + sheets
├── viewmodel/                 6 HiltViewModels (TaskList, AddTask, Focus,
│                              Celebration, Stats, Coach)
├── widget/
│   ├── TaskWidget.kt          Glance composable for the home-screen widget
│   └── TaskWidgetReceiver.kt  GlanceAppWidgetReceiver
└── util/
```

### Notable design decisions

- **AI proxy, not direct API.** The app never sees Groq credentials. A small Cloudflare Worker holds the API key, validates an app-side shared secret, and forwards prompts. This lets us swap models, rate-limit, or replace providers without an app update.
- **Wall-clock timer over coroutine `delay`.** A 15-minute focus session run with `delay(1000)` drifts noticeably under doze, recomposition pressure, or app-backgrounding. The current implementation polls `System.currentTimeMillis() - startMillis` so the displayed remaining time reflects reality, not loop iterations.
- **DnD only while running.** The timer flips Do Not Disturb on at start and off at pause, done, or VM `onCleared()`. Crash mid-session and DnD still gets cleared on next launch. The cleanup runs in `onCreate` of `MainActivity` defensively.
- **Two-step add-task flow.** Title → AI suggestions on a second screen. Lets users see and tweak steps before committing instead of locking them in. "Use these steps" hands them straight to focus on step 1; "Save without focus" lands them back on the task list.
- **Step 1 is always doable.** The AI system prompt enforces a 5-minute hard cap and strongly prefers 2-3 minute steps. If the model proposes a longer step, the prompt tells it to split. Users can also tap **Break it down** mid-timer to ask for an even smaller version.
- **Soft delete + auto-purge.** Swipe-to-delete sets `isDeleted = true` and shows a snackbar. The active query filters those out. On VM init we purge any rows still flagged from a prior session. Handles "swiped, then force-quit" without leaking data.
- **Confetti uses an `ArrayList` + `key(tick)`.** Started with `mutableStateListOf` for ergonomics. Performance tanked at >100 particles. Switched to a plain `ArrayList` for O(1) swap-remove, but Compose stopped recomposing the canvas. Wrapping the `Canvas` in `key(tick) { … }` forces a redraw each animation frame without the SnapshotStateList overhead.
- **Glance widget reads from Room directly** via a Hilt-injected repository, not a duplicate persistence layer. Updates fire when `WorkManager` ticks the reminder or when the user saves a task.
- **Single-activity navigation** with route-level transition overrides. Celebrations fade in (more triumphant) while the rest of the app slides horizontally (clear forward and back grammar).

---

## Build

### Prerequisites

- Android Studio Ladybug or newer
- JDK 17 (`brew install openjdk@17`)
- Android SDK with platform 35 + build-tools 35.0.0

### Configure secrets

The app reads several values from `local.properties` (gitignored). Copy `local.properties.example` if present, otherwise create `local.properties` at the project root with:

```properties
sdk.dir=/path/to/Android/sdk

# AI proxy — point at your own Cloudflare Worker (or any compatible endpoint)
PROXY_URL=https://your-proxy.workers.dev
PROXY_APP_SECRET=...
LLM_MODEL=openai/gpt-oss-120b:free

# Optional: legacy direct keys (kept for fallback testing)
GEMINI_API_KEY=
OPENROUTER_API_KEY=
```

Without `PROXY_URL`, AI breakdowns fail loudly with a quota or network error. That's by design. You're not meant to ship a build with no AI backend.

### Debug build

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### Release build

You'll need your own keystore. Generate once:

```bash
keytool -genkeypair -v \
  -keystore app/release.jks \
  -alias stupidsmall \
  -keyalg RSA -keysize 2048 \
  -validity 10000
```

Add to `local.properties`:

```properties
RELEASE_STORE_FILE=release.jks
RELEASE_STORE_PASSWORD=...
RELEASE_KEY_ALIAS=stupidsmall
RELEASE_KEY_PASSWORD=...
```

Build:

```bash
./gradlew bundleRelease       # AAB for Play Store
./gradlew assembleRelease     # APK for sideloading
```

R8 minification and resource shrinking are enabled in release. Without `RELEASE_STORE_FILE` the signing config silently no-ops (intentional: keeps debug builds working when you clone without a keystore).

### AI proxy

The Cloudflare Worker source lives in `proxy/worker.js`. Deploy with:

```bash
cd proxy
wrangler deploy
wrangler secret put GROQ_API_KEY
wrangler secret put APP_SECRET    # must match PROXY_APP_SECRET in local.properties
```

The worker:
- Validates the app-side shared secret in the `X-App-Secret` header
- Maps a model alias (e.g. `openai/gpt-oss-120b:free`) to a real Groq model name
- Forwards to `api.groq.com/openai/v1/chat/completions`
- Logs request counts only, never task content

---

## Privacy

The full privacy policy is hosted at **https://stupidsmall-privacy.pages.dev/privacy.html**.

Short version:
- Tasks and micro-steps live in a Room database on your device. They never leave it.
- AI prompts are sent to a Cloudflare Worker that proxies to Groq. Used to generate the response, not stored.
- No analytics, crash reporting, or ad SDKs.
- Google Play Billing only loads if you tap the Premium upgrade.
- Uninstalling the app removes all your data.

---

## Roadmap

Ideas under consideration for v1.x:

- Cross-device sync (opt-in, end-to-end encrypted) for users who want it
- Calendar integration to surface "what's the next stupidly small thing for this meeting prep"
- Voice-first entry. Describe a task aloud, get a breakdown back.
- Smarter recurring tasks (skip-if-completed-yesterday, custom RRULEs)
- Apple Watch / Wear OS focus timer companion

---

## Built by

Made by [@rjcb-commits](https://github.com/rjcb-commits). If Stupid Small helps you finish something you'd been avoiding, that's the goal.
