// The active panel has seven outer stones and one central stone. Coordinates are
// relative to the top stone, in widths of its amber face (not the animated aura).
const SLOT_OFFSETS = [
	[0, 0], [-2.17, 1.18], [2.2, 1.18], [-2.62, 3.23],
	[2.67, 3.23], [-1.3, 4.98], [1.33, 4.98], [0.03, 2.66]
];
const FEATURE_WIDTH = 16;
const FEATURE_HEIGHT = 20;
const MIN_MATCH = 0.82;
const MIN_MARGIN = 0.055;

function makeCanvas(width, height) {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	return { canvas, context: canvas.getContext('2d', { willReadFrequently: true }) };
}

function sourceSize(source) {
	return {
		width: source.videoWidth || source.naturalWidth || source.width,
		height: source.videoHeight || source.naturalHeight || source.height
	};
}

/** Find amber stone faces without relying on panel placement or screen size. */
function amberComponents({ data, width, height }) {
	const mask = new Uint8Array(width * height);
	const queue = new Int32Array(mask.length);
	for (let index = 0; index < mask.length; index += 1) {
		const offset = index * 4;
		const red = data[offset], green = data[offset + 1], blue = data[offset + 2];
		mask[index] = data[offset + 3] > 180 && red > 85 && green > 35 &&
			red > green * 1.07 && red > blue * 1.5 && green > blue * 1.2 ? 1 : 0;
	}
	const components = [];
	for (let index = 0; index < mask.length; index += 1) {
		if (!mask[index]) continue;
		let head = 0, tail = 1, minX = width, minY = height, maxX = 0, maxY = 0;
		queue[0] = index;
		mask[index] = 0;
		while (head < tail) {
			const pixel = queue[head++];
			const x = pixel % width, y = Math.floor(pixel / width);
			minX = Math.min(minX, x); maxX = Math.max(maxX, x);
			minY = Math.min(minY, y); maxY = Math.max(maxY, y);
			const neighbors = [x > 0 ? pixel - 1 : -1, x + 1 < width ? pixel + 1 : -1,
				y > 0 ? pixel - width : -1, y + 1 < height ? pixel + width : -1];
			for (const neighbor of neighbors) {
				if (neighbor < 0 || !mask[neighbor]) continue;
				mask[neighbor] = 0;
				queue[tail++] = neighbor;
			}
		}
		const boxWidth = maxX - minX + 1, boxHeight = maxY - minY + 1;
		if (boxWidth < 10 || boxHeight < 10 || boxWidth > 220 || boxHeight > 220) continue;
		if (boxWidth / boxHeight < 0.76 || boxWidth / boxHeight > 1.3) continue;
		if (tail < boxWidth * boxHeight * 0.4) continue;
		components.push({ x: minX, y: minY, width: boxWidth, height: boxHeight });
	}
	return components;
}

