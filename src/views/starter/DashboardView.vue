<script setup>


</script>

<template>
  <!-- Hero -->
  <div class="hero bg-body-extra-light">
    <div class="content content-full text-center">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- <i class="fa fa-2x fa-circle-notch text-primary"></i> -->
          <img
              class=""
              src="/assets/media/favicons/apple-touch-icon-180x180.png"
              alt="Logo SAMU"
            />
          <h1 class="fw=bold mt-3 mb-2">
            Samu APH  |
            <span class="fw-light"> Atención Pre Hospitalaría</span>
          </h1>
          <p class="fs-lg fw-medium text-muted mb-4">
            Bienvenido al sistema de gestion para la atención prehospitalaria.
          </p>
          <RouterLink
            :to="{ name: 'turno-dashboard' }"
            class="btn btn-primary px-4 py-3"
            v-click-ripple
          >
            Comenzar
            <i class="fa fa-fw fa-arrow-right ms-1 opacity-50"></i>
          </RouterLink>
          <!-- <router-link :to="{ name: 'boucher', params: { id: 8 } }" target="_blank" class="btn btn-primary px-4 py-3"
            v-click-ripple>Print</router-link> -->
        </div>
      </div>
    </div>
  </div>
  <!-- END Hero -->
</template>
