<script setup lang="ts">
</script>

<template>
  <section class="w-full pb-34 pt-12 md:pt-24 lg:pt-32">
    <div class="container mx-auto px-4 md:px-6">
      <h2 class="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl mb-4">
        How It Works
      </h2>
      <p class="mx-auto max-w-[700px] text-muted-foreground md:text-xl text-center mb-8">
        An upward spiral to self-realization
      </p>
      <div class="relative flex items-center justify-center w-full h-[500px] mt-30 sm:mt-24 md:mt-0">
        <div class="circle-container w-full h-full max-w-[500px] max-h-[500px] md:max-w-[600px] md:max-h-[600px] lg:max-w-[700px] lg:max-h-[700px]">
          <!-- Connecting Arcs (SVG) -->
          <svg class="absolute inset-0 w-full h-full" viewBox="0 0 500 500">
            <path d="M 320 100 A 165 165 0 0 1 400 180" fill="none" stroke="var(--primary)" stroke-width="2" />
            <path d="M 400 320 A 165 165 0 0 1 320 400" fill="none" stroke="var(--primary)" stroke-width="2" />
            <path d="M 180 400 A 165 165 0 0 1 100 320" fill="none" stroke="var(--primary)" stroke-width="2" />
            <path d="M 100 180 A 165 165 0 0 1 180 100" fill="none" stroke="var(--primary)" stroke-width="2" />
          </svg>

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

  svg {
    display: none; /* Hide SVG lines on mobile */
  }
}
</style>