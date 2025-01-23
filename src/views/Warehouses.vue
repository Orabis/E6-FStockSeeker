<script setup>
import { ref, onMounted } from 'vue';
import { createWarehouse, getWarehouses, modifyWarehouse, deleteWarehouse } from '../api.js';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import PMessage from 'primevue/message';
import InputNumber from 'primevue/inputnumber';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const toast = useToast();

const warehouses = ref([]);
const warehouseName = ref('');
const warehouseLocation = ref('');
const warehouseMaxCapacity = ref(0);

const registerErrors = ref({ name: '', location: '', max_capacity: '', products: '' });
const editingRows = ref([]);

async function create_warehouse() {
    registerErrors.value = { name: '', location: '', max_capacity: '', products: '' };
    try {
        await createWarehouse({
            name: warehouseName.value,
            location: warehouseLocation.value,
            max_capacity: warehouseMaxCapacity.value,
        });
        warehouses.value = await getWarehouses();
        toast.add({ severity: 'success', life: 2500, summary: 'Succès', detail: 'Entrepôt créé' });
    } catch (error) {
        if (error.response && error.response.data) {
            const data = error.response.data;
            if (data.detail) {
                toast.add({ severity: 'error', life: 2500, summary: 'Erreur', detail: data.detail });
            }
            if (data.name) {
                registerErrors.value.name = data.name[0];
            }
            if (data.location) {
                registerErrors.value.location = data.location[0];
            }
            if (data.max_capacity) {
                registerErrors.value.max_capacity = data.max_capacity[0];
            }
        } else {
            toast.add({ severity: 'error', life: 2500, summary: 'Erreur', detail: 'Une erreur est survenue.' });
        }
    }
}

async function onRowEditSave(event) {
    if (event && event.data) {
        let { newData, index } = event;
        warehouses.value[index] = newData;
        if (!newData.id) {
            console.error("No id found in edited row.");
            toast.add({ severity: 'error', life: 2500, summary: 'Error', detail: 'Aucune donnée n\'a été modifiée.' });
            return;
        }
        try {
            await modifyWarehouse({
                id: newData.id,
                name: newData.name,
                location: newData.location,
                max_capacity: newData.max_capacity,
            },newData.id);
            warehouses.value = await getWarehouses();
            toast.add({ severity: 'success', life: 2500, summary: 'Succès', detail: 'Entrepôt modifié' });
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
    }
}

async function removeWarehouse(id) {
    try {
        await deleteWarehouse(id);
        warehouses.value = await getWarehouses();
        toast.add({ severity: 'success', life: 2500, summary: 'Succès', detail: 'Entrepôt supprimé' });
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
}

onMounted(async () => {
    try {
        warehouses.value = await getWarehouses();
    } catch (error) {
        if (error.response && error.response.data) {
            const data = error.response.data;
            toast.add({ severity: 'error', life: 2500, summary: 'Erreur', detail: data.detail });
        } else {
            toast.add({ severity: 'error', life: 2500, summary: 'Erreur', detail: 'Une erreur est survenue.' });
        }
    }
});
</script>

<template>
    <div>
        <h2>Gérer les entrepôts</h2>
        <div class="register form-container">
            <h2>Créer un entrepôt</h2>
            <form @submit.prevent="create_warehouse">
                <div class="form">
                    <InputGroup>
                        <InputGroupAddon>Nom :</InputGroupAddon>
                        <InputText type="text" id="register-warehouse" v-model="warehouseName" required />
                    </InputGroup>
                    <p-message v-if="registerErrors.name" severity="error">{{ registerErrors.name }}</p-message>
                </div>

                <div class="form">
                    <InputGroup>
                        <InputGroupAddon>Location :</InputGroupAddon>
                        <InputText type="text" id="register-location" v-model="warehouseLocation" required />
                    </InputGroup>
                    <p-message v-if="registerErrors.location" severity="error">{{ registerErrors.location }}</p-message>
                </div>

                <div class="form">
                    <InputGroup>
                        <InputGroupAddon>Capacité maximale :</InputGroupAddon>
                        <InputNumber id="register-max-capacity" v-model="warehouseMaxCapacity" required />
                    </InputGroup>
                    <p-message v-if="registerErrors.max_capacity" severity="error">{{ registerErrors.max_capacity }}</p-message>
                </div>

                <Button label="Créer" type="submit" class="p-button-primary" />
            </form>
        </div>

        <DataTable v-model:editingRows="editingRows" editMode="row" dataKey="id" @row-edit-save="onRowEditSave" :value="warehouses" tableStyle="min-width: 50rem" removableSort>

            <Column field="name" header="Nom" editor="true" sortable>
                <template #editor="slotProps">
                    <InputText v-model="slotProps.data.name" fluid />
                </template>
            </Column>

            <Column field="location" header="Location" editor="true">
                <template #editor="slotProps">
                    <InputText v-model="slotProps.data.location" fluid />
                </template>
            </Column>

            <Column field="max_capacity" header="Capacité maximale" editor="true" sortable>
                <template #editor="slotProps">
                    <InputNumber v-model="slotProps.data.max_capacity" fluid />
                </template>
            </Column>

            <Column editor="true">
                <template #editor="slotProps">
                    <Button icon="pi pi-times" class="p-button-rounded p-button-danger" @click="removeWarehouse(slotProps.data.id)" />
                </template>
            </Column>
            <Column :rowEditor="true" />
        </DataTable>
    </div>
</template>
