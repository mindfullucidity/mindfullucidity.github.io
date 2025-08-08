<script setup lang="ts">
import { ref } from 'vue'
import { useCookie } from '#app'
import { Bot, Zap, Activity } from 'lucide-vue-next'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'settings',
})

const settingsCookie = useCookie('settings', {
  default: () => ({
    ai: {
      enabled: false,
      provider: 'google-gemini',
      model: 'gemini-2.5-flash',
      apiKey: '',
      suggestions: true,
      codeReview: false,
      customAiModelPopulated: false,
    },
  }),
})

const aiEnabled = ref(settingsCookie.value.ai.enabled)
const aiProvider = ref(settingsCookie.value.ai.provider)
const aiModel = ref(settingsCookie.value.ai.model)
const aiApiKey = ref(settingsCookie.value.ai.apiKey)
const aiSuggestions = ref(settingsCookie.value.ai.suggestions)
const aiCodeReview = ref(settingsCookie.value.ai.codeReview)

const customAiModelPopulated = computed(() => {
  return aiApiKey.value !== '' && aiProvider.value !== '' && aiModel.value !== ''
})

watch(aiEnabled, (newValue) => {
  settingsCookie.value = { ...settingsCookie.value, ai: { ...settingsCookie.value.ai, enabled: newValue } }
})
watch(aiProvider, (newValue) => {
  settingsCookie.value = { ...settingsCookie.value, ai: { ...settingsCookie.value.ai, provider: newValue } }
})
watch(aiModel, (newValue) => {
  settingsCookie.value = { ...settingsCookie.value, ai: { ...settingsCookie.value.ai, model: newValue } }
})
watch(aiApiKey, (newValue) => {
  settingsCookie.value = { ...settingsCookie.value, ai: { ...settingsCookie.value.ai, apiKey: newValue } }
})
watch(aiSuggestions, (newValue) => {
  settingsCookie.value = { ...settingsCookie.value, ai: { ...settingsCookie.value.ai, suggestions: newValue } }
})
watch(aiCodeReview, (newValue) => {
  settingsCookie.value = { ...settingsCookie.value, ai: { ...settingsCookie.value.ai, codeReview: newValue } }
})
watch(customAiModelPopulated, (newValue) => {
  settingsCookie.value = { ...settingsCookie.value, ai: { ...settingsCookie.value.ai, customAiModelPopulated: newValue } }
})

function resetToDefaults() {
  settingsCookie.value = {
    ...settingsCookie.value,
    ai: {
      enabled: true,
      provider: 'google-gemini',
      model: 'gemini-2.5-flash',
      apiKey: '',
      suggestions: true,
      codeReview: false,
      customAiModelPopulated: false,
    },
  }
  aiEnabled.value = settingsCookie.value.ai.enabled
  aiProvider.value = settingsCookie.value.ai.provider
  aiModel.value = settingsCookie.value.ai.model
  aiApiKey.value = settingsCookie.value.ai.apiKey
  aiSuggestions.value = settingsCookie.value.ai.suggestions
  aiCodeReview.value = settingsCookie.value.ai.codeReview
}

</script>

<template>
  <div>
    <div>
      <h2 class="text-2xl font-bold tracking-tight">AI Features</h2>
      <p class="text-muted-foreground mt-2">
        Configure AI-powered features to enhance your dream journal.
      </p>
    </div>

    <Separator class="my-6" />

    <div class="space-y-6">
      <Card class="w-full">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 ">
            <Bot class="h-5 w-5" />
            AI Assistant
          </CardTitle>
          <CardDescription>
            Unlock deeper insights into your dreams with AI-powered analysis.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <Label>Custom AI Model</Label>
              <p class="text-sm text-muted-foreground">
                Connect your own AI model for unlimited access!
              </p>
            </div>
            <Switch
              :model-value="aiEnabled"
              @update:model-value="aiEnabled = $event"
            />
          </div>

          <template v-if="aiEnabled">
            <Separator />
            <div class="space-y-0.5">
              <h5>AI Model</h5>
              <p  class="text-sm text-muted-foreground mt-0">Select the AI model that best suits your analytical needs.</p>
            </div>
            <div class="flex items-center">
              <Label for="ai-provider" class="mr-5">Provider:</Label>
              <Select
                id="ai-provider"
                v-model="aiProvider"
                class="w-[200px]"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google-gemini">Google Gemini (Recommended)</SelectItem>
                  <!-- <SelectItem value="openai">OpenAI</SelectItem> -->
                </SelectContent>
              </Select>
            </div>

            <div class="flex items-center">
              <Label for="ai-model" class="mr-5">Model:</Label>
              <Select
                id="ai-model"
                v-model="aiModel"
                class="w-[200px]"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <template v-if="aiProvider === 'google-gemini'">
                    <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                    <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                  </template>
                  <template v-else-if="aiProvider === 'openai'">
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  </template>
                </SelectContent>
              </Select>
            </div>

            <div class="flex items-center justify-between">
                            <Label for="api-key" class="whitespace-nowrap mr-5">API Key: </Label>
              <Input id="api-key" v-model="aiApiKey" type="password" placeholder="Enter your API key" class="flex-grow" />
            </div>
            <p v-if="!customAiModelPopulated" class="text-red-500 text-sm mt-2">To enable your custom AI model, please ensure all fields are filled out.</p>
          </template>
        </CardContent>
      </Card>
<!-- 
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Zap class="h-5 w-5" />
            Smart Features
          </CardTitle>
          <CardDescription>
            Configure specific AI-powered development tools
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <Label>Code Suggestions</Label>
              <p class="text-sm text-muted-foreground">
                Receive intelligent suggestions to enrich your dream entries.
              </p>
            </div>
            <Switch
              :model-value="aiSuggestions"
              @update:model-value="aiSuggestions = $event"
              :disabled="!aiEnabled"
            />
          </div>

          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <Label>AI Code Review</Label>
              <p class="text-sm text-muted-foreground">
                Automatically analyze your dream patterns and recurring themes.
              </p>
            </div>
            <Switch
              :model-value="aiCodeReview"
              @update:model-value="aiCodeReview = $event"
              :disabled="!aiEnabled"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Activity class="h-5 w-5" />
            Usage & Analytics
          </CardTitle>
          <CardDescription>
            Monitor your AI feature usage and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center p-4 bg-muted rounded-lg">
              <div class="text-2xl font-bold text-primary">1,247</div>
              <div class="text-sm text-muted-foreground">Suggestions Used</div>
            </div>
            <div class="text-center p-4 bg-muted rounded-lg">
              <div class="text-2xl font-bold text-primary">89%</div>
              <div class="text-sm text-muted-foreground">Acceptance Rate</div>
            </div>
            <div class="text-center p-4 bg-muted rounded-lg">
              <div class="text-2xl font-bold text-primary">2.3h</div>
              <div class="text-sm text-muted-foreground">Time Saved</div>
            </div>
          </div>
        </CardContent>
      </Card> -->

    </div>
  </div>
</template>
