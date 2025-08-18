<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { toast } from 'vue-sonner';
import { Plus, Sparkles } from 'lucide-vue-next';

const props = defineProps({
  isLoadingEntry: { type: Boolean, default: false },
  isEnhancingDetails: { type: Boolean, default: false },
});

const addSymbol = () => {
  toast.info('Add Symbol button clicked!');
};

const detectSymbols = () => {
  toast.info('Detect Symbols button clicked!');
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Symbols</h2>
    </div>
    <div class="flex flex-col sm:flex-row gap-2 justify-center">
      <Button
        variant="ghost"
        class="border w-full sm:w-auto text-blue-200"
        @click="addSymbol"
        :disabled="props.isLoadingEntry || props.isEnhancingDetails"
      >
        <Plus class="w-4 h-4" /> Add Symbol
      </Button>
      <Button
        variant="ghost"
        class="border w-full sm:w-auto"
        @click="detectSymbols"
        :disabled="props.isLoadingEntry || props.isEnhancingDetails"
      >
        <Sparkles class="w-4 h-4" stroke="url(#sparkle-gradient)" /> <span class="bg-gradient-to-r from-[#a78bfa] to-[#60a5fa] text-transparent bg-clip-text"> Detect Symbols</span>
      </Button>
    </div>
  </div>
</template>
