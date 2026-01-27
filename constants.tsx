
import { UserProfile } from './types';

export const INITIAL_PROFILE: UserProfile = {
  personalContext: {
    name: '',
    educationLevel: 'Bachelor\'s',
    fieldOfStudy: '',
    graduationYear: '2025',
    institutionName: '',
    currentGPA: '',
    githubUsername: '',
    linkedinUrl: '',
  },
  careerTarget: {
    desiredRole: '',
    targetIndustry: '',
    targetTimeline: 6,
  },
  timeConsistency: {
    hoursPerDay: 2,
    daysPerWeek: 5,
    consistencyLevel: 'medium',
  },
  skillInventory: {
    programmingFundamentals: 0,
    dsa: 0,
    development: 0,
    databases: 0,
    systemDesign: 0,
    mathStats: 0,
    aiMl: 0,
  },
  practiceOutput: {
    problemsSolved: 0,
    problemDifficulty: {
      easy: 0,
      medium: 0,
      hard: 0,
    },
    projects: {
      independent: 0,
      guided: 0,
    },
    githubActivity: false,
    commitsLast30Days: 0,
    lastActiveDaysAgo: 0,
  },
  learningSources: {
    platforms: [],
    coursesCompleted: 0,
    coursesInProgress: 0,
  },
  academicProgress: {
    currentSemester: 1,
    completedSteps: [],
  }
};

export const SKILL_LABELS: Record<string, string> = {
  programmingFundamentals: 'Fundamentals',
  dsa: 'DSA',
  development: 'Dev',
  databases: 'Databases',
  systemDesign: 'System Design',
  mathStats: 'Math',
  aiMl: 'AI/ML',
};
