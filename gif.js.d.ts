declare module 'gif.js' {
  interface GIFOptions {
    workers?: number;
    quality?: number;
    workerScript?: string;
    width?: number;
    height?: number;
  }

  export default class GIF {
    constructor(options: GIFOptions);
    addFrame(element: HTMLCanvasElement, options: { copy: boolean, delay: number }): void;
    on(event: "finished", callback: (blob: Blob) => void): void;
    on(event: "progress", callback: (progress: number) => void): void;
    on(event: "error", callback: (error: Error) => void): void;
    render(): void;
    readonly frames?: unknown[];
  }
}
