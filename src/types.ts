export interface UrbanParams {
  focus: string;
  teams: string[];
  teamFeatures?: Record<string, string[]>;
}

export interface ImpactMetrics {
  economic: number;
  social: number;
  environmental: number;
  feasibility: number;
  innovation: number;
}

export interface SimulationResult {
  imageUrl?: string;
  videoUrl?: string;
  analysis: string;
  metrics: ImpactMetrics;
  loading: boolean;
  explanation?: {
    theme: string;
    features: string[];
  };
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  params: UrbanParams;
  result: SimulationResult;
}
