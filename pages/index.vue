<template>
    <div>
        <h1>Welcome to the new World</h1>
        <div class="grid grid-cols-1 lg:gap-5 lg:grid-cols-3 overflow-auto mt-5" style="height:64vh">
            <NuxtLink v-for="site, key in sites" :id="key" :to="site.url">
                <UCard  class="mb-4 w-full" >
                    <template #header>
                        <h3 class="text-fuchsia-700 dark:text-fuchsia-600">{{ site.name }}</h3>
                    </template>

                    <UTextarea :value="site.description" variant="none" 
                    :padded="false"
                    :maxrows="2"
                    class=""
                    :ui="{
                        base:'cursor-pointer select-none',
                    }"
                    />
                </UCard>
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
const sites = [
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
