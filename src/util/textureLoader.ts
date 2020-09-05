import { Texture, TextureLoader } from 'three';

export default function loadTexturePromise(
  url: string,
  onProgress?: (e: ProgressEvent<EventTarget>) => unknown
) {
  return new Promise(
    (
      resolve: (texture: Texture) => unknown,
      reject: (error: ErrorEvent) => unknown
    ) => {
      new TextureLoader().load(url, resolve, onProgress, reject);
    }
  );
}
