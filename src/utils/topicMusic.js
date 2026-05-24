import topicmusic from '../assets/sounds/topicmusic.mp3'

let audio = null

let muted = false

export const playTopicMusic =
  async () => {
    if (muted) return

    try {
      if (!audio) {
        audio = new Audio(
          topicmusic,
        )

        audio.loop = true

        audio.volume = 0.1
      }

      await audio.play()
    } catch (err) {
      console.log(err)
    }
  }

export const stopTopicMusic =
  () => {
    muted = true

    if (audio) {
      audio.pause()
    }
  }

export const resumeTopicMusic =
  async () => {
    muted = false

    if (audio) {
      try {
        await audio.play()
      } catch (err) {
        console.log(err)
      }
    }
  }

export const isTopicMuted =
  () => muted