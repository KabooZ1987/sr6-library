<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  overflow: hidden;
  padding: 100px 0;
}

main {
  padding: 10px 50px;

  div p {
    font-size: 18px;
    text-align: justify;
    text-justify: inter-word;
    margin-top: 30px;
  }

  h1 {
    font-size: 32px;
  }
}
.hidden{
  visibility: hidden;
}
</style>
