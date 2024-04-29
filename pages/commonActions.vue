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
                        <Button icon="i-heroicons-x-mark-20-solid" class="w-12 h-12" style="padding:0!important" :pt="{
                                icon:'w-8 h-8'
                                }"
                            @click="xButton()" />
                    </div>
                </template>

                <section>
                    <div class="Form">
                        <input-field type="text" v-model="Name" label="Name" :required="true" />
                        <select-field v-model="Type" :required="true"
                            :options="ActionTypes"
                            label="Action Type" />  
                    </div>
                    <div class="Form">
                        <select-field v-model="Attribute" required="true" :options="Attributes"
                            label="Attribute" />
                        <select-field v-model="Skill" required="true" :options="Skills"
                            label="Skill" />
                    </div>
                    <div class="Form">
                        <UCheckbox v-model="Homebrew" required="true" label="is Homebrew" />
                        <select-field v-model="Source" :required="false"
                            :options="SourceBooks"
                            label="Source" />  
                    </div>
                    <div class="Form">
                        <input-field type="number" :required="false" v-model="Page" label="Page" />
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

        <h1>ACTIONS</h1>
        <div class="data-table">
            <TableTools :columns="columns" :data="data" @add-data="addData" @get-data="getData" @del-data="delData" />
        </div>
    </div>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";
import { ActionTypes, Attributes, Skills, SourceBooks } from "~/services/enums";
const UUID = ref();

const isEditForm = ref(true);
const reloadTrigger = ref(0);
const isOpen = ref(false);
const dataOfEachRow = ref();

const Name = ref(null);
const Skill = ref(null);
const Attribute = ref(null);
const Homebrew = ref(null);
const Type = ref(null);
const Page = ref(null);
const Source = ref(null);
const Description = ref(null);

const element = ref({
    id: null,
    name: null,
    description: null,
    attribute:null,
    skill:null,
    type:null,
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
        key: "description",
        label: "Description",
        sortable: true,
    },
    {
        key: "attribute",
        label: "Attribute",
        sortable: true,
    },
    {
        key: "skill",
        label: "Skill",
        sortable: true,
    },
    {
        key: "type",
        label: "Type",
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

const { data } = await useAsyncData("actions", () => $fetch("/api/common_action"), {
    watch: [reloadTrigger],
});

function xButton() {
    isOpen.value = false
    Name.value = null
    Skill.value = null
    Attribute.value = null
    Page.value = null
    Type.value = null
    Source.value = null
    Homebrew.value = null
    Description.value = null
}

function delData(id) {
    $fetch("/api/common_action", {
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
    Skill.value = dataOfEachRow.value.skill
    Attribute.value = dataOfEachRow.value.attribute
    Type.value = dataOfEachRow.value.type
    Name.value = dataOfEachRow.value.name
    Homebrew.value = dataOfEachRow.value.homebrew
    
    Page.value = dataOfEachRow.value.page
    Source.value = dataOfEachRow.value.source
    Description.value = dataOfEachRow.value.description

    return dataOfEachRow;
}

const Validation = () => {
    if (
        Name.value &&
        Homebrew.value !== null &&
        Description.value
    ) {
        saveData()
    } else if (!Name.value) {
        alert("You need to fill Name")
    } else if (!Homebrew.value) {
        alert("You need to fill Homebrew")
    } else if (!Description.value) {
        alert("You need to fill  Description")
    }
};

function saveData() {
    if (!isEditForm.value) {
        data.value.filter((row) => {
            do {
                UUID.value = uuidv4()
            } while (UUID.value === row.id)
        })
        element.value.id = UUID.value
        element.value.updated_at = new Date()
    } else {
        element.value.id = dataOfEachRow.value.id
        element.value.updated_at = dataOfEachRow.value.updated_at
    }
    element.value.attribute =  Attribute.value.toString()
    element.value.skill = Skill.value.toString()
    element.value.name = Name.value.toString()
    element.value.type = Type.value.toString()
    element.value.homebrew = Homebrew.value
    element.value.page = parseInt(Page.value)
    element.value.source = Source.value
    element.value.description = Description.value.toString()

    $fetch("/api/common_action", {
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
