<template>
    <div>
        <h1>EDGE BOOSTS</h1>
        
        <div class="data-table">
            <UTable :columns="columns" :rows="pure">
                <template #actions-data="{row}">
                    <UButton  icon="i-heroicons-pencil-square" size="sm" color="orange" variant="solid" 
                        :trailing="false" @click="getID(row)" />
                </template>
            </UTable>
        </div>
    </div>
</template>



















<script setup>


const columns = [{
    key: 'id',
    label: 'ID',
    sortable: true
}, {
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
}, {
    key: 'updated_at',
    label: 'Date',
    sortable: true
}, {
    key: 'actions'
}]

const items = (row) => [
    [{
        icon: 'i-heroicons-pencil-square-20-solid',
        click: () => console.log('Edit', row)
    }]
]


definePageMeta({
    layout: 'data-pages',
    
})
const data = ref()
const pure = ref()

data.value = await useFetch('/api/edge_boost')
pure.value = data.value.data.data.complete;

function getID(rowData){
    const id = rowData;
    console.log(id);
}
</script>