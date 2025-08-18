<script setup lang="ts">
import { ref } from 'vue'
import { Sparkle } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'vue-sonner'; // Import toast

const props = defineProps<{ journalId: number, journalContent: string }>();
const emit = defineEmits(['save', 'cancel']);

const selectedType = ref('jungian');
const selectedDepth = ref('to-the-point');
const content = ref('');

const handleGenerateAIAnalysis = () => {
  const wordCount = props.journalContent.trim().split(/\s+/).filter(word => word.length > 0).length;
  if (wordCount < 3) {
    toast.error("Content must have at least 3 words to generate AI analysis.");
    return;
  }

  emit('generate-ai-analysis', {
    journal_id: props.journalId,
    type: selectedType.value,
    depth: selectedDepth.value,
    content: content.value,
  });
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <Card class="bg-transparent text-card-foreground flex flex-col gap-6 rounded-xl shadow-sm border-dashed border-2 border-muted-foreground/30">
    <CardHeader class="space-y-3">
      <div class="flex items-center gap-2">
        <Sparkle class="h-4 w-4" stroke="url(#sparkle-gradient)" aria-hidden="true" />
        <span class="text-sm font-medium bg-gradient-to-r from-[#a78bfa] to-[#60a5fa] text-transparent bg-clip-text">New AI Analysis</span>
      </div>
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <Label for="type">Type:</Label>
          <Select v-model="selectedType">
            <SelectTrigger id="type">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jungian">Jungian</SelectItem>
              <SelectItem value="symbolic">Symbolic</SelectItem>
              <SelectItem value="narrative">Narrative</SelectItem>
              <SelectItem value="cognitive-behavioral">Cognitive Behavioral</SelectItem>
              <SelectItem value="psychodynamic">Psychodynamic</SelectItem>
              <SelectItem value="humanistic">Humanistic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <Label for="depth">Depth:</Label>
          <Select v-model="selectedDepth">
            <SelectTrigger id="depth">
              <SelectValue placeholder="Select a depth" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="to-the-point">To The Point</SelectItem>
              <SelectItem value="details">Details</SelectItem>
              <SelectItem value="in-depth">In-Depth</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <textarea
        v-model="content"
        class="placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content w-full rounded-md border bg-card px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm min-h-[100px]"
        placeholder="Is there anything else you'd like to tell the AI before generating the analysis?"
      ></textarea>
      <div class="flex flex-wrap gap-2">
        <Button variant="ghost" class="border h-8 w-full sm:w-auto" @click="handleGenerateAIAnalysis"><Sparkle class="h-4 w-4" stroke="url(#sparkle-gradient)" aria-hidden="true" /><span class="bg-gradient-to-r from-[#a78bfa] to-[#60a5fa] text-transparent bg-clip-text">Generate AI Analysis</span></Button>
        <Button variant="ghost" class="h-8 w-full sm:w-auto" @click="handleCancel">Cancel</Button>
      </div>
    </CardHeader>
  </Card>
</template>
