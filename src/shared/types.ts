import type { ProfileData } from './profile';

export interface Profile {
  id: string;
  name: string;
  /** 1-10, picks one of the bundled avatars */
  avatarId?: number;
  data: ProfileData;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | 'filled'
  | 'submitted'
  | 'interviewing'
  | 'offer'
  | 'rejected'
  | 'ghosted'
  | 'withdrawn';

export interface Application {
  id: string;
  company: string;
  jobTitle: string;
  jobUrl: string;
  platform: string;
  location?: string;
  profileId?: string;
  status: ApplicationStatus;
  filledAt?: string;
  submittedAt?: string;
  notes?: string;
  jobDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiSettings {
  provider: 'gemini' | 'openai';
  apiKey: string;
  model: string;
  /** model used to read resumes; empty means the provider's stronger default */
  importModel?: string;
}
