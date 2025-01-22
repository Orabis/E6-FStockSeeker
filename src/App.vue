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
          label: 'Accueil',
          command:() => router.push({name:'home'}),
          icon: 'pi pi-home',
        },
        {
          label:userInfo.value ? userInfo.value.username : 'Profil',
          command:() => router.push({name:'login'}),
          icon:'pi pi-user',
        },
        {
          label:'Swagger',
          command:() => router.push({name:'swagger'}),
          icon:'pi pi-cog',
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
            label: 'Accueil',
            command:() => router.push({name:'home'}),
            icon: 'pi pi-home',
          },
          {
            label:'Register/Login',
            command:() => router.push({name:'login'}),
            icon:'pi pi-user',
          },
          {
            label:'Swagger',
            command:() => router.push({name:'swagger'}),
            icon:'pi pi-cog',
          },
        ];
        }
      };
</script>

<template>
  <h1>StockSeeker</h1>
  <Toast />
  <Menubar :model="getMenuItems()" />
  <RouterView />
  </template>