<template lang="pug">
div
  v-navigation-drawer(v-model='drawer',:mini-variant="mini", persistent,enable-resize-watcher, :dark="dark", app)
    .pa-3.text-xs-center(v-show="!mini")
      div(style="padding-left:5em")
        v-switch(:label="(!dark ? 'Light' : 'Dark') + ' Theme'", v-model="dark", :dark="dark", hide-details)
    .pa-3.text-xs-center(v-show="mini")
      .display-2 A

    v-list(dense)
      template(v-for='item in menu')
        v-list-group(v-if='item.items', v-bind:group='item', :key="item.title")
          v-list-tile(:to='item.href', slot='activator', :title="item.title")
            v-list-tile-action
              v-icon() {{ item.icon }}
            v-list-tile-content
              v-list-tile-title {{ item.title }}

          v-list-tile(
            ripple
            v-for='subItem in item.items'
            :key='subItem.href'
            :to='subItem.href'
            v-bind:router='!subItem.target'
            v-bind:disabled='subItem.disabled'
            v-bind:target='subItem.target')
            v-list-tile-action(v-if='subItem.icon')
              v-icon
            v-list-tile-content
              v-list-tile-title {{ $t(subItem.title) }}

        div.text-xs-center.title(v-else-if='item.mainHeader') {{ item.mainHeader }}
          v-divider.mt-3

        v-subheader(v-else-if='item.header') {{ item.header }}
        v-divider(v-else-if='item.divider')
        v-list-tile(v-else,:to='item.href', router, ripple, v-bind:disabled='item.disabled', :title="item.title")
          v-list-tile-action
            v-icon() {{ item.icon }}
          v-list-tile-content
            v-list-tile-title {{ $t(item.title) }}
          v-list-tile-action(v-if='item.subAction')
            v-icon.success--text {{ item.subAction }}

  v-toolbar.darken-1(fixed, dark, :class="theme", app)
    v-toolbar-side-icon(dark, @click.stop='drawer = !drawer')
    v-toolbar-title {{$t(pageTitle)}}
    v-spacer
    v-menu(offset-y)
      v-btn(icon, dark, slot="activator")
        v-icon(dark) language
      v-list
        v-list-tile(v-for="lang in locales" :key="lang",@mouseover.native="changeLocale(lang)")
          v-list-tile-title {{lang}}
    v-menu(offset-y)
      v-btn(icon, dark, slot="activator")
        v-icon(dark) format_paint
      v-list
        v-list-tile(v-for="n in colors", :key="n", :class="n",@mouseover.native="theme = n")
  main
    v-content
      v-container(fluid)
        .py-2
          v-slide-y-transition(mode='out-in')
            router-view
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      dark: false,
      theme: "primary",
      mini: false,
      drawer: true,
      locales: ["en-US"],
      colors: ["blue", "green", "purple", "red"]
    };
  },
  computed: {
    ...mapState(["menu", "pageTitle"])
  },
  methods: {
    changeLocale(to) {
      global.helper.ls.set("locale", to);
      this.$i18n.locale = to;
    }
  }
};
</script>

