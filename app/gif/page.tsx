"use client";

import React from "react";
import { GifRecorder } from "../gif-recorder";

export default function GifPage() {
  return (
    <div className="w-screen h-screen">
      <GifRecorder modelPath="/models/logo2.gltf" />
    </div>
  );
}
