-- CreateIndex
CREATE INDEX "playlists_creator_id_idx" ON "playlists"("creator_id");

-- CreateIndex
CREATE INDEX "playlists_creator_id_visibility_idx" ON "playlists"("creator_id", "visibility");

-- CreateIndex
CREATE INDEX "video_metrics_views_count_idx" ON "video_metrics"("views_count");

-- CreateIndex
CREATE INDEX "video_metrics_likes_count_idx" ON "video_metrics"("likes_count");

-- CreateIndex
CREATE INDEX "video_metrics_dislikes_count_idx" ON "video_metrics"("dislikes_count");

-- CreateIndex
CREATE INDEX "videos_creator_id_idx" ON "videos"("creator_id");

-- CreateIndex
CREATE INDEX "videos_visibility_idx" ON "videos"("visibility");

-- CreateIndex
CREATE INDEX "videos_creator_id_visibility_idx" ON "videos"("creator_id", "visibility");
