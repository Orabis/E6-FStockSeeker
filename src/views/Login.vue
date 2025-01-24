<script setup>
import { ref } from 'vue';
import { createUser, loginUser,updateUser, getuserinfo } from '../api.js';
import { useToast } from 'primevue/usetoast';
import PMessage from 'primevue/message';
import { useAuth } from '../composables/useAuth.js';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';


const { userInfo, isAuth } = useAuth();
const toast = useToast();

const usernameRegister = ref('');
const emailRegister = ref('');
const passwordRegister = ref('');

const usernameLogin = ref('');
const passwordLogin = ref('');

const usernameModify = ref('');
const emailModify = ref('');
const passwordModify = ref('');

const registerErrors = ref({ username: '', email: '' });
const loginErrors = ref({ username: '', password: '' });
const modifyErrors = ref({ username: '', email: '' });


const showDialog = ref(false);

async function make_user() {
  registerErrors.value = { username: '', email: '' };
  try {
    await createUser({
      username: usernameRegister.value,
      email: emailRegister.value,
      password: passwordRegister.value,
    });
    isAuth.value = true;
    userInfo.value = await getuserinfo();
    toast.add({ severity: 'success', life: 2500, summary: 'Succès', detail: 'Utilisateur créé !' });
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
      toast.add({ severity: 'error',life: 2500, summary: 'Erreur', detail: 'Une erreur est survenue.' });
    }
  }
}

async function login_user() {
  loginErrors.value = { username: '', password: '' };
  try {
    await loginUser({
      username: usernameLogin.value,
      password: passwordLogin.value,
    });
    toast.add({ severity: 'success',life: 2500, summary:`${usernameLogin.value} connecté`});
    isAuth.value = true;
    userInfo.value = await getuserinfo();
  } catch (error) {
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (data.detail) {
        toast.add({ severity: 'error',life: 2500, summary: 'Erreur', detail: data.detail });
      }
      if (data.username) {
        loginErrors.value.username = data.username[0];
      }
      if (data.password) {
        loginErrors.value.password = data.password[0];
      }
    } else {
      toast.add({ severity: 'error',life: 2500, summary: 'Erreur', detail: 'Une erreur est survenue.' });
    }
  }
}

async function modify_user() {
  modifyErrors.value = { username: '', email: '', password: '' };
  try {
    await updateUser({
      username: usernameModify.value,
      email: emailModify.value,
      password: passwordModify.value,
    });
    isAuth.value = true;
    userInfo.value = await getuserinfo();
    showDialog.value = false;
    toast.add({ severity: 'success',life: 2500, summary: 'Succès', detail: 'Utilisateur modifié !' });
  } catch (error) {
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (data.username) {
        modifyErrors.value.username = data.username[0];
      }
      if (data.email) {
        modifyErrors.value.email = data.email[0];
      }
      if (data.password) {
        modifyErrors.value.password = data.password[0];
      }
    } else {
      toast.add({ severity: 'error',life: 2500, summary: 'Erreur', detail: 'Une erreur est survenue.' });
    }
  }
}
</script>

<template>
  <div class="container">
    <div v-if="isAuth" class="form-container" style="display: flex;flex-direction: column; justify-content: center; align-items: center;">
      <p v-if="userInfo">Bienvenue, {{ userInfo.username }}</p>
      <p v-if="userInfo">Email : {{ userInfo.email }}</p>
      <Button label="Modifier l'utilisateur" icon="pi pi-user-edit" @click="showDialog = true">
        Modifier l'utilisateur
      </Button>
      <Dialog header="Modifier l'utilisateur" v-model:visible="showDialog" :style="{ width: '30vw' }" modal:draggable="false">
        <form @submit.prevent="modify_user">
          <div class="field">
            <label for="modify-username">
              Nom d'utilisateur
            </label>
            <InputText id="modify-username" v-model="usernameModify" placeholder="Nom d'utilisateur" class="w-full" required />
          </div>
          <div class="field">
            <label for="modify-email">
              Email
            </label>
            <InputText id="modify-email" v-model="emailModify" type="email" placeholder="Adresse email" class="w-full" required />
          </div>
          <div class="field">
            <label for="modify-password">
              Mot de passe
            </label>
            <Password id="modify-password" v-model="passwordModify" feedback toggleMask placeholder="Nouveau mot de passe" class="w-full" required />
          </div>
          <div class="flex justify-content-end mt-3">
            <Button label="Annuler" class="p-button-text" @click="showDialog = false">
              Annuler
            </Button>
            <Button label="Enregistrer" type="submit" class="p-button-primary">
              Enregistrer
            </Button>
          </div>
        </form>
      </Dialog>
    </div>

    <div v-if="!isAuth" class="forms-container" style="display: flex;flex-direction: row; justify-content: space-around; align-items: center;">
      <div class="register form-container">
        <h2>Créer un Compte :</h2>
        <form @submit.prevent="make_user">
          <div class="form">
            <label for="username">
              Nom d'utilisateur :
            </label>
            <InputText type="text" id="register-username" v-model="usernameRegister" required />
            <p-message v-if="registerErrors.username" severity="error">
              {{ registerErrors.username }}
            </p-message>
          </div>
          <div class="form">
            <label for="email">
              Email :
            </label>
            <InputText type="email" id="register-email" v-model="emailRegister" required />
            <p-message v-if="registerErrors.email" severity="error">
              {{ registerErrors.email }}
            </p-message>
          </div>
          <div class="form">
            <label for="password">
              Mot de passe :
            </label>
            <Password id="register-password" v-model="passwordRegister" toggleMask required />
          </div>
          <Button label="S'inscrire" type="submit" class="p-button-primary" />
        </form>
      </div>

      <div class="login form-container">
        <h2>Se connecter :</h2>
        <form @submit.prevent="login_user">
          <div class="form">
            <label for="username">Nom d'utilisateur :</label>
            <InputText type="text" id="login-username" v-model="usernameLogin" required />
            <p-message v-if="loginErrors.username" severity="error">
              {{ loginErrors.username }}
            </p-message>
          </div>
          <div class="form">
            <label for="password">Mot de passe :</label>
            <Password id="login-password" v-model="passwordLogin" toggleMask :feedback="false" required />
            <p-message v-if="loginErrors.password" severity="error">
              {{ loginErrors.password }}
            </p-message>
          </div>
          <Button label="Se connecter" type="submit" class="p-button-primary" />
        </form>
      </div>
    </div>
  </div>
</template>
