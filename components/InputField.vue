<template>
    <div>
        <p>{{ props.label }}<span v-if="props.label">*</span></p>
        <input :type="type" :placeholder="props.placeholder" v-model="modelValue" :disabled="props.disabled"
            :class="{ disabled: props.disabled }" />
    </div>
</template>

<script setup>
const modelValue = defineModel();

const props = defineProps(["placeholder", "label", "disabled", "type"]);
</script>

<!-- <p>Name<span>*</span></p>
<input-field type="text" :placeholder="dataOfEachRow.name" v-model="Name" /> -->

<style lang="scss" scoped>
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

    .disabled {
        margin-top: 24px;
    }
}
</style>
