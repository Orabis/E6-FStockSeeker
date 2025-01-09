<script>
import SwaggerUI from "swagger-ui";
import "swagger-ui/dist/swagger-ui.css";

export default {
  name: "Swagger",
  mounted() {
    this.initSwaggerUI();
  },
  methods: {
    initSwaggerUI() {
      SwaggerUI({
        url: "http://127.0.0.1:8000/api/schema/", // Remplace par ton URL
        dom_id: "#swagger-container", // Le conteneur DOM où Swagger sera monté
        deepLinking: true,
        presets: [SwaggerUI.presets.apis],
      });
    },
  },
};
</script>

<template>
  <div id="swagger-container"></div>
</template>