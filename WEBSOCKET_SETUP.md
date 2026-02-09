# WebSocket Setup Guide

This guide explains how to set up and run the WebSocket server for real-time game communication.

## Architecture

- **Backend**: Laravel with Laravel Reverb (WebSocket server)
- **Frontend**: Next.js with Laravel Echo client
- **Protocol**: WebSocket over Reverb

## Backend Setup

### 1. Install Dependencies

The required packages are already in `composer.json`:
- `laravel/reverb`: WebSocket server

Make sure dependencies are installed:
```bash
cd backend
composer install
```

### 2. Configuration

The `.env` file is already configured with:
```env
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=1
REVERB_APP_KEY=local-app-key
REVERB_APP_SECRET=local-app-secret
REVERB_HOST=localhost
REVERB_PORT=8081
REVERB_SCHEME=http
```

### 3. Start Laravel Reverb Server

In a terminal, navigate to the backend folder and start Reverb:
```bash
cd backend
php artisan reverb:start
```

The WebSocket server will start on `ws://localhost:8080`.

### 4. Start Laravel Backend Server

In another terminal, start the Laravel API server:
```bash
cd backend
php artisan serve
```

The API will be available at `http://localhost:8000`.

## Frontend Setup

### 1. Install Dependencies

The required packages are already in `package.json`:
- `laravel-echo`: WebSocket client
- `pusher-js`: Pusher protocol (used by Reverb)

Make sure dependencies are installed:
```bash
cd frontend
npm install
```

### 2. Configuration

The `.env.local` file is already configured with:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_REVERB_APP_KEY=local-app-key
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8081
NEXT_PUBLIC_REVERB_SCHEME=http
```

### 3. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Testing the WebSocket Connection

### 1. Start all servers

You need **3 terminals running simultaneously**:

**Terminal 1 - Reverb WebSocket Server:**
```bash
cd backend
php artisan reverb:start
```

**Terminal 2 - Laravel API Server:**
```bash
cd backend
php artisan serve
```

**Terminal 3 - Next.js Frontend:**
```bash
cd frontend
npm run dev
```

### 2. Open the application

1. Open browser to `http://localhost:3000`
2. Navigate to a game lobby or room
3. Open browser console (F12) to see WebSocket connection logs
4. Look for `[Echo] Initialized with Reverb broadcaster` message

### 3. Test real-time events

When players join rooms or game events occur, you should see:
- Console logs showing WebSocket events
- Real-time updates across multiple browser tabs/windows
- No page refreshes needed for updates

## Available WebSocket Events

### Backend → Frontend (Server to Client)

- `player.joined` - When a player joins the room
- `game.start` - When the game starts
- `gm.prompt` - GM sends initial prompt and image
- `gm.description` - GM sends description for guessers
- `image.generated` - Player's generated image is ready
- `player.left` - When a player leaves the room

### Frontend → Backend (Client to Server via API)

- `POST /api/game/join` - Join a game room
- `POST /api/game/start` - Start the game
- `POST /api/game/send-description` - GM sends description
- `POST /api/game/submit-guess` - Player submits guess
- `POST /api/game/leave` - Leave the room

## Troubleshooting

### WebSocket connection fails

1. Ensure Reverb server is running: `php artisan reverb:start`
2. Check port 8080 is not in use by another service
3. Verify `.env` configuration matches on both backend and frontend

### Events not broadcasting

1. Check `BROADCAST_CONNECTION=reverb` in backend `.env`
2. Ensure Laravel queue worker is running if using queued broadcasts
3. Check Laravel logs: `backend/storage/logs/laravel.log`

### CORS issues

If you see CORS errors, the backend broadcasting config already allows all origins (`'allowed_origins' => ['*']` in `config/reverb.php`).

### Authentication issues with presence channels

The channels.php has been updated to allow guest access without authentication. If you still have issues, check `backend/routes/channels.php`.

## Development Tips

### Enable debug mode

Laravel already has `APP_DEBUG=true` in `.env` for detailed error messages.

### Monitor WebSocket traffic

Watch the Reverb console for real-time WebSocket events when running `php artisan reverb:start`.

### Clear Laravel caches

If configuration changes aren't taking effect:
```bash
cd backend
php artisan config:clear
php artisan cache:clear
```

## Production Deployment

For production, you'll need to:

1. Use a process manager like Supervisor to keep Reverb running
2. Set up SSL/TLS for secure WebSocket (wss://)
3. Update environment variables for production domains
4. Configure proper authentication for presence channels
5. Set up Redis for scaling Reverb across multiple servers

See Laravel Reverb documentation for production deployment: https://laravel.com/docs/reverb
