require('bootstrap/dist/css/bootstrap.css');
require('bootstrap-vue/dist/bootstrap-vue.css');

const Vue = require('vue');
const MasterFrame = require('./MasterFrame.vue').default;
const BootstrapVue = require('bootstrap-vue').default;

Vue.use(BootstrapVue);

new Vue({
    el: '#app',
    components: {MasterFrame},
    render: function(createElement) {
        return createElement(MasterFrame);
      }
});

