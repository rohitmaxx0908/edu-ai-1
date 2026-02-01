
export interface UserProfile {
  personalContext: {
    name: string;
    educationLevel: string;
    fieldOfStudy: string;
    graduationYear: string;
    githubUsername?: string;
    linkedinUrl?: string;
    institutionName?: string;
    currentGPA?: string;
  };
  careerTarget: {
    desiredRole: string;
    targetIndustry: string;
    targetTimeline: number; // months
  };
  timeConsistency: {
    hoursPerDay: number;
    daysPerWeek: number;
    consistencyLevel: 'low' | 'medium' | 'high';
  };
  skillInventory: {
    programmingFundamentals: number;
    dsa: number;
    development: number;
    databases: number;
    systemDesign: number;
    mathStats: number;
    aiMl: number;
  };
  practiceOutput: {
    problemsSolved: number;
    problemDifficulty: {
      easy: number;
      medium: number;
      hard: number;
    };
    projects: {
      independent: number;
      guided: number;
    };
    githubActivity: boolean;
    commitsLast30Days: number;
    lastActiveDaysAgo: number;
  };
  learningSources: {
    platforms: string[];
    coursesCompleted: number;
    coursesInProgress: number;
  };
  academicProgress?: {
    currentSemester: number;
    completedSteps: string[]; // IDs of completed learning steps
  };
}

export interface LearningStep {
  id: string;
  type: 'VIDEO' | 'COURSE' | 'QUIZ' | 'PRACTICE';
  title: string;
  topic: string;
  provider: string;
  duration: string;
  description: string;
  url: string;
  scheduledDate: string; // YYYY-MM-DD format for calendar placement
}

export interface AssessmentResult {
  identified_gaps: Array<{
    title: string;
    severity: 'CRITICAL' | 'MODERATE' | 'LOW';
    quantification: string;
    impact: string;
  }>;
  next_priority_actions: Array<{
    order: number;
    action: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    timeline: string;
  }>;
  learning_roadmap: LearningStep[];
  career_risk_assessment: string;
  level: string;
  skillDepthScore: number;
  consistencyScore: number;
  practicalReadinessScore: number;
  market_intel?: {
    salary_range: string;
    demand_level: string;
    top_3_trending_skills: string[];
    market_sentiment: string;
  };
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: 'INTERNSHIP' | 'COMPETITION' | 'EVENT' | 'PLACEMENT';
  deadline: string;
  url: string;
  relevanceReason: string;
  requirements: string[];
  location?: string;
  stipend?: string;
  matchScore: number;
}
