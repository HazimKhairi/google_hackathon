<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Room;

class RoomTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_room()
    {
        $response = $this->postJson('/api/rooms');

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'status',
                    'created_at',
                    'updated_at'
                ]
            ]);
            
        $this->assertDatabaseCount('rooms', 1);
        $this->assertEquals('pending', Room::first()->status);
    }

    public function test_can_get_room()
    {
        $room = Room::create(['status' => 'active']);

        $response = $this->getJson("/api/rooms/{$room->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $room->id,
                    'status' => 'active'
                ]
            ]);
    }

    public function test_get_non_existent_room_returns_404()
    {
        $response = $this->getJson('/api/rooms/99999');

        $response->assertStatus(404);
    }
}
