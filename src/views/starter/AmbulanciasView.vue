<script setup>
  import { ref, onMounted, reactive } from 'vue'
  import TableLite from "vue3-table-lite";
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
  const config = {
    headers:{
      'x-token': localStorage.getItem('uid')
    }
  };
  const responsable = ref();
  let url = '';
  if (window.document.location.host === "127.0.0.1:3000" || window.document.location.host === "10.8.83.72:3000") {
    if(window.document.location.host === "10.8.83.72:3000"){
      url = '10.8.83.72:8000';
    }else{
      url = 'localhost:8000';
    }
  }else{
      url = 'www.ssarica.cl';
  }
  const ambulancias_disponibles = ref();

  const ambulancia_editar = ref({
    id:null,
    movil:"",
    patente:"",
    estado:null,
    logAmbulancias:[],
    tipo:1,
    motivo:"",
  });

  const editar = (amb) => {
    ambulancia_editar.value.id = amb.id;
    ambulancia_editar.value.movil = amb.movil;
    ambulancia_editar.value.patente = amb.patente;
    ambulancia_editar.value.estado = amb.estado;
    ambulancia_editar.value.logAmbulancias = amb.logAmbulancias;
    ambulancia_editar.value.tipo = amb.tipo;
    ambulancia_editar.value.motivo = "";
  }

  const cambioEstado = (amb) => {
    editar(amb);
    if (amb.estado == 1) {
      const myModal = new bootstrap.Modal(document.getElementById('modal-block-slideleft'),{
        focus:true,
      });
      myModal.show();
    }else{
      toast.fire({
          title: "¿ Estas Seguro ?",
          text: "Que desea realizar esta acción.",
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
          //eviar al controlador
            const params = {
              motivo:ambulancia_editar.value.motivo,
              resp:responsable.value
            }
            axios.put('https://'+url+'/api/ambulancia/estados/'+ambulancia_editar.value.id,params,config).then((response) => {
              response.data['ambLOG']['Funcionario'] = response.data['funcionario'];
              console.log(response.data['ambLOG']);
              ambulancias_disponibles.value[ambulancias_disponibles.value.indexOf(ambulancias_disponibles.value.find( AD => AD.id == ambulancia_editar.value.id))].estado = 1;
              ambulancias_disponibles.value[ambulancias_disponibles.value.indexOf(ambulancias_disponibles.value.find( AD => AD.id == ambulancia_editar.value.id))].logAmbulancias.push(response.data['ambLOG']);
              toast.fire(
                "Excelente!",
                "Se realizó n exito.",
                "success"
              );
            }).catch(function (error) {
                console.log(error.response.data.msg);
                window.location.assign('https://www.ssarica.cl');
            });
          } 
      });
    }
  }

  const limpiar = () => {
    ambulancia_editar.value.id = null;
    ambulancia_editar.value.movil = "";
    ambulancia_editar.value.patente = "";
    ambulancia_editar.value.estado = null;
    ambulancia_editar.value.logAmbulancias = [];
    ambulancia_editar.value.tipo = 1;
    ambulancia_editar.value.motivo = "";
  }

  const Desactivar = () => {
    if(ambulancia_editar.value.motivo.length > 1 && ambulancia_editar.value.id){
      //eviar al controlador
      const params = {
        motivo:ambulancia_editar.value.motivo,
        resp:responsable.value
      }
      axios.put('https://'+url+'/api/ambulancia/estados/'+ambulancia_editar.value.id,params,config).then((response) => {
        response.data['ambLOG']['Funcionario'] = response.data['funcionario'];
        ambulancias_disponibles.value[ambulancias_disponibles.value.indexOf(ambulancias_disponibles.value.find( AD => AD.id == ambulancia_editar.value.id))].estado = 2;
        ambulancias_disponibles.value[ambulancias_disponibles.value.indexOf(ambulancias_disponibles.value.find( AD => AD.id == ambulancia_editar.value.id))].logAmbulancias.push(response.data['ambLOG']);
        toast.fire(
          "Excelente!",
          "Se realizó n exito.",
          "success"
        );
      }).catch(function (error) {
          console.log(error.response.data.msg);
          window.location.assign('https://www.ssarica.cl');
      });
    }else{
        toast.fire("Oops...", "Debe ingresar un motivo para desactivar", "error");
    }
  }

  const Agregar = () => {
    if (ambulancia_editar.value.movil.length > 1 && ambulancia_editar.value.patente.length > 4) {      
      const existe = ambulancias_disponibles.value.find( AD => AD.movil == ambulancia_editar.value.movil || AD.patente == ambulancia_editar.value.patente);
      if (existe) {
          toast.fire(
            "Atención!",
            "Los datos digitados, ya se encuentran registrados.",
            "warning"
          );
      }else{
      //Agregar nueva Ambulancia
        const params = {
          movil: ambulancia_editar.value.movil,
          patente:ambulancia_editar.value.patente,
          tipo:ambulancia_editar.value.tipo
        }
        axios.post('https://'+url+'/api/ambulancia',params,config).then((response) => {
          ambulancia_editar.value.id = response.data;
          ambulancia_editar.value.estado = 1;
          ambulancias_disponibles.value.push(ambulancia_editar.value);
          toast.fire(
            "Excelente!",
            "la ambulancia se creó correctamente.",
            "success"
          );
        }).catch(function (error) {
            console.log(error.response.data.msg);
            window.location.assign('https://www.ssarica.cl');
        });
      }
    }else{
      toast.fire(
        "Atención!",
        "Debe ingresar numero y la patente del movil.",
        "warning"
      );
    }
  }

  const Actualizar = () => {
    if (ambulancia_editar.value.movil != "" && ambulancia_editar.value.patente.length > 1) {
      const existe_movil = ambulancias_disponibles.value.find( AD => AD.movil == ambulancia_editar.value.movil);
      const existe_patente = ambulancias_disponibles.value.find( AD => AD.patente == ambulancia_editar.value.patente);

      if (existe_movil && existe_movil.id != ambulancia_editar.value.id) {
        toast.fire(
          "Atención!",
          "El nombre digitado, ya se encuentran registrado.",
          "warning"
        );
      }else if (existe_patente && existe_patente.id != ambulancia_editar.value.id){
        toast.fire(
          "Atención!",
          "La patente digitada, ya se encuentran registrada.",
          "warning"
        );
      }else{
        const params = {
          movil: ambulancia_editar.value.movil,
          patente:ambulancia_editar.value.patente,
          tipo:ambulancia_editar.value.tipo
        };
        axios.put('https://'+url+'/api/ambulancia/'+ambulancia_editar.value.id,params,config).then((response) => {
          const indice = ambulancias_disponibles.value.indexOf(ambulancias_disponibles.value.find( AD => AD.id == ambulancia_editar.value.id));
          ambulancias_disponibles.value[indice].patente = ambulancia_editar.value.patente;
          ambulancias_disponibles.value[indice].movil = ambulancia_editar.value.movil;
          ambulancias_disponibles.value[indice].tipo = ambulancia_editar.value.tipo;
          toast.fire(
            "Excelente!",
            "la ambulancia se actualizó correctamente.",
            "success"
          );
        }).catch(function (error) {
            console.log(error.response.data.msg);
            window.location.assign('https://www.ssarica.cl');
        });
      }
    }else{
      toast.fire(
        "Atención!",
        "Debe ingresar nombre y patente para actualizar.",
        "warning"
      );
    }
  }
  onMounted(() => {
    const dcrypt = atob(localStorage.getItem('key'));
    const newDcrypt = dcrypt.slice(1);
    const session = atob(newDcrypt);
    axios.get('https://'+url+'/api/funcionario/rut/'+session,config).then((response) => {
      responsable.value = response.data['funcionario'].id;
    }).catch(function (error) {
        console.log(error.response.data.msg);
        window.location.assign('https://www.ssarica.cl');
    });

    axios.get('https://'+url+'/api/ambulancia',config).then((response) => {
      ambulancias_disponibles.value = response.data['ambulancias'];
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
    <BasePageHeading title="Ambulancias" subtitle="Mantenedor de Ambulancias">
    </BasePageHeading>
    <div class="content">
        <div class="col-12">
            <div class="block-rounded block">
                <div class="block-header block-header-default bg-dark text-white">
                    <h3 class="block-title">Ambulancias</h3>
                </div>
                <div class="block-content">
                    <div class="row">
                      <div class="col-md-6">
                        <BaseBlock title="Listado">
                          <div class="table-responsive">
                            <table class="table table-vcenter text-center">
                                <thead>
                                    <tr style="">
                                        <th class="d-none d-sm-table-cell text-center" style="width: 50px;">#</th>
                                        <th class="text-center" style="width: 25%;">Movil</th>
                                        <th class="text-center" style="width: 30%;"> Estado </th>
                                        <th class="text-center" style="width: 25%;"> Patente </th>
                                        <th class="text-center"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for=" (amb, index) in ambulancias_disponibles" :key="amb.id">
                                        <td class="d-none d-sm-table-cell text-center" scope="row"> 
                                          <span v-show="amb.tipo == 2" class="badge bg-primary">A</span>
                                          <span v-show="amb.tipo == 1" class="badge bg-success">B</span>
                                        </td>
                                        <td class="fw-semibold fs-sm">Movil {{amb.movil}}</td>
                                        <td class="">
                                          <span class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-success-light text-success" v-if="amb.estado == 1">Disponible</span>
                                          <span class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-danger-light text-danger" v-else>No Disponible</span>
                                        </td>
                                        <td class="fw-semibold fs-sm">{{amb.patente}}</td>
                                        <td class="text-center">
                                            <div class="btn-group">
                                              <button
                                              type="button" 
                                              class="btn btn-sm btn-alt-secondary" 
                                              @click="editar(amb)"
                                              data-bs-toggle="tooltip"
                                              data-bs-placement="top"
                                              title="Editar"
                                              >
                                                <i class="fa fa-fw fa-pencil-alt"></i>
                                              </button>
                                              <button v-if="amb.estado == 1"
                                              type="button" 
                                              @click="cambioEstado(amb)" 
                                              class="btn btn-sm btn-alt-secondary"
                                              data-bs-toggle="tooltip"
                                              data-bs-animation="true"
                                              data-bs-placement="top"
                                              title="Desactivar"
                                              >
                                                <i class="fa fa-fw fa-power-off text-danger"></i>
                                              </button>
                                              <button v-else
                                              type="button" 
                                              @click="cambioEstado(amb)" 
                                              class="btn btn-sm btn-alt-secondary"
                                              data-bs-toggle="tooltip"
                                              data-bs-animation="true"
                                              data-bs-placement="top"
                                              title="Activar"
                                              >
                                                <i class="fa fa-fw fa-power-off text-success"></i>
                                              </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                          </div>
                        </BaseBlock>
                      </div>
                      <div class="col-md-6">
                        <BaseBlock title="Formulario">
                          <form @submit.prevent>
                            <div class="row mt-4">
                              <div class="col-12">
                                <div class="form-floating mb-4">
                                  <input
                                    type="text"
                                    class="form-control"
                                    id="example-text-input-floating"
                                    v-model="ambulancia_editar.movil"
                                  />
                                  <label for="example-text-input-floating">Móvil</label>
                                </div>
                                <div class="form-floating mb-4">
                                  <input
                                    type="text"
                                    class="form-control"
                                    id="example-email-input-floating"
                                    v-model="ambulancia_editar.patente"
                                  />
                                  <label for="example-email-input-floating">Patente</label>
                                </div>
                                <div class="form-floating mb-4"><div class="row">
                                  <div class="col-6">
                                    <div class="form-check form-block">
                                      <input type="radio" class="form-check-input" id="example-radio-block1" v-model="ambulancia_editar.tipo" value="1">
                                      <label class="form-check-label" for="example-radio-block1">
                                        <span class="d-block fw-normal text-center">
                                          <span class="d-block fs-sm text-muted">Básica</span>
                                        </span>
                                      </label>
                                    </div>
                                  </div>
                                  <div class="col-6">
                                    <div class="form-check form-block">
                                      <input type="radio" class="form-check-input" id="example-radio-block2"  v-model="ambulancia_editar.tipo" value="2">
                                      <label class="form-check-label" for="example-radio-block2">
                                        <span class="d-block fw-normal text-center">
                                          <span class="d-block fs-sm text-muted">Avanzada</span>
                                        </span>
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                                <span v-show="ambulancia_editar.estado == 1" class="badge bg-success ms-2 py-2 px-3"><i class="fa fa-check me-1"></i> Disponible</span>
                                <span v-show="ambulancia_editar.estado == 2" class="badge bg-danger ms-2 py-2 px-3"><i class="fa fa-check me-1"></i> En Mantención</span>

                                <div class="form-floating mt-5 text-end">
                                  <template v-if="ambulancia_editar.id">
                                    <button type="button" class="btn btn-alt-info float-start" @click="limpiar">Limpiar</button>
                                    <button type="button" class="btn btn-alt-success" @click="Actualizar">Actualizar</button>
                                  </template>
                                  <button type="button" class="btn btn-alt-primary" v-else @click="Agregar">Agregar</button>
                                </div>
                              </div>
                            </div>
                          </form>
                        </BaseBlock>
                      </div>
                      <div class="col-12 mt-3" v-show="ambulancia_editar.id">
                        <div class="block-rounded block">
                          <div class="block-header block-header-default bg-dark text-white">
                              <h3 class="block-title">Historial de Ambulancia  {{ambulancia_editar.movil}}</h3>
                          </div>
                            <ul class="timeline timeline-alt mt-5" v-show="ambulancia_editar.logAmbulancias !=''">

                              <li class="timeline-event" v-for="ambLog in ambulancia_editar.logAmbulancias" :key="ambLog.id">
                                <div class="timeline-event-icon bg-dark">
                                  <i class="fa fa-cogs"></i>
                                </div>
                                <BaseBlock :title="ambLog.estado == 1 ? 'Activada' : 'Mantención'" :subtitle="'Realizada por: '+ ambLog.Funcionario.nombre" class="timeline-event-block">
                                  <template #options class="flex-shrink-3">
                                    <div
                                      class="timeline-event-time block-options-item fs-sm fw-semibold flex-shrink-0"
                                    >
                                      {{moment(ambLog.createdAt).format("DD/MM/YYYY")}} <br> {{moment(ambLog.createdAt).format("HH:mm:ss")}}
                                    </div>
                                  </template>

                                  <div :class="[ambLog.estado == 1 ? 'alert-success' : ' alert-warning']" class="alert d-flex align-items-center justify-content-between" role="alert">
                                    <div class="flex-grow-1 me-4">
                                      <p class="mb-0" v-show="ambLog.estado !== 1">
                                          {{ambLog.motivo}}
                                      </p>
                                      <p class="mb-0" v-show="ambLog.estado == 1"> Móvil habilitado! </p>
                                    </div>
                                    <div class="flex-shrink-0">
                                      <i class="fa" :class="[ambLog.estado == 1 ? 'fa-fw fa-check-circle' : 'fa-triangle-exclamation text-warning']"></i>
                                    </div>
                                  </div>
                                </BaseBlock>
                              </li>
                            </ul>
                            <p v-show="!ambulancia_editar.logAmbulancias" class="my-3"> No registra datos.</p>
                          <!-- </BaseBlock> -->
                        </div>
                      </div>
                    </div>
                </div>
            </div><!-- END Striped Table -->
        </div>
        <div
          class="modal fade"
          id="modal-block-slideleft"
          tabindex="-1"
          role="dialog"
          aria-labelledby="modal-block-slideleft"
          aria-hidden="true"
        >
          <div class="modal-dialog modal-dialog-slideleft" role="document">
            <div class="modal-content">
              <BaseBlock title="Desactivar Ambulancia" transparent class="mb-0">
                <template #options>
                  <button
                    type="button"
                    class="btn-block-option"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    <i class="fa fa-fw fa-times"></i>
                  </button>
                </template>

                <template #content>
                  <div class="block-content fs-sm">
                    <div class="form-floating mb-4">
                      <textarea class="form-control" id="example-textarea-floating" v-model="ambulancia_editar.motivo" style="height: 200px;"></textarea>
                      <label for="example-textarea-floating">Ingrese el motivo</label>
                    </div>
                  </div>
                  <div class="block-content block-content-full text-end bg-body">
                    <button
                      type="button"
                      class="btn btn-sm btn-alt-secondary me-1"
                      data-bs-dismiss="modal"
                    >
                      Salir
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-primary"
                      data-bs-dismiss="modal"
                      @click="Desactivar"
                    >
                      Desactivar Ambulancia
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
  .break {
    width: 100%;
    flex-basis: 100%;
    height: 0;
  }
  .overflow-x-auto{
    overflow-x: auto !important;
  }
</style>
