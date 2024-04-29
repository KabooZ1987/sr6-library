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
    <Button
      :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
      aria-label="Theme"
      @click="isDark = !isDark"
      :pt="{  
        root:'bg-zinc-800 dark:bg-zinc-800 border-zinc-600 relative items-center inline-flex text-center align-bottom justify-center leading-[normal] w-12 h-12 rounded-md border focus:outline-none focus:outline-offset-0 focus:ring hover:border-primary-600 dark:hover:border-primary-300 focus:ring-primary-400/50 dark:focus:ring-primary-300/50 transition duration-200 ease-in-out cursor-pointer overflow-hidden select-none',
        icon:'dark:text-fuchsia-700 text-fuchsia-700 h-5 w-5',
       }"
    />
</template>

