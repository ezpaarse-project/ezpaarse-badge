<template>
  <v-app id="badge" toolbar>
    <app-drawer/>
    <app-header/>
    <main>
      <v-container fluid>
        <v-card>
          <v-card-text class="text-xs-center">
            <h1>{{ error.statusCode }}</h1>
            <h2>{{ error.message }}</h2>
          </v-card-text>
        </v-card>
      </v-container>
    </main>
  </v-app>
</template>

<script>
import AppHeader from '@/components/Header'
import AppDrawer from '@/components/Drawer'

export default {
  props: ['error'],
  components: {
    AppHeader,
    AppDrawer
  }
}
</script>