'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Copy, QrCode, CheckCircle2, Crown, Users } from 'lucide-react';

// Imports from your existing codebase
import { useGameStore } from '@/stores/useGameStore';
import { getSocket, connectSocket, joinRoom } from '@/lib/socket';
import { generatePlayerName } from '@/lib/utils';
import type { Player } from '@/types';

// Design Components
import { GameButton } from '@/components/ui/GameMenu';
import { DragonFrame, PlayerBadge, EmptyPlayerSlot, LobbyPanel, PanelHeader } from '@/components/ui/LobbyElements';

export default function LobbyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('room');
  
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isHost, setIsHost] = useState(false);

  const { players, setRoom, addPlayer, setPlayers, removePlayer, playerId } = useGameStore();

  // --- ECHO LOGIC ---
  useEffect(() => {
    if (!roomId) {
      router.push('/');
      return;
    }

    const initConnection = async () => {
      // 1. Ensure we have a player ID and Name (simulate Auth)
      // In a real app, you'd likely have a login page before this.
      // For now, we'll auto-login as a guest if no token exists.
      let token = localStorage.getItem('auth_token');
      
      if (!token) {
        try {
          const storedName = sessionStorage.getItem('playerName') || generatePlayerName();
          // Register as guest to get token
          const { token: newToken, user } = await import('@/lib/api').then(m => m.api.loginAsGuest(storedName));
          localStorage.setItem('auth_token', newToken);
          sessionStorage.setItem('playerId', String(user.id));
          sessionStorage.setItem('playerName', user.name);
          token = newToken;
        } catch (err) {
          console.error('Guest login failed:', err);
          setError('Authentication failed. Please try again.');
          return;
        }
      }

      // 2. Initialize Echo
      const { getEcho } = await import('@/lib/echo');
      const echo = getEcho();

      if (!echo) {
        setError('Failed to initialize connection.');
        return;
      }

      // 3. Join Presence Channel
      // Note: Reverb channels are usually "game.room.{id}"
      const channel = echo.join(`game.room.${roomId}`);

      channel
        .here((users: any[]) => {
          setIsConnecting(false);
          // Transform users to Players
          const currentPlayers: Player[] = users.map(u => ({
            id: String(u.id),
            name: u.name,
            isGameMaster: false, // You might want to assign GM based on logic
            isConnected: true,
            score: 0
          }));
          
          // Sync with store - BE CAREFUL not to overwrite local state if already exists
          // For simplicity, we just set the players from the server
          // In a real app, you might want to merge with existing state
          setPlayers(currentPlayers);
        })
        .joining((user: any) => {
          addPlayer({
            id: String(user.id),
            name: user.name,
            isGameMaster: false,
            isConnected: true,
            score: 0
          });
        })
        .leaving((user: any) => {
          removePlayer(String(user.id));
        })
        .error((err: any) => {
          console.error('Channel error:', err);
          setError('Connection error. Please refresh.');
        });

      // 4. Listen for other game events
      channel.listen('.game.start', () => {
        router.push(`/game/${roomId}`);
      });
      
      return () => {
        echo.leave(`game.room.${roomId}`);
      };
    };

    initConnection();
  }, [roomId, router, addPlayer, removePlayer]);

  const handleCopyCode = async () => {
    if (!roomId) return;
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    const socket = getSocket();
    socket.emit('start_game');
  };

  // Check isHost on client-side only to avoid hydration mismatch
  useEffect(() => {
    setIsHost(sessionStorage.getItem('isHost') === 'true');
  }, []);

  const canStart = players.length >= 2;

  // --- ERROR STATE ---
  if (error) {
    return (
      <main className="min-h-screen bg-[#051C22] flex items-center justify-center p-4 font-serif">
         <div className="text-[#E5B96F] text-center">
            <h2 className="text-2xl mb-2">Connection Error</h2>
            <p className="opacity-70 mb-4">{error}</p>
            <GameButton onClick={() => router.push('/')}>Return Home</GameButton>
         </div>
      </main>
    );
  }

  // --- MAIN RENDER ---
  return (
    <main className="relative min-h-screen w-full bg-[#051C22] flex items-center justify-center overflow-hidden font-serif p-4">
      
      {/* Background Layers */}
      <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[120%] h-[50%] bg-[#E5B96F] opacity-15 blur-[120px] rounded-[100%] pointer-events-none" />
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-60"
        style={{ backgroundImage: 'url("/background.svg")', backgroundSize: 'cover' }}
      />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_40%,_#000000_100%)] z-0" />

      {/* Main Lobby Frame */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-20 w-full flex justify-center"
      >
        <DragonFrame>
          
          {/* === LEFT COLUMN: ROOM CODE & PLAYERS === */}
          <div className="flex-[1.4] flex flex-col gap-3 h-full justify-center">
             
             {/* Room Code Section */}
             <LobbyPanel className="shrink-0">
                <PanelHeader 
                  badge={copied && (
                    <motion.span 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-emerald-400 text-[9px] tracking-widest uppercase font-bold flex items-center gap-1"
                    >
                      <CheckCircle2 size={12} /> Copied!
                    </motion.span>
                  )}
                >
                  Room Code
                </PanelHeader>
                
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 bg-black/50 border border-[#E5B96F]/30 rounded-lg px-4 py-3 text-center shadow-inner">
                    <span className="text-[#E5B96F] text-2xl md:text-3xl tracking-[0.3em] font-bold font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                      {roomId}
                    </span>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyCode}
                    className="p-3 rounded-lg bg-[#E5B96F]/15 text-[#E5B96F] hover:bg-[#E5B96F]/25 transition-all border border-[#E5B96F]/30 shadow-lg"
                  >
                    <Copy size={20} />
                  </motion.button>
                </div>
             </LobbyPanel>

             {/* Player Grid Section */}
             <LobbyPanel className="flex-1 min-h-[180px]">
                <PanelHeader 
                  badge={isConnecting ? (
                    <span className="text-amber-400/80 text-[9px] animate-pulse flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      Connecting...
                    </span>
                  ) : (
                    <span className="text-emerald-400/80 text-[9px] flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Connected
                    </span>
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Users size={12} className="opacity-60" />
                    Players ({players.length}/4)
                  </span>
                </PanelHeader>
                
                <div className="flex-1 flex items-center justify-center py-4">
                  <div className="grid grid-cols-4 gap-6 md:gap-8">
                    {/* Active players */}
                    {players.map((p) => (
                      <PlayerBadge 
                        key={p.id} 
                        name={p.name} 
                        isCurrentUser={p.id === playerId}
                        status={p.id === playerId ? (isReady ? 'ready' : 'not-ready') : 'waiting'}
                      />
                    ))}
                    
                    {/* Empty slots */}
                    {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => (
                      <EmptyPlayerSlot key={`empty-${i}`} index={i} />
                    ))}
                  </div>
                </div>
             </LobbyPanel>
          </div>

          {/* === RIGHT COLUMN: HOST/JOINER ACTIONS === */}
          <div className="flex-1 flex flex-col h-full">
            {isHost ? (
              /* --- HOST VIEW --- */
              <LobbyPanel className="h-full flex flex-col justify-between items-center text-center py-6">
                 {/* QR Section */}
                 <div className="space-y-3 w-full flex flex-col items-center">
                   <PanelHeader>
                     <span className="flex items-center gap-2 justify-center w-full">
                       <Crown size={12} className="text-amber-400" />
                       Host Controls
                     </span>
                   </PanelHeader>
                   
                   <p className="text-[#E5B96F]/50 text-[10px] uppercase tracking-widest mt-2">Share to invite</p>
                   
                   <div className="bg-white p-3 rounded-xl shadow-xl">
                      <QrCode size={100} className="text-gray-900" />
                   </div>
                   
                   <p className="text-[#E5B96F]/40 text-[9px] uppercase tracking-wider">
                     Scan to join room
                   </p>
                 </div>
                 
                 {/* Start Button */}
                 <div className="w-full space-y-2 mt-4">
                   <GameButton 
                      onClick={handleStartGame} 
                      disabled={!canStart}
                      isLoading={isConnecting}
                   >
                      {canStart ? 'START GAME' : 'WAITING...'}
                   </GameButton>
                   
                   <p className="text-[#E5B96F]/40 text-[9px] uppercase tracking-wider">
                     {canStart 
                       ? `${players.length} players ready` 
                       : `Need ${2 - players.length} more player${2 - players.length > 1 ? 's' : ''}`
                     }
                   </p>
                 </div>
              </LobbyPanel>
            ) : (
               /* --- JOINER VIEW --- */
               <LobbyPanel className="h-full flex flex-col justify-between relative overflow-hidden">
                  {/* Decorative background icon */}
                  <div className="absolute -top-4 -right-4 opacity-[0.03] pointer-events-none">
                    <CheckCircle2 size={180} className="text-[#E5B96F]" />
                  </div>

                  <div className="space-y-4 relative z-10">
                    <PanelHeader>Game Tips</PanelHeader>
                    
                    <motion.h2 
                      key={isReady ? 'ready' : 'not-ready'}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[#E5B96F] text-xl md:text-2xl font-serif uppercase tracking-widest"
                    >
                      {isReady ? "You're Ready!" : "Get Ready"}
                    </motion.h2>
                    
                    <ul className="text-[#E5B96F]/60 text-[11px] space-y-2.5 tracking-wide font-sans leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="text-[#E5B96F]/40 mt-0.5">•</span>
                        <span><strong className="text-[#E5B96F]/80">Tip:</strong> Better prompts = better results!</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#E5B96F]/40 mt-0.5">•</span>
                        <span>Review the game rules before starting.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#E5B96F]/40 mt-0.5">•</span>
                        <span>This is a 4-player game — invite friends!</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="w-full space-y-2 relative z-10 mt-4">
                    <GameButton onClick={() => setIsReady(!isReady)}>
                      {isReady ? 'CANCEL READY' : 'READY UP'}
                    </GameButton>
                    <p className="text-center text-[#E5B96F]/35 text-[9px] uppercase tracking-wider">
                      {isReady ? "Waiting for host to start..." : "Press ready when you're set"}
                    </p>
                  </div>
               </LobbyPanel>
            )}
          </div>

        </DragonFrame>
      </motion.div>
    </main>
  );
}