import dgram from "node:dgram";
import { env } from "@/config/env";

/**
 * Minimal SNTP (NTP v3) client over UDP/123 to check the server clock against a
 * public time source. Best-effort: returns an error result on timeout/network
 * failure rather than throwing, so the diagnostics page degrades gracefully.
 */

const NTP_EPOCH_OFFSET_MS = 2208988800000; // seconds between 1900 and 1970, in ms

export type NtpResult =
  | {
      ok: true;
      host: string;
      serverTime: Date;
      offsetMs: number;
      roundTripMs: number;
    }
  | { ok: false; host: string; error: string };

export function queryNtp(host?: string, timeoutMs = 2500): Promise<NtpResult> {
  const server = host ?? env.NTP_SERVER ?? "id.pool.ntp.org";

  return new Promise((resolve) => {
    const client = dgram.createSocket("udp4");
    const packet = Buffer.alloc(48);
    packet[0] = 0x1b; // LI = 0, VN = 3, Mode = 3 (client)

    let settled = false;
    const finish = (result: NtpResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        client.close();
      } catch {
        // ignore close errors
      }
      resolve(result);
    };

    const timer = setTimeout(
      () =>
        finish({
          ok: false,
          host: server,
          error: "Timeout (tidak ada balasan)",
        }),
      timeoutMs
    );

    const t0 = Date.now();

    client.once("error", (err) => {
      finish({ ok: false, host: server, error: err.message });
    });

    client.once("message", (msg) => {
      const t3 = Date.now();
      if (msg.length < 48) {
        finish({ ok: false, host: server, error: "Balasan NTP tidak valid" });
        return;
      }
      const seconds = msg.readUInt32BE(40);
      const fraction = msg.readUInt32BE(44);
      const serverMs =
        seconds * 1000 +
        Math.round((fraction * 1000) / 2 ** 32) -
        NTP_EPOCH_OFFSET_MS;
      const roundTripMs = t3 - t0;
      // Offset relative to the midpoint of our request/response window.
      const offsetMs = Math.round(serverMs - (t0 + roundTripMs / 2));
      finish({
        ok: true,
        host: server,
        serverTime: new Date(serverMs),
        offsetMs,
        roundTripMs,
      });
    });

    client.send(packet, 123, server, (err) => {
      if (err) finish({ ok: false, host: server, error: err.message });
    });
  });
}
