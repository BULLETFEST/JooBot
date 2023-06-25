// @ts-nocheck

import { Request, Response } from 'express';

export default {
  run: async function (req: Request, res: Response) {
    let t = await db.ref(`/lobbies/`).orderByChild('type').equalTo('public').get();
    res.send({
      status: 200,
      data: Object.entries((await t.val()) || {})
        .filter((m) => m[1].playerCount < m[1].lobbySize && !m[1].started)
        .map((m) => {
          const o = {
            code: m[0],
            playerCount: m[1].playerCount || 1,
            gameMode: m[1].gameMode || 'Elimination',
            started: m[1].started || false,
            lobbySize: m[1].lobbySize || 4,
          };

          return o;
        }),
    });
  },
};
