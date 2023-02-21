<script setup>
import { ref, reactive, onMounted } from 'vue'
import draggable from "vuedraggable";
import moment from 'moment';
import Swal from "sweetalert2";
import axios from 'axios';
// Configurations
let toast = Swal.mixin({
    buttonsStyling: false,
    target: "#page-container",
    customClass: {
        confirmButton: "btn btn-success m-1",
        cancelButton: "btn btn-danger m-1",
        input: "form-control",
    },
});
const alertSuccess = () => {
    toast.fire(
        "Excelente!",
        "La solicitud se guardó exitosamente.",
        "success"
    );
}
let url = '';
let boucher = '';
const responsable = ref();
if (window.document.location.host === "localhost:3000" || window.document.location.host === "10.8.83.72:3000") {
    if (window.document.location.host === "10.8.83.72:3000") {
        url = '10.8.83.72:8000';
        boucher = 'https://10.8.83.72:3000';
    } else {
        url = 'localhost:8000';
        boucher = 'https://localhost:3000';
    }
} else {
    boucher = 'https://www.ssarica.cl/AP_SAMU';
    url = 'www.ssarica.cl:8000';
}
const config = {
    headers: {
        'x-token': localStorage.getItem('uid')
    }
};
// Lista de Arrays
const tripulacion = ref();
const ambulancias_disponibles = ref();
const guardar = () => {
    toast.fire({
        title: "¿ Estas Seguro ?",
        icon: "warning",
        showCancelButton: true,
        customClass: {
            confirmButton: "btn btn-primary m-1",
            cancelButton: "btn btn-danger m-1",
        },
        confirmButtonText: "Si, Seguro!",
        html: false,
        preConfirm: () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 30);
            });
        },
    }).then((result) => {
        if (result.value) { 
            const params = {
                'tripulacion': []
            }
            for (let i = 0; i < ambulancias_disponibles.value.length; i++) {
                const trip = ambulancias_disponibles.value[i].Cometidos[0].tripulacionCometidos;
                for (let x = 0; x < trip.length; x++) {
                    if(trip[x] !== ""){
                        const t = {
                            idTrip: trip[x].id,
                            idAmbulancia: ambulancias_disponibles.value[i].id
                        }
                        params.tripulacion.push(t);
                    }                
                }
            }
            for (let i = 0; i < tripulacion.value.length; i++) {
                const t = {
                    idTrip: tripulacion.value[i].id,
                    idAmbulancia: null
                }
                params.tripulacion.push(t);
            }
            console.log("Params", params);
            axios.post('https://' + url + '/api/triputacionTurno/all', params, config).then((response) => {
                // console.log("response",response.data);
                alertSuccess();

            }).catch(function (error) {
                console.log(error.response.data.msg);
                toast.fire("Oops...", error, "error");
            });
        }
    });
}

const ordenarTripulacion = () => {
    tripulacion.value.sort((x, y) => x.idTipoFuncionario - y.idTipoFuncionario);
}

const setAmbulancias = () => {
    ambulancias_disponibles.value = [];
    // console.log("tripulacion ", tripulacion.value);
    axios.get('https://' + url + '/api/ambulancia/disponibles', config).then((response) => {
        let Arrays = response.data['ambulancias'];
        ambulancias_disponibles.value = Arrays.map( (arr) => {
            arr.Cometidos = [];
            const arrBUSC = tripulacion.value;
            tripulacion.value = arrBUSC.filter((tripu) => tripu.idAmbulancia !== arr.id);
            arr.Cometidos.push(
                {
                    tripulacionCometidos: arrBUSC.filter((tripu) => tripu.idAmbulancia == arr.id)
                }
            );               
            return arr;
        });
        ordenarTripulacion();
    }).catch(function (error) {
        console.log(error);
    });
}

onMounted(() => {
    axios.get('https://' + url + '/api/Turno/disponibles', config).then((response) => {
        if (response.data['TurnoDisponible'].length > 0) {
            // console.log("funcionarios",response.data['TurnoDisponible'][0].tripulacionTurnos);
            tripulacion.value = response.data['TurnoDisponible'][0].tripulacionTurnos;
            setAmbulancias();
        } else {
            toast.fire("Oops...", "no existe turno creado! Antes de ingresar una solicitud, debe crear un turno", "warning");
        }
    }).catch(function (error) {
        console.log(error.response.data.msg);
        window.location.assign('https://www.ssarica.cl');
    });
    axios.post("https://" + url + "/api/auth/login", { key: localStorage.getItem('key') }).then((response) => {
        responsable.value = response.data['funcionario'].id;
    }).catch(function (error) {
        console.log(error.response.data.msg);
        window.location.assign('https://www.ssarica.cl');
    });    
});

