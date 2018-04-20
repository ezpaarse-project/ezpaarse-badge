<template>
  <v-app id="badges">
    
    <app-drawer />
    <app-header />

    <v-content>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import AppDrawer from '@/components/Drawer'
import AppHeader from '@/components/Header'

export default {
  components: {
    AppDrawer,
    AppHeader
  }
}
</script>
