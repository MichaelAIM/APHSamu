<script setup>
import draggable from "vuedraggable";
import TableLite from "vue3-table-lite";
import moment from 'moment';
import Swal from "sweetalert2";
import axios from 'axios';
import { ref, reactive, computed, onMounted } from 'vue'

//Config
let url = '';
let boucher = '';
if (window.document.location.host === "localhost:3000" || window.document.location.host === "10.8.83.72:3000") {
    if(window.document.location.host === "10.8.83.72:3000"){
        url = '10.8.83.72:8000';
        boucher = 'https://10.8.83.72:3000';
    }else{
        url = 'localhost:8000';
        boucher = 'https://127.0.0.1:3000';
    }
}else{
    boucher = 'https://www.ssarica.cl/AP_SAMU';
    url = 'www.ssarica.cl:8000';
}
const config = {
    headers:{
        'x-token': localStorage.getItem('uid')
    }
};
const ambulancias_disponibles = ref();
const kpis = ref({
    activos:[],
    inactivos:[],
});

const set_kpis = () => {
    kpis.value.activos = ambulancias_disponibles.value.filter( AD => AD.estado == 1);
    kpis.value.inactivos = ambulancias_disponibles.value.filter( AD => AD.estado != 1);
}

// Table config
const searchTerm = ref("");
const data = reactive([]);
for (let i = 0; i < 16; i++) {
    data.push({
        id: Math.floor(Math.random() * (6 - 1) + 1),
        name: "15:40:0" + Math.floor(Math.random() * (10 - 1) + 1),
        email: "16:21:3" + Math.floor(Math.random() * (10 - 1) + 1),
        lugar: "Chacabuco #40" + i,
    });
}
const table = reactive({
    columns: [
        {
            label: "MOVIL",
            field: "id",
            width: "3%",
            sortable: true,
            isKey: true,
        },
        {
            label: "LUGAR",
            field: "lugar",
            width: "30%",
            sortable: true,
        },
        {
            label: "SALIDA",
            field: "name",
            width: "10%",
            sortable: true,
        },
        {
            label: "LLEGADA",
            field: "email",
            width: "15%",
            sortable: true,
        },
    ],
    rows: computed(() => {
        return data.filter(
            (x) =>
            x.email.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            x.name.toLowerCase().includes(searchTerm.value.toLowerCase())
        );
    }),
    totalRecordCount: computed(() => {
        return table.rows.length;
    }),
    sortable: {
        order: "id",
        sort: "asc",
    },
    messages: {
        pagingInfo: "En vista {0}-{1} of {2}",
        pageSizeChangeLabel: "filas por pagina:",
        gotoPageLabel: ":",
        noDataAvailable: "",
    },
});

onMounted(() => {
    axios.get('https://'+url+'/api/Ambulancia/all_disponibles',config).then((response) => {
        ambulancias_disponibles.value = response.data['ambulancias'];
    }).then((response) => {
        ambulancias_disponibles.value = ambulancias_disponibles.value.map( (e) => {
            if (e.Cometidos.length > 0) {
                e["qtrs"] = [];
                axios.put('https://'+url+'/api/Qtr/comQtr/'+e.Cometidos[0].idSolicitud,{"idCometido":e.Cometidos[0].id},config).then((resp) => {
                    e["qtrs"] = resp.data["Qtrs"];
                });
            }
            return e;            
        });
        set_kpis();
    }).catch(function (error) {
        console.log(error);
        // window.location.assign('https://www.ssarica.cl');
    });

    // axios.get('https://'+url+'/api/cometidos/Turno/dia',config).then((response) => {
        // console.log(response.data['cometidos']);
    // }).catch(function (error) {
        // console.log(error);
        // window.location.assign('https://www.ssarica.cl');
    // });
});

