"use client";

import { Viewport } from "pixi-viewport";
import { Application, Assets, Renderer, Sprite, Texture } from "pixi.js";
import { useEffect, useRef, useState } from "react";

let app: Application<Renderer>;

const locations = [
  { name: "ruins", x: 400, y: 220 },
  { name: "keep", x: 990, y: 500 },
];

async function initApp({
  onClickLocation,
}: {
  onClickLocation: (location: string) => void;
}) {
  if (app) return;

  // Create a PixiJS application.
  app = new Application();

  // Intialize the application.
  await app.init({ background: "#1099bb", resizeTo: window });

  const mapWidth = 1792;
  const mapHeight = 1024;

  // create viewport
  const viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: mapWidth,
    worldHeight: mapHeight,
    events: app.renderer.events, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
  });

  // add the viewport to the stage
  app.stage.addChild(viewport);
  const minScale = Math.max(
    window.innerWidth / mapWidth,
    window.innerHeight / mapHeight
  );
  const maxScale = 1.5;

  // activate plugins
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
    });

  // add a red box
  const sprite = viewport.addChild(new Sprite(Texture.WHITE));
  sprite.tint = 0xff0000;
  sprite.width = sprite.height = 100;
  sprite.position.set(100, 100);

  const bgTexture = await Assets.load("/bg.webp");
  const bgSprite = viewport.addChild(new Sprite(bgTexture));
  bgSprite.x = 0;
  bgSprite.y = 0;

  const markerTexture = await Assets.load("/marker.webp");
  for (const location of locations) {
    const markerSprite = new Sprite(markerTexture);
    markerSprite.x = location.x;
    markerSprite.y = location.y;
    markerSprite.width = 48;
    markerSprite.height = 48;
    markerSprite.eventMode = "static";
    markerSprite.cursor = "pointer";
    markerSprite.on("pointerdown", () => {
      onClickLocation(location.name);
    });
    viewport.addChild(markerSprite);
  }

  // Then adding the application's canvas to the DOM body.
  document.body.appendChild(app.canvas);
}

export const MapViewport = () => {
  const ref = useRef<HTMLDialogElement>(null);
  const [location, setLocation] = useState(locations[0]);
  useEffect(() => {
    initApp({
      onClickLocation: (location: string) => {
        setLocation(locations.find((loc) => loc.name === location)!);
        ref.current?.showModal();
      },
    });
  }, []);

  return (
    <>
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
  );
};
