# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Nexus is a real-time multiplayer narrative game where 4 players collaborate in a session controlled by an AI Game Master. The system uses WebSockets for real-time communication and integrates Google Gemini for text generation/vision and AI-powered image generation.

**Tech Stack:**
- Backend: Laravel 12 (PHP 8.2+) with Laravel Reverb (WebSocket server)
- Frontend: Next.js 16 with React 19, TypeScript, Tailwind CSS 4
- Real-time: Laravel Echo + Pusher protocol via Reverb
- AI: Google Gemini API, Pollinations.ai / Replicate for image generation

## Development Setup

### Three-Terminal Workflow

Development requires **3 concurrent terminal sessions**:

```bash
# Terminal 1: Laravel API Server
cd backend
php artisan serve
# Runs on http://localhost:8000

# Terminal 2: Laravel Reverb WebSocket Server
cd backend
php artisan reverb:start
# Runs on ws://localhost:8081

# Terminal 3: Next.js Frontend
cd frontend
npm run dev
# Runs on http://localhost:3000
```

### Backend Commands

```bash
# First-time setup
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate

# Development
php artisan serve              # Start API server
php artisan reverb:start       # Start WebSocket server
php artisan test              # Run PHPUnit tests
php artisan config:clear      # Clear configuration cache
php artisan cache:clear       # Clear application cache

# Code quality
./vendor/bin/pint             # Laravel Pint (code formatting)
```

### Frontend Commands

```bash
# Setup
cd frontend
npm install

# Development
npm run dev        # Start development server
npm run build      # Production build
npm start          # Start production server
npm run lint       # Run ESLint
```

### Testing API Endpoints

```bash
# Test backend connectivity
curl http://localhost:8000/api/hello

# Test image generation
curl "http://localhost:8000/api/test-image?prompt=a+dragon"

# Test game room join
curl -X POST http://localhost:8000/api/game/join \
  -H "Content-Type: application/json" \
  -d '{"roomId":"TEST","playerId":"123","playerName":"Player1"}'
```

## Architecture

### Real-time Event System

The application uses Laravel Broadcasting with Reverb for WebSocket communication. All events broadcast to public channels (no authentication required).

**Event Flow Pattern:**
1. Frontend calls API endpoint via `frontend/src/lib/api.ts`
2. Backend controller validates request
3. Controller broadcasts event via Laravel Broadcasting
4. Event reaches all connected clients via Laravel Echo
5. Frontend listeners in `frontend/src/lib/socket.ts` handle updates

**Core WebSocket Events:**

| Event Name | Trigger | Payload | Purpose |
|------------|---------|---------|---------|
| `player.joined` | POST `/api/game/join` | `{player, playerCount}` | Player enters room |
| `player.ready` | POST `/api/game/ready` | `{playerId, isReady}` | Player toggles ready status |
| `game.start` | POST `/api/game/start` | `{gameMasterId}` | Game begins |
| `gm.prompt` | POST `/api/game/gm-prompt` | `{prompt, imageUrl}` | GM sends initial scenario |
| `gm.description` | POST `/api/game/send-description` | `{description}` | GM describes scene for guessers |
| `gm.message` | Various | `{message}` | GM sends chat message |
| `image.generated` | POST `/api/game/submit-guess` | `{playerId, playerName, imageUrl}` | Player's guess image ready |
| `scene.generated` | System | `{sceneUrl}` | Scene image generation complete |
| `player.left` | POST `/api/game/leave` | `{playerId, playerCount}` | Player exits room |

**Channel Naming:** All events broadcast to `game.room.{roomId}` public channels.

### Backend Structure

```
backend/app/
├── Events/              # Laravel Broadcasting events (implement ShouldBroadcastNow)
│   ├── PlayerJoined.php
│   ├── PlayerReady.php
│   ├── GameStarted.php
│   ├── GMPromptSent.php
│   ├── GMDescriptionSent.php
│   ├── GmMessageSent.php
│   ├── ImageGenerated.php
│   ├── SceneGenerated.php
│   └── PlayerLeft.php
├── Http/Controllers/
│   ├── GameController.php        # Main game logic & WebSocket triggers
│   ├── MessageController.php     # AI narrative/image/description endpoints
│   ├── RoomController.php        # Room management
│   └── PlayerController.php      # Player management
├── Services/
│   ├── ImageGenerationService.php  # AI image generation (Replicate/Pollinations)
│   └── GeminiService.php           # Google Gemini text/vision integration
└── Models/              # Player state managed via cache, not database
```

