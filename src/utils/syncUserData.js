// src/utils/syncUserData.js

import { supabase } from '../lib/supabase'

export const syncUserData =
  async () => {
    try {
      /* USERNAME */

      const rawUsername =
        localStorage.getItem(
          'examinity_username',
        )

      if (!rawUsername) {
        return
      }

      const username =
        rawUsername
          .trim()
          .toUpperCase()

      /* FETCH ALL USERS */

      const {
        data: leaderboard,
        error,
      } = await supabase
        .from(
          'examinity_leaderboard',
        )
        .select('*')

      if (
        error ||
        !leaderboard
      ) {
        return
      }

      /* CALCULATE TOTAL */

      const rankedUsers =
        leaderboard.map(
          (user) => ({
            ...user,

            total_score:
              (user.best_run_score ||
                0) +
              (user.challenge_points ||
                0),
          }),
        )

      /* SORT */

      rankedUsers.sort(
        (a, b) =>
          b.total_score -
          a.total_score,
      )

      /* UPDATE RANKS */

      for (
        let i = 0;
        i <
        rankedUsers.length;
        i++
      ) {
        const user =
          rankedUsers[i]

        await supabase
          .from(
            'examinity_leaderboard',
          )
          .update({
            rank: i + 1,

            total_score:
              user.total_score,
          })
          .eq(
            'id',
            user.id,
          )
      }

      /* FETCH CURRENT USER */

      const currentUser =
        rankedUsers.find(
          (user) =>
            user.username
              ?.trim()
              .toUpperCase() ===
            username,
        )

      if (!currentUser) {
        return
      }

      /* SAVE LOCAL */

      localStorage.setItem(
        'braindrill_total_points',
        String(
          Number(
            currentUser.best_run_score,
          ) || 0,
        ),
      )

      localStorage.setItem(
        'challenge_total_points',
        String(
          Number(
            currentUser.challenge_points,
          ) || 0,
        ),
      )

      localStorage.setItem(
        'braindrill_highest_level',
        String(
          Number(
            currentUser.highest_level,
          ) || 1,
        ),
      )

      localStorage.setItem(
        'total_score',
        String(
          Number(
            currentUser.total_score,
          ) || 0,
        ),
      )

      localStorage.setItem(
        'player_rank',
        String(
          Number(
            currentUser.rank,
          ) || 0,
        ),
      )
    } catch (err) {
      console.error(err)
    }
  }