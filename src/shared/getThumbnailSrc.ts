import type { ThumbnailType } from "types/ThumbnailType";

export const getThumbnailSrc = (thumbnail: ThumbnailType, size: string) =>
    thumbnail ?
        `${thumbnail.path}/${size}.${thumbnail.extension}` : `http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available/${size}.jpg`;
