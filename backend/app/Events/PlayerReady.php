<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PlayerReady implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomId;
    public $playerId;
    public $isReady;

    public function __construct($roomId, $playerId, $isReady)
    {
        $this->roomId = $roomId;
        $this->playerId = $playerId;
        $this->isReady = $isReady;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('game.room.' . $this->roomId),
        ];
    }

    public function broadcastAs()
    {
        return 'player.ready';
    }

    public function broadcastWith()
    {
        return [
            'playerId' => $this->playerId,
            'isReady' => $this->isReady,
        ];
    }
}
