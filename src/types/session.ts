export interface SessionState {
  isActive: boolean;
  startTime: number | null;
  duration: number;
  email: string;
}

export interface SessionTimerState {
  startTime: number;
  currentTime: number;
  duration: number;
  formattedDuration: string;
}
