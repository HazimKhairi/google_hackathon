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
  useEffect(() => {
    /* 
    const socket = getSocket();
    // ... (Original socket logic commented out)
    */

    // Simulate Game Start (Role Reveal)
    if (phase === 'waiting') {
        setTimeout(() => {
            // Assign roles
            const isMeGM = sessionStorage.getItem('isHost') === 'true';
            setGameMaster(isMeGM ? (playerId || '') : 'host-123'); // If host, I am GM. Else host is GM.
            
            // Mock other players names if not set
            // ensure players exist
            if (players.length === 0) {
                 // re-inject if lost (though store should persist)
            }

            setPhase('role_reveal');
            setShowRoleReveal(true);

            setTimeout(() => {
                setShowRoleReveal(false);
                setPhase('gm_receiving');
            }, 3000);
        }, 1000);
    }

    // Simulate GM Receiving Prompt (Only if I am GM, otherwise wait)
    if (phase === 'gm_receiving') {
        setTimeout(() => {
            const mockPrompt = "A futuristic city in the clouds";
            const mockImage = "/mock_image.png"; // We don't have this, but UI should handle missing img or we can use a placeholder
            
            setGMPrompt(mockPrompt, "https://via.placeholder.com/400"); // Use placeholder
            setPhase('describing');
        }, 2000);
    }

    /*
    // The rest of the phases are driven by user interaction, so we don't need auto-advance for them 
    // unless we want to simulate OTHER players submitting.
    */
   
    // Cleanup
    return () => {
      // socket.off...
    };
  }, [phase, playerId, players, setGameMaster, setPhase, setGMPrompt]); // Added dependencies

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
    <main className="min-h-screen flex flex-col">
      {/* Status Bar */}
      <StatusBar 
        phase={phase} 
        isAIThinking={phase === 'gm_receiving'}
        isAIPainting={phase === 'generating'}
      />

      {/* Role Reveal Overlay */}
      <AnimatePresence>
        {showRoleReveal && (
          <RoleReveal
            isGameMaster={isGameMaster}
            gameMasterName={gameMasterName}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6">
        {/* Player List */}
        <div className="mb-6">
          <PlayerList
            players={players}
            gameMasterId={gameMasterId}
            currentPlayerId={playerId}
          />
        </div>

        {/* Game Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderGameContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
