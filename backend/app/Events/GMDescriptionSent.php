<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GMDescriptionSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomId;
    public $description;

    public function __construct($roomId, $description)
    {
        $this->roomId = $roomId;
        $this->description = $description;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('game.room.' . $this->roomId),
        ];
    }

    public function broadcastAs()
    {
        return 'gm.description';
    }

    public function broadcastWith()
    {
        return [
            'description' => $this->description,
        ];
    }
}
