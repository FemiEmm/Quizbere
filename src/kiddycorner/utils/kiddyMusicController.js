import {
  reactive,
} from 'vue'

const STORAGE_KEY =
  'kiddycorner_music_settings'

const DEFAULT_SETTINGS = {
  volume: 5,
  isMuted: false,
}

const musicState =
  reactive({
    volume: DEFAULT_SETTINGS.volume,
    isMuted: DEFAULT_SETTINGS.isMuted,
    isPlaying: false,
  })

let backgroundAudio = null

const musicPath =
  '/kiddyanimals/sounds/gameplaysound.mp3'

const loadSavedSettings =
  () => {
    try {
      const savedSettings =
        localStorage.getItem(
          STORAGE_KEY,
        )

      if (!savedSettings) {
        return
      }

      const parsedSettings =
        JSON.parse(
          savedSettings,
        )

      if (
        typeof parsedSettings.volume === 'number'
      ) {
        musicState.volume =
          Math.min(
            100,
            Math.max(
              0,
              parsedSettings.volume,
            ),
          )
      }

      if (
        typeof parsedSettings.isMuted === 'boolean'
      ) {
        musicState.isMuted =
          parsedSettings.isMuted
      }
    } catch (error) {
      // If localStorage fails, keep default settings.
    }
  }

const saveSettings =
  () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          volume:
            musicState.volume,

          isMuted:
            musicState.isMuted,
        }),
      )
    } catch (error) {
      // If localStorage fails, keep the game running.
    }
  }

const getRealVolume =
  () => {
    if (musicState.isMuted) {
      return 0
    }

    return musicState.volume / 100
  }

const applyVolumeToAudio =
  () => {
    if (!backgroundAudio) {
      return
    }

    backgroundAudio.volume =
      getRealVolume()
  }

export const initKiddyMusic =
  () => {
    loadSavedSettings()
  }

export const startKiddyMusic =
  () => {
    loadSavedSettings()

    if (!backgroundAudio) {
      try {
        backgroundAudio =
          new Audio(
            musicPath,
          )

        backgroundAudio.loop =
          true

        backgroundAudio.volume =
          getRealVolume()
      } catch (error) {
        backgroundAudio =
          null

        return
      }
    }

    applyVolumeToAudio()

    const playPromise =
      backgroundAudio.play()

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          musicState.isPlaying =
            true
        })
        .catch(() => {
          // Browser may block autoplay until the child taps the screen.
        })
    }
  }

export const stopKiddyMusic =
  () => {
    if (!backgroundAudio) {
      return
    }

    backgroundAudio.pause()
    backgroundAudio.currentTime =
      0

    musicState.isPlaying =
      false
  }

export const pauseKiddyMusic =
  () => {
    if (!backgroundAudio) {
      return
    }

    backgroundAudio.pause()

    musicState.isPlaying =
      false
  }

export const resumeKiddyMusic =
  () => {
    startKiddyMusic()
  }

export const setKiddyMusicVolume =
  (volume) => {
    const cleanVolume =
      Number(
        volume,
      )

    if (Number.isNaN(cleanVolume)) {
      return
    }

    musicState.volume =
      Math.min(
        100,
        Math.max(
          0,
          cleanVolume,
        ),
      )

    if (musicState.volume > 0) {
      musicState.isMuted =
        false
    }

    applyVolumeToAudio()
    saveSettings()
  }

export const toggleKiddyMusicMute =
  () => {
    musicState.isMuted =
      !musicState.isMuted

    applyVolumeToAudio()
    saveSettings()
  }

export const setKiddyMusicMuted =
  (value) => {
    musicState.isMuted =
      Boolean(
        value,
      )

    applyVolumeToAudio()
    saveSettings()
  }

export const useKiddyMusic =
  () => {
    return {
      musicState,
      initKiddyMusic,
      startKiddyMusic,
      stopKiddyMusic,
      pauseKiddyMusic,
      resumeKiddyMusic,
      setKiddyMusicVolume,
      toggleKiddyMusicMute,
      setKiddyMusicMuted,
    }
  }