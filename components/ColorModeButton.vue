<script setup lang="ts">
const colorModes = {dark:'dark',light:'light'}
const isDark = ref()

onMounted(() => {
  const colorMode = localStorage.getItem('color-mode')
  if (colorMode) {
    setColorMode(colorMode)  
    isDark.value = colorMode ==  colorModes.dark
  }
})

const setColorMode = (mode: string) => {
  const element = document.querySelector('html')
  if (mode == colorModes.dark) {
    element?.classList.add(colorModes.dark)
  } else {
    element?.classList.remove(colorModes.dark)  
  }
  localStorage.setItem('color-mode', mode)
}

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  const mode = isDark.value ? colorModes.dark : colorModes.light;
  setColorMode(mode);
  console.log(mode);
}

</script>

<template>
    <Button
      :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
      aria-label="Theme"
      @click="toggleDarkMode"
      :pt="{  
        root:'bg-zinc-800 dark:bg-zinc-800 border-zinc-600 relative items-center inline-flex text-center align-bottom justify-center leading-[normal] w-12 h-12 rounded-md border focus:outline-none focus:outline-offset-0 focus:ring hover:border-primary-600 dark:hover:border-primary-300 focus:ring-primary-400/50 dark:focus:ring-primary-300/50 transition duration-200 ease-in-out cursor-pointer overflow-hidden select-none',
        icon:'dark:text-fuchsia-700 text-fuchsia-700 h-5 w-5',
       }"
    >
    <i :class="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'" />
    </Button>
</template>

