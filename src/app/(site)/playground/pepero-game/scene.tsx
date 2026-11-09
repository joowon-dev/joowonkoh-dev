"use client";

import dynamic from "next/dynamic";

/** 3D 무대 — three.js 는 브라우저에서만 불러온다 */
export const Scene = dynamic(() => import("./Scene3D"), { ssr: false });
