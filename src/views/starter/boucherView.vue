<script setup>
import { useRoute } from "vue-router";
import { onMounted, reactive, ref } from 'vue';
import moment from 'moment';

import axios from 'axios';
let url = '';
if (window.document.location.host === "localhost:3000" || window.document.location.host === "10.8.83.72:3000") {
  if(window.document.location.host === "10.8.83.72:3000"){
    url = '10.8.83.72:8000';
  }else{
    url = 'localhost:8000';
  }
}else{
    url = 'www.ssarica.cl:8000';
}
console.log(url);
const config = {
    headers:{
        'x-token': localStorage.getItem('uid')
    }
};
const route = useRoute();
const solicitud = reactive({
    id:null,
    tipo_llamada:null,
    telefono:null,
    origen:0,
    contacto:"",
    estado:0,
    n_paciente:0,
    lugar:"",
    referencia:"",
    motivo:"",
    hipertenso:false,
    epileptico:false,
    diabetico:false,
    postrado:false,
    nom_paciente:"",
    edad_paciente: 0,
    qtrs:[
        {numero:1, createdAt:""},
        {numero:2, createdAt:""}
    ],
    obs_cierre:"",
    Cometidos:[],
});

onMounted(()=>{
  axios.get('https://'+url+'/api/solicitud/'+route.params.id,config).then((response) => {
    const data = response.data['solicitud'];
    solicitud.id = data.id;
    solicitud.tipo_llamada = data.tipo_llamada;
    solicitud.telefono = data.telefono;
    solicitud.origen = data.origen;
    solicitud.contacto = data.contacto;
    solicitud.estado = data.estado;
    solicitud.n_paciente = data.n_paciente;
    solicitud.lugar = data.lugar;
    solicitud.referencia = data.referencia;
    solicitud.motivo = data.motivo;
    solicitud.hipertenso = data.hipertenso;
    solicitud.epileptico = data.epileptico;
    solicitud.diabetico = data.diabetico;
    solicitud.postrado = data.postrado;
    solicitud.obs_cierre = "";
    solicitud.nom_paciente = data.nom_paciente;
    solicitud.edad_paciente = data.edad_paciente;
    let pp = Math.max.apply(Math, data.Qtrs.map(function(o) { return o.id; }));
    solicitud.qtrs = data.Qtrs.filter((qtr) => qtr.numero < 3  || qtr.id == pp);
    let cp = Math.max.apply(Math, data.Cometidos.map(function(o) { return o.id; }));
    solicitud.Cometidos = data.Cometidos.filter((qtr) => qtr.id == cp);
    console.log(data.Cometidos);
  }).catch(function (error) {
    console.log(error);
    // window.location.assign('https://www.ssarica.cl');
  });
});

</script>

<template>
  <!-- Hero -->
  <div class=" bg-body-extra-light" style="max-width:260px;">
    <div class="content content-full px-1">
      <div class="row">
        <div class="col-12">
            <h2 class="my-0">SAMU Arica</h2>
            <span>Fecha: {{moment().format('DD/MM/YYYY HH:mm:ss')}}</span>
            <hr>
            <h3 class="mt-3 mb-1">Solicitud</h3>
            <p>Numero: <strong>{{ solicitud.id }}</strong></p>
            <p> Tipo de Llamada: 
              <strong v-show="solicitud.tipo_llamada==1">Telefónico</strong>
              <strong v-show="solicitud.tipo_llamada==2">VHF</strong>
              <strong v-show="solicitud.tipo_llamada==3">Sin datos</strong>
            </p>
            <p>Teléfono: 
              <strong v-show="solicitud.telefono">{{ solicitud.telefono }}</strong>
              <strong v-show="!solicitud.telefono">Sin datos</strong>
            </p>
            <p>Origen: 
              <strong v-show="solicitud.origen">{{ solicitud.origen }}</strong>
              <strong v-show="!solicitud.origen">Sin datos</strong>
            </p>
            <p>Contacto: 
              <strong v-show="solicitud.contacto">{{ solicitud.contacto }}</strong>
              <strong v-show="!solicitud.contacto">Sin datos</strong>
            </p>
            <p>Lugar del suceso : 
              <strong v-show="solicitud.lugar">{{ solicitud.lugar }}</strong>
              <strong v-show="!solicitud.lugar">Sin datos</strong>
            </p>
            <p>Lugar de referencia: 
              <strong v-show="solicitud.referencia">{{ solicitud.referencia }}</strong>
              <strong v-show="!solicitud.referencia">Sin datos</strong>
            </p>
            <p>Nombre Paciente: 
              <strong v-show="solicitud.nom_paciente">{{ solicitud.nom_paciente }}</strong>
              <strong v-show="!solicitud.nom_paciente">Sin datos</strong>
            </p>
            <p>Edad Paciente: 
              <strong v-show="solicitud.edad_paciente">{{ solicitud.edad_paciente }}</strong>
              <strong v-show="!solicitud.edad_paciente">Sin datos</strong>
            </p>
            <p>Patologías:</p>
            <ul>
              <li v-show="solicitud.diabetico">Diabetico</li>
              <li v-show="solicitud.hipertenso">Hipertenso</li>
              <li v-show="solicitud.postrado">Postrado</li>
              <li v-show="solicitud.epileptico">Epileptico</li>
            </ul>

            <p>Motivo de Consulta: <strong>{{ solicitud.motivo }}</strong></p>
            <h3 class="mb-1">Qtr´s:</h3>
            <p v-for="qtr in solicitud.qtrs" :key="qtr.id">{{qtr.numero}}:  <strong>{{moment(qtr.createdAt).format('DD/MM/YYYY HH:mm:ss')}}</strong></p>
            <h3 class="mb-1">Cometidos:</h3>
            <ul>
              <li v-for="cometido in solicitud.Cometidos" :key="cometido.id">
                <p> Movil Nº <strong>{{cometido.idAmbulancia}}</strong>: </p>
                <ul>
                  <li v-for="trip in cometido.tripulacionCometidos" :key="trip.id">
                    <p> {{trip.Funcionario.nombre}}</p>
                  </li>
                </ul>
              </li>
            </ul>
        </div>
      </div>
    </div>
  </div>
  <!-- END Hero -->
</template>
<style scoped>
p{
  font-family: Arial, Helvetica, sans-serif;
  color: #000;
  margin-bottom: 5px;
  font-size: 14px;
}
h2, h3, span{
  color: #000;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 16px;
}
</style>