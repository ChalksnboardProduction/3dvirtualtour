"use client";

import { useEffect, useRef } from "react";

export default function PanoViewer() {
  const containerRef = useRef(null);
  const iframeHostRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    // ensure container covers full viewport and sits on top
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.zIndex = "2147483647"; // very high z-index

    // create iframe element matching the user's snippet
    const iframe = document.createElement("iframe");
    iframe.id = "tour-embeded";
    iframe.name = "newsaplings";
    iframe.src = "https://tour.panoee.net/iframe/69203d985c4668953f158693";
    iframe.setAttribute("frameBorder", "0");
    iframe.setAttribute("width", "100%");
    iframe.setAttribute("height", "100%");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("allowvr", "yes");
    iframe.setAttribute("allow", "vr; xr; accelerometer; gyroscope; autoplay;");
    iframe.setAttribute("allowFullScreen", "false");
    iframe.setAttribute("webkitallowfullscreen", "false");
    iframe.setAttribute("mozallowfullscreen", "false");
    iframe.setAttribute("loading", "eager");

    // append into host (don't remove other React children)
    const host = iframeHostRef.current ?? container;
    const existing = host.querySelector("#tour-embeded");
    if (existing) {
      try {
        host.removeChild(existing);
      } catch {}
    }
    host.appendChild(iframe);

    // forward devicemotion to iframe
    const handleDeviceMotion = (e) => {
      const frame = document.getElementById("tour-embeded");
      if (!frame || !frame.contentWindow) return;
      try {
        frame.contentWindow.postMessage(
          {
            type: "devicemotion",
            deviceMotionEvent: {
              acceleration: {
                x: e.acceleration?.x ?? null,
                y: e.acceleration?.y ?? null,
                z: e.acceleration?.z ?? null,
              },
              accelerationIncludingGravity: {
                x: e.accelerationIncludingGravity?.x ?? null,
                y: e.accelerationIncludingGravity?.y ?? null,
                z: e.accelerationIncludingGravity?.z ?? null,
              },
              rotationRate: {
                alpha: e.rotationRate?.alpha ?? null,
                beta: e.rotationRate?.beta ?? null,
                gamma: e.rotationRate?.gamma ?? null,
              },
              interval: e.interval,
              timeStamp: e.timeStamp,
            },
          },
          "*"
        );
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener("devicemotion", handleDeviceMotion);

    return () => {
      window.removeEventListener("devicemotion", handleDeviceMotion);
      try {
        const hostNode = iframeHostRef.current ?? container;
        const f = hostNode.querySelector("#tour-embeded");
        if (f) hostNode.removeChild(f);
      } catch (e) {
        // ignore
      }
      // remove container fullscreen styles
      try {
        container.style.position = null;
        container.style.top = null;
        container.style.left = null;
        container.style.width = null;
        container.style.height = null;
        container.style.zIndex = null;
      } catch {}
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <div ref={iframeHostRef} style={{ width: "100%", height: "100%" }} />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "0px",
          bottom: "2px",
          background: "rgba(0, 0, 0, 1)",
          color: "#fff",
          padding: "8px 12px",
          borderRadius: "6px",
          fontSize: "14px",
          fontWeight: 600,
          zIndex: 2147483648,
          pointerEvents: "none",
        }}
      >
        chalksnboard
      </div>
    </div>
  );
}

