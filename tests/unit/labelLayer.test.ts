import { describe, expect, it, vi } from "vitest";
import { createLabelLayerAdapter } from "../../src/layers/labelLayer";
import { createLayerController } from "../../src/layers/layerController";
import { defaultQualityProfile } from "../../src/performance/qualityController";

function createViewer() {
  const addedLabels: Array<Record<string, unknown>> = [];
  const removedPrimitives: unknown[] = [];
  class LabelCollection {
    show = true;

    add(options: Record<string, unknown>) {
      addedLabels.push(options);
      return options;
    }
  }

  const viewer = {
    scene: {
      primitives: {
        add: vi.fn((primitive: unknown) => primitive),
        remove: vi.fn((primitive: unknown) => {
          removedPrimitives.push(primitive);
          return true;
        })
      },
      requestRender: vi.fn()
    },
    imageryLayers: {
      addImageryProvider: vi.fn((provider: unknown) => ({ provider })),
      remove: vi.fn()
    },
    __myEarthCesium: {
      IonWorldImageryStyle: {
        AERIAL: 2,
        AERIAL_WITH_LABELS: 3,
        ROAD: 4
      },
      createWorldImageryAsync: vi.fn(async ({ style }: { style: number }) => ({
        style
      })),
      LabelCollection,
      Cartesian3: {
        fromDegrees: vi.fn((longitude, latitude, height) => ({
          longitude,
          latitude,
          height
        }))
      },
      Cartesian2: vi.fn(function (
        this: { x: number; y: number },
        x: number,
        y: number
      ) {
        this.x = x;
        this.y = y;
      }),
      Color: {
        fromCssColorString: vi.fn((css: string) => ({ css }))
      },
      NearFarScalar: vi.fn(function (
        this: Record<string, number>,
        near: number,
        nearValue: number,
        far: number,
        farValue: number
      ) {
        this.near = near;
        this.nearValue = nearValue;
        this.far = far;
        this.farValue = farValue;
      }),
      DistanceDisplayCondition: vi.fn(function (
        this: Record<string, number>,
        near: number,
        far: number
      ) {
        this.near = near;
        this.far = far;
      }),
      LabelStyle: { FILL_AND_OUTLINE: "fill-and-outline" },
      HorizontalOrigin: { CENTER: "center" },
      VerticalOrigin: { BOTTOM: "bottom" }
    }
  };

  return { viewer, addedLabels, removedPrimitives };
}

describe("label layer", () => {
  it("adds visible reference labels and removes them when disabled", async () => {
    const { viewer, addedLabels, removedPrimitives } = createViewer();
    const adapter = createLabelLayerAdapter();

    await expect(
      adapter.setVisible(
        {
          viewer,
          quality: defaultQualityProfile,
          reducedMotion: false
        },
        true
      )
    ).resolves.toEqual({ status: "available" });

    expect(viewer.scene.primitives.add).toHaveBeenCalledOnce();
    expect(addedLabels).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: "Asia" }),
        expect.objectContaining({ text: "Tokyo" }),
        expect.objectContaining({ text: "Great Barrier Reef" })
      ])
    );
    expect(viewer.scene.requestRender).toHaveBeenCalled();

    await adapter.setVisible(
      {
        viewer,
        quality: defaultQualityProfile,
        reducedMotion: false
      },
      false
    );

    expect(viewer.scene.primitives.remove).toHaveBeenCalledOnce();
    expect(removedPrimitives).toHaveLength(1);
  });

  it("routes the Labels toggle to both reference labels and labeled imagery", async () => {
    const { viewer, addedLabels } = createViewer();
    const controller = createLayerController({ viewer });

    await controller.setLayerVisibility("labels", true);

    expect(addedLabels.length).toBeGreaterThan(0);
    expect(viewer.__myEarthCesium.createWorldImageryAsync).toHaveBeenCalledWith({
      style: 3
    });
  });
});
