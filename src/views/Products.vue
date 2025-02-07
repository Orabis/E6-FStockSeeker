<script setup>
import { ref, onMounted} from 'vue';
import { createProduct,getProducts,modifyProduct,deleteProduct,getWarehouses } from '../api.js';
import { useToast } from 'primevue/usetoast';
import { DateTime } from 'luxon';

import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import PMessage from 'primevue/message';
import InputNumber from 'primevue/inputnumber';
import IftaLabel from 'primevue/iftalabel';
import Checkbox from 'primevue/checkbox';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import FileUpload from 'primevue/fileupload';
import MultiSelect from 'primevue/multiselect';
import Dialog from 'primevue/dialog';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';

const toast = useToast();
const formatDate = (date) => DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_MED);

const products = ref([]);

const visible = ref(false);

const productName = ref('');
const productReference = ref('');
const productDescription = ref('');
const productQuantity = ref(0);
const productAlert = ref(false);
const productStockLimit = ref(null);
const b64Img = ref(null);
const b64Modif = ref(null);
const selectedWarehouses = ref([]);

const registerErrors = ref({});
const modifyErrors =  ref({});
const editingRows = ref([]);
const warehouses = ref([]);

async function create_product() {
  if (productAlert.value && !productStockLimit.value) {
    registerErrors.value.stock_limit = 'Veuillez renseigner une limite de stock.';
    return;
  }
  registerErrors.value = {};
  try {
    await createProduct({
      name: productName.value,
      reference: productReference.value,
      description: productDescription.value,
      quantity: productQuantity.value,
      alert_enabled: productAlert.value,
      stock_limit: productStockLimit.value,
      image: b64Img.value,
      warehouses: selectedWarehouses.value.map((warehouse) => warehouse.id),
    });
    warehouses.value = await getWarehouses();
    products.value = await getProducts();
    products.value = enrichProducts();
    resetForms();
    toast.add({ severity: 'success', life: 2500, summary:`${productName.value} crée`});
} catch (error){
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (data.detail) {
        toast.add({ severity: 'error',life: 2500, summary: 'Erreur', detail: data.detail });
      }
      registerErrors.value = {
        name: data.name ? data.name[0] : "",
        description: data.description ? data.description[0]: "",
        reference: data.reference ? data.reference[0]: "",
        quantity: data.quantity ? data.quantity[0] : "",
        alert_enabled: data.alert_enabled ? data.alert_enabled[0] : "",
        stock_limit: data.stock_limit ? data.stock_limit[0] : "",
        image: data.image ? data.image[0] : "",
        warehouses: data.warehouses ? data.warehouses[0] : "",
      }
    } else {
      toast.add({ severity: 'error',life: 2500, summary: 'Erreur', detail: 'Une erreur est survenue.' });
    }
  }
}

function resetForms() {
  productName.value = '';
  productDescription.value = '';
  productReference.value = '';
  productQuantity.value = 0;
  productAlert.value = false;
  productStockLimit.value = null;
  b64Img.value = null;
  b64Modif.value = null;
  selectedWarehouses.value = [];
};

function resetImg(modifImg = false){
  if (modifImg){
    b64Modif.value = null;
    return
  }
  b64Img.value = null;
};

async function onRowEditSave(event) {
  if (event && event.data) {
    let {newData, index} = event;
    products.value[index] = newData;

    if (!newData.id) {
      console.error("No id found in edited row.");
      toast.add({ severity: 'error', life: 2500, summary: 'Error', detail: 'Aucune donnée n\'a été modifiée.' });
      return;
    }
    modifyErrors.value[newData.id] = {};
    let tableDatas = {}
    console.log(b64Modif)
    try {
      if (b64Modif.value){
        tableDatas = {
          id: newData.id,
          name: newData.name,
          reference: newData.reference,
          description: newData.description,
          quantity: newData.quantity,
          image: b64Modif.value,
          warehouses: newData.warehouse.map((warehouse) => warehouse.id),
        }
    } else {
        tableDatas = {
          id: newData.id,
          name: newData.name,
          reference: newData.reference,
          description: newData.description,
          quantity: newData.quantity,
          warehouses: newData.warehouse.map((warehouse) => warehouse.id),
          }
        }
      await modifyProduct(tableDatas,newData.id);
      warehouses.value = await getWarehouses();
      products.value = await getProducts();
      products.value = enrichProducts();
      resetForms();
      toast.add({ severity: 'success', life: 2500, summary: 'Succès', detail: 'Produit modifié.' });
  } catch (error) {
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.detail) {
          toast.add({ severity: 'error',life: 2500, summary: 'Erreur', detail: data.detail });
        }
        modifyErrors.value[newData.id] = {
          name: data.name ? data.name[0] : "",
          description: data.description ? data.description[0]: "",
          reference: data.reference ? data.reference[0]: "",
          quantity: data.quantity ? data.quantity[0] : "",
          alert_enabled: data.alert_enabled ? data.alert_enabled[0] : "",
          stock_limit: data.stock_limit ? data.stock_limit[0] : "",
          image: data.image ? data.image[0] : "",
          warehouses: data.warehouses ? data.warehouses[0] : "",
        };
      } else {
        toast.add({ severity: 'error', life: 2500, summary: 'Erreur', detail: 'Une erreur est survenue.' });
      }
    }
  }
}
function onRowEditInit(event) {
  const { data } = event;
  data.warehouse = data.warehouses.map(warehouse => ({ ...warehouse }));
}

