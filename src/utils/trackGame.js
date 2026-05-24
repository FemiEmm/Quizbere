import {
  supabase,
} from '../lib/supabase'

export const trackGame =
  async (
    gameName,
  ) => {
    await supabase.rpc(
      'increment_game_play',
      {
        game:
          gameName,
      },
    )
  }