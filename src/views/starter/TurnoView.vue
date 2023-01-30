<script setup>
import { ref, reactive, computed, onBeforeMount, onMounted } from 'vue'
import Swal from "sweetalert2";
import axios from 'axios';

let toast = Swal.mixin({
  buttonsStyling: false,
  target: "#page-container",
  customClass: {
    confirmButton: "btn btn-success m-1",
    cancelButton: "btn btn-danger m-1",
    input: "form-control",
  },
});
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

const config = {
    headers:{
        'x-token': localStorage.getItem('uid')
    }
};
const idTurnoAnterior = ref();
const allTurno = ref();
const searchEnfermero = ref();
const searchTecnico = ref();
const searchConductor = ref();
const responsable = ref();
let btnLoading = ref(false);
//Arrays de todos los funcionarios de samu
const funcionarios = reactive({
    enfermero:[],
    tecnico  :[],
    conductor:[]
});
//Array de funcionarios que estan seleccionados para el turno
const seleccionados = reactive({
    enfermero:[],
    tecnico:[],
    conductor:[]
});
// ingresar o eliminar funcionario seleccionado para el turno
function toggle(arr,item,ev){
    console.log(item);
    const index = seleccionados[arr].indexOf(seleccionados[arr].find( Sel => Sel.Funcionario.id == item.Funcionario.id));
    const index2 = funcionarios[arr].indexOf(funcionarios[arr].find( Func => Func.Funcionario.id == item.Funcionario.id));
    if (index != -1) {
        funcionarios[arr].push(item);
        seleccionados[arr].splice(index,1);
    }else{
        item.idTipoFuncionario = item.Funcionario.idRol;
        item.idFuncionario = item.Funcionario.id;
        seleccionados[arr].push(item);
        funcionarios[arr].splice(index2,1);
    }
};
// filtros para buscar funcionarios en la listas
const filterEnfermeros = computed( () => {
    return searchEnfermero.value 
    ? funcionarios["enfermero"].filter((enf) => enf.Funcionario.nombre.includes(searchEnfermero.value.toUpperCase()))
    : funcionarios["enfermero"];
});
const filterTecnico = computed(() => {
    return searchTecnico.value 
    ? funcionarios["tecnico"].filter((tec) => tec.Funcionario.nombre.includes(searchTecnico.value.toUpperCase()))
    : funcionarios["tecnico"];
});
const filterConductor = computed(() => {
    return searchConductor.value 
    ? funcionarios["conductor"].filter((cond) => cond.Funcionario.nombre.includes(searchConductor.value.toUpperCase())) 
    : funcionarios["conductor"];
});
// lismpiar el array de funcionarios seleccionados
function Limpiar(){
  if (seleccionados["enfermero"] != "") {
    for (var i = 0; i < seleccionados["enfermero"].length; i++) {
      funcionarios['enfermero'].push(seleccionados["enfermero"][i]);
    }
    seleccionados["enfermero"] = [];
  }
  if (seleccionados["tecnico"] != "") {
    for (var i = 0; i < seleccionados["tecnico"].length; i++) {
      funcionarios['tecnico'].push(seleccionados["tecnico"][i]);
    }
    seleccionados["tecnico"] = [];
  }
  if (seleccionados["conductor"] != "") {
    for (var i = 0; i < seleccionados["conductor"].length; i++) {
      funcionarios['conductor'].push(seleccionados["conductor"][i]);
    }
    seleccionados["conductor"] = [];
  }
}
function GuardarTurno(){
    console.log(responsable.value);
    btnLoading.value = true;
    allTurno.value = [];
    for (let i = 0; i < seleccionados.enfermero.length; i++) {
        allTurno.value.push(seleccionados.enfermero[i]);
    }
    for (let i = 0; i < seleccionados.tecnico.length; i++) {
        allTurno.value.push(seleccionados.tecnico[i]);
    }
    for (let i = 0; i < seleccionados.conductor.length; i++) {
        allTurno.value.push(seleccionados.conductor[i]);
    }
    const params = {
        turnoAnterior : idTurnoAnterior.value,
        funcTurno : allTurno.value,
        resp: responsable.value
    }

    console.log(params);
    console.log('https://'+url+'/api/Turno');
    axios.post('https://'+url+'/api/Turno',params,config).then((response) => {
        console.log(response.data);
        btnLoading.value = false;
        toast.fire("Excelente!", "El turno fue creado con exito!", "success");
    }).catch(function (error) {
        console.log(error.response.data.msg);
        // window.location.assign('https://www.ssarica.cl');
    });
  toast.fire("Oops...", "Ocurrio un error en el ingreso de los datos. Por favor intente nuevamente!", "error");  
}

