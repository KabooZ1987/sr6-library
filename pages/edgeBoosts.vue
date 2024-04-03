<template>
    <div>
        <UModal v-model="isOpen" prevent-close>
            <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white" v-show="formSwitch">
                            Edit
                        </h3>
                        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                            v-show="!formSwitch">
                            Add New Item
                        </h3>
                        <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
                            @click="xButton()" />
                    </div>
                </template>

                <section v-show="formSwitch" v-if="formSwitch">
                    <div class="Form">
                        <div>
                            <p>Name</p>
                            <input type="text" :placeholder="dataOfEachRow.name" v-model="Name">
                        </div>

                        <div>
                            <p>Cost</p>
                            <input type="text" :placeholder="dataOfEachRow.cost" v-model="Cost">
                        </div>
                    </div>

                    <div class="Form">
                        <div>
                            <p>Page</p>
                            <input type="text" :placeholder="dataOfEachRow.page" v-model="Page">

                        </div>
                        <div>
                            <p>Source</p>
                            <input type="text" :placeholder="dataOfEachRow.source" v-model="Source">
                        </div>

                    </div>

                    <div class="field">
                        <div>
                            <p>Description</p>
                            <textarea type="text" :placeholder="dataOfEachRow.description" v-model="Description" />
                        </div>
                    </div>
                </section>
                <section v-show="!formSwitch" v-else>

                    <div class="Form">
                        <div>
                            <p>New Name</p>
                            <input type="text" v-model="Name">
                        </div>

                        <div>
                            <p>New Cost</p>
                            <input type="text" v-model="Cost">
                        </div>
                    </div>

                    <div class="Form">
                        <div>
                            <p> New Page</p>
                            <input type="text" v-model="Page">

                        </div>
                        <div>
                            <p>New Source</p>
                            <input type="text" v-model="Source">
                        </div>

                    </div>

                    <div class="field">
                        <div>
                            <p>New Description</p>
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


        <div class="add-button">
            <UButton size="sm" color="green" variant="solid" :trailing="false" @click="addData()">
               + New Data
            </UButton>

        </div>


        <div class="data-table">
            <div class="flex px-3 py-3.5 border border-gray-200 dark:border-gray-700">
                <UInput v-model="serachWord" placeholder="Search here..." />
            </div>
            <UTable :columns="columns" :rows="filtering" class="border border-primary-200 dark:border-primary-700">
                <template #actions-data="{ row }">
                    <div>
                        <UButton icon="i-heroicons-pencil-square" size="sm" color="orange" variant="solid"
                            :trailing="false" @click="getData(row)" />
                        <UButton icon="i-heroicons-trash-20-solid" size="sm" color="red" variant="solid"
                            :trailing="false" @click="delData(row)" />
                    </div>
                </template>
            </UTable>
        </div>
    </div>
</template>



<script setup>
import { ref, onMounted } from 'vue'


const formSwitch = ref(true)
const data = ref([])
const isOpen = ref(false)
const dataOfEachRow = ref()
const serachWord = ref()

const Name = ref(null)
const Cost = ref(null)
const Page = ref(null)
const Source = ref(null)
const Description = ref(null)


const element = ref({
    "id": null,
    "name": null,
    "cost": null,
    "description": null,
    "source": null,
    "page": null,
    "updated_at": null
});

const columns = [{
    key: 'id',
    label: 'ID',
    sortable: true
}, {
    key: 'name',
    label: 'Name',
    sortable: true
}, {
    key: 'cost',
    label: 'Cost',
    sortable: true
}, {
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
}, {
    key: 'updated_at',
    label: 'Date',
    sortable: true
}, {
    key: 'actions'
}]

// console.log(await useFetch('/api/edge_boost'));

useFetch('/api/edge_boost').then(response => data.value = response.data.value.data.complete)

// Server push beispiel
const filtering = computed(() => {
    if(!serachWord.value){
        return data.value
    }
    return data.value.filter((row) => {
        return Object.values(row).some((value)=>{
            return String(value).toLowerCase().includes(serachWord.value.trim().toLowerCase())
        })
    })
})

definePageMeta({
    layout: 'data-pages',

})

function xButton() {
    isOpen.value = false
    Name.value = null
    Cost.value = null
    Page.value = null
    Source.value = null
    Description.value = null
}

function delData(rowData) {
    dataOfEachRow.value = rowData;
    element.value.id = dataOfEachRow.value.id

    useFetch("/api/edge_boost", { method: "Delete", body: JSON.stringify({ upsert: element.value }) });
    location.reload()
}
function addData() {
    isOpen.value = true;
    formSwitch.value = false;

}
function getData(rowData) {
    formSwitch.value = true;
    dataOfEachRow.value = rowData;
    isOpen.value = true

    Name.value = dataOfEachRow.value.name
    Cost.value = dataOfEachRow.value.cost
    Page.value = dataOfEachRow.value.page
    Source.value = dataOfEachRow.value.source
    Description.value = dataOfEachRow.value.description


    return dataOfEachRow
}


function saveData() {
    if (!formSwitch.value) {
        element.value.id = Math.ceil(Math.random() * 1000000).toString()
        element.value.updated_at = new Date()
    } else {
        element.value.id = dataOfEachRow.value.id
        element.value.updated_at = dataOfEachRow.value.updated_at
    }

    if (Name.value !== null) {
        element.value.name = Name.value.toString();
    } else {
        element.value.name = dataOfEachRow.value.name
    }

    if (Cost.value !== null) {
        element.value.cost = Cost.value.toString();
    } else {
        element.value.cost = dataOfEachRow.value.cost
    }


    if (Page.value !== null) {
        element.value.page = Page.value.toString();
    } else {
        element.value.page = dataOfEachRow.value.page
    }


    if (Source.value !== null) {
        element.value.source = Source.value.toString();
    } else {

        element.value.source = dataOfEachRow.value.source
    }

    if (Description.value !== null) {
        element.value.description = Description.value.toString();
    } else {
        element.value.description = dataOfEachRow.value.description
    }

    useFetch("/api/edge_boost", { method: "POST", body: JSON.stringify({ upsert: element.value }) });

    isOpen.value = false;
    location.reload()
    // useFetch("/api/edge_boost",{method:"POST",body:{"upsert":element}})

}



</script>



<style lang="scss">
.data-table button {
    margin: 0 5px;
}

.save-button {
    margin: 0 20px;

    button {
        padding: 10px 20px;

    }

}

.add-button {
    margin-top: 20px;
    
    .plus-icon{
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
        }

        input {
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