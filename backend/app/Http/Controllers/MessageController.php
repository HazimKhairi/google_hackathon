<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Message;
use App\Http\Resources\MessageResource;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $roomId = $request->query('room_id');
        if (!$roomId) {
            return response()->json(['error' => 'room_id is required'], 400);
        }
        return MessageResource::collection(Message::where('room_id', $roomId)->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'sender_role' => 'required|string',
            'content' => 'nullable|string',
            'image' => 'nullable|image|max:2048', // 2MB max
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('messages', 'public');
            $imageUrl = Storage::url($path);
        }

        $message = Message::create([
            'room_id' => $validated['room_id'],
            'sender_role' => $validated['sender_role'],
            'content' => $validated['content'] ?? null,
            'image_url' => $imageUrl,
        ]);

        return new MessageResource($message);
    }
}
