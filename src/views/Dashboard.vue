<script setup>
import { ref, onMounted} from 'vue';
import Chart from 'primevue/chart';
import Fieldset from 'primevue/fieldset';
import MeterGroup from 'primevue/metergroup';
import Carousel from 'primevue/carousel';
import { getProducts,getWarehouses, modifyProduct } from '../api.js';
import Tag from 'primevue/tag';
import AutoComplete from 'primevue/autocomplete';
import InputNumber from 'primevue/inputnumber';
import IftaLabel from 'primevue/iftalabel';
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast';
import Divider from 'primevue/divider';
import ScrollPanel from 'primevue/scrollpanel';
import Chip from 'primevue/chip';
import PMessage from 'primevue/message';

const toast = useToast();

const products = ref([]);
const warehouses = ref([]);

const selectedRef = ref()
const filteredRef = ref();
const newValue = ref();

const modifyErrors = ref({});
const chartProductsData = ref();
const chartWarehousesData = ref();
const chartOptions = {plugins:{legend:{labels:{usePointStyle:true,}}}};
const productColors = {};
const warehouseColors ={};
const colorsSchemes = [
    "#40407a", "#706fd3", "#f7f1e3", "#34ace0",
    "#33d9b2", "#2c2c54", "#474787", "#aaa69d",
    "#227093", "#218c74", "#ff5252", "#ff793f",
    "#d1ccc0", "#ffb142", "#ffda79", "#b33939",
    "#cd6133", "#84817a", "#cc8e35", "#ccae62"
];

const getProductValues = (warehouse) => {
    if (!products.value) return [];
    return products.value
        .filter(product => product.warehouses.includes(warehouse.id))
        .map(product => ({
            label: product.name,
            color: getColorForProduct(product.name),
            value: (product.quantity * 100) / warehouse.max_capacity
        }));
};

const getColorForProduct = (productName) => {
    if (!productColors[productName]) {
        productColors[productName] = colorsSchemes[Object.keys(productColors).length % colorsSchemes.length];
    }
    return productColors[productName];
};
const getColorForWarehouse = (warehouseName) => {
    if (!warehouseColors[warehouseName]) {
        warehouseColors[warehouseName] = colorsSchemes[Object.keys(warehouseColors).length % colorsSchemes.length];
    }
    return warehouseColors[warehouseName];
};



const setChartProductsData = () => {
    return {
        labels: products.value.map(product => product.name),
        datasets: [
            {
                label: 'Quantité',
                backgroundColor: products.value.map(product => `${getColorForProduct(product.name)}80`), 
                borderColor : products.value.map(product => getColorForProduct(product.name)),
                data: products.value.map(product => product.quantity),
                borderWidth: 1,
            }
        ]
    };
};

const setChartWarehousesData = () =>{
    return {
        labels: warehouses.value.map(warehouse => warehouse.name),
        datasets: [
            {
                label: 'Capacité',
                backgroundColor: warehouses.value.map(warehouse => `${getColorForWarehouse(warehouse.name)}80`),
                borderColor : warehouses.value.map(warehouse => getColorForWarehouse(warehouse.name)),
                data: warehouses.value.map(warehouse => warehouse.max_capacity),
                borderWidth: 1
            }
        ]
    }
};

const search = (event) => {
    filteredRef.value = products.value.filter(product => 
        product.reference.toLowerCase().includes(event.query.toLowerCase())
    );
}
onMounted(async () => {
    warehouses.value = await getWarehouses();
    products.value = await getProducts();
    makeAlert(products.value.filter(productsAlerts => productsAlerts.is_stock_low && productsAlerts.alert_enabled))
    chartProductsData.value = setChartProductsData();
    chartWarehousesData.value = setChartWarehousesData();
})

const productValueModifier = async () => {
    if (!selectedRef.value || !newValue.value) return;

    const product = products.value.find(p => p.reference === selectedRef.value.reference);
    if (product) {
        modifyErrors.value = {};
        const newQuantity = product.quantity + newValue.value
        try{
            await modifyProduct({
                quantity: newQuantity,
                warehouses: product.warehouses
            }, product.id);
            warehouses.value = await getWarehouses();
            products.value = await getProducts();
            chartProductsData.value = setChartProductsData();
            chartWarehousesData.value = setChartWarehousesData();
        } catch (error){
            if (error.response && error.response.data) {
                const data = error.response.data;
                if (data.detail) {
                    toast.add({ severity: 'error',life: 2500, summary: 'Erreur', detail: data.detail });
                };
                modifyErrors.value = { quantity: data.quantity ? data.quantity[0]:"" }
            };
        }
    } else {
        toast.add({ severity: 'error',life: 2500, summary: 'Erreur', detail: 'Une erreur est survenue.' });
    }
};
function makeAlert(productsAlerts){
    productsAlerts.forEach(product => toast.add({ severity: 'warn', life: 4500, summary:`Attention ${product.name} est dessous du seuil définie`}));
}
</script>

