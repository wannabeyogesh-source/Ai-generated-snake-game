export interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
  cover: string;
}

export interface GameState {
  score: number;
  highScore: number;
  isGameOver: boolean;
  isPlaying: boolean;
}
