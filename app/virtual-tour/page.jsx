"use client";

import PanoViewer from "../../components/PanoViewer";

export default function VirtualTourPage() {
  return (
    <main className="min-h-screen w-full bg-black text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-6">
        <header className="mb-4 text-center">
          <h1 className="text-3xl font-semibold">
            <span className="font-bold">Saplings</span> <span className="font-semibold">Virtual Tour</span>
          </h1>
          <p className="mt-2 text-base text-gray-300">Embedded Kuula viewer below.</p>
        </header>
        <section className="w-full flex-1 overflow-hidden rounded-lg border border-white/10 shadow-lg">
          <PanoViewer />
        </section>
      </div>
    </main>
  );
}

