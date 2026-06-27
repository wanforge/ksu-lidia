"use client";

/**
 * Notifikasi audio — disintesis via Web Audio API, tanpa file eksternal.
 *
 * Setiap nada menggunakan osilator + envelope gain sehingga terasa natural.
 * Singleton AudioContext dipakai agar tidak melebihi batas browser (6 ctx).
 */

export type NotificationTone =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "ding"
  | "notification";

export const AUDIO_TONES: Record<
  NotificationTone,
  { label: string; description: string }
> = {
  success: {
    label: "Sukses",
    description: "Nada naik dua langkah — operasi berhasil",
  },
  error: {
    label: "Eror",
    description: "Nada turun berat — terjadi kesalahan",
  },
  warning: {
    label: "Peringatan",
    description: "Dua ketuk singkat — perlu perhatian",
  },
  info: {
    label: "Info",
    description: "Ding lembut tunggal — notifikasi masuk",
  },
  ding: {
    label: "Ding",
    description: "Ketukan bersih seperti lonceng",
  },
  notification: {
    label: "Notifikasi Baru",
    description: "Kime tiga nada naik — pesan atau notifikasi baru masuk",
  },
};

// ── Singleton context ─────────────────────────────────────────────────────────

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (_ctx && _ctx.state !== "closed") return _ctx;
  try {
    _ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
    return _ctx;
  } catch {
    return null;
  }
}

// ── Primitive ────────────────────────────────────────────────────────────────

function scheduleOscillator(
  ctx: AudioContext,
  opts: {
    freq: number;
    duration: number;
    type?: OscillatorType;
    gainPeak?: number;
    startAt?: number;
  }
) {
  const { freq, duration, type = "sine", gainPeak = 0.28, startAt = 0 } = opts;
  const t0 = ctx.currentTime + startAt;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);

  // Attack → hold → release envelope
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(gainPeak, t0 + 0.01);
  gain.gain.setValueAtTime(gainPeak, t0 + duration * 0.4);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Kembalikan true jika Web Audio API tersedia di browser ini. */
export function isAudioSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    ("AudioContext" in window ||
      "webkitAudioContext" in
        (window as unknown as { webkitAudioContext?: unknown }))
  );
}

/**
 * Putar nada notifikasi. Aman dipanggil kapanpun — tidak melempar exception.
 * Browser memerlukan user gesture sebelum AudioContext bisa resume; fungsi ini
 * mencoba resume otomatis. Jika masih suspended, nada tidak diputar (silent).
 */
export async function playNotificationSound(
  tone: NotificationTone
): Promise<void> {
  const ctx = getCtx();
  if (!ctx) return;

  try {
    if (ctx.state === "suspended") await ctx.resume();
    if (ctx.state !== "running") return;
  } catch {
    return;
  }

  switch (tone) {
    case "success":
      // Dua nada naik: C5 → E5 — terasa positif
      scheduleOscillator(ctx, { freq: 523, duration: 0.14, gainPeak: 0.25 });
      scheduleOscillator(ctx, {
        freq: 659,
        duration: 0.2,
        gainPeak: 0.3,
        startAt: 0.11,
      });
      break;

    case "error":
      // Dua nada turun berat: E4 → Bb3 sawtooth — terasa mendesak
      scheduleOscillator(ctx, {
        freq: 330,
        duration: 0.14,
        type: "sawtooth",
        gainPeak: 0.18,
      });
      scheduleOscillator(ctx, {
        freq: 233,
        duration: 0.28,
        type: "sawtooth",
        gainPeak: 0.22,
        startAt: 0.1,
      });
      break;

    case "warning":
      // Dua ketuk A4 — pendek dan mencolok
      scheduleOscillator(ctx, { freq: 440, duration: 0.09, gainPeak: 0.2 });
      scheduleOscillator(ctx, {
        freq: 440,
        duration: 0.09,
        gainPeak: 0.2,
        startAt: 0.16,
      });
      break;

    case "info":
      // G5 lembut — satu ketukan ringan
      scheduleOscillator(ctx, { freq: 784, duration: 0.28, gainPeak: 0.18 });
      break;

    case "ding":
      // C6 bell-like — ketukan bersih dengan sustain
      scheduleOscillator(ctx, { freq: 1047, duration: 0.45, gainPeak: 0.24 });
      break;

    case "notification":
      // Kime tiga nada naik: G4 → B4 → D5 — akord G mayor arpegio
      // Terasa seperti chime notifikasi chat/pesan baru, agak lebih panjang
      scheduleOscillator(ctx, {
        freq: 392,
        duration: 0.22,
        gainPeak: 0.22,
        startAt: 0,
      });
      scheduleOscillator(ctx, {
        freq: 494,
        duration: 0.22,
        gainPeak: 0.24,
        startAt: 0.15,
      });
      scheduleOscillator(ctx, {
        freq: 587,
        duration: 0.55,
        gainPeak: 0.28,
        startAt: 0.3,
      });
      break;
  }
}
