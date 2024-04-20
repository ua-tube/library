-- CreateEnum
CREATE TYPE "video_statuses" AS ENUM ('Created', 'Registered', 'RegistrationFailed', 'Unregistered');

-- CreateEnum
CREATE TYPE "video_visibilities" AS ENUM ('Private', 'Unlisted', 'Public');

-- CreateEnum
CREATE TYPE "playlist_visibilities" AS ENUM ('Private', 'Unlisted', 'Public');

-- CreateTable
CREATE TABLE "creators" (
    "id" UUID NOT NULL,
    "display_name" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "thumbnail_url" TEXT,

    CONSTRAINT "creators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" UUID NOT NULL,
    "creator_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "preview_thumbnail_url" TEXT,
    "visibility" "video_visibilities" NOT NULL,
    "status" "video_statuses" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_metrics" (
    "video_id" UUID NOT NULL,
    "views_count" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "video_metrics_pkey" PRIMARY KEY ("video_id")
);

-- CreateTable
CREATE TABLE "playlists" (
    "id" UUID NOT NULL,
    "creator_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "playlist_visibilities" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "playlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlist_metrics" (
    "playlist_id" UUID NOT NULL,
    "views_count" BIGINT NOT NULL,
    "items_count" INTEGER NOT NULL,

    CONSTRAINT "playlist_metrics_pkey" PRIMARY KEY ("playlist_id")
);

-- CreateTable
CREATE TABLE "playlists_items" (
    "playlist_id" UUID NOT NULL,
    "video_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playlists_items_pkey" PRIMARY KEY ("playlist_id","video_id")
);

-- CreateTable
CREATE TABLE "liked_playlists" (
    "creator_id" UUID NOT NULL,
    "items_count" INTEGER NOT NULL,

    CONSTRAINT "liked_playlists_pkey" PRIMARY KEY ("creator_id")
);

-- CreateTable
CREATE TABLE "liked_playlists_items" (
    "liked_playlist_id" UUID NOT NULL,
    "video_id" UUID NOT NULL,

    CONSTRAINT "liked_playlists_items_pkey" PRIMARY KEY ("liked_playlist_id","video_id")
);

-- CreateTable
CREATE TABLE "disliked_playlists" (
    "creator_id" UUID NOT NULL,
    "items_count" INTEGER NOT NULL,

    CONSTRAINT "disliked_playlists_pkey" PRIMARY KEY ("creator_id")
);

-- CreateTable
CREATE TABLE "disliked_playlists_items" (
    "disliked_playlist_id" UUID NOT NULL,
    "video_id" UUID NOT NULL,

    CONSTRAINT "disliked_playlists_items_pkey" PRIMARY KEY ("disliked_playlist_id","video_id")
);

-- CreateTable
CREATE TABLE "watch_later_playlists" (
    "creator_id" UUID NOT NULL,
    "items_count" INTEGER NOT NULL,

    CONSTRAINT "watch_later_playlists_pkey" PRIMARY KEY ("creator_id")
);

-- CreateTable
CREATE TABLE "watch_later_playlists_items" (
    "watch_later_playlist_id" UUID NOT NULL,
    "video_id" UUID NOT NULL,

    CONSTRAINT "watch_later_playlists_items_pkey" PRIMARY KEY ("watch_later_playlist_id","video_id")
);

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_metrics" ADD CONSTRAINT "video_metrics_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_metrics" ADD CONSTRAINT "playlist_metrics_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlists_items" ADD CONSTRAINT "playlists_items_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlists_items" ADD CONSTRAINT "playlists_items_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liked_playlists" ADD CONSTRAINT "liked_playlists_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liked_playlists_items" ADD CONSTRAINT "liked_playlists_items_liked_playlist_id_fkey" FOREIGN KEY ("liked_playlist_id") REFERENCES "liked_playlists"("creator_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liked_playlists_items" ADD CONSTRAINT "liked_playlists_items_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disliked_playlists" ADD CONSTRAINT "disliked_playlists_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disliked_playlists_items" ADD CONSTRAINT "disliked_playlists_items_disliked_playlist_id_fkey" FOREIGN KEY ("disliked_playlist_id") REFERENCES "disliked_playlists"("creator_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disliked_playlists_items" ADD CONSTRAINT "disliked_playlists_items_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_later_playlists" ADD CONSTRAINT "watch_later_playlists_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_later_playlists_items" ADD CONSTRAINT "watch_later_playlists_items_watch_later_playlist_id_fkey" FOREIGN KEY ("watch_later_playlist_id") REFERENCES "watch_later_playlists"("creator_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_later_playlists_items" ADD CONSTRAINT "watch_later_playlists_items_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
