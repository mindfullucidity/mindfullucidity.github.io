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
    formData.append('_subject', 'New Contact Form Submission!'); // Default subject
    formData.append('_replyto', email.value); // Set reply-to to user's email

    const response = await fetch('https://formsubmit.co/ajax/mindfullucidy.gnosisflow@gmail.com', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      toast.success('Your message has been sent successfully!');
      name.value = '';
      email.value = '';
      message.value = '';
      window.location.hash = '#thankyou';
      showThankYou.value = true;
    } else {
      toast.error(`Failed to send message: ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error submitting contact form:', error);
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
      <h2 class="text-2xl font-bold tracking-tight">Contact Us</h2>
      <p class="text-muted-foreground mt-2">
        Have a question or feedback? Send us a message!
      </p>
    </div>

    <Separator class="my-6" v-if="!showThankYou" />

    <div class="space-y-6">
      <Card v-if="!showThankYou">
        <CardHeader>
          <CardTitle>Send us a message</CardTitle>
          <CardDescription>
            Fill out the form below and we'll get back to you as soon as possible.
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
              <Label for="message">Message</Label>
              <Textarea
                id="message"
                v-model="message"
                placeholder="Your message here..."
                rows="5"
                required
              />
            </div>
            <div class="flex justify-end">
              <Button type="submit" :disabled="isLoading">
                {{ isLoading ? 'Sending...' : 'Send Message' }}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div v-else class="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <h2 class="text-4xl font-bold tracking-tight mb-4">Thank You!</h2>
        <p class="text-muted-foreground text-lg mb-8">
          Your message has been sent successfully. We will get back to you as soon as possible.
        </p>
        <Button @click="resetFormAndHash">
          Send Another Message
        </Button>
      </div>
    </div>
  </div>
</template>