onBeforeMount(() => {
    axios.get('https://'+url+'/api/Turno/disponibles',config).then((response) => {
        if (response.data['TurnoDisponible'].length > 0) {  
            idTurnoAnterior.value = response.data['TurnoDisponible'][0].id;
            if(idTurnoAnterior.value != ""){
                console.log(idTurnoAnterior);
                const trip = response.data['TurnoDisponible'][0].tripulacionTurnos;
                allTurno.value = trip;
                for (let i = 0; i < trip.length; i++) {
                    trip[i].Funcionario.nombre.toUpperCase();
                    if(trip[i].idTipoFuncionario == 1){
                        seleccionados.enfermero.push(trip[i]);
                    }else if (trip[i].idTipoFuncionario == 2){
                        seleccionados.tecnico.push(trip[i]);
                    }else if (trip[i].idTipoFuncionario == 3){
                        seleccionados.conductor.push(trip[i]);
                    }else{}
                }
            }
        }else{
            toast.fire("Oops...", "no existe turno creado!", "warning");             
        }
    }).catch(function (error) {
        console.log(error.response.data.msg);
        //window.location.assign('https://www.ssarica.cl');
    });
    axios.get('https://'+url+'/api/funcionario/disponibles',config).then((response) => {
        const funcs = response.data['funcionarios'];
            for (let i = 0; i < funcs.length; i++) {
                let existe = false;
                if(allTurno.value){
                    existe = allTurno.value.find( aF => aF.Funcionario.id == funcs[i].id);
                }
                if (!existe) {
                    let objFunc = {
                        nombre : funcs[i].nombre.toUpperCase(),
                        id : funcs[i].id,
                        idRol: funcs[i].idRol
                    }
                    funcs[i]['Funcionario'] = objFunc;
                    if(funcs[i].idRol == 1){
                        funcionarios.enfermero.push(funcs[i]);
                    }else if (funcs[i].idRol == 2){
                        funcionarios.tecnico.push(funcs[i]);
                    }else if (funcs[i].idRol == 3){
                        funcionarios.conductor.push(funcs[i]);
                    }else{}
                }
            }
        
    }).catch(function (error) {
        console.log(error.response.data.msg);
        //window.location.assign('https://www.ssarica.cl');
    });
});

