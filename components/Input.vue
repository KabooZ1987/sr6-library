<template>
    <div>
        <p>{{ props.label }}<span v-if="props.label">*</span></p>
        <input 
        :type="text" 
        :placeholder="props.placeholder" 
        :value="props.modelValue" 
        @input="handleInput" 
        :disabled="props.disabled" 
        :class="{ 'disabled': props.disabled }" >
    </div>
</template>

<script setup>



const props = defineProps(['modelValue', 'placeholder', 'label', 'disabled'])
const emit = defineEmits(['update'])




const handleInput = (event) =>{
    emit('update',event.target.value)
}


</script>




<!-- <p>Name<span>*</span></p>
<input type="text" :placeholder="dataOfEachRow.name" v-model="Name"> -->



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

    .disabled{
        margin-top: 24px;
    }


}
</style>