<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ImageGenerated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomId;
    public $playerId;
    public $playerName;
    public $imageUrl;

    public function __construct($roomId, $playerId, $playerName, $imageUrl)
    {
        $this->roomId = $roomId;
        $this->playerId = $playerId;
        $this->playerName = $playerName;
        $this->imageUrl = $imageUrl;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('game.room.' . $this->roomId),
        ];
    }

    public function broadcastAs()
    {
        return 'image.generated';
    }

    public function broadcastWith()
    {
        return [
            'playerId' => $this->playerId,
            'playerName' => $this->playerName,
            'imageUrl' => $this->imageUrl,
        ];
    }
}
