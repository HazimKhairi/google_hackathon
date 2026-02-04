<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Room;
use App\Http\Resources\RoomResource;

class RoomController extends Controller
{
    public function store(Request $request)
    {
        $room = Room::create(['status' => 'pending']);
        return new RoomResource($room);
    }

    public function show(string $id)
    {
        $room = Room::findOrFail($id);
        return new RoomResource($room);
    }
}
