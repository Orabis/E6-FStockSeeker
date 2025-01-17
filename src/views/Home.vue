<script setup>
import { createProduct } from '../api.js';
import { useToast } from 'primevue/usetoast';

import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import PMessage from 'primevue/message';
import InputNumber from 'primevue/inputnumber';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Checkbox from 'primevue/checkbox';


import { ref } from 'vue';

const toast = useToast();

const productName = ref('');
const productDescription = ref('');
const productQuantity = ref('');
const productAlert = ref(false);
const productStockLimit = ref(null);

const registerErrors = ref({name:'',description:'',quantity:'',alert_enabled:'',stock_limit:'',});

async function create_product() {
  registerErrors.value = {name:'',description:'',quantity:'',alert_enabled:'',stock_limit:'',};
  if (productAlert.value && !productStockLimit.value) {
    registerErrors.value.stock_limit = 'Veuillez renseigner une limite de stock.';
    return;
  }
  try {
    await createProduct({
      name: productName.value,
      description: productDescription.value,
      quantity: productQuantity.value,
      alert_enabled: productAlert.value,
      stock_limit: productStockLimit.value,
    })
    toast.add({ severity: 'success', life: 2500, summary:`${productName.value} crée`});
} catch (error){
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (data.detail) {
        toast.add({ severity: 'error',life: 2500, summary: 'Erreur', detail: data.detail });
      }
      if (data.username) {
        loginErrors.value.name = data.name[0];
      }
      if (data.description) {
        loginErrors.value.description = data.description[0];
      }
      if (data.quantity) {
        loginErrors.value.quantity = data.quantity[0];
      }
      if (data.alert_enabled) {
        loginErrors.value.alert_enabled = data.alert_enabled[0];
      }
      if (data.stock_limit) {
        loginErrors.value.stock_limit = data.stock_limit[0];
      }
    } else {
      toast.add({ severity: 'error',life: 2500, summary: 'Erreur', detail: 'Une erreur est survenue.' });
    }
  }
}
</script>

<template>
    <h2>Tableau de bord</h2>
    <div class="register form-container">
      <h2>Créer un produit</h2>
      <form @submit.prevent="create_product">
        <div class="form">
          <InputGroup>
            <InputGroupAddon>Nom :</InputGroupAddon>
            <InputText type="text" id="register-product" v-model="productName" required />
          </InputGroup>
          <p-message v-if="registerErrors.name" severity="error">
            {{ registerErrors.name }}
          </p-message>
        </div>
  
        <div class="form">
          <InputGroup>
            <InputGroupAddon>Description :</InputGroupAddon>
            <InputText type="text" id="register-description" v-model="productDescription" />
          </InputGroup>
          <p-message v-if="registerErrors.description" severity="error">
            {{ registerErrors.description }}
          </p-message>
        </div>

        <div class="form">
          <InputGroup>
            <InputGroupAddon>Quantité :</InputGroupAddon>
            <InputNumber id="register-quantity" inputId="integeronly" v-model="productQuantity" fluid required />
          </InputGroup>
          <p-message v-if="registerErrors.quantity" severity="error">
            {{ registerErrors.quantity }}
          </p-message>
        </div>

        <div class="form">
          <InputGroup>
            <InputGroupAddon>Activer une alerte ?<Checkbox  type="text" :binary="true" id="register-alert" v-model="productAlert" /></InputGroupADdon>
            <InputNumber v-if="productAlert" id="register-stock-limit" inputId="integeronly" v-model="productStockLimit" fluid/>
          </InputGroup>
          <p-message v-if="registerErrors.alert_enabled" severity="error">
            {{ registerErrors.alert_enabled }}
          </p-message>
          <p-message v-if="registerErrors.stock_limit" severity="error">
            {{ registerErrors.stock_limit }}
          </p-message>
        </div>
  
        <Button label="Créer" type="submit" class="p-button-primary" />
      </form>
    </div>
  </template>
  