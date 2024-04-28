<!-- child -->

<template>
    <div class="data-table">
        <div class="table-tools">
        
            <form action="">
                <input-field type="text" v-model="searchWord" placeholder="Search here..." />
            </form>

            <UButton @click="$emit('addData', payload)" label="+ New Data" 
            color="white"
            :padded="true"
            size="md"
            variant="solid"
                :ui="{
                    rounded: 'rounded-md',
                    color:{
                        white:{
                            solid:'text-fuchsia-600 dark:text-fuchsia-600'
                        }
                    }
                }"
            />
        
        </div>

        <div class="scrollable">
            <UTable :columns="props.columns" :rows="filtering" @select="select"
                class="border border-primary-200 dark:border-primary-700">
                <template #description-data="{ row }">
                        <div class="overflow-ellipsis overflow-hidden w-32" >{{ row.description }}</div>
                </template>
            </UTable>
        </div>
        <USlideover v-model="isOpen">


            <div class="p-4 flex-1">
                <UCard  :ui="{ body: { base: 'grid grid-cols-1' } }">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="tpx-3 text-zinc-700 dark:text-zinc-50">
                            {{ selected.name }}
                            </h3>
                            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
                        </div>
                    </template>
                    <div class="text-cool-500">
                        Description:
                    </div>
                    <UTextarea autoresize color="purple" variant="none" :model-value="selected.description" disabled class="text-zinc-800 dark:text-zinc-50" maxrows="20" />
                    <template #footer>
                        <div class="space-y-4 flex flex-col justify-center">
                            <UButton color="black" label="Edit" icon="i-heroicons-pencil-square-20-solid" block @click="$emit('getData', selected)" />
                            <UButton color="black" label="Delete" icon="i-heroicons-trash-20-solid" block @click="tryDelete" />
                        </div>
                    </template>
                </UCard>
            </div>
        </USlideover>

    </div>
</template>

<script setup>
import Swal from 'sweetalert2';

const props = defineProps(["columns", "data"])
const emit = defineEmits(["getData", "delData", "addData"])
const searchWord = ref()
const isOpen = ref(false)
const selected = ref({})
const select =  (element) => {
    selected.value = element
    isOpen.value = !isOpen.value
}

function tryDelete(){
    Swal.fire({
        title: "Are you sure?",
        icon: "warning",
        iconColor: "red",
        denyButtonText: "No Abort",
        confirmButtonText: 'Yes Delete!',
        showConfirmButton: true,
        showDenyButton: true,
        showCancelButton: false,
        denyButtonColor:"green",
        confirmButtonColor: "red"
}).then((result) =>{
        if (!result.isConfirmed) return
        emit('delData', (selected.value.id))
        isOpen.value = !isOpen.value
    })
    
}

const filtering = computed(() => {
    if (!searchWord.value) {
        return props.data;
    }
    return props.data.filter((row) => {
        return Object.values(row).some((value) => {
            return String(value)
                .toLowerCase()
                .includes(searchWord.value.trim().toLowerCase());
        });
    });
});

</script>

<style lang="scss" scoped>

</style>
