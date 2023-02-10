import { createRouter, createWebHashHistory } from "vue-router";

import NProgress from "nprogress/nprogress.js";

// Main layouts
import LayoutBackend from "@/layouts/variations/BackendStarter.vue";
import LayoutSimple from "@/layouts/variations/Simple.vue";

// Registro: Landing
const Landing = () => import("@/views/starter/LandingView.vue");

// Solicitudes: Solicitud
const Solicitud = () => import("@/views/starter/SolicitudesView.vue");

// Despachos: Despacho
const Despacho = () => import("@/views/starter/DespachosView.vue");

// Ambulancias
const Ambulancia = () => import("@/views/starter/AmbulanciasView.vue");
const boucher = () => import("@/views/starter/boucherView.vue");
// Inicio: Dashboard
const Dashboard = () => import("@/views/starter/DashboardView.vue");
const Turnos = () => import("@/views/starter/TurnoView.vue");
const Tripulacion = () => import("@/views/starter/TripulacionView.vue");

// Set all routes
const routes = [
  {
    path: "/",
    component: LayoutBackend,
    children: [
      {
        path: "",
        name: "landing",
        component: Dashboard,
      },
    ],
  },
  {
    path: "/",
    redirect: "/backend/dashboard",
    component: LayoutBackend,
    children: [
      {
        path: "dashboard",
        name: "backend-dashboard",
        component: Dashboard,
      },
    ],
  },
  {
    path: "/",
    redirect: "/backend/dashboard",
    component: LayoutBackend,
    children: [
      {
        path: "registro",
        name: "registro-dashboard",
        component: Landing,
      },
    ],
  },
  {
    path: "/",
    redirect: "/backend/dashboard",
    component: LayoutBackend,
    children: [
      {
        path: "solicitud",
        name: "solicitud-dashboard",
        component: Solicitud,
      },
    ],
  },
  {
    path: "/",
    redirect: "/backend/dashboard",
    component: LayoutBackend,
    children: [
      {
        path: "despacho",
        name: "despacho-dashboard",
        component: Despacho,
      },
    ],
  },
  {
    path: "/",
    redirect: "/backend/dashboard",
    component: LayoutBackend,
    children: [
      {
        path: "ambulancias",
        name: "ambulancia-dashboard",
        component: Ambulancia,
      },
    ],
  },
  {
    path: "/",
    redirect: "/backend/dashboard",
    component: LayoutBackend,
    children: [
      {
        path: "turnos",
        name: "turno-dashboard",
        component: Turnos,
      },
    ],
  },
  {
    path: "/",
    redirect: "/backend/boucher",
    component: LayoutSimple,
    children: [
      {
        path: "boucher/:id",
        name: "boucher",
        component: boucher,
      },
    ],
  },
  {
    path: "/",
    redirect: "/backend/dashboard",
    component: LayoutBackend,
    children: [
      {
        path: "tripulacion",
        name: "tripulacion-dashboard",
        component: Tripulacion,
      },
    ],
  },
];

// Create Router
const router = createRouter({
  history: createWebHashHistory(),
  linkActiveClass: "active",
  linkExactActiveClass: "active",
  scrollBehavior() {
    return { left: 0, top: 0 };
  },
  routes,
});

// NProgress
/*eslint-disable no-unused-vars*/
NProgress.configure({ showSpinner: false });

router.beforeResolve((to, from, next) => {
  NProgress.start();
  next();
});

router.afterEach((to, from) => {
  NProgress.done();
});
/*eslint-enable no-unused-vars*/

export default router;
