<template>
  <Popover>
    <PopoverTrigger as-child>
      <span
        v-if="variant === 'plain'"
        :class="cn(
          'inline-flex items-center gap-2 text-sm text-muted-foreground mb-4 cursor-pointer px-2 py-1 rounded-md hover:bg-accent',
        )"
      >
        <CalendarIcon class="h-4 w-4 translate-y-[-1px]" />
        {{ formattedDate || '' }}
      </span>
      <Button
        v-else
        variant="outline"
        :class="cn(
          'w-[280px] justify-start text-left font-normal',
          !date && 'text-muted-foreground',
        )"
      >
        <CalendarIcon class="mr-2 h-4 w-4 translate-y-[-1px]" />
        {{ formattedDate || "Pick a date" }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0" align="start">
      <Calendar v-model="date" />
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { DateFormatter, getLocalTimeZone, parseDate, CalendarDate } from '@internationalized/date'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn, formatDate } from '@/lib/utils'

const props = defineProps({
  variant: { type: String, default: 'default' },
  modelValue: { type: [Date, String], default: null },
});

const emit = defineEmits(['update:modelValue']);

const date = ref();

const parseAndSetDate = (val: Date | string | null) => {
  if (val instanceof Date) {
    // Convert native Date to CalendarDate
    date.value = new CalendarDate(val.getFullYear(), val.getMonth() + 1, val.getDate());
  } else if (typeof val === 'string') {
    try {
      // parseDate can handle YYYY-MM-DD directly
      date.value = parseDate(val);
    } catch (e) {
      console.error("Error parsing date string:", e);
      date.value = null;
    }
  } else {
    date.value = null;
  }
};

// Initialize date
parseAndSetDate(props.modelValue);

watch(date, (newVal) => {
  if (newVal) {
    emit('update:modelValue', newVal.toString());
  } else {
    emit('update:modelValue', null);
  }
});

watch(() => props.modelValue, (newVal) => {
  parseAndSetDate(newVal);
});

const formattedDate = computed(() => {
  return date.value ? formatDate(date.value.toDate(getLocalTimeZone()).toISOString()) : '';
});
</script>