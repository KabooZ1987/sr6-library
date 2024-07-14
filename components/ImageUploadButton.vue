<template>
    <div>
        <!-- TODO: make it work to be image or button -->
        <FileUpload mode="basic" name="demo[]" url="/api/upload_image" accept="image/*" :maxFileSize="1000000" @upload="onUpload" :auto="true" chooseLabel="Browse" />
    </div>
</template>

<script setup >

const onUpload = () => {
    console.log("hello world");
}

</script>


<style lang="scss">
    
</style>