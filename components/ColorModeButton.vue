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
      :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
      aria-label="Theme"
      @click="toggleDarkMode"

    />
</template>

<style lang="scss" scoped>
</style>