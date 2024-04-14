<template>
    <div>
        <p>{{ props.label }}<span v-show="props.label && required">*</span></p>
        <USelect v-model="modelValue" :required="props.required" :options="options" class="mr-auto w-full"
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


}
</style>