export const playlistQuerySelector = {
  Video: {
    select: {
      id: true,
      Creator: true,
      thumbnailUrl: true,
      description: true,
      title: true,
      tags: true,
      status: true,
      visibility: true,
      previewThumbnailUrl: true,
      createdAt: true,
      VideoMetrics: { select: { viewsCount: true } },
    },
  },
};
