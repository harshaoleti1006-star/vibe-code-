/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Constants & Types ---
const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const BASE_SPEED = 150;

const TRACKS = [
  { id: 1, title: "CYBERNETIC_HORIZON.WAV", artist: "AI_GEN_ALPHA", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "NEON_GRID_RUNNER.WAV", artist: "AI_GEN_BETA", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "DIGITAL_AFTERGLOW.WAV", artist: "AI_GEN_GAMMA", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

type Point = { x: number; y: number };

export default function App() {
  // --- Game State ---
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 15, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  
  const directionRef = useRef(INITIAL_DIRECTION);
  const gameBoardRef = useRef<HTMLDivElement>(null);

  // --- Music Player State ---
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  // --- Helper: Generate Food ---
  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      const isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  // --- Game Controls ---
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
      e.preventDefault();
    }

    if (!isGameStarted && e.key === " ") {
      setIsGameStarted(true);
      return;
    }

    if (gameOver && e.key === " ") {
      resetGame();
      return;
    }

    setDirection(prev => {
      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          return currentDir.y === 1 ? prev : { x: 0, y: -1 };
        case 'ArrowDown':
        case 's':
        case 'S':
          return currentDir.y === -1 ? prev : { x: 0, y: 1 };
        case 'ArrowLeft':
        case 'a':
        case 'A':
          return currentDir.x === 1 ? prev : { x: -1, y: 0 };
        case 'ArrowRight':
        case 'd':
        case 'D':
          return currentDir.x === -1 ? prev : { x: 1, y: 0 };
        default:
          return prev;
      }
    });
  }, [gameOver, isGameStarted]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // --- Game Loop ---
  useEffect(() => {
    if (gameOver || !isGameStarted) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          handleGameOver();
          return prevSnake;
        }

        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          handleGameOver();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
      directionRef.current = direction;
    };

    const speed = Math.max(50, BASE_SPEED - Math.floor(score / 50) * 5);
    const intervalId = setInterval(moveSnake, speed);

    return () => clearInterval(intervalId);
  }, [direction, food, gameOver, isGameStarted, score, generateFood]);

  const handleGameOver = () => {
    setGameOver(true);
    setIsGameStarted(false);
    if (score > highScore) {
      setHighScore(score);
    }
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setIsGameStarted(true);
    setFood(generateFood(INITIAL_SNAKE));
  };

  // --- Music Player Effects ---
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack, volume, isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div className="min-h-screen bg-[#020202] text-cyan-400 font-terminal flex flex-col items-center justify-center p-4 overflow-hidden selection:bg-fuchsia-500 selection:text-black">
      <div className="scanlines" />
      <div className="static-noise" />

      <div className="z-10 w-full max-w-5xl flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center">
        
        {/* Left Panel */}
        <div className="flex flex-col gap-6 w-full lg:w-72">
          <div className="text-center lg:text-left tear">
            <h1 className="text-2xl md:text-3xl font-pixel text-fuchsia-500 glitch mb-4" data-text="PROTOCOL: OROBOROS">
              PROTOCOL: OROBOROS
            </h1>
            <p className="text-cyan-400 text-xl uppercase tracking-widest border-b-2 border-cyan-400 pb-2">
              SYS.VER 9.9.9 // CORRUPTED
            </p>
          </div>

          <div className="border-2 border-cyan-400 bg-black p-4 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-fuchsia-500 animate-pulse" />
            <div className="flex items-center justify-between mb-2 text-2xl">
              <span className="text-fuchsia-500">DATA_YIELD:</span>
              <span className="font-pixel text-cyan-400">{score}</span>
            </div>
            <div className="flex items-center justify-between text-xl">
              <span className="text-cyan-600">MAX_YIELD:</span>
              <span className="font-pixel text-cyan-600">{highScore}</span>
            </div>
          </div>

          <div className="hidden lg:block border-2 border-fuchsia-500 bg-black p-4 text-xl">
            <h3 className="text-fuchsia-500 mb-2 border-b-2 border-fuchsia-500 inline-block">INPUT_VECTORS</h3>
            <ul className="space-y-2 mt-2 text-cyan-400">
              <li className="flex justify-between"><span>[NAVIGATE]</span> <span>W,A,S,D</span></li>
              <li className="flex justify-between"><span>[EXECUTE]</span> <span>SPACE</span></li>
            </ul>
          </div>
        </div>

        {/* Center Panel */}
        <div className="relative">
          <div 
            ref={gameBoardRef}
            className="relative bg-black border-4 border-fuchsia-500 p-1"
            style={{
              width: `${GRID_SIZE * 20 + 10}px`,
              height: `${GRID_SIZE * 20 + 10}px`,
            }}
          >
            {/* Snake */}
            {snake.map((segment, index) => {
              const isHead = index === 0;
              return (
                <div
                  key={`${segment.x}-${segment.y}-${index}`}
                  className={`absolute ${isHead ? 'bg-fuchsia-500 z-10' : 'bg-cyan-400'}`}
                  style={{
                    width: '20px',
                    height: '20px',
                    left: `${segment.x * 20 + 5}px`,
                    top: `${segment.y * 20 + 5}px`,
                  }}
                />
              );
            })}

            {/* Food */}
            <div
              className="absolute bg-white animate-ping"
              style={{
                width: '16px',
                height: '16px',
                left: `${food.x * 20 + 7}px`,
                top: `${food.y * 20 + 7}px`,
              }}
            />

            {/* Overlays */}
            {!isGameStarted && !gameOver && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
                <button 
                  onClick={() => setIsGameStarted(true)}
                  className="px-6 py-2 bg-black border-2 border-cyan-400 text-cyan-400 font-pixel text-sm hover:bg-cyan-400 hover:text-black transition-colors"
                >
                  INITIALIZE
                </button>
                <p className="mt-4 text-fuchsia-500 text-xl animate-pulse">AWAITING INPUT...</p>
              </div>
            )}

            {gameOver && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 tear">
                <h2 className="text-2xl font-pixel text-fuchsia-500 glitch mb-4" data-text="FATAL_ERROR">FATAL_ERROR</h2>
                <p className="text-cyan-400 mb-8 text-2xl">YIELD: {score}</p>
                <button 
                  onClick={resetGame}
                  className="px-6 py-2 bg-black border-2 border-fuchsia-500 text-fuchsia-500 font-pixel text-sm hover:bg-fuchsia-500 hover:text-black transition-colors"
                >
                  REBOOT_SYS
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-80 border-2 border-cyan-400 bg-black p-4 relative">
          <div className="flex items-center justify-between mb-4 border-b-2 border-cyan-400 pb-2">
            <h3 className="text-2xl text-cyan-400">AUDIO_UPLINK</h3>
            <span className="text-fuchsia-500 animate-pulse">LIVE</span>
          </div>

          <div className="mb-6 border-2 border-fuchsia-500 p-2 bg-[#050505]">
            <div className="w-full h-24 flex items-end gap-1 overflow-hidden">
              {[...Array(16)].map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 bg-cyan-400 ${isPlaying ? 'animate-pulse' : ''}`}
                  style={{ 
                    height: isPlaying ? `${Math.max(10, Math.random() * 100)}%` : '10%',
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              ))}
            </div>
            <div className="mt-4 text-center">
              <h4 className="text-xl text-fuchsia-500 truncate">{TRACKS[currentTrack].title}</h4>
              <p className="text-lg text-cyan-600 truncate">{TRACKS[currentTrack].artist}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={prevTrack}
                className="px-3 py-1 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black"
              >
                [ &lt;&lt; ]
              </button>
              <button 
                onClick={togglePlay}
                className="px-4 py-2 border-2 border-fuchsia-500 text-fuchsia-500 font-pixel text-xs hover:bg-fuchsia-500 hover:text-black"
              >
                {isPlaying ? '[ PAUSE ]' : '[ PLAY ]'}
              </button>
              <button 
                onClick={nextTrack}
                className="px-3 py-1 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black"
              >
                [ &gt;&gt; ]
              </button>
            </div>

            <div className="flex items-center gap-3 mt-4 border-t-2 border-cyan-400/30 pt-4">
              <button onClick={toggleMute} className="text-fuchsia-500 hover:text-cyan-400 w-16 text-left">
                {isMuted || volume === 0 ? 'MUTE' : 'VOL'}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted && parseFloat(e.target.value) > 0) setIsMuted(false);
                }}
                className="w-full h-2 bg-black border border-cyan-400 appearance-none cursor-pointer accent-fuchsia-500"
              />
            </div>
          </div>

          <audio 
            ref={audioRef} 
            src={TRACKS[currentTrack].url} 
            onEnded={nextTrack}
            preload="auto"
          />
        </div>

      </div>
    </div>
  );
}
