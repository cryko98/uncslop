export interface GameReview {
  id: string;
  title: string;
  year: number;
  image: string;
  uncOpinion: string;
  zoomerOpinion: string;
  defaultVotesMasterpiece: number;
  defaultVotesSlop: number;
}

export interface QuestStep {
  id: number;
  title: string;
  description: string;
  objective: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Legendary";
}

export interface RoadmapLevel {
  level: number;
  title: string;
  targetCap: string;
  missionName: string;
  briefing: string;
  rewards: string[];
  status: "locked" | "active" | "completed";
}

export interface CheatCode {
  code: string;
  description: string;
  effect: string;
}
