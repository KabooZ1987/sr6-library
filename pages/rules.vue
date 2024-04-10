<template>
    <div>
        <h1>RULES</h1>
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
    },{
        key: 'category',
        label: 'Category',
        sortable: true
    },{
        key: 'description',
        label: 'Description',
        sortable: true
    },{
        key: 'updated_at',
        label: 'Date',
        sortable: true 
    },{
        key: 'homebrew',
        label: 'Homebrew',
        sortable: true 
    }]


    const data = ref()
    const pure = ref()
    
    data.value = await useFetch('/api/rule')
    pure.value = data.value.data.data.complete;
    definePageMeta({
        layout: 'data-pages',
        
    })
</script>