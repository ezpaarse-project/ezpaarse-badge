<template>
    <v-toolbar dense fixed clipped-left app>
      <v-toolbar-side-icon @click.stop="setDrawer(!drawer)">
        <i class="mdi mdi-menu"></i>
      </v-toolbar-side-icon>
      <v-toolbar-title>Badges</v-toolbar-title>
    </v-toolbar>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  computed: mapState([
    'drawer'
  ]),
  methods: mapActions({
    'setDrawer': 'SET_DRAWER'
  })
}
</script>
