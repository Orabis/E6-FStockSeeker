<script setup>
import { ref, onMounted} from 'vue';
import Chart from 'primevue/chart';
import Fieldset from 'primevue/fieldset';
import MeterGroup from 'primevue/metergroup';
import Carousel from 'primevue/carousel';
import { getProducts,getWarehouses } from '../api.js';
import Tag from 'primevue/tag';

const products = ref();
const warehouses = ref();
const chartData = ref();
const productColors = {};
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

const setChartData = () => {
    return {
        labels: products.value.map(product => product.name),
        datasets: [
            {
                label: 'Quantité',
                backgroundColor: products.value.map(product => getColorForProduct(product.name)), 
                data: products.value.map(product => product.quantity)
            }
        ]
    };
};

onMounted(async () => {
    warehouses.value = await getWarehouses();
    products.value = await getProducts();
    chartData.value = setChartData();
})
</script>

<template>
    <Fieldset legend="Graph" style="max-width: 600px; margin: auto; padding:20px" toggleable>
        <Chart type="pie" :data="chartData"></Chart>
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
                <p>{{ slotProps.data.quantity }}</p>
                <img :src="slotProps.data.image" alt="" style="border-radius: 8px; width: 150px;">
            </template>
        </Carousel>
    </Fieldset>
    <Fieldset legend="Warehouses" style="max-width: 600px; margin: auto; padding:20px" toggleable>

        
    </Fieldset>
</template>