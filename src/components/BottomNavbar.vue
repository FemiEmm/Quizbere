<script setup>
import {
  RouterLink,
  useRoute,
} from 'vue-router'

import {
  faHouse,
  faBrain,
  faTrophy,
  faBolt,
  faHeadset,
} from '@fortawesome/free-solid-svg-icons'

import { playSound } from '../utils/playSound'

const route = useRoute()

const navItems = [
  {
    path: '/leaderboard',
    icon: faTrophy,
  },

  {
    path: '/braindrill',
    icon: faBrain,
  },

  {
    path: '/home',
    icon: faHouse,
    center: true,
  },

  {
    path: '/challenge',
    icon: faBolt,
  },

  {
    path: '/support',
    icon: faHeadset,
  },
]

/* -----------------------------
   NAV SOUND
----------------------------- */

const playNavSound =
  () => {
    playSound(
      'navclick',
    )
  }
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 w-full z-50 bg-white border-t-4 border-black"
  >
    <div
      class="max-w-md mx-auto px-4 py-2"
    >
      <div
        class="flex items-end justify-between"
      >
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          @click="
            playNavSound
          "
          class="flex items-center justify-center transition-all duration-200"
        >
          <!-- HOME -->
          <div
            v-if="
              item.center
            "
            class="w-14 h-14 rounded-2xl border-4 border-black bg-[#FD9501] shadow-[0_4px_0_#000] flex items-center justify-center active:translate-y-[2px] active:shadow-[0_2px_0_#000] transition-all duration-100"
          >
            <font-awesome-icon
              :icon="
                item.icon
              "
              class="text-xl text-black"
            />
          </div>

          <!-- NORMAL -->
          <div
            v-else
            class="w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-200"
            :class="[
              route.path ===
              item.path
                ? 'bg-[#FF2AA3]/20 border-[#FF2AA3]'
                : 'border-transparent',
            ]"
          >
            <font-awesome-icon
              :icon="
                item.icon
              "
              class="text-lg text-black"
            />
          </div>
        </RouterLink>
      </div>
    </div>
  </nav>
</template>