<template>
    <div>
        <h1>EDGE BOOSTS</h1>
        <button @click="loadData">clickMe</button>
        <UTable :columns="columns" :rows="pure" />
    </div>
</template>



















<script setup>


    const columns = [{
    key: 'name',
    label: 'Name',
    sortable: true
    }, {
    key: 'cost',
    label: 'Cost',
    sortable: true
    }, {
    key: 'description',
    label: 'Description',
    sortable: true
    }, {
    key: 'source',
    label: 'Source',
    sortable: true
    }, {
    key: 'page',
    label: 'Page',
    sortable: true
    }]

    definePageMeta({
        layout: 'data-pages',
        
    })
    const data = ref()
    const pure = ref()
     async function loadData() {
        data.value = await useFetch('/api/edge_boost')
        pure.value = data.value.data.data.minimal;
        return pure;
    }
</script>