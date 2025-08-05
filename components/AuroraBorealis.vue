<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const containerRef = ref<HTMLDivElement | null>(null);
let animationFrame: number;
let time = 0;

const animateAurora = () => {
  time += 0.005;

  if (containerRef.value) {
    const aurora1 = containerRef.value.querySelector('.aurora-1') as HTMLElement;
    const aurora2 = containerRef.value.querySelector('.aurora-2') as HTMLElement;
    const aurora3 = containerRef.value.querySelector('.aurora-3') as HTMLElement;

    if (aurora1) {
      aurora1.style.transform = `translateX(${Math.sin(time) * 100}px) translateY(${Math.cos(time * 0.7) * 50}px) rotate(${Math.sin(time * 0.5) * 10}deg)`;
      aurora1.style.opacity = `${0.3 + Math.sin(time * 0.8) * 0.2}`;
    }

    if (aurora2) {
      aurora2.style.transform = `translateX(${Math.cos(time * 0.8) * 120}px) translateY(${Math.sin(time * 0.6) * 60}px) rotate(${Math.cos(time * 0.4) * 15}deg)`;
      aurora2.style.opacity = `${0.25 + Math.cos(time * 0.9) * 0.15}`;
    }

    if (aurora3) {
      aurora3.style.transform = `translateX(${Math.sin(time * 0.6) * 80}px) translateY(${Math.cos(time * 0.9) * 40}px) rotate(${Math.sin(time * 0.3) * 8}deg)`;
      aurora3.style.opacity = `${0.2 + Math.sin(time * 1.1) * 0.1}`;
    }
  }

  animationFrame = requestAnimationFrame(animateAurora);
};

onMounted(() => {
  animationFrame = requestAnimationFrame(animateAurora);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame);
});
</script>

<template>
  <div
    class="fixed inset-0 w-full h-full overflow-hidden"
    :style="{
      background: `
        radial-gradient(ellipse at top, #1a0b2e 0%, #16213e 25%, #0f3460 50%, #16213e 75%, #1a0b2e 100%),
        radial-gradient(circle at 20% 80%, #2c1810 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, #421a52 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, #1a0b2e 0%, transparent 50%)
      `,
    }"
  >
    <!-- Stars -->
    <div class="absolute inset-0">
      <div
        v-for="i in 150"
        :key="i"
        class="absolute bg-white rounded-full animate-pulse"
        :style="{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${Math.random() * 2 + 0.5}px`,
          height: `${Math.random() * 2 + 0.5}px`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${Math.random() * 2 + 2}s`,
          opacity: Math.random() * 0.8 + 0.2,
        }"
      />
    </div>

    <!-- Aurora layers -->
    <div ref="containerRef" class="absolute inset-0">
      <!-- Aurora layer 1 -->
      <div
        class="aurora-1 absolute w-full h-96 top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style="
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(139, 69, 19, 0.3) 20%,
            rgba(147, 51, 234, 0.4) 40%,
            rgba(59, 130, 246, 0.5) 60%,
            rgba(147, 51, 234, 0.4) 80%,
            transparent 100%
          );
          filter: blur(40px);
          border-radius: 50%;
          transform: rotate(-15deg);
        "
      />

      <!-- Aurora layer 2 -->
      <div
        class="aurora-2 absolute w-4/5 h-80 top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style="
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(236, 72, 153, 0.3) 25%,
            rgba(139, 69, 19, 0.4) 50%,
            rgba(59, 130, 246, 0.3) 75%,
            transparent 100%
          );
          filter: blur(35px);
          border-radius: 50%;
          transform: rotate(10deg);
        "
      />

      <!-- Aurora layer 3 -->
      <div
        class="aurora-3 absolute w-3/4 h-72 top-2/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style="
          background: linear-gradient(
            60deg,
            transparent 0%,
            rgba(59, 130, 246, 0.2) 30%,
            rgba(147, 51, 234, 0.3) 50%,
            rgba(236, 72, 153, 0.2) 70%,
            transparent 100%
          );
          filter: blur(30px);
          border-radius: 50%;
          transform: rotate(25deg);
        "
      />

      <!-- Additional subtle aurora wisps -->
      <div
        class="absolute w-1/2 h-40 top-1/5 left-1/4"
        style="
          background: radial-gradient(
            ellipse,
            rgba(147, 51, 234, 0.2) 0%,
            rgba(59, 130, 246, 0.1) 50%,
            transparent 100%
          );
          filter: blur(25px);
          animation: float 8s ease-in-out infinite;
        "
      />

      <div
        class="absolute w-1/3 h-32 top-1/6 right-1/4"
        style="
          background: radial-gradient(
            ellipse,
            rgba(236, 72, 153, 0.15) 0%,
            rgba(139, 69, 19, 0.1) 50%,
            transparent 100%
          );
          filter: blur(20px);
          animation: float 6s ease-in-out infinite reverse;
        "
      />
    </div>

    </div>
</template>

<style scoped>
  @keyframes float {
    0%, 100% {
      transform: translateY(0px) translateX(0px);
    }
    33% {
      transform: translateY(-20px) translateX(10px);
    }
    66% {
      transform: translateY(10px) translateX(-15px);
    }
  }
</style>