</script>
<style lang="scss">
// SweetAlert2
@import "sweetalert2/dist/sweetalert2.min.css";
</style>
<template>
    <BasePageHeading title="Despacho de Móviles" subtitle="Gestión de Despachos">
        <template #extra>
            <div class="block-rounded block d-flex flex-column mb-0 bg-gray-light">
                <div class="block-content block-content-full flex-grow-1 d-flex justify-content-between align-items-center" style="min-width: 190px;">
                    <dl class="mb-0">
                        <i class="fa fa-truck-medical fs-3 text-success"></i>
                        <dd class="fs-sm fw-medium fs-sm fw-medium text-muted mb-0"> Disponibles </dd>
                    </dl>
                    <div class="item item-rounded-lg bg-body-light">
                        <dt class="fs-3 fw-bold">{{ kpis.activos.length }}</dt>
                    </div>
                </div>
                <div class="bg-body-light rounded-bottom p-2" style="min-height: 50px;">
                    <span class="fs-xs fw-semibold d-inline-block w-auto py-2 px-3 mx-1 rounded-pill bg-success-light text-success" :key="ac" v-for=" ac in kpis.activos">{{ac.movil}}</span>
                </div>
            </div>
        </template>
        <template #extra2>
            <div class="block-rounded block d-flex flex-column mb-0 bg-gray-light">
                <div class="block-content block-content-full flex-grow-1 d-flex justify-content-between align-items-center">
                    <dl class="mb-0">
                        <i class="fa fa-truck-medical fs-3 text-danger"></i>
                        <dd class="fs-sm fw-medium fs-sm fw-medium text-muted mb-0 me-3"> No Disponibles </dd>
                    </dl>
                    <div class="item item-rounded-lg bg-body-light">
                        <dt class="fs-3 fw-bold">{{ kpis.inactivos.length }}</dt>
                    </div>
                </div>
                <div class="bg-body-light rounded-bottom  p-2" style="min-height: 50px;">
                    <span class="fs-xs fw-semibold d-inline-block w-auto py-2 px-3 mx-1 rounded-pill bg-warning-light text-warning" v-for=" pk in kpis.inactivos">{{pk.movil}}</span>
                </div>
            </div>
        </template>
    </BasePageHeading>
    <div class="content">
        <div class="row">
            <div class="col-12">
                <div class="block-bordered block">
                    <div class="block-header block-header-default bg-modern text-white">
                        <h3 class="block-title"> Móviles en Transito
                        </h3>
                    </div>
                    <div class="block-content mb-4">
                        <div class="row mt-4" v-for="amb in ambulancias_disponibles">
                            <div class="col-12">
                                <div class="d-flex align-items-center">
                                    <h4 class="flex-grow-1 my-auto">
                                        <i class="far fa-circle-dot me-2" :class="[amb.estado == 1 ? 'text-success' : ' text-warning']"></i>
                                        Móvíl N° {{amb.movil}}
                                        <span v-show="amb.tipo == 1" class="badge bg-info align-middle badgeTipo">Básica</span>
                                        <span v-show="amb.tipo == 2" class="badge bg-flat-op align-middle badgeTipo">Avanzada</span>
                                        <span class="badge bg-warning-M align-middle ms-2 px-3" v-show="amb.estado == 1 && amb.despacho">En Cometido</span>
                                        <span class="badge bg-success align-middle ms-2 px-3"  v-show="amb.estado == 1 && !amb.despacho">Disponible</span>
                                        <span class="badge bg-city align-middle ms-2 px-3"  v-show="amb.estado == 2">No Disponible</span>                                        
                                    </h4>
                                </div>
                                <ul class='time-horizontal my-5' v-show="amb.qtrs">
                                    <li v-for="(qtr, i) in amb.qtrs">
                                        <span>QTR {{qtr.numero}}</span>
                                        <b :class="[amb.qtrs.length-1 == i ? 'active' : 'passivo']"> </b>
                                        <br> 
                                        {{moment(qtr.createdAt).format("DD/MM/YYYY")}}  
                                        <br> 
                                        {{moment(qtr.createdAt).format("HH:mm:ss")}} 
                                    </li>
                                    <!-- <li v-for="i in (11-amb.qtrs.length)"><b></b></li> -->
                                </ul>
                            </div>
                            <div class="col-md-6 my-4" v-show="amb.estado == 1 && amb.despacho">
                                <div class="row">
                                    <div class="col-3">
                                        <h4 class="mb-2">Solicitud:</h4>
                                    </div>
                                    <div class="col-3">
                                        <p v-if="amb.Cometidos.length > 0">{{amb.Cometidos[0].idSolicitud}}</p>
                                    </div>    
                                    <div class="col-3">
                                        <h4 class="mb-2">Dap:</h4>
                                    </div>
                                    <div class="col-3">
                                        <p v-if="amb.Cometidos.length > 0">{{amb.Cometidos[0].idDap}}</p>
                                    </div>
                                    <div class="col-5  mt-md-3">
                                        <h4 class="mb-2">Fecha salida:</h4>
                                    </div>
                                    <div class="col-7  mt-md-3">
                                        <p class="mb-2">{{moment(amb.f_salida).format("DD/MM/YYYY HH:mm:ss")}}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 my-4" v-show="amb.estado == 1 && amb.despacho">
                                <div class="row">
                                    <div class="col-5">
                                        <h4 class="mb-2">Tripulación:</h4>
                                    </div>
                                    <div class="col-7">
                                        <div class="row" v-if="amb.Cometidos.length > 0">
                                            <p class="mb-2" v-for="trip in amb.Cometidos[0].tripulacionCometidos">
                                                <i v-show="trip.idTipoFuncionario == 1" class="nav-main-link-icon fa-2xl fa fa-user-doctor me-2"></i>
                                                <i v-show="trip.idTipoFuncionario == 2" class="nav-main-link-icon fa-2xl fa fa-user-nurse me-2"></i>
                                                <i v-show="trip.idTipoFuncionario == 3" class="nav-main-link-icon fa-xl fa fa-truck-front me-2"></i>
                                                {{trip.Funcionario.nombre}}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="block-content" v-show="!amb.despacho || amb.estado != 1">
                                <div :class="[amb.estado == 1 && !amb.despacho ? 'alert-success' : 'alert-warning']" class="alert d-flex align-items-center justify-content-between" role="alert">
                                    <div class="flex-grow-1 me-3">
                                        <p class="mb-0">
                                            <template v-if="amb.estado != 1 && amb.logAmbulancias.length > 0">
                                                {{amb.logAmbulancias[0].motivo}}
                                            </template>
                                            <template v-else>
                                                Ambulancia Activa - <a class="alert-link" href="#">Disponible</a>!
                                            </template>
                                        </p>
                                    </div>
                                    <div class="flex-shrink-0">
                                        <i class="fa fa-fw fa-check-circle"></i>
                                    </div>
                                </div>
                            </div>
