import { sounds } from './sounds'

export const playSound = (
  soundName,
) => {
  const sound =
    sounds[soundName]

  if (!sound) return

  sound.currentTime = 0

  sound.play()

  /* MOBILE HAPTIC */

  if (
    navigator.vibrate
  ) {
    navigator.vibrate(15)
  }
}