function center(box) {
	return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Keep partially obscured rings as panel evidence, without recognizing them. */
function findRings(components) {
	const rings = [];
	for (const anchor of components) for (const anchorSlot of [0, 1, 2]) {
		const point = center(anchor);
		let best = null;
		for (const adjustment of [1, 0.96, 1.04]) {
			const size = (anchor.width + anchor.height) / 2 * adjustment;
			const origin = {
				x: point.x - SLOT_OFFSETS[anchorSlot][0] * size,
				y: point.y - SLOT_OFFSETS[anchorSlot][1] * size
			};
			const slots = [];
			let error = 0, found = 0;
			for (let slot = 0; slot < 7; slot += 1) {
				const [dx, dy] = SLOT_OFFSETS[slot];
				const x = origin.x + dx * size, y = origin.y + dy * size;
				let nearest = null, distance = size * 0.42;
				for (const candidate of components) {
					if (slots.includes(candidate)) continue;
					const ratio = (candidate.width + candidate.height) / 2 / size;
					if (ratio < 0.78 || ratio > 1.25) continue;
					const position = center(candidate);
					const current = Math.hypot(position.x - x, position.y - y);
					if (current < distance) { nearest = candidate; distance = current; }
				}
				slots.push(nearest);
				if (nearest) { found += 1; error += distance / size; }
			}
			if (found < 5) continue;
			// Fire can join the central stone's connected component. Derive its
			// position from the stable outer ring, then prefer a clean face if present.
			const topOrigin = slots[0] ? center(slots[0]) : origin;
			const faceSize = slots[0] ? (slots[0].width + slots[0].height) / 2 : size;
			const x = topOrigin.x + SLOT_OFFSETS[7][0] * faceSize;
			const y = topOrigin.y + SLOT_OFFSETS[7][1] * faceSize;
			let middle = { x: x - faceSize / 2, y: y - faceSize / 2, width: faceSize, height: faceSize };
			let distance = faceSize * 0.32;
			for (const candidate of components) {
				if (slots.includes(candidate)) continue;
				const ratio = (candidate.width + candidate.height) / 2 / faceSize;
				if (ratio < 0.8 || ratio > 1.2) continue;
				const position = center(candidate);
				const current = Math.hypot(position.x - x, position.y - y);
				if (current < distance) { middle = candidate; distance = current; }
			}
			const ring = { slots: [...slots, middle], origin, size, complete: found === 7, error: error + (7 - found) };
			if (!best || ring.error < best.error) best = ring;
		}
		if (!best) continue;
		const duplicate = rings.findIndex((ring) =>
			Math.hypot(ring.origin.x - best.origin.x, ring.origin.y - best.origin.y) < best.size * 0.6);
		if (duplicate === -1) rings.push(best);
		else if (best.error < rings[duplicate].error) rings[duplicate] = best;
	}
	return rings.sort((a, b) => a.error - b.error);
}

/** A tooltip may hide every upper anchor while leaving the lower half of New visible. */
function hasObscuredLeftPanel(right, components) {
	for (const gap of [9, 9.5, 10]) {
		const used = new Set();
		for (const slot of [3, 4, 5, 6, 7]) {
			const [dx, dy] = SLOT_OFFSETS[slot];
			const x = right.origin.x + (dx - gap) * right.size;
			const y = right.origin.y + dy * right.size;
			let nearest = null, distance = right.size * 0.45;
			for (const candidate of components) {
				if (used.has(candidate)) continue;
				const ratio = (candidate.width + candidate.height) / 2 / right.size;
				if (ratio < 0.84 || ratio > 1.16) continue;
				const point = center(candidate);
				const current = Math.hypot(point.x - x, point.y - y);
				if (current < distance) { nearest = candidate; distance = current; }
			}
			if (!nearest) break;
			used.add(nearest);
		}
		if (used.size === 5) return true;
	}
	return false;
}

/** The game's comparison view places New immediately left of Current. */
function selectTargetRings(rings, components) {
	const pairs = [];
	for (const left of rings) for (const right of rings) {
		if (!left.complete && !right.complete) continue;
		const size = (left.size + right.size) / 2;
		const separation = (right.origin.x - left.origin.x) / size;
		if (separation < 8.2 || separation > 10.8) continue;
		if (Math.abs(left.size - right.size) > size * 0.16) continue;
		if (Math.abs(left.origin.y - right.origin.y) > size * 0.45) continue;
		pairs.push({ left, error: left.error + right.error + Math.abs(separation - 9.5) });
	}
	if (pairs.length) {
		pairs.sort((a, b) => a.error - b.error);
		// Select before recognizing glyphs. An unreadable new roll must not
		// silently become the saved right-hand build, even if its layout is cleaner.
		return [pairs[0].left];
	}
	const complete = rings.filter((ring) => ring.complete);
	// This evidence can only veto a saved build, never produce a partial result.
	if (complete.some((ring) => hasObscuredLeftPanel(ring, components))) return [];
	return complete.slice(0, 4);
}

function descriptor(context, source, box) {
	context.clearRect(0, 0, 32, 32);
	context.drawImage(source, box.x, box.y, box.width, box.height, 0, 0, 32, 32);
	const pixels = context.getImageData(0, 0, 32, 32).data;
	const values = new Float32Array(FEATURE_WIDTH * FEATURE_HEIGHT);
	let sum = 0, index = 0;
	// Only the inner glyph is compared. The frame, cyan aura, and flame above
	// the central stone are deliberately outside this comparison window.
	for (let y = 6; y < 26; y += 1) for (let x = 8; x < 24; x += 1) {
		const offset = (y * 32 + x) * 4;
		const value = pixels[offset + 1] - pixels[offset] * 0.25 - pixels[offset + 2] * 0.1;
		values[index++] = value;
		sum += value;
	}
	const mean = sum / values.length;
	let magnitude = 0;
	for (let index = 0; index < values.length; index += 1) {
		values[index] -= mean;
		magnitude += values[index] ** 2;
	}
	if (magnitude < 1) return null;
	magnitude = Math.sqrt(magnitude);
	for (let index = 0; index < values.length; index += 1) values[index] /= magnitude;
	return values;
}

function recognize(context, source, box, templates) {
	const scores = new Float32Array(templates.length).fill(-1);
	const offset = Math.max(0.65, box.width / 43);
	for (const dx of [-offset, 0, offset]) for (const dy of [-offset, 0, offset]) {
		for (const scale of [0.96, 1, 1.04]) {
			const width = box.width * scale, height = box.height * scale;
			const sample = descriptor(context, source, {
				x: box.x + (box.width - width) / 2 + dx,
				y: box.y + (box.height - height) / 2 + dy,
				width, height
			});
			if (!sample) continue;
			for (let id = 0; id < templates.length; id += 1) {
				let correlation = 0;
				for (let pixel = 0; pixel < sample.length; pixel += 1) correlation += sample[pixel] * templates[id][pixel];
				if (correlation > scores[id]) scores[id] = correlation;
			}
		}
	}
	const ranking = Array.from(scores, (score, index) => ({ id: index + 1, score }))
		.sort((a, b) => b.score - a.score);
	const [best, second] = ranking;
	return best.score >= MIN_MATCH && best.score - second.score >= MIN_MARGIN ? best : null;
}

/** Load the game's rune artwork once; every detection is processed locally. */
export async function createRunestoneDetector({ assetBase = '/runestone/runes' } = {}) {
	const capture = makeCanvas(1, 1);
	const frame = makeCanvas(1, 1);
	const sampler = makeCanvas(32, 32);
	const images = await Promise.all(Array.from({ length: 30 }, async (_, index) => {
		const image = new Image();
		image.src = `${assetBase}/${index + 1}.png`;
		await image.decode();
		return image;
	}));
	const templates = images.map((image) => descriptor(sampler.context, image,
		{ x: 2, y: 2, width: 34, height: 34 }));

	return {
		detect(source) {
			const { width, height } = sourceSize(source);
			if (!width || !height || width < 100 || height < 100) return null;
			// Freeze one video frame so a moving panel cannot change between the
			// layout search and the individual glyph comparisons.
			if (capture.canvas.width !== width) capture.canvas.width = width;
			if (capture.canvas.height !== height) capture.canvas.height = height;
			capture.context.clearRect(0, 0, width, height);
			capture.context.drawImage(source, 0, 0, width, height);
			const scale = Math.min(1, 1600 / width, Math.sqrt(1600000 / (width * height)));
			const frameWidth = Math.round(width * scale), frameHeight = Math.round(height * scale);
			if (frame.canvas.width !== frameWidth) frame.canvas.width = frameWidth;
			if (frame.canvas.height !== frameHeight) frame.canvas.height = frameHeight;
			frame.context.clearRect(0, 0, frameWidth, frameHeight);
			frame.context.drawImage(capture.canvas, 0, 0, frameWidth, frameHeight);
			const pixels = frame.context.getImageData(0, 0, frame.canvas.width, frame.canvas.height);
			const components = amberComponents(pixels);
			const rings = selectTargetRings(findRings(components), components);
			for (const ring of rings) {
				if (!ring.complete) continue;
				const slots = ring.slots.map((box) => ({
					x: box.x / scale, y: box.y / scale, width: box.width / scale, height: box.height / scale
				}));
				const matches = slots.map((box) => recognize(sampler.context, capture.canvas, box, templates));
				if (matches.some((match) => !match)) continue;
				const ids = matches.map((match) => match.id);
				if (new Set(ids).size !== 8) continue;
				const left = Math.min(...slots.map((box) => box.x));
				const top = Math.min(...slots.map((box) => box.y));
				const right = Math.max(...slots.map((box) => box.x + box.width));
				const bottom = Math.max(...slots.map((box) => box.y + box.height));
				return {
					ids,
					bounds: { x: left, y: top, width: right - left, height: bottom - top },
					confidence: Math.min(...matches.map((match) => match.score))
				};
			}
			return null;
		}
	};
}
