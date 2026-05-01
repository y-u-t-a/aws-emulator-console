<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
  ],
})

const title = 'AWS Emulator'

useSeoMeta({
  title,
  ogTitle: title,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <RouterLink to="/">
          AWS Emulator
        </RouterLink>
      </template>

      <template #right>
        <UColorModeButton />
        <UButton
          to="https://github.com/y-u-t-a/aws-emulator-console"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UHeader>

    <UMain>
      <UContainer class="pt-4">
        <NuxtPage />
      </UContainer>
    </UMain>
  </UApp>
</template>
