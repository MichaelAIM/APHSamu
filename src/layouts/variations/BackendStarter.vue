<script setup>
import { useTemplateStore } from "@/stores/template";

import BaseLayout from "@/layouts/BaseLayout.vue";
import BaseNavigation from "@/components/BaseNavigation.vue";
import axios from "axios";
import { ref } from "vue";
// Main store
const store = useTemplateStore();
let url = '';
const nombreSession = ref();
// Set default elements for this layout
store.setLayout({
  header: true,
  sidebar: true,
  sideOverlay: true,
  footer: true,
});

// Set various template options for this layout variation
store.headerStyle({ mode: "dark" });
store.mainContent({ mode: "narrow" });
let encode = "";
console.log(window.document.location.host);

if (window.document.location.host === "localhost:3000" || window.document.location.host === "10.8.83.74:3000") {

  if(window.document.location.host === "10.8.83.74:3000"){
    url = '10.8.83.74:8000';
  }else{
    url = 'localhost:8000';
  }
  
  const encrypt = btoa("16467901-2");
  const newExcrypt = "X"+encrypt;
  encode = btoa(newExcrypt);
  localStorage.setItem('key',encode);

} else {
  url = 'www.ssarica.cl:8000';
  encode = localStorage.getItem('key');
}
console.log('URL: '+ url);
console.log('KEY: '+ encode);
axios.post("https://"+url+"/api/auth/login",{key: encode}).then((response) => {
  localStorage.setItem('session',response.data['funcionario'].nombre);
  localStorage.setItem('uid', response.data['token']);
  nombreSession.value = response.data['funcionario'].nombre;
}).catch(function (error) {
  console.log(error.response.data.msg);
  // window.location.assign('https://www.ssarica.cl');
});
</script>

<template>
  <BaseLayout>
    <!-- Side Overlay Content -->
    <!-- Using the available v-slot, we can override the default Side Overlay content from layouts/partials/SideOvelay.vue -->
    <template #side-overlay-content>
      <div class="content-side">
        <p>Side Overlay content.. cards</p>
      </div>
    </template>
    <!-- END Side Overlay Content -->

    <!-- Sidebar Content -->
    <!-- Using the available v-slot, we can override the default Sidebar content from layouts/partials/Sidebar.vue -->
    <template #sidebar-content>
      <div class="content-side">
        <BaseNavigation
          :nodes="[
            {
              name: 'Inicio',
              to: 'backend-dashboard',
              icon: 'si si-speedometer',
            },
            {
              name: 'Aplicaciones',
              heading: true,
            },
            {
              name: 'Registro',
              to: 'registro-dashboard',
              icon: 'si si-phone',
            },
            {
              name: 'Solicitudes',
              to: 'solicitud-dashboard',
              icon: 'fa fa-file-waveform',
            },
            {
              name: 'Despachos',
              to: 'despacho-dashboard',
              icon: 'fa fa-file-waveform',
            },
            {
              name: 'Mantenedores',
              heading: true,
            },
            {
              name: 'Turnos',
              to: 'turno-dashboard',
              icon: 'si si-phone',
            },
            {
              name: 'Ambulancias',
              to: 'ambulancia-dashboard',
              icon: 'fa fa-truck-medical',
            },
            {
              name: 'Tripulación',
              to: 'tripulacion-dashboard',
              icon: 'fa fa-truck-medical',
            },
          ]"
        />
      </div>
    </template>
    <!-- END Sidebar Content -->

    <!-- Header Content Left -->
    <!-- Using the available v-slot, we can override the default Header content from layouts/partials/Header.vue -->
    <template #header-content-left>
      <!-- Toggle Sidebar -->
      <button
        type="button"
        class="btn btn-sm btn-alt-secondary me-2 d-lg-none"
        @click="store.sidebar({ mode: 'toggle' })"
      >
        <i class="fa fa-fw fa-bars"></i>
      </button>
      <!-- END Toggle Sidebar -->

      <!-- Toggle Mini Sidebar -->
      <button
        type="button"
        class="btn btn-sm btn-alt-secondary me-2 d-none d-lg-inline-block"
        @click="store.sidebarMini({ mode: 'toggle' })"
      >
        <i class="fa fa-fw fa-ellipsis-v"></i>
      </button>
      <!-- END Toggle Mini Sidebar -->
    </template>
    <!-- END Header Content Left -->

    <!-- Header Content Right -->
    <!-- Using the available v-slot, we can override the default Header content from layouts/partials/Header.vue -->
    <template #header-content-right>
      <!-- Toggle Side Overlay -->
      <button
        type="button"
        class="btn btn-sm btn-alt-secondary d-flex align-items-center"
        id="page-header-user-dropdown"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <img
          class="rounded-circle"
          src="/assets/media/avatars/avatar10.jpg"
          alt="Header Avatar"
          style="width: 21px"
        />
        <span class="d-none d-sm-inline-block ms-2"> {{ nombreSession }} </span>
      </button>

      <button
        type="button"
        class="btn btn-sm btn-alt-secondary ms-2"
        @click="store.sideOverlay({ mode: 'toggle' })"
      >
        <i class="fa fa-fw fa-list-ul fa-flip-horizontal"></i>
      </button>
      <!-- END Toggle Side Overlay -->
    </template>
    <!-- END Header Content Right -->

    <!-- Footer Content Left -->
    <!-- Using the available v-slot, we can override the default Footer content from layouts/partials/Footer.vue -->
    <template #footer-content-left>
      <strong>SAMU APH</strong>
      &copy; {{ store.app.copyright }}
    </template>
    <!-- END Footer Content Left -->
  </BaseLayout>
</template>
