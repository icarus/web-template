declare module 'gifshot' {
  interface GifShotOptions {
    images: string[];
    gifWidth?: number;
    gifHeight?: number;
    interval?: number;
    numWorkers?: number;
    frameDuration?: number;
    sampleInterval?: number;
    progressCallback?: (progress: number) => void;
  }

  interface GifShotResponse {
    error: string;
    finished: boolean;
    image: string;
  }

  function createGIF(
    options: GifShotOptions,
    callback: (response: GifShotResponse) => void
  ): void;

  export { createGIF };
}
