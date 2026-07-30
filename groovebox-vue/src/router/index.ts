/**
 * @module router
 * @description Vue Router 4 — Groovebox surface routes.
 */
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/composer',
  },
  {
    path: '/composer',
    name: 'composer',
    component: () => import('../surfaces/groovebox/GrooveboxSurface.vue'),
    meta: { title: 'Compose — Groovebox' },
  },
  {
    path: '/vault',
    name: 'vault',
    component: () => import('../surfaces/groovebox/GrooveboxSurface.vue'),
    meta: { title: 'Vault — Groovebox' },
  },
  {
    path: '/library',
    name: 'library',
    component: () => import('../surfaces/groovebox/GrooveboxSurface.vue'),
    meta: { title: 'Library — Groovebox' },
  },
  {
    path: '/songscribe',
    name: 'songscribe',
    component: () => import('../surfaces/groovebox/GrooveboxSurface.vue'),
    meta: { title: 'Songscribe — Groovebox' },
  },
  {
    path: '/overview',
    name: 'overview',
    component: () => import('../surfaces/groovebox/GrooveboxSurface.vue'),
    meta: { title: 'Status — Groovebox' },
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.afterEach((to) => {
  const title = to.meta.title as string | undefined;
  document.title = title || 'Groovebox';
});