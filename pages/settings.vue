<script setup lang="ts">
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/settings',
  },
  {
    title: 'Account',
    href: '/settings/account',
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
  },
  {
    title: 'Display',
    href: '/settings/display',
  },
]
</script>

<template>
  <div class="hidden space-y-6 p-10 pt-20 pb-16 md:block">
    <div class="space-y-0.5">
      <h2 class="text-2xl font-bold tracking-tight">
        Settings
      </h2>
      <p class="text-muted-foreground">
        Manage your account settings and set e-mail preferences.
      </p>
    </div>
    <Separator class="my-6" />
    <div class="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
      <aside class="lg:w-1/5">
        <nav class="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
          <Button
            v-for="item in sidebarNavItems"
            :key="item.title"
            as="a"
            :href="item.href"
            variant="ghost"
            :class="cn(
              'w-full text-left justify-start',
              $route.path === item.href && 'bg-muted hover:bg-muted',
            )"
          >
            {{ item.title }}
          </Button>
        </nav>
      </aside>
      <div class="flex-1 lg:max-w-2xl">
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-medium">
              Profile
            </h3>
            <p class="text-sm text-muted-foreground">
              This is how others will see you on the site.
            </p>
          </div>
          <Separator />
          <form class="space-y-8">
            <div class="space-y-2">
              <Label for="username">Username</Label>
              <Input id="username" type="text" placeholder="shadcn" />
              <p class="text-sm text-muted-foreground">
                This is your public display name. It can be your real name or a pseudonym. You can only change this once every 30 days.
              </p>
            </div>
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select an email" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m@example.com">
                    m@example.com
                  </SelectItem>
                  <SelectItem value="m@google.com">
                    m@google.com
                  </SelectItem>
                  <SelectItem value="m@support.com">
                    m@support.com
                  </SelectItem>
                </SelectContent>
              </Select>
              <p class="text-sm text-muted-foreground">
                You can manage verified email addresses in your email settings.
              </p>
            </div>
            <div class="space-y-2">
              <Label for="bio">Bio</Label>
              <Textarea id="bio" placeholder="Tell us a little bit about yourself" />
              <p class="text-sm text-muted-foreground">
                You can <span> @mention</span> other users and organizations to link to them.
              </p>
            </div>
            <div>
              <div class="space-y-2">
                <Label for="url">
                  URLs
                </Label>
                <p class="text-sm text-muted-foreground">
                  Add links to your website, blog, or social media profiles.
                </p>
                <div class="relative flex items-center">
                  <Input id="url" type="url" />
                </div>
              </div>
              <Button variant="outline" class="w-20 mt-2" type="button">
                Add URL
              </Button>
            </div>
            <div class="flex gap-2 justify-start">
              <Button type="submit">
                Update profile
              </Button>
              <Button variant="outline" type="button">
                Reset form
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>