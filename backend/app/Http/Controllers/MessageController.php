<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Message;
use App\Http\Resources\MessageResource;
use App\Services\GeminiService;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    protected $geminiService;

    public function __construct(GeminiService $geminiService)
    {
        $this->geminiService = $geminiService;
    }
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

    /**
     * Generate GM narrative using Gemini AI
     */
    public function generateNarrative(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'prompt' => 'required|string|max:2000',
            'context' => 'nullable|array'
        ]);

        // Generate narrative using Gemini
        $result = $this->geminiService->generateNarrative(
            $validated['prompt'],
            $validated['context'] ?? []
        );

        if (!$result['success']) {
            return response()->json([
                'error' => $result['error']
            ], 500);
        }

        // Save GM message to database
        $message = Message::create([
            'room_id' => $validated['room_id'],
            'sender_role' => 'gm',
            'content' => $result['narrative'],
            'image_url' => null,
        ]);

        return response()->json([
            'message' => new MessageResource($message),
            'usage' => $result['usage'] ?? null
        ]);
    }

    /**
     * Describe uploaded image using Gemini Vision
     */
    public function describeImage(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'image' => 'required|image|max:5120', // 5MB max for AI analysis
            'prompt' => 'nullable|string|max:500'
        ]);

        // Store image temporarily for analysis
        $path = $request->file('image')->store('temp', 'public');
        $fullPath = Storage::path('public/' . $path);

        // Analyze image with Gemini Vision
        $result = $this->geminiService->describeUserImage(
            $fullPath,
            $validated['prompt'] ?? ''
        );

        // Clean up temporary file
        Storage::delete('public/' . $path);

        if (!$result['success']) {
            return response()->json([
                'error' => $result['error']
            ], 500);
        }

        // Store the image permanently
        $permanentPath = $request->file('image')->store('messages', 'public');
        $imageUrl = Storage::url($permanentPath);

        // Save user image message
        $userMessage = Message::create([
            'room_id' => $validated['room_id'],
            'sender_role' => 'player',
            'content' => null,
            'image_url' => $imageUrl,
        ]);

        // Save AI description as GM message
        $gmMessage = Message::create([
            'room_id' => $validated['room_id'],
            'sender_role' => 'gm',
            'content' => $result['description'],
            'image_url' => null,
        ]);

        return response()->json([
            'user_message' => new MessageResource($userMessage),
            'gm_response' => new MessageResource($gmMessage),
            'usage' => $result['usage'] ?? null
        ]);
    }

    /**
     * Generate image based on narrative (placeholder for Imagen API)
     */
    public function generateImage(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'prompt' => 'required|string|max:1000',
            'options' => 'nullable|array'
        ]);

        $result = $this->geminiService->generateImage(
            $validated['prompt'],
            $validated['options'] ?? []
        );

        if (!$result['success']) {
            return response()->json([
                'error' => $result['error'],
                'todo' => $result['todo'] ?? null
            ], 501); // Not Implemented
        }

        // This will be implemented when Imagen API is properly configured
        return response()->json([
            'message' => 'Image generation akan diimplementasi setelah konfigurasi Imagen API',
            'result' => $result
        ]);
    }
}
