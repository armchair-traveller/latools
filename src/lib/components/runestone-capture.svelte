<script lang="ts">
	import { asset } from '$app/paths';
	import { onDestroy, tick } from 'svelte';
	import ImagePlusIcon from '@lucide/svelte/icons/image-plus';
	import MonitorUpIcon from '@lucide/svelte/icons/monitor-up';
	import SquareIcon from '@lucide/svelte/icons/square';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { validateRunestoneImport } from '$lib/runestone-import.js';
	import { cn } from '$lib/utils.js';

	type Bounds = { x: number; y: number; width: number; height: number };
	type Detection = { ids: number[]; bounds: Bounds; confidence: number };
	type Detector = { detect: (source: CanvasImageSource) => Detection | null };
	type CapturePhase = 'idle' | 'requesting' | 'live' | 'image';

	let { ondetect }: { ondetect: (ids: number[], source: 'screen' | 'image') => void } = $props();
	let phase = $state<CapturePhase>('idle');
	let message = $state('Share your game window or choose a screenshot to read the eight assigned runes.');
	let previewKind = $state<'screen' | 'image' | null>(null);
	let imageUrl = $state('');
	let previewWidth = $state(16);
	let previewHeight = $state(9);
	let bounds = $state<Bounds | null>(null);
	let dragging = $state(false);
	let videoElement = $state<HTMLVideoElement>();
	let fileInput = $state<HTMLInputElement>();
	let stream: MediaStream | null = null;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let detectorPromise: Promise<Detector> | null = null;
	let generation = 0;
	let disposed = false;
	let matchingFrames = 0;
	let candidate = '';
	let lastApplied = '';
	let endedListeners: { track: MediaStreamTrack; listener: () => void }[] = [];
	const objectUrls: string[] = [];
	const waitingMessage = 'Waiting for a clear view of all eight assigned runes. Keep the ring visible and unobscured; your current selection is kept.';

	function isCurrent(request: number) {
		return !disposed && generation === request;
	}

	function releaseResources() {
		if (timer !== undefined) clearTimeout(timer);
		timer = undefined;
		for (const { track, listener } of endedListeners) track.removeEventListener('ended', listener);
		endedListeners = [];
		if (stream) for (const track of stream.getTracks()) track.stop();
		stream = null;
		if (videoElement) {
			videoElement.pause();
			videoElement.srcObject = null;
		}
		for (const url of objectUrls) URL.revokeObjectURL(url);
		objectUrls.length = 0;
		matchingFrames = 0;
		candidate = '';
		lastApplied = '';
	}

	function beginRequest() {
		generation += 1;
		releaseResources();
		previewKind = null;
		imageUrl = '';
		bounds = null;
		dragging = false;
		return generation;
	}

	/** Parent calls this before a manual edit so pending reads cannot overwrite it. */
	export function stop() {
		const hadReading = phase !== 'idle' || previewKind !== null;
		beginRequest();
		phase = 'idle';
		if (hadReading) message = 'Automatic reading stopped. Your current rune selection is kept.';
	}

	async function getDetector(): Promise<Detector> {
		if (!detectorPromise) {
			detectorPromise = import('$lib/runestone-detection.js')
				.then(({ createRunestoneDetector }) => createRunestoneDetector({ assetBase: asset('/runestone/runes') }))
				.catch((error: unknown) => {
					detectorPromise = null;
					throw error;
				});
		}
		return detectorPromise;
	}

	function scheduleSample(request: number) {
		if (isCurrent(request) && phase === 'live') {
			timer = setTimeout(() => { void sampleFrame(request); }, 1000);
		}
	}

	async function sampleFrame(request: number) {
		if (!isCurrent(request) || phase !== 'live') return;
		try {
			const detector = await getDetector();
			if (!isCurrent(request) || phase !== 'live') return;
			if (!videoElement || videoElement.readyState < 2 || !videoElement.videoWidth) {
				candidate = '';
				matchingFrames = 0;
				bounds = null;
				message = waitingMessage;
				return;
			}
			previewWidth = videoElement.videoWidth;
			previewHeight = videoElement.videoHeight;
			const result = detector.detect(videoElement);
			const ids = result && validateRunestoneImport(result.ids);
			if (!result || !ids) {
				candidate = '';
				matchingFrames = 0;
				bounds = null;
				message = waitingMessage;
				return;
			}
			bounds = result.bounds;
			const signature = ids.join(',');
			matchingFrames = signature === candidate ? matchingFrames + 1 : 1;
			candidate = signature;
			if (matchingFrames < 2) {
				message = 'Eight runes found. Confirming the next frame before updating your selection…';
				return;
			}
			if (signature !== lastApplied) {
				lastApplied = signature;
				ondetect(ids, 'screen');
			}
			if (isCurrent(request)) message = 'Eight runes read. Watching for changes; the center rune is in slot 8.';
		} catch {
			if (isCurrent(request)) {
				candidate = '';
				matchingFrames = 0;
				bounds = null;
				message = 'The frame could not be read. Keep the full ring visible, or try a screenshot. Your current selection is kept.';
			}
		} finally {
			scheduleSample(request);
		}
	}

	async function startSharing() {
		const request = beginRequest();
		if (!navigator.mediaDevices?.getDisplayMedia) {
			phase = 'idle';
			message = 'Screen sharing is not available in this browser. Choose, paste, or drop a screenshot instead.';
			return;
		}
		phase = 'requesting';
		message = 'Choose the game window or screen in your browser’s sharing dialog.';
		let requestedStream: MediaStream | null = null;
		try {
			// Keep this call in the original click activation, before any await or detector loading.
			requestedStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
			if (!isCurrent(request)) {
				for (const track of requestedStream.getTracks()) track.stop();
				return;
			}
			if (!requestedStream.getVideoTracks().some((track) => track.readyState === 'live')) {
				for (const track of requestedStream.getTracks()) track.stop();
				phase = 'idle';
				message = 'Screen sharing ended before it started. Your current selection is kept.';
				return;
			}
			stream = requestedStream;
			for (const track of stream.getVideoTracks()) {
				const listener = () => {
					if (!isCurrent(request)) return;
					stop();
					message = 'Screen sharing ended. Your current rune selection is kept.';
				};
				track.addEventListener('ended', listener);
				endedListeners.push({ track, listener });
			}
			previewWidth = 16;
			previewHeight = 9;
			previewKind = 'screen';
			phase = 'live';
			message = waitingMessage;
			await tick();
			if (!isCurrent(request)) return;
			if (!videoElement) throw new Error('The video preview is unavailable.');
			videoElement.srcObject = stream;
			await videoElement.play();
			if (!isCurrent(request)) return;
			void sampleFrame(request);
		} catch (error) {
			if (requestedStream) for (const track of requestedStream.getTracks()) track.stop();
			if (!isCurrent(request)) return;
			stop();
			const name = error instanceof Error ? error.name : '';
			message = name === 'NotAllowedError' || name === 'AbortError'
				? 'Screen sharing was canceled or not allowed. Try again or use a screenshot; your current selection is kept.'
				: 'The screen could not be shared. Try another window or use a screenshot; your current selection is kept.';
		}
	}

	async function readImage(file: File) {
		if (!file.type.startsWith('image/')) {
			message = 'Choose an image file, such as a PNG or JPEG screenshot.';
			return;
		}
		if (file.size > 32 * 1024 * 1024) {
			message = 'This image is too large to read. Choose a screenshot under 32 MB.';
			return;
		}
		const request = beginRequest();
		phase = 'image';
		message = 'Reading the screenshot in your browser…';
		try {
			const url = URL.createObjectURL(file);
			objectUrls.push(url);
			const image = new Image();
			image.src = url;
			await image.decode();
			if (!isCurrent(request)) return;
			if (image.naturalWidth * image.naturalHeight > 40_000_000) {
				URL.revokeObjectURL(url);
				objectUrls.length = 0;
				message = 'This image is too large to read. Choose a screenshot under 40 megapixels; your current selection is kept.';
				return;
			}
			imageUrl = url;
			previewWidth = image.naturalWidth;
			previewHeight = image.naturalHeight;
			previewKind = 'image';
			const detector = await getDetector();
			if (!isCurrent(request)) return;
			const result = detector.detect(image);
			const ids = result && validateRunestoneImport(result.ids);
			if (!result || !ids) {
				message = 'The screenshot does not show eight readable assigned runes. Include the full ring and center rune; your current selection is kept.';
				return;
			}
			bounds = result.bounds;
			ondetect(ids, 'image');
			if (isCurrent(request)) message = 'Eight runes read from the screenshot. The center rune is in slot 8.';
		} catch {
			if (isCurrent(request)) {
				message = 'The image could not be read. Try another screenshot; your current selection is kept.';
				if (!imageUrl) {
					for (const url of objectUrls) URL.revokeObjectURL(url);
					objectUrls.length = 0;
				}
			}
		} finally {
			if (isCurrent(request)) phase = 'idle';
		}
	}

	function chooseImage(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (file) void readImage(file);
	}

	function pasteImage(event: ClipboardEvent) {
		const item = Array.from(event.clipboardData?.items ?? []).find((item) => item.type.startsWith('image/'));
		const file = item?.getAsFile();
		if (!file) return;
		event.preventDefault();
		void readImage(file);
	}

	function dragOver(event: DragEvent) {
		if (!event.dataTransfer?.types.includes('Files')) return;
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';
		dragging = true;
	}

	function dragLeave(event: DragEvent) {
		if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) dragging = false;
	}

	function dropImage(event: DragEvent) {
		event.preventDefault();
		dragging = false;
		const file = event.dataTransfer?.files[0];
		if (file) void readImage(file);
	}

	onDestroy(() => {
		disposed = true;
		generation += 1;
		releaseResources();
	});
</script>

<svelte:window onpaste={pasteImage} />

<section aria-label="Read Runestone from a screen or screenshot" class="capture-section">
	<Card.Root>
		<Card.Header>
			<Card.Title><h2>Read runes from your screen</h2></Card.Title>
			<Card.Description>Show the full assigned rune ring. The center rune becomes slot 8 and receives the double-points bonus.</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4">
			<div class="capture-actions">
				<Button variant="outline" onclick={startSharing} disabled={phase === 'requesting' || phase === 'live'}><MonitorUpIcon data-icon="inline-start" />{phase === 'requesting' ? 'Choosing screen…' : 'Share game window'}</Button>
				<Button variant="outline" onclick={() => fileInput?.click()}><ImagePlusIcon data-icon="inline-start" /> Choose screenshot</Button>
				{#if phase !== 'idle'}<Button variant="ghost" onclick={stop}><SquareIcon data-icon="inline-start" />{phase === 'requesting' || phase === 'image' ? 'Cancel reading' : 'Stop sharing'}</Button>{/if}
				{#if phase === 'live'}<Badge variant="secondary">Live · checked every second</Badge>{/if}
			</div>
			<input bind:this={fileInput} type="file" accept="image/*" onchange={chooseImage} aria-label="Choose a Runestone screenshot" hidden />
			<div class={cn('screenshot-drop-zone', dragging && 'dragging')} role="region" aria-label="Screenshot drop area" ondragover={dragOver} ondragleave={dragLeave} ondrop={dropImage}>
				<p>Paste an image or drop a screenshot here.</p>
				<p class="capture-help">While rolling, the left “New Runestone Effects” panel is read. You can move the game panel; keep the entire ring visible and unobscured. Screen reads apply after two matching frames. Editing a rune stops live reading.</p>
			</div>
			<p class="capture-status" role="status" aria-atomic="true">{message}</p>
			{#if previewKind}
				<div class="capture-preview" aria-label={previewKind === 'screen' ? 'Shared screen preview' : 'Screenshot preview'}>
					<div class="preview-media" style:width={`min(100%, ${280 * previewWidth / previewHeight}px)`} style:aspect-ratio={`${previewWidth} / ${previewHeight}`}>
						{#if previewKind === 'screen'}
							<video bind:this={videoElement} autoplay muted playsinline aria-label="Shared game window"></video>
						{:else}
							<img src={imageUrl} alt="Selected Runestone screenshot" />
						{/if}
						{#if bounds}
							<div class="detected-ring" aria-label="Detected rune ring" role="img" style:left={`${bounds.x / previewWidth * 100}%`} style:top={`${bounds.y / previewHeight * 100}%`} style:width={`${bounds.width / previewWidth * 100}%`} style:height={`${bounds.height / previewHeight * 100}%`}></div>
						{/if}
					</div>
				</div>
			{/if}
		</Card.Content>
		<Card.Footer><p class="privacy-note">Images and shared video are processed in your browser. Nothing is uploaded. Unclear readings keep your current selection.</p></Card.Footer>
	</Card.Root>
</section>

<style>
	.capture-section { width: 100%; min-width: 0; }
	.capture-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
	.screenshot-drop-zone { display: flex; flex-direction: column; gap: 6px; padding: 13px 15px; border: 1px dashed var(--border); border-radius: 8px; font-size: 12px; line-height: 1.7; }
	.screenshot-drop-zone.dragging { background: var(--route-soft); border-color: var(--route-accent); }
	.capture-help, .privacy-note { color: var(--muted-foreground); font-size: 11px; line-height: 1.7; }
	.capture-status { font-size: 12px; line-height: 1.7; }
	.capture-preview { display: flex; width: 100%; min-width: 0; justify-content: center; overflow: hidden; border: 1px solid var(--border); border-radius: 8px; background: var(--muted); }
	.preview-media { position: relative; min-width: 0; max-width: 100%; max-height: 280px; }
	.preview-media video, .preview-media img { display: block; width: 100%; height: 100%; object-fit: contain; }
	.detected-ring { position: absolute; pointer-events: none; border: 2px solid var(--route-accent); border-radius: 8px; box-shadow: 0 0 0 1px var(--card); }
</style>
