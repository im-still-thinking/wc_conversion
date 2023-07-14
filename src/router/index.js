import Vue from "vue";
import VueRouter from "vue-router";

import Wallet from "../page/Wallet.vue";
import Minting from "../page/Minting.vue";
import Locking from "../page/Locking.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Wallet",
    component: Wallet,

  },
  {
    path: "/minting",
    name: "Minting",
    component: Minting,

  },
  {
    path: "/locking",
    name: "Locking",
    component: Locking,

  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  linkExactActiveClass: 'is-active',
  routes,
});

export default router;
