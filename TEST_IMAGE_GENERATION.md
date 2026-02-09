# Testing Image Generation - Diagnostic Guide

## Prerequisites

Make sure ALL 3 servers are running:

```bash
# Terminal 1: Laravel API
cd backend
php artisan serve
# Should show: http://127.0.0.1:8000

# Terminal 2: Reverb WebSocket
cd backend
php artisan reverb:start
# Should show: Reverb server started on 127.0.0.1:8081

# Terminal 3: Next.js Frontend
cd frontend
npm run dev
# Should show: http://localhost:3000
```

## Test 1: Direct Image Generation (Backend Only)

Test if the image service works independently:

```bash
# Test Pollinations (always works, no API key)
curl "http://localhost:8000/api/test-image?prompt=a+dragon+breathing+fire"
```

**Expected output:**
```json
{
  "prompt": "a dragon breathing fire",
  "imageUrl": "https://image.pollinations.ai/prompt/...",
  "service": "Pollinations (Free)"
}
```

If this fails:
- Check Laravel server is running on port 8000
- Check `backend/storage/logs/laravel.log` for errors

## Test 2: Full API Flow (Backend)

Test the submit-guess endpoint directly:

```bash
curl -X POST http://localhost:8000/api/game/submit-guess \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "TEST123",
    "playerId": "player-test",
    "playerName": "TestPlayer",
    "guessPrompt": "a mystical dragon in moonlight"
  }'
```

**Expected output:**
```json
{
  "success": true,
  "message": "Guess submitted successfully",
  "imageUrl": "https://image.pollinations.ai/prompt/..."
}
```

**What this tests:**
- GameController receives request ✓
- ImageGenerationService generates URL ✓
- ImageGenerated event broadcasts ✓

If this fails:
- Check Laravel logs: `tail -f backend/storage/logs/laravel.log`
- Check if Reverb is running (for broadcast to work)

## Test 3: WebSocket Event Broadcasting

After running Test 2, check if the event was broadcast:

1. **Check Reverb terminal** - You should see:
   ```
   [2024-XX-XX HH:MM:SS] Message received on channel: game.room.TEST123
   [2024-XX-XX HH:MM:SS] Broadcasting: App\Events\ImageGenerated
   ```

2. **Check Laravel logs**:
   ```bash
   tail -n 20 backend/storage/logs/laravel.log | grep ImageGenerated
   ```

If no broadcast message appears:
- Reverb isn't running
- `BROADCAST_CONNECTION` is not set to `reverb` in backend `.env`
- Event class doesn't implement `ShouldBroadcastNow`

## Test 4: Frontend Connection

Open browser console (F12) and check:

1. **Echo initialization:**
   ```
   [Echo] Initialized with Reverb broadcaster
   [Socket] Subscribed to room channel: game.room.{roomId}
   ```

2. **Submit a guess** and watch for:
   ```
   [Player] Submitting guess: {your guess}
   [Socket] Player {id} submitting guess: {text}
   [Socket] Guess submitted successfully: {data with imageUrl}
   ```

3. **Listen for event:**
   ```
   [Player] Image generated: {playerId, playerName, imageUrl}
   ```

## Common Issues & Fixes

### Issue 1: "AI still not generating image"

**Symptom:** Player submits guess, stays on "Generating..." forever

**Causes:**
1. Backend API not reachable
2. Image generation fails silently
3. WebSocket event not received

**Fix:**
```bash
# Check all services are running
lsof -i :8000  # Laravel API
lsof -i :8081  # Reverb WebSocket
lsof -i :3000  # Next.js

# Check frontend env
cat frontend/.env.local
# Should have: NEXT_PUBLIC_API_URL=http://localhost:8000

# Test direct API call (see Test 2 above)
```

### Issue 2: Image URL generated but not showing

**Symptom:** Backend returns imageUrl, but frontend doesn't display it

**Causes:**
1. WebSocket not connected
2. Event name mismatch
3. Frontend not listening to correct event

