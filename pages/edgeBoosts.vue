<template>
    <div>
        <h1>EDGE BOOSTS</h1>
        <div class="data-table">
            <UTable  :columns="columns" :rows="pure" />
        </div> 
    </div>
</template>



















<script setup>


    const columns = [{
        key: 'id',
        label: 'ID',
        sortable: true         
    },{
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
    },{
        key: 'updated_at',
        label: 'Date',
        sortable: true 
    }]

    definePageMeta({
        layout: 'data-pages',
        
    })
    const data = ref()
    const pure = ref()
    
    data.value = await useFetch('/api/edge_boost')
    pure.value = data.value.data.data.complete;

</script>