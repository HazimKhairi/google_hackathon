<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Room;

class PlayerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_player()
    {
        $room = Room::create(['status' => 'pending']);

        $response = $this->postJson('/api/players', [
            'room_id' => $room->id,
            'role_name' => 'Warrior'
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'room_id',
                    'role_name',
                    'created_at'
                ]
            ]);

        $this->assertDatabaseHas('players', [
            'room_id' => $room->id,
            'role_name' => 'Warrior'
        ]);
    }

    public function test_create_player_validation()
    {
        $response = $this->postJson('/api/players', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['room_id', 'role_name']);
    }

    public function test_cannot_join_non_existent_room()
    {
        $response = $this->postJson('/api/players', [
            'room_id' => 99999,
            'role_name' => 'Mage'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['room_id']);
    }
}
