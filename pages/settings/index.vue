<script setup lang="ts">
import { ref } from 'vue'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

definePageMeta({
  layout: 'settings',
})

const formData = ref({
  name: 'John Doe',
  email: 'john.doe@example.com',
  bio: 'Software developer passionate about open source',
  location: 'San Francisco, CA',
  website: 'https://johndoe.dev',
  company: 'Acme Corp',
  publicProfile: true,
})

const handleInputChange = (field: string, value: any) => {
  formData.value = { ...formData.value, [field]: value }
}
</script>

<template>
  <div>
    <div>
      <h2 class="text-2xl font-bold tracking-tight">Public profile</h2>
      <p class="text-muted-foreground mt-2">
        This information will be displayed publicly so be careful what you share.
      </p>
    </div>

    <Separator class="my-6" />

    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <Label for="name">Name</Label>
          <Input
            id="name"
            :model-value="formData.name"
            @update:model-value="(value) => handleInputChange('name', value)"
            placeholder="Your full name"
          />
        </div>
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            type="email"
            :model-value="formData.email"
            @update:model-value="(value) => handleInputChange('email', value)"
            placeholder="your.email@example.com"
          />
        </div>
      </div>

      <div class="space-y-2">
        <Label for="bio">Bio</Label>
        <Textarea
          id="bio"
          :model-value="formData.bio"
          @update:model-value="(value) => handleInputChange('bio', value)"
          placeholder="Tell us a little bit about yourself"
          rows="3"
        />
        <p class="text-sm text-muted-foreground">
          Brief description for your profile. URLs are hyperlinked.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <Label for="location">Location</Label>
          <Input
            id="location"
            :model-value="formData.location"
            @update:model-value="(value) => handleInputChange('location', value)"
            placeholder="City, Country"
          />
        </div>
        <div class="space-y-2">
          <Label for="website">Website</Label>
          <Input
            id="website"
            :model-value="formData.website"
            @update:model-value="(value) => handleInputChange('website', value)"
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>

      <div class="space-y-2">
        <Label for="company">Company</Label>
        <Input
          id="company"
          :model-value="formData.company"
          @update:model-value="(value) => handleInputChange('company', value)"
          placeholder="Your company or organization"
        />
      </div>

      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <Label>Public profile</Label>
          <p class="text-sm text-muted-foreground">
            Make your profile visible to everyone
          </p>
        </div>
        <Switch
          :checked="formData.publicProfile"
          @update:checked="(checked) => handleInputChange('publicProfile', checked)"
        />
      </div>

      <Separator />

      <div class="flex justify-end space-x-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save changes</Button>
      </div>
    </div>
  </div>
</template>
