<template>
  <main
    class="min-h-screen w-full bg-[#f7fbff] px-4 py-6 pb-28 sm:px-6 md:px-10 md:py-10 md:pb-32"
  >
    <KiddyMusicControl />

    <section class="mx-auto flex w-full max-w-6xl flex-col gap-8 md:gap-12">
      <div class="bubble-in text-center">
        <p class="mb-2 text-sm font-black uppercase tracking-[0.18em] text-orange-500 md:text-base">
          KiddiesCorner
        </p>

        <h1 class="text-4xl font-black leading-none text-slate-800 sm:text-5xl md:text-7xl">
          Pick a Game
        </h1>

        <p class="mx-auto mt-4 max-w-xl text-base font-bold leading-relaxed text-slate-500 md:text-xl">
          Learn with pictures, sounds, and fun taps.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-7 lg:grid-cols-3">
        <button
          v-for="game in kiddyGames"
          :key="game.id"
          type="button"
          :disabled="game.status !== 'active'"
          class="bubble-in group relative overflow-hidden rounded-[2rem] bg-white p-5 text-left shadow-[0_10px_0_#d8e7ff,0_18px_34px_rgba(42,73,120,0.14)] transition active:translate-y-1 active:scale-[0.98] active:shadow-[0_5px_0_#d8e7ff,0_10px_20px_rgba(42,73,120,0.12)] disabled:cursor-not-allowed disabled:opacity-50 md:min-h-[220px] md:rounded-[2.4rem] md:p-7 md:text-center"
          @click="openGame(game)"
        >
          <div
            class="absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-yellow-300/30"
          ></div>

          <div class="relative z-10 flex items-center gap-4 md:flex-col md:justify-center">
            <div
              class="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-yellow-100 text-4xl shadow-inner md:h-28 md:w-28 md:text-5xl"
            >
              {{ game.icon }}
            </div>

            <div class="min-w-0">
              <h2 class="text-2xl font-black text-slate-800 md:text-3xl">
                {{ game.title }}
              </h2>

              <p class="mt-2 text-sm font-bold leading-snug text-slate-500 md:text-base">
                {{ game.description }}
              </p>
            </div>

            <span
              class="mt-1 inline-flex rounded-full px-4 py-2 text-sm font-black md:mt-2"
              :class="
                game.status === 'active'
                  ? 'bg-yellow-400 text-white shadow-[0_5px_0_#d67800]'
                  : 'bg-slate-100 text-slate-500'
              "
            >
              {{ game.status === 'active' ? 'Play' : 'Coming soon' }}
            </span>
          </div>
        </button>
      </div>
    </section>

    <BottomNavbar />
  </main>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { kiddyGames } from '../data/games'
import BottomNavbar from '../../components/BottomNavbar.vue'
import KiddyMusicControl from '../components/KiddyMusicControl.vue'

const router = useRouter()

const openGame = (game) => {
  if (!game || game.status !== 'active') return

  router.push(game.route)
}
</script>

<style scoped>
.bubble-in {
  animation: bubbleIn 0.45s ease both;
}

@keyframes bubbleIn {
  0% {
    opacity: 0;
    transform: scale(0.75) translateY(18px);
  }

  65% {
    opacity: 1;
    transform: scale(1.05) translateY(-4px);
  }

  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>