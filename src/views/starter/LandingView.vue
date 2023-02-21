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
const solicitudes = ref();
const tripulacion = ref();
const ambulancias_disponibles = ref();
const solicitud_en_curso = reactive({
    id: null,
    tipo_llamada: null,
    telefono: null,
    origen: 0,
    contacto: "",
    n_paciente: 1,
    lugar: "",
    referencia: "",
    motivo: "",
    nom_paciente:"NN",
    edad_paciente: 0,
    diabetico: false,
    hipertenso: false,
    postrado: false,
    epileptico: false,
    qtrs: [
        { numero: 1, createdAt: "" },
        { numero: 2, createdAt: "" }
    ],
    obs_cierre: "",
    Cometidos: [],
});

// Functions //
const addQtr = (num) => {
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    const index = solicitud_en_curso.qtrs.indexOf(solicitud_en_curso.qtrs.find(sol => sol.numero == num));
    solicitud_en_curso.qtrs[index].createdAt = now;
}

const Despacho = (data, accion) => {
    if (solicitud_en_curso.id) {
        if (data.Cometidos[0].tripulacionCometidos.length > 1) {
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
                    //Crear Cometido
                    if (accion === 1) {
                        let validaFono = false;
                        if (solicitud_en_curso.tipo_llamada == 1) {
                            if(solicitud_en_curso.telefono ){
                                validaFono = true;
                            }                            
                        } else {
                            if(solicitud_en_curso.tipo_llamada){
                                validaFono = true;
                            }
                        }

                        if (validaFono) {
                            if (solicitud_en_curso.tipo_llamada && solicitud_en_curso.lugar && solicitud_en_curso.motivo && solicitud_en_curso.qtrs[1].createdAt !== "") {    
                                const params = {
                                    'idSolicitud': solicitud_en_curso.id,
                                    'nom_paciente': solicitud_en_curso.nom_paciente,
                                    'tripulacion': data.Cometidos[0].tripulacionCometidos,
                                    'idAmbulancia': data.id
                                }
                                axios.post('https://' + url + '/api/cometidos', params, config).then((response) => {
                                    response.data['cometido']['tripulacionCometidos'] = params.tripulacion;
                                    const rspTripCometido = response.data['cometido']['tripulacionCometidos'];
                                    for (let i = 0; i < rspTripCometido.length; i++) {
                                        rspTripCometido[i]['idTripTurno'] = rspTripCometido[i].id;
                                    }
                                    const indexAMB = ambulancias_disponibles.value.indexOf(ambulancias_disponibles.value.find(AD => AD.id == data.id));
                                    ambulancias_disponibles.value[indexAMB].despacho = true;
                                    ambulancias_disponibles.value[indexAMB].Cometidos[0].idSolicitud = solicitud_en_curso.id;
                                    ambulancias_disponibles.value[indexAMB].Cometidos[0]['id'] = response.data['cometido'].id;
                                    solicitudes.value[solicitudes.value.indexOf(solicitudes.value.find(SOL => SOL.id == solicitud_en_curso.id))].Cometidos.push(response.data['cometido']);
                                    alertSuccess();
                                    window.open(boucher + '/#/boucher/' + solicitud_en_curso.id);
                                }).catch(function (error) {
                                    console.log(error);
                                    toast.fire("Oops...", error, "error");
                                });

                            } else {
                                toast.fire("Oops...", "Debe rellenar todos los campos marcados con * en la solicitud", "error");
                            }
                        } else {
                            toast.fire("Oops...", "Verifique el tipo de llamada y el numero de teléfono", "error");                            
                        }

                    }
                    //Cancelar Cometido
                    else {
                        anularCometido(data);
                    }
                }
            });
        } else {
            toast.fire("Oops...", "Debe ingresar al menos 2 tripulantes!", "error");
        }
    } else {
        toast.fire("Oops...", "Para realizar un despacho debe contar un numero de solciitud", "error");
    }
}

