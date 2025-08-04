<script setup lang="ts">
import { ref } from 'vue'
import { Bot, Zap, Activity } from 'lucide-vue-next'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

definePageMeta({
  layout: 'settings',
})

const formData = ref({
  aiEnabled: true,
  aiModel: 'gpt-4',
  aiSuggestions: true,
  aiCodeReview: false,
})

const handleInputChange = (field: string, value: any) => {
  formData.value = { ...formData.value, [field]: value }
}
</script>

<template>
  <div>
    <div>
      <h2 class="text-2xl font-bold tracking-tight">AI Features</h2>
      <p class="text-muted-foreground mt-2">
        Configure AI-powered features to enhance your development workflow.
      </p>
    </div>

    <Separator class="my-6" />

    <div class="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Bot class="h-5 w-5" />
            AI Assistant
            <Badge variant="secondary">Beta</Badge>
          </CardTitle>
          <CardDescription>
            Enable AI-powered code suggestions and assistance
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <Label>Enable AI Assistant</Label>
              <p class="text-sm text-muted-foreground">
                Get intelligent code suggestions and explanations
              </p>
            </div>
            <Switch
              :checked="formData.aiEnabled"
              @update:checked="(checked) => handleInputChange('aiEnabled', checked)"
            />
          </div>

          <template v-if="formData.aiEnabled">
            <Separator />
            <div class="space-y-2">
              <Label>AI Model</Label>
              <Select
                :model-value="formData.aiModel"
                @update:model-value="(value) => handleInputChange('aiModel', value)"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                  <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                  <SelectItem value="codellama">Code Llama</SelectItem>
                </SelectContent>
              </Select>
              <p class="text-sm text-muted-foreground">
                Choose the AI model that best fits your needs
              </p>
            </div>
          </template>
        </CardContent>
      </Card>

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
                Get real-time code completion and suggestions
              </p>
            </div>
            <Switch
              :checked="formData.aiSuggestions"
              @update:checked="(checked) => handleInputChange('aiSuggestions', checked)"
              :disabled="!formData.aiEnabled"
            />
          </div>

          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <Label>AI Code Review</Label>
              <p class="text-sm text-muted-foreground">
                Automatically review pull requests for potential issues
              </p>
            </div>
            <Switch
              :checked="formData.aiCodeReview"
              @update:checked="(checked) => handleInputChange('aiCodeReview', checked)"
              :disabled="!formData.aiEnabled"
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
      </Card>

      <Separator />

      <div class="flex justify-end space-x-2">
        <Button variant="outline">Reset to defaults</Button>
        <Button>Save AI settings</Button>
      </div>
    </div>
  </div>
</template>
