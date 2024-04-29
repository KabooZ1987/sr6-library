<template>
    <div class="inputfield">
        <label class="label" :for="props.label" >{{ props.label }}<span v-show="props.label && required">*</span></label>
        <UInput :id="props.label"  :type="type" :placeholder="props.placeholder" v-model="modelValue" :disabled="props.disabled" :required="required"
            :class="{ disabled: props.disabled, 'mr-auto': true, 'w-full': true }"
            :ui="{
            color: { white: { outline: 'bg-neutral-100 dark:bg-neutral-800'}},
            }"
            />
    </div>
</template>

<script setup>
const modelValue = defineModel();
const props = defineProps(["placeholder", "label", "disabled", "type", "required"]);
</script>