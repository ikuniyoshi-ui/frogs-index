
export type ScoreLabel = 'とても当てはまる' | 'やや当てはまる' | 'どちらとも言えない' | 'あまり当てはまらない' | '全く当てはまらない';

export interface Question {
  id: string;
  text: string;
  category: string;
  scores: Record<ScoreLabel, number>;
}

export interface CategoryData {
  [categoryName: string]: {
    text: string;
    scores: Record<ScoreLabel, number>;
  }[];
}

export interface DiagnosticResult {
  userId: string;
  timestamp: number;
  categoryScores: Record<string, number>;
  totalScore: number;
}
