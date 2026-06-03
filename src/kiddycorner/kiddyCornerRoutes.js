import KiddyCornerHome from './pages/KiddyCornerHome.vue'

import AForWhat from './pages/AForWhat.vue'

import LearnWithMe from './pages/LearnWithMe.vue'

import ColorGame from './pages/ColorGame.vue'

import CountWithMe from './pages/CountWithMe.vue'

export const kiddyCornerRoutes = [
  {
    path: '/kiddycorner',
    name: 'KiddyCornerHome',
    component: KiddyCornerHome,
  },

  {
    path: '/kiddycorner/a-for-what',
    name: 'AForWhat',
    component: AForWhat,
  },

  {
    path: '/kiddycorner/learn-with-me',
    name: 'LearnWithMe',
    component: LearnWithMe,
  },

  {
    path: '/kiddycorner/color-game',
    name: 'ColorGame',
    component: ColorGame,
  },

  {
    path: '/kiddycorner/count-with-me',
    name: 'CountWithMe',
    component: CountWithMe,
  },
]