/**
 * Type declarations for Lottie Web library
 * Used in inline scripts in HTML files
 */

declare global {
  interface Window {
    lottie: {
      loadAnimation(params: {
        container: HTMLElement;
        renderer: "svg" | "canvas" | "html";
        loop: boolean;
        autoplay: boolean;
        path?: string;
        animationData?: any;
      }): {
        play(): void;
        pause(): void;
        stop(): void;
        destroy(): void;
      };
    };
  }
}

export {};

