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
                        <select-field v-model="Category" required="true" :options="RuleCategories"
                            label="Rule Category" />
                    </div>

                    <div class="Form">
                        <UCheckbox v-model="Homebrew" required="true" label="is Homebrew" />
                            <input-field type="number" :required="false" v-model="Page" label="Page" />
                    </div>
                    <div class="Form">
                        <select-field v-model="Source" required="false"
                            :options="SourceBooks"
                            label="Source" />
                        <input-field class="disabled hidden" disabled type="text" />
                    </div>
                    <div class="field">
                        <div>
                            <p>Description<span>*</span></p>
                            <textarea type="text" v-model="Description" class="bg-neutral-100 dark:bg-neutral-800 mt-1" />
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

        <h1>RULES</h1>
        <div class="data-table">
            <TableTools :columns="columns" :data="data" @add-data="addData" @get-data="getData" @del-data="delData" />
        </div>
    </div>
</template>

<!-- Category = source -->

<!-- Homebrew = page -->

<script setup>
import { v4 as uuidv4 } from "uuid";
import { RuleCategories, SourceBooks } from "~/services/enums";
const UUID = ref();

const isEditForm = ref(true);
const reloadTrigger = ref(0);
const isOpen = ref(false);
const dataOfEachRow = ref();

const Name = ref(null);
const Homebrew = ref(null);
const Page = ref(null);
const Source = ref(null);
const Category = ref(null);
const Description = ref(null);

const element = ref({
    id: null,
    name: null,
    description: null,
    category: null,
    page: null,
    source: null,
    homebrew: null,
    updated_at: null,
});

const columns = [
    {
        key: "name",
        label: "Name",
        sortable: true,
    },
    {
        key: "category",
        label: "Category",
        sortable: true,
    },
    {
        key: "description",
        label: "Description",
        sortable: true,
    },
    {
        key: "homebrew",
        label: "Homebrew",
        sortable: true,
    },
    {
        key: "source",
        label: "Source",
        sortable: true
    },
    {
        key: "updated_at",
        label: "Date",
        sortable: true,

    }
];

const { data } = await useAsyncData("rules", () => $fetch("/api/rule"), {
    watch: [reloadTrigger],
});

function xButton() {
    isOpen.value = false;
    Name.value = null;
    Page.value = null;
    Source.value = null;
    Homebrew.value = null;
    Category.value = null;
    Description.value = null;
}

function delData(id) {
    $fetch("/api/rule", {
        method: "Delete",
        body: JSON.stringify({ id }),
    }).then(() => reloadTrigger.value += 1)
}
function addData() {
    isOpen.value = true
    isEditForm.value = false
}
function getData(rowData) {
    isEditForm.value = true
    dataOfEachRow.value = rowData
    isOpen.value = true

    Name.value = dataOfEachRow.value.name
    Homebrew.value = dataOfEachRow.value.homebrew
    Page.value = dataOfEachRow.value.page
    Source.value = dataOfEachRow.value.source
    Category.value = dataOfEachRow.value.category
    Description.value = dataOfEachRow.value.description

    return dataOfEachRow;
}

const Validation = () => {
    if (
        Name.value &&
        Homebrew.value !== null &&
        Category.value &&
        Description.value
    ) {
        saveData();
    } else if (!Name.value) {
        alert("You need to fill Name");
    } else if (!Homebrew.value) {
        alert("You need to fill Homebrew");
    } else if (!Category.value) {
        alert("You need to fill Category");
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

    element.value.name = Name.value.toString();
    element.value.homebrew = Homebrew.value;
    element.value.page = parseInt(Page.value)
    element.value.source = Source.value
    element.value.category = Category.value.toString();
    element.value.description = Description.value.toString();

    $fetch("/api/rule", {
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
