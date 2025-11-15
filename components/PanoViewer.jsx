"use client";

import { useEffect, useRef } from "react";
import "photo-sphere-viewer/dist/photo-sphere-viewer.css";
import "photo-sphere-viewer/dist/plugins/markers.css";

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const buildMarker = (hotspot, index) => {
  const isScene = hotspot.type === "scene";
  const markerId = `hotspot-${index}-${isScene ? hotspot.sceneId ?? "scene" : "info"}`;

  return {
    id: markerId,
    longitude: toRadians(hotspot.yaw ?? 0),
    latitude: toRadians(hotspot.pitch ?? 0),
    tooltip: hotspot.text ?? "",
    html: `<button class="psv-marker hotspot-${hotspot.type}" type="button" aria-label="${hotspot.text ?? ""}" style="background: rgba(0,0,0,0.55); color: #fff; border: 1px solid rgba(255,255,255,0.4); padding: 6px 12px; border-radius: 999px; font-size: 12px;">${hotspot.text ?? ""}</button>`,
    data: {
      type: hotspot.type,
      sceneId: hotspot.sceneId,
    },
  };
};

export default function PanoViewer({ imageUrl, hotspotConfig = [], navigateTo }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const markersPluginRef = useRef(null);
  const navigateToRef = useRef(navigateTo);

  useEffect(() => {
    navigateToRef.current = navigateTo;
  }, [navigateTo]);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    let mounted = true;
    let cleanupListeners = () => {};

    (async () => {
      try {
        const viewerModule = await import("photo-sphere-viewer");
        const markersModule = await import("photo-sphere-viewer/dist/plugins/markers");
        if (!mounted || !containerRef.current) return;

        const ViewerLib = viewerModule?.Viewer ?? viewerModule?.default ?? viewerModule;
        const MarkersPluginLib = markersModule?.MarkersPlugin ?? markersModule?.default ?? markersModule;

        const viewer = new ViewerLib({
          container: containerRef.current,
          panorama: imageUrl,
          defaultZoomLvl: 40,
          navbar: ["zoom", "fullscreen"],
          plugins: [[MarkersPluginLib, { markers: [] }]],
        });

        const markersPlugin = viewer.getPlugin(MarkersPluginLib);
        viewerRef.current = viewer;
        markersPluginRef.current = markersPlugin;

        const handleMarkerSelect = (event, marker) => {
          const data = marker?.config?.data;
          if (data?.type === "scene" && data?.sceneId) {
            navigateToRef.current?.(data.sceneId);
          }
        };

        markersPlugin.on("select-marker", handleMarkerSelect);
        cleanupListeners = () => {
          try {
            markersPlugin.off("select-marker", handleMarkerSelect);
          } catch {
            // ignore
          }
        };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to initialize PanoViewer:", error);
      }
    })();

    return () => {
      mounted = false;
      cleanupListeners();
      try {
        viewerRef.current?.destroy();
      } catch {
        // ignore
      }
      viewerRef.current = null;
      markersPluginRef.current = null;
    };
  }, [imageUrl]);

  useEffect(() => {
    if (!viewerRef.current || !imageUrl) return;

    let cancelled = false;

    (async () => {
      try {
        await viewerRef.current.setPanorama(imageUrl, {
          transition: false,
          showLoader: true,
        });
      } catch (error) {
        if (!cancelled) {
          // eslint-disable-next-line no-console
          console.error("Failed to set panorama:", error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  useEffect(() => {
    if (!markersPluginRef.current) return;
    const markers = hotspotConfig.map((hotspot, index) => buildMarker(hotspot, index));
    markersPluginRef.current.setMarkers(markers);
  }, [hotspotConfig]);

  return <div ref={containerRef} className="h-[70vh] w-full" />;
}

