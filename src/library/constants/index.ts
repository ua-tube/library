export const playlistVideoQuerySelector = {
  Video: {
    select: {
      id: true,
      Creator: true,
      title: true,
      thumbnailUrl: true,
      previewThumbnailUrl: true,
      status: true,
      visibility: true,
      createdAt: true,
      VideoMetrics: { select: { viewsCount: true } },
    },
  },
};
