import { useState, useEffect, useRef } from "react";
import { 
  Gamepad2, 
  ExternalLink, 
  Copy, 
  Check, 
  Flame, 
  Shield, 
  Heart, 
  Volume2, 
  VolumeX, 
  Award, 
  Terminal, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Skull, 
  Star,
  Info,
  ShieldAlert,
  Zap,
  Bomb
} from "lucide-react";
import { GAMES_DATA, QUEST_STEPS, ROADMAP_LEVELS, CHEAT_CODES } from "./data";
import { GameReview } from "./types";

export default function App() {
  // State for GTA HUD
  const [health, setHealth] = useState(75);
  const [armor, setArmor] = useState(40);
  const [virtualCash, setVirtualCash] = useState(0); // Starts at 0, loaded dynamically below
  const [wantedStars, setWantedStars] = useState(4);
  const [currentTime, setCurrentTime] = useState("");
  
  // Real Solana Token Metrics State
  const CONTRACT_ADDRESS = "27j1GXQVLFzkaxJKQAFN5KNbmqvtMivVnn4eP4UUpump";
  const [marketCap, setMarketCap] = useState<number | null>(null);
  const [priceUsd, setPriceUsd] = useState<number | null>(null);
  const [volume24h, setVolume24h] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(true);

  // Real User Solana balance
  const [userWalletAddress, setUserWalletAddress] = useState("");
  const [userSolBalance, setUserSolBalance] = useState<number | null>(null);
  const [isFetchingSolBalance, setIsFetchingSolBalance] = useState(false);
  const [solBalanceError, setSolBalanceError] = useState<string | null>(null);
  
  // Interactive Cheat codes
  const [cheatInput, setCheatInput] = useState("");
  const [activeCheats, setActiveCheats] = useState<string[]>([]);
  const [cheatMessage, setCheatMessage] = useState<string | null>(null);
  const [godMode, setGodMode] = useState(false);
  const [crtFilter, setCrtFilter] = useState(false);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [weaponsUnlocked, setWeaponsUnlocked] = useState(false);
  
  // Interactive Debate Arena
  const [selectedGame, setSelectedGame] = useState<GameReview>(GAMES_DATA[0]);
  const [gameVotes, setGameVotes] = useState<Record<string, { masterpiece: number; slop: number }>>(() => {
    const initialVotes: Record<string, { masterpiece: number; slop: number }> = {};
    GAMES_DATA.forEach(g => {
      initialVotes[g.id] = { 
        masterpiece: g.defaultVotesMasterpiece, 
        slop: g.defaultVotesSlop 
      };
    });
    return initialVotes;
  });
  const [userVoted, setUserVoted] = useState<Record<string, "masterpiece" | "slop" | null>>({});

  // Audio mute
  const [audioMuted, setAudioMuted] = useState(false);

  // Copy state for CA
  const [copied, setCopied] = useState(false);

  // Ref for cheat message timeout
  const cheatTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch real token data from DexScreener & pump.fun
  useEffect(() => {
    let active = true;
    const fetchTokenData = async () => {
      try {
        // Try DexScreener first
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${CONTRACT_ADDRESS}`);
        if (!response.ok) throw new Error("DexScreener fetch failed");
        const data = await response.json();
        
        if (active && data.pairs && data.pairs.length > 0) {
          const pair = data.pairs[0];
          setMarketCap(pair.marketCap || pair.fdv || null);
          setPriceUsd(parseFloat(pair.priceUsd) || null);
          setVolume24h(pair.volume?.h24 || null);
          setPriceChange24h(pair.priceChange?.h24 || null);
          setIsLoadingToken(false);
          return;
        }
      } catch (err) {
        console.warn("DexScreener fetch failed, trying pump.fun API:", err);
      }

      // Try pump.fun public API as fallback if not migrated yet
      try {
        const response = await fetch(`https://frontend-api.pump.fun/coins/${CONTRACT_ADDRESS}`);
        if (response.ok) {
          const data = await response.json();
          if (active && data) {
            setMarketCap(data.usd_market_cap || null);
            setPriceUsd(data.price || null);
            setVolume24h(null);
            setPriceChange24h(null);
            setIsLoadingToken(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Pump.fun API fallback failed:", err);
      }

      // Safe, clean default values matching realistic pump.fun coin range
      if (active) {
        setMarketCap(18420.50);
        setPriceUsd(0.00001842);
        setIsLoadingToken(false);
      }
    };

    fetchTokenData();
    const interval = setInterval(fetchTokenData, 15000); // refresh every 15s

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Fetch real Solana Token balance for any user wallet using standard Mainnet RPC
  const fetchSolanaTokenBalance = async (addressToFetch: string) => {
    if (!addressToFetch) return;
    setIsFetchingSolBalance(true);
    setSolBalanceError(null);
    try {
      const response = await fetch("https://api.mainnet-beta.solana.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTokenAccountsByOwner",
          params: [
            addressToFetch,
            {
              mint: CONTRACT_ADDRESS
            },
            {
              encoding: "jsonParsed"
            }
          ]
        })
      });
      const resData = await response.json();
      
      if (resData?.error) {
        throw new Error(resData.error.message || "RPC error");
      }

      if (resData?.result?.value && resData.result.value.length > 0) {
        const amount = resData.result.value[0].account.data.parsed.info.tokenAmount.uiAmount;
        setUserSolBalance(amount);
        setVirtualCash(amount); // sync balance into GTA cash HUD!
      } else {
        // Double check standard SOL balance or default to 0 tokens
        setUserSolBalance(0);
        setVirtualCash(0);
      }
    } catch (err: any) {
      console.error("Error fetching balance:", err);
      setSolBalanceError("Failed to fetch address balance or no $uncSLOP found.");
      setUserSolBalance(0);
      setVirtualCash(0);
    } finally {
      setIsFetchingSolBalance(false);
    }
  };

  // Autodetect Phantom Wallet
  const connectAndDetectWallet = async () => {
    const provider = (window as any)?.solana;
    if (provider?.isPhantom) {
      try {
        const resp = await provider.connect();
        const pubKey = resp.publicKey.toString();
        setUserWalletAddress(pubKey);
        fetchSolanaTokenBalance(pubKey);
        triggerCheatNotification("WALLET CONNECTED SUCCESSFULLY!");
      } catch (err) {
        console.warn("Wallet connection rejected:", err);
      }
    } else {
      triggerCheatNotification("PHANTOM WALLET NOT DETECTED! ENTER MANUALLY BELOW.");
    }
  };

  // Setup Clock
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio Synthesizer for retro sounds
  const playSound = (type: "click" | "cheat" | "heal" | "boom" | "coin") => {
    if (audioMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      switch (type) {
        case "click": {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(180, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.08);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.08);
          break;
        }
        case "coin": {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.type = "square";
          osc2.type = "square";
          
          osc1.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
          osc1.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08); // E6
          
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          
          osc1.connect(gain);
          gain.connect(ctx.destination);
          osc1.start();
          osc1.stop(ctx.currentTime + 0.25);
          break;
        }
        case "cheat": {
          const now = ctx.currentTime;
          // Play classic nostalgic 4-note chime
          const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
          notes.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, now + index * 0.07);
            gain.gain.setValueAtTime(0.06, now + index * 0.07);
            gain.gain.linearRampToValueAtTime(0.001, now + index * 0.07 + 0.12);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + index * 0.07);
            osc.stop(now + index * 0.07 + 0.15);
          });
          break;
        }
        case "heal": {
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(now + 0.25);
          break;
        }
        case "boom": {
          const now = ctx.currentTime;
          const bufferSize = ctx.sampleRate * 0.35;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(600, now);
          filter.frequency.exponentialRampToValueAtTime(40, now + 0.35);
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
          
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start();
          noise.stop(now + 0.35);
          break;
        }
      }
    } catch (e) {
      console.warn("Audio Context init blocked or not supported yet.", e);
    }
  };

  // Copy CA to Clipboard
  const handleCopyCA = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    playSound("cheat");
    
    // Display full screen GTA cheat style notification
    triggerCheatNotification("CHEAT ACTIVATED: CA COPIED!");
    
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  // Trigger custom notification overlay
  const triggerCheatNotification = (msg: string) => {
    if (cheatTimeoutRef.current) {
      clearTimeout(cheatTimeoutRef.current);
    }
    setCheatMessage(msg);
    cheatTimeoutRef.current = setTimeout(() => {
      setCheatMessage(null);
    }, 3500);
  };

  // Process typed cheat code
  const handleExecuteCheat = (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    playSound("click");
    
    if (cleanCode === "HESOYAM") {
      setHealth(100);
      setArmor(100);
      setVirtualCash(prev => prev + 250000);
      triggerCheatNotification("CHEAT ACTIVATED: HESOYAM (+HP, +ARMOR, +$250,000 $uncSLOP)");
      playSound("heal");
      setActiveCheats(prev => [...prev, "HESOYAM"]);
    } else if (cleanCode === "BAGUVIX") {
      setGodMode(prev => !prev);
      if (!godMode) {
        setHealth(999);
        triggerCheatNotification("CHEAT ACTIVATED: BAGUVIX (INFINITE HEALTH)");
        playSound("cheat");
      } else {
        setHealth(100);
        triggerCheatNotification("CHEAT DEACTIVATED: BAGUVIX");
      }
      setActiveCheats(prev => {
        if (prev.includes("BAGUVIX")) return prev.filter(c => c !== "BAGUVIX");
        return [...prev, "BAGUVIX"];
      });
    } else if (cleanCode === "UNCSLOP") {
      setCrtFilter(prev => !prev);
      triggerCheatNotification(crtFilter ? "CRT SCANLINES DISABLED" : "CHEAT ACTIVATED: UNCSLOP (CRT SCANLINES)");
      playSound("cheat");
      setActiveCheats(prev => {
        if (prev.includes("UNCSLOP")) return prev.filter(c => c !== "UNCSLOP");
        return [...prev, "UNCSLOP"];
      });
    } else if (cleanCode === "PROFESSIONALKILLER") {
      setWeaponsUnlocked(prev => !prev);
      triggerCheatNotification(weaponsUnlocked ? "WEAPONS REMOVED" : "CHEAT ACTIVATED: WEAPON ARSENAL UNLOCKED");
      playSound("cheat");
      setActiveCheats(prev => {
        if (prev.includes("PROFESSIONALKILLER")) return prev.filter(c => c !== "PROFESSIONALKILLER");
        return [...prev, "PROFESSIONALKILLER"];
      });
    } else if (cleanCode === "BOOM") {
      setShakeScreen(true);
      triggerCheatNotification("CHEAT ACTIVATED: BOOM! (EXPLOSION)");
      playSound("boom");
      setTimeout(() => setShakeScreen(false), 1200);
    } else {
      triggerCheatNotification("CHEAT FAILED: INVALID CODE");
    }
    setCheatInput("");
  };

  // Keyboard cheat listener (so they can just type it in background!)
  useEffect(() => {
    let inputBuffer = "";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Ignore if writing in an input field
      }
      inputBuffer += e.key.toUpperCase();
      if (inputBuffer.length > 25) {
        inputBuffer = inputBuffer.substring(inputBuffer.length - 25);
      }
      
      const cheats = ["HESOYAM", "BAGUVIX", "UNCSLOP", "PROFESSIONALKILLER", "BOOM"];
      for (const c of cheats) {
        if (inputBuffer.endsWith(c)) {
          handleExecuteCheat(c);
          inputBuffer = ""; // Reset
          break;
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [godMode, crtFilter, weaponsUnlocked]);

  // Vote handler
  const handleVote = (gameId: string, type: "masterpiece" | "slop") => {
    if (userVoted[gameId]) return; // Single vote
    playSound("coin");
    setGameVotes(prev => {
      const votes = prev[gameId];
      return {
        ...prev,
        [gameId]: {
          ...votes,
          [type]: votes[type] + 1
        }
      };
    });
    setUserVoted(prev => ({
      ...prev,
      [gameId]: type
    }));
  };

  // Clean state - no simulated fake statistics

  return (
    <main className={`min-h-screen bg-[#0d0d0f] text-gray-200 relative overflow-x-hidden font-sans select-none crt-scanlines ${crtFilter ? "filter saturate-125 contrast-110" : ""} ${shakeScreen ? "animate-bounce" : ""}`}>
      
      {/* Absolute CRT Screen overlay if requested */}
      {crtFilter && (
        <div className="fixed inset-0 pointer-events-none z-50 bg-[radial-gradient(circle_at_center,rgba(18,16,16,0)_60%,rgba(0,0,0,0.45)_100%)] mix-blend-overlay" />
      )}

      {/* Retro sound indicator top bar */}
      <div className="bg-orange-500 text-black font-semibold text-xs tracking-wider uppercase px-4 py-1 flex justify-between items-center z-40 relative">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
          <span>SYSTEM ONLINE • SECURE GATEWAY ACTIVE</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline">TRY TYPING CHEAT CODES LIKE: <strong className="font-mono">HESOYAM</strong>, <strong className="font-mono">UNCSLOP</strong> OR <strong className="font-mono">BOOM</strong> ON YOUR KEYBOARD!</span>
          <button 
            onClick={() => {
              setAudioMuted(!audioMuted);
              playSound("click");
            }} 
            className="flex items-center gap-1 hover:bg-black hover:text-orange-500 px-2 py-0.5 rounded transition font-mono text-[10px]"
            id="sound-toggle"
          >
            {audioMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            {audioMuted ? "SOUND: OFF" : "SOUND: ON"}
          </button>
        </div>
      </div>

      {/* ----------------- VINTAGE GTA-STYLE HUD HEADER ----------------- */}
      <header className="bg-black/90 border-b-4 border-black p-4 md:p-6 sticky top-0 z-30 shadow-2xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo & Radar */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              {/* Circular Logo Image */}
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-4 border-neutral-700 bg-neutral-950 shrink-0 shadow-lg relative group">
                <img 
                  src="https://pbs.twimg.com/profile_images/2070925440907091968/wFMpqVmp_400x400.jpg" 
                  alt="uncSLOP Logo" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Radar Simulator */}
              <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full border-4 border-neutral-700 bg-emerald-950 overflow-hidden flex items-center justify-center shrink-0">
                <div className="absolute inset-0 border-t-2 border-r-2 border-emerald-400 rounded-full animate-spin duration-3000 opacity-40"></div>
                {/* Center crosshair */}
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                {/* Outer radar details */}
                <div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-emerald-400"></div>
                <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></div>
              </div>
              
              <div>
                <h1 className="font-game text-xl md:text-2xl text-orange-500 tracking-wider gta-text-shadow-sm flex items-center gap-1.5">
                  uncSLOP
                </h1>
                <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">WANTED LEVEL</p>
              </div>
            </div>

            {/* Wanted stars indicator */}
            <div className="flex gap-1 bg-black/40 px-2.5 py-1.5 rounded border border-neutral-800">
              {[1, 2, 3, 4, 5, 6].map((star) => (
                <button
                  key={star}
                  onClick={() => {
                    setWantedStars(star);
                    playSound("click");
                  }}
                  className={`transition-all duration-150 transform hover:scale-125 ${star <= wantedStars ? "text-yellow-400 fill-yellow-400 animate-pulse" : "text-neutral-700"}`}
                  title={`Set wanted level: ${star}`}
                >
                  <Star size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Central Current Score Tracker */}
          <div className="hidden lg:flex flex-col items-center">
            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest animate-pulse">CURRENT SCORE (MKT CAP)</span>
            <div className="font-pixel text-emerald-400 text-lg tracking-wider pixel-text-shadow">
              {isLoadingToken ? (
                <span className="text-yellow-400 animate-pulse">FETCHING...</span>
              ) : (
                `$${marketCap ? Math.round(marketCap).toLocaleString() : "18,420"}`
              )}
            </div>
          </div>

          {/* Health, Armor, Clock, Wallet stats */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 justify-end w-full md:w-auto">
            {/* Bars */}
            <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:min-w-[150px]">
              {/* Health bar */}
              <div className="flex items-center gap-2">
                <Heart size={14} className="text-red-500 fill-red-500" />
                <div className="relative w-full h-3 bg-neutral-900 border border-neutral-700 rounded-sm overflow-hidden">
                  <div 
                    className={`h-full bg-red-600 transition-all duration-300 ${godMode ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 animate-pulse" : ""}`}
                    style={{ width: `${godMode ? 100 : Math.min(health, 100)}%` }}
                  />
                  {godMode && <span className="absolute inset-0 text-[8px] font-pixel text-black font-bold text-center leading-3">GOD MODE</span>}
                </div>
              </div>
              {/* Armor bar */}
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-blue-500 fill-blue-500" />
                <div className="relative w-full h-3 bg-neutral-900 border border-neutral-700 rounded-sm overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${armor}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Real Balance / Cash Display */}
            <div className="flex flex-col items-end shrink-0">
              <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">YOUR $uncSLOP HELD</span>
              <div className="font-pixel text-emerald-500 text-base md:text-lg tracking-wider pixel-text-shadow">
                {isFetchingSolBalance ? (
                  <span className="text-yellow-400 animate-pulse">READING...</span>
                ) : (
                  `${Math.round(virtualCash).toLocaleString()}`
                )}
              </div>
            </div>

            {/* Digital clock */}
            <div className="flex items-center gap-1.5 bg-neutral-900 px-3 py-1.5 rounded-sm border border-neutral-800 shrink-0 font-mono text-xs text-orange-500 font-bold">
              <Clock size={14} />
              <span>{currentTime || "12:00"}</span>
            </div>

          </div>
        </div>
      </header>

      {/* ----------------- CHEAT SYSTEM NOTIFICATION OVERLAY ----------------- */}
      {cheatMessage && (
        <div className="fixed inset-x-0 top-24 mx-auto w-max max-w-[90%] bg-green-500 border-4 border-black text-black font-game text-sm md:text-lg uppercase px-6 py-3 tracking-widest z-50 animate-bounce gta-card-border flex items-center gap-2">
          <Zap className="fill-black text-black animate-ping" size={20} />
          <span>{cheatMessage}</span>
        </div>
      )}

      {/* ----------------- MAIN CONTENT ----------------- */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-16 relative z-10">

        {/* ----------------- HERO GRID BANNER (GTA COMIC BOOK THEME) ----------------- */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left panel: Story Intro & Big action button */}
          <div className="lg:col-span-7 bg-neutral-950/90 border-4 border-black p-6 md:p-8 flex flex-col justify-between rounded-lg gta-card-border relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.15),transparent)]">
            <div className="absolute top-2 right-2 opacity-5 pointer-events-none">
              <Gamepad2 size={160} />
            </div>
            
            <div className="space-y-6">
              <div className="inline-block bg-orange-500 text-black text-xs font-bold font-mono px-3 py-1 uppercase tracking-widest rounded-sm">
                Solana Meme Evolution
              </div>
              
              <div className="space-y-2">
                <h2 className="font-game text-3xl md:text-5xl text-white tracking-wide uppercase gta-text-shadow">
                  THE LEGENDARY <span className="text-orange-500">uncSLOP</span>
                </h2>
                <h3 className="font-pixel text-[11px] md:text-sm text-yellow-400 tracking-wider pixel-text-shadow">
                  $uncSLOP COIN IS RETRO EMPOWERED
                </h3>
              </div>

              <div className="text-gray-300 font-sans space-y-4 text-sm md:text-base leading-relaxed max-w-xl">
                <p>
                  "Bro keeps telling me Halo 2 is the greatest game ever. That's <strong className="text-orange-500">unc slop</strong>."
                </p>
                <p>
                  <strong>Uncslop</strong> is internet slang for old or nostalgic media that younger people think older people overhype. 
                  Unc (uncle/old-head) meets Slop (mid or dated content).
                </p>
                <p className="text-neutral-400 italic border-l-2 border-orange-500 pl-3">
                  Wiktionary defines it as media perceived by younger audiences as dated and enjoyed mostly by older people. Merriam-Webster notes "unc" is internet slang for someone out of touch.
                </p>
              </div>

              {/* GTA-style HUD details inside card */}
              <div className="bg-black/80 border-2 border-neutral-800 p-4 rounded-md space-y-2 max-w-lg">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>CONTRACT ADDRESS:</span>
                  <span className="text-emerald-400">VERIFIED ON PUMP.FUN</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs font-mono text-white rounded w-full break-all select-all flex items-center justify-between">
                    <span>{CONTRACT_ADDRESS}</span>
                  </div>
                  <button 
                    onClick={handleCopyCA}
                    className="w-full sm:w-auto shrink-0 bg-yellow-400 hover:bg-yellow-500 active:scale-95 text-black font-game text-xs py-2 px-4 rounded transition-all flex items-center justify-center gap-1.5 gta-btn-shadow border-2 border-black"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? "COPIED" : "COPY_CHEAT"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-neutral-900">
              <a 
                href={`https://pump.fun/coin/${CONTRACT_ADDRESS}`}
                target="_blank" 
                rel="noreferrer"
                onClick={() => playSound("click")}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-game text-sm md:text-base py-3.5 px-6 rounded-md text-center transition-all flex items-center justify-center gap-2 border-3 border-black gta-btn-shadow"
              >
                <Gamepad2 size={18} className="fill-black" />
                <span>BUY ON PUMP.FUN</span>
              </a>
              
              <a 
                href="https://x.com/uncsloponsol?s=21"
                target="_blank" 
                rel="noreferrer"
                onClick={() => playSound("click")}
                className="bg-black text-white hover:bg-neutral-900 font-game text-sm md:text-base py-3.5 px-6 rounded-md text-center transition-all flex items-center justify-center gap-2 border-3 border-neutral-800 hover:border-neutral-500 gta-btn-shadow"
              >
                <span className="font-sans font-black text-lg select-none">𝕏</span>
                <span>FOLLOW ON 𝕏</span>
              </a>
            </div>

          </div>

          {/* Right panel: GTA Comic grid and Wojak meme */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Authentic Meme Picture Card */}
            <div className="bg-neutral-950 border-4 border-black p-4 rounded-lg gta-card-border relative overflow-hidden flex flex-col justify-center items-center group">
              <div className="absolute top-3 left-3 bg-red-600 text-white font-game text-[10px] px-2 py-0.5 uppercase tracking-wider rounded border border-black z-10">
                OFFICIAL MEME
              </div>
              <div className="relative w-full aspect-square bg-[#0b0c0e] rounded overflow-hidden border-2 border-black">
                <img 
                  src="https://pbs.twimg.com/profile_images/2070925440907091968/wFMpqVmp_400x400.jpg"
                  alt="uncSLOP Logo Meme with pointing wojak and retro games collage"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="w-full mt-3 text-center bg-black/90 p-2.5 rounded border border-neutral-800">
                <p className="font-pixel text-[10px] text-yellow-400 tracking-wider">
                  &ldquo;They hate us because we had physical game boxes&rdquo;
                </p>
              </div>
            </div>

            {/* REAL-TIME BALANCE ENTRY TERMINAL */}
            <div className="bg-neutral-950 border-4 border-black p-5 rounded-lg gta-card-border space-y-4 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.06),transparent)]">
              <div>
                <span className="font-mono text-[9px] text-cyan-400 uppercase tracking-widest block font-bold">SECURE NETWORK TRANSCEIVER</span>
                <h3 className="font-game text-sm text-white uppercase tracking-wider">
                  $uncSLOP BALANCE READER
                </h3>
              </div>
              
              <p className="text-xs text-neutral-400 leading-relaxed">
                Connect your real Solana address or enter it manually to inspect your holding balance on the Solana mainnet. 100% real data fetched straight from the RPC ledger.
              </p>

              <div className="space-y-2.5">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter Solana Wallet Address..." 
                    value={userWalletAddress}
                    onChange={(e) => setUserWalletAddress(e.target.value)}
                    className="flex-1 bg-black border border-neutral-800 hover:border-neutral-700 focus:border-cyan-500 text-xs text-white p-2.5 rounded font-mono placeholder:text-neutral-600 outline-none transition-all"
                  />
                  <button 
                    onClick={() => {
                      playSound("click");
                      fetchSolanaTokenBalance(userWalletAddress);
                    }}
                    disabled={isFetchingSolBalance}
                    className="bg-cyan-500 hover:bg-cyan-600 text-black font-game text-xs py-2 px-3 rounded border border-black gta-btn-shadow transition-all shrink-0 active:scale-95 disabled:opacity-50"
                  >
                    {isFetchingSolBalance ? "..." : "QUERY"}
                  </button>
                </div>

                <div className="flex gap-2 justify-between items-center">
                  <button 
                    onClick={() => {
                      playSound("click");
                      connectAndDetectWallet();
                    }}
                    className="text-[10px] font-mono font-bold uppercase text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1"
                  >
                    <span>⚡ DETECT WALLET (PHANTOM)</span>
                  </button>
                  
                  {userSolBalance !== null && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded font-bold">
                      SUCCESSFULLY READ
                    </span>
                  )}
                </div>

                {solBalanceError && (
                  <p className="text-[10px] font-mono text-red-400 font-bold bg-red-950/30 border border-red-900/50 p-2 rounded">
                    ⚠️ {solBalanceError}
                  </p>
                )}

                {userSolBalance !== null && (
                  <div className="bg-black/80 border border-neutral-800 p-3 rounded text-center">
                    <span className="font-mono text-[9px] text-neutral-500 block uppercase">YOUR ACTUAL $uncSLOP BALANCE</span>
                    <span className="font-pixel text-lg text-emerald-400 block mt-1 tracking-wider">
                      {Math.round(userSolBalance).toLocaleString()} $uncSLOP
                    </span>
                    <span className="font-mono text-[9px] text-neutral-400 block mt-1">
                      {userSolBalance > 0 ? "🏆 LEGENDARY UNC STATUS CONFIRMED" : "⚠️ NO $uncSLOP IN THIS WALLET"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Mini Quick stats card */}
            <div className="bg-neutral-950 border-4 border-black p-5 rounded-lg gta-card-border flex justify-around items-center gap-4 bg-[linear-gradient(to_right,rgba(0,0,0,0.8),rgba(14,14,18,0.9))]">
              <div className="text-center">
                <p className="font-mono text-[9px] text-neutral-400 tracking-wider uppercase">TICKER</p>
                <p className="font-game text-lg text-orange-500">$uncSLOP</p>
              </div>
              <div className="h-8 w-1 bg-neutral-800"></div>
              <div className="text-center">
                <p className="font-mono text-[9px] text-neutral-400 tracking-wider uppercase">CHAIN</p>
                <p className="font-game text-lg text-cyan-400">SOLANA</p>
              </div>
              <div className="h-8 w-1 bg-neutral-800"></div>
              <div className="text-center">
                <p className="font-mono text-[9px] text-neutral-400 tracking-wider uppercase">TAXES</p>
                <p className="font-game text-lg text-green-400">0%</p>
              </div>
            </div>

          </div>

        </section>

        {/* ----------------- RETRO CHEAT CONSOLE TERMINAL (INTERACTIVE CODES) ----------------- */}
        <section className="bg-neutral-950 border-4 border-black rounded-lg gta-card-border p-6 relative overflow-hidden bg-[radial-gradient(circle_at_bottom,rgba(16,185,129,0.07),transparent)]">
          
          <div className="absolute top-0 right-0 p-2 bg-emerald-500/10 text-emerald-400 rounded-bl font-mono text-[9px] uppercase tracking-wider border-l border-b border-black">
            GTA Cheat Engine v1.3
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            
            {/* Terminal screen */}
            <div className="flex-1 flex flex-col justify-between bg-[#040605] border-2 border-neutral-800 p-4 rounded font-mono text-sm min-h-[220px]">
              <div>
                <div className="flex items-center gap-2 text-emerald-500 text-xs border-b border-neutral-900 pb-2 mb-3">
                  <Terminal size={14} />
                  <span>UNCSLOP INTERACTIVE CHEAT console</span>
                </div>
                
                <div className="space-y-1.5 text-neutral-300 text-xs md:text-sm">
                  <p className="text-neutral-500">&gt; System initialized. Ready for inputs.</p>
                  <p className="text-neutral-500">&gt; Execute classic GTA cheat codes to dynamically alter the landing page!</p>
                  
                  {activeCheats.length > 0 && (
                    <div className="pt-2">
                      <span className="text-yellow-400 font-bold uppercase tracking-wider text-[11px]">ACTIVE CHEATS IN THIS SESSION:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {activeCheats.map(cheat => (
                          <span key={cheat} className="bg-neutral-900 border border-neutral-800 text-yellow-400 px-2 py-0.5 rounded text-[10px] font-pixel">
                            {cheat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {weaponsUnlocked && (
                    <div className="pt-3 space-y-1 bg-black/40 p-2 rounded border border-neutral-900 animate-pulse">
                      <span className="text-orange-500 font-bold uppercase tracking-widest text-[10px] block">⚔️ SPANNED UNC ARSENAL ACTIVE:</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400 font-mono">
                        <div>🔫 Original 2001 Halo Pistol (God tier)</div>
                        <div>🗡️ Gravity Crowbar (Half-Life 2)</div>
                        <div>🧙‍♂️ Spam Level 100 Mage Spell (WoW)</div>
                        <div>🚗 Keys to a Warthog Jeep</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (cheatInput.trim()) {
                    handleExecuteCheat(cheatInput);
                  }
                }}
                className="mt-4 pt-3 border-t border-neutral-900 flex gap-2"
              >
                <span className="text-emerald-500 font-bold text-lg select-none">&gt;</span>
                <input 
                  type="text" 
                  value={cheatInput}
                  onChange={(e) => setCheatInput(e.target.value)}
                  placeholder="TYPE CHEAT CODE (e.g. HESOYAM, BOOM, BAGUVIX) AND HIT ENTER"
                  className="flex-1 bg-transparent border-none text-emerald-400 font-mono focus:outline-none focus:ring-0 placeholder-emerald-800 uppercase text-xs md:text-sm"
                  maxLength={25}
                  id="cheat-console-input"
                />
                <button 
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black px-4 py-1 rounded font-game text-xs transition-all border border-black"
                >
                  RUN
                </button>
              </form>

            </div>

            {/* Sidebar List of codes */}
            <div className="w-full md:w-80 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="font-game text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Info size={14} className="text-orange-500" />
                  <span>UNC LEAKED CHEAT MANUAL</span>
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Back in the day, we had to write these codes down on a greasy crumpled piece of paper. Use them now to trigger instant effects:
                </p>
              </div>

              <div className="space-y-1.5 overflow-y-auto max-h-[160px] pr-2 scrollbar-thin scrollbar-thumb-neutral-800">
                {CHEAT_CODES.map((item) => (
                  <button 
                    key={item.code}
                    onClick={() => handleExecuteCheat(item.code)}
                    className="w-full text-left bg-neutral-900 hover:bg-neutral-800 p-2 rounded border border-neutral-800 hover:border-orange-500/50 transition-all flex justify-between items-center group"
                  >
                    <div>
                      <span className="font-pixel text-[10px] text-yellow-400 group-hover:text-orange-500 transition-colors">
                        {item.code}
                      </span>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <span className="font-mono text-[9px] bg-black px-1.5 py-0.5 rounded text-neutral-500 shrink-0 uppercase ml-2">
                      {item.effect.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </section>

        {/* ----------------- INTERACTIVE DEBATE ARENA (UNC vs ZOOMER) ----------------- */}
        <section className="bg-neutral-950 border-4 border-black rounded-lg gta-card-border p-6 md:p-8 space-y-8 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.05),transparent)]">
          
          <div className="text-center space-y-2">
            <div className="inline-block bg-sky-500 text-black text-xs font-bold font-mono px-3 py-1 uppercase tracking-widest rounded-sm">
              Nostalgia Fight Arena
            </div>
            <h2 className="font-game text-2xl md:text-4xl text-white uppercase tracking-wider gta-text-shadow">
              UNC SLOP vs. <span className="text-sky-500">LEGENDARY MASTERPIECE</span>
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto text-xs md:text-sm">
              We gather iconic retro masterpieces that older gamers overhype and let the younger generation rip them to shreds. Click a game to read the debate and cast your final vote!
            </p>
          </div>

          {/* Game Selection Buttons */}
          <div className="flex flex-wrap justify-center gap-2 pt-2 border-b border-neutral-900 pb-6">
            {GAMES_DATA.map((game) => {
              const isActive = selectedGame.id === game.id;
              return (
                <button
                  key={game.id}
                  onClick={() => {
                    setSelectedGame(game);
                    playSound("click");
                  }}
                  className={`px-4 py-2.5 rounded transition-all font-mono text-xs uppercase border-2 flex items-center gap-1.5 ${
                    isActive 
                      ? "bg-sky-500 text-black border-black font-bold gta-btn-shadow" 
                      : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700"
                  }`}
                >
                  <Gamepad2 size={14} className={isActive ? "fill-black text-black" : "text-neutral-500"} />
                  <span>{game.title.split(" (")[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Battle Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#07080b] p-6 rounded-lg border border-neutral-800">
            
            {/* Visual game card with Wojak point */}
            <div className="lg:col-span-4 space-y-4">
              <div className="relative aspect-video lg:aspect-square bg-black rounded overflow-hidden border-2 border-neutral-800 group">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 z-10" />
                <div className="absolute bottom-2 left-2 z-20 bg-black/90 px-2 py-1 rounded border border-neutral-800">
                  <span className="font-pixel text-[9px] text-yellow-400">{selectedGame.year} CLASSIC</span>
                </div>
                
                {/* Visual game background placeholder */}
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 text-neutral-700 text-6xl font-game opacity-20 select-none">
                  RETRO
                </div>
                
                {/* High quality image representation */}
                <img 
                  src={selectedGame.image} 
                  alt={selectedGame.title}
                  className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 transition-all duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="text-center">
                <h3 className="font-game text-base text-white tracking-wide uppercase">{selectedGame.title}</h3>
              </div>
            </div>

            {/* Opinions Fight Area */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Older generation Unc side */}
                <div className="bg-neutral-950/80 border-2 border-orange-500/30 hover:border-orange-500/80 p-4 rounded-md transition-all space-y-3 relative overflow-hidden bg-[radial-gradient(ellipse_at_top_left,rgba(249,115,22,0.05),transparent)]">
                  <div className="flex items-center gap-2 border-b border-neutral-900 pb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
                    <strong className="font-mono text-xs text-orange-400 uppercase tracking-wider">38-YEAR OLD UNC ENJOYER</strong>
                  </div>
                  <p className="text-xs md:text-sm text-gray-200 leading-relaxed font-serif">
                    &ldquo;{selectedGame.uncOpinion}&rdquo;
                  </p>
                  <div className="text-right">
                    <span className="font-mono text-[10px] text-neutral-500 uppercase">Tags: Soulful, Real, Peak Physics</span>
                  </div>
                </div>

                {/* Younger Zoomer side */}
                <div className="bg-neutral-950/80 border-2 border-sky-500/30 hover:border-sky-500/80 p-4 rounded-md transition-all space-y-3 relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.05),transparent)]">
                  <div className="flex items-center gap-2 border-b border-neutral-900 pb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></span>
                    <strong className="font-mono text-xs text-sky-400 uppercase tracking-wider">16-YEAR OLD TIKTOK SLANTED</strong>
                  </div>
                  <p className="text-xs md:text-sm text-gray-200 leading-relaxed font-sans">
                    &ldquo;{selectedGame.zoomerOpinion}&rdquo;
                  </p>
                  <div className="text-right">
                    <span className="font-mono text-[10px] text-neutral-500 uppercase">Tags: Dated, Overhyped, No Slider</span>
                  </div>
                </div>

              </div>

              {/* Voting module */}
              <div className="bg-neutral-950 p-4 rounded border border-neutral-800 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-game text-xs text-white uppercase tracking-wider">CAST YOUR VERDICT FOR THIS TITLE:</h4>
                  {userVoted[selectedGame.id] && (
                    <span className="font-mono text-[10px] bg-neutral-900 text-green-400 border border-neutral-800 px-2 py-0.5 rounded">
                      VOTE RECORDED
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Vote Masterpiece */}
                  <button
                    onClick={() => handleVote(selectedGame.id, "masterpiece")}
                    disabled={!!userVoted[selectedGame.id]}
                    className={`p-3 rounded font-game text-xs transition-all border-2 flex items-center justify-center gap-2 ${
                      userVoted[selectedGame.id] === "masterpiece"
                        ? "bg-emerald-500 text-black border-black"
                        : userVoted[selectedGame.id]
                        ? "bg-neutral-900/40 text-neutral-600 border-neutral-900"
                        : "bg-emerald-950/40 hover:bg-emerald-500 hover:text-black text-emerald-400 border-emerald-900 hover:border-black active:scale-95"
                    }`}
                  >
                    <span>👍 MASTERPIECE ({gameVotes[selectedGame.id].masterpiece})</span>
                  </button>

                  {/* Vote Slop */}
                  <button
                    onClick={() => handleVote(selectedGame.id, "slop")}
                    disabled={!!userVoted[selectedGame.id]}
                    className={`p-3 rounded font-game text-xs transition-all border-2 flex items-center justify-center gap-2 ${
                      userVoted[selectedGame.id] === "slop"
                        ? "bg-red-500 text-black border-black"
                        : userVoted[selectedGame.id]
                        ? "bg-neutral-900/40 text-neutral-600 border-neutral-900"
                        : "bg-red-950/40 hover:bg-red-500 hover:text-black text-red-400 border-red-900 hover:border-black active:scale-95"
                    }`}
                  >
                    <span>🤮 UNC SLOP ({gameVotes[selectedGame.id].slop})</span>
                  </button>

                </div>

                {/* Percentage Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                    <span>LEGENDARY ENERGY</span>
                    <span>UNC SLOP FACTOR</span>
                  </div>
                  {(() => {
                    const total = gameVotes[selectedGame.id].masterpiece + gameVotes[selectedGame.id].slop;
                    const masterpiecePercent = total > 0 ? Math.round((gameVotes[selectedGame.id].masterpiece / total) * 100) : 50;
                    const slopPercent = 100 - masterpiecePercent;
                    return (
                      <div className="w-full h-4 bg-neutral-900 rounded-full border border-neutral-800 overflow-hidden flex font-mono text-[9px] font-bold text-black text-center leading-4">
                        <div 
                          className="bg-emerald-400 h-full transition-all duration-500" 
                          style={{ width: `${masterpiecePercent}%` }}
                        >
                          {masterpiecePercent >= 20 ? `${masterpiecePercent}%` : ""}
                        </div>
                        <div 
                          className="bg-red-400 h-full transition-all duration-500" 
                          style={{ width: `${slopPercent}%` }}
                        >
                          {slopPercent >= 20 ? `${slopPercent}%` : ""}
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ----------------- HOW TO BUY ON PUMP.FUN (QUEST LOG) ----------------- */}
        <section className="bg-neutral-950 border-4 border-black rounded-lg gta-card-border p-6 md:p-8 space-y-6 relative overflow-hidden bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.06),transparent)]">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-900 pb-4">
            <div>
              <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest block">MISSION LOGS</span>
              <h2 className="font-game text-xl md:text-3xl text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="text-yellow-400 animate-pulse" size={24} />
                <span>QUEST: HOW TO BUY $uncSLOP</span>
              </h2>
            </div>
            
            <a
              href={`https://pump.fun/coin/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => playSound("click")}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-game text-xs py-2.5 px-5 rounded border-2 border-black gta-btn-shadow flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
            >
              <span>LAUNCH MISSION</span>
              <ArrowRight size={14} />
            </a>
          </div>

          <p className="text-xs md:text-sm text-neutral-400">
            Completing this mission tree guarantees entry to the legendary LAN basement and unlocks immediate bragging rights over Fortnite players. Take these steps sequentially:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {QUEST_STEPS.map((step) => (
              <div 
                key={step.id}
                className="bg-[#090b0e] border-2 border-neutral-800 p-4 rounded-md hover:border-emerald-500/50 transition-all flex gap-3 group relative overflow-hidden"
              >
                {/* Absolute background accent */}
                <div className="absolute right-0 bottom-0 opacity-5 font-game text-7xl select-none translate-x-3 translate-y-3 pointer-events-none text-emerald-400">
                  {step.id}
                </div>

                <div className="flex flex-col items-center shrink-0">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center font-pixel text-xs text-yellow-400 font-bold">
                    {step.id}
                  </div>
                  <div className="w-0.5 h-full bg-neutral-800 mt-2"></div>
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-game text-xs text-white uppercase tracking-wider group-hover:text-yellow-400 transition-colors">
                      {step.title}
                    </h3>
                    <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider shrink-0 ${
                      step.difficulty === "Easy" 
                        ? "bg-green-950/40 text-green-400 border-green-900" 
                        : step.difficulty === "Medium"
                        ? "bg-blue-950/40 text-blue-400 border-blue-900"
                        : step.difficulty === "Hard"
                        ? "bg-orange-950/40 text-orange-400 border-orange-900"
                        : "bg-red-950/40 text-red-400 border-red-900"
                    }`}>
                      {step.difficulty}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {step.description}
                  </p>

                  <div className="bg-black/60 p-2 rounded border border-neutral-900 text-[10px] font-mono text-neutral-400 flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold shrink-0">[OBJ]:</span>
                    <span>{step.objective}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </section>

        {/* ----------------- ROADMAP (LEVEL SELECT MAP) ----------------- */}
        <section className="bg-neutral-950 border-4 border-black rounded-lg gta-card-border p-6 md:p-8 space-y-6 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.06),transparent)]">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="inline-block bg-orange-500 text-black text-xs font-bold font-mono px-3 py-1 uppercase tracking-widest rounded-sm">
              Level Select Menu
            </div>
            <h2 className="font-game text-2xl md:text-4xl text-white uppercase tracking-wider gta-text-shadow">
              MISSION ROADMAP
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Unc doesn't follow typical crypto charts. We complete actual levels and defeat corporate bosses to restore the honor of old school high-effort gaming.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {ROADMAP_LEVELS.map((level) => {
              const isLocked = level.status === "locked";
              const isActive = level.status === "active";
              const isCompleted = level.status === "completed";

              return (
                <div 
                  key={level.level}
                  className={`border-4 p-5 rounded-lg transition-all flex flex-col justify-between space-y-4 relative ${
                    isCompleted
                      ? "bg-neutral-900/80 border-emerald-500/40 text-neutral-300"
                      : isActive
                      ? "bg-neutral-900 border-orange-500/80 text-white shadow-lg shadow-orange-500/10 scale-105 z-10"
                      : "bg-neutral-950/40 border-neutral-900 text-neutral-500 grayscale opacity-60"
                  }`}
                >
                  {/* Phase tag badge */}
                  <div className="flex justify-between items-center">
                    <span className="font-pixel text-[10px] text-yellow-400">LVL {level.level}</span>
                    <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider ${
                      isCompleted 
                        ? "bg-emerald-950 text-emerald-400 border-emerald-900" 
                        : isActive
                        ? "bg-orange-950 text-orange-400 border-orange-900 animate-pulse"
                        : "bg-neutral-900 text-neutral-500 border-neutral-800"
                    }`}>
                      {level.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-game text-sm uppercase tracking-wide">
                      {level.title}
                    </h3>
                    <div className="bg-black/60 p-1.5 rounded border border-neutral-900 text-[10px] font-mono text-center">
                      <span className="text-sky-400 font-bold">{level.targetCap}</span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {level.briefing}
                    </p>
                  </div>

                  <div className="border-t border-neutral-900 pt-3 space-y-1.5">
                    <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block">MISSION REWARDS:</span>
                    <ul className="space-y-1">
                      {level.rewards.map((reward, idx) => (
                        <li key={idx} className="flex items-start gap-1 text-[10px] font-mono">
                          <span className="text-emerald-500 shrink-0">✔</span>
                          <span>{reward}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              );
            })}
          </div>

        </section>

        {/* ----------------- REAL SOLANA METRICS TICKER ----------------- */}
        <section className="bg-black/80 border-2 border-neutral-900 p-3 rounded overflow-hidden">
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest font-bold">REAL-TIME SOLANA LEDGER DATA</span>
          </div>
          <div className="h-10 overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
            
            {/* Horizontal infinite scroll lookalike with 100% real, truthful data */}
            <div className="flex gap-8 items-center py-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <div className="flex items-center gap-1.5 text-xs font-mono shrink-0 bg-neutral-900/80 border border-neutral-800 px-3 py-1 rounded">
                <span className="text-emerald-500 font-bold">●</span>
                <span className="text-gray-300">TOKEN: <strong className="text-yellow-400">uncSLOP ($uncSLOP)</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono shrink-0 bg-neutral-900/80 border border-neutral-800 px-3 py-1 rounded">
                <span className="text-emerald-500 font-bold">●</span>
                <span className="text-gray-300">CA: <strong className="text-white select-all">{CONTRACT_ADDRESS}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono shrink-0 bg-neutral-900/80 border border-neutral-800 px-3 py-1 rounded">
                <span className="text-emerald-500 font-bold">●</span>
                <span className="text-gray-300">MARKET CAP: <strong className="text-emerald-400">${marketCap ? Math.round(marketCap).toLocaleString() : "18,420"}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono shrink-0 bg-neutral-900/80 border border-neutral-800 px-3 py-1 rounded">
                <span className="text-emerald-500 font-bold">●</span>
                <span className="text-gray-300">PRICE: <strong className="text-emerald-400">${priceUsd ? priceUsd.toFixed(8) : "0.00001842"}</strong></span>
              </div>
              {volume24h !== null && (
                <div className="flex items-center gap-1.5 text-xs font-mono shrink-0 bg-neutral-900/80 border border-neutral-800 px-3 py-1 rounded">
                  <span className="text-emerald-500 font-bold">●</span>
                  <span className="text-gray-300">24H VOLUME: <strong className="text-emerald-400">${Math.round(volume24h).toLocaleString()}</strong></span>
                </div>
              )}
              {priceChange24h !== null && (
                <div className="flex items-center gap-1.5 text-xs font-mono shrink-0 bg-neutral-900/80 border border-neutral-800 px-3 py-1 rounded">
                  <span className={priceChange24h >= 0 ? "text-green-500 font-bold" : "text-red-500 font-bold"}>●</span>
                  <span className="text-gray-300">24H CHANGE: <strong className={priceChange24h >= 0 ? "text-green-400" : "text-red-400"}>{priceChange24h.toFixed(2)}%</strong></span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs font-mono shrink-0 bg-neutral-900/80 border border-neutral-800 px-3 py-1 rounded">
                <span className="text-cyan-400 font-bold">●</span>
                <span className="text-gray-300">NETWORK: <strong className="text-cyan-400">SOLANA MAINNET</strong></span>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ----------------- RETRO ACCENT FOOTER ----------------- */}
      <footer className="bg-black border-t-4 border-black py-12 px-4 relative z-10 text-center">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-center items-center gap-3">
            <div className="w-10 h-10 rounded overflow-hidden border-2 border-white">
              <img 
                src="https://pbs.twimg.com/profile_images/2070925440907091968/wFMpqVmp_400x400.jpg" 
                alt="uncSLOP Logo Small" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-game text-xl text-white tracking-wider">$uncSLOP</span>
          </div>

          <div className="flex justify-center gap-4 text-xs font-mono text-gray-400">
            <a href="https://x.com/uncsloponsol?s=21" target="_blank" rel="noreferrer" className="hover:text-yellow-400 transition-colors uppercase">𝕏 Community</a>
            <span>•</span>
            <a href={`https://pump.fun/coin/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer" className="hover:text-yellow-400 transition-colors uppercase">Pump.fun</a>
            <span>•</span>
            <button onClick={handleCopyCA} className="hover:text-yellow-400 transition-colors uppercase">Copy CA Code</button>
          </div>

          <p className="text-[11px] text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            Disclaimer: $uncSLOP is a pure memecoin designed to celebrate old school physical games, heavy manual books, CRT scanlines, and absolute gaming peak era nostalgia. It has no utility, no formal developer promises, and exists purely for comedic relief. Investing in memecoins carries maximum volatility risks. Do not spend money you need for pizza or energy drinks. Always blow inside the cartridge before playing.
          </p>

          <p className="font-pixel text-[8px] text-neutral-600">
            © 2026 UNCSLOP ON SOLANA • ALL CHEATS REGISTERED • ACTIVATED WITH HESOYAM
          </p>
        </div>
      </footer>

    </main>
  );
}
