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
div{
  p {
    margin-right: auto;
    font-size: 0.9rem;
    span {
        color: red;
    }
  }
}
main {
  padding: 10px 50px;

  div p {
    font-size: 18px;
    text-align: justify;
    text-justify: inter-word;
  }

  h1 {
    font-size: 32px;
  }
}
label {
  margin-right: auto;
  font-size: 0.9rem;  
  span {
      color: red;
  }
}
.hidden{
  visibility: hidden;
}
</style>
