<script setup>
import { ref, onMounted } from 'vue';
import { createWarehouse, getWarehouses, modifyWarehouse, deleteWarehouse } from '../api.js';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import PMessage from 'primevue/message';
import InputNumber from 'primevue/inputnumber';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import IftaLabel from 'primevue/iftalabel';

const toast = useToast();

const warehouses = ref([]);
const warehouseName = ref('');
const warehouseLocation = ref('');
const warehouseMaxCapacity = ref(0);
const visible = ref(false);

const registerErrors = ref({ name: '', location: '', max_capacity: ''});
const modifyErrors = ref({name:'', location:'', max_capacity:''})
const editingRows = ref([]);

async function create_warehouse() {
    registerErrors.value = { name: '', location: '', max_capacity: ''};
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
    modifyErrors.value = { name: '', location: '', max_capacity: ''};
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
                if (data.name) {
                    modifyErrors.value.name = data.name[0];
                }
                if (data.location) {
                    modifyErrors.value.location = data.location[0];
                }
                if (data.max_capacity) {
                    modifyErrors.value.max_capacity = data.max_capacity[0];
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
        editingRows.value = [];
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

        <Button class="create-btn" icon="pi pi-arrow-up-right-and-arrow-down-left-from-center" label="Crée un nouvel entrepôt" @click="visible = true"></Button>
        <Dialog v-model:visible="visible" modal header="Nouvel Entrepôt" :style="{ width: '25rem' }">
            <form class="form-update-user" @submit.prevent="create_warehouse">
                <div class="form">
                    <IftaLabel>
                        <InputText name="register-name" type="text" id="register-name" v-model="warehouseName" required fluid/>
                        <label for="register-name">Nom de l'entrepôt :</label>
                    </IftaLabel>
                    <p-message v-if="registerErrors.name" severity="error">{{ registerErrors.name }}</p-message>
                </div>

                <div class="form">
                    <IftaLabel>
                        <InputText name="register-location" type="text" id="register-location" v-model="warehouseLocation" required fluid/>
                        <label for="register-location">Localisation :</label>
                    </IftaLabel>
                    <p-message v-if="registerErrors.location" severity="error">{{ registerErrors.location }}</p-message>
                </div>

                <div class="form">
                    <IftaLabel>
                        <InputNumber name="register-max-capacity" id="register-max-capacity" v-model="warehouseMaxCapacity" required fluid />
                        <label for="register-max-capacity">Capacité totale :</label>
                    </IftaLabel>
                    <p-message v-if="registerErrors.max_capacity" severity="error">{{ registerErrors.max_capacity }}</p-message>
                </div>
                <Button type="button" icon="pi pi-ban" label="Cancel" severity="secondary" class="p-button-text" @click="visible = false"></Button>
                <Button type="submit" icon="pi pi-check" label="Créer" class="p-button-primary" @click="visible = false" />
            </form>
        </Dialog>

        <DataTable v-model:editingRows="editingRows" editMode="row" dataKey="id" @row-edit-save="onRowEditSave" :value="warehouses" tableStyle="min-width: 50rem" removableSort>

            <Column field="name" header="Nom" editor="true" sortable>
                <template #body="slotProps">
                    <span v-if="!modifyErrors.name">{{ slotProps.data.name }}</span>
                    <p-message v-if="modifyErrors.name" severity="error">{{ modifyErrors.name }}</p-message>
                </template>
                <template #editor="slotProps">
                    <InputText v-model="slotProps.data.name" fluid />
                </template>
            </Column>

            <Column field="location" header="Localisation" editor="true">
                <template #body="slotProps">
                    <span v-if="!modifyErrors.location">{{ slotProps.data.location }}</span>
                    <p-message v-if="modifyErrors.location" severity="error">{{ modifyErrors.location }}</p-message>
                </template>
                <template #editor="slotProps">
                    <InputText v-model="slotProps.data.location" fluid />
                </template>
            </Column>

            <Column field="max_capacity" header="Capacité maximale" editor="true" sortable>
                <template #body="slotProps">
                    <span v-if="!modifyErrors.max_capacity">{{ slotProps.data.max_capacity }}</span>
                    <p-message v-if="modifyErrors.max_capacity" severity="error">{{ modifyErrors.max_capacity }}</p-message>
                </template>
                <template #editor="slotProps">
                    <InputNumber v-model="slotProps.data.max_capacity" fluid />
                </template>
            </Column>
            
            <Column field="actual_capacity" header="Capacité actuelle" editor="false" sortable />

            <Column editor="true">
                <template #editor="slotProps">
                    <Button icon="pi pi-times" class="p-button-rounded p-button-danger" @click="removeWarehouse(slotProps.data.id)" />
                </template>
            </Column>
            <Column :rowEditor="true" />
        </DataTable>
    </div>
</template>
