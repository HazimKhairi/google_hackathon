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

  useEffect(() => {
    const socket = getSocket();

    // Game start - role reveal
    socket.on('game_start', (payload) => {
      setGameMaster(payload.gameMasterId);
      setPhase('role_reveal');
      setShowRoleReveal(true);
      
      // Hide role reveal after 3 seconds
      setTimeout(() => {
        setShowRoleReveal(false);
        setPhase('gm_receiving');
      }, 3000);
    });

    // GM receives prompt and image
    socket.on('gm_prompt', (payload) => {
      setGMPrompt(payload.prompt, payload.imageUrl);
      setPhase('describing');
    });

    // GM sends description
    socket.on('gm_description', (payload) => {
      setGMDescription(payload.description);
      setPhase('guessing');
    });

    // Player image generated
    socket.on('image_generated', (payload) => {
      const newImage: GeneratedImage = {
        playerId: payload.playerId,
        playerName: payload.playerName,
        imageUrl: payload.imageUrl,
      };
      addPlayerImage(newImage);
      
      // Check if all players have submitted
      // Transition to comparing phase would be handled by server
    });

    // Comparison results
    socket.on('comparison_result', (payload) => {
      setPhase('comparing');
      const rankingsData = payload.rankings.map((r) => ({
        playerId: r.playerId,
        similarity: r.similarity,
      }));
      setRankings(rankingsData);
      
      // Move to results after showing comparison
      setTimeout(() => {
        setPhase('results');
      }, 3000);
    });

    // Game end
    socket.on('game_end', (payload) => {
      setWinner(payload.winnerId);
      setPhase('results');
    });

    return () => {
      socket.off('game_start');
      socket.off('gm_prompt');
      socket.off('gm_description');
      socket.off('image_generated');
      socket.off('comparison_result');
      socket.off('game_end');
    };
  }, [setPhase, setGameMaster, setGMPrompt, setGMDescription, addPlayerImage, setRankings, setWinner]);

  const handleSendDescription = (description: string) => {
    sendDescription(description);
    setGMDescription(description);
  };

  const handleSubmitGuess = (guess: string) => {
    if (playerId) {
      submitGuess(playerId, guess);
      setPhase('generating');
    }
  };

  const handlePlayAgain = () => {
    resetGame();
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