<hr>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- <div class="col-12">
            <div class="block-rounded block">
                <div class="block-header block-header-default bg-primary-dark text-white">
                    <h3 class="block-title">
                        Historial Diario
                    </h3>
                </div>
                <div class="block-content p-0">
                    <div class="block-rounded block">
                        <div class="block-content">
                            <div style="text-align: left" class="mb-3">
                                <label class="me-2">Buscar por: </label>
                                <input v-model="searchTerm" />
                            </div>
                            <table-lite :is-static-mode="true" :columns="table.columns" :rows="table.rows" :total="table.totalRecordCount" :sortable="table.sortable">
                            </table-lite>
                        </div>
                    </div>
                </div>
            </div>
        </div> -->
    </div>
</template>
<style>
.he-min {
    min-height: 70px;
}

.cursor-p {
    cursor: pointer;
}

.popover {
    max-width: 80% !important;
}

.badgeTipo {
    font-size: 14px !important;
}

.popover-body {
    /*padding-top: 2.6rem  !important;*/
    padding: 3.625rem 0.625rem;
    background-color: #eaecf1;
    border-color: #eaecf1;
}

.popover-header {
    background-color: #1f2937 !important;
    color: #FFF;
}

.time-horizontal {
    list-style-type: none;
    border-top: 1px solid #cdc8c8;
    max-width: 100%;
    padding: 30px;
    padding-top: 3px;
    margin: 0px;
    font-size: 0.8rem;
}

.time-horizontal li {
    float: left;
    position: relative;
    text-align: center;
    width: 9.05%;
    padding-top: 10px;
}

.time-horizontal li b::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 47%;
    width: 12px;
    height: 12px;
    border: 2px solid #cdc8c8;
    border-radius: 8px;
    background: #cdc8c8;
}

.time-horizontal li b.passivo::before {
    border: 2px solid #000;
    background: #000;
}

.time-horizontal li b.active::before {
    content: url('assets/media/favicons/ambulancia.png');
    transform: scale(.1);
    color: #000;
    top: -30px !important;
    left: 30%;
    border: none !important;
    border-radius: 0px !important;
    background: none !important;
}
.bg-warning-M{
  background: #f7a073 !important;
}
thead,
th {
    background-color: #0891b2 !important;
    border-color: #0891b2 !important;
}
</style>
