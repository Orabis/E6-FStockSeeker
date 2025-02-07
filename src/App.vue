<script setup>
  import { RouterView } from 'vue-router'
  import Menubar from 'primevue/menubar';
  import { useRouter } from 'vue-router';
  import Toast from 'primevue/toast';
  import { useAuth } from './composables/useAuth.js';

  import { useToast } from 'primevue/usetoast';

  const toast = useToast();
  const router = useRouter();

  const { isAuth,userInfo,logout } = useAuth();
  
  const getMenuItems = () =>{
    if(isAuth.value){
      return [
        {
          label: 'Tableau de Bord',
          command:() => router.push({name:'dashboard'}),
          icon: 'pi pi-home',
        },
        {
          label: 'Gerer les produits',
          command:() => router.push({name:'products'}),
          icon: 'pi pi-home',
        },
        {
          label: 'Gerer les entrepôts',
          command:() => router.push({name:'warehouses'}),
          icon: 'pi pi-home',
        },
        {
          label:userInfo.value ? userInfo.value.username : 'Profil',
          command:() => router.push({name:'login'}),
          icon:'pi pi-user',
        },
        {
          label:'Logout',
          command:() => {
            logout();
            toast.add({severity:'success',summary:'Déconnexion',life:2500,detail:'Vous avez été déconnecté.'});
            router.push({name:'login'});
          },
          icon:'pi pi-sign-out',
        },
      ];
      } else {
          return [
          {
            label:'Register/Login',
            command:() => router.push({name:'login'}),
            icon:'pi pi-user',
          },
        ];
        }
      };
</script>

<template>
  <div class="header">
    <img src="./assets/logo.png" alt="" style="width: 8rem">
    <h1>StockSeeker</h1>
  </div>
  <Toast />
  <Menubar class="menubar" :model="getMenuItems()" />
  <RouterView />
</template>