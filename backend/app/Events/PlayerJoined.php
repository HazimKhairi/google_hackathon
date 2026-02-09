<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PlayerJoined implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomId;
    public $player;
    public $playerCount;

    public function __construct($roomId, $player, $playerCount)
    {
        $this->roomId = $roomId;
        $this->player = $player;
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
        return 'player.joined';
    }

    public function broadcastWith()
    {
        return [
            'player' => $this->player,
            'playerCount' => $this->playerCount,
        ];
    }
}
