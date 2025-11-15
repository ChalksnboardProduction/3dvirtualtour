"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

const DynamicPanoViewer = dynamic(() => import("../components/PanoViewer"), {
  ssr: false,
});

const CONVERTED_IMAGES = [
  "IMG_20251015_170923_00_034.jpg",
  "IMG_20251015_171004_00_035.jpg",
  "IMG_20251015_171046_00_036.jpg",
  "IMG_20251015_171141_00_037.jpg",
  "IMG_20251015_171243_00_038.jpg",
  "IMG_20251015_173920_00_039.jpg",
  "IMG_20251015_174016_00_040.jpg",
  "IMG_20251015_174227_00_042.jpg",
  "IMG_20251015_174314_00_043.jpg",
  "IMG_20251015_174441_00_044.jpg",
  "IMG_20251015_174532_00_045.jpg",
  "IMG_20251015_174600_00_046.jpg",
  "IMG_20251015_174720_00_047.jpg",
  "IMG_20251015_174803_00_048.jpg",
  "IMG_20251015_174836_00_049.jpg",
  "IMG_20251015_174901_00_050.jpg",
  "IMG_20251015_174945_00_051.jpg",
  "IMG_20251015_175025_00_052.jpg",
  "IMG_20251015_175046_00_053.jpg",
  "IMG_20251015_175211_00_054.jpg",
];

const FLOOR_PITCH = -80;
const CENTER_YAWS = {
  prev: -8,
  next: 8,
};

const getSceneIdFromIndex = (index) => `scene-${index + 1}`;

const scenes = CONVERTED_IMAGES.reduce((acc, filename, index, arr) => {
  const prevIndex = (index - 1 + arr.length) % arr.length;
  const nextIndex = (index + 1) % arr.length;

  acc[getSceneIdFromIndex(index)] = {
    image: `/converted/${filename}`,
    title: `Scene ${index + 1}`,
    hotspots: [
      {
        pitch: FLOOR_PITCH,
        yaw: CENTER_YAWS.prev,
        type: "scene",
        text: "Previous Scene",
        sceneId: getSceneIdFromIndex(prevIndex),
      },
      {
        pitch: FLOOR_PITCH,
        yaw: CENTER_YAWS.next,
        type: "scene",
        text: "Next Scene",
        sceneId: getSceneIdFromIndex(nextIndex),
      },
    ],
  };

  return acc;
}, {});

export default function HomePage() {
  const sceneIds = Object.keys(scenes);
  const [currentScene, setCurrentScene] = useState(
    sceneIds.length > 0 ? sceneIds[0] : null,
  );

  const navigateToScene = (sceneId) => {
    if (scenes[sceneId]) {
      setCurrentScene(sceneId);
    }
  };

  if (!currentScene) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>No panoramas available. Add images to /public/converted.</p>
      </main>
    );
  }

  const currentSceneData = scenes[currentScene];

  return (
    <main className="flex min-h-screen flex-col gap-4 bg-black px-4 py-6 text-white">
      <header className="text-center">
        <h1 className="text-3xl font-semibold">{currentSceneData.title}</h1>
        <p className="text-sm text-gray-400">
          Tap the arrows on the floor to move through the tour.
        </p>
      </header>
      <section className="min-h-[70vh] w-full overflow-hidden rounded-xl border border-white/10 shadow-lg">
        <DynamicPanoViewer
          imageUrl={currentSceneData.image}
          hotspotConfig={currentSceneData.hotspots}
          navigateTo={navigateToScene}
        />
      </section>
    </main>
  );
}
