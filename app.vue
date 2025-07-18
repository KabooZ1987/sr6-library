<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    
    <!-- Global Toast Container -->
    <Toast position="top-right" group="default" />
    <Toast position="top-right" group="table-notifications" />
    
    <!-- Global Confirmation Dialog -->
    <ConfirmDialog group="default" />
    <ConfirmDialog group="table-actions" />
  </div>
</template>

