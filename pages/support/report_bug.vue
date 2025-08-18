<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'support',
})

const name = ref('')
const email = ref('')
const message = ref('')
const isLoading = ref(false)
const showThankYou = ref(false)

async function submitForm() {
  isLoading.value = true
  try {
    const formData = new FormData();
    formData.append('name', name.value);
    formData.append('email', email.value);
    formData.append('message', message.value);
    formData.append('_subject', 'Bug Report'); // Hardcoded subject
    formData.append('_replyto', email.value); // Set reply-to to user's email

    const response = await fetch('https://formsubmit.co/ajax/mindfullucidity@outlook.com', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      toast.success('Your bug report has been sent successfully!');
      name.value = '';
      email.value = '';
      message.value = '';
      window.location.hash = '#thankyou';
      showThankYou.value = true;
    } else {
      toast.error(`Failed to send bug report: ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error submitting bug report form:', error);
    toast.error('An unexpected error occurred. Please try again later.');
  } finally {
    isLoading.value = false;
  }
}

function resetFormAndHash() {
  name.value = '';
  email.value = '';
  message.value = '';
  window.location.hash = '';
  showThankYou.value = false;
}

onMounted(() => {
  if (process.client) {
    if (window.location.hash === '#thankyou') {
      showThankYou.value = true;
    }

    watch(() => window.location.hash, (newHash) => {
      if (newHash === '#thankyou') {
        showThankYou.value = true;
      } else {
        showThankYou.value = false;
      }
    });
  }
});
</script>

<template>
  <div>
    <div v-if="!showThankYou">
      <h2 class="text-2xl font-bold tracking-tight">Report a Bug</h2>
      <p class="text-muted-foreground mt-2">
        Found a bug? Please help us by reporting it!
      </p>
    </div>

    <Separator class="my-6" v-if="!showThankYou" />

    <div class="space-y-6">
      <Card v-if="!showThankYou">
        <CardHeader>
          <CardTitle>Report via GitHub Issue</CardTitle>
          <CardDescription>
            For detailed bug reports and tracking, you can create an issue directly on our GitHub repository.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NuxtLink
            to="https://github.com/mindfullucidity/mindfullucidity.github.io/issues/new"
            target="_blank"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Create GitHub Issue
          </NuxtLink>
        </CardContent>
      </Card>

      <Card v-if="!showThankYou">
        <CardHeader>
          <CardTitle>Report via Form</CardTitle>
          <CardDescription>
            Fill out the form below to send us a quick bug report.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <form @submit.prevent="submitForm" class="space-y-4">
            <div class="space-y-2">
              <Label for="name">Your Name</Label>
              <Input
                id="name"
                v-model="name"
                type="text"
                placeholder="John Doe"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="email">Your Email</Label>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="john.doe@example.com"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="message">Bug Description</Label>
              <Textarea
                id="message"
                v-model="message"
                placeholder="Describe the bug here..."
                rows="5"
                required
              />
            </div>
            <div class="flex justify-end">
              <Button type="submit" :disabled="isLoading">
                {{ isLoading ? 'Sending...' : 'Send Bug Report' }}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div v-else class="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <h2 class="text-4xl font-bold tracking-tight mb-4">Thank You!</h2>
        <p class="text-muted-foreground text-lg mb-8">
          Your bug report has been sent successfully. We appreciate your help!
        </p>
        <Button @click="resetFormAndHash">
          Report Another Bug
        </Button>
      </div>
    </div>
  </div>
</template>
