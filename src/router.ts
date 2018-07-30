import { helper } from '@/helper';
import { store } from '@/store';
import Error from 'pages/Error.vue';
import FormPage from 'pages/formPage/FormPage.vue';
import GridPage from 'pages/GridPage.vue';
import Home from 'pages/Home.vue';
import Login from 'pages/Login.vue';
import Logout from 'pages/Logout.vue';
import Main from 'pages/Main.vue';
import Settings from 'pages/Settings.vue';
import ViewPage from 'pages/ViewPage.vue';
import Vue from 'vue';
import Router, { Route, RouteConfig, RouterOptions } from 'vue-router';

Vue.use(Router);

function route(
  path: string,
  component: typeof Vue,
  name?: string,
  children?: RouteConfig[],
  requiresAuth?: boolean,
): RouteConfig {
  return {
    path,
    name,
    children,
    component,
    meta: {
      requiresAuth: requiresAuth || false,
    },
  };
}

const routerOptions: RouterOptions = {
  base: __dirname,
  mode: 'hash',
  scrollBehavior: (
    to: Route,
    from: Route,
    savedPosition: { x: number; y: number } | void,
  ): { x: number; y: number } => ({
    x: 0,
    y: 0,
  }),
  routes: [
    route('/login', Login, 'login'),
    route('/logout', Logout, 'logout'),
    route('/error', Error, 'error'),

    // path, file(*.vue), name, children
    route(
      '/',
      Main,
      undefined,
      [
        route('/', Home, 'home'),
        route('/crud/:resource', GridPage, 'grid'),
        route('/crud/:resource/:id/view', ViewPage, 'view'),
        route('/crud/:resource/:id/edit', FormPage, 'edit'),
        route('/crud/:resource/create', FormPage, 'create'),
        route('/crud/:resource/:id/:action', FormPage, 'action'),
        route('/crud/:resource/:action', FormPage, 'indexAction'),
        route(
          '/crud/:resource/:subResource/:id/edit',
          FormPage,
          'customActionForm',
        ),
        route('/crud/:resource/:subResource/:id', GridPage, 'customActionGrid'),
        route('/settings', Settings, 'settings'),
      ],
      true,
    ),

    // Global redirect for 404
    {
      path: '*',
      redirect: '/error',
    },
  ],
};

export const router = new Router(routerOptions);

router.beforeEach((to, from, next) => {
  if (
    to.matched.some(record => record.meta.requiresAuth) &&
    !helper.ls.get('token')
  ) {
    next({
      path: '/login',
      query: {
        redirect: to.fullPath,
      },
    });
  } else {
    if (from.path !== '/') {
      store.dispatch('checkPageTitle', { path: to.path });
    }
    // /* eslint-disable no-undef */
    // if (typeof ga !== 'undefined') {
    //   ga('set', 'page', to.path);
    //   ga('send', 'pageview');
    // }

    store.commit('setGlobalLoading', { isLoading: true });

    next();
  }
});

router.afterEach(() => {
  setTimeout(
    () => store.commit('setGlobalLoading', { isLoading: false }),
    1000,
  );
});
