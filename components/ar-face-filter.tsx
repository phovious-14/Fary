import { useEffect, useRef, useState } from "react";

interface ARFaceFilterProps {
  filterType?: "glasses" | "hat" | "mask" | "makeup";
  onFaceDetected?: (isDetected: boolean) => void;
  onError?: (error: string) => void;
}

export function ARFaceFilter({
  filterType = "glasses",
  onFaceDetected,
  onError,
}: ARFaceFilterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize 8th Wall
  useEffect(() => {
    if (!containerRef.current || isInitialized) return;

    const initialize8thWall = async () => {
      try {
        setIsLoading(true);

        // Check if 8th Wall is available
        if (typeof window.WorldTracking === "undefined") {
          throw new Error(
            "8th Wall is not available. Please make sure you have included the 8th Wall script."
          );
        }

        // Initialize 8th Wall
        const world = new window.WorldTracking(containerRef.current);

        // Configure face tracking
        world.setFaceTracking(true);

        // Load 3D models based on filter type
        let modelUrl = "";
        switch (filterType) {
          case "glasses":
            modelUrl = "/models/glasses.glb";
            break;
          case "hat":
            modelUrl = "/models/hat.glb";
            break;
          case "mask":
            modelUrl = "/models/mask.glb";
            break;
          case "makeup":
            modelUrl = "/models/makeup.glb";
            break;
          default:
            modelUrl = "/models/glasses.glb";
        }

        // Load the 3D model
        const model = await world.loadModel(modelUrl);

        // Position the model on the face
        model.setParent(world.face);

        // Add event listeners for face detection
        world.addEventListener("faceFound", () => {
          setIsFaceDetected(true);
          if (onFaceDetected) {
            onFaceDetected(true);
          }
        });

        world.addEventListener("faceLost", () => {
          setIsFaceDetected(false);
          if (onFaceDetected) {
            onFaceDetected(false);
          }
        });

        // Start the AR session
        await world.start();

        setIsInitialized(true);
        setIsLoading(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error initializing AR";
        console.error("Error initializing AR:", errorMessage);
        setError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
        setIsLoading(false);
      }
    };

    initialize8thWall();

    // Cleanup
    return () => {
      if (containerRef.current && isInitialized) {
        // Clean up 8th Wall resources
        const world = (containerRef.current as any).__world;
        if (world) {
          world.stop();
        }
      }
    };
  }, [containerRef, isInitialized, filterType, onFaceDetected, onError]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ position: "relative" }}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading AR filter...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="text-white text-center p-4">
            <p className="text-lg font-medium mb-2">AR Error</p>
            <p className="text-sm opacity-80">{error}</p>
            <p className="text-xs mt-4 opacity-60">
              Make sure you have granted camera permissions and are using a
              compatible device.
            </p>
          </div>
        </div>
      )}

      {!isLoading && !error && !isFaceDetected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10">
          <div className="text-white text-center p-4">
            <p>Position your face in the camera view</p>
          </div>
        </div>
      )}
    </div>
  );
}
