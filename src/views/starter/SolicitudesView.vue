<script setup>
  import TableLite from "vue3-table-lite/ts";
  import { ref, reactive, computed, onMounted } from 'vue'
  import moment from 'moment';
  import Swal from "sweetalert2";
  import axios from 'axios';
  let url = '';
  let boucher = '';
  if (window.document.location.host === "127.0.0.1:3000") {
      url = 'localhost:8000';
      boucher = 'http://127.0.0.1:3000';
  }else{
      url = 'www.ssarica.cl';
      boucher = 'https://www.ssarica.cl/AP_SAMU';
  }
  const searchTerm = ref(""); // Search text
  // Fake data
  const data = reactive([]);
// Table config
  const table = reactive({
    columns: [
      {
        label: "Nº",
        field: "numero",
        width: "3%",
        sortable: true,
      },
      {
        label: "Solicitud",
        field: "id",
        width: "10%",
        sortable: true,
        isKey: true,
      },
      {
        label: "Contacto",
        field: "contacto",
        width: "15%",
        sortable: true,
      },
      {
        label: "Teléfono",
        field: "telefono",
        width: "15%",
        sortable: true,
      },
      {
        label: "Lugar",
        field: "lugar",
        width: "15%",
        sortable: true,
      },
      {
        label: "Fecha",
        field: "fecha",
        width: "15%",
        sortable: true,
      },
      {
        label: "",
        field: "quick",
        width: "10%",
        display: function (row) {
          return (
            '<a href="'+boucher+'/#/boucher/' +
            row.id +'" target="_blank" class="btn btn-primary" >Imprimir</a>'
          );
        },
      },
    ],
    rows: computed(() => {
      return data.filter(
        (x) =>
          x.contacto.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          x.lugar.toLowerCase().includes(searchTerm.value.toLowerCase())
      );
    }),
    totalRecordCount: computed(() => {
      return table.rows.length;
    }),
    sortable: {
      order: "id",
      sort: "desc",
    },
  });

  onMounted(() => {
    axios.get('https://'+url+'/api/solicitud').then((response) => {
      console.log(response.data['solicitudes']);
        for (let i = 0; i < response.data['solicitudes'].length; i++) {
          data.push({
            numero: i + 1,
            id: response.data['solicitudes'][i].id,
            contacto: response.data['solicitudes'][i].contacto,
            telefono: response.data['solicitudes'][i].telefono,
            lugar: response.data['solicitudes'][i].lugar,
            fecha: response.data['solicitudes'][i].createdAt,
          });
        }
    });
  });
</script>
<template>
    <BasePageHeading title="Solicitudes" subtitle="Listado de solicitudes en curso">
        <template #extra>
            <button type="button" class="btn btn-alt-primary" v-click-ripple>
                <i class="fa fa-plus opacity-50 me-1"></i>
                Nueva Solicitud
            </button>
        </template>
    </BasePageHeading>
    <div class="content">
        <div class="py-4" style="text-align: left">
          <label>Buscador:</label><input v-model="searchTerm" />
        </div>
        <table-lite
          :is-static-mode="true"
          :columns="table.columns"
          :rows="table.rows"
          :total="table.totalRecordCount"
          :sortable="table.sortable"
        ></table-lite>
    </div>
</template>
<style>
thead, th {
    background-color: #0891b2 !important;
    border-color: #0891b2 !important;
}
</style>