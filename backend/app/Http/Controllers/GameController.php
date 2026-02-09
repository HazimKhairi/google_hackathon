<?php

namespace App\Http\Controllers;

use App\Events\PlayerJoined;
use App\Events\GameStarted;
use App\Events\GMPromptSent;
use App\Events\GMDescriptionSent;
use App\Events\ImageGenerated;
use App\Events\PlayerLeft;
use App\Events\PlayerReady;
use App\Services\ImageGenerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GameController extends Controller
{
    /**
     * Player joins a game room
     */
    public function joinRoom(Request $request)
    {
        $validated = $request->validate([
            'roomId' => 'required|string',
            'playerId' => 'required|string',
            'playerName' => 'required|string',
        ]);

        $roomId = $validated['roomId'];
        $player = [
            'id' => $validated['playerId'],
            'name' => $validated['playerName'],
            'isGameMaster' => $request->input('isGameMaster', false),
            'isConnected' => true,
            'score' => 0,
        ];

        // Get existing players from cache
        $cacheKey = "room.{$roomId}.players";
        $players = cache()->get($cacheKey, []);

        // Check if player already exists (avoid duplicates)
        $existingIndex = array_search($player['id'], array_column($players, 'id'));
        if ($existingIndex !== false) {
            // Update existing player
            $players[$existingIndex] = $player;
        } else {
            // Add new player
            $players[] = $player;
        }

        // Store updated player list in cache (expires in 1 hour)
        cache()->put($cacheKey, $players, 3600);

        $playerCount = count($players);

        // Broadcast the player joined event
        broadcast(new PlayerJoined($roomId, $player, $playerCount));

        return response()->json([
            'success' => true,
            'message' => 'Player joined successfully',
            'player' => $player,
            'players' => $players,  // Return all players
            'playerCount' => $playerCount,
        ]);
    }

    /**
     * Toggle player ready status
     */
    public function toggleReady(Request $request)
    {
        $validated = $request->validate([
            'roomId' => 'required|string',
            'playerId' => 'required|string',
            'isReady' => 'required|boolean',
        ]);

        $roomId = $validated['roomId'];
        $playerId = $validated['playerId'];
        $isReady = $validated['isReady'];

        // Update player ready status in cache
        $cacheKey = "room.{$roomId}.players";
        $players = cache()->get($cacheKey, []);

        foreach ($players as &$player) {
            if ($player['id'] === $playerId) {
                $player['isReady'] = $isReady;
                break;
            }
        }

        cache()->put($cacheKey, $players, 3600);

        // Broadcast ready status to all players
        broadcast(new PlayerReady($roomId, $playerId, $isReady));

        return response()->json([
            'success' => true,
            'playerId' => $playerId,
            'isReady' => $isReady,
        ]);
    }

    /**
     * Start the game
     */
    public function startGame(Request $request)
    {
        $validated = $request->validate([
            'roomId' => 'required|string',
            'gameMasterId' => 'required|string',
        ]);

        $roomId = $validated['roomId'];
        $gameMasterId = $validated['gameMasterId'];

        // Broadcast the game started event
        broadcast(new GameStarted($roomId, $gameMasterId));

        return response()->json([
            'success' => true,
            'message' => 'Game started successfully',
        ]);
    }

    /**
     * Send GM prompt with image
     */
    public function sendGMPrompt(Request $request)
    {
        $validated = $request->validate([
            'roomId' => 'required|string',
            'prompt' => 'required|string',
            'imageUrl' => 'required|string',
        ]);

        $roomId = $validated['roomId'];
        $prompt = $validated['prompt'];
        $imageUrl = $validated['imageUrl'];

        // Broadcast the GM prompt event
        broadcast(new GMPromptSent($roomId, $prompt, $imageUrl));

        return response()->json([
            'success' => true,
            'message' => 'GM prompt sent successfully',
        ]);
    }

    /**
     * Send GM description
     */
    public function sendDescription(Request $request)
    {
        \Log::info('[GameController] sendDescription called', [
            'request_data' => $request->all()
        ]);

        $validated = $request->validate([
            'roomId' => 'required|string',
            'description' => 'required|string',
        ]);

        $roomId = $validated['roomId'];
        $description = $validated['description'];

        \Log::info('[GameController] Broadcasting GMDescriptionSent', [
            'roomId' => $roomId,
            'description' => $description
        ]);

        // Broadcast the GM description event
        broadcast(new GMDescriptionSent($roomId, $description));

        \Log::info('[GameController] GMDescriptionSent broadcast complete');

        return response()->json([
            'success' => true,
            'message' => 'Description sent successfully',
            'debug' => [
                'roomId' => $roomId,
                'descriptionLength' => strlen($description)
            ]
        ]);
    }

    /**
     * Submit player guess
     */
    public function submitGuess(Request $request)
    {
        $validated = $request->validate([
            'roomId' => 'required|string',
            'playerId' => 'required|string',
            'playerName' => 'required|string',
            'guessPrompt' => 'required|string',
        ]);

        $roomId = $validated['roomId'];
        $playerId = $validated['playerId'];
        $playerName = $validated['playerName'];
        $guessPrompt = $validated['guessPrompt'];

        // Generate image using AI service
        // Will auto-select: HuggingFace (if token available) or Pollinations (free fallback)
        $imageUrl = ImageGenerationService::generate($guessPrompt, crc32($playerId));

        // Simulate image generation delay
        // In production, this would be async via queue

        // Broadcast the image generated event
        broadcast(new ImageGenerated($roomId, $playerId, $playerName, $imageUrl));

        return response()->json([
            'success' => true,
            'message' => 'Guess submitted successfully',
            'imageUrl' => $imageUrl,
        ]);
    }

    /**
     * Generate an image from a prompt using the best available service
     */
    public function generateImage(Request $request)
    {
        $validated = $request->validate([
            'prompt' => 'required|string|max:500',
        ]);

        $prompt = $validated['prompt'];

        Log::info('[GameController] Generating image for prompt: ' . $prompt);

        $imageUrl = ImageGenerationService::generate($prompt);

        return response()->json([
            'success' => true,
            'imageUrl' => $imageUrl,
        ]);
    }

    /**
     * Player leaves the room
     */
    public function leaveRoom(Request $request)
    {
        $validated = $request->validate([
            'roomId' => 'required|string',
            'playerId' => 'required|string',
        ]);

        $roomId = $validated['roomId'];
        $playerId = $validated['playerId'];

        // Get existing players from cache
        $cacheKey = "room.{$roomId}.players";
        $players = cache()->get($cacheKey, []);

        // Remove player from list
        $players = array_filter($players, function($p) use ($playerId) {
            return $p['id'] !== $playerId;
        });

        // Re-index array
        $players = array_values($players);

        // Update cache
        if (empty($players)) {
            cache()->forget($cacheKey);
        } else {
            cache()->put($cacheKey, $players, 3600);
        }

        $playerCount = count($players);

        // Broadcast the player left event
        broadcast(new PlayerLeft($roomId, $playerId, $playerCount));

        return response()->json([
            'success' => true,
            'message' => 'Player left successfully',
            'playerCount' => $playerCount,
        ]);
    }
}
