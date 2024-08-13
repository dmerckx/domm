"use client"

import type { PixiReactNode } from "@pixi/react"
import {
  Application,
  extend,
  useApplication,
  useAssets,
  useExtend,
} from "@pixi/react"
import { copyFile } from "fs"
import { IViewportOptions, Viewport } from "pixi-viewport"
import { Container, Graphics, Sprite } from "pixi.js"
import { off } from "process"
import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

extend({
  Viewport,
  Container,
  Graphics,
  Sprite,
})

declare global {
  namespace JSX {
    interface IntrinsicElements {
      viewport: PixiReactNode<typeof Viewport>
    }
  }
}

type Location = {
  name: string
  x: number
  y: number
}

const locations = [
  { name: "ruins", x: 400, y: 220 },
  { name: "keep", x: 990, y: 500 },
]

export const MapViewportReact = () => {
  const ref = useRef<HTMLDialogElement>(null)
  const [location, setLocation] = useState<Location>(locations[0])

  return (
    <>
      <Application background="#1099bb" resizeTo={window}>
        <MyViewport
          setLocation={(location: Location) => {
            console.log(location)
            setLocation(location)
            ref.current?.showModal()
          }}
        />
      </Application>
      <dialog id="location_modal" className="modal" ref={ref}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">{location.name}</h3>
          <p className="py-4">
            Coordinates: {location.x}, {location.y}
          </p>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  )
}

const Marker: React.FC<{ location: Location; onClick: () => void }> = ({
  location,
  onClick,
}) => {
  const locationRef = useRef<any>()
  const {
    assets: [markerTexture],
    isSuccess,
  } = useAssets(["/marker.webp"])

  useEffect(() => {
    if (!locationRef.current) return
    locationRef.current.on("click", onClick)
  })

  if (!isSuccess) return null
  return (
    <pixiSprite
      texture={markerTexture}
      x={location.x}
      y={location.y}
      width={48}
      height={48}
      eventMode="dynamic"
      cursor="pointer"
      ref={locationRef}
    />
  )
}

const MyViewport: React.FC<{
  setLocation: (location: Location) => void
}> = ({ setLocation }) => {
  const [initialized, setInitialized] = useState(false)
  const { app, isInitialised, isInitialising } = useApplication()
  const viewportRef = useRef<Viewport>()

  const drawCallback = useCallback((graphics: any) => {
    graphics.clear()
    graphics.setFillStyle({ color: "red" })
    graphics.rect(0, 0, 100, 100)
    graphics.fill()
  }, [])

  const {
    assets: [bgTexture],
    isSuccess,
  } = useAssets(["/bg.webp"])

  useEffect(() => {
    if (initialized) return
    const viewport = viewportRef.current
    if (!viewport) return

    const mapWidth = 1792
    const mapHeight = 1024
    const minScale = Math.max(
      window.innerWidth / mapWidth,
      window.innerHeight / mapHeight
    )
    const maxScale = 1.5
    viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate()
      .clamp({ direction: "all" })
      // .clamp({ direction: "all", underflow: "center" })
      .clampZoom({
        maxScale,
        minScale,
      })
    setInitialized(true)
  })

  if (!app?.renderer?.events || typeof window === "undefined") {
    return null
  }

  return (
    <viewport
      screenWidth={window.innerWidth}
      screenHeight={window.innerHeight}
      worldWidth={1792}
      worldHeight={1024}
      events={app?.renderer?.events}
      ref={viewportRef as any}
    >
      {isSuccess && (
        <>
          <pixiSprite
            texture={bgTexture}
            x={0}
            y={0}
            onClick={() => {
              console.log("TEST")
            }}
          />
          {locations.map((location) => (
            <Marker
              key={location.name}
              location={location}
              onClick={() => {
                setLocation(location)
              }}
            />
          ))}
        </>
      )}
    </viewport>
  )
}
