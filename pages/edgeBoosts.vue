<template>
    <div>
        <UModal v-model="isOpen" prevent-close>
            <UCard :ui="{
            ring: '',
            divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                            {{ (isEditForm ? "Edit" : "Add New Item") }}
                        </h3>
                        <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
                            @click="xButton()" />
                    </div>
                </template>

                <section>
                    <div class="Form">
                        <input-field type="text" v-model="Name" label="Name" :required="true" />
                        <input-field type="number" v-model="Cost" label="Cost" :required="true" />
                    </div>

                    <div class="Form">
                        <input-field type="number" v-model="Page" label="Page" :required="true" />
                        <select-field v-model="Source" :required="true" :options="SourceBooks" label="Source" />
                    </div>

                    <div class="field">
                        <div>
                            <p>Description</p>
                            <textarea type="text" v-model="Description" />
                        </div>
                    </div>
                </section>
                <div class="save-button">
                    <UButton size="sm" color="blue" variant="solid" :trailing="false" @click="saveData()">
                        Save
                    </UButton>
                </div>
            </UCard>
        </UModal>

        <h1>EDGE BOOSTS</h1>

        <div class="data-table">
            <div class="table-tools">
                <form action="">
                    <input-field type="text" v-model="serachWord" placeholder="Search here..." />
                </form>

                <button @click="addData()">
                    + New Data
                </button>

                <!-- <UButton size="sm" color="green" variant="solid" :trailing="false" @click="addData()">
                   + New Data
                </UButton>
                <UInput v-model="serachWord" placeholder="Search here..." /> -->
            </div>
            <div class="scrollable">
                <UTable :columns="columns" :rows="filtering" class="border border-primary-200 dark:border-primary-700">
                    <template #actions-data="{ row }">
                        <UDropdown :items="items(row)">
                            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
                        </UDropdown>

                        <!-- <UButton icon="i-heroicons-pencil-square" size="sm" color="orange" variant="solid"
                                :trailing="false" @click="getData(row)" />
                            <UButton icon="i-heroicons-trash-20-solid" size="sm" color="red" variant="solid"
                                :trailing="false" @click="delData(row)" /> -->
                    </template>
                </UTable>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";
import { SourceBooks } from "~/services/enums";
const UUID = ref();

const isEditForm = ref(true);
const reloadTrigger = ref(0);
const isOpen = ref(false);
const dataOfEachRow = ref();
const serachWord = ref();

const Name = ref(null);
const Cost = ref(null);
const Page = ref(null);
const Source = ref(null);
const Description = ref(null);

const element = ref({
    id: null,
    name: null,
    cost: null,
    description: null,
    source: null,
    page: null,
    updated_at: null,
});

const columns = [
    {
        key: "name",
        label: "Name",
        sortable: true,
    },
    {
        key: "cost",
        label: "Cost",
        sortable: true,
    },
    {
        key: "description",
        label: "Description",
        sortable: true,
    },
    {
        key: "source",
        label: "Source",
        sortable: true,
    },
    {
        key: "page",
        label: "Page",
        sortable: true,
    },
    {
        key: "updated_at",
        label: "Date",
        sortable: true,
    },
    {
        key: "actions",
    },
];

const items = (row) => [
    [
        {
            label: "Edit",
            icon: "i-heroicons-pencil-square-20-solid",
            click: () => getData(row),
        },
        {
            label: "Delete",
            icon: "i-heroicons-trash-20-solid",
            click: () => delData(row),
        },
    ],
];

// console.log(await useFetch('/api/edge_boost'));

const { data } = await useAsyncData(
    "edge_boost",
    () => $fetch("/api/edge_boost"),
    {
        watch: [reloadTrigger],
    }
);

const filtering = computed(() => {
    if (!serachWord.value) {
        return data.value;
    }
    return data.value.filter((row) => {
        return Object.values(row).some((value) => {
            return String(value)
                .toLowerCase()
                .includes(serachWord.value.trim().toLowerCase());
        });
    });
});

function xButton() {
    isOpen.value = false;
    Name.value = null;
    Cost.value = null;
    Page.value = null;
    Source.value = null;
    Description.value = null;
}

function delData(rowData) {
    dataOfEachRow.value = rowData;
    element.value.id = dataOfEachRow.value.id;

    useFetch("/api/edge_boost", {
        method: "Delete",
        body: JSON.stringify({ upsert: element.value }),
    });
    reloadTrigger.value += 1;
}
function addData() {
    isOpen.value = true;
    isEditForm.value = false;
}
function getData(rowData) {
    isEditForm.value = true;
    dataOfEachRow.value = rowData;
    isOpen.value = true;

    Name.value = dataOfEachRow.value.name;
    Cost.value = dataOfEachRow.value.cost;
    Page.value = dataOfEachRow.value.page;
    Source.value = dataOfEachRow.value.source;
    Description.value = dataOfEachRow.value.description;

    return dataOfEachRow;
}

function saveData() {
    if (!isEditForm.value) {
        data.value.filter((row) => {
            do {
                UUID.value = uuidv4();
            } while (UUID.value === row.id);
        });
        element.value.id = UUID.value;
        element.value.updated_at = new Date();
    } else {
        element.value.id = dataOfEachRow.value.id;
        element.value.updated_at = dataOfEachRow.value.updated_at;
    }

    if (Name.value !== null) {
        element.value.name = Name.value.toString();
    } else {
        element.value.name = dataOfEachRow.value.name;
    }

    if (Cost.value !== null) {
        element.value.cost = parseFloat(Cost.value)
    } else {
        element.value.cost = parseFloat(dataOfEachRow.value.cost)
    }

    if (Page.value !== null) {
        element.value.page = parseInt(Page.value)
    } else {
        element.value.page = parseInt(dataOfEachRow.value.page)
    }

    if (Source.value !== null) {
        element.value.source = Source.value.toString();
    } else {
        element.value.source = dataOfEachRow.value.source;
    }

    if (Description.value !== null) {
        element.value.description = Description.value.toString();
    } else {
        element.value.description = dataOfEachRow.value.description;
    }

    useFetch("/api/edge_boost", {
        method: "POST",
        body: JSON.stringify({ upsert: element.value }),
    }).then(() => reloadTrigger.value += 1)

    xButton();
    // useFetch("/api/edge_boost",{method:"POST",body:{"upsert":element}})
}
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

.Form {
    display: flex;
    width: 100%;

    div {
        width: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 20px;

        p {
            margin-right: auto;

            span {
                color: red;
            }
        }

        input,
        select {
            width: 100%;
            border-radius: 20px;
            padding: 5px 20px;
        }
    }
}

.field {
    width: 100%;

    div {
        margin: 20px;

        textarea {
            width: 100%;
            height: 200px;
            border-radius: 20px;
            padding: 5px 20px;
            resize: none;
        }
    }
}
</style>
