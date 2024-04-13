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

                        <Input label="Name" v-model="Name" :placeholder="dataOfEachRow.name" @update="setName"
                            options="" />
                        <SelectField label="Category" v-model="Category" :selected="dataOfEachRow.category"
                            :options="options"  @update="setCategory"/>
                        <!-- <div>
                            <p>Category<span>*</span></p>
                            <select v-model="Category" required>
                                <option selected disabled value="">{{ dataOfEachRow.category }}</option>
                                <option value="edge">edge</option>
                                <option value="magic">magic</option>
                                <option value="combat">combat</option>
                                <option value="decking">decking</option>
                                <option value="rigging">rigging</option>
                                <option value="regeneration">regeneration</option>
                                <option value="critter">critter</option>
                                <option value="spirits">spirits</option>
                                <option value="other">other</option>
                            </select>
                        </div> -->
                    </div>

                    <div class="Form">
                        <div>

                            <input type="text" class="disabled" disabled>

                        </div>
                        <div>

                            <input type="text" class="disabled" disabled>
                            <!-- <input type="text" :placeholder="dataOfEachRow.source" v-model="Source"> -->
                        </div>

                    </div>

                    <div class="Form">

                        <div>

                            <input type="text" class="disabled" disabled>
                        </div>

                        <div>
                            <p></p>
                            <input class="disabled" disabled type="text">
                        </div>

                    </div>

                    <div class="field">
                        <div>
                            <p>Description<span>*</span></p>
                            <textarea type="text" :placeholder="dataOfEachRow.description" v-model="Description" />
                        </div>
                    </div>
                </section>



                <section v-show="!formSwitch" v-else>

                    <div class="Form">
                        <div>
                            <p>New Name<span>*</span></p>
                            <input type="text" v-model="Name">
                        </div>

                        <div>
                            <p>New Category<span>*</span></p>
                            <select v-model="Category" required>
                                <option selected disabled value=""></option>
                                <option value="edge">edge</option>
                                <option value="magic">magic</option>
                                <option value="combat">combat</option>
                                <option value="decking">decking</option>
                                <option value="rigging">rigging</option>
                                <option value="regeneration">regeneration</option>
                                <option value="critter">critter</option>
                                <option value="spirits">spirits</option>
                                <option value="other">other</option>
                            </select>
                        </div>
                    </div>

                    <div class="Form">
                        <div>


                            <input type="text" class="disabled" disabled>

                        </div>

                        <div>

                            <input class="disabled" disabled type="text">

                        </div>
                    </div>

                    <div class="Form">

                        <div>

                            <input class="disabled" disabled type="text">
                        </div>

                        <div>

                            <input class="disabled" disabled type="text">
                        </div>

                    </div>

                    <div class="field">
                        <div>
                            <p>New Description<span>*</span></p>
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
const UUID = ref()

const formSwitch = ref(true)
const data = ref([])
const isOpen = ref(false)
const dataOfEachRow = ref()

const options = [
    { label: "edge", value: "edge" },
    { label: "magic", value: "magic" },
    { label: "combat", value: "combat" },
    { label: "decking", value: "decking" },
    { label: "rigging", value: "rigging" },
    { label: "regeneration", value: "regeneration" },
    { label: "critter", value: "critter" },
    { label: "spirits", value: "spirits" },
    { label: "other", value: "other" }
]
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




useFetch('/api/homebrew').then(response => data.value = response.data.value.data.complete)


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
    if (!formSwitch.value) {
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

    isOpen.value = false;
    location.reload()
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