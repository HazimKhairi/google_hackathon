<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Request;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
*/

// Public channels don't require authentication
// The "game.room.{id}" channel is now a public channel
// Player join/leave events are broadcast via PlayerJoined and PlayerLeft events

// If you want to add authorization logic in the future, uncomment below:
// Broadcast::channel('game.room.{roomId}', function ($user, $roomId) {
//     return ['id' => $user->id, 'name' => $user->name];
// });