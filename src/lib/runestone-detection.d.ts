export interface RunestoneDetection {
	/** Seven outer runes followed by the central rune, which occupies score slot 8. */
	ids: number[];
	/** Bounds of the eight rune faces, in natural source pixels. */
	bounds: { x: number; y: number; width: number; height: number };
	/** Lowest accepted glyph correlation, between 0 and 1. */
	confidence: number;
}

export interface RunestoneDetector {
	/** Prefers the left new roll in an adjacent comparison pair. Returns null if that panel is incomplete, obscured, or ambiguous. */
	detect(source: CanvasImageSource): RunestoneDetection | null;
}

export function createRunestoneDetector(options?: { assetBase?: string }): Promise<RunestoneDetector>;
