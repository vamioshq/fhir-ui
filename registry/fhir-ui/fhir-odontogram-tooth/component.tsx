import React from "react";
import { cn } from "@/lib/utils";

export type ToothSurface = "O" | "M" | "D" | "V" | "L" | "ROOT";
export type ToothConditionType =
  | "healthy"
  | "caries"
  | "amalgam"
  | "composite"
  | "crown"
  | "missing"
  | "root-canal"
  | "sealant"
  | "radix"
  | "unerupted"
  | "fracture"
  | "bridge";

export interface FHIROdontogramToothProps {
  id: number;
  surfaces?: Partial<Record<ToothSurface, ToothConditionType>>;
  onSurfaceClick?: (toothId: number, surface: ToothSurface) => void;
  isSelected?: boolean;
  interactive?: boolean;
  className?: string;
  hasBridgeLeft?: boolean;
  hasBridgeRight?: boolean;
}

export function FHIROdontogramTooth({
  id,
  surfaces = {},
  onSurfaceClick,
  isSelected = false,
  interactive = true,
  className,
  hasBridgeLeft = false,
  hasBridgeRight = false,
}: FHIROdontogramToothProps) {
  const isMissing = Object.values(surfaces).some((c) => c === "missing");
  const hasCrown = Object.values(surfaces).some((c) => c === "crown");
  const isRadix = Object.values(surfaces).some((c) => c === "radix");
  const isUnerupted = Object.values(surfaces).some((c) => c === "unerupted");
  const isFracture = Object.values(surfaces).some((c) => c === "fracture");
  const hasBridge = Object.values(surfaces).some((c) => c === "bridge");
  const hasCondition = Object.values(surfaces).some(
    (c) => c !== "healthy" && c !== undefined
  );

  const getSurfaceColor = (surface: ToothSurface) => {
    if (isMissing) {
      return "fill-muted/20 stroke-muted-foreground/10 dark:fill-muted/10";
    }
    if ((isRadix || isFracture) && surface !== "ROOT") {
      return "fill-muted/20 stroke-muted-foreground/20 dark:fill-muted/10";
    }
    const condition = surfaces[surface] || "healthy";
    switch (condition) {
      case "healthy":
        return "fill-background hover:fill-muted";
      case "caries":
        return "fill-destructive hover:fill-destructive/80";
      case "amalgam":
        return "fill-neutral-800 dark:fill-neutral-900 hover:fill-neutral-900";
      case "composite":
        return "fill-emerald-600 dark:fill-emerald-500 hover:fill-emerald-700";
      case "sealant":
        return "fill-pink-500 hover:fill-pink-600";
      case "crown":
        return "fill-amber-400/40 hover:fill-amber-400/60";
      case "missing":
        return "fill-muted/20";
      case "root-canal":
        return "fill-purple-600 hover:fill-purple-700";
      case "radix":
        return "fill-muted/20";
      case "unerupted":
      case "fracture":
        return "fill-background hover:fill-muted";
      default:
        return "fill-background";
    }
  };

  const isSelectedStyle = isSelected
    ? "ring-2 ring-primary ring-offset-2 z-10 bg-primary/10"
    : "";
  const interactiveClass = interactive ? "cursor-crosshair hover:bg-muted/50" : "";

  // FDI ISO 3950 Orientation
  const isPatientRight =
    (id >= 11 && id <= 18) ||
    (id >= 41 && id <= 48) ||
    (id >= 51 && id <= 55) ||
    (id >= 81 && id <= 85);
  const isUpper = (id >= 11 && id <= 28) || (id >= 51 && id <= 65);

  const isAnterior =
    (id >= 11 && id <= 13) ||
    (id >= 21 && id <= 23) ||
    (id >= 31 && id <= 33) ||
    (id >= 41 && id <= 43) ||
    (id >= 51 && id <= 53) ||
    (id >= 61 && id <= 63) ||
    (id >= 71 && id <= 73) ||
    (id >= 81 && id <= 83);

  let topSurf: ToothSurface, bottomSurf: ToothSurface;
  if (isUpper) {
    topSurf = "V";
    bottomSurf = "L";
  } else {
    topSurf = "L";
    bottomSurf = "V";
  }

  let leftSurf: ToothSurface, rightSurf: ToothSurface;
  if (isPatientRight) {
    leftSurf = "D";
    rightSurf = "M";
  } else {
    leftSurf = "M";
    rightSurf = "D";
  }

  const isRootTop = isUpper;

  const topPoints = isAnterior ? "2,2 98,2 72,50 28,50" : "2,2 98,2 72,28 28,28";
  const bottomPoints = isAnterior ? "2,98 98,98 72,50 28,50" : "2,98 98,98 72,72 28,72";
  const leftPoints = isAnterior ? "2,2 2,98 28,50" : "2,2 2,98 28,72 28,28";
  const rightPoints = isAnterior ? "98,2 98,98 72,50" : "98,2 98,98 72,72 72,28";

  const handleClick = (e: React.MouseEvent, surface: ToothSurface) => {
    e.stopPropagation();
    if (interactive && onSurfaceClick) {
      onSurfaceClick(id, surface);
    }
  };

  const renderPolygon = (points: string, surface: ToothSurface) => (
    <polygon
      points={points}
      className={cn(
        "stroke-foreground stroke-[1.5] transition-colors duration-150",
        isMissing && "stroke-muted-foreground/20",
        getSurfaceColor(surface)
      )}
      onClick={(e) => handleClick(e, surface)}
    />
  );

  const renderRoot = () => {
    const rootCondition = surfaces.ROOT || "healthy";
    const isRCT = rootCondition === "root-canal";
    const isRadixRoot = rootCondition === "radix";
    // For simplicity, we just render a pill shape for the root.
    return (
      <div
        onClick={(e) => handleClick(e, "ROOT")}
        className={cn(
          "flex justify-center",
          isRootTop ? "mb-1" : "mt-1",
          interactive && !isMissing ? "cursor-crosshair" : ""
        )}
        title="Root Surface"
      >
        <div
          className={cn(
            "w-8 h-4 rounded-full mx-auto transition-all border-2",
            isMissing
              ? "bg-muted/10 border-muted-foreground/10"
              : isRCT
                ? "bg-purple-600 border-purple-900"
                : isRadixRoot
                  ? "bg-destructive border-destructive-foreground animate-pulse"
                  : "bg-muted border-input hover:bg-accent hover:border-accent-foreground",
            isSelected && rootCondition !== "healthy"
              ? "ring-2 ring-primary ring-offset-1"
              : ""
          )}
        >
          {isRCT && !isMissing && <div className="w-full h-1 bg-white/40 mt-1"></div>}
        </div>
      </div>
    );
  };

  const renderNumberLabel = () => (
    <div className="text-center h-5 flex items-center justify-center">
      <span
        className={cn(
          "text-sm font-black select-none tracking-tight",
          isMissing
            ? "text-destructive/50 line-through"
            : hasCondition
              ? "text-primary"
              : "text-muted-foreground"
        )}
      >
        {id}
      </span>
    </div>
  );

  return (
    <div
      className={cn(
        "flex flex-col relative group rounded-xl p-0 transition-all gap-1",
        interactiveClass,
        isSelected ? "bg-primary/5 ring-2 ring-primary/20" : "",
        className
      )}
    >
      {/* Lower Tooth Number (placed on top to stay between arches) */}
      {!isRootTop && renderNumberLabel()}

      {/* Upper Root */}
      {isRootTop && renderRoot()}

      {/* Tooth Body */}
      <div
        className={cn(
          "size-6 md:size-8 relative transition-transform duration-150",
          isSelected && interactive ? "scale-110" : "group-hover:scale-120"
        )}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          {/* Main Surfaces */}
          {renderPolygon(topPoints, topSurf)}
          {renderPolygon(bottomPoints, bottomSurf)}
          {renderPolygon(leftPoints, leftSurf)}
          {renderPolygon(rightPoints, rightSurf)}

          {!isAnterior && (
            <rect
              x="28"
              y="28"
              width="44"
              height="44"
              className={cn(
                "stroke-foreground stroke-[1.5] transition-colors",
                isMissing && "stroke-muted-foreground/20",
                getSurfaceColor("O")
              )}
              onClick={(e) => handleClick(e, "O")}
            />
          )}

          {/* Missing X Overlay */}
          {isMissing && (
            <>
              <line x1="5" y1="5" x2="95" y2="95" className="stroke-destructive pointer-events-none" strokeWidth="6" strokeLinecap="round" />
              <line x1="95" y1="5" x2="5" y2="95" className="stroke-destructive pointer-events-none" strokeWidth="6" strokeLinecap="round" />
            </>
          )}

          {/* Condition Overlays */}
          {hasCrown && !isMissing && (
            <rect
              x="5"
              y="5"
              width="90"
              height="90"
              rx="10"
              fill="none"
              strokeWidth="5"
              className="stroke-primary pointer-events-none"
            />
          )}

          {/* Unerupted Dashed Circle */}
          {isUnerupted && !isMissing && (
            <circle
              cx="50"
              cy="50"
              r="47"
              fill="none"
              strokeDasharray="6 4"
              className="stroke-amber-500 dark:stroke-amber-400 stroke-3 pointer-events-none"
            />
          )}

          {/* Fracture (#) Overlay (Kemenkes Standard - Full Cover) */}
          {isFracture && !isMissing && (
            <g className="stroke-destructive stroke-6 pointer-events-none" strokeLinecap="round">
              <line x1="5" y1="35" x2="95" y2="35" />
              <line x1="5" y1="65" x2="95" y2="65" />
              <line x1="35" y1="5" x2="35" y2="95" />
              <line x1="65" y1="5" x2="65" y2="95" />
            </g>
          )}

          {/* Bridge Connectors */}
          {hasBridge && (
            <g className="pointer-events-none">
              <line
                x1={hasBridgeLeft ? "-35" : "15"}
                y1="50"
                x2={hasBridgeRight ? "135" : "85"}
                y2="50"
                className="stroke-blue-500 dark:stroke-blue-400 stroke-8"
                strokeLinecap="round"
              />
              <line
                x1={hasBridgeLeft ? "-35" : "15"}
                y1="50"
                x2={hasBridgeRight ? "135" : "85"}
                y2="50"
                className="stroke-background stroke-2"
                strokeLinecap="round"
              />
            </g>
          )}


        </svg>
      </div>

      {/* Lower Root */}
      {!isRootTop && renderRoot()}

      {/* Upper Tooth Number (placed on bottom to stay between arches) */}
      {isRootTop && renderNumberLabel()}
    </div>
  );
}
