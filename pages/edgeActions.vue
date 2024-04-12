<!-- Parent -->

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
                            <p>Name<span>*</span></p>
                            <input type="text" :placeholder="dataOfEachRow.name" v-model="Name">
                        </div>

                        <div>
                            <p>Cost<span>*</span></p>
                            <input type="text" :placeholder="dataOfEachRow.cost" v-model="Cost">
                        </div>
                    </div>

                    <div class="Form">
                        <div>
                            <p>Page<span>*</span></p>
                            <input type="text" :placeholder="dataOfEachRow.page" v-model="Page">

                        </div>
                        <div>
                            <p>Source<span>*</span></p>
                            <select v-model="Source" required>
                                <option selected disabled value="">{{ dataOfEachRow.source }}</option>
                                <option value="core">core</option>
                                <option value="wyrd">wyrd</option>
                                <option value="wild_life">wild_life</option>
                                <option value="firing_squad">firing_squad</option>
                                <option value="companion">companion</option>
                                <option value="body_shop">body_shop</option>
                                <option value="shifter">shifter</option>
                                <option value="homebrew">homebrew</option>
                            </select>
                            <!-- <input type="text" :placeholder="dataOfEachRow.source" v-model="Source"> -->
                        </div>

                    </div>

                    <div class="Form">

                        <div>
                            <p>Restriction<span>*</span></p>
                            <input type="text" v-model="Restriction">
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
                            <p>New Cost<span>*</span></p>
                            <input type="text" v-model="Cost">
                        </div>
                    </div>

                    <div class="Form">
                        <div>
                            <p>New Page<span>*</span></p>
                            <input type="text" v-model="Page">

                        </div>
                        <div>
                            <p>New Source<span>*</span></p>
                            <select v-model="Source" required>
                                <option selected disabled value=""></option>
                                <option value="core">core</option>
                                <option value="wyrd">wyrd</option>
                                <option value="wild_life">wild_life</option>
                                <option value="firing_squad">firing_squad</option>
                                <option value="companion">companion</option>
                                <option value="body_shop">body_shop</option>
                                <option value="shifter">shifter</option>
                                <option value="homebrew">homebrew</option>
                            </select>
                            <!-- <input type="text" v-model="Source"> -->
                        </div>

                    </div>

                    <div class="Form">

                        <div>
                            <p>New Restriction<span>*</span></p>
                            <input type="text" v-model="Restriction">
                        </div>

                        <div>
                            <p></p>
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





        <h1>EDGE ACTIONS</h1>






        <div class="data-table">
            <TableTools :columns="columns" :data="data" @add-data="addData" @get-data="getData" @del-data="delData" />
        </div>

        <!-- <div class="data-table">
            <UTable  :columns="columns" :rows="pure" />
        </div>  -->
    </div>
</template>



<script setup>
import { v4 as uuidv4 } from 'uuid';
const UUID = ref()

const formSwitch = ref(true)
const data = ref([])
const isOpen = ref(false)
const dataOfEachRow = ref()

const Name = ref(null)
const Cost = ref(null)
const Restriction = ref(null)
const Page = ref(null)
const Source = ref(null)
const Description = ref(null)


const element = ref({
    "id": null,
    "name": null,
    "cost": null,
    "restriction": null,
    "description": null,
    "source": null,
    "page": null,
    "updated_at": null
});


const columns = [{
    key: 'name',
    label: 'Name',
    sortable: true
}, {
    key: 'cost',
    label: 'Cost',
    sortable: true
}, {
    key: 'restriction',
    label: 'Restriction',
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





useFetch('/api/edge_action/edge_action').then(response => data.value = response.data.value.data.complete)

definePageMeta({
    layout: 'data-pages',

})



function xButton() {
    isOpen.value = false
    Name.value = null
    Cost.value = null
    Restriction.value = null
    Page.value = null
    Source.value = null
    Description.value = null
}

function delData(rowData) {
    dataOfEachRow.value = rowData;
    element.value.id = dataOfEachRow.value.id

    useFetch("/api/edge_action/edge_action", { method: "Delete", body: JSON.stringify({ upsert: element.value }) });
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
    Restriction.value = dataOfEachRow.value.restriction
    Page.value = dataOfEachRow.value.page
    Source.value = dataOfEachRow.value.source
    Description.value = dataOfEachRow.value.description


    return dataOfEachRow
}



const Validation = () => {
    if (Name.value && Cost.value && Page.value && Source.value  && Restriction.value && Description.value) {
        saveData()
    }else if(!Name.value){
        alert("You need to fill Name")
    }else if (!Cost.value){
        alert("You need to fill Cost")  
    }else if (!Restriction.value){
        alert("You need to fill  Restriction")     
    } else if(!Page.value){
        alert("You need to fill Page")
    }else if (!Source.value){
        alert("You need to fill Source")  
    }else if (!Description.value){
        alert("You need to fill  Description")     
    }
}

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
    
    if (Restriction.value !== null) {
        element.value.restriction = Restriction.value.toString();
    } else {
        element.value.restriction = dataOfEachRow.value.restriction
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

    useFetch("/api/edge_action/edge_action", { method: "POST", body: JSON.stringify({ upsert: element.value }) });

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
        span{
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