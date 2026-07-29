/**
 * JockShock video registry — Mux playback + caption track IDs in one place.
 *
 * Source of truth is Mux (environment sn2eoh, shared with Southland; JockShock
 * assets are tagged passthrough brand="JockShock"). This file exists so page
 * templates don't each hardcode a 45-character ID.
 *
 * 🛑 CAPTIONS: trackId points at a CORRECTED caption track. Mux's ASR
 * transcribed the spoken line "kills odor-causing bacteria" — cleared for
 * speech, banned in text, because a caption is a written surface a Google MC
 * reviewer parses. Those tracks were replaced 2026-07-29. If a track is ever
 * regenerated, re-run mothership scripts/voice/fix-jockshock-caption-claims.js
 * before shipping. See brand-brief.md §Claims Register.
 *
 * The five cuts with no captions were uploaded 2026-06-11/12 and are past
 * Mux's 7-day auto-caption window — backfill needs Mux support. Don't place
 * an uncaptioned video where a transcript matters (accessibility, SEO).
 */

export interface JockShockVideo {
  /** Mux playback id */
  playbackId: string;
  /** Mux text track id — undefined when the asset has no captions */
  trackId?: string;
  title: string;
  durationSeconds: number;
  /** Best poster frame, in seconds */
  posterTime: number;
  /** One-line note on what the cut actually says, for placement decisions */
  hook: string;
}

export const VIDEOS = {
  /** Mechanism-first. Names HOCl and the immune-system parallel outright. */
  mechanism: {
    playbackId: 'Te7JfKhujhSv7AXYpSjCst8Pkk02oCogWAY8xEt5q1JY',
    trackId: 'bKCSxKh9wyHcZ02uAMzXkwTuzWZEa6UdgTFl5TrCyrAi01nnBI6ieGRQ',
    title: "JockShock — it's hypochlorous acid, not cologne",
    durationSeconds: 19,
    posterTime: 3,
    hook: "This isn't a cologne for your hockey bag. It's hypochlorous acid.",
  },

  /** Identity / rejection angle. Aaron's voice at its purest. */
  identity: {
    playbackId: 'iccAfD1JxFiuvnt3skUE4OP65XmAVkjVwUagFHvZc5A',
    trackId: 'evHDW1PdxemaTRU4MV8g2a1jeO3r02dqRSgMeAmr9zW4ygl8XQTNyhA',
    title: 'JockShock — built for the athlete whose gear actually gets used',
    durationSeconds: 25,
    posterTime: 3,
    hook: "This isn't for the guy who wants his gloves to smell like pine trees.",
  },

  /** The outcome: opening the bag and smelling nothing. */
  outcome: {
    playbackId: 'qaOqbmNMIBREMlB68QrGVrONZJxaA6Spbw5OsB8SlS00',
    trackId: 'vxP3AmdaSi8M3aYtKW4j8rKW7MDU2ZREmrUrVxNExiEzYUglJABgZQ',
    title: 'JockShock — you open your bag and it smells like nothing',
    durationSeconds: 24,
    posterTime: 2,
    hook: 'No linen, no pine, no fake scent. Just nothing. And that\'s the point.',
  },

  /** Problem-first hook. Top of funnel — the bag walks in before you do. */
  problem: {
    playbackId: 'O01IEmGqkmdnsrNK8dtfSN402qaEXCjjd01GRai3n5ugGQ',
    trackId: '4CzkaJ01m025MOuGu1v01sI1pvfooUIyOmQs00Hnq7M5sf8WtVuhWh13Gg',
    title: 'JockShock — your bag walks into the room before you do',
    durationSeconds: 32,
    posterTime: 2,
    hook: 'You stopped noticing three practices ago. Everybody else still does.',
  },

  /** The earned-funk / maintenance framing. Routine-oriented. */
  routine: {
    playbackId: 'wvwzbpiKQ00Z46POBzd3c29VDxculW01swrNPoTh7nQR4',
    trackId: 'tmIrmHS6QB4PjqIGyrkNfSUWRJH00X8Zbp1E1Aqy9f8OXglD9yRKliQ',
    title: 'JockShock — if your gear earns the reps, it earns the maintenance',
    durationSeconds: 32,
    posterTime: 3,
    hook: 'The smell is proof the work happened. The bag opening is the joke.',
  },

  /** Longest cut — full problem → mechanism → proof. Founder-voiced. */
  longform: {
    playbackId: '7xWetw8fKiMnX501MK6ykrTMaH28RsIr4ZvS2NF00Exs00',
    trackId: 'WmJ6C5LNS6aOY00lQtfhqoX5G57GhQTWFjZ2ilmg1qrdAHv3Qa4OaAQ',
    title: 'JockShock — we tried every spray too',
    durationSeconds: 50,
    posterTime: 3,
    hook: "You've tried every spray out there. So have we. No results.",
  },
} as const satisfies Record<string, JockShockVideo>;

/**
 * Uncaptioned — past Mux's 7-day auto-caption window. Listed so nobody
 * re-discovers them as "missing"; do NOT place these where a transcript
 * matters until the captions are backfilled.
 */
export const UNCAPTIONED = [
  { playbackId: '009pPyLPIEQgJ002cj1Ioma9jBuzduy00UMEwmwBhezn7c', title: 'JockShock 15 Sec FINAL' },
  { playbackId: 'fC5ofZlzu3TjWkQgMPmWSE7ZdMxOSpwTeSW32PLgjxU', title: 'JockShock 15 sec with Native' },
  { playbackId: 'XPYYIMs8eSuhFXb101lMQf6vSIfJbCZCgaa01VDv302fSs', title: 'JockShock Extended with Native' },
  { playbackId: 'ZDUBR4xKgnMbkwwfyZL02NEvaOkEH00Zw00Q7t4VKi8fPA', title: 'JockShock 15 Sec 6 sec replace 1' },
  { playbackId: 'ORdFfsd3aiUDd5FAOEvgWqOvayBwvHQYLcsIE5vveRk', title: 'JockShock 15 Sec 6 sec replace 2' },
] as const;
