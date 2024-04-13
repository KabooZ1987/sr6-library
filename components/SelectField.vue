<template>
    <div>
        <p>{{ props.label }}<span v-if="props.label">*</span></p>
        <select v-model="modelValue" :required="props.required">
            <option selected disabled value="">{{ props.selected }}</option>
            <option v-for="option in props.options" :key="option.value" :value="option.value">{{ option.label }}
            </option>
        </select>
    </div>
</template>

<script setup>
const modelValue = defineModel()
const props = defineProps(['label', 'required', 'options', 'selected'])
</script>




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





<!-- 
            { label: "edge", value: "edge" },
            { label: "magic", value: "magic" },
            { label: "combat", value: "combat" },
            { label: "decking", value: "decking" },
            { label: "rigging", value: "rigging" },
            { label: "regeneration", value: "regeneration" },
            { label: "critter", value: "critter" },
            { label: "spirits", value: "spirits" },
            { label: "other", value: "other" }
 -->