onMounted(() => {
    axios.post("https://"+url+"/api/auth/login",{key: localStorage.getItem('key')}).then((response) => {
        responsable.value = response.data['funcionario'].id;
        console.log(response.data['funcionario']);
    }).catch(function (error) {
        console.log(error.response.data.msg);
        // window.location.assign('https://www.ssarica.cl');
    });
});
</script>
<style lang="scss">
// SweetAlert2
@import "sweetalert2/dist/sweetalert2.min.css";
</style>
<template>
    <BasePageHeading title="Turnos" subtitle="Creación de turnos">
    </BasePageHeading>
    <div class="content px-1">
        <div class="row">
            <div class="col-12">
                <div class="block-rounded block">
                    <div class="block-header block-header-default bg-dark text-white">
                        <h3 class="block-title">Turno de hoy</h3>
                        <div class="block-options space-x-1">
                          <button type="submit" class="btn btn-sm btn-alt-primary mb-2" @click="GuardarTurno">
                            <template v-if="btnLoading">
                              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              Cargando...
                            </template>
                            <template v-else>
                              Guardar turno
                            </template>
                          </button>
                            <button type="reset" class="btn btn-sm btn-alt-info mb-2" @click="Limpiar"> Limpiar </button>
                        </div>
                    </div>
                    <div class="block-content pb-4">
                        <div class="row">
                            <div class="col-md-4">
                                <h4>Enfermeros</h4>
                                <div class="row">
                                    <div class="col-auto text-white block pe-1 mb-0" v-for="ES in seleccionados.enfermero" :key="ES.Funcionario.id">
                                        <div class="block-header px-0">
                                            <p class="px-3 py-1 bg-info mb-0 border-info border border-2 txt-sm" v-show="ES.Funcionario.nombre">{{ES.Funcionario.nombre}}</p>
                                              <button type="button" class="btn-block-option btn-sm px-2 border" v-show="ES.Funcionario.nombre" @click="toggle('enfermero',ES,true)">
                                                  <i class="far fa-trash-can"></i>
                                              </button>
                                            <p v-show="!ES.Funcionario.nombre"> Sin Datos</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <h4>Tecnicos</h4>
                                <div class="row">
                                    <div class="col-auto text-white block pe-1 mb-0" v-for="TS in seleccionados.tecnico" :key="TS.Funcionario.id">
                                        <div class="block-header px-0">
                                            <p class="px-3 py-1 bg-info mb-0 border-info border border-2 txt-sm" v-show="TS.Funcionario.nombre">{{TS.Funcionario.nombre}}</p>
                                              <button type="button" class="btn-block-option btn-sm px-2 border" v-show="TS.Funcionario.nombre" @click="toggle('tecnico',TS,true)">
                                                  <i class="far fa-trash-can"></i>
                                              </button>
                                            <p v-show="!TS.Funcionario.nombre"> Sin Datos</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <h4>Conductores</h4>
                                <div class="row">
                                    <div class="col-auto text-white block pe-1 mb-0" v-for="CS in seleccionados.conductor" :key="CS.Funcionario.id">
                                        <div class="block-header px-0">
                                            <p class="px-3 py-1 bg-info mb-0 border-info border border-2 txt-sm" v-show="CS.Funcionario.nombre">{{CS.Funcionario.nombre}}</p>
                                            <button type="button" class="btn-block-option btn-sm px-2 border" v-show="CS.Funcionario.nombre" @click="toggle('conductor',CS,true)">
                                                <i class="far fa-trash-can"></i>
                                            </button>
                                            <p v-show="!CS.Funcionario.nombre"> Sin Datos</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="block-bordered block-rounded block pb-4">
                    <div class="block-header block-header-default">
                        <h3 class="block-title">
                            Emfermeros <small>
                                (Seleccionar)</small>
                        </h3>
                    </div>
                    <div class="block-content">
                        <div class="mb-4">
                            <div class="input-group">
                                <button type="button" class="btn btn-dark">
                                    <i class="fa fa-search me-1"></i>
                                </button>
                                <input type="text" class="form-control form-control-alt" v-model="searchEnfermero" placeholder="Nombre">
                            </div>
                        </div>
                        <div class="form-check form-block" v-for="ENF in filterEnfermeros" :key="ENF.Funcionario.id" >
                            <label class="form-check-label" :for="'enfermero'+ENF.Funcionario.id" @click="toggle('enfermero',ENF)">
                                <span class="d-flex align-items-center">
                                    <span class="ms-2">
                                            {{ENF.Funcionario.nombre}}
                                    </span>
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="block-bordered block-rounded block pb-4">
                    <div class="block-header block-header-default">
                        <h3 class="block-title">
                            Tecnicos <small>
                                (Seleccionar)</small>
                        </h3>
                    </div>
                    <div class="block-content">
                        <div class="mb-4">
                            <div class="input-group">
                                <button type="button" class="btn btn-dark">
                                    <i class="fa fa-search me-1"></i>
                                </button>
                                <input type="text" class="form-control form-control-alt" v-model="searchTecnico" placeholder="Nombre">
                            </div>
                        </div>
                        <div class="form-check form-block" v-for="TEC in filterTecnico" :key="TEC.Funcionario.id">
                            <label class="form-check-label" :for="'tecnico'+TEC.Funcionario.id" @click="toggle('tecnico',TEC)">
                                <span class="d-flex align-items-center">
                                    <span class="ms-2">
                                            {{TEC.Funcionario.nombre}}
                                    </span>
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="block-bordered block-rounded block pb-4">
                    <div class="block-header block-header-default">
                        <h3 class="block-title">
                            Conductores <small>
                                (Seleccionar)</small>
                        </h3>
                    </div>
                    <div class="block-content">
                        <div class="mb-4">
                            <div class="input-group">
                                <button type="button" class="btn btn-dark">
                                    <i class="fa fa-search me-1"></i>
                                </button>
                                <input type="text" class="form-control form-control-alt" v-model="searchConductor" placeholder="Nombre">
                            </div>
                        </div>
                        <div class="form-check form-block" v-for="CON in filterConductor" :key="CON.Funcionario.id">
                            <label class="form-check-label" :for="'conductor'+CON.Funcionario.id" @click="toggle('conductor',CON)">
                                <span class="d-flex align-items-center">
                                    <span class="ms-2">
                                      {{CON.Funcionario.nombre}}
                                    </span>
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
.txt-sm {
    font-size: 10px !important;
}
</style>