const cargarSolicitud = (data) => {
    solicitud_en_curso.qtrs = [];
    solicitud_en_curso.id = data.id;
    solicitud_en_curso.qtrs = data.Qtrs;
    solicitud_en_curso.tipo_llamada = data.tipo_llamada;
    solicitud_en_curso.telefono = data.telefono;
    solicitud_en_curso.origen = data.origen;
    solicitud_en_curso.n_paciente = data.n_paciente;
    solicitud_en_curso.contacto = data.contacto;
    solicitud_en_curso.estado = data.estado;
    solicitud_en_curso.n_paciente = data.n_paciente;
    solicitud_en_curso.lugar = data.lugar;
    solicitud_en_curso.referencia = data.referencia;
    solicitud_en_curso.motivo = data.motivo;
    solicitud_en_curso.obs_cierre = "";
    solicitud_en_curso.nom_paciente = data.nom_paciente;
    solicitud_en_curso.edad_paciente = data.edad_paciente;
    solicitud_en_curso.diabetico = data.diabetico;
    solicitud_en_curso.hipertenso = data.hipertenso;
    solicitud_en_curso.postrado = data.postrado;
    solicitud_en_curso.epileptico = data.epileptico;
    // setAmbulancias();
    if (data.Cometidos !== undefined) {
        for (var x = 0; x < data.Cometidos.length; x++) {
            const index = ambulancias_disponibles.value.indexOf(ambulancias_disponibles.value.find(f => f.id == data.Cometidos[x].idAmbulancia));
            ambulancias_disponibles.value[index].despacho = 1;
            ambulancias_disponibles.value[index].Cometidos = []
            ambulancias_disponibles.value[index].Cometidos.push(data.Cometidos[x]);
        }
    }
}

const guardarSolicitud = () => {
    if (solicitud_en_curso.qtrs[0].createdAt !== "") {
        const arrSolicitud = {
            tipo_llamada: solicitud_en_curso.tipo_llamada,
            telefono: solicitud_en_curso.telefono,
            origen: solicitud_en_curso.origen,
            n_paciente: solicitud_en_curso.n_paciente,
            lugar: solicitud_en_curso.lugar,
            contacto: solicitud_en_curso.contacto,
            referencia: solicitud_en_curso.referencia,
            motivo: solicitud_en_curso.motivo,
            resp_crea: responsable.value,
            edad_paciente: solicitud_en_curso.edad_paciente,
            nom_paciente: solicitud_en_curso.nom_paciente,
            diabetico: solicitud_en_curso.diabetico,
            hipertenso: solicitud_en_curso.hipertenso,
            postrado: solicitud_en_curso.postrado,
            epileptico: solicitud_en_curso.epileptico,
        };
        if (solicitud_en_curso.id) {
            // Actualiza la solicitud
            axios.put('https://' + url + '/api/solicitud/' + solicitud_en_curso.id, arrSolicitud, config).then((response) => {
                const index = solicitudes.value.indexOf(solicitudes.value.find(sol => sol.id == response.data.id));
                solicitudes.value[index].tipo_llamada = response.data.tipo_llamada;
                solicitudes.value[index].telefono = response.data.telefono;
                solicitudes.value[index].origen = response.data.origen;
                solicitudes.value[index].n_paciente = response.data.n_paciente;
                solicitudes.value[index].lugar = response.data.lugar;
                solicitudes.value[index].contacto = response.data.contacto;
                solicitudes.value[index].referencia = response.data.referencia;
                solicitudes.value[index].motivo = response.data.motivo;
                solicitudes.value[index].edad_paciente = response.data.edad_paciente;
                solicitudes.value[index].nom_paciente = response.data.nom_paciente;
                solicitudes.value[index].diabetico = response.data.diabetico;
                solicitudes.value[index].hipertenso = response.data.hipertenso;
                solicitudes.value[index].postrado = response.data.postrado;
                solicitudes.value[index].epileptico = response.data.epileptico;
                alertSuccess();
            }).catch(function (error) {
                console.log(error.response.data.msg);
                toast.fire("Oops...", "Error no se guardó su solicitud", "error");
                // window.location.assign('https://www.ssarica.cl');
            });
        } else {
            // Inserta nueva  solicitud
            axios.post('https://' + url + '/api/solicitud', arrSolicitud, config).then((response) => {
                solicitud_en_curso.id = response.data['solicitud'].id
                arrSolicitud.id = response.data['solicitud'].id;
                arrSolicitud.n_paciente = 0;
                arrSolicitud.obs_cierre = "";
                arrSolicitud.Cometidos = [];
                const params = [
                    {
                        "numero": solicitud_en_curso.qtrs[0].numero,
                        "idSolicitud": response.data['solicitud'].id,
                        "createdAt": solicitud_en_curso.qtrs[0].createdAt
                    },
                    {
                        "numero": solicitud_en_curso.qtrs[1].numero,
                        "idSolicitud": response.data['solicitud'].id,
                        "createdAt": solicitud_en_curso.qtrs[1].createdAt
                    }
                ];
                if (response.data['solicitud'].id) {
                    axios.post('https://' + url + '/api/Qtr/array', params, config).then((resp) => {
                        arrSolicitud.Qtrs = resp.data["qtr"];
                        alertSuccess();
                        solicitudes.value.push(arrSolicitud);
                    });
                }
            }).catch(function (error) {
                console.log(error);
                toast.fire("Oops...", "Error no se guardó su solicitud", "error");
                // window.location.assign('https://www.ssarica.cl');
            });
        }
    } else {
        toast.fire("Oops...", "Debe ingresar los QTRs", "error");
    }
}