**State Management:**
- Player lists stored in Laravel cache with key pattern: `room.{roomId}.players`
- Cache backend: Database (configured via `CACHE_STORE=database` in `.env`)
- Cache TTL: 3600 seconds (1 hour)
- No database persistence for active game state (cache only)
- Player object structure: `{id, name, isGameMaster, isConnected, score, isReady?}`

### Frontend Structure

```
frontend/src/
├── app/                 # Next.js App Router pages
│   ├── page.tsx        # Home/landing page
│   ├── lobby/          # Pre-game player waiting room
│   ├── gm-setup/       # GM setup and configuration
│   ├── game-master/    # GM interface (sends prompts/descriptions)
│   ├── player/         # Player interface (submits guesses)
│   ├── game/[roomId]/  # Dynamic game room page
│   ├── role-reveal/    # Role assignment screens (GM & Player)
│   ├── results/        # End-game results
│   ├── leaderboard/    # Score comparison
│   ├── comparison/     # Image comparison view
│   ├── demo/           # Demo/tutorial page
│   └── about/          # About page
├── lib/
│   ├── api.ts          # API client functions (fetch wrappers)
│   ├── socket.ts       # WebSocket event handlers (Laravel Echo)
│   ├── echo.ts         # Echo instance configuration
│   └── debug.ts        # Logging utilities for debugging
└── components/         # React components
```

## Environment Configuration

### Backend (.env)

Critical environment variables:

```bash
# Database (uses SQLite by default)
DB_CONNECTION=sqlite

# WebSocket Server (Reverb)
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=1
REVERB_APP_KEY=local-app-key
REVERB_APP_SECRET=local-app-secret
REVERB_HOST=localhost
REVERB_PORT=8081
REVERB_SCHEME=http

# AI Services (optional but recommended)
GOOGLE_GEMINI_API_KEY=          # For AI text generation
HUGGINGFACE_TOKEN=              # For better image quality
REPLICATE_API_TOKEN=            # Alternative image gen (paid)
```

### Frontend (.env.local)

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Laravel Reverb WebSocket
NEXT_PUBLIC_REVERB_APP_KEY=local-app-key
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8081
NEXT_PUBLIC_REVERB_SCHEME=http

# Google Gemini API (for frontend-side AI features)
NEXT_PUBLIC_GEMINI_API_KEY=your-api-key-here
GEMINI_API_KEY=your-api-key-here
```

**Important:**
- All frontend env vars must start with `NEXT_PUBLIC_` to be accessible in browser
- **Security Warning**: Never commit `.env.local` with real API keys. The current repository contains an exposed Gemini API key in version control - regenerate and remove it immediately
- Use `.env.local.example` for templates without real credentials

## Image Generation Hierarchy

The system auto-selects the best available image generation service:

1. **Replicate API** (best quality, requires `REPLICATE_API_TOKEN`)
   - Uses Stable Diffusion XL
   - Async prediction-based API
   - Falls back to Pollinations on failure

2. **Pollinations.ai** (free, no API key)
   - Direct URL-based generation
   - Format: `https://image.pollinations.ai/prompt/{encoded_prompt}?width=512&height=512&seed={seed}`
   - Always works as fallback

Implementation: `backend/app/Services/ImageGenerationService.php`

## Common Debugging Steps

### WebSocket Connection Issues

1. Verify all 3 servers are running:
   ```bash
   lsof -i :8000   # Laravel API
   lsof -i :8081   # Reverb WebSocket
   lsof -i :3000   # Next.js
   ```

2. Check browser console for Echo initialization:
   ```
   Look for: "[Echo] Initialized with Reverb broadcaster"
   ```

