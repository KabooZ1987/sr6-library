<template>
    <div>
        <p>{{ props.label }}<span v-show="props.label && props.required">*</span></p>
        <UInput  :type="type" :placeholder="props.placeholder" v-model="modelValue" :disabled="props.disabled" :required="required"
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

<!-- <p>Name<span>*</span></p>
<input-field type="text" :placeholder="dataOfEachRow.name" v-model="Name" /> -->

<style lang="scss" scoped>
div {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;

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

    .disabled {
        margin-top: 24px;
    }
}
</style>