</script>
<style lang="scss">
// SweetAlert2
@import "sweetalert2/dist/sweetalert2.min.css";
</style>
<template>
    <BasePageHeading title="Tripulación" subtitle="Configuracion de Tripulación"></BasePageHeading>
    <div class="content">
        <div class="row items-push">
            <div class="col-12">
                <div class="block-rounded block h-100 mb-0">
                    <div class="block-header block-header-default bg-modern pb-0">
                        <ul class="nav nav-tabs nav-tabs-block bg-modern" role="tablist">
                            <li class="nav-item">
                                <button class="nav-link" id="btabs-animated-slideup-home-tab"
                                    data-bs-toggle="tab" data-bs-target="#btabs-animated-slideup-home" role="tab"
                                    aria-controls="btabs-animated-slideup-home" aria-selected="false"> Ultima Configuración:
                                </button>
                            </li>
                        </ul>
                        <div class="block-options space-x-1">
                            <button type="button" class="btn btn-sm btn-alt-primary mb-2" @click="guardar"> Guardar </button>
                        </div>
                    </div>
                    <div class="block-content tab-content overflow-hidden">
                        <div class="tab-pane px-0 fade fade-up active show" id="btabs-animated-slideup-settings" role="tabpanel" aria-labelledby="btabs-animated-slideup-settings-tab">
                            <div class="block-content tab-pane" id="btabs-vertical-settings" role="tabpanel" aria-labelledby="btabs-vertical-settings-tab">
                                <div class="row mb-5">
                                    <div class="col-6">
                                        <div class="row">
                                            <h3>
                                                Móviles
                                                <i class="nav-main-link-icon fa fa-truck-medical float-end"></i>
                                            </h3>
                                            <hr>
                                            <div class="col-12 my-2" v-for="ad in ambulancias_disponibles" :key="ad.id">
                                                <template v-if="ad.estado == 1">
                                                    <h4>
                                                        <span class="badge rounded-pill bg-success me-2" style="font-size: 0.5em; vertical-align: middle;" v-show="ad.tipo == 1"> Básica </span>                                           
                                                        <span class="badge rounded-pill bg-primary me-2" style="font-size: 0.5em; vertical-align: middle;" v-show="ad.tipo == 2"> Avanzada </span>                                           
                                                        Móvil {{ad.movil}}
                                                    </h4>
                                                    <draggable :id="'AMB'+ad.id" class="list-group py-1 he-min bg-success-light"
                                                        :list="ad.Cometidos[0].tripulacionCometidos" group="people" @change="$emit('log')" itemKey="name">
                                                        <template #item="{ element, index }">
                                                            <div class="list-group-item border-modern border border-4 rounded text-modern cursor-p px-3 py-1 my-1 fs-14">
                                                                {{index+1}} -
                                                                <span v-show="element.idTipoFuncionario === 1" class="badge rounded-pill bg-primary-op"> Enfermero </span>
                                                                <span v-show="element.idTipoFuncionario === 2" class="badge rounded-pill bg-modern-light"> Técnico </span>
                                                                <span v-show="element.idTipoFuncionario === 3" class="badge rounded-pill bg-smooth-op"> Conductor </span> 
                                                                {{ " " + element.Funcionario.nombre }}
                                                            </div>
                                                        </template>
                                                    </draggable>
                                                </template>
                                            </div>
                                            <hr>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <h3>
                                            Asignar Tripulación
                                            <i class="nav-main-link-icon fa fa-head-side-mask float-end"></i>
                                        </h3>
                                        <hr>
                                        <h5>Funcionarios</h5>
                                        <draggable class="list-group bg-gray-light py-1 he-min" :list="tripulacion"
                                            group="people" @change="$emit('log')" itemKey="name">
                                            <template #item="{ element }">
                                                <div class="list-group-item border-modern border border-4 rounded text-modern cursor-p px-3 py-1 my-1 fs-14">
                                                    <span v-show="element.idTipoFuncionario === 1" class="badge rounded-pill bg-primary-op"> Enfermero </span>
                                                    <span v-show="element.idTipoFuncionario === 2" class="badge rounded-pill bg-modern-light"> Técnico </span>
                                                    <span v-show="element.idTipoFuncionario === 3" class="badge rounded-pill bg-smooth-op"> Conductor </span>
                                                    {{ " " + element.Funcionario.nombre }}
                                                </div>
                                            </template>
                                        </draggable>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
    .nav-tabs-block .nav-link {
        color: #fff;
    }

    .tab-content>.active {
        padding-left: 2.5rem;
        padding-right: 2.5rem;
    }

    .content {
        padding: 1.5rem 1.5rem 1px;
    }

    .nav-tabs-block .nav-link {
        padding-bottom: 1.2rem;
    }

    .cursor-p {
        cursor: pointer;
    }

    .he-min {
        min-height: 70px;
    }

    .mt-06 {
        margin-top: 0.6rem !important;
    }

    .fs-14 {
        font-size: 14px;
    }
</style>
