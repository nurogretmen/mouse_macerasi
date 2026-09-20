export type MouseActionType = 'hover' | 'left-click' | 'double-click' | 'right-click' | 'drag-drop' | 'mixed';

export type StageId = 1 | 2 | 3;

export interface StageInfo {
  id: StageId;
  name: string;
  title: string;
  subtitle: string;
  description: string;
  totalMinutes: number;
  color: string;
  bgColor: string;
  borderColor: string;
  accentColor: string;
  activityIds: readonly number[];
}

export interface ActivityInfo {
  id: number;
  stage: StageId;
  stageId?: StageId;
  stageName: string;
  stageTitle: string;
  title: string;
  subtitle: string;
  durationText: string;
  durationMinutes: number;
  actionType: MouseActionType;
  actionBadgeText: string;
  skillBadge?: string;
  actionInstruction: string;
  iconName: string;
  color: string;
  bgLedgeColor: string;
  starsRequired: number;
  description: string;
  goal?: string;
  learningOutcome: string;
  learningMessage?: string;
}

export type AppView = 'home' | 'map' | 'games' | 'achievements' | 'teacher';

export interface UserProgress {
  starsMap: Record<number, number>; // activityId -> 0..3 stars
  completedActivities: number[];
  soundEnabled: boolean;
  unlockedAllByTeacher: boolean;
  totalScore: number;
}
