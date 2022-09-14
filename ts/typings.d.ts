import { Client, Collection, Message } from "discord.js";

import { Auth as adminAuth }  from "firebase-admin/lib/auth/auth";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { Database } from "firebase-admin/lib/database/database";
import { Auth, Auth as clientAuth } from "firebase/auth";

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
  function GetTokenByUid(string): Promise<string | null>
  function ValidateToken(string): Promise<[bool, DecodedIdToken]>

  var db: Database
  var auth: adminAuth
  var clientAuth: typeof import("firebase/auth")
}

export {}