const cerrarSolicitud = () => {
    if (solicitud_en_curso.id) {
        const myModal = new bootstrap.Modal(document.getElementById('modal-block-slideleft'), {
            focus: true,
        });
        myModal.show();
    }
}

const anularSolicitud = () => {
    if (solicitud_en_curso.obs_cierre && solicitud_en_curso.id) {
        axios.put('https://' + url + '/api/solicitud/cerrar/' + solicitud_en_curso.id, { motivoCierre: solicitud_en_curso.obs_cierre, resp: responsable.value, }, config).then((response) => {
            const indice = solicitudes.value.indexOf(solicitudes.value.find(s => s.id == solicitud_en_curso.id));
            const cometidos = solicitudes.value[indice].Cometidos;
            for (let i = 0; i < cometidos.length; i++) {
                const cero = {
                    Cometidos: []
                }
                cero.Cometidos.push(cometidos[i]);
                anularCometido(cero, 1);
            }
            Limpiar();
            toast.fire(
                "Excelente!",
                "La solicitud se cerró exitosamente.",
                "success"
            );
            solicitudes.value.splice(indice, 1);
        }).catch(function (error) {
            console.log(error);
            toast.fire("Oops...", "Ocurrio un error por favor actualice la pagina", "error");
            // window.location.assign('https://www.ssarica.cl');
        });
    } else {
        toast.fire("Oops...", "Debe ingresar un motivo de cierre", "warning");
    }
}

const Limpiar = () => {        
    solicitud_en_curso.id = null;
    solicitud_en_curso.tipo_llamada = null;
    solicitud_en_curso.telefono = null;
    solicitud_en_curso.origen = 0;
    solicitud_en_curso.contacto = "";
    solicitud_en_curso.n_paciente = 1;
    solicitud_en_curso.lugar = "";
    solicitud_en_curso.referencia = "";
    solicitud_en_curso.motivo = "";
    solicitud_en_curso.nom_paciente = "NN";
    solicitud_en_curso.edad_paciente = 0;
    solicitud_en_curso.diabetico = false;
    solicitud_en_curso.hipertenso = false;
    solicitud_en_curso.postrado = false;
    solicitud_en_curso.epileptico = false;    
    solicitud_en_curso.Cometidos = [];
    solicitud_en_curso.tripulacion = [];
    solicitud_en_curso.qtrs = [
        { numero: 1, createdAt: "" },
        { numero: 2, createdAt: "" }
    ];
    solicitud_en_curso.obs_cierre = "";
    // setAmbulancias();
    document.querySelector("#btabs-animated-slideup-home-tab").click();
}

const ordenarTripulacion = () => {
    tripulacion.value.sort((x, y) => x.idTipoFuncionario - y.idTipoFuncionario);
}

const setAmbulancias = () => {
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
        console.log(error.response.data.msg);
        toast.fire("Oops...", "Ocurrio un error por favor actualice la pagina", "error");
        
    });

}

const anularCometido = (data, ubicacion) => {
    let EstadoCom = 2;
    if (ubicacion) {
        data.id = data.Cometidos[0].idAmbulancia;
        EstadoCom = 3;
    }
    console.log("data = ", data);
    const params = {
        'idSolicitud': solicitud_en_curso.id,
        'tripulacion': data.Cometidos[0].tripulacionCometidos,
        'idAmbulancia': data.id,
        'idCometido': data.Cometidos[0].id,
        'resp': responsable.value,
        EstadoCom: EstadoCom
    };
    axios.put('https://' + url + '/api/cometidos/delete/' + data.Cometidos[0].id, params, config).then((response) => {
        const indexSolicitud = solicitudes.value.indexOf(solicitudes.value.find(SOL => SOL.id == solicitud_en_curso.id));
        const indexAMB = ambulancias_disponibles.value.indexOf(ambulancias_disponibles.value.find(AD => AD.id == data.id));
        ambulancias_disponibles.value[indexAMB].despacho = null;
        const indexCometido = solicitudes.value[indexSolicitud].Cometidos.indexOf(solicitudes.value[indexSolicitud].Cometidos.find(COM => COM.id == params.idCometido));
        solicitudes.value[indexSolicitud].Cometidos.splice(indexCometido, 1);
        alertSuccess();
    }).catch(function (error) {
        console.log(error);
        toast.fire("Oops...", "Ocurrio un error por favor actualice la pagina", "error");
    });
}

