<template>
    <v-navigation-drawer fixed clipped app v-model="drawer">
      <v-toolbar flat class="transparent">
        <v-list dense class="pt-0">

          <v-list-tile v-for="link in links" :key="link.title" :to="{ path: link.path }">
            <v-list-tile-action>
              <v-icon>mdi-{{ link.icon }}</v-icon>
            </v-list-tile-action>

            <v-list-tile-content>
              <v-list-tile-title>{{ link.title }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-group append-icon="mdi-chevron-down">
            <v-list-tile slot="activator">
              <v-list-tile-content>
                <v-list-tile-title>Badges</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-list-tile v-for="badge in badges" :key="badge.title" :to="{ path: badge.path }">
              <v-list-tile-content>
                <v-list-tile-title>{{ badge.title }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list-group>

        </v-list>
      </v-toolbar>
    </v-navigation-drawer>
</template>

<script>
export default {
  data: () => {
    return {
      links: [
        { title: 'Accueil', icon: 'home', path: '/' },
        { title: 'Emetteur', icon: 'account-card-details', path: '/issuer' }
      ],
      badges: [
        { title: 'Visualiser les badges', path: '/badges' },
        { title: 'Créer un badge', path: '/badges/create' }
      ]
    }
  },
  computed: {
    drawer: {
      get () { return this.$store.state.drawer },
      set (newVal) { this.$store.dispatch('SET_DRAWER', newVal) }
    }
  }
}
</script>

<style scoped>
  a { color: inherit; }
</style>
