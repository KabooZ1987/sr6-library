<template>
    <div>
        <h1>EDGE ACTIONS</h1>
        <div class="data-table">
            <UTable  :columns="columns" :rows="pure" />
        </div> 
    </div>
</template>

















<script setup>
import { rule_category, edge_action_restriction, source_book } from '@prisma/client';
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
    },{
        key:'restriction',
        label:'Restriction',
        sortable: true
    },{
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


    const data = ref()
    const pure = ref()
    
    data.value = await useFetch('/api/edge_action')
    pure.value = data.value.data.data.complete;
    definePageMeta({
        layout: 'data-pages',
        
    })
</script>