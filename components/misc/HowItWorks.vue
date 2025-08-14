<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useWindowSize } from '@vueuse/core'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { width: windowWidth } = useWindowSize()
let resizeObserver: ResizeObserver | null = null

const drawArcs = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const circleContainer = canvas.parentElement // Get the parent div (circle-container)
  if (!circleContainer) return

  // Set canvas dimensions to match its parent container
  canvas.width = circleContainer.offsetWidth
  canvas.height = circleContainer.offsetHeight

  // Clear the canvas before redrawing
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Hide arcs on mobile
  if (windowWidth.value < 768) {
    return
  }

  // Get primary color from CSS variable
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()
  ctx.strokeStyle = primaryColor || '#000000' // Fallback to black if not found
  ctx.lineWidth = 2

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2

  // Calculate scaling factor based on the original SVG viewBox (500x500)
  // and the current smaller dimension of the canvas
  const originalSvgSize = 500
  const scale = Math.min(canvas.width, canvas.height) / originalSvgSize

  const arcRadius = 165 * scale // Scale the original arc radius

  // Angles for the arcs (in radians, expressed as degrees * Math.PI / 180 for easier modification)
  // Arc 1: Top-right
  const arc1StartAngle = -74 * Math.PI / 180
  const arc1EndAngle = -30 * Math.PI / 180

  // Arc 2: Bottom-right
  const arc2StartAngle = 30 * Math.PI / 180
  const arc2EndAngle = 75 * Math.PI / 180

  // Arc 3: Bottom-left
  const arc3StartAngle = 106 * Math.PI / 180
  const arc3EndAngle = 154.62 * Math.PI / 180

  // Arc 4: Top-left
  const arc4StartAngle = -150 * Math.PI / 180
  const arc4EndAngle = -105 * Math.PI / 180

  // Helper function to draw an arrowhead
  const drawArrowhead = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    const arrowSize = 10; // Size of the arrowhead
    ctx.save(); // Save the current state of the canvas
    ctx.beginPath();
    ctx.translate(x, y); // Move to the tip of the arrow
    ctx.rotate(angle); // Rotate to the direction of the arrow

    // Draw the arrowhead (a simple triangle)
    ctx.moveTo(0, 0); // Tip of the arrow
    ctx.lineTo(-arrowSize, arrowSize / 2);
    ctx.lineTo(-arrowSize, -arrowSize / 2);
    ctx.closePath();
    ctx.fill(); // Fill the arrowhead
    ctx.restore(); // Restore the canvas state
  };

  // Set fill style for arrowheads
  ctx.fillStyle = primaryColor;

  // Draw arcs and arrowheads
  // Arc 1
  ctx.beginPath();
  ctx.arc(centerX, centerY, arcRadius, arc1StartAngle, arc1EndAngle, false); // false for clockwise
  ctx.stroke();
  const arc1EndX = centerX + arcRadius * Math.cos(arc1EndAngle);
  const arc1EndY = centerY + arcRadius * Math.sin(arc1EndAngle);
  drawArrowhead(ctx, arc1EndX, arc1EndY, arc1EndAngle + Math.PI / 2);

  // Arc 2
  ctx.beginPath();
  ctx.arc(centerX, centerY, arcRadius, arc2StartAngle, arc2EndAngle, false);
  ctx.stroke();
  const arc2EndX = centerX + arcRadius * Math.cos(arc2EndAngle);
  const arc2EndY = centerY + arcRadius * Math.sin(arc2EndAngle);
  drawArrowhead(ctx, arc2EndX, arc2EndY, arc2EndAngle + Math.PI / 2);

  // Arc 3
  ctx.beginPath();
  ctx.arc(centerX, centerY, arcRadius, arc3StartAngle, arc3EndAngle, false);
  ctx.stroke();
  const arc3EndX = centerX + arcRadius * Math.cos(arc3EndAngle);
  const arc3EndY = centerY + arcRadius * Math.sin(arc3EndAngle);
  drawArrowhead(ctx, arc3EndX, arc3EndY, arc3EndAngle + Math.PI / 2);

  // Arc 4
  ctx.beginPath();
  ctx.arc(centerX, centerY, arcRadius, arc4StartAngle, arc4EndAngle, false);
  ctx.stroke();
  const arc4EndX = centerX + arcRadius * Math.cos(arc4EndAngle);
  const arc4EndY = centerY + arcRadius * Math.sin(arc4EndAngle);
  drawArrowhead(ctx, arc4EndX, arc4EndY, arc4EndAngle + Math.PI / 2);
}

onMounted(() => {
  drawArcs()
  // Observe changes to the circle-container's size
  const circleContainer = canvasRef.value?.parentElement
  if (circleContainer) {
    resizeObserver = new ResizeObserver(drawArcs)
    resizeObserver.observe(circleContainer)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

// Watch for window width changes to hide/show arcs on mobile
watch(windowWidth, () => {
  drawArcs()
})
</script>

<template>
  <section class="w-full py-8 md:py-20 lg:py-26">
    <div class="container mx-auto px-4 md:px-6">
      <h2 class="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl mb-4">
        How It Works
      </h2>
      <p class="mx-auto max-w-[700px] text-muted-foreground md:text-xl text-center">
        An upward spiral to self-realization
      </p>
      <div class="relative flex items-center justify-center w-full">
        <div class="circle-container w-full h-full max-w-[500px] md:max-w-[600px] md:max-h-[600px] lg:max-w-[700px] lg:max-h-[700px]">
          <!-- Connecting Arcs (Canvas) -->
          <canvas ref="canvasRef" class="absolute inset-0 w-full h-full"></canvas>

          <div class="circle-item item-1 flex flex-col items-center text-center p-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mb-2">
              1
            </div>
            <h3 class="text-lg font-semibold mb-1">Dream</h3>
            <p class="text-sm text-muted-foreground max-w-[150px] mx-auto">Engage with your dreams to explore your unconscious.</p>
          </div>
          <div class="circle-item item-2 flex flex-col items-center text-center p-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mb-2">
              2
            </div>
            <h3 class="text-lg font-semibold mb-1">Journal</h3>
            <p class="text-sm text-muted-foreground max-w-[150px] mx-auto">Record and organize your dream experiences.</p>
          </div>
          <div class="circle-item item-3 flex flex-col items-center text-center p-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mb-2">
              3
            </div>
            <h3 class="text-lg font-semibold mb-1">Analysis</h3>
            <p class="text-sm text-muted-foreground max-w-[150px] mx-auto">Gain insights into dreams with AI interpretation.</p>
          </div>
          <div class="circle-item item-4 flex flex-col items-center text-center p-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mb-2">
              4
            </div>
            <h3 class="text-lg font-semibold mb-1">Integrate</h3>
            <p class="text-sm text-muted-foreground max-w-[150px] mx-auto">Apply dream insights for personal growth.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.circle-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px; /* Added padding to prevent overflow */
}

.circle-item {
  position: absolute;
  height: auto;
  transform-origin: center center;
  width: 180px; /* Fixed width for items to control spacing */
}

/* Positioning for desktop/larger screens */
@media (min-width: 768px) {
  .circle-container {
    width: 600px; /* Diameter of the circle */
    height: 600px;
  }

  .circle-item {
    width: 180px; /* Consistent width for items */
  }

  .item-1 {
    top: 50px; /* Adjusted */
    left: 50%;
    transform: translateX(-50%);
  }

  .item-2 {
    top: calc(50%);
    left: calc(100% - 200px); /* Adjusted */
    transform: translateY(-50%);
  }

  .item-3 {
    top: calc(100% - 170px); /* Adjusted */
    left: 50%;
    transform: translateX(-50%);
  }

  .item-4 {
    top: calc(50% - 4px); /* Adjusted */
    left: 20px; /* Adjusted */
    transform: translateY(-50%);
  }
}

/* Positioning for mobile/smaller screens (stacked vertically) */
@media (max-width: 767px) {
  .circle-container {
    flex-direction: column;
    gap: 2rem; /* Space between stacked items */
    height: auto;
    padding: 20px; /* Padding for mobile */
  }

  .circle-item {
    position: relative;
    width: 90%; /* Full width for mobile items */
    transform: none;
  }
}
</style>