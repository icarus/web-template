import Spline from "@splinetool/react-spline";
import { Content } from "@/components/shared/content";
import FrameOverlay from "@/components/shared/frame-overlay";

export default function Home() {
  return (
    <>
      <FrameOverlay />

      <Content />

      <Spline
        scene="https://prod.spline.design/WGxyp8AnbwTseFgu/scene.splinecode"
        className="-z-10 h-svh w-screen absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </>
  );
}
