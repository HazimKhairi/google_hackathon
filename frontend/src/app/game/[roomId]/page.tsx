'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StatusBar, 
  PlayerList, 
  GMPanel, 
  GuesserPanel, 
  ImageComparison, 
  ResultsScreen,
  RoleReveal 
} from '@/components/game';
import { Button } from '@/components/ui';
import { useGameStore } from '@/stores/useGameStore';
import { getSocket, sendDescription, submitGuess } from '@/lib/socket';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { GamePhase, GeneratedImage } from '@/types';

// Prompt pool - a random one is picked each round
const PROMPT_POOL = [
  "A futuristic city floating in the clouds at sunset",
  "A dragon guarding a treasure chest inside a volcano",
  "An underwater kingdom with glowing jellyfish lanterns",
  "A samurai standing in a field of cherry blossoms at night",
  "A steampunk airship flying over a desert canyon",
  "A haunted lighthouse on a stormy cliff",
  "A robot gardener tending to a magical forest",
  "A giant tree house village connected by rope bridges",
  "A crystal cave with a hidden waterfall inside a mountain",
  "A space station orbiting a planet with two suns",
  "A pirate ship sailing through a sea of clouds",
  "A wizard's library with floating books and glowing orbs",
  "A neon-lit cyberpunk street market in the rain",
  "A cozy cabin in a snowy forest with northern lights above",
  "A medieval castle built on the back of a giant turtle",
  "An ancient temple overgrown with vines in a dense jungle",
  "A phoenix rising from flames above an erupting volcano",
  "A magical portal opening in the middle of a quiet village",
  "A knight riding a mechanical horse through a wasteland",
  "A floating island with a waterfall pouring into the void",
  "A cat cafe on the moon with Earth visible through the window",
  "A train crossing a bridge over a canyon filled with mist",
  "A Viking longship navigating through icebergs under aurora",
  "A secret garden hidden behind a waterfall in a cliff",
  "A giant octopus wrapping around an old shipwreck",
];

export default function GameRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;
  
  const [showRoleReveal, setShowRoleReveal] = useState(false);
  
  const {
    phase,
    players,
    playerId,
    playerName,
    gameMasterId,
    gmPrompt,
    gmImage,
    gmDescription,
    playerImages,
    rankings,
    winnerId,
    setPhase,
    setGameMaster,
    setGMPrompt,
    setGMDescription,
    addPlayerImage,
    setRankings,
    setWinner,
    resetGame,
  } = useGameStore();

  const isGameMaster = playerId === gameMasterId;
  const gameMasterName = players.find((p) => p.id === gameMasterId)?.name || 'Unknown';

  // Get current player's image
  const myImage = playerImages.find((img) => img.playerId === playerId);

  // --- MOCK GAME LOOP ---
  // --- MOCK GAME LOOP ---
  useEffect(() => {
    // 1. INITIALIZE PLAYER & MOCK DATA ON MOUNT
    // Always reset to exactly 4 players (1 user + 3 bots)
    // Clear any stale isGameMaster from lobby
    if (!playerId || players.length === 0) {
        const storedPlayerId = sessionStorage.getItem('playerId') || 'me-123';
        const storedPlayerName = sessionStorage.getItem('playerName') || 'Me';

        const botNames = ['Dragon Slayer', 'Cool Guest', 'AI Fan'];
        const botIds = ['bot-1', 'bot-2', 'bot-3'];

        const allPlayers = [
            { id: storedPlayerId, name: storedPlayerName, isGameMaster: false, isConnected: true, score: 0 },
            ...botNames.map((name, i) => ({
                id: botIds[i],
                name,
                isGameMaster: false,
                isConnected: true,
                score: 0,
            })),
        ];

        useGameStore.setState({
            roomId,
            playerId: storedPlayerId,
            playerName: storedPlayerName,
            players: allPlayers,
            gameMasterId: null, // Reset - will be picked randomly in step 2
        });
    }

    // 2. START GAME SEQUENCE
    if (phase === 'waiting') {
        const timer = setTimeout(() => {
            const currentPlayers = useGameStore.getState().players;

            // Randomly pick GM from all players
            const randomIndex = Math.floor(Math.random() * currentPlayers.length);
            const randomGMId = currentPlayers[randomIndex]?.id || currentPlayers[0]?.id;

            setGameMaster(randomGMId);
            setPhase('role_reveal');
            setShowRoleReveal(true);

            setTimeout(() => {
                setShowRoleReveal(false);
                setPhase('gm_receiving');
            }, 3000);
        }, 1000);
        return () => clearTimeout(timer);
    }

    // 3. GM RECEIVING PROMPT - pick random prompt from pool
    if (phase === 'gm_receiving') {
        const timer = setTimeout(async () => {
            const randomPrompt = PROMPT_POOL[Math.floor(Math.random() * PROMPT_POOL.length)];
            try {
                const imageUrl = await api.generateImage(randomPrompt);
                setGMPrompt(randomPrompt, imageUrl);
            } catch (err) {
                console.error('[Game] Failed to generate GM image:', err);
                // Backend handles fallback - will return placeholder if all APIs fail
                setGMPrompt(randomPrompt, '');
            }
            setPhase('describing');
        }, 2000);
        return () => clearTimeout(timer);
    }

    // 4. If user is NOT the GM, bot GM auto-sends description after a realistic delay
    if (phase === 'describing') {
        const state = useGameStore.getState();
        const iAmGM = state.playerId === state.gameMasterId;
        if (!iAmGM) {
            // Longer delay (8s) to simulate GM thinking and typing
            const timer = setTimeout(() => {
                const currentPrompt = useGameStore.getState().gmPrompt || '';
                const prefixes = [
                    "I see", "The image shows", "In this scene,", "Before me lies", "The picture reveals"
                ];
                const suffixes = [
                    "The atmosphere is incredible.",
                    "It's quite a stunning sight.",
                    "The details are vivid and rich.",
                    "The colors and mood are striking.",
                    "Everything feels alive and detailed."
                ];
                const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
                const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
                const promptLower = currentPrompt.charAt(0).toLowerCase() + currentPrompt.slice(1);
                const botDescription = `${prefix} ${promptLower.replace(/^a /i, '').replace(/^an /i, '')}. ${suffix}`;
                setGMDescription(botDescription);
                setPhase('guessing');
            }, 8000);
            return () => clearTimeout(timer);
        }
    }

    // 5. If user IS the GM, after description sent, bot players auto-guess
    if (phase === 'guessing') {
        const state = useGameStore.getState();
        const iAmGM = state.playerId === state.gameMasterId;
        if (iAmGM) {
            const timer = setTimeout(() => {
                setPhase('generating');

                setTimeout(async () => {
                    const currentPlayers = useGameStore.getState().players;
                    const gmId = useGameStore.getState().gameMasterId;
                    const currentPrompt = useGameStore.getState().gmPrompt;
                    const available = PROMPT_POOL.filter(pr => pr !== currentPrompt);

                    // All non-GM players auto-generate images
                    const nonGMPlayers = currentPlayers.filter(p => p.id !== gmId);
                    for (let i = 0; i < nonGMPlayers.length; i++) {
                        const p = nonGMPlayers[i];
                        const botGuess = available[(i + Math.floor(Math.random() * available.length)) % available.length];
                        let imageUrl: string;
                        try {
                            imageUrl = await api.generateImage(botGuess);
                        } catch {
                            imageUrl = ''; // Backend handles fallback
                        }
                        addPlayerImage({ playerId: p.id, playerName: p.name, imageUrl });
                    }

                    // Move to comparing
                    setTimeout(() => {
                        setPhase('comparing');

                        const allPlayers = useGameStore.getState().players;
                        const gm = useGameStore.getState().gameMasterId;
                        const mockRanking = allPlayers
                            .filter(p => p.id !== gm)
                            .map(p => ({
                                playerId: p.id,
                                similarity: Math.floor(Math.random() * 100)
                            })).sort((a, b) => b.similarity - a.similarity);

                        setRankings(mockRanking);

                        setTimeout(() => {
                            setWinner(mockRanking[0].playerId);
                            setPhase('results');
                        }, 3000);
                    }, 4000);
                }, 3000);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }
  }, [phase, roomId, setGameMaster, setPhase, setGMPrompt, setGMDescription, addPlayerImage, setRankings, setWinner]);

  const handleSendDescription = (description: string) => {
    // MOCK: GM Sends description
    // sendDescription(description);
    setGMDescription(description);
    
    // Auto advance to guessing after brief delay
    setTimeout(() => {
        setPhase('guessing');
    }, 500);
  };

  const handleSubmitGuess = (guess: string) => {
    if (playerId) {
      setPhase('generating');

      // Generate AI images via backend (Ollama -> Replicate -> Pollinations fallback)
      setTimeout(async () => {
           // Generate user's image
           let myImageUrl: string;
           try {
               myImageUrl = await api.generateImage(guess);
           } catch {
               myImageUrl = ''; // Backend handles fallback
           }
           const myMockImage: GeneratedImage = {
               playerId: playerId,
               playerName: playerName || 'Me',
               imageUrl: myImageUrl
           };
           addPlayerImage(myMockImage);

           // Generate AI images for other players too
           const otherPlayers = players.filter(p => p.id !== playerId && p.id !== gameMasterId);
           for (let i = 0; i < otherPlayers.length; i++) {
               const p = otherPlayers[i];
               const currentPrompt = useGameStore.getState().gmPrompt;
               const available = PROMPT_POOL.filter(pr => pr !== currentPrompt);
               const botGuess = available[(i + Math.floor(Math.random() * available.length)) % available.length];
               let botImageUrl: string;
               try {
                   botImageUrl = await api.generateImage(botGuess);
               } catch {
                   botImageUrl = ''; // Backend handles fallback
               }
               addPlayerImage({ playerId: p.id, playerName: p.name, imageUrl: botImageUrl });
           }

           // All generated -> Compare
           setTimeout(() => {
               setPhase('comparing');

               const mockRanking = players
                   .filter(p => p.id !== gameMasterId)
                   .map(p => ({
                       playerId: p.id,
                       similarity: Math.floor(Math.random() * 100)
                   })).sort((a,b) => b.similarity - a.similarity);

               setRankings(mockRanking);

               // Go to results
               setTimeout(() => {
                   setWinner(mockRanking[0].playerId);
                   setPhase('results');
               }, 3000);

           }, 4000);

      }, 3000);
    }
  };

  const handlePlayAgain = () => {
    resetGame();
    // router.push(`/lobby?room=${roomId}`);
    // Stay in game or go to lobby? Original goes to lobby.
    // In mock, we can just reset and maybe reload page or reset store
    router.push(`/lobby?room=${roomId}`);
  };

  // Determine what to render based on phase
  const renderGameContent = () => {
    switch (phase) {
      case 'waiting':
      case 'role_reveal':
      case 'gm_receiving':
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div
              className="text-center"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-6xl mb-4">
                {isGameMaster ? '👑' : '🎯'}
              </div>
              <p className="text-xl text-text-secondary">
                {isGameMaster 
                  ? 'Preparing your prompt and image...' 
                  : 'Waiting for Game Master to receive their prompt...'
                }
              </p>
            </motion.div>
          </div>
        );

      case 'describing':
        return isGameMaster ? (
          <GMPanel
            prompt={gmPrompt}
            imageUrl={gmImage}
            isDescribing={true}
            onSubmitDescription={handleSendDescription}
          />
        ) : (
          <GuesserPanel
            gmDescription={null}
            isGuessing={false}
            playerImage={null}
            isGenerating={false}
            onSubmitGuess={handleSubmitGuess}
          />
        );

      case 'guessing':
        return isGameMaster ? (
          <GMPanel
            prompt={gmPrompt}
            imageUrl={gmImage}
            isDescribing={false}
            onSubmitDescription={handleSendDescription}
          />
        ) : (
          <GuesserPanel
            gmDescription={gmDescription}
            isGuessing={true}
            playerImage={null}
            isGenerating={false}
            onSubmitGuess={handleSubmitGuess}
          />
        );

      case 'generating':
        return isGameMaster ? (
          <GMPanel
            prompt={gmPrompt}
            imageUrl={gmImage}
            isDescribing={false}
            onSubmitDescription={handleSendDescription}
          />
        ) : (
          <GuesserPanel
            gmDescription={gmDescription}
            isGuessing={false}
            playerImage={myImage?.imageUrl || null}
            isGenerating={!myImage}
            onSubmitGuess={handleSubmitGuess}
          />
        );

      case 'comparing':
      case 'results':
        if (phase === 'results' && winnerId) {
          const winnerPlayer = players.find((p) => p.id === winnerId);
          const fullRankings = rankings.map((r) => ({
            ...r,
            playerName: players.find((p) => p.id === r.playerId)?.name || 'Unknown',
          }));
          
          return (
            <ResultsScreen
              winnerId={winnerId}
              winnerName={winnerPlayer?.name || 'Unknown'}
              rankings={fullRankings}
              onPlayAgain={handlePlayAgain}
            />
          );
        }
        
        return (
          <ImageComparison
            gmImage={gmImage}
            playerImages={playerImages}
            rankings={rankings}
            winnerId={winnerId}
          />
        );

      default:
        return null;
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-[#051C22] flex flex-col overflow-hidden font-serif">
      
      {/* --- BACKGROUND LAYERS --- */}
      {/* 1. Global Glow */}
      <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-[#E5B96F] opacity-10 blur-[150px] rounded-[100%] pointer-events-none" />
      
      {/* 2. Ornate Background Pattern */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-overlay"
        style={{ backgroundImage: 'url("/background.svg")', backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      
      {/* 3. Radial Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_10%,_#051C22_90%)] z-0" />


      {/* --- MAIN CONTENT CONTAINER --- */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto p-4 md:p-6 flex flex-col h-screen max-h-screen">
          
          {/* HEADER */}
          <header className="flex justify-between items-center pb-4 border-b border-[#E5B96F]/10 mb-4 shrink-0">
             <div className="flex items-center gap-4">
                <div onClick={() => router.push('/')} className="cursor-pointer hover:opacity-80 transition-opacity">
                    <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8A6A2F] via-[#E5B96F] to-[#8A6A2F]">
                        AI NEXUS
                    </h1>
                </div>
                <div className="hidden md:flex items-center px-3 py-1 rounded-full bg-[#E5B96F]/10 border border-[#E5B96F]/20 text-[#E5B96F] text-xs tracking-widest uppercase">
                    <span>Room: {roomId}</span>
                </div>
             </div>
             
             {/* Player & Status Info */}
             <div className="flex items-center gap-4 md:gap-6">
                 {/* DEV: TOGGLE ROLE */}
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[#E5B96F]/40 text-[10px] uppercase hover:text-[#E5B96F] hover:bg-[#E5B96F]/10 h-6 px-2 border border-[#E5B96F]/10"
                    onClick={() => {
                        const currentId = useGameStore.getState().playerId || 'me-123';
                        // If I am GM, make a bot the GM. If I am NOT GM, make ME GM.
                        const targetGM = isGameMaster ? (players.find(p => p.id !== currentId)?.id || 'bot-1') : currentId;
                        setGameMaster(targetGM);
                    }}
                 >
                    {isGameMaster ? 'Role: GM' : 'Role: Guesser'}
                 </Button>

                 {/* Compact Player List (Optional, or just count) */}
                 <div className="hidden md:flex items-center gap-2">
                    <span className="text-xs text-[#E5B96F]/60 uppercase tracking-wider">Players:</span>
                    <div className="flex -space-x-2">
                        {players.map((p, i) => (
                            <div key={p.id} className="w-6 h-6 rounded-full bg-black border border-[#E5B96F]/50 flex items-center justify-center text-[10px] text-[#E5B96F]" title={p.name}>
                                {p.name.charAt(0)}
                            </div>
                        ))}
                    </div>
                 </div>

                 <div className="h-8 w-px bg-[#E5B96F]/20 hidden md:block" />
                 
                 <div className="flex items-center gap-2">
                     <span className={cn(
                         "w-2 h-2 rounded-full animate-pulse",
                         phase === 'waiting' ? "bg-yellow-500" : "bg-emerald-500"
                     )} />
                     <span className="text-xs text-[#E5B96F] uppercase tracking-wider font-bold">
                         {phase.replace('_', ' ')}
                     </span>
                 </div>
             </div>
          </header>


          {/* GAME AREA */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col relative">
             <AnimatePresence mode="wait">
                
                {/* ROLE REVEAL OVERLAY */}
                {showRoleReveal && (
                     <div className="absolute inset-0 z-50 flex items-center justify-center">
                        <RoleReveal 
                            isGameMaster={isGameMaster} 
                            gameMasterName={gameMasterName} 
                        />
                     </div>
                )}

                {/* MAIN CONTENT */}
                <motion.div
                    key={phase === 'generating' ? 'guessing' : phase}
                    className="w-full h-full"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                >
                    {renderGameContent()}
                </motion.div>

             </AnimatePresence>
          </div>
      </div>
    </main>
  );
}
