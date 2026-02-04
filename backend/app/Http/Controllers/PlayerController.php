<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Player;
use App\Http\Resources\PlayerResource;

class PlayerController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'role_name' => 'required|string',
        ]);

        $player = Player::create($validated);
        return new PlayerResource($player);
    }
}
