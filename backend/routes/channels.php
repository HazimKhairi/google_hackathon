<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
*/

// This defines the "game.room.{id}" channel.
// It creates a "Presence Channel" that tracks who is online.
Broadcast::channel('game.room.{roomId}', function (User $user, $roomId) {
    
    // 1. In a real app, you might check "if ($user->room_id == $roomId)" here.
    // For the hackathon, we allow anyone with the ID to join.

    // 2. Return the data you want to show in the "Lobby" on the Frontend.
    return [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        // If you added a 'role' column to your users table, uncomment this:
        // 'role' => $user->role, 
    ];
});