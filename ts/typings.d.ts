import { Client, Collection, Message } from "discord.js";

import { Auth } from "firebase-admin/lib/auth/auth";
import { Database } from "firebase-admin/lib/database/database";

declare global {
  interface _Client extends Client {
    commands: Collection<string, Command>;
    config: {
      serverID: string,
      prefix: string,
    };
    __dirname: string;
    cooldowns: Cooldown
  }

  interface Command {
    description: string;
    name: string;
    aliases?: string[];
    run: function(_Client, Message, string[]);
    syntax: string;
    cooldown: number;
  }

  interface EventFile {
    eventName: string;
    run: function;
  }

  interface Data {
    [key: string]: {
      roleId: string
    }
  }

  function IsNullOrEmpty(string): boolean

  var db: Database
  var auth: Auth
}

export {}