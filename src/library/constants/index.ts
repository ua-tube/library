export const playlistVideoQuerySelector = {
  video: {
    select: {
      id: true,
      creator: true,
      title: true,
      thumbnailUrl: true,
      previewThumbnailUrl: true,
      lengthSeconds: true,
      status: true,
      visibility: true,
      createdAt: true,
      metrics: { select: { viewsCount: true } },
    },
  },
};
