<template>
    <div>
        <UModal v-model="isOpen" prevent-close>
            <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white" >
                            {{(isEditForm ? "Edit": "Add New Item")}}
                        </h3>
                        <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
                            @click="xButton()" />
                    </div>
                </template>

                <section>
                    <div class="Form">

                        <input-field label="Name" v-model="Name"
                            options="" />
                        <select-field label="Category" v-model="Category"
                            :options="RuleCategories"
                        />
                    </div>

                    <div class="Form">
                        <div>

                            <input-field type="text" class="disabled" disabled />

                        </div>
                        <div>

                            <input-field type="text" class="disabled" disabled />
                        </div>

                    </div>

                    <div class="Form">

                        <div>

                            <input-field type="text" class="disabled" disabled />
                        </div>

                        <div>
                            <p></p>
                            <input-field class="disabled" disabled type="text" />
                        </div>

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



        <h1>HOMEBREW</h1>




        <div class="data-table">
            <TableTools :columns="columns" :data="data" @add-data="addData" @get-data="getData" @del-data="delData" />
        </div>
    </div>
</template>














<script setup>
import { v4 as uuidv4 } from 'uuid';
import { RuleCategories } from '~/services/enums';
const UUID = ref()

const isEditForm = ref(true)
const reloadTrigger = ref(0)
const isOpen = ref(false)
const dataOfEachRow = ref()
const Name = ref(null)
const Category = ref(null)
const Description = ref(null)

const element = ref({
    "id": null,
    "name": null,
    "description": null,
    "category": null,
    "updated_at": null
});

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




const {data} = await useAsyncData(
    'homebrew',
    () => $fetch('/api/homebrew'), {
    watch: [reloadTrigger]
  }
)


definePageMeta({
    layout: 'data-pages',

})

function xButton() {
    isOpen.value = false
    Name.value = null
    Category.value = null
    Description.value = null
}

function delData(rowData) {
    dataOfEachRow.value = rowData;
    element.value.id = dataOfEachRow.value.id

    useFetch("/api/homebrew", { method: "Delete", body: JSON.stringify({ upsert: element.value }) });
    reloadTrigger.value += 1
}
function addData() {
    isOpen.value = true;
    isEditForm.value = false;

}
function getData(rowData) {
    isEditForm.value = true;
    dataOfEachRow.value = rowData;
    isOpen.value = true

    Name.value = dataOfEachRow.value.name
    Category.value = dataOfEachRow.value.category
    Description.value = dataOfEachRow.value.description


    return dataOfEachRow
}



const Validation = () => {
    if (Name.value && Category.value && Description.value) {
        saveData()
    } else if (!Name.value) {
        alert("You need to fill Name")
    } else if (!Category.value) {
        alert("You need to fill Category")
    } else if (!Description.value) {
        alert("You need to fill  Description")
    }
}



const setName = (name) => Name.value = name
const setCategory = (category) => Category.value = category

function saveData() {
    if (!isEditForm.value) {
        data.value.filter((row) => {
            do {
                UUID.value = uuidv4();
            } while (UUID.value === row.id)
        })
        element.value.id = UUID.value
        element.value.updated_at = new Date()
    } else {
        element.value.id = dataOfEachRow.value.id
        element.value.updated_at = dataOfEachRow.value.updated_at
    }

    element.value.name = Name.value.toString();
    element.value.category = Category.value.toString();
    element.value.description = Description.value.toString();


    useFetch("/api/homebrew", { method: "POST", body: JSON.stringify({ upsert: element.value }) });

    reloadTrigger.value += 1
    xButton()
    // useFetch("/api/edge_boost",{method:"POST",body:{"upsert":element}})

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