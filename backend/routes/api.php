<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\GameController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/hello', function () {
    return response()->json(['message' => 'Hello from Laravel Backend!']);
});

// Test image generation
Route::get('/test-image', function () {
    $prompt = request()->input('prompt', 'a beautiful sunset over mountains');
    $url = \App\Services\ImageGenerationService::generate($prompt);

    return response()->json([
        'prompt' => $prompt,
        'imageUrl' => $url,
        'service' => str_contains($url, 'pollinations') ? 'Pollinations (Free)' : 'HuggingFace (AI)',
    ]);
});

Route::post('/rooms', [RoomController::class, 'store']);
Route::get('/rooms/{id}', [RoomController::class, 'show']);
Route::post('/players', [PlayerController::class, 'store']);
Route::get('/messages', [MessageController::class, 'index']);
Route::post('/messages', [MessageController::class, 'store']);

// AI-powered endpoints
Route::post('/messages/generate-narrative', [MessageController::class, 'generateNarrative']);
Route::post('/messages/describe-image', [MessageController::class, 'describeImage']);
Route::post('/messages/generate-image', [MessageController::class, 'generateImage']);

// Game WebSocket endpoints
Route::post('/game/join', [GameController::class, 'joinRoom']);
Route::post('/game/ready', [GameController::class, 'toggleReady']);
Route::post('/game/start', [GameController::class, 'startGame']);
Route::post('/game/gm-prompt', [GameController::class, 'sendGMPrompt']);
Route::post('/game/send-description', [GameController::class, 'sendDescription']);
Route::post('/game/submit-guess', [GameController::class, 'submitGuess']);
Route::post('/game/leave', [GameController::class, 'leaveRoom']);
Route::post('/game/generate-image', [GameController::class, 'generateImage']);
