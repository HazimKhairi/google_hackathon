'use client';

import { useEffect, useState } from 'react';
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
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useGameStore } from '@/stores/useGameStore';
import { 
  MOCK_IMAGES, 
  MOCK_GM_DATA, 
  MOCK_PLAYER_IMAGES, 
  MOCK_RANKINGS,
  ALL_PHASES,
  initializeMockData 
} from '@/lib/mockData';
import type { GamePhase } from '@/types';

export default function DemoPage() {
  const [viewAsGM, setViewAsGM] = useState(true);
  const [showRoleReveal, setShowRoleReveal] = useState(false);

  const {
    phase,
    players,
    playerId,
    gameMasterId,
    gmPrompt,
    gmImage,
    gmDescription,
    playerImages,
    rankings,
    winnerId,
    setPhase,
    setRoom,
    setPlayers,
    setGameMaster,
    setGMPrompt,
    setGMDescription,
    addPlayerImage,
    setRankings,
    setWinner,
    resetGame,
  } = useGameStore();

  // Initialize mock data
  useEffect(() => {
    // Reset first
    resetGame();
    
    // Initialize with fresh mock data
    initializeMockData(
      setRoom,
      setPlayers,
      setGameMaster,
      setGMPrompt,
      setGMDescription,
      addPlayerImage,
      setRankings,
      setWinner,
      { isGameMaster: viewAsGM }
    );
    
    setPhase('waiting');
  }, [viewAsGM]); // Re-initialize when view changes

  const isGameMaster = playerId === gameMasterId;
  const gameMasterName = players.find((p) => p.id === gameMasterId)?.name || 'Unknown';

  const handlePhaseChange = (newPhase: GamePhase) => {
    if (newPhase === 'role_reveal') {
      setShowRoleReveal(true);
      setTimeout(() => setShowRoleReveal(false), 3000);
    }
    setPhase(newPhase);
  };

  const handleToggleView = () => {
    setViewAsGM(!viewAsGM);
  };

  // Get player's image for guesser panel
  const myImage = playerImages.find((img) => img.playerId === playerId);

  // Render game content based on phase
  const renderGameContent = () => {
    switch (phase) {
      case 'waiting':
        return (
          <Card variant="glow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Waiting for Players</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <PlayerList
                players={players}
                gameMasterId={null}
                currentPlayerId={playerId}
              />
              <div className="p-4 bg-background rounded-lg border border-border">
                <h4 className="font-medium text-text-primary mb-2">How to Play</h4>
                <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
                  <li>Wait for 4 players to join the room</li>
                  <li>One player will be randomly selected as Game Master</li>
                  <li>Game Master describes their AI-generated image</li>
                  <li>Other players guess the prompt and generate images</li>
                  <li>AI compares images - closest match wins!</li>
                </ol>
              </div>
              <Button className="w-full" size="lg" disabled>
                Waiting for 0 more players...
              </Button>
            </CardContent>
          </Card>
        );

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
            onSubmitDescription={(desc) => console.log('Description:', desc)}
          />
        ) : (
          <GuesserPanel
            gmDescription={null}
            isGuessing={false}
            playerImage={null}
            isGenerating={false}
            onSubmitGuess={(guess) => console.log('Guess:', guess)}
          />
        );

      case 'guessing':
        return isGameMaster ? (
          <GMPanel
            prompt={gmPrompt}
            imageUrl={gmImage}
            isDescribing={false}
            onSubmitDescription={(desc) => console.log('Description:', desc)}
          />
        ) : (
          <GuesserPanel
            gmDescription={gmDescription}
            isGuessing={true}
            playerImage={null}
            isGenerating={false}
            onSubmitGuess={(guess) => console.log('Guess:', guess)}
          />
        );

      case 'generating':
        return (
          <GuesserPanel
            gmDescription={gmDescription}
            isGuessing={false}
            playerImage={myImage?.imageUrl || null}
            isGenerating={!myImage}
            onSubmitGuess={(guess) => console.log('Guess:', guess)}
          />
        );

      case 'comparing':
        return (
          <ImageComparison
            gmImage={gmImage}
            playerImages={playerImages}
            rankings={rankings}
            winnerId={null}
          />
        );

      case 'results':
        const winnerPlayer = players.find((p) => p.id === winnerId);
        const fullRankings = rankings.map((r) => ({
          ...r,
          playerName: players.find((p) => p.id === r.playerId)?.name || 'Unknown',
        }));
        
        return (
          <ResultsScreen
            winnerId={winnerId || 'player-2'}
            winnerName={winnerPlayer?.name || 'Sarah Kim'}
            rankings={fullRankings}
            onPlayAgain={() => setPhase('waiting')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Demo Controls Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 px-4">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">🎨 Demo Mode</span>
            <span className="text-sm opacity-75">Preview all UI designs</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">View as:</span>
            <Button 
              variant={viewAsGM ? 'primary' : 'secondary'} 
              size="sm" 
              onClick={() => setViewAsGM(true)}
              className="!bg-white/20 hover:!bg-white/30"
            >
              👑 Game Master
            </Button>
            <Button 
              variant={!viewAsGM ? 'primary' : 'secondary'} 
              size="sm" 
              onClick={() => setViewAsGM(false)}
              className="!bg-white/20 hover:!bg-white/30"
            >
              🎯 Player
            </Button>
          </div>
        </div>
      </div>

      {/* Phase Selector */}
      <div className="bg-surface border-b border-border py-2 px-4 overflow-x-auto">
        <div className="container mx-auto">
          <div className="flex gap-2 min-w-max">
            {ALL_PHASES.map((p) => (
              <button
                key={p.phase}
                onClick={() => handlePhaseChange(p.phase)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  phase === p.phase
                    ? 'bg-primary text-white'
                    : 'bg-background text-text-secondary hover:bg-border hover:text-text-primary'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

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

      {/* Current Phase Info */}
      <div className="bg-surface border-t border-border py-3 px-4">
        <div className="container mx-auto text-center">
          <p className="text-sm text-text-secondary">
            Current Phase: <span className="font-medium text-primary">{ALL_PHASES.find(p => p.phase === phase)?.label}</span>
            {' • '}
            {ALL_PHASES.find(p => p.phase === phase)?.description}
          </p>
        </div>
      </div>
    </main>
  );
}
