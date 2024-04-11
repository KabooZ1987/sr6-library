<template>
    <div>
        <h1>HOMEBREW</h1>
        <div class="data-table">
            <TableTools :columns="columns" :data="pure" />
        </div>
    </div>
</template>














<script setup>
const columns = [{
    key: 'name',
    label: 'Name',
    sortable: true
}, {
    key: 'category',
    label: 'Category',
    sortable: true
}, {
    key: 'description',
    label: 'Description',
    sortable: true
}, {
    key: 'updated_at',
    label: 'Date',
    sortable: true
}, {
    key: 'actions'
}]


const data = ref()
const pure = ref()

data.value = await useFetch('/api/homebrew')
pure.value = data.value.data.data.complete;

definePageMeta({
    layout: 'data-pages',

})
</script>