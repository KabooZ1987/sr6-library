<template>
    <div>
        <h1>Welcome to the new World</h1>
        <div class="w-auto grid grid-cols-1 lg:grid-rows-2 lg:gap-4 lg:grid-cols-3 overflow-y-auto max-h-170">
            <NuxtLink v-for="(link, key) in sites" :id="key" :to="link.url">
              <Card
                  :key="link.name"
                  class=" min-h-50 justify-around m-2 text-fuchsia-700 dark:text-fuchsia-600 bg-gray-900 border border-sky-700 shadow-xl text-white rounded-2xl transition transform hover:scale-102"
              >
                <template #title>
                  <div class="text-fuchsia-700 dark:text-fuchsia-600 text-lg font-semibold text-sky-400">
                    {{ link.name }}
                  </div>
                </template>

                <template #content>
                  <p class="text-sm text-gray-300 mb-4">
                    {{ link.description }}
                  </p>
                  <a
                      :href="link.url"
                      target="_blank"
                      class="text-fuchsia-700 dark:text-fuchsia-600 text-sm font-medium text-sky-100 hover:underline"
                  >
                    👉→
                  </a>
                </template>
              </Card>
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import Textarea from 'primevue/textarea';

const sites: {name: string; description: string,url: string}[] = [
    {
        name:'Common Actions',
        url:'/commonActions',
        description:'what to do in combat and out of combat'
    },{
        name:'Edge Boosts',
        url:'/edgeBoosts',
        description:'direct possibilities with Edge \nprobably always usable when rolling for a test'
    },{
        name:'Edge Actions',
        url:'/edgeActions',
        description:'actions that need Edge to be possible'
    },{
        name:'Rules',
        url:'/rules',
        description:'what how works, can be homebrew too'
    },{
        name:'Homebrew',
        url:'/homebrew',
        description:'selfmade stuff here'
    }
]

</script>

<style scoped></style>
