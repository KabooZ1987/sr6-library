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





        <h1>EDGE ACTIONS</h1>






        <div class="data-table">
            <TableTools :columns="columns" :data="data" />
        </div>

        <!-- <div class="data-table">
            <UTable  :columns="columns" :rows="pure" />
        </div>  -->
    </div>
</template>



<script setup>





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


useFetch('/api/edge_action').then(response => data.value = response.data.value.data.complete)

definePageMeta({
    layout: 'data-pages',

})
</script>