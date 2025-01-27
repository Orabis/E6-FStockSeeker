<script setup>
import { ref, onMounted} from 'vue';
import { createProduct,getProducts,modifyProduct,deleteProduct,getWarehouses } from '../api.js';
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
import FileUpload from 'primevue/fileupload';
import MultiSelect from 'primevue/multiselect';

const toast = useToast();
const formatDate = (date) => DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_MED);

const products = ref([]);
const productName = ref('');
const productDescription = ref('');
const productQuantity = ref('0');
const productAlert = ref(false);
const productStockLimit = ref(null);
const base64Image = ref(null);
const registerErrors = ref({name:'',description:'',quantity:'',alert_enabled:'',stock_limit:'',image:'',warehouse_ids:''});
const editingRows = ref([]);
const selectedWarehouses = ref([]);
const warehouses = ref([]);

async function create_product() {
  registerErrors.value = {name:'',description:'',quantity:'',alert_enabled:'',stock_limit:'',warehouse_ids:''};
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
      image: base64Image.value,
      warehouse_ids: selectedWarehouses.value.map((warehouse) => warehouse.id),
    });
    products.value = await getProducts();
    products.value = enrichProducts();
    toast.add({ severity: 'success', life: 2500, summary:`${productName.value} crée`});
} catch (error){
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (data.detail) {
        toast.add({ severity: 'error',life: 2500, summary: 'Erreur', detail: data.detail });
      }
      if (data.username) {
        registerErrors.value.name = data.name[0];
      }
      if (data.description) {
        registerErrors.value.description = data.description[0];
      }
      if (data.quantity) {
        registerErrors.value.quantity = data.quantity[0];
      }
      if (data.alert_enabled) {
        registerErrors.value.alert_enabled = data.alert_enabled[0];
      }
      if (data.stock_limit) {
        registerErrors.value.stock_limit = data.stock_limit[0];
      }
      if (data.image) {
        registerErrors.value.image = data.image[0];
      }
      if (data.warehouse_ids) {
        registerErrors.value.warehouse_ids = data.warehouse_ids[0];
      }
    } else {
      toast.add({ severity: 'error',life: 2500, summary: 'Erreur', detail: 'Une erreur est survenue.' });
    }
  }
}
async function onRowEditSave(event) {
  if (event && event.data) {
    let {newData, index} = event;
    products.value[index] = newData;

    if (!newData.id) {
      console.error("No id found in edited row.");
      toast.add({ severity: 'error', life: 2500, summary: 'Error', detail: 'Aucune donnée n\'a été modifiée.' });
      return;
    }
    try {
      await modifyProduct({
        id: newData.id,
        name: newData.name,
        description: newData.description,
        quantity: newData.quantity,
        warehouse_ids: newData.warehouse.map((warehouse) => warehouse.id),
      }, 
      newData.id);
      products.value = await getProducts();
      products.value = enrichProducts();
      toast.add({ severity: 'success', life: 2500, summary: 'Succès', detail: 'Produit modifié.' });
    } catch (error) {
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.detail) {
          toast.add({ severity: 'error', life: 2500, summary: 'Erreur', detail: data.detail });
        }
      } else {
        toast.add({ severity: 'error', life: 2500, summary: 'Erreur', detail: 'Une erreur est survenue.' });
      }
  };
    } else {
    console.error("Event or event.data is undefined.");
    toast.add({ severity: 'error', life: 2500, summary: 'Error', detail: 'Aucune donnée n\'a été modifiée.' });
  }
}

async function removeProduct(id) {
  try {
    await deleteProduct(id);
    products.value = await getProducts();
    products.value = enrichProducts();
    toast.add({ severity: 'success', life: 2500, summary: 'Succès', detail: 'Produit supprimé.' });
  } catch (error) {
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (data.detail) {
        toast.add({ severity: 'error', life: 2500, summary: 'Erreur', detail: data.detail });
      }
    } else {
      toast.add({ severity: 'error', life: 2500, summary: 'Erreur', detail: 'Une erreur est survenue.' });
    }
  }
};
const enrichProducts = () => {
   return products.value.map((product) => {
    const attachedWarehouses = warehouses.value.filter((warehouse) =>
      product.warehouse_ids.includes(warehouse.id)
    );

    return {
      ...product,
      warehouses: attachedWarehouses
    };
  });
};


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

const truncate = (text, length) => {
  if (text.length > length) {
    return text.substring(0, length) + '...';
  }
  return text;
};
const handleFileUpload = (event) => {
  const file = event.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    base64Image.value = reader.result;
    toast.add({ severity: 'success', life: 2500, summary: 'Image ajouté avec succès.' });
  };
  reader.onerror = () => {
    toast.add({ severity: 'error', life: 2500, summary: 'Erreur', detail: 'Impossible de lire le fichier.' });
  };
  reader.readAsDataURL(file);
};

onMounted(async () => {
try {
  warehouses.value = await getWarehouses();
  products.value = await getProducts();
  products.value = enrichProducts();
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
  <div>
    <h2>Tableau de bord</h2>
    <div class="register form-container">
      <h2>Créer un produit</h2>
      <form @submit.prevent="create_product">
        <div class="form">
          <InputGroup>
            <InputGroupAddon>Nom :</InputGroupAddon>
            <InputText
              type="text"
              id="register-product"
              v-model="productName"
              required
            />
          </InputGroup>
          <p-message
            v-if="registerErrors.name"
            severity="error"
          >
            {{ registerErrors.name }}
          </p-message>
        </div>

        <div class="form">
          <InputGroup>
            <InputGroupAddon>Description :</InputGroupAddon>
            <InputText
              type="text"
              id="register-description"
              v-model="productDescription"
            />
          </InputGroup>
          <p-message
            v-if="registerErrors.description"
            severity="error"
          >
            {{ registerErrors.description }}
          </p-message>
        </div>

        <div class="form">
          <InputGroup>
            <InputGroupAddon>Quantité :</InputGroupAddon>
            <InputNumber
              id="register-quantity"
              inputId="integeronly"
              v-model="productQuantity"
              fluid
              required
            />
          </InputGroup>
          <p-message
            v-if="registerErrors.quantity"
            severity="error"
          >
            {{ registerErrors.quantity }}
          </p-message>
        </div>

        <div class="form">
          <InputGroup>
            <InputGroupAddon>
              Activer une alerte ?
              <Checkbox
                :binary="true"
                id="register-alert"
                v-model="productAlert"
              />
            </InputGroupAddon>
            <InputNumber
              v-if="productAlert"
              id="register-stock-limit"
              inputId="integeronly"
              v-model="productStockLimit"
              fluid
            />
          </InputGroup>
        </div>
          <div class="form">
            <InputGroup >
              <InputGroupAddon>Image :</InputGroupAddon>
              <FileUpload
              name="productImage"
              accept="image/*" 
              mode="basic"
              customUpload
              :auto="true"
              :multiple="false"
              :maxFileSize="1000000"
              :chooseLabel="'Choisir une image'"
              @uploader="handleFileUpload" 
              />
            </InputGroup>
        </div>
        <div class="form">
          <InputGroup>
              <InputGroupAddon>Entrepôt :</InputGroupAddon>
              <MultiSelect
                v-model="selectedWarehouses"
                :options="warehouses"
                optionLabel="name"
                placeholder="Sélectionner un entrepôt"
                display="chip"
                ></MultiSelect>
          </InputGroup>
        </div>
        <div class="alert">
          <p-message
            v-if="registerErrors.alert_enabled"
            severity="error">
            {{ registerErrors.alert_enabled }}
          </p-message>
          <p-message
            v-if="registerErrors.stock_limit"
            severity="error">
            {{ registerErrors.stock_limit }}
          </p-message>
          <p-message
            v-if="registerErrors.image"
            severity="error">
            {{ registerErrors.image }}
          </p-message>
          <p-message
            v-if="registerErrors.warehouse"
            severity="error">
            {{ registerErrors.warehouse }}
          </p-message>
        </div>
                <Button
          label="Créer"
          type="submit"
          class="p-button-primary"
        />
      </form>
    </div>

    <DataTable
      v-model:editingRows="editingRows"
      editMode="row"
      dataKey="id"
      @row-edit-save="onRowEditSave"
      :value="products"
      tableStyle="min-width: 50rem"
      removableSort
    >
      <template #header>
        <div class="text-end pb-4">
          <Button
            icon="pi pi-external-link"
            label="Export"
            @click="exportCSV($event)"
          />
        </div>
      </template>

      <Column field="image">
        <template #body="slotProps">
          <img
            :src="slotProps.data.image"
            style="width: 6rem"
          />
        </template>
      </Column>

      <Column field="is_stock_low" header="Stock" sortable>
        <template #body="slotProps">
          <Tag
            :severity="slotProps.data.is_stock_low
              ? 'danger'
              : 'success'"
            :value="slotProps.data.is_stock_low
              ? 'LOWSTOCK'
              : 'INSTOCK'"
          />
        </template>
      </Column>

      <Column field="name" header="Name" editor="true" sortable>
        <template #editor="slotProps">
          <InputText v-model="slotProps.data.name" fluid />
        </template>
      </Column>

      <Column field="description" header="Description" editor="true">
        <template #body="slotProps">
          <span :title="slotProps.data.description">
            {{ truncate(slotProps.data.description, 50) }}
          </span>
        </template>
        <template #editor="slotProps">
          <InputText v-model="slotProps.data.description" fluid />
        </template>
      </Column>

      <Column field="quantity" header="Quantity" editor="true" sortable>
        <template #body="slotProps">
          <Badge
            :value="slotProps.data.quantity"
            :severity="stockSeverity(slotProps.data)"
          />
        </template>
        <template #editor="slotProps">
          <InputNumber v-model="slotProps.data.quantity" fluid />
        </template>
      </Column>
      <Column header="Entrepôt" editor="true" sortable> 
        <template #body="slotProps">
          <span v-for="warehouse in slotProps.data.warehouses" :key="warehouse.id">
            {{ warehouse.name }},
          </span>
        </template>
        <template #editor="slotProps">
          <MultiSelect
            v-model="slotProps.data.warehouse"
            :options="warehouses"
            optionLabel="name"
            placeholder="Sélectionner un entrepôt"
          ></MultiSelect>
        </template>
      </Column>

      <Column editor="true">
        <template #editor="slotProps">
          <Button
            icon="pi pi-times"
            class="p-button-rounded p-button-danger"
            @click="removeProduct(slotProps.data.id)"
          />
        </template>
      </Column>
      <Column
        :rowEditor="true"
        style="width: 10%; min-width: 8rem"
        bodyStyle="text-align:center"
      />
    </DataTable>
  </div>
</template>
