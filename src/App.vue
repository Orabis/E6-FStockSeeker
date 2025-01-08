
<script setup>
import Button from "primevue/button"
import InputText from 'primevue/inputtext';
import HelloWorld from "./components/HelloWorld.vue";

</script>

<template>
  <span>Test PrimeVue</span>
  <div>
    <Button label="Save" />
    <InputText type="text" v-model="value" />
  </div>
  <HelloWorld>
  </HelloWorld>
</template>
