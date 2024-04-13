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
  background-color: rgb(50, 50, 50);
  padding: 100px 0;
  color: white;
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

  .data-table {
    margin-top: 50px;
  }
}
</style>
