import { Request, Response } from 'express';

export default {
  run: async function (req: Request, res: Response) {
    let exists = true;

    if (IsNullOrEmpty(req.body.address) || IsNullOrEmpty(req.body.token)) {
      res.send({
        status: 400,
        message: 'InvalidForm',
      });
      return;
    }

    const [valid, user] = await ValidateToken(req.body.token);

    if (!valid) {
      res.send({
        status: 401,
        message: 'InvalidToken',
      });

      return;
    }

    let generatedId;

    let t = await db.ref('/lobbies/').orderByChild('userId').equalTo(user.uid).get();

    let tVal = await t.val();
    if (tVal != null) {
      for (let key of Object.keys(tVal)) {
        await db.ref(`/lobbies/${key}`).set(null);
      }
    }
    while (exists) {
      generatedId = Math.floor(Math.random() * (9999 - 1000) + 1000);

      let ref = await db.ref(`/lobbies/${generatedId}`).get();

      exists = ref.exists();
    }

    await db.ref(`/lobbies/${generatedId}`).set({
      address: req.body.address,
      userId: user.uid,
      time: Date.now(),
      type: req.body.type || 'public',
      playerCount: '1',
      gameMode: 'Elimination',
    });

    res.send({
      status: 200,
      data: generatedId,
    });
  },
};
