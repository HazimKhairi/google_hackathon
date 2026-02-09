<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GMPromptSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomId;
    public $prompt;
    public $imageUrl;

    public function __construct($roomId, $prompt, $imageUrl)
    {
        $this->roomId = $roomId;
        $this->prompt = $prompt;
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
        return 'gm.prompt';
    }

    public function broadcastWith()
    {
        return [
            'prompt' => $this->prompt,
            'imageUrl' => $this->imageUrl,
        ];
    }
}
