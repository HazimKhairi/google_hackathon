<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\MessageController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/hello', function () {
    return response()->json(['message' => 'Hello from Laravel Backend!']);
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
