export interface IMediaItem {
  _id: string;
  userId: string;
  role: string;
  coachId?: string;
  playerId?: string;
  url: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  mediaType: "IMAGE" | "VIDEO" | string;
  views: number;
  likes: number;
  isPublic?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface IMediaMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IMediaGalleryData {
  media: IMediaItem[];
  meta: IMediaMeta;
}

export interface IMediaGalleryResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IMediaGalleryData;
}

export interface IUploadMediaResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IMediaItem;
}

export interface IUpdateMediaPayload {
  mediaId: string;
  title: string;
}