<template>
    <div class="fieldset-container">
        <Fieldset class="fieldset-section fieldset-p-graph" legend="Produits stockés" >
            <Chart type="pie" :data="chartProductsData" :options="chartOptions"></Chart>
        </Fieldset>
        <Fieldset class="fieldset-section fieldset-wh-graph" legend="Listes des Entrepôts" >
            <Chart type="bar" :data="chartWarehousesData" :options="chartOptions"></Chart>
        </Fieldset>
        <Fieldset class="fieldset-section fieldset-capacity-usage" legend=" Capacité utilisé" >
            <ScrollPanel style="width: 100%; height: 20rem">
            <ul>
                <li v-for="warehouse in warehouses" :key="warehouse.id">
                    <h4>{{ warehouse.name }}</h4>
                    <MeterGroup :value="getProductValues(warehouse)"></MeterGroup>
                    <Divider />
                </li>
            </ul>
        </ScrollPanel>
        </Fieldset>
        <Fieldset class="fieldset-section fieldset-quickadd" legend="Ajout Rapide" >
            <form class="form-update-user" @submit.prevent="productValueModifier">
                <IftaLabel>
                    <AutoComplete inputId="reference" name="reference" optionLabel="reference" :suggestions="filteredRef" v-model="selectedRef" @complete="search" fluid></AutoComplete>
                    <label for="reference">Réference :</label>
                </IftaLabel>
                <IftaLabel>
                    <InputNumber inputId="number-value" showButtons v-model="newValue" mode="decimal" fluid></InputNumber>
                    <label for="number-value">Ajouter/Soustraire :</label>
                </IftaLabel>
                <p-message v-if="modifyErrors.quantity" severity="error">{{ modifyErrors.quantity }}</p-message>
                <Button
                    label="Modifier"
                    icon="pi pi-file-edit
"
                    type="submit"
                    class="p-button-primary"> </Button>
            </form>
        </Fieldset>
        <Fieldset class="fieldset-section fieldset-list-wh-p" legend="Products et Entrepôt">
            <h4 v-if="products.length === 0">
                <i class="pi pi-exclamation-circle"></i>
                Aucun produit renseigné
            </h4>
            <Carousel v-else :value="products" 
            :numVisible="2" 
            :numScroll="1"
            class="carousmex"
            >
                <template #item="slotProps">
                    <div class="carousel-products">
                        <span v-if="slotProps.data.alert_enabled && slotProps.data.is_stock_low">
                            <Tag icon="pi pi-box"severity="danger" value="STOCK FAIBLE" rounded> </Tag>
                        </span>
                        <span v-else>
                            <Tag icon="pi pi-box" severity="info" value="STOCK OK" rounded> </Tag>
                        </span>
                        <img v-if="slotProps.data.image" :src="slotProps.data.image" alt="" style="border-radius: 8px; width: 6rem; height: 6rem;">
                        <i v-if="!slotProps.data.image" class="pi pi-eye-slash" style="font-size: 6rem"></i>
                        <Chip icon="pi pi-box" :label="String(slotProps.data.quantity)"/>
                        <Chip icon="pi pi-hashtag" :label="String(slotProps.data.reference)"></Chip>
                    </div>
                </template>
            </Carousel>
            <Divider />
            <h4 v-if="warehouses.length === 0">
                <i class="pi pi-exclamation-circle"></i>
                Aucun entrepôt renseigné
            </h4>
            <Carousel v-else :value="warehouses" 
            :numVisible="2" 
            :numScroll="1" 
            class="carousmex"
            >
                <template #item="slotProps" >
                    <div class="carousel-products">
                        <h4>{{ slotProps.data.name }}</h4>
                        <Chip icon="pi pi-map-marker" :label="slotProps.data.location"></Chip>
                        <Chip icon="pi pi-shop" :label="`${slotProps.data.max_capacity}`"></Chip>
                    </div>
                </template>
            </Carousel>
        </Fieldset>

    </div>
</template>