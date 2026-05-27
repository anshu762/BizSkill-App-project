export enum SkillCategory {
  GRAPHIC_DESIGN = "GRAPHIC_DESIGN",
  SOCIAL_MEDIA = "SOCIAL_MEDIA",
  PHOTOGRAPHY = "PHOTOGRAPHY",
  WEBSITE = "WEBSITE",
  MARKETING = "MARKETING",
  BRANDING = "BRANDING",
  FINANCE = "FINANCE",
  PITCH_DECK = "PITCH_DECK",
  CONTENT = "CONTENT",
  OTHER = "OTHER",
}

export type BusinessStage = "IDEA" | "BUILDING" | "LAUNCHED";
export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "EXPERT";
export type ExchangeStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED" | "CANCELLED";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  age?: number | null;
  location?: string | null;
  bizCoins: number;
  hasOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
  businessProfile?: BusinessProfile | null;
}

export interface BusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  industry: SkillCategory;
  description: string;
  stage: BusinessStage;
  website?: string | null;
  instagramHandle?: string | null;
}

export interface Skill {
  id: string;
  userId: string;
  title: string;
  category: SkillCategory;
  description: string;
  level: SkillLevel;
  coinValue: number;
  isOffering: boolean;
  isActive: boolean;
  user?: User;
}

export interface ExchangeRequest {
  id: string;
  requesterId: string;
  providerId: string;
  skillId: string;
  message?: string | null;
  coinValue: number;
  status: ExchangeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  caption: string;
  imageUrl?: string | null;
  createdAt: string;
  author?: User;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  avatar?: string | null;
  memberIds: string[];
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
