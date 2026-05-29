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
export type ExchangeStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";

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
  fromUserId: string;
  toUserId: string;
  skillOfferedId: string;
  skillRequestedId: string;
  message?: string | null;
  coinsOffered: number;
  status: ExchangeStatus;
  createdAt: string;
  updatedAt: string;
  fromUser?: { id: string; name: string; avatar?: string | null; businessProfile?: BusinessProfile | null };
  toUser?: { id: string; name: string; avatar?: string | null; businessProfile?: BusinessProfile | null };
  skillOffered?: Skill;
  skillRequested?: Skill;
}

export interface Transaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  type: "EXCHANGE_REWARD" | "COIN_DEDUCT" | "BONUS";
  description: string;
  relatedExchangeId?: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  exchangeId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  reviewer?: { id: string; name: string; avatar?: string | null };
}

export interface WalletData {
  balance: number;
  transactions: Transaction[];
}

export interface MarketplaceItem extends Skill {
  user?: User & { businessProfile?: BusinessProfile | null };
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
  description: string | null;
  ownerId: string;
  category: TeamCategory;
  stage: TeamStage;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  owner?: { id: string; name: string; avatar?: string | null };
  members?: TeamMember[];
  roles?: TeamRole[];
  _count?: { members: number; roles: number };
  openRolesCount?: number;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: "OWNER" | "MEMBER";
  joinedAt: string;
  user?: { id: string; name: string; avatar?: string | null };
}

export interface TeamRole {
  id: string;
  teamId: string;
  title: string;
  description: string | null;
  skillsNeeded: string[];
  isOpen: boolean;
  createdAt: string;
  applications?: TeamApplication[];
  _count?: { applications: number };
}

export interface TeamApplication {
  id: string;
  teamRoleId: string;
  applicantId: string;
  message: string | null;
  status: ApplicationStatus;
  createdAt: string;
  applicant?: { id: string; name: string; avatar?: string | null; businessProfile?: BusinessProfile | null };
  teamRole?: TeamRole;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  user: { id: string; name: string; avatar?: string | null; businessProfile?: BusinessProfile | null };
  lastMessage: Message;
  unreadCount: number;
}

export interface DiscoverUser extends User {
  businessProfile: BusinessProfile;
  offeredSkills: Skill[];
  neededSkills: Skill[];
  matchScore: number;
}

export type TeamCategory = "SCHOOL_STARTUP" | "COMPETITION" | "BUSINESS_FAIR" | "PERSONAL_PROJECT";
export type TeamStage = "FORMING" | "ACTIVE" | "COMPLETED";
export type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  relatedId?: string | null;
  createdAt: string;
}

export interface FeedPost {
  id: string;
  userId: string;
  content: string;
  type: "UPDATE" | "LAUNCH" | "MILESTONE" | "COLLAB_REQUEST" | "PRODUCT_DROP";
  image?: string | null;
  imageUrl?: string | null;
  likes: number;
  likeCount: number;
  commentCount: number;
  isLikedByMe: boolean;
  isOwnPost: boolean;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; avatar?: string | null; businessProfile?: BusinessProfile | null };
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; avatar?: string | null };
}

export interface FollowStats {
  followerCount: number;
  followingCount: number;
  isFollowedByMe: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ProfileResponse extends User {
  businessProfile?: BusinessProfile | null;
  skills?: Skill[];
  exchangeCount?: number;
  avgRating?: number;
  reviewCount?: number;
  followerCount?: number;
}

export interface OnboardingInput {
  bio?: string;
  age?: number;
  location?: string;
  businessName: string;
  industry: SkillCategory;
  description: string;
  stage: BusinessStage;
  website?: string;
  instagramHandle?: string;
  offeredSkills: Omit<Skill, "id" | "userId" | "isOffering" | "isActive" | "user">[];
  neededSkills: Omit<Skill, "id" | "userId" | "isOffering" | "isActive" | "user">[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
