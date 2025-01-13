<script setup>
  import { RouterView } from 'vue-router'
  import Menubar from 'primevue/menubar';
  import { useRouter } from 'vue-router';
  import Toast from 'primevue/toast';

  const router = useRouter();

  const menuItems =[
    {
      label: 'Accueil',
      command:() => router.push({name:'home'}),
      icon: 'pi pi-home',
    },
    {
      label:'Login',
      command:() => router.push({name:'login'}),
      icon:'pi pi-user',
    },
    {
      label:'Swagger',
      command:() => router.push({name:'swagger'}),
      icon:'pi pi-cog',
    }
  ];
</script>

<template>
  <h1>Hello App!</h1>
  <Toast />
  <p><strong>Current route path:</strong> {{ $route.fullPath }}</p>
  <Menubar :model="menuItems" />
  <RouterView />
  </template>