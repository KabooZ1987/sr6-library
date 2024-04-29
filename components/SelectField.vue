<template>
    <div class="inputfield">
        <label class="label" :for="props.label" >{{ props.label }}<span v-show="props.label && required">*</span></label>
        <USelect :id="props.label" v-model="modelValue" :required="props.required" :options="options" class="mr-auto w-full"
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