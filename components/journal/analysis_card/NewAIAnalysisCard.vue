<script setup lang="ts">
import { ref } from 'vue'
import { Sparkle } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const selectedType = ref('jungian')
</script>

<template>
  <Card class="bg-transparent text-card-foreground flex flex-col gap-6 rounded-xl shadow-sm border-dashed border-2 border-muted-foreground/30">
    <CardHeader class="space-y-3">
      <div class="flex items-center gap-2">
        <Sparkle class="h-4 w-4" stroke="url(#sparkle-gradient)" aria-hidden="true" />
        <span class="text-sm font-medium bg-gradient-to-r from-[#a78bfa] to-[#60a5fa] text-transparent bg-clip-text">New AI Analysis</span>
      </div>
      <div class="flex items-center gap-2">
        <Label for="type">Type:</Label>
        <Select v-model="selectedType">
          <SelectTrigger id="type">
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jungian">Jungian</SelectItem>
            <SelectItem value="symbolic">Symbolic</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <textarea
        class="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content w-full rounded-md border bg-card px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm min-h-[100px]"
        placeholder="Is there anything else you'd like to tell the AI before generating the analysis?"
      ></textarea>
      <div class="flex gap-2">
        <Button variant="outline" class="h-8">Generate Analysis</Button>
        <Button variant="ghost" class="h-8">Cancel</Button>
      </div>
    </CardHeader>
  </Card>
</template>
