<template>
    <div>
        <h1>Welcome to the new World</h1>
       
        <div class="data-table">
            <TableTools :columns="columns" :data="data" />
        </div>        
    </div>
</template>




<script setup>


    definePageMeta({
        layout: 'data-pages',
        
    })
    const columns = [{
    key: 'name',
    label: 'Name',
    sortable: true
}, {
    key: 'cost',
    label: 'Cost',
    sortable: true
}, {
    key: 'restriction',
    label: 'Restriction',
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
}, {
    key: 'updated_at',
    label: 'Date',
    sortable: true
}, {
    key: 'actions'
}]
const {data} = await useAsyncData(
    'edge_action',
    () => $fetch('/api/edge_action')
)
         
</script>


<style scoped>


    


</style>



