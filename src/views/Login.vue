<script setup>
import { ref } from 'vue';
import { createUser, loginUser } from '../api.js';
import { useToast } from 'primevue/usetoast';
import PMessage from 'primevue/message';
import { useAuth } from '../composables/useAuth.js';

const { userInfo, isAuth } = useAuth();

const usernameRegister = ref('');
const emailRegister = ref('');
const passwordRegister = ref('');

const usernameLogin = ref('');
const passwordLogin = ref('');

const registerErrors = ref({ username: '', email: '' });
const loginErrors = ref({ username: '', password: '' });
const toast = useToast();

async function make_user() {
  registerErrors.value = { username: '', email: '' };
  try {
    await createUser({
      username: usernameRegister.value,
      email: emailRegister.value,
      password: passwordRegister.value,
    });
    toast.add({ severity: 'success', summary: 'Succès', detail: 'Utilisateur créé !' });
  } catch (error) {
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (data.username) {
        registerErrors.value.username = data.username[0];
      }
      if (data.email) {
        registerErrors.value.email = data.email[0];
      }
    } else {
      toast.add({ severity: 'error', summary: 'Erreur', detail: 'Une erreur est survenue.' });
    }
  }
}

async function login() {
  loginErrors.value = { username: '', password: '' };
  try {
    await loginUser({
      username: usernameLogin.value,
      password: passwordLogin.value,
    });
    toast.add({ severity: 'success', summary:`${usernameLogin.value} connecté`});
  } catch (error) {
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (data.username) {
        loginErrors.value.username = data.username[0];
      }
      if (data.password) {
        loginErrors.value.password = data.password[0];
      }
    } else {
      toast.add({ severity: 'error', summary: 'Erreur', detail: 'Une erreur est survenue.' });
    }
  }
}
</script>

<template>
  <div class="container">  
    <span>StockSeeker Login</span>
    <div v-if="isAuth" class="form-container">
      <p v-if="userInfo">Bienvenue, {{ userInfo.username }}</p>
      <p v-if="userInfo">email : {{ userInfo.email }}</p>
    </div>

    <div v-else class="forms-container">
      <div class="register form-container">
        <h2>Crée un Compte :</h2>
        <div class="form">
          <label for="username">Username:</label>
          <input type="text" class="p-inputtext" name="register-username" id="register-name" v-model="usernameRegister" required>
          <p-message v-if="registerErrors.username" severity="error">{{ registerErrors.username }}</p-message>
        </div>
        <div class="form">
          <label for="email">email:</label>
          <input type="text" name="register-email" id="register-email" v-model="emailRegister" class="p-inputtext" required>
          <p-message v-if="registerErrors.email" severity="error">{{ registerErrors.email }}</p-message>
        </div>
        <div class="form">
          <label for="password">password:</label>
          <input type="password" name="register-password" id="register-password" v-model="passwordRegister" class="p-inputtext" required>
        </div>
        <button @click="make_user" class="p-button p-component" type="button">S'inscrire</button>
        </div>

        <div class="login form-container">
          <h2>Se connecter : </h2>
        <div class="form">
          <label for="username">Username:</label>
          <input type="text" class="p-inputtext" name="login-username" id="login-name" v-model="usernameLogin" required>
          <p-message v-if="loginErrors.username" severity="error">{{ loginErrors.username }}</p-message>
        </div>
        <div class="form">
          <label for="password">password:</label>
          <input type="password" name="login-password" id="login-password" v-model="passwordLogin" class="p-inputtext" required>
          <p-message v-if="loginErrors.password" severity="error">{{ loginErrors.password }}</p-message>

        </div>
        <button @click="login" class="p-button p-component" type="button">Se connecter</button>
        </div>
      </div>
      </div>
</template>
