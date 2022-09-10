import { Request, Response } from 'express';

export default {
  run: async function (req: Request, res: Response) {
    if (IsNullOrEmpty(req.body.userId)) return;

    let t = await db.ref('/lobbies/').orderByChild('userId').equalTo(req.body.userId).get();

    let tVal = await t.val();
    if (tVal != null) {
      for (let key of Object.keys(tVal)) {
        // await db.ref(`/${key}`).set(null);
        await db.ref(`/lobbies/${key}`).update({
          gameMode: req.body.gameMode,
          playerCount: req.body.playerCount,
          type: req.body.type,
        });
      }
    }
  },
};
