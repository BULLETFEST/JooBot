// @ts-nocheck

import { Request, Response } from 'express';
import fb from 'firebase-admin';

const db = fb.database();
export default {
  run: async function (req: Request, res: Response) {
    let t = await db.ref(`/`).orderByChild('type').equalTo('public').get();

    res.send({
      matches: Object.entries((await t.val()) || {}).map((m) => {
        const o = {
          code: m[0],
          playerCount: m[1].playerCount || 1,
          gameMode: m[1].gameMode || 'Elimination',
        };

        return o;
      }),
      success: true,
    });
  },
};
