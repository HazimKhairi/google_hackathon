<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PlayerLeft implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomId;
    public $playerId;
    public $playerCount;

    public function __construct($roomId, $playerId, $playerCount)
    {
        $this->roomId = $roomId;
        $this->playerId = $playerId;
        $this->playerCount = $playerCount;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('game.room.' . $this->roomId),
        ];
    }

    public function broadcastAs()
    {
        return 'player.left';
    }

    public function broadcastWith()
    {
        return [
            'playerId' => $this->playerId,
            'playerCount' => $this->playerCount,
        ];
    }
}
