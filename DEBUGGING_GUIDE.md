# 🔍 Debugging Guide - ERR_NAME_NOT_RESOLVED

## What We Added

### 1. Backend Logging (Laravel)
- ✅ Logs all `sendDescription` API calls
- ✅ Shows request data, room ID, description
- ✅ Tracks broadcast events

### 2. Frontend Logging (Game Master)
- ✅ Detailed console logs for every step
- ✅ Shows room ID, description, API calls
- ✅ Error tracking with stack traces

### 3. Network Monitor
- ✅ Tracks ALL fetch requests
- ✅ Monitors WebSocket connections
- ✅ Shows exact URLs being called
- ✅ Catches ERR_NAME_NOT_RESOLVED errors

---

## How to Debug ERR_NAME_NOT_RESOLVED

### Step 1: Open Browser DevTools
```
Chrome: F12 or Cmd+Option+I (Mac) / Ctrl+Shift+I (Windows)
```

### Step 2: Go to Console Tab
Look for these debug logs when GM submits description:

```
✅ Good logs:
[GM] ========== SUBMIT DESCRIPTION START ==========
[Socket] ========== SEND DESCRIPTION START ==========
[DEBUG] 🌐 Fetch Request: { url: "http://localhost:8000/api/game/send-description" }
[DEBUG] ✅ Fetch Response: { status: 200, ok: true }
[Socket] Description sent successfully!

❌ Error logs (ERR_NAME_NOT_RESOLVED):
[DEBUG] ❌ Fetch Error: { error: "Failed to fetch", url: "..." }
[Socket] ========== SEND DESCRIPTION ERROR ==========
```

### Step 3: Check Network Tab
1. Click "Network" tab in DevTools
2. Filter by "Fetch/XHR"
3. Try submitting description
4. Look for RED failed requests
5. Click on failed request to see:
   - Request URL (check for typos)
   - Request Headers
   - Error message

### Step 4: Check Laravel Logs
```bash
cd backend
tail -f storage/logs/laravel.log
```

Look for:
```
[GameController] sendDescription called
[GameController] Broadcasting GMDescriptionSent
```

---

## Common Causes of ERR_NAME_NOT_RESOLVED

### 1. Wrong API URL in .env
**Check:** `frontend/.env.local`
```bash
# Should be:
NEXT_PUBLIC_API_URL=http://localhost:8000

# NOT:
NEXT_PUBLIC_API_URL=http://api.example.com  ❌
```

### 2. Backend Server Not Running
```bash
# Check if Laravel is running:
lsof -i :8000

# If not running, start it:
cd backend
php artisan serve
```

### 3. Malformed Image URL
The error might be from trying to load an image, not the API.

**Check console for:**
```
[DEBUG] 🌐 Fetch Request: { url: "https://invalid-domain.com/image.jpg" }
```

### 4. CORS Issues (looks like DNS but isn't)
```
❌ CORS error (NOT DNS):
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked

✅ Real DNS error:
net::ERR_NAME_NOT_RESOLVED
```

---

## Testing Right Now

### 1. Test Backend API Directly
```bash
curl -X POST http://localhost:8000/api/game/send-description \
  -H "Content-Type: application/json" \
  -d '{"roomId":"TEST","description":"A dragon"}'

# Should return:
{"success":true,"message":"Description sent successfully"}
```

### 2. Test Frontend API Call
Open browser console and run:
```javascript
fetch('http://localhost:8000/api/game/send-description', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ roomId: 'TEST', description: 'A dragon' })
})
.then(r => r.json())
.then(d => console.log('✅ Success:', d))
.catch(e => console.error('❌ Error:', e));
```

### 3. Check All Services Running
```bash
# Backend (Laravel)
lsof -i :8000   # Should show php

# Frontend (Next.js)
lsof -i :3000   # Should show node

# WebSocket (Reverb)
lsof -i :8081   # Should show php
```

---

## What to Share for Help

When reporting the error, include:

1. **Browser Console Log**
   - Copy ALL logs starting from "========== SUBMIT DESCRIPTION START =========="

2. **Network Tab Screenshot**
   - Show the failed request (RED)
   - Click on it and show "Headers" tab

3. **Laravel Log**
   ```bash
   tail -20 backend/storage/logs/laravel.log
   ```

4. **Environment Check**
   ```bash
   # Frontend
   cat frontend/.env.local | grep API_URL

   # Backend
   lsof -i :8000
   ```

---

## Quick Fix Checklist

- [ ] Backend server running? (`lsof -i :8000`)
- [ ] Frontend server running? (`lsof -i :3000`)
- [ ] Reverb server running? (`lsof -i :8081`)
- [ ] Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- [ ] Check browser console for exact failing URL
- [ ] Test API endpoint directly with curl
- [ ] Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
- [ ] Try in Incognito mode

---

## Next Steps

1. **Open browser DevTools (F12)**
2. **Go to game-master page**
3. **Try to send description**
4. **Copy ALL console logs** (starting from "========== SUBMIT")"
5. **Check Network tab** for RED failed request
6. **Share logs with developer**

The detailed logs will show EXACTLY where the DNS error is happening! 🎯