3. Monitor Reverb terminal for connection logs

4. Check Laravel logs:
   ```bash
   tail -f backend/storage/logs/laravel.log
   ```

### API Connection Errors (ERR_NAME_NOT_RESOLVED)

This usually means:
- Backend server isn't running
- Wrong `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- CORS issues (already configured to allow all origins)

See [DEBUGGING_GUIDE.md](DEBUGGING_GUIDE.md) for detailed troubleshooting.

### Event Not Broadcasting

1. Ensure event class implements `ShouldBroadcastNow` (not queued)
2. Verify `BROADCAST_CONNECTION=reverb` in backend `.env`
3. Check event class has:
   - `broadcastOn()` returns `[new Channel('game.room.' . $this->roomId)]`
   - `broadcastAs()` returns event name (e.g., `'player.joined'`)
   - `broadcastWith()` returns payload array

## Game Flow

1. **Lobby Phase:** Players join room via `/api/game/join`, see live player count via `player.joined` events
2. **Role Assignment:** Frontend assigns 1 Game Master + 3 Players locally
3. **Game Start:** GM triggers `/api/game/start`, broadcasts to all via `game.start` event
4. **GM Prompt:** GM sends initial scenario + image via `/api/game/gm-prompt`
5. **GM Description:** GM provides text description via `/api/game/send-description`
6. **Player Guesses:** Players submit text prompts via `/api/game/submit-guess`, receive generated images
7. **Results:** Frontend calculates scores and shows results page

## Important Notes

- **No Authentication:** Channels are public, suitable for hackathon/demo
- **No Persistence:** Game state exists only in cache during active session
- **Rate Limiting:** Free Pollinations API has no rate limits but may have quality variations
- **CORS:** Backend configured to allow all origins (`'allowed_origins' => ['*']`)
- **Image Loading:** Generated image URLs are direct links, no need to proxy

## Common Pitfalls

1. **Forgetting Reverb Server:** Must run `php artisan reverb:start` separately from `php artisan serve`
2. **Port Conflicts:** Default ports 8000/8081/3000 must be available
3. **Cache Confusion:** Player state in cache doesn't persist across server restarts
4. **Event Naming:** Frontend listens for exact event names from `broadcastAs()`, not class names
5. **Environment Variables:** Frontend env changes require Next.js server restart

## File References for Common Tasks

- **Add new WebSocket event**: Create in `backend/app/Events/`, follow [PlayerJoined.php](backend/app/Events/PlayerJoined.php) pattern
- **Add new API endpoint**: Register in [backend/routes/api.php](backend/routes/api.php), implement in [GameController.php](backend/app/Http/Controllers/GameController.php)
- **Add WebSocket listener**: Update [frontend/src/lib/socket.ts](frontend/src/lib/socket.ts)
- **Modify API calls**: Update [frontend/src/lib/api.ts](frontend/src/lib/api.ts)
- **Change UI pages**: Navigate to `frontend/src/app/{page-name}/page.tsx`
- **Image generation logic**: See [ImageGenerationService.php](backend/app/Services/ImageGenerationService.php)
- **AI text/vision**: See [GeminiService.php](backend/app/Services/GeminiService.php)

## Complete API Endpoint Reference

### Game Management
- `POST /api/game/join` - Join a game room
- `POST /api/game/ready` - Toggle player ready status
- `POST /api/game/start` - Start the game (GM only)
- `POST /api/game/leave` - Leave the room
- `POST /api/game/gm-prompt` - GM sends initial prompt with image
- `POST /api/game/send-description` - GM sends text description
- `POST /api/game/submit-guess` - Player submits guess for image generation
- `POST /api/game/generate-image` - Generate image from prompt

### AI & Messages (Legacy)
- `POST /api/messages/generate-narrative` - Generate narrative text
- `POST /api/messages/describe-image` - Describe uploaded image
- `POST /api/messages/generate-image` - Generate image from text

### Testing & Utilities
- `GET /api/hello` - Test backend connectivity
- `GET /api/test-image?prompt={text}` - Test image generation
