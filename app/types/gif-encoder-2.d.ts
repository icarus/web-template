declare module 'gif-encoder-2' {
  export default class GIFEncoder {
    constructor(width: number, height: number);
    setDelay(ms: number): void;
    setQuality(quality: number): void;
    setRepeat(repeat: number): void;
    start(): void;
    addFrame(imageData: Uint8ClampedArray): void;
    finish(): void;
    out: {
      getData(): Uint8Array;
    };
  }
}
