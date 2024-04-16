<template>
    
    <div v-if="props.label">
        <p v-if="props.label">{{ props.label }}<span v-show="props.label && props.required">*</span></p>
        <input :type="type" :placeholder="props.placeholder" v-model="modelValue" :disabled="props.disabled" :required="required"
        :class="{ disabled: props.disabled }" />
    </div>
        
    <section v-else>
        <p v-if="props.label">{{ props.label }}<span v-show="props.label && props.required">*</span></p>
        <input :type="type" :placeholder="props.placeholder" v-model="modelValue" :disabled="props.disabled" :required="required"
        :class="{ disabled: props.disabled }" />
    </section>


</template>

<script setup>
const modelValue = defineModel();
const props = defineProps(["placeholder", "label", "disabled", "type", "required"]);
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


}
</style>
