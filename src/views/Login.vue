<script setup>
import { onMounted, ref } from 'vue';
import { createUser, getuserinfo} from '../api.js';
import { useToast } from 'primevue/usetoast';
import PMessage from 'primevue/message';

const username = ref('');
const email = ref('');
const password = ref('');
const errors = ref({ username: '', email: '' });
const toast = useToast();
const isAuth = ref(false);
const userInfo = ref(null);

async function make_user() {
  errors.value = { username: '', email: '' };
  try {
    await createUser({
      username: username.value,
      email: email.value,
      password: password.value,
    });
    toast.add({ severity: 'success', summary: 'Succès', detail: 'Utilisateur créé !' });
  } catch (error) {
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (data.username) {
        errors.value.username = data.username[0];
      }
      if (data.email) {
        errors.value.email = data.email[0];
      }
    } else {
      toast.add({ severity: 'error', summary: 'Erreur', detail: 'Une erreur est survenue.' });
    }
  }
}

onMounted(async() => {
  const accessToken = sessionStorage.getItem('access_token');
  if (accessToken) {
    isAuth.value = true;
    try{
      userInfo.value = await getuserinfo();}
      catch (error){
        console.error("erreur de récupération: ", error);
        isAuth.value = false;
      }
    }
});

</script>

<template>
  <div class="container">  
    <span>StockSeeker Login</span>
    <div v-if="isAuth" class="form-container">
      <p v-if="userInfo">Bienvenue, {{ userInfo.username }}</p>
      <p v-if="userInfo">email :{{ userInfo.email }}</p>
    </div>

    <div v-else class="form-container">
      <div class="form">
        <label for="username">Username:</label>
        <input type="text" class="p-inputtext" name="username" id="name" v-model="username" required>
        <p-message v-if="errors.username" severity="error">{{ errors.username }}</p-message>
      </div>
      <div class="form">
        <label for="email">email:</label>
        <input type="text" name="email" id="email" v-model="email" class="p-inputtext" required>
        <p-message v-if="errors.email" severity="error">{{ errors.email }}</p-message>
      </div>
      <div class="form">
        <label for="password">password:</label>
        <input type="password" name="password" id="password" v-model="password" class="p-inputtext" required>
      </div>
      <button @click="make_user" class="p-button p-component" type="button">S'inscrire</button>
      </div>
    </div>
</template>
