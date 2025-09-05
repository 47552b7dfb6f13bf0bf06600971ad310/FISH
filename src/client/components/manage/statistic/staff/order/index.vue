<template>
  <ManageStatisticStaffOrderAbout :staff="staff" :type="type" :range="range" :update="update" />
  <ManageStatisticStaffOrderList :staff="staff" :type="type" :range="range" :update="update" />
</template>

<script setup>
const props = defineProps(['staff', 'type', 'range', 'update'])
</script>