<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

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

const serviceItems: NavigationMenuItem[] = [
  { label: 'S3', to: '/s3' },
  { label: 'SQS', to: '/sqs' },
]
</script>

<template>
  <UApp>
    <UHeader
      mode="slideover"
      :ui="{ left: 'lg:flex-none', right: 'lg:flex-none', center: 'mr-auto' }"
    >
      <template #left>
        <RouterLink to="/">
          AWS Emulator
        </RouterLink>
      </template>

      <template #default>
        <UNavigationMenu :items="serviceItems" />
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

      <template #body>
        <UNavigationMenu
          :items="serviceItems"
          orientation="vertical"
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
