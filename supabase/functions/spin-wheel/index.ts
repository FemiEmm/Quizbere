import {
  serve,
} from 'https://deno.land/std@0.168.0/http/server.ts'

/* -----------------------------
   CORS
----------------------------- */

const corsHeaders = {
  'Access-Control-Allow-Origin':
    '*',

  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

/* -----------------------------
   REWARDS
----------------------------- */

const rewards = [
  {
    name: 'TRY AGAIN',
    probability: 50,
  },

  {
    name: '1GB DATA',
    probability: 30,
  },

  {
    name: '2GB DATA',
    probability: 5,
  },

  {
    name: '₦500',
    probability: 5,
  },

  {
    name: '₦1,000',
    probability: 5,
  },

  {
    name: '₦2,000',
    probability: 3,
  },

  {
    name: '₦10,000',
    probability: 2,
  },

  {
    name: '₦100,000',
    probability: 1,
  },
]

serve(async (req) => {
  /* -----------------------------
     OPTIONS
  ----------------------------- */

  if (
    req.method ===
    'OPTIONS'
  ) {
    return new Response(
      'ok',
      {
        headers:
          corsHeaders,
      },
    )
  }

  /* -----------------------------
     TOTAL
  ----------------------------- */

  const total =
    rewards.reduce(
      (
        sum,
        reward,
      ) =>
        sum +
        reward.probability,
      0,
    )

  /* -----------------------------
     RANDOM
  ----------------------------- */

  let random =
    Math.random() *
    total

  /* -----------------------------
     PICK
  ----------------------------- */

  for (const reward of rewards) {
    random -=
      reward.probability

    if (random <= 0) {
      return new Response(
        JSON.stringify({
          reward:
            reward.name,
        }),
        {
          headers: {
            ...corsHeaders,

            'Content-Type':
              'application/json',
          },
        },
      )
    }
  }

  /* FALLBACK */

  return new Response(
    JSON.stringify({
      reward:
        'TRY AGAIN',
    }),
    {
      headers: {
        ...corsHeaders,

        'Content-Type':
          'application/json',
      },
    },
  )
})