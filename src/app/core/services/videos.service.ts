import { httpResource } from '@angular/common/http';
import { computed, Injectable } from '@angular/core';
import { Lang } from '../models/lang';
import { Video, VideosData } from '../models/video';

/** Reads the clips of «شاهد»: one static JSON file served from `public/data`. */
@Injectable({ providedIn: 'root' })
export class VideosService {
  private readonly resource = httpResource<VideosData>(() => 'data/videos.json');

  // value() throws while a resource is in an error state, so guard with hasValue().
  readonly videos = computed<Video[]>(() => (this.resource.hasValue() ? this.resource.value().videos : []));
  readonly isLoading = this.resource.isLoading;
  readonly error = this.resource.error;

  /** The clips shown on a page, those in the page's language first. */
  on(slug: string, lang: Lang): Video[] {
    return this.videos()
      .filter((v) => v.stops.includes(slug))
      .sort((a, b) => Number(b.lang === lang) - Number(a.lang === lang));
  }
}
