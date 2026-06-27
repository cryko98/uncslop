import { GameReview, QuestStep, RoadmapLevel, CheatCode } from "./types";

export const GAMES_DATA: GameReview[] = [
  {
    id: "halo2",
    title: "Halo 2 (2004)",
    year: 2004,
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400", // Retro controller placeholder style
    uncOpinion: "The dual-wielding, the matchmaking, the cliffhanger ending, the soundtrack... it literally invented modern online multiplayer, kid! It is a pure, flawless cinematic masterclass!",
    zoomerOpinion: "Bro, the graphics look like raw baked potatoes. Half the game you play as some random alien that isn't even Master Chief. No sprint slide, loading screens every 5 minutes. Certified unc slop.",
    defaultVotesMasterpiece: 3241,
    defaultVotesSlop: 1402,
  },
  {
    id: "sanandreas",
    title: "GTA: San Andreas (2004)",
    year: 2004,
    image: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&q=80&w=400",
    uncOpinion: "Three entire cities and an entire desert on a single PS2 disc! The radio stations, the gym system, and Big Smoke's order! All you had to do was follow the damn train, CJ! Soulful!",
    zoomerOpinion: "Controls are clunkier than a 1980s microwave. There is literally no auto-save so if you fail a mission you have to drive across the map again. And no microtransactions for cool skins? Mid-tier simulator.",
    defaultVotesMasterpiece: 4892,
    defaultVotesSlop: 1205,
  },
  {
    id: "wowclassic",
    title: "World of Warcraft Classic (2004)",
    year: 2004,
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=400",
    uncOpinion: "Running 40-man raids in Molten Core with your guildmates, waiting months for a single tier-set shoulder pad to drop, socializing in Barrens chat. Peak human civilization, you wouldn't understand.",
    zoomerOpinion: "You literally click one spell and wait 3 seconds, then walk for 30 minutes across a completely barren field with 2004 polygons. I'd rather watch paint dry or scroll TikTok on 2.5x speed. Ultimate snoozefest.",
    defaultVotesMasterpiece: 2195,
    defaultVotesSlop: 2311,
  },
  {
    id: "halflife2",
    title: "Half-Life 2 (2004)",
    year: 2004,
    image: "https://images.unsplash.com/photo-1553481187-be93c21490a9?auto=format&fit=crop&q=80&w=400",
    uncOpinion: "The physics engine! The gravity gun! Ravenholm! The narrative storytelling was miles ahead of anything else. It's the highest-rated PC game of all time for a reason!",
    zoomerOpinion: "The protagonist literally doesn't say a single word. He's just mute. And the story ended on a cliffhanger and never got a sequel. Bruh, old-heads will overhype anything with a crowbar.",
    defaultVotesMasterpiece: 3105,
    defaultVotesSlop: 981,
  },
  {
    id: "oblivion",
    title: "TES IV: Oblivion (2006)",
    year: 2006,
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=400",
    uncOpinion: "The Radiant AI! The Dark Brotherhood questline where you infiltrate a house party! Shivering Isles with Sheogorath! It had actual quest design, Skyrim was dumbed down!",
    zoomerOpinion: "Every single NPC looks like a melted potato candle and speaks like a broken AI. The leveling system is so bugged you actually get weaker when you level up. Massive boomer nostalgia bait.",
    defaultVotesMasterpiece: 1854,
    defaultVotesSlop: 1620,
  }
];

