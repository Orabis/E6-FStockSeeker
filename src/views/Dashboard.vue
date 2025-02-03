<script setup>
import { ref, onMounted} from 'vue';
import Chart from 'primevue/chart';
import Fieldset from 'primevue/fieldset';
import { getProducts,getWarehouses } from '../api.js';

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
        <p>test</p>
        <Chart type="pie" :data="chartData"></Chart>
    </Fieldset>
</template>