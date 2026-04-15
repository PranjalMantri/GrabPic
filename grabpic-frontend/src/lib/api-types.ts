export type ApiErrorLike = {
  message?: string;
  error?: string;
};

export type EventMedia = {
  _id: string;
  url: string;
  publicId: string;
  type: "image" | "video";
  size: number;
  uploadedBy: string;
  eventId: string;
  status: "pending" | "processing" | "completed" | "failed";
  analysis?: {
    faceCount: number;
    lightingLevel: number;
    blurScore: number;
  };
  createdAt: string;
  updatedAt?: string;
};

export type EventOwner = {
  _id: string;
  name: string;
  email: string;
  profilePhoto?: string;
};

export type EventItem = {
  _id: string;
  name: string;
  description?: string;
  date?: string;
  owner: string | EventOwner;
  coverImage: string;
  media: string[] | EventMedia[];
  participants: string[];
  createdAt: string;
  updatedAt: string;
};

export type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedEventId?: string;
};

export type NotificationsResponse = {
  notifications: NotificationItem[];
  total: number;
  limit: number;
  skip: number;
};

export type ProfileResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    bio?: string;
    profilePhoto?: string | null;
    face_registered?: boolean;
    face_id?: string;
    uploadStorageBytes?: number;
  };
};

export type GalleryResponse = {
  media: EventMedia[];
  insights: {
    totalPhotos: number;
    bestLighting: number;
    groupShots: number;
  };
};

export function getApiErrorMessage(error: string | undefined, fallback: string): string {
  if (error && error.trim()) {
    return error;
  }

  return fallback;
}