**Debug:**
```javascript
// Open browser console, paste this:
console.log('[Debug] Current roomId:', window.sessionStorage.getItem('roomId'));
console.log('[Debug] Current playerId:', window.sessionStorage.getItem('playerId'));

// Check if Echo is connected:
window.Echo?.connector?.pusher?.connection?.state
// Should be: "connected"
```

### Issue 3: Pollinations URL generated but image doesn't load

**Symptom:** imageUrl is like `https://image.pollinations.ai/prompt/...` but shows broken image

**Causes:**
1. CORS issue (already fixed in backend)
2. Pollinations API is temporarily slow/down
3. Browser blocking external images

**Fix:**
- Try opening the imageUrl directly in a new tab
- Check browser console for CORS errors
- Wait 5-10 seconds (Pollinations can be slow)

### Issue 4: Events not broadcasting

**Symptom:** API call succeeds but no WebSocket event received

**Checklist:**
- [ ] Reverb server is running (`php artisan reverb:start`)
- [ ] Backend `.env` has `BROADCAST_CONNECTION=reverb`
- [ ] Event class implements `ShouldBroadcastNow` (not `ShouldBroadcast`)
- [ ] Frontend `.env.local` has matching `NEXT_PUBLIC_REVERB_*` values
- [ ] Browser console shows Echo connected

**Fix:**
```bash
# Restart all servers in this order:
# 1. Stop all (Ctrl+C in each terminal)
# 2. Start Reverb first
cd backend && php artisan reverb:start

# 3. Start Laravel API (new terminal)
cd backend && php artisan serve

# 4. Start Next.js (new terminal)
cd frontend && npm run dev
```

## Quick Test Script

Run this in your browser console to test the complete flow:

```javascript
// 1. Join a test room
fetch('http://localhost:8000/api/game/join', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    roomId: 'TEST123',
    playerId: 'test-player-1',
    playerName: 'Test Player',
    isGameMaster: false
  })
})
.then(r => r.json())
.then(d => console.log('✅ Joined room:', d))
.catch(e => console.error('❌ Join failed:', e));

// 2. Submit a guess (image generation happens here)
fetch('http://localhost:8000/api/game/submit-guess', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    roomId: 'TEST123',
    playerId: 'test-player-1',
    playerName: 'Test Player',
    guessPrompt: 'a mystical dragon in moonlight'
  })
})
.then(r => r.json())
.then(d => {
  console.log('✅ Guess submitted:', d);
  console.log('🖼️ Image URL:', d.imageUrl);
  console.log('📋 Copy this URL and open in new tab:', d.imageUrl);
})
.catch(e => console.error('❌ Guess failed:', e));
```

## Expected Complete Flow

When everything works correctly:

1. **Player submits guess**
   - Console: `[Player] Submitting guess: {text}`
   - Network tab: POST to `/api/game/submit-guess` returns 200

2. **Backend generates image**
   - Laravel log: `[GameController] submitGuess called`
   - Image URL generated (Pollinations or Replicate)
   - Laravel log: Broadcasting ImageGenerated event

3. **Reverb broadcasts**
   - Reverb terminal: `Broadcasting: App\Events\ImageGenerated`
   - Reverb terminal: `Message sent to channel: game.room.{roomId}`

4. **Frontend receives**
   - Console: `[Player] Image generated: {data}`
   - Console: `[Player] Setting playerImage`
   - UI: Image appears, phase changes to 'done'

## Still Not Working?

Share these logs:

1. **Browser console output** (all `[Player]` and `[Socket]` logs)
2. **Laravel logs**: `tail -n 50 backend/storage/logs/laravel.log`
3. **Reverb terminal output** (last 20 lines)
4. **Network tab** in browser DevTools (filter: Fetch/XHR, show failed requests)

Include the output of:
```bash
# Check services
lsof -i :8000 && lsof -i :8081 && lsof -i :3000

# Check env
cat frontend/.env.local | grep API_URL
cat backend/.env | grep BROADCAST
```
