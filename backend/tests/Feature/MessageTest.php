<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use App\Models\Room;
use App\Models\Message;
use App\Services\GeminiService;
use Mockery\MockInterface;

class MessageTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_messages()
    {
        $room = Room::create(['status' => 'active']);
        Message::create([
            'room_id' => $room->id,
            'sender_role' => 'player',
            'content' => 'Hello World'
        ]);

        $response = $this->getJson("/api/messages?room_id={$room->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'room_id',
                        'sender_role',
                        'content',
                        'image_url',
                        'created_at'
                    ]
                ]
            ]);
    }

    public function test_can_send_text_message()
    {
        $room = Room::create(['status' => 'active']);

        $response = $this->postJson('/api/messages', [
            'room_id' => $room->id,
            'sender_role' => 'player',
            'content' => 'My message'
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'room_id' => $room->id,
                    'content' => 'My message',
                    'sender_role' => 'player'
                ]
            ]);
            
        $this->assertDatabaseHas('messages', [
            'content' => 'My message'
        ]);
    }

    public function test_can_send_image_message()
    {
        Storage::fake('public');
        $room = Room::create(['status' => 'active']);
        $file = UploadedFile::fake()->image('test.jpg');

        $response = $this->postJson('/api/messages', [
            'room_id' => $room->id,
            'sender_role' => 'player',
            'image' => $file
        ]);

        $response->assertStatus(201);
        // The controller stores in 'messages' directory
        // but storage link might map differently. We just check if file exists in the disk.
        // The controller code: $path = $request->file('image')->store('messages', 'public');
        
        $this->assertDatabaseHas('messages', [
            'room_id' => $room->id,
            'sender_role' => 'player'
        ]);
        
        // Assert file was stored
        Storage::disk('public')->assertExists('messages/' . $file->hashName());
    }

    public function test_generate_narrative()
    {
        $room = Room::create(['status' => 'active']);

        // Mock GeminiService
        $this->mock(GeminiService::class, function (MockInterface $mock) {
            $mock->shouldReceive('generateNarrative')
                ->once()
                ->andReturn([
                    'success' => true,
                    'narrative' => 'AI Generated Story',
                    'usage' => ['totalTokens' => 100]
                ]);
        });

        $response = $this->postJson('/api/messages/generate-narrative', [
            'room_id' => $room->id,
            'prompt' => 'Tell a story'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message.content', 'AI Generated Story');

        $this->assertDatabaseHas('messages', [
            'room_id' => $room->id,
            'sender_role' => 'gm',
            'content' => 'AI Generated Story'
        ]);
    }

    public function test_describe_image()
    {
        Storage::fake('public');
        $room = Room::create(['status' => 'active']);
        $file = UploadedFile::fake()->image('scene.jpg');

        // Mock GeminiService
        $this->mock(GeminiService::class, function (MockInterface $mock) {
            $mock->shouldReceive('describeUserImage')
                ->once()
                ->andReturn([
                    'success' => true,
                    'description' => 'A beautiful landscape',
                    'usage' => ['totalTokens' => 150]
                ]);
        });

        $response = $this->postJson('/api/messages/describe-image', [
            'room_id' => $room->id,
            'image' => $file,
            'prompt' => 'Describe this'
        ]);

        $response->assertStatus(200);

        // Check user message (image)
        $this->assertDatabaseHas('messages', [
            'room_id' => $room->id,
            'sender_role' => 'player'
        ]);

        // Check GM response (description)
        $this->assertDatabaseHas('messages', [
            'room_id' => $room->id,
            'sender_role' => 'gm',
            'content' => 'A beautiful landscape'
        ]);
    }
}
