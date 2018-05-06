import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

function route(path, file, name, children = null, requiresAuth = true) {
  // eslint-disable-next-line
  const component = require(`./pages/${file}.vue`);
  return {
    exact: true,
    path,
    name,
    children,
    component,
    meta: {
      requiresAuth: requiresAuth || false
    }
  };
}

const router = new Router({
  base: __dirname,
  mode: 'hash',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    route('/login', 'Login', 'login', null, false),
    route('/logout', 'Logout', 'logout', null, false),
    route('/error', 'Error', 'error', null, false),

    // path, file(*.vue), name, children
    route(
      '/',
      'Main',
      null,
      [
        route('/', 'Home', 'home'),
        route('/crud/:resource', 'GridPage', 'grid'),
        route('/crud/:resource/:id/view', 'ViewPage', 'view'),
        route('/crud/:resource/:id/edit', 'FormPage', 'edit'),
        route('/crud/:resource/create', 'FormPage', 'create'),
        route('/crud/:resource/:id/:action', 'FormPage', 'action'),
        route('/crud/:resource/:action', 'FormPage', 'indexAction'),
        route('/crud/:resource/:subResource/:id/edit', 'FormPage', 'customActionForm'),
        route('/crud/:resource/:subResource/:id', 'GridPage', 'customActionGrid'),
        route('/settings', 'Settings', 'settings')
      ],
      true
    ),

    // Global redirect for 404
    {
      path: '*',
      redirect: '/error',
      query: { code: 404, message: 'Page Not Found.' }
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth) && !global.helper.ls.get('token')) {
    next({
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    });
  } else {
    global.store.dispatch('checkPageTitle', { path: to.path });
    /* eslint-disable no-undef */
    if (typeof ga !== 'undefined') {
      ga('set', 'page', to.path);
      ga('send', 'pageview');
    }

    global.store.commit('setGlobalLoading', { isLoading: true });

    next();
  }
});

router.afterEach(() => {
  setTimeout(() => global.store.commit('setGlobalLoading', { isLoading: false }), 1000);
});

export default router;
