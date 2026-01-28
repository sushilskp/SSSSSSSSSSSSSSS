
export interface MessageAttachment {
  data: string; // base64 encoded data
  mimeType: string;
  url: string; // local blob URL for preview
  name: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
  timestamp: number;
  attachments?: MessageAttachment[];
}

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: UserProfile;
}

export interface PrivateMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at?: string | null;
}

export interface IdeaMetrics {
  viabilityScore: number;
  marketDemand: 'Low' | 'Medium' | 'High';
  competitionLevel: 'Low' | 'Medium' | 'High';
  isDiscovery: boolean;
}

export interface SavedAnalysis {
  id: string;
  user_id: string;
  title: string;
  score: number;
  demand: string;
  competition: string;
  created_at: string;
}

export interface UserProfile {
  // Fix: changed id to user_id to match Supabase schema and application usage
  user_id: string; 
  full_name?: string;
  username?: string; // Matches Supabase 'profiles' table unique handle
  email: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  identity_image_url?: string;
  profession?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  skills?: string; 
  plan: 'free' | 'pro' | 'admin';
  preferences?: any;
  created_at?: string;
  followers_count?: number;
  following_count?: number;
}

export enum AppMode {
  LANDING = 'LANDING',
  LAB = 'LAB',
  DISCOVERY = 'DISCOVERY',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
  COMMUNITY = 'COMMUNITY',
  ADMIN = 'ADMIN'
}

export interface UserSettings {
  user_id: string;
  theme: 'light' | 'dark';
  email_notifications: boolean;
}

export interface CommunityPost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  category: string;
  status: 'approved' | 'pending';
  created_at: string;
  author?: UserProfile;
  likes_count?: number;
  comments_count?: number;
  has_liked?: boolean;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: UserProfile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'comment' | 'system';
  message: string | any;
  is_read: boolean;
  created_at: string;
}

export interface Masterclass {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  duration: string;
  level: string;
  is_pro: boolean;
  is_new: boolean;
  is_coming_soon: boolean;
  created_at?: string;
}
