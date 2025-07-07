import { Media, Stream } from '../index';

abstract class BaseSource {
  abstract baseUrl: string;
  abstract headers: {};
  abstract getDetails(slug: string): Promise<Media>;
  abstract getStreams(slug: string): Promise<Stream[]>;
}

export default BaseSource;
