import { httpResource } from '@angular/common/http';
import { computed, Injectable } from '@angular/core';
import { Topic, TopicsData } from '../models/topic';

/** Reads the journey's topics (stages 5 and 6): one static JSON file served from `public/data`. */
@Injectable({ providedIn: 'root' })
export class TopicsService {
  private readonly resource = httpResource<TopicsData>(() => 'data/topics.json');

  // value() throws while a resource is in an error state, so guard with hasValue().
  readonly topics = computed<Topic[]>(() => (this.resource.hasValue() ? this.resource.value().topics : []));
  readonly isLoading = this.resource.isLoading;
  readonly error = this.resource.error;

  topic(slug: string): Topic | undefined {
    return this.topics().find((t) => t.slug === slug);
  }
}
