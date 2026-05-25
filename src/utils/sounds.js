import buttonMp3 from '../assets/sounds/button.mp3'

import navclickMp3 from '../assets/sounds/navclick.mp3'

import correctMp3 from '../assets/sounds/correct.mp3'

import wrongMp3 from '../assets/sounds/wrong.mp3'

import passMp3 from '../assets/sounds/pass.mp3'

import failMp3 from '../assets/sounds/fail.mp3'

import screenshotMp3 from '../assets/sounds/screenshot.mp3'

import examinityMp3 from '../assets/sounds/examinity.mp3'

/* -----------------------------
   GLOBAL MUTE
----------------------------- */

export const isSoundMuted =
  () => {
    return (
      localStorage.getItem(
        'quizbere_muted',
      ) === 'true'
    )
  }

export const setSoundMuted =
  (value) => {
    localStorage.setItem(
      'quizbere_muted',
      value,
    )
  }

/* -----------------------------
   AUDIO OBJECTS
----------------------------- */

const button =
  new Audio(buttonMp3)

button.volume = 0.35

const navclick =
  new Audio(navclickMp3)

navclick.volume = 0.25

const correct =
  new Audio(correctMp3)

correct.volume = 0.45

const wrong =
  new Audio(wrongMp3)

wrong.volume = 0.4

const pass =
  new Audio(passMp3)

pass.volume = 0.5

const fail =
  new Audio(failMp3)

fail.volume = 0.45

const screenshot =
  new Audio(screenshotMp3)

screenshot.volume = 0.4

const examinity =
  new Audio(examinityMp3)

examinity.volume = 0.2

/* -----------------------------
   EXPORT SOUNDS
----------------------------- */

export const sounds = {
  button,

  navclick,

  correct,

  wrong,

  pass,

  fail,

  screenshot,

  examinity,
}

/* -----------------------------
   PLAY SOUND
----------------------------- */

export const playSound =
  (name) => {
    if (
      isSoundMuted()
    )
      return

    const sound =
      sounds[name]

    if (!sound)
      return

    sound.pause()

    sound.currentTime = 0

    sound.play()
  }

/* -----------------------------
   STOP ALL SOUND
----------------------------- */

export const stopAllSounds =
  () => {
    Object.values(
      sounds,
    ).forEach(
      (sound) => {
        sound.pause()

        sound.currentTime = 0
      },
    )
  }