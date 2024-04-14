<!-- child -->

<template>
    <div class="data-table">
        <div class="table-tools">
            <form action="">
                <input-field type="text" v-model="searchWord" placeholder="Search here..." />
            </form>

            <button @click="$emit('addData', payload)">
                + New Data
            </button>
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
                <UCard  :ui="{ body: { base: 'mb-3 grid grid-cols-3' } }">
                    <div class="text-cool-500">
                        Name:
                        <p class="px-3 text-zinc-700 dark:text-zinc-50">{{ selected.name }}</p>
                    </div>
                    <UDivider orientation="vertical" />
                    <div class="space-y-4 flex flex-col justify-center">
                        <UButton color="black" label="Edit" icon="i-heroicons-pencil-square-20-solid" block @click="$emit('getData', selected)" />
                        <UButton color="black" label="Delete" icon="i-heroicons-trash-20-solid" block @click="tryDelete" />
                    </div>
                </UCard>
                <UCard  :ui="{ body: { base: 'grid grid-cols-1' } }">
                    <div class="text-cool-500">
                        Description:
                    </div>
                    <UTextarea autoresize color="purple" variant="none" :model-value="selected.description" disabled class="text-zinc-800 dark:text-zinc-50" maxrows="20" />
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
.data-table {
    .table-tools {
        padding: 10px;
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        align-items: center;
        border-bottom: solid 1px gray;

        button {
            display: inline-block;
            box-sizing: border-box;
            color: rgb(1, 179, 1);
            border-radius: 20px;
            padding: 2px 8px;
            font-size: 15px;
            border: 2px solid rgb(1, 179, 1);

            &:hover {
                color: rgb(5, 235, 5);
                border-color: rgb(5, 235, 5);
            }
        }
    }

    .scrollable {
        scrollbar-gutter: stable;
        overflow: scroll;
        height: 65vh;
        overflow-x: hidden;

        &::-webkit-scrollbar {
            width: 10px;
        }

        &::-webkit-scrollbar-thumb {
            background: rgb(1, 179, 1);
            border-radius: 10px;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }
    }
}
.save-button {
    margin: 0 20px;

    button {
        padding: 10px 20px;
    }
}

.add-button {
    margin-top: 20px;

    .plus-icon {
        font-size: 15px;
    }
}
</style>
