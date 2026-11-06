import { Client } from "@xhayper/discord-rpc";

import { IDiscordService } from "./DiscordService.types";

export class DiscordService {
  private readonly client = new Client({
    clientId: "1546583553553338459",
  });

  private currentPresence: IDiscordService | null = null;

  public init() {
    this.client.on("ready", () => {
      if (this.currentPresence) {
        this.setActivity(this.currentPresence);
      }
    });

    this.client.login();
  }

  public setActivity(presence: IDiscordService) {
    this.currentPresence = presence;

    if (!this.client.user) {
      return;
    }

    this.client.request("SET_ACTIVITY", {
      pid: process.pid,
      activity: {
        type: 0,
        details: presence.details,
        state: presence.state,
        assets: {
          large_image: presence.largeImageKey,
          large_text: presence.largeImageText,
          small_image: presence.smallImageKey,
          small_text: presence.smallImageText,
        },
        ...(presence.startTimestamp && {
          timestamps: { start: presence.startTimestamp },
        }),
      },
    });
  }

  public clearActivity() {
    this.currentPresence = null;

    if (!this.client.user) {
      return;
    }

    this.client.request("SET_ACTIVITY", { pid: process.pid });
  }

  public destroy() {
    this.currentPresence = null;

    this.client.destroy();
  }
}
