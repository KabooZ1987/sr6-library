<!-- Parent -->

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

                    <div class="Form">
                        
                        <select-field v-model="Restriction" :required="true" :options="EdgeActionRestrictions" label="Restriction" />
                        <input-field class="disabled hidden" disabled type="text" />
                        
                    </div>

                    <div class="field">
                        <div>
                            <p>Description<span>*</span></p>
                            <textarea type="text" v-model="Description" />
                        </div>
                    </div>
                </section>
                <div class="save-button">
                    <UButton size="sm" color="blue" variant="solid" :trailing="false" @click="Validation">
                        Save
                    </UButton>
                </div>
            </UCard>
        </UModal>

        <h1>EDGE ACTIONS</h1>

        <div class="data-table">
            <TableTools :columns="columns" :data="data" @add-data="addData" @get-data="getData" @del-data="delData" />
        </div>
    </div>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";
import { EdgeActionRestrictions, SourceBooks } from "~/services/enums";
const UUID = ref();
const reloadTrigger = ref(0);
const isEditForm = ref(true);
const isOpen = ref(false);
const dataOfEachRow = ref();

const Name = ref(null);
const Cost = ref(null);
const Restriction = ref(null);
const Page = ref(null);
const Source = ref(null);
const Description = ref(null);

const element = ref({
    id: null,
    name: null,
    cost: null,
    restriction: null,
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
        key: "restriction",
        label: "Restriction",
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

const { data } = await useAsyncData(
    "edge_action",
    () => $fetch("/api/edge_action"),
    {
        watch: [reloadTrigger],
    }
);

function xButton() {
    isOpen.value = false;
    Name.value = null;
    Cost.value = null;
    Restriction.value = null;
    Page.value = null;
    Source.value = null;
    Description.value = null;
}

function delData(rowData) {
    dataOfEachRow.value = rowData;
    element.value.id = dataOfEachRow.value.id;

    useFetch("/api/edge_action", {
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
    Restriction.value = dataOfEachRow.value.restriction;
    Page.value = dataOfEachRow.value.page;
    Source.value = dataOfEachRow.value.source;
    Description.value = dataOfEachRow.value.description;
    return dataOfEachRow;
}

const Validation = () => {
    if (
        Name.value &&
        Cost.value &&
        Page.value &&
        Source.value &&
        Restriction.value &&
        Description.value
    ) {
        saveData();
    } else if (!Name.value) {
        alert("You need to fill Name");
    } else if (!Cost.value) {
        alert("You need to fill Cost");
    } else if (!Restriction.value) {
        alert("You need to fill  Restriction");
    } else if (!Page.value) {
        alert("You need to fill Page");
    } else if (!Source.value) {
        alert("You need to fill Source");
    } else if (!Description.value) {
        alert("You need to fill  Description");
    }
};

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

    if (Restriction.value !== null) {
        element.value.restriction = Restriction.value.toString();
    } else {
        element.value.restriction = dataOfEachRow.value.restriction;
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

    useFetch("/api/edge_action", {
        method: "POST",
        body: JSON.stringify({ upsert: element.value }),
    }).then(() => reloadTrigger.value += 1)

    
    xButton();
}
</script>

<style lang="scss" scoped>
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

.save-button {
    margin: 0 20px;

    button {
        padding: 10px 20px;
    }
}

.field {
    width: 100%;

    div {
        margin: 20px;

        span {
            color: red;
        }

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
