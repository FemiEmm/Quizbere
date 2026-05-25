import topicmusic from '../assets/sounds/topicmusic.mp3'

import {
  isSoundMuted,
} from './sounds'

let audio = null

let muted = false

/* -----------------------------
   PLAY
----------------------------- */

export const playTopicMusic =
  async () => {
    /* GLOBAL SOUND MUTE */

    if (
      isSoundMuted()
    )
      return

    /* LOCAL MUSIC MUTE */

    if (muted)
      return

    try {
      if (!audio) {
        audio =
          new Audio(
            topicmusic,
          )

        audio.loop = true

        audio.volume = 0.1
      }

      audio.pause()

      audio.currentTime = 0

      await audio.play()
    } catch (err) {
      console.log(err)
    }
  }

/* -----------------------------
   STOP
----------------------------- */

export const stopTopicMusic =
  () => {
    muted = true

    if (audio) {
      audio.pause()

      audio.currentTime = 0
    }
  }

/* -----------------------------
   RESUME
----------------------------- */

export const resumeTopicMusic =
  async () => {
    /* GLOBAL SOUND MUTE */

    if (
      isSoundMuted()
    )
      return

    muted = false

    if (audio) {
      try {
        await audio.play()
      } catch (err) {
        console.log(err)
      }
    }
  }

/* -----------------------------
   STATUS
----------------------------- */

export const isTopicMuted =
  () => muted