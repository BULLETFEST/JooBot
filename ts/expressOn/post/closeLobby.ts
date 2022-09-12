import { Request, Response } from 'express';

export default {
  run: async function (req: Request, res: Response) {
    if (IsNullOrEmpty(req.body.token)) return;

    const [valid, user] = await ValidateToken(req.body.token);

    if (!valid)
      res.send({
        status: 401,
        message: 'InvalidToken',
      });

    let t = await db.ref('/lobbies/').orderByChild('userId').equalTo(user.uid).get();

    let tVal = await t.val();
    if (tVal != null) {
      for (let key of Object.keys(tVal)) {
        await db.ref(`/lobbies/${key}`).remove();
      }
    }
  },
};