export const QUEST_STEPS: QuestStep[] = [
  {
    id: 1,
    title: "Equip the Wallet",
    description: "To enter the Unc Arena, you need a Solana-compatible weapon. Install Phantom, Solflare, or Backpack wallet on your device of choice.",
    objective: "Create a Solana Wallet & secure your backup phrase (don't lose it like Unc lost his BTC keys in 2013).",
    difficulty: "Easy"
  },
  {
    id: 2,
    title: "Refuel the Tank",
    description: "You need gas to drive the station wagon. Deposit Solana ($SOL) into your newly minted wallet. You can buy it on Coinbase, Binance, Kraken, or right inside the wallet.",
    objective: "Load your wallet with SOL to swap for $uncSLOP.",
    difficulty: "Medium"
  },
  {
    id: 3,
    title: "Locate the Dumpster",
    description: "Launch your browser and drive down to Pump.fun. Paste our top-secret cheat code contract address into the search bar: 27j1GXQVLFzkaxJKQAFN5KNbmqvtMivVnn4eP4UUpump.",
    objective: "Search the official CA on pump.fun to find the real $uncSLOP terminal.",
    difficulty: "Hard"
  },
  {
    id: 4,
    title: "Unlock Legendary Unc Status",
    description: "Connect your wallet, enter the amount of SOL you wish to sacrifice, and hit 'Buy'. Congratulations, you now hold the slop that younger generations hate!",
    objective: "Complete the transaction, acquire $uncSLOP, and start telling people Halo 3 was peak human gaming.",
    difficulty: "Legendary"
  }
];

export const ROADMAP_LEVELS: RoadmapLevel[] = [
  {
    level: 1,
    title: "LAN Party Setup",
    targetCap: "Launch on Pump.fun",
    missionName: "The Awakening",
    briefing: "Deploy the $uncSLOP contract on Pump.fun. Fire up the vintage CRT monitors, order 12 boxes of greasy pizza, buy a pack of energy drinks, and raid 𝕏 to trigger the Zoomers.",
    rewards: ["Contract deployed successfully", "𝕏 handle claimed", "Triggered 500+ TikTok teenagers"],
    status: "completed"
  },
  {
    level: 2,
    title: "Rayman & Matchmaking",
    targetCap: "$1M+ Market Cap",
    missionName: "DEX Takeover",
    briefing: "Escape the bonding curve dumpster and ascend to Raydium. Trend on DexScreener under 'Classic Legends'. Hold an actual Halo 2 LAN party on Twitch where everyone is over 35.",
    rewards: ["Raydium migration unlocked", "DexScreener trending active", "Original Xbox giveaway for loyal holders"],
    status: "active"
  },
  {
    level: 3,
    title: "Wojak's Redemption",
    targetCap: "$10M+ Market Cap",
    missionName: "The Zoomer Compliance",
    briefing: "Run full-page retro ads in local retro-gaming magazines. Pay TikTok influencers to pretend they genuinely enjoy Morrowind's dice-roll combat system. Release custom meme-creator kits.",
    rewards: ["CEX listing proposals", "Global 𝕏 trends", "Meme creator dApp launch"],
    status: "locked"
  },
  {
    level: 4,
    title: "Peak Unc Civilization",
    targetCap: "$100M+ Market Cap",
    missionName: "The Eternal LAN Center",
    briefing: "Buy physical real estate to build a real retro internet cafe / LAN center with original CRTs, Windows XP machines, and sticky floors. Lobby major gaming corporations to release Half-Life 3.",
    rewards: ["Physical UncLAN Center opened", "Solana Mobile partnership", "Half-Life 3 funding campaign initiated"],
    status: "locked"
  }
];

export const CHEAT_CODES: CheatCode[] = [
  {
    code: "HESOYAM",
    description: "Restores Health bar to 100%, restores Armor to 100%, and adds +250,000 $uncSLOP virtual cash!",
    effect: "Full recovery + Virtual Slop"
  },
  {
    code: "BAGUVIX",
    description: "Enables Infinite Health (God Mode). Your health bar turns into a golden flashing neon light!",
    effect: "Invincibility Mode"
  },
  {
    code: "UNCSLOP",
    description: "Enables CRT Screen Scanline Filter on the page for maximum retro television immersion.",
    effect: "Nostalgic Visual Filter"
  },
  {
    code: "PROFESSIONALKILLER",
    description: "Unlocks the 'Unc Weapon Arsenal' displaying 4 retro game-changing weapons to fight the zoomer slop.",
    effect: "Unlock retro inventory"
  },
  {
    code: "BOOM",
    description: "Triggers a massive pixel explosion on screen with a retro 8-bit sound!",
    effect: "Screen Explosion"
  }
];