async function removeProduct(id) {
  try {
    await deleteProduct(id);
    editingRows.value = [];
    warehouses.value = await getWarehouses();
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
      product.warehouses.includes(warehouse.id)
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
const handleFileUpload = (event, iscreated) => {
  const file = event.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    if (iscreated){
      b64Img.value = reader.result;
    } else {
      b64Modif.value = reader.result;
    }
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
      <Button label="Crée un nouveau produit" @click="visible = true" />
      <Dialog v-model:visible="visible" modal header="Nouveau Produit" :style="{ width: '25rem' }">
      <form @submit.prevent="create_product">
        <div class="form">
          <IftaLabel>
            <InputText
              name="register-product"
              type="text"
              id="register-product"
              v-model="productName"
              required
              fluid
            />
            <label for="register-product">Nom :</label>
          </IftaLabel>
          <p-message
            v-if="registerErrors.name"
            severity="error"
          >
            {{ registerErrors.name }}
          </p-message>
        </div>
        <div class="form">
          <IftaLabel>
            <InputText
              type="text"
              id="register-reference"
              v-model="productReference"
              fluid
            />
            <label for="register-reference">Reference :</label>
          </IftaLabel>
          <p-message
            v-if="registerErrors.description"
            severity="error"
          >
            {{ registerErrors.description }}
          </p-message>
        </div>

        <div class="form">
          <IftaLabel>
            <InputText
              type="text"
              id="register-description"
              v-model="productDescription"
              fluid
            />
            <label for="register-description">Description :</label>
          </IftaLabel>
          <p-message
            v-if="registerErrors.description"
            severity="error"
          >
            {{ registerErrors.description }}
          </p-message>
        </div>

        <div class="form">
          <IftaLabel>
            <InputNumber
              id="register-quantity"
              inputId="integeronly"
              v-model="productQuantity"
              fluid
              required
            />
            <label for="register-quantity">Quantité :</label>
          </IftaLabel>
        </div>

        <div class="form">
          <InputGroup>
            <InputGroupAddon> 
              <Checkbox
                :binary="true"
                id="register-alert"
                v-model="productAlert"
              />
            </InputGroupAddon>
            <IftaLabel>
              <InputNumber
                :disabled="!productAlert"
                id="register-stock-limit"
                inputId="integeronly"
                v-model="productStockLimit"
                fluid
              />
              <label for="register-stock-limit">Alerte en dessous de :</label>
          </IftaLabel>
          </InputGroup>
        </div>
        <div class="form">
          <IftaLabel>
              <MultiSelect
                name="register-warehouses"
                v-model="selectedWarehouses"
                :options="warehouses"
                optionLabel="name"
                placeholder="Sélectionner un entrepôt"
                :invalid="!!registerErrors.warehouses"
                fluid
                ></MultiSelect>
                <label for="register-warehouses">Entrepôt :</label>
          </IftaLabel>
        </div>
          <div class="form">
              <FileUpload
                name="productImage"
                accept="image/*" 
                mode="basic"
                customUpload
                :auto="true"
                :multiple="false"
                :maxFileSize="1000000"
                :chooseLabel="'Choisir une image'"
                @uploader="handleFileUpload($event,true)" 
                />
              <div v-if="b64Img">
                <img :src="b64Img" alt="Image" style="width: 6rem">
                <Button icon="pi pi-times" severity="secondary" @click="resetForms()"/>
              </div>
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
            v-if="registerErrors.warehouses"
            severity="error">
            {{ registerErrors.warehouses }}
          </p-message>
          <p-message
            v-if="registerErrors.quantity"
            severity="error"
          >
            {{ registerErrors.quantity }}
          </p-message>
          <p-message
            v-if="registerErrors.reference"
            severity="error"
          >
            {{ registerErrors.reference }}
          </p-message>
        </div>
        <Button type="button" label="Cancel" severity="secondary" class="p-button-text" @click="visible = false" autofocus />
        <Button
          label="Créer"
          type="submit"
          class="p-button-primary"
          @click="visible = false"
        />
      </form>
      </Dialog>
    </div>

    <DataTable
      v-model:editingRows="editingRows"
      editMode="row"
      dataKey="id"
      @row-edit-save="onRowEditSave"
      @row-edit-init="onRowEditInit"
      :value="products"
      tableStyle="min-width: 50rem"
      removableSort
    >


      <Column field="image"editor="true">
        <template #body="slotProps">
          <img
            :src="slotProps.data.image"
            style="width: 6rem"
          />
        </template>
        <template #editor>
          <FileUpload
          name="editProductImage"
          accept="image/*"
          mode="basic"
          customUpload
          :auto="true"
          :multiple="false"
          :maxFileSize="1000000"
          :chooseLabel='"modifier image"'
          @uploader="handleFileUpload($event,false)"
          >
        </FileUpload>
        <div v-if="b64Modif">
          <img :src="b64Modif" alt="Image" style="width: 6rem">
          <Button icon="pi pi-times" severity="secondary" @click="resetImg(true)"/>
        </div>
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
        <template #body="slotProps">
          <span v-if="!modifyErrors[slotProps.data.id]?.name">{{ slotProps.data.name }}</span>
          <p-message v-if="modifyErrors[slotProps.data.id]?.name" severity="error">{{ modifyErrors[slotProps.data.id].name }}</p-message>
        </template>
        <template #editor="slotProps">
          <InputText v-model="slotProps.data.name" fluid />
        </template>
      </Column>

      <Column field="reference" header="reference" editor="true" sortable>
        <template #body="slotProps">
          <span v-if="!modifyErrors[slotProps.data.id]?.reference">{{ slotProps.data.reference }}</span>
          <p-message v-if="modifyErrors[slotProps.data.id]?.reference" severity="error">{{ modifyErrors[slotProps.data.id].reference }}</p-message>
        </template>
        <template #editor="slotProps">
          <InputText v-model="slotProps.data.reference" fluid />
        </template>
      </Column>


      <Column field="description" header="Description" editor="true">
        <template #body="slotProps">
          <span v-if="!modifyErrors[slotProps.data.id]?.description" :title="slotProps.data.description">
            {{ truncate(slotProps.data.description, 50) }}
          </span>
          <p-message v-if="modifyErrors[slotProps.data.id]?.description" severity="error">{{ modifyErrors[slotProps.data.id].description }}</p-message>
        </template>
        <template #editor="slotProps">
          <InputText v-model="slotProps.data.description" fluid />
        </template>
      </Column>

      <Column field="quantity" header="Quantity" editor="true" sortable>
        <template #body="slotProps">
          <Badge v-if="!modifyErrors[slotProps.data.id]?.quantity"
            :value="slotProps.data.quantity"
            :severity="stockSeverity(slotProps.data)"
          />
          <p-message v-if="modifyErrors[slotProps.data.id]?.quantity" severity="error">{{ modifyErrors[slotProps.data.id].quantity }}</p-message>
        </template>
        <template #editor="slotProps">
          <InputNumber v-model="slotProps.data.quantity" fluid />
        </template>
      </Column>
      <Column header="Entrepôt" editor="true" sortable> 
        <template #body="slotProps">
          <span v-if="!modifyErrors[slotProps.data.id]?.warehouses" v-for="warehouse in slotProps.data.warehouses" :key="warehouse.id">
            {{ warehouse.name }}({{ warehouse.actual_capacity }}/{{ warehouse.max_capacity }}),
          </span>
          <p-message v-if="modifyErrors[slotProps.data.id]?.warehouses" severity="error">{{ modifyErrors[slotProps.data.id].warehouses }}</p-message>
        </template>
        <template #editor="slotProps">
          <MultiSelect
            v-model="slotProps.data.warehouse"
            :options="warehouses"
            optionLabel="name"
            placeholder="Sélectionner un entrepôt"
            :invalid="!!modifyErrors[slotProps.data.id]?.warehouses"
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
