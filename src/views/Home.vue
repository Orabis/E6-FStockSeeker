<script setup>
import { RouterView,RouterLink } from 'vue-router';
</script>

<template>
  <span>StockSeeker</span>
  <div>
    <nav>
      <RouterLink to="/">Go to Home</RouterLink>
      <RouterLink to="/swagger">Doc API StockSeeker</RouterLink>
    </nav>
    <main>
      <RouterView/>
    </main>
  </div>
</template>
