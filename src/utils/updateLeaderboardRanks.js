import { supabase }
from '../lib/supabase'

export const updateLeaderboardRanks =
  async () => {
    try {
      /* FETCH USERS */

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

      /* CALCULATE TOTAL SCORE */

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

      /* UPDATE USERS */

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
    } catch (err) {
      console.error(err)
    }
  }