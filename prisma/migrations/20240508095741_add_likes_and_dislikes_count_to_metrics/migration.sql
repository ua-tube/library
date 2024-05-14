-- AlterTable
ALTER TABLE "video_metrics" ADD COLUMN     "dislikes_count" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "likes_count" BIGINT NOT NULL DEFAULT 0;
