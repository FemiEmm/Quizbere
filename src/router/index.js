import {
  createRouter,
  createWebHistory,
} from 'vue-router'

import LandingPage from '../pages/LandingPage.vue'

import NameInputPage from '../pages/NameInputPage.vue'

import QuizPage from '../pages/QuizPage.vue'

import ScorePage from '../pages/ScorePage.vue'

import RewardPage from '../pages/RewardPage.vue'

import WinnerPage from '../pages/WinnerPage.vue'

import WelcomePage from '../pages/WelcomePage.vue'

import BraindrillPage from '../pages/BraindrillPage.vue'

import BraindrillPlayPage from '../pages/BraindrillPlayPage.vue'

import BraindrillIntermissionPage from '../pages/BraindrillIntermissionPage.vue'

import SupportPage from '../pages/SupportPage.vue'

import ChallengePage from '../pages/ChallengePage.vue'

import LeaderboardPage from '../pages/LeaderboardPage.vue'

import PlayChallenge from '../challenge/PlayChallenge.vue'

import ChallengeResult from '@/challenge/ChallengeResult.vue'

import VersusMode from '../challenge/VersusMode.vue'

import TopicChallenge from '../challenge/TopicChallenge.vue'

import TopicQuizPage from '../challenge/TopicQuizPage.vue'

import TopicResult from '../challenge/TopicResult.vue'

import Onboarding from '../pages/OnBoarding.vue'

import AdminUse from '@/pages/AdminUse.vue'

const routes = [
  {
    path: '/',

    component:
      WelcomePage,
  },

  {
    path: '/home',

    component:
      LandingPage,
  },

  {
    path: '/name',

    component:
      NameInputPage,
  },

  {
    path: '/quiz',

    component:
      QuizPage,
  },

  {
    path: '/score',

    component:
      ScorePage,
  },

  {
    path: '/reward',

    component:
      RewardPage,
  },

  {
    path: '/winner',

    component:
      WinnerPage,
  },

  {
    path: '/braindrill',

    component:
      BraindrillPage,
  },

  {
    path:
      '/braindrill/play',

    component:
      BraindrillPlayPage,
  },

  {
    path:
      '/braindrill/intermission',

    component:
      BraindrillIntermissionPage,
  },

  {
    path: '/support',

    component:
      SupportPage,
  },

  {
    path: '/challenge',

    component:
      ChallengePage,
  },

  {
    path:
      '/challenge/play',

    component:
      PlayChallenge,
  },

  {
    path:
      '/challenge/result',

    component:
      ChallengeResult,
  },

  {
    path: '/versus',

    component:
      VersusMode,
  },

  {
    path:
      '/topic-challenge',

    component:
      TopicChallenge,
  },

  {
    path:
      '/topic-quiz',

    component:
      TopicQuizPage,
  },

  {
    path:
      '/topic-result',

    component:
      TopicResult,
  },

  {
    path:
      '/leaderboard',

    component:
      LeaderboardPage,
  },

    {
    path:
      '/onboarding',

    component:
      Onboarding,
  },

  {
    path: '/admin-use',
    component: AdminUse,
  }
]

const router =
  createRouter({
    history:
      createWebHistory(),

    routes,

    /* -----------------------------
       ALWAYS SCROLL TO TOP
    ----------------------------- */

    scrollBehavior() {
      return {
        top: 0,
      }
    },
  })

export default router