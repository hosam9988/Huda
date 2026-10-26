/**
 * The site's images (public/images): each is a 1280-wide WebP with a
 * 640-wide copy, so cards and phones download the small one.
 */
export function artSrc(name: string): string {
  return `images/${name}.webp`;
}

export function artSmallSrc(name: string): string {
  return `images/${name}-sm.webp`;
}

export function artSrcset(name: string): string {
  return `images/${name}-sm.webp 640w, images/${name}.webp 1280w`;
}
