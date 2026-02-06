<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SceneGenerated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomId;
    public $imageUrl;

    public function __construct($roomId, $imageUrl)
    {
        $this->roomId = $roomId;
        $this->imageUrl = $imageUrl;
    }

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('game.room.' . $this->roomId),
        ];
    }

    public function broadcastAs()
    {
        return 'scene.updated';
    }
}