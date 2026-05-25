<script setup>
import {
  playSound,
} from '../utils/playSound'

/* -----------------------------
   OPEN LINK
----------------------------- */

const openLink =
  (url) => {
    playSound(
      'button',
    )

    window.open(
      url,
      '_blank',
    )
  }
</script>

<template>
  <section
    class="mt-8 bg-[#1A1A1A] border-t-4 border-b-4 border-[#4A4A4A]"
  >
    <div
      class="px-5 py-6"
    >
      <!-- HEADER -->
      <div>
        <h1
          class="text-3xl font-black text-[#F3F400]"
        >
          MORE FROM US
        </h1>

        <p
          class="mt-3 text-sm font-bold leading-6 text-white/70"
        >
          Explore more projects and products
          built by our team outside Quizbere.
        </p>
      </div>

      <!-- DIVIDER -->
      <div
        class="mt-6 border-t-4 border-[#4A4A4A]"
      />

      <!-- CRAZYONES -->
      <div
        class="py-6"
      >
        <h2
          class="text-2xl font-black text-[#F3F400]"
        >
          CRAZYONES
        </h2>

        <p
          class="mt-3 text-sm font-bold text-white/70 leading-7"
        >
          CrazyOnes is the official website
          for the indie anime project. Explore
          the world, characters, visuals and
          story behind the series.
        </p>

        <button
          @click="
            openLink(
              'https://thecrazyones.netlify.app/',
            )
          "
          class="mt-5 w-full bg-[#F3F400] border-4 border-black rounded-2xl py-4 text-black text-lg font-black shadow-[0_6px_0_#000]"
        >
          OPEN WEBSITE
        </button>
      </div>

      <!-- DIVIDER -->
      <div
        class="border-t-4 border-[#4A4A4A]"
      />

      <!-- WATCH -->
      <div
        class="py-6"
      >
        <h2
          class="text-2xl font-black text-[#FF2AA3]"
        >
          WATCH CRAZYONES
        </h2>

        <p
          class="mt-3 text-sm font-bold text-white/70 leading-7"
        >
          Watch episodes, trailers, clips and
          behind the scenes content from the
          CrazyOnes indie anime project on
          YouTube.
        </p>

        <button
          @click="
            openLink(
              'https://www.youtube.com/@cquence_studios',
            )
          "
          class="mt-5 w-full bg-[#FF2AA3] border-4 border-black rounded-2xl py-4 text-white text-lg font-black shadow-[0_6px_0_#000]"
        >
          WATCH ON YOUTUBE
        </button>
      </div>

      <!-- DIVIDER -->
      <div
        class="border-t-4 border-[#4A4A4A]"
      />

      <!-- SENDNEST -->
      <div
        class="py-6"
      >
        <h2
          class="text-2xl font-black text-[#03B5EC]"
        >
          SENDNEST
        </h2>

        <p
          class="mt-3 text-sm font-bold text-white/70 leading-7"
        >
          SendNest is a fast file sharing app
          that lets users send files between
          devices quickly and easily.
        </p>

        <button
          @click="
            openLink(
              'https://sendnest.netlify.app/',
            )
          "
          class="mt-5 w-full bg-[#03B5EC] border-4 border-black rounded-2xl py-4 text-black text-lg font-black shadow-[0_6px_0_#000]"
        >
          OPEN SENDNEST
        </button>
      </div>

      <!-- DIVIDER -->
      <div
        class="border-t-4 border-[#4A4A4A]"
      />

      <!-- TERMS -->
      <div
        class="py-6"
      >
        <h2
          class="text-xl font-black text-white"
        >
          TERMS & WINNINGS
        </h2>

        <p
          class="mt-4 text-sm font-bold text-white/70 leading-7"
        >
            Quizbere reserves the right to verify
        winners before rewards are issued.
        Accounts found using cheats, bots,
        exploits, multiple fake accounts,
        manipulation or suspicious activity
        may be disqualified without notice.
        Rewards, prizes and giveaway decisions
        remain entirely at the discretion of
        Quizbere and its team.
        </p>
      </div>
    </div>
  </section>
</template>