"use client"

import { useEffect, useState } from "react"
import { Download, Share2 } from "lucide-react"

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)

    if (outcome === "accepted") {
      console.log("PWA installation accepted")
    } else {
      console.log("PWA installation dismissed")
    }

    setDeferredPrompt(null)
  }

  const handleIOSClick = () => {
    setShowIOSInstructions(true)
  }

  if (!deferredPrompt && !isIOS) return null

  if (isIOS) {
    return (
      <>
        <button
          onClick={handleIOSClick}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Install App
        </button>
        {showIOSInstructions && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm">
              <h3 className="text-lg font-semibold mb-4">Install iDealz App</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Tap the Share button <Share2 className="inline w-4 h-4 mx-1" /></li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" in the top right corner</li>
              </ol>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Download className="w-4 h-4" />
      Install App
    </button>
  )
}
