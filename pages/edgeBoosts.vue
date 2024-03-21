<template>
    <template >
        <UModal v-model="isOpen" prevent-close >
            <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <template #header >
                    <div class="flex items-center justify-between">
                        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                            Modal
                        </h3>
                        <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
                            @click="isOpen = false" />
                    </div>
                </template>
                
                    <h1>{{ dataOfEachRow }}</h1>
                
                
            </UCard>
        </UModal>
    </template>
    <div>
        <h1>EDGE BOOSTS</h1>

        <div class="data-table">
            <UTable :columns="columns" :rows="pure">
                <template #actions-data="{ row }">
                    <UButton icon="i-heroicons-pencil-square" size="sm" color="orange" variant="solid" :trailing="false"
                        @click="getID(row)" />
                </template>
            </UTable>
        </div>
    </div>
</template>



















<script setup>

const pure = ref()
const data = ref()
const isOpen = ref(false)
const dataOfEachRow = ref()

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


data.value = await useFetch('/api/edge_boost')
pure.value = data.value.data.data.complete;



definePageMeta({
    layout: 'data-pages',

})



function getID(rowData) {
    dataOfEachRow.value = rowData;
    isOpen.value = true
    return dataOfEachRow
}
</script>