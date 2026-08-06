"use client"

import { useEffect } from "react"

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Only register service worker in production and on HTTPS
    if (typeof window !== "undefined" && "serviceWorker" in navigator && process.env.NODE_ENV === "production" && window.location.protocol === "https:") {
      navigator.serviceWorker.register("/sw.js").then(
        (registration) => {
          console.log("Service Worker registered with scope:", registration.scope)
        },
        (error) => {
          console.log("Service Worker registration failed:", error)
        }
      )
    }
  }, [])

  return null
}
