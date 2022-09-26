import { Request, Response } from 'express';

export default {
  run: async function (req: Request, res: Response) {
    if (IsNullOrEmpty(req.body.token)) {
      res.send({
        status: 400,
        message: 'InvalidForm',
      });
      return;
    }

    const [valid, user] = await ValidateToken(req.body.token);

    if (!valid) {
      res.send({
        status: 403,
        message: 'InvalidToken',
      });
      return;
    }

    let t = await db.ref('/lobbies/').orderByChild('userId').equalTo(user.uid).get();

    let tVal = await t.val();
    if (tVal != null) {
      for (let key of Object.keys(tVal)) {
        // await db.ref(`/${key}`).set(null);
        await db.ref(`/lobbies/${key}`).update({
          gameMode: req.body.gameMode,
          playerCount: req.body.playerCount,
          type: req.body.type,
          lobbySize: req.body.lobbySize,
        });
      }
    }

    res.send({
      status: 200,
    });
  },
};
