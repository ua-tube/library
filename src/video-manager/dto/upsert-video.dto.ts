import { VideoStatus, VideoVisibility } from '@prisma/client';

export class UpsertVideoDto {
  id: string;
  creatorId: string;
  title: string;
  thumbnailUrl?: string;
  previewThumbnailUrl?: string;
  visibility: VideoVisibility;
  status: VideoStatus;
  createdAt: Date;
}
