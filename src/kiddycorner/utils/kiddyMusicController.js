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
let audioContext = null
let sourceNode = null
let gainNode = null
let hasConnectedAudio = false

const musicPath =
  '/kiddyanimals/sounds/gameplaysound.mp3'

/* -----------------------------
   SETTINGS
----------------------------- */

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
      // Keep default settings if localStorage fails.
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
      // Keep the game running if localStorage fails.
    }
  }

/* -----------------------------
   VOLUME
----------------------------- */

const getRealVolume =
  () => {
    if (
      musicState.isMuted ||
      musicState.volume <= 0
    ) {
      return 0
    }

    return musicState.volume / 100
  }

const applyVolumeToAudio =
  () => {
    const realVolume =
      getRealVolume()

    if (gainNode) {
      gainNode.gain.value =
        realVolume
    }

    if (backgroundAudio) {
      /*
        Desktop / Android fallback.
        iPhone and iPad may ignore this,
        so GainNode is the real control.
      */

      try {
        backgroundAudio.volume =
          realVolume
      } catch (error) {
        // Some browsers may block volume control.
      }

      backgroundAudio.muted =
        realVolume <= 0
    }
  }

/* -----------------------------
   AUDIO SETUP
----------------------------- */

const createAudioElement =
  () => {
    if (backgroundAudio) {
      return
    }

    backgroundAudio =
      new Audio(
        musicPath,
      )

    backgroundAudio.loop =
      true

    backgroundAudio.preload =
      'auto'

    backgroundAudio.playsInline =
      true

    backgroundAudio.addEventListener(
      'play',
      () => {
        musicState.isPlaying =
          true
      },
    )

    backgroundAudio.addEventListener(
      'pause',
      () => {
        musicState.isPlaying =
          false
      },
    )

    backgroundAudio.addEventListener(
      'ended',
      () => {
        musicState.isPlaying =
          false
      },
    )
  }

const getAudioContext =
  () => {
    if (audioContext) {
      return audioContext
    }

    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext

    if (!AudioContextClass) {
      return null
    }

    audioContext =
      new AudioContextClass()

    return audioContext
  }

const setupWebAudio =
  () => {
    createAudioElement()

    const context =
      getAudioContext()

    if (
      !context ||
      !backgroundAudio ||
      hasConnectedAudio
    ) {
      return
    }

    sourceNode =
      context.createMediaElementSource(
        backgroundAudio,
      )

    gainNode =
      context.createGain()

    sourceNode.connect(
      gainNode,
    )

    gainNode.connect(
      context.destination,
    )

    hasConnectedAudio =
      true

    applyVolumeToAudio()
  }

const resumeAudioContext =
  async () => {
    if (!audioContext) {
      return
    }

    if (
      audioContext.state ===
      'suspended'
    ) {
      try {
        await audioContext.resume()
      } catch (error) {
        // Browser may still require another tap.
      }
    }
  }

/* -----------------------------
   PUBLIC METHODS
----------------------------- */

export const initKiddyMusic =
  () => {
    loadSavedSettings()
    createAudioElement()
    applyVolumeToAudio()
  }

export const startKiddyMusic =
  async () => {
    loadSavedSettings()

    try {
      setupWebAudio()
      applyVolumeToAudio()

      if (
        musicState.isMuted ||
        musicState.volume <= 0
      ) {
        pauseKiddyMusic()
        return
      }

      await resumeAudioContext()

      if (!backgroundAudio) {
        return
      }

      backgroundAudio.muted =
        false

      const playPromise =
        backgroundAudio.play()

      if (playPromise !== undefined) {
        await playPromise
      }

      musicState.isPlaying =
        true
    } catch (error) {
      /*
        iPhone/iPad may block sound until the user taps.
        Do not crash the app.
      */

      musicState.isPlaying =
        false
    }
  }

export const stopKiddyMusic =
  () => {
    if (!backgroundAudio) {
      return
    }

    backgroundAudio.pause()

    try {
      backgroundAudio.currentTime =
        0
    } catch (error) {
      // Ignore reset failure.
    }

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

    if (
      Number.isNaN(
        cleanVolume,
      )
    ) {
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

    if (
      musicState.volume > 0
    ) {
      musicState.isMuted =
        false
    }

    if (
      musicState.volume <= 0
    ) {
      musicState.isMuted =
        true
    }

    setupWebAudio()
    applyVolumeToAudio()
    saveSettings()

    if (
      musicState.volume <= 0
    ) {
      pauseKiddyMusic()
    }
  }

export const toggleKiddyMusicMute =
  () => {
    musicState.isMuted =
      !musicState.isMuted

    setupWebAudio()
    applyVolumeToAudio()
    saveSettings()

    if (
      musicState.isMuted
    ) {
      pauseKiddyMusic()
      return
    }

    if (
      musicState.volume > 0
    ) {
      startKiddyMusic()
    }
  }

export const setKiddyMusicMuted =
  (value) => {
    musicState.isMuted =
      Boolean(
        value,
      )

    setupWebAudio()
    applyVolumeToAudio()
    saveSettings()

    if (
      musicState.isMuted
    ) {
      pauseKiddyMusic()
      return
    }

    if (
      musicState.volume > 0
    ) {
      startKiddyMusic()
    }
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