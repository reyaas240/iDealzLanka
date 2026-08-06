"use client"

import { useEffect } from "react"

export default function OneSignalProvider() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // OneSignal SDK will be loaded via script tag
      // This component can be used to initialize OneSignal when needed
      console.log("OneSignal provider loaded")
    }
  }, [])

  return null
}
