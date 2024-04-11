<!-- child -->

<template>
    <div class="data-table">
        <div class="table-tools">

            <form action="">
                <input type="text" v-model="serachWord" placeholder="Search here...">
            </form>

            <button @click="addData()">
                + New Data
            </button>

        </div>

        <div class="scrollable">

            <UTable :columns="props.columns" :rows="filtering"
                class="border border-primary-200 dark:border-primary-700">
                <template #actions-data="{ row }">
                    <UDropdown :items="items(row)">
                        <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
                    </UDropdown>
                </template>
            </UTable>

        </div>
    </div>
</template>


<script setup>

const props = defineProps(['columns', 'data'])
const serachWord = ref()




const filtering = computed(() => {
    if (!serachWord.value) {
        return props.data
    }
    return props.data.filter((row) => {
        return Object.values(row).some((value) => {
            return String(value).toLowerCase().includes(serachWord.value.trim().toLowerCase())
        })
    })
})


const items = (row) => [
    [{
        label: 'Edit',
        icon: 'i-heroicons-pencil-square-20-solid',
        click: () => getData(row)
    }, {
        label: 'Delete',
        icon: 'i-heroicons-trash-20-solid',
        click: () => delData(row)
    }]
]

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



        input {
            border-radius: 20px;
            padding: 0 20px;
            background-color: rgb(99, 96, 96);

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
            background: transparent
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
