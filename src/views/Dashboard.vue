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

const products = ref();
const warehouses = ref();

const selectedRef = ref()
const filteredRef = ref();
const newValue = ref();

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
    chartProductsData.value = setChartProductsData();
    chartWarehousesData.value = setChartWarehousesData();
})

const productValueModifier = async () => {
    if (!selectedRef.value || !newValue.value) return;

    const product = products.value.find(p => p.reference === selectedRef.value.reference);
    if (product) {
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
            console.error(error)
        }
    } else {
        console.error("no product found")
    }
};
    
</script>

<template>

    <Fieldset legend="Produits stockés" style="max-width: 600px; margin: auto; padding:20px" toggleable>
        <Chart type="pie" :data="chartProductsData" :options="chartOptions"></Chart>
    </Fieldset>
    <Fieldset legend="Listes des Entrepôts" style="max-width: 600px; margin: auto; padding:20px" toggleable>
        <Chart type="bar" :data="chartWarehousesData" :options="chartOptions"></Chart>
    </Fieldset>
    <Fieldset legend="Used capacity" style="max-width: 600px; margin: auto; padding:20px" toggleable>
        <ul>
            <li v-for="warehouse in warehouses" :key="warehouse.id" style="list-style-type: none;">
                {{ warehouse.name }}
                <MeterGroup :value="getProductValues(warehouse)"></MeterGroup>
            </li>
        </ul>
    </Fieldset>
    <Fieldset legend="Products" style="max-width: 600px; margin: auto; padding:20px" toggleable>
        <form @submit.prevent="productValueModifier">
            <IftaLabel>
                <AutoComplete inputId="reference" name="reference" optionLabel="reference" variant="filled" :suggestions="filteredRef" v-model="selectedRef" @complete="search"></AutoComplete>
                <label for="reference">Reference</label>
            </IftaLabel>
            <IftaLabel>
                <InputNumber inputId="number-value" showButtons v-model="newValue" mode="decimal"></InputNumber>
                <label for="number-value">Ajouter/Soustraire</label>
            </IftaLabel>
            <Button
                label="update"
                type="submit"
                class="p-button-primary"> </Button>
        </form>
        <Carousel :value="products" 
        :numVisible="3" 
        :numScroll="1" 
        >
            <template #item="slotProps">
                <span v-if="slotProps.data.alert_enabled && slotProps.data.is_stock_low" style="color:red">
                    <Tag severity="danger" value="STOCK FAIBLE" rounded> </Tag>
                </span>
                <span v-else>
                    <Tag severity="info" value="STOCK OK" rounded> </Tag>
                </span>
                <p>{{ slotProps.data.name }}</p>
                <p>{{ slotProps.data.reference }}</p>
                <p>{{ slotProps.data.quantity }}</p>
                <img :src="slotProps.data.image" alt="" style="border-radius: 8px; width: 150px;">
            </template>
        </Carousel>
    </Fieldset>
    <Fieldset legend="Warehouses" style="max-width: 600px; margin: auto; padding:20px" toggleable>
        <Carousel :value="warehouses" 
        :numVisible="3" 
        :numScroll="1" 
        >
            <template #item="slotProps">
                <p>{{ slotProps.data.name }}</p>
                <p>{{ slotProps.data.location }}</p>
                <p>{{ slotProps.data.max_capacity }}</p>
            </template>
        </Carousel>
    </Fieldset>
</template>