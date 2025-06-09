<template>
    <div class="inputfield">
        <label class="label" :for="props.Name" >{{ props.Name }}<span v-show="props.Name && required">*</span></label>
        <Select :id="props.Name" v-on="modelValue" :required="props.required" :options="options" class="mr-auto w-full"
                :ui="{
            color: { white: { outline: 'bg-neutral-100 dark:bg-neutral-800'}},
        }"
        />
    </div>
</template>

<script setup>

const modelValue = defineModel()
const props = defineProps(['label', 'required', 'options'])
</script>