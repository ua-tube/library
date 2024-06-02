/*
  Warnings:

  - You are about to drop the `playlist_metrics` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `items_count` to the `playlists` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "playlist_metrics" DROP CONSTRAINT "playlist_metrics_playlist_id_fkey";

-- AlterTable
ALTER TABLE "playlists" ADD COLUMN     "items_count" INTEGER NOT NULL;

-- DropTable
DROP TABLE "playlist_metrics";
