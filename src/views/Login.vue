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
import IftaLabel from 'primevue/iftalabel';
import Divider from 'primevue/divider';


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
  <div class="login-container">
    <div v-if="isAuth" class="registered-container">
      <h2 v-if="userInfo">Bienvenue, {{ userInfo.username }}</h2>
      <p v-if="userInfo">Email : {{ userInfo.email }}</p>
      <Button label="Modifier l'utilisateur" icon="pi pi-user-edit" @click="showDialog = true"></Button>
      <Dialog header="Modifier l'utilisateur" v-model:visible="showDialog" :style="{ width: '30vw' }" modal>
        <form class="form-update-user" @submit.prevent="modify_user">
          <div class="field">
            <IftaLabel>
              <InputText id="modify-username" v-model="usernameModify" placeholder="" required fluid />
              <label for="modify-username">Nom d'utilisateur :</label>
            </IftaLabel>
          </div>
          <div class="field">
            <IftaLabel>
              <InputText id="modify-email" v-model="emailModify" type="email" required fluid />
              <label for="modify-email">Email :</label>
            </IftaLabel>
          </div>
          <div class="field">
            <IftaLabel>
              <Password id="modify-password" v-model="passwordModify" feedback toggleMask required fluid/>
              <label for="modify-password">Mot de passe :</label>
            </IftaLabel>
          </div>
          <Button label="Annuler" icon="pi pi-ban" severity="secondary" class="p-button-text" @click="showDialog = false"></Button>
          <Button label="Enregistrer" icon="pi pi-address-book" type="submit" class="p-button-primary"></Button>
        </form>
      </Dialog>
    </div>

    <div v-if="!isAuth" class="account-container">
      <div class="account-logon account-login">
        <h2>Se connecter :</h2>
        <form class="form-update-user" @submit.prevent="login_user">
          <div class="form">
            <IftaLabel>
              <InputText type="text" id="login-username" v-model="usernameLogin" required fluid/>
              <label for="username">Nom d'utilisateur :</label>
            </IftaLabel>
            <p-message v-if="loginErrors.username" severity="error">
              {{ loginErrors.username }}
            </p-message>
          </div>
          <div class="form">
            <IftaLabel>
              <Password id="login-password" v-model="passwordLogin" toggleMask :feedback="false" required fluid />
              <label for="password">Mot de passe :</label>
            </IftaLabel>
            <p-message v-if="loginErrors.password" severity="error">
              {{ loginErrors.password }}
            </p-message>
          </div>
          <Button label="Se connecter" type="submit" icon="pi pi-sign-in" class="p-button-primary"/>
        </form>
      </div>
      <Divider></Divider>
      <Button label="Crée un Compte" icon="pi pi-user-plus" @click="showDialog = true"></Button>
      <Dialog header="Inscription" v-model:visible="showDialog" :style="{ width: '30vw' }" modal>
        <div class="account-logon account-register">
          <form class="form-update-user" @submit.prevent="make_user">
            <div class="form">
              <IftaLabel>
                <InputText type="text" id="register-username" v-model="usernameRegister" required fluid/>
                <label for="username">Nom d'utilisateur :</label>
              </IftaLabel>
              <p-message v-if="registerErrors.username" severity="error">
                {{ registerErrors.username }}
              </p-message>
            </div>
            <div class="form">
              <IftaLabel>
              <InputText type="email" id="register-email" v-model="emailRegister" required fluid/>
                <label for="email">Email :</label>
              </IftaLabel>
              <p-message v-if="registerErrors.email" severity="error">
                {{ registerErrors.email }}
              </p-message>
            </div>
            <div class="form">
              <IftaLabel>
                <Password id="register-password" v-model="passwordRegister" toggleMask required fluid/>
                <label for="password">Mot de passe :</label>
              </IftaLabel>
            </div>
            <Button type="button" label="Cancel" severity="secondary" class="p-button-text" @click="visible = false"></Button>
            <Button label="S'inscrire" type="submit" class="p-button-primary" />
          </form>
        </div>
      </Dialog>
    </div>
  </div>
</template>