const cleanAmbulancias = () => {
    for (let x = 0; x < ambulancias_disponibles.value.length; x++) {
        let ambTrip = ambulancias_disponibles.value[x].Cometidos[0].tripulacionCometidos;
        for (let i = 0; i < ambTrip.length; i++) {
            if (ambTrip[i].idFuncionario !== "" && ambTrip[i].idTripTurno == undefined) {
                tripulacion.value.push(ambTrip[i]);
            }
        }
        ambulancias_disponibles.value[x].Cometidos[0].tripulacionCometidos = [];
    }
}



onMounted(() => {

    const element = document.querySelector('#btabs-animated-slideup-settings-tab');
    element.classList.remove('active');

    axios.get('https://' + url + '/api/solicitud/disponibles', config).then((response) => {
        solicitudes.value = response.data['solicitudes'];
    }).catch(function (error) {
        console.log(error.response.data.msg);
        toast.fire("Oops...", "Ocurrio un error por favor actualice la pagina", "error");
    });
    axios.get('https://' + url + '/api/Turno/disponibles', config).then((response) => {
        if (response.data['TurnoDisponible'].length > 0) {
            tripulacion.value = response.data['TurnoDisponible'][0].tripulacionTurnos;
            setAmbulancias();
        } else {
            toast.fire("Oops...", "no existe turno creado! Antes de ingresar una solicitud, debe crear un turno", "warning");
        }
    }).catch(function (error) {
        console.log(error);
        toast.fire("Oops...", "Ocurrio un error por favor actualice la pagina", "error");
    });

    axios.post("https://" + url + "/api/auth/login", { key: localStorage.getItem('key') }).then((response) => {
        responsable.value = response.data['funcionario'].id;
    }).catch(function (error) {
        console.log(error);
        window.location.assign('https://www.ssarica.cl');
    });    
});

