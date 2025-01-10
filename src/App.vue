<script setup>
import { RouterLink,RouterView } from 'vue-router'

</script>

<template>
    <h1>Hello App!</h1>
    <p>
      <strong>Current route path:</strong> {{ $route.fullPath }}
    </p>
    <nav>
      <RouterLink to="/">Go to Home</RouterLink>
      <RouterLink to="/login">Go to login</RouterLink>
      <RouterLink to="/swagger">Go to swagger</RouterLink>
    </nav>
      <RouterView />
  </template>