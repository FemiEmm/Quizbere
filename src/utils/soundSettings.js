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