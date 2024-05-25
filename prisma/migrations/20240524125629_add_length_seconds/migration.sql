/*
  Warnings:

  - Added the required column `length_seconds` to the `videos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "length_seconds" INTEGER NOT NULL;
