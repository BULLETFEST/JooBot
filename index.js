import { config } from 'dotenv';
config();

import fb from 'firebase-admin';

// console.log(JSON.parse(process.env.FB_TOKEN));

fb.initializeApp({
  credential: fb.credential.cert(JSON.parse(process.env.FB_TOKEN)),
  databaseURL: 'https://bulletfest-805c3-default-rtdb.europe-west1.firebasedatabase.app',
});

const db = fb.database();

import express from 'express';
import bodyParser from 'body-parser';
const app = express();
const port = 3000;
// app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

setInterval(async () => {
  const games = await (await db.ref('/').get()).val();

  for (const [key, val] of Object.entries(games)) {
    // console.log();
    if (Math.abs(val.time - Date.now()) > 1000 * 60 * 3.5) {
      await db.ref(`/${key}`).remove();
    }
  }
}, 1000 * 60);

app.get('/', (req, res) => res.status(200));

app.post('/createLobby', async (req, res) => {
  let exists = true;

  if (IsNullOrEmpty(req.body.address) || IsNullOrEmpty(req.body.userId)) {
    res.send({
      code: '',
      success: false,
      message: 'There has been an error with your client, please restart your game and try again.',
    });
    return;
  }

  let generatedId;

  let t = await db.ref('/').orderByChild('userId').equalTo(req.body.userId).get();

  let tVal = await t.val();
  if (tVal != null) {
    for (let key of Object.keys(tVal)) {
      await db.ref(`/${key}`).set(null);
    }
  }
  while (exists) {
    generatedId = Math.floor(Math.random() * (9999 - 1000) + 1000);

    let ref = await db.ref(`/${generatedId}`).get();

    exists = ref.exists();
  }

  await db.ref(`/${generatedId}`).set({ address: req.body.address, userId: req.body.userId, time: Date.now() });

  res.send({
    code: generatedId,
    success: true,
    message: '',
  });
});

app.post('/keepLobbyAlive', async (req, res) => {
  if (IsNullOrEmpty(req.body.code)) return;

  let t = await db.ref(`/${req.body.code}`).get();

  let tVal = await t.val();

  if (!tVal) return;

  db.ref(`/${req.body.code}/time`).set(Date.now());

  res.send({
    success: true,
  });
});

app.post('/joinLobby', async (req, res) => {
  if (req.body.code.match(/\D/)) {
    res.send({
      code: '',
      success: false,
      message: 'Invalid room code!',
    });
    return;
  }
  let data = await db.ref(`/${req.body.code}`).get();

  if (!data.exists()) {
    res.send({
      code: '',
      success: false,
      message: 'This lobby does not exist!',
    });
    return;
  }

  let val = await data.val();

  res.send({
    code: val.address,
    success: true,
    message: '',
  });
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

import * as discord from 'discord.js';
import * as fs from 'fs';

const client = new discord.Client({
  intents: ['GUILD_MESSAGES', 'GUILD_MEMBERS', 'DIRECT_MESSAGES', 'GUILDS'],
});

let data = {};

data = JSON.parse(fs.readFileSync('./data.json').toString());

client.on('ready', () => {
  console.log('Ready!');
});

const prefix = 'j!';

client.on('guildMemberRemove', async (member) => {
  if (data[member.id]?.roleId != null) {
    await member.guild.roles.delete(data[member.id].roleId);
    delete data[member.id];
    fs.writeFileSync('./data.json', JSON.stringify(data));
  }
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(prefix)) return;
  if (message.author.bot) return;

  const args = message.content.substring(prefix.length).split(/\s+/);

  if (args.length == 0) return;

  const command = args[0].toLowerCase();

  switch (command) {
    case 'role':
      if (message.author.id == '332567411620577280' && args[1] == 'add') {
        if (!message.mentions.members.first()) {
          await message.reply('Please provide a member!');
          return;
        }

        await createRole(message);
      } else if (data[message.author.id]?.roleId != null) {
        if (args[1] == null) {
          let role = await message.guild.roles.fetch(data[message.author.id]?.roleId);
          message.reply(`Role name: ${role.name}\nColor: #${role.hexColor}`);
        } else {
          if (args[1] == 'color' || args[1] == 'colour') {
            if (args[2] == null || !args[2].match(/[0-9A-Fa-f]{6}/)) {
              message.reply('Please provide a color! (Hex)');
              return;
            }

            let role = await message.guild.roles.fetch(data[message.author.id]?.roleId);

            await role.setColor(args[2]);

            message.reply('successfully changed role color');
          } else if (args[1] == 'name') {
            let name = args.slice(2).join(' ');
            if (!name || name.length < 1 || name.length > 32) {
              message.reply('Please provide a name!');
              return;
            }

            let role = await message.guild.roles.fetch(data[message.author.id]?.roleId);

            await role.setName(name);

            message.reply('successfully changed role name');
          }
        }
      }
      break;
  }
});

async function createRole(message) {
  let createdRole = await message.guild.roles.create();

  data[message.mentions.members.first().id] = {
    roleId: createdRole.id,
  };

  fs.writeFileSync('./data.json', JSON.stringify(data));

  await message.mentions.members.first().roles.add(createdRole);
  message.reply('Role Created!');
}
client.login(process.env.TOKEN);

function IsNullOrEmpty(content) {
  if (!content) return true;

  content = content.replace(/\s/g, '');

  return content.length == 0;
}