</script>
<style lang="scss">
// SweetAlert2
@import "sweetalert2/dist/sweetalert2.min.css";
</style>
<template>
    <BasePageHeading title="Recepción" subtitle="Registro de Llamadas / Solicitudes">
        <template #extra>
            <button type="button" class="btn btn-alt-primary" @click="Limpiar">
                <i class="fa fa-plus opacity-50 me-1"></i>
                Nueva Solicitud
            </button>
        </template>
    </BasePageHeading>
    <div class="content">
        <div class="row items-push">
            <div class="col-12 col-md-9">
                <div class="block-rounded block h-100 mb-0">
                    <div class="block-header block-header-default bg-modern pb-0">
                        <ul class="nav nav-tabs nav-tabs-block bg-modern" role="tablist">
                            <li class="nav-item">
                                <button class="nav-link active" id="btabs-animated-slideup-home-tab"
                                    data-bs-toggle="tab" data-bs-target="#btabs-animated-slideup-home" role="tab"
                                    aria-controls="btabs-animated-slideup-home" aria-selected="false"> Solicitud N°
                                    <span v-if="solicitud_en_curso.id != null">{{solicitud_en_curso.id}}</span> <span
                                        v-else>S/N</span> </button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" id="btabs-animated-slideup-settings-tab" data-bs-toggle="tab"
                                    data-bs-target="#btabs-animated-slideup-settings" role="tab"
                                    aria-controls="btabs-animated-slideup-settings" aria-selected="true"> Despachar
                                    Cometido </button>
                            </li>
                        </ul>
                        <div class="block-options space-x-1">
                            <button type="button" class="btn btn-sm btn-alt-secondary mb-2" @click="Limpiar">
                                <i class="fa fa-plus opacity-50 me-1"></i>
                                Nueva Solicitud
                            </button>
                            <button type="button" class="btn btn-sm btn-alt-primary mb-2" @click="guardarSolicitud">
                                Guardar </button>
                            <button type="button" class="btn btn-sm btn-alt-info mb-2" @click="cerrarSolicitud"> Cerrar
                            </button>                            
                        </div>
                    </div>
                    <div class="block-content tab-content overflow-hidden">
                        <div class="tab-pane px-0 fade fade-up active show" id="btabs-animated-slideup-home" role="tabpanel" aria-labelledby="btabs-animated-slideup-home-tab">
                            <div class="block-content tab-pane" id="btabs-vertical-home" role="tabpanel" aria-labelledby="btabs-vertical-home-tab">
                                <div class="row justify-content-center py-sm-3 py-md-0">
                                    <div class="col-sm-12 mt-2">
                                        <div class="row">
                                            <div class="col-2 text-center align-self-center">
                                                <button type="button" class="btn btn-primary btn btn-lg"
                                                    :class="{'disabled' : solicitud_en_curso.qtrs[0].createdAt}"
                                                    @click="addQtr(1)">QTR 1</button>
                                            </div>
                                            <div class="col-8 col-md-4 mb-4">
                                                <div class="form-floating mt-4">
                                                    <input type="time" class="form-control"
                                                        :value="moment(solicitud_en_curso.qtrs[0].createdAt).format('HH:mm:ss')"
                                                        disabled id="qtr1" name="qtr1">
                                                    <label for="example-text-input-floating">Hora de Llamada (QTR1)
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="col-2 text-center align-self-center">
                                                <button type="button" class="btn btn-primary btn btn-lg"
                                                    :class="{'disabled' : solicitud_en_curso.qtrs[1].createdAt}"
                                                    @click="addQtr(2)">QTR 2</button>
                                            </div>
                                            <div class="col-8 col-md-4 mb-4">
                                                <div class="form-floating mt-4">
                                                    <input type="time" class="form-control"
                                                        :value="moment(solicitud_en_curso.qtrs[1].createdAt).format('HH:mm:ss')"
                                                        disabled id="qtr2" name="qtr2">
                                                    <label for="example-text-input-floating">Termino de Llamada (QTR2)
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="col-12 col-md-8 mb-4">
                                                <label class="form-label">(*) Tipo de llamada </label>
                                                <div class="row">
                                                    <div class="col-5">
                                                        <div class="form-check form-block">
                                                            <input type="radio" class="form-check-input"
                                                                id="example-radio-block1"
                                                                v-model="solicitud_en_curso.tipo_llamada" value="1">
                                                            <label class="form-check-label" for="example-radio-block1">
                                                                <span class="d-block fw-normal text-center">
                                                                    <span
                                                                        class="d-block fs-sm text-muted">Telefónico</span>
                                                                </span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div class="col-3">
                                                        <div class="form-check form-block">
                                                            <input type="radio" class="form-check-input"
                                                                id="example-radio-block2"
                                                                v-model="solicitud_en_curso.tipo_llamada" value="2">
                                                            <label class="form-check-label" for="example-radio-block2">
                                                                <span class="d-block fw-normal text-center">
                                                                    <span class="d-block fs-sm text-muted">VHF</span>
                                                                </span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div class="col-4">
                                                        <div class="form-check form-block">
                                                            <input type="radio" class="form-check-input"
                                                                id="example-radio-block3"
                                                                v-model="solicitud_en_curso.tipo_llamada" value="3">
                                                            <label class="form-check-label" for="example-radio-block3">
                                                                <span class="d-block fw-normal text-center">
                                                                    <span class="d-block fs-sm text-muted">No Hay</span>
                                                                </span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-12 col-md-4 mb-4">
                                                <div class="form-floating mt-4"
                                                    v-show="solicitud_en_curso.tipo_llamada == 1">
                                                    <input type="number" min="1" class="form-control" id="example-text-input-floating"
                                                        v-model.number="solicitud_en_curso.telefono"  name="example-text-input-floating" placeholder="Solo Numeros">
                                                    <label for="example-text-input-floating">Teléfono (solo números)</label>
                                                </div>
                                            </div>
                                            <div class="col-12 col-md-4 mb-4">
                                                <div class="form-floating">
                                                    <select class="form-select" id="example-select-floating"
                                                        v-model="solicitud_en_curso.origen"
                                                        name="example-select-floating">
                                                        <option>Seleccione un Origen</option>
                                                        <option value="1">Paciente</option>
                                                        <option value="2">Testigo</option>
                                                        <option value="3">Familiar</option>
                                                        <option value="4">Onemi</option>
                                                        <option value="5">Carabineros</option>
                                                        <option value="6">Gendarmeria</option>
                                                        <option value="7">Pdi</option>
                                                        <option value="8">Centro Médico</option>
                                                        <option value="9">Otro</option>
                                                    </select><label for="example-select-floating">Origen de la
                                                        solicitud</label>
                                                </div>
                                            </div>
                                            <div class="col-12 col-md-5 mb-4">
                                                <div class="form-floating ">
                                                    <input type="text" class="form-control"
                                                        v-model="solicitud_en_curso.contacto"
                                                        id="example-text-input-floating"
                                                        name="example-text-input-floating">
                                                    <label for="example-text-input-floating">Persona Contacto</label>
                                                </div>
                                            </div>
                                            <div class="col-12 col-md-3 mb-4">
                                                <div class="form-floating ">
                                                    <input type="number" class="form-control" autocomplete="off"
                                                        id="example-text-input-floating" min="0"
                                                        v-model="solicitud_en_curso.n_paciente"
                                                        name="example-text-input-floating">
                                                    <label for="example-text-input-floating">N° Pacientes</label>
                                                </div>
                                            </div>

                                            <div class="col-12 col-md-6 mb-4">
                                                <div class="form-floating ">
                                                    <input type="text" class="form-control"
                                                        id="example-text-input-floating"
                                                        v-model="solicitud_en_curso.lugar"
                                                        name="example-text-input-floating">
                                                    <label for="example-text-input-floating">(*) Lugar del suceso
                                                    </label>
                                                </div>
                                            </div>

                                            <div class="col-12 col-md-6 mb-4">
                                                <div class="form-floating ">
                                                    <input type="text" class="form-control"
                                                        id="example-text-input-floating"
                                                        v-model="solicitud_en_curso.referencia"
                                                        name="example-text-input-floating">
                                                    <label for="example-text-input-floating">Referencia del lugar
                                                        corto</label>
                                                </div>
                                            </div>

                                            <div class="col-12 col-md-9 mb-4" v-show="solicitud_en_curso.n_paciente == 1">
                                                <div class="form-floating ">
                                                    <input type="text" class="form-control" v-model="solicitud_en_curso.nom_paciente" id="example-text-input-floating"
                                                        name="example-text-input-floating">
                                                    <label for="example-text-input-floating">Nombre Paciente</label>
                                                </div>
                                            </div>
                                            <div class="col-12 col-md-3 mb-4" v-show="solicitud_en_curso.n_paciente == 1">
                                                <div class="form-floating ">
                                                    <input type="number" class="form-control" v-model="solicitud_en_curso.edad_paciente" id="example-text-input-floating"
                                                        name="example-text-input-floating">
                                                    <label for="example-text-input-floating">Edad</label>
                                                </div>
                                            </div>

                                            <div class="col-md-3 mb-4" v-show="solicitud_en_curso.n_paciente == 1">
                                                <div class="form-check form-block"><input class="form-check-input"
                                                    type="checkbox" id="example-checkbox-diabetico"
                                                    name="example-checkbox-diabetico" value="1" v-model="solicitud_en_curso.diabetico">
                                                    <label class="form-check-label" for="example-checkbox-diabetico">
                                                    <span class="d-flex align-items-center">
                                                        <img class="img-avatar img-avatar32"
                                                            src="/assets/media/avatars/avatar1.jpg"
                                                            alt="Avatar"><span class="ms-2">
                                                                <!-- <span class="fw-bold">Diabético</span> -->
                                                                <span class="d-block fs-sm text-muted">Diabético</span>
                                                            </span>
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div class="col-md-3 mb-4" v-show="solicitud_en_curso.n_paciente == 1">
                                                <div class="form-check form-block"><input class="form-check-input"
                                                        type="checkbox" id="example-checkbox-hipertenso"
                                                        name="example-checkbox-hipertenso" value="1" v-model="solicitud_en_curso.hipertenso"><label
                                                        class="form-check-label" for="example-checkbox-hipertenso"><span
                                                            class="d-flex align-items-center"><img
                                                                class="img-avatar img-avatar32"
                                                                src="/assets/media/avatars/avatar1.jpg"
                                                                alt="Avatar"><span class="ms-2">
                                                                    <!-- <span class="fw-bold">Hipertenso</span> -->
                                                                    <span class="d-block fs-sm text-muted">Hipertenso</span>
                                                                </span>
                                                            </span>
                                                        </label>
                                                </div>
                                            </div>

                                            <div class="col-md-3 mb-4" v-show="solicitud_en_curso.n_paciente == 1">
                                                <div class="form-check form-block"><input class="form-check-input"
                                                        type="checkbox" id="example-checkbox-postrado"
                                                        name="example-checkbox-postrado" value="1" v-model="solicitud_en_curso.postrado"><label
                                                        class="form-check-label" for="example-checkbox-postrado"><span
                                                            class="d-flex align-items-center"><img
                                                                class="img-avatar img-avatar32"
                                                                src="/assets/media/avatars/avatar1.jpg"
                                                                alt="Avatar"><span class="ms-2">
                                                                    <!-- <span class="fw-bold">Postrado</span> -->
                                                                    <span class="d-block fs-sm text-muted">Postrado</span>
                                                                </span>
                                                            </span>
                                                        </label>
                                                </div>
                                            </div>

                                            <div class="col-md-3 mb-4" v-show="solicitud_en_curso.n_paciente == 1">
                                                <div class="form-check form-block"><input class="form-check-input"
                                                        type="checkbox" id="example-checkbox-epileptico"
                                                        name="example-checkbox-epileptico" value="1" v-model="solicitud_en_curso.epileptico"><label
                                                        class="form-check-label" for="example-checkbox-epileptico"><span
                                                            class="d-flex align-items-center"><img
                                                                class="img-avatar img-avatar32"
                                                                src="/assets/media/avatars/avatar1.jpg"
                                                                alt="Avatar"><span class="ms-2">
                                                                    <!-- <span class="fw-bold">Postrado</span> -->
                                                                    <span class="d-block fs-sm text-muted">Epileptico</span>
                                                                </span>
                                                            </span>
                                                        </label>
                                                </div>
                                            </div>

                                            <div class="col-12">
                                                <div class="form-floating mb-4">
                                                    <textarea class="form-control" id="example-textarea-floating"
                                                        v-model="solicitud_en_curso.motivo"
                                                        name="example-textarea-floating"
                                                        style="height: 150px;"></textarea>
                                                    <label for="example-textarea-floating">(*) Motivo </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="tab-pane px-0 fade fade-up" id="btabs-animated-slideup-settings" role="tabpanel" aria-labelledby="btabs-animated-slideup-settings-tab">
                            <div class="block-content tab-pane" id="btabs-vertical-settings" role="tabpanel" aria-labelledby="btabs-vertical-settings-tab">
                                <div class="row mb-5">
                                    <div class="col-6">
                                        <div class="row">
                                            <h3>
                                                Moviles
                                                <i class="nav-main-link-icon fa fa-truck-medical float-end"></i>
                                            </h3>
                                            <hr>
                                            <div class="col-12 my-2" v-for="ad in ambulancias_disponibles" :key="ad.id">
                                                <template
                                                    v-if="ad.estado == 1 && ad.despacho != 1 || solicitud_en_curso.id === ad.Cometidos[0].idSolicitud">
                                                    <h4>
                                                        <a type="button" class="btn btn-sm rounded-pill btn-success me-3" style="padding: 0.25rem;" v-show="ad.tipo == 1">  </a>
                                                        <a type="button" class="btn btn-sm rounded-pill btn-primary me-3" style="padding: 0.25rem;" v-show="ad.tipo == 2">  </a>
                                                        Movil {{ad.movil}}
                                                        <a type="button" class="btn btn-sm btn-alt-primary ms-3"
                                                            v-show="ad.despacho != 1" @click="Despacho(ad,1)">
                                                            Despachar </a>
                                                        <a type="button" class="btn btn-sm btn-alt-danger ms-3"
                                                            v-show="ad.despacho == 1" @click="Despacho(ad)"> Cancelar
                                                            despacho </a>
                                                    </h4>
                                                    <draggable :id="'AMB'+ad.id" class="list-group py-1 he-min"
                                                        :class="[ ad.despacho == 1 ? 'bg-gray-light' : 'bg-success-light' ]"
                                                        :disabled="true" 
                                                        :list="ad.Cometidos[0].tripulacionCometidos" group="people"
                                                        @change="$emit('log')" itemKey="name">
                                                        <template #item="{ element, index }">
                                                            <div
                                                                class="list-group-item border-modern border border-4 rounded text-modern cursor-p px-3 py-1 my-1 fs-14">
                                                                {{index+1}} -
                                                                <span v-show="element.idTipoFuncionario === 1"
                                                                    class="badge rounded-pill bg-primary-op"> Enfermero
                                                                </span>
                                                                <span v-show="element.idTipoFuncionario === 2"
                                                                    class="badge rounded-pill bg-modern-light"> Tecnico
                                                                </span>
                                                                <span v-show="element.idTipoFuncionario === 3"
                                                                    class="badge rounded-pill bg-smooth-op"> Conductor
                                                                </span>
                                                                {{ " "+element.Funcionario.nombre}}
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
                                                <div class="list-group-item border-modern border border-4 rounded text-modern cursor-p px-3 py-1 my-1 fs-14"
                                                    v-if="element.idEstado == 1">
                                                    <span v-show="element.idTipoFuncionario === 1"
                                                        class="badge rounded-pill bg-primary-op"> Enfermero </span>
                                                    <span v-show="element.idTipoFuncionario === 2"
                                                        class="badge rounded-pill bg-modern-light"> Tecnico </span>
                                                    <span v-show="element.idTipoFuncionario === 3"
                                                        class="badge rounded-pill bg-smooth-op"> Conductor </span>
                                                    {{ " "+element.Funcionario.nombre}}
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
            <div class="col-sm-12 col-md-3">
                <div class="block-rounded block">
                    <ul class="nav nav-tabs nav-tabs-block bg-flat" role="tablist">
                        <li class="nav-item ms-auto mt-06">
                            <button class="nav-link active" id="btabs-animated-slideright-home-tab" data-bs-toggle="tab" data-bs-target="#btabs-animated-slideright-home" role="tab"
                                aria-controls="btabs-animated-slideright-home" aria-selected="true">
                                Sin Despacho </button>
                        </li>
                        <li class="nav-item me-auto mt-06">
                            <button class="nav-link" id="btabs-animated-slideright-profile-tab" data-bs-toggle="tab" data-bs-target="#btabs-animated-slideright-profile" role="tab"
                                aria-controls="btabs-animated-slideright-profile" aria-selected="false">
                                En Cometido </button>
                        </li>
                    </ul>
                    <div class="block-content tab-content overflow-hidden he-min pt-5">
                        <div class="tab-pane px-0 fade fade-right active show" id="btabs-animated-slideright-home"
                            role="tabpanel" aria-labelledby="btabs-animated-slideright-home-tab">
                            <div class="" v-for="item in solicitudes" :key="item.id">
                                <a v-if="item.Cometidos == ''" class="block-rounded block-link-pop block"
                                    @click="cargarSolicitud(item)">
                                    <div class="block-header block-header-default bg-gray ">
                                        <h3 class="block-title"> Solicitud N° <small
                                                class="text-primary-darker fw-bold">{{item.id}}</small></h3>
                                        <div class="block-options space-x-1">
                                            <button type="button" class="btn-block-option ">
                                                <i class="si si-settings"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="block-content overflow-auto">
                                        <p>{{item.lugar +' - '+ item.contacto}}</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                        <div class="tab-pane px-0 fade fade-right " id="btabs-animated-slideright-profile"
                            role="tabpanel" aria-labelledby="btabs-animated-slideright-profile-tab">
                            <div class="" v-for="item in solicitudes" :key="item.id">
                                <a v-if="item.Cometidos != ''" class="block-rounded block-link-pop block"
                                    @click="cargarSolicitud(item)">
                                    <div class="block-header block-header-default bg-flat-light">
                                        <h3 class="block-title"> Solicitud N° <small
                                                class="text-primary-darker fw-bold">{{item.id}}</small></h3>
                                        <div class="block-options space-x-1">
                                            <button type="button" class="btn-block-option ">
                                                <i class="si si-settings"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="block-content overflow-auto">
                                        <p>{{item.lugar +' - '+ item.contacto}}</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal fade" id="modal-block-slideleft" tabindex="-1" role="dialog"
            aria-labelledby="modal-block-slideleft" aria-hidden="true">
            <div class="modal-dialog modal-dialog-slideleft" role="document">
                <div class="modal-content">
                    <BaseBlock title="Cerrar Solicitud" transparent class="mb-0">
                        <template #options>
                            <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
                                <i class="fa fa-fw fa-times"></i>
                            </button>
                        </template>

                        <template #content>
                            <div class="block-content fs-sm">
                                <div class="form-floating mb-4">
                                    <textarea class="form-control" id="example-textarea-floating"
                                        v-model="solicitud_en_curso.obs_cierre" style="height: 200px;"></textarea>
                                    <label for="example-textarea-floating">Ingrese el motivo de Cierre</label>
                                </div>
                            </div>
                            <div class="block-content block-content-full text-end bg-body">
                                <button type="button" class="btn btn-sm btn-alt-secondary me-1" data-bs-dismiss="modal">
                                    Salir
                                </button>
                                <button type="button" class="btn btn-sm btn-primary" data-bs-dismiss="modal"
                                    @click="anularSolicitud">
                                    Cerrar Solicitud
                                </button>
                            </div>
                        </template>
                    </BaseBlock>
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
