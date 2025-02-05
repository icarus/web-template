import { ModelViewer } from "./modelViewer";

export default function Model2() {
  return (
    <div className="relative">
      {/* <div className="z-10 absolute w-screen h-svh inset-0 bg-dither-2" /> */}
      <ModelViewer modelPath="/models/logo2.gltf" />
    </div>
  );
}
