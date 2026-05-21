import type {
  LayerAvailability,
  LayerId,
  QualityProfile,
  VisualModeDefinition
} from "../shared/domain";

export type CesiumLikeViewer = {
  scene?: {
    globe?: Record<string, unknown> & {
      material?: unknown;
    };
    primitives?: {
      add: (item: unknown) => unknown;
      remove: (item: unknown) => boolean;
    };
    canvas?: {
      clientWidth?: number;
      clientHeight?: number;
      getBoundingClientRect?: () => { left: number; top: number };
    };
    pick?: (position: unknown) => unknown;
    requestRender?: () => void;
    imageryLayers?: {
      addImageryProvider?: (provider: unknown, index?: number) => unknown;
      remove?: (layer: unknown, destroy?: boolean) => boolean;
    };
    verticalExaggeration?: number;
    verticalExaggerationRelativeHeight?: number;
  };
  imageryLayers?: {
    addImageryProvider?: (provider: unknown, index?: number) => unknown;
    remove?: (layer: unknown, destroy?: boolean) => boolean;
  };
  terrainProvider?: unknown;
  entities?: {
    add: (entity: any) => any;
    remove: (entity: any) => boolean;
  };
  __myEarthCesium?: Record<string, any>;
};

export type LayerAdapterContext = {
  viewer: CesiumLikeViewer;
  quality: QualityProfile;
  reducedMotion: boolean;
};

export type CesiumLayerAdapter = {
  id: LayerId;
  setVisible(context: LayerAdapterContext, visible: boolean): Promise<LayerAvailability>;
  applyVisualMode?(
    context: LayerAdapterContext,
    mode: VisualModeDefinition
  ): Promise<LayerAvailability>;
  applyQuality?(context: LayerAdapterContext): Promise<LayerAvailability>;
  dispose?(viewer: CesiumLikeViewer): void;
};

export const available: LayerAvailability = { status: "available" };

export function disabled(reason: string): LayerAvailability {
  return { status: "disabled", reason };
}

export function failed(reason: string, recoverable = true): LayerAvailability {
  return { status: "failed", reason, recoverable };
}
