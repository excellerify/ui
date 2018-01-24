import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);

function route (path, file, name, children, requiresAuth) {
  return {
    exact: true,
    path,
    name,
    children,
    component: require(`./pages/${file}.vue`),
    meta: {
      requiresAuth: requiresAuth || false
    }
  };
}

const router = new Router({
  base: __dirname,
  mode: 'hash',
  scrollBehavior: () => ({y: 0}),
  routes: [
    route('/login', 'Login', 'login'),
    route('/logout', 'Logout', 'logout'),
    route('/error', 'Error', 'error'),

    // path, file(*.vue), name, children
    route('/', 'Main', null, [
      route('/', 'Home', 'home', null, true),
      route('/crud/:resource', 'GridPage', 'grid', null, true),
      route('/crud/:resource/:id/view', 'ViewForm', 'view', null, true),
      route('/crud/:resource/:id/edit', 'FormPage', 'edit', null, true),
      route('/crud/:resource/create', 'FormPage', 'create', null, true),
      route('/crud/:resource/:id/:action', 'FormPage', 'action', null, true),
      route('/crud/:resource/:action', 'FormPage', 'indexAction', null, true),
      route('/settings', 'Settings', 'settings', null, true)
    ]),

    // Global redirect for 404
    { path: '*', redirect: '/error', query: {code: 404, message: 'Page Not Found.'} }
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
    global
      .store
      .dispatch('checkPageTitle', to.path);
    /* eslint-disable no-undef */
    if (typeof ga !== 'undefined') {
      ga('set', 'page', to.path);
      ga('send', 'pageview');
    }
    next();
  }
});

export default router;
