import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { join, dirname } from 'path';
import fetch from 'node-fetch';

global.IsNullOrEmpty = function IsNullOrEmpty(content: string) {
  if (!content) return true;

  content = content.replace(/\s/g, '');

  return content.length == 0;
};

const __filename = fileURLToPath(import.meta.url);

global.__dirname = dirname(__filename);

import { config } from 'dotenv';
config();

import fb from 'firebase-admin';

fb.initializeApp({
  // @ts-ignore
  credential: fb.credential.cert(JSON.parse(process.env.FB_TOKEN)),
  databaseURL: 'https://bulletfest-805c3-default-rtdb.europe-west1.firebasedatabase.app',
});

global.db = fb.database();
global.auth = fb.auth();

setInterval(async () => {
  const games = await (await db.ref('/lobbies/').get()).val();

  if (Object.entries(games || {}).length > 0) {
    for (const [key, val] of Object.entries(games)) {
      // @ts-ignore
      if (Math.abs(val.time - Date.now()) > 1000 * 60 * 3.5) {
        await db.ref(`/lobbies/${key}`).remove();
      }
    }
  }
}, 1000 * 60);

import { Octokit } from '@octokit/core';

// Versioning

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function SetLatestVersion() {
  const res = await octokit.request('GET /repos/{owner}/{repo}/releases', {
    owner: 'EliasVal',
    repo: 'BULLETFEST',
  });

  await db.ref('/latestVer/').set(res.data[0].tag_name);
}

// Run every 15 mins
setInterval(SetLatestVersion, 1000 * 60 * 15);
SetLatestVersion();

setInterval(() => {
  fetch('https://glitch247.eliasval.repl.co');
}, 1000 * 60 * 2.5);

/**
 *
 *
 *
 *  EXPRESS SETUP
 *
 *
 *
 * */

import express from 'express';
import bodyParser from 'body-parser';
const app = express();
const port = process.env.PORT || 3000;

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/', (req, res) => res.sendStatus(200));

app.head('/', (req, res) => res.sendStatus(200));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

async function loadExpressEvents() {
  const directories = readdirSync(join(__dirname, 'expressOn'));
  for (const dir of directories) {
    const files = readdirSync(join(__dirname, 'expressOn', dir));

    for (const file of files) {
      switch (dir) {
        case 'post':
          app.post(
            `/${file.split('.')[0]}`,
            (await import(pathToFileURL(join(__dirname, 'expressOn', dir, file)).toString())).default.run
          );
          break;
        case 'get':
          app.get(
            `/${file.split('.')[0]}`,
            (await import(pathToFileURL(join(__dirname, 'expressOn', dir, file)).toString())).default.run
          );
          break;
      }
    }
  }
}

loadExpressEvents();

/**
 *
 *
 *
 *    DISCORD SETUP
 *
 *
 *
 */

import * as discord from 'discord.js';

// @ts-ignore
const client: _Client = new discord.Client({
  intents: ['GUILD_MESSAGES', 'GUILD_MEMBERS', 'DIRECT_MESSAGES', 'GUILDS'],
});

let data: Data = {};

data = JSON.parse(readFileSync('./data.json').toString());

client.on('ready', () => {
  client.user?.setActivity({
    type: 'PLAYING',
    name: 'BULLETFEST',
  });

  console.log('Ready!');
});

const prefix = 'j!';

client.on('guildMemberRemove', async (member) => {
  if (data[member.id]?.roleId != null) {
    await member.guild.roles.delete(data[member.id].roleId);
    delete data[member.id];
    writeFileSync('./data.json', JSON.stringify(data));
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
        if (!message.mentions.members?.first()) {
          await message.reply('Please provide a member!');
          return;
        }

        await createRole(message);
      } else if (data[message.author.id]?.roleId != null) {
        if (args[1] == null) {
          let role = await message.guild?.roles.fetch(data[message.author.id]?.roleId);
          message.reply(`Role name: ${role?.name}\nColor: #${role?.hexColor}`);
        } else {
          if (args[1] == 'color' || args[1] == 'colour') {
            if (args[2] == null || !args[2].match(/[0-9A-Fa-f]{6}/)) {
              message.reply('Please provide a color! (Hex)');
              return;
            }

            let role = await message.guild?.roles.fetch(data[message.author.id]?.roleId);

            // @ts-ignore
            await role?.setColor(args[2]);

            message.reply('successfully changed role color');
          } else if (args[1] == 'name') {
            let name = args.slice(2).join(' ');
            if (!name || name.length < 1 || name.length > 32) {
              message.reply('Please provide a name!');
              return;
            }

            let role = await message.guild?.roles.fetch(data[message.author.id]?.roleId);

            await role?.setName(name);

            message.reply('successfully changed role name');
          }
        }
      }
      break;
  }
});

async function createRole(message: discord.Message) {
  if (!message.mentions.members?.first()) return;

  let createdRole = await message.guild?.roles.create();

  data[message.mentions.members?.first()?.id || ''] = {
    // @ts-ignore
    roleId: createdRole?.id,
  };

  writeFileSync('./data.json', JSON.stringify(data));

  // @ts-ignore
  await message.mentions.members.first()?.roles.add(createdRole);
  message.reply('Role Created!');
}
client.login(process.env.TOKEN);
