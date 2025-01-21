<script setup>
import { createProduct,getProducts } from '../api.js';
import { useToast } from 'primevue/usetoast';
import { DateTime } from 'luxon';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import PMessage from 'primevue/message';
import InputNumber from 'primevue/inputnumber';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Checkbox from 'primevue/checkbox';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';

import { ref, onMounted} from 'vue';
const toast = useToast();
const formatDate = (date) => DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_MED);

const products = ref([]);
const productName = ref('');
const productDescription = ref('');
const productQuantity = ref('');
const productAlert = ref(false);
const productStockLimit = ref(null);
const registerErrors = ref({name:'',description:'',quantity:'',alert_enabled:'',stock_limit:'',});
const editingRows = ref([]);
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
    products.value = await getProducts();
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
async function onRowEditSave(event) {
  if (event && event.data) {
    const editedRow = event.data;
    console.log(editedRow);
  } else {
    console.error("Event or event.data is undefined.");
    toast.add({ severity: 'error', life: 2500, summary: 'Error', detail: 'Aucune donnée n\'a été modifiée.' });
  }
}
const stockSeverity = (data) => {
  if (!data) return 'info';
  
  const quantity = data.quantity;
  
  if (quantity <= 5) {
    return 'danger';
  } else if (quantity > 5 && quantity <= 20) {
    return 'success';
  } else {
    return 'warning';
  }
};
onMounted(async () => {
try {
  products.value = await getProducts();
  products.value.forEach((product) => {
    product.creation_date = formatDate(product.creation_date);
    product.modification_date = formatDate(product.modification_date);
  });
} catch (error){
  if (error.response && error.response.data) {
    const data = error.response.data;
    if (data.detail) {
      toast.add({ severity: 'error',life: 2500, summary: 'Erreur', detail: data.detail });
    }
  } else {
    toast.add({ severity: 'error',life: 2500, summary: 'Erreur', detail: 'Une erreur est survenue.' });
  }
}
});
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

    <DataTable v-model:editingRows="editingRows" editMode="row" dataKey="id" @row-edit-save="onRowEditSave" :value="products" tableStyle="min-width: 50rem" removableSort >
      <template #header>
        <div class="text-end pb-4">
            <Button icon="pi pi-external-link" label="Export" @click="exportCSV($event)" />
        </div>
    </template>
      <Column field="is_stock_low" header="Stock" sortable>
        <template #body="slotProps">
          <Tag :severity="!slotProps.data.alert_enabled ? 'info' : (slotProps.data.is_stock_low ? 'danger' : 'success')" :value="!slotProps.data.alert_enabled ? 'NOALARMSET' : (slotProps.data.is_stock_low ? 'LOWSTOCK' : 'INSTOCK')"/>
        </template>
      </Column>
      <Column field="name" header="Name" sortable>
        <template #editor="{data, field}">
          <InputText v-model="data[field]" fluid />
        </template>
      </Column>
      <Column field="description" header="description">
        <template #editor="{data, field}">
          <InputText v-model="data[field]" fluid />
        </template>
      </Column>
      <Column field="quantity" header="Quantity" sortable>
        <template #body="slotProps">
          <Badge :value="slotProps.data.quantity" :severity="stockSeverity(slotProps.data)"/>
        </template>
        <template #editor="{data, field}">
          <InputNumber v-model="data[field]" fluid />
        </template>
      </Column>
      <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
  </DataTable>
</template>
  