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
import type { GamePhase, GeneratedImage } from '@/types';

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
    if (!playerId || players.length === 0) {
        const storedPlayerId = sessionStorage.getItem('playerId') || 'me-123';
        const storedPlayerName = sessionStorage.getItem('playerName') || 'Me';
        const isHost = sessionStorage.getItem('isHost') === 'true';

        // Re-inject mock players + self
        const mockPlayers = [
            { id: 'host-123', name: 'Host Player', isGameMaster: false, isConnected: true, score: 0 },
            { id: 'p2', name: 'Cool Guest', isGameMaster: false, isConnected: true, score: 0 },
            { id: 'p3', name: 'AI Fan', isGameMaster: false, isConnected: true, score: 0 },
        ];
        
        let allPlayers = [...mockPlayers];
        
        // If I am not in the mock list (e.g. I am the host or a new guest), add/merge me
        // For simplicity in mock:
        // If I am host, replace 'host-123' or just identify as it. 
        // Let's just append me if I'm not "Host Player" equivalent
        if (storedPlayerId !== 'host-123') { // Simple check
             allPlayers.push({ id: storedPlayerId, name: storedPlayerName, isGameMaster: false, isConnected: true, score: 0 });
        } else {
             // If I am claiming to be host-123, ensure name matches or update it
             allPlayers = allPlayers.map(p => p.id === 'host-123' ? { ...p, name: storedPlayerName } : p);
        }

        // Update Store
        // setRoom(roomId, storedPlayerId, storedPlayerName); // setRoom might reset players? check store. 
        // Actually setRoom just sets id/name.
        useGameStore.setState({ 
            roomId, 
            playerId: storedPlayerId, 
            playerName: storedPlayerName,
            players: allPlayers 
        });
    }

    // 2. START GAME SEQUENCE
    if (phase === 'waiting') {
        const timer = setTimeout(() => {
            const currentPlayers = useGameStore.getState().players;
            const myId = useGameStore.getState().playerId;
            const isHost = sessionStorage.getItem('isHost') === 'true';
            
            // Determine GM
            // If I am host, I am GM. 
            // If I am guest, 'host-123' is GM.
            const initialGMId = isHost ? (myId || 'host-123') : 'host-123';
            
            setGameMaster(initialGMId);
            setPhase('role_reveal');
            setShowRoleReveal(true);

            setTimeout(() => {
                setShowRoleReveal(false);
                setPhase('gm_receiving');
            }, 3000);
        }, 1000);
        return () => clearTimeout(timer);
    }

    // 3. GM RECEIVING PROMPT
    if (phase === 'gm_receiving') {
        const timer = setTimeout(() => {
            const mockPrompt = "A futuristic city in the clouds";
            setGMPrompt(mockPrompt, "https://via.placeholder.com/400");
            setPhase('describing');
        }, 2000);
        return () => clearTimeout(timer);
    }
  }, [phase, roomId, setGameMaster, setPhase, setGMPrompt]); // Removed players/playerId deps to prevent infinite re-loops if not handled carefully

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
      // submitGuess(playerId, guess);
      // For mock purposes, if I am guesser, I submit and then we wait for "others"
      // Then we go to generating
      setPhase('generating');

      // Mock image generation after a delay
      setTimeout(() => {
           const myMockImage: GeneratedImage = {
               playerId: playerId,
               playerName: playerName || 'Me',
               imageUrl: "https://via.placeholder.com/400/0000FF/808080?Text=MyGeneratedImage"
           };
           addPlayerImage(myMockImage);
           
           // Mock other players generating too
           players.filter(p => p.id !== playerId).forEach(p => {
               addPlayerImage({
                   playerId: p.id,
                   playerName: p.name,
                   imageUrl: "https://via.placeholder.com/400/FF0000/FFFFFF?Text=BotImage"
               });
           });

           // All generated -> Compare
           setTimeout(() => {
               // Mock Comparison
               setPhase('comparing');
               
               // Mock Ranking
               const mockRanking = players.map(p => ({
                   playerId: p.id,
                   similarity: Math.floor(Math.random() * 100)
               })).sort((a,b) => b.similarity - a.similarity);
               
               setRankings(mockRanking);

               // Go to results
               setTimeout(() => {
                   setWinner(mockRanking[0].playerId);
                   setPhase('results');
               }, 3000);

           }, 2000);

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
        return (
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
                        const newGM = isGameMaster ? 'host-123' : currentId;
                        // Determine who 'host-123' is. If I am 'host-123', toggle to 'p2' or something else?
                        // For simplicity: If I am GM, make 'p2' GM. If I am NOT GM, make ME GM.
                        const targetGM = isGameMaster ? (players.find(p => p.id !== currentId)?.id || 'host-123') : currentId;
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
                    key={phase}
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
