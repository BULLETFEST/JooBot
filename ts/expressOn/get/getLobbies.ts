// @ts-nocheck

import { Request, Response } from 'express';

export default {
  run: async function (req: Request, res: Response) {
    let t = await db.ref(`/lobbies/`).orderByChild('type').equalTo('public').get();
    res.send({
      Items: Object.entries((await t.val()) || {})
        .map((m) => {
          const o = {
            code: m[0],
            playerCount: m[1].playerCount || 1,
            gameMode: m[1].gameMode || 'Elimination',
            started: m[1].started || false,
          };

          return o;
        })
        .filter((x) => x.playerCount < 4 && !x.started),
    });
  },
};
