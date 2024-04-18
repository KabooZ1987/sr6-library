<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed({
  get () {
    return colorMode.value === 'dark'
  },
  set () {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})
</script>
<template>
    <UButton
      :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
      color="white"
      variant="ghost"
      aria-label="Theme"
      @click="isDark = !isDark"
      :ui="{
        color:{
          white:{
            ghost: 'dark:text-fuchsia-700 text-fuchsia-700'
          }
        }
      }"
    />
</template>