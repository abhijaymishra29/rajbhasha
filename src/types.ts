export type UserRole = 'admin' | 'user' | 'guest';

export interface AuthUser {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  role: UserRole;
  region?: string;
  regionHindi?: string;
  avatarUrl?: string;
  isGoogleConnected?: boolean;
}

export interface RegisteredAccount {
  id: string;
  name: string;
  emailOrUsername: string;
  region: string;
  regionHindi: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

export interface TabVisibilityConfig {
  home: boolean;
  monthly_report: boolean;
  quarterly_report: boolean;
  emagazine: boolean;
  olic: boolean;
  rv_format: boolean;
  annual_programme: boolean;
  mis_portal: boolean;
  hindi_workshop: boolean;
  tolic: boolean;
  circulars: boolean;
  author_of_month: boolean;
  admin_glossary: boolean;
  banking_glossary: boolean;
  thought_of_day: boolean;
}

export type TabCardSize = 'compact' | 'normal' | 'wide' | 'large';

export type TabKey = keyof TabVisibilityConfig;

export type TabSizeConfig = Record<TabKey, TabCardSize>;

export interface BackgroundImage {
  id: string;
  url: string;
  title: string;
  caption?: string;
  addedBy: string;
  addedAt: string;
  isDefault?: boolean;
}

export interface UploadedReport {
  id: string;
  title: string;
  category: string;
  categoryHindi: string;
  monthOrQuarter: string;
  branchOrOffice: string;
  uploadedBy: string;
  uploadedByEmail: string;
  uploaderRole: UserRole;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileDataUrl?: string;
  uploadDate: string;
  googleDriveFileId?: string;
  googleDriveLink?: string;
  driveSyncStatus: 'synced' | 'pending' | 'local_only' | 'error';
  adminTargetEmail?: string;
  notes?: string;
}

export interface GlossaryItem {
  id: string;
  english: string;
  hindi: string;
  category: 'administrative' | 'banking';
  meaning: string;
  exampleSentence: string;
}

export interface AuthorProfile {
  name: string;
  hindiName: string;
  era: string;
  birthPlace: string;
  famousWorks: string[];
  bio: string;
  popularQuote: string;
  image: string;
}

export interface ThoughtItem {
  hindi: string;
  english: string;
  author: string;
  date: string;
}

export type ActiveModalType = 
  | null 
  | 'home'
  | 'monthly_report'
  | 'quarterly_report'
  | 'emagazine'
  | 'olic'
  | 'rv_format'
  | 'annual_programme'
  | 'mis_portal'
  | 'hindi_workshop'
  | 'tolic'
  | 'circulars'
  | 'author_of_month'
  | 'admin_glossary'
  | 'banking_glossary'
  | 'thought_of_day'
  | 'upload_report'
  | 'admin_backgrounds'
  | 'drive_manager';
