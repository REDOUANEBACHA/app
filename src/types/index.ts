export interface User {
  id: string;
  name: string;
  email: string;
  handicap: number;
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  holes: number;
  par: number;
  courseHoles?: CourseHole[];
}

export interface CourseHole {
  id: string;
  courseId: string;
  number: number;
  par: number;
  distance: number;
}

export interface Round {
  id: string;
  userId: string;
  courseId: string;
  date: string;
  totalScore: number;
  totalPar: number;
  weather?: string;
  notes?: string;
  course?: Course;
  scores?: HoleScore[];
}

export interface HoleScore {
  id: string;
  roundId: string;
  hole: number;
  score: number;
  putts?: number;
  fairway?: boolean;
  gir?: boolean;
}

export interface UserStats {
  totalRounds: number;
  averageScore: number;
  bestScore: number;
  handicap: number;
  fairwayPercentage: number;
  girPercentage: number;
  averagePutts: number;
  recentScores: number[];
  handicapHistory: { date: string; handicap: number }[];
}
