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
 * reviewer parses. Those tracks were replaced 2026-07-29, then re-attached
 * 2026-08-14 after the six ads were re-uploaded (new asset + playback IDs;
 * the July IDs 404). If a track is ever regenerated, re-run mothership
 * scripts/voice/fix-jockshock-caption-claims.js AND
 * scripts/voice/swap-jockshock-caption-tracks.js before shipping.
 * See brand-brief.md §Claims Register.
 *
 * ⚠️ Re-upload always mints new playback IDs. Update THIS file or the site
 * renders a black box. The five uncaptioned cuts below were not re-uploaded.
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
  /**
   * Native frame. Every JockShock ad in this registry is a 1080×1920
   * phone cut (Mux RESOLUTION=1080x1920). MuxVideo defaults to 16/9, which
   * crops the talking head — pass this through, don't assume landscape.
   */
  aspect: '16/9' | '9/16' | '1/1';
  /** One-line note on what the cut actually says, for placement decisions */
  hook: string;
}

/**
 * INDEX — every JockShock-relevant Mux asset in env sn2eoh (2026-08-25).
 * Mike pasted asset IDs, not playback IDs. Always store playback IDs here.
 *
 * LIVE ON SITE
 *   mechanism / identity / outcome / problem / routine / longform — 9:16 ads
 *   firefighter — 72s 9:16, no passthrough, no captions
 *
 * GYMS (this page)
 *   gymBroll        asset T5ptHjx1ynbtBts02UMp8GwJ0229skqybWm4KHYIgKCZI
 *                   playback XvQ5HSCBsbOVOZWPyGpaxk9q3eGaIbTKhWezB5mRJeM
 *                   23s 16:9 · titled "ZeroPoint Website Gym BRoll"
 *                   Pure spray: barbell, speed bag, kettlebells. No talking head.
 *   gymLifeChange   asset 02aQhAImS3o2B7kcV801cEJstQBJSuEH5wOTrD22coQHU
 *                   playback 8rVRybeNd301xALm02jZ2OXvF5QX7STbMUt1e6wM76GQc
 *                   45s 16:9 · empty passthrough
 *                   Life Change Fitness. Owner interview + staff fogging
 *                   treadmills / dumbbells / a tanning bed. ZP watermark.
 *                   Do NOT place as testimony until a claims-safe transcript
 *                   exists. B-roll frames only, or keep it off the page.
 *
 * UNCAPTIONED 16:9 ADS (June 2026) — listed below. Do not put where captions matter.
 *
 * UNLABELED (empty passthrough — do not lose these)
 *   8rVRybe… is gymLifeChange (above).
 *   HqTb7qXS… is firefighter (above).
 *   wSLNfHyB… 23s 9:16 — gym-bag / locker lifestyle, JOCKSHOCK lower-third
 *   wlHN3qSt… / jwtpvJgj… / YwDS5NXv… / SAEt02sO… — 9:16 woman-to-camera
 *     with JS bottle overlays. One overlay reads "STADIUM SURFACE /
 *     DISINFECTANT & CLEANER". Claims-unsafe. Do not place.
 *   OUaZXLaR… 30s 16:9 poultry + ZP watermark. Not gyms.
 *   slDWrC37… 35min 16:9 untitled source. Not a cut.
 */

export const VIDEOS = {
  /** Mechanism-first. Names HOCl and the immune-system parallel outright. */
  mechanism: {
    playbackId: 'nqgpbOIHrGhuCNAHvhM7nOYzhySiWUxHjdmMEw1mKiw',
    trackId: 'Xr5JJ5b62KKDR0201q1YZ00rwcfnAvaAmdgXK3dsQk5Gsn1HZZTLoFUTA',
    title: "JockShock — it's hypochlorous acid, not cologne",
    durationSeconds: 19,
    posterTime: 3,
    aspect: '9/16',
    hook: "This isn't a cologne for your hockey bag. It's hypochlorous acid.",
  },

  /** Identity / rejection angle. Aaron's voice at its purest. */
  identity: {
    playbackId: '93IAUFNIBql5I4JrwW15ucHPTuDO2w9Lh8l4AnNNei00',
    trackId: 'p02lOKnTsaqsIW00lPDtkimeLggGaJYHs00m02Xw9u35015KDctoNr00wiaw',
    title: 'JockShock — built for the athlete whose gear actually gets used',
    durationSeconds: 25,
    posterTime: 3,
    aspect: '9/16',
    hook: "This isn't for the guy who wants his gloves to smell like pine trees.",
  },

  /** The outcome: opening the bag and smelling nothing. */
  outcome: {
    playbackId: 'LJzCwZRSeJzWNgXdndUMqHgD1wmpNXoG75Tb0271xklE',
    trackId: 'nGOimDnGFdg4X7bq1nS7gyjB7X02k00jj9cECcp8D2sLfpszf5ShavdA',
    title: 'JockShock — you open your bag and it smells like nothing',
    durationSeconds: 24,
    posterTime: 2,
    aspect: '9/16',
    hook: 'No linen, no pine, no fake scent. Just nothing. And that\'s the point.',
  },

  /** Problem-first hook. Top of funnel — the bag walks in before you do. */
  problem: {
    playbackId: 'pXitY3K01bJj01EeybP15aVpIl02tvTMPBeW02ObH1IQdnE',
    trackId: 'TtxYSQwL3TUYYeLNH7V7CvLGjEMOQAG8XJ5VnwumcMaJXUNd00qDmoQ',
    title: 'JockShock — your bag walks into the room before you do',
    durationSeconds: 32,
    posterTime: 2,
    aspect: '9/16',
    hook: 'You stopped noticing three practices ago. Everybody else still does.',
  },

  /** The earned-funk / maintenance framing. Routine-oriented. */
  routine: {
    playbackId: 'h00vkFRosdTxhQ6sG800v3fWWW6yYRcyJjkaGden4Md8s',
    trackId: 'tu701pYxk004kduJMKdHf5ne02mS5rL9B00xayYjpCQSs601LJbSf3Vhxmw',
    title: 'JockShock — if your gear earns the reps, it earns the maintenance',
    durationSeconds: 32,
    posterTime: 3,
    aspect: '9/16',
    hook: 'The smell is proof the work happened. The bag opening is the joke.',
  },

  /**
   * Fire-service testimonial. A 20-year fire service veteran on turnout-gear
   * odor, intercut with SCBA / apparatus-bay b-roll.
   *
   * 🛑 NO CAPTION TRACK. Uploaded 2026-08-04, past Mux's 7-day auto-caption
   * window — same problem as UNCAPTIONED below. Author and upload captions
   * before this carries accessibility or SEO weight.
   *
   * 🛑 The speaker is ANONYMOUS ON PURPOSE — he works for Southland part-time.
   * Never name him or his department on any surface. The blank lower-third in
   * the cut is deliberate, not an unfinished template.
   *
   * ⚠️ When captions ARE authored: the spoken VO says "eliminate odor causing
   * bacteria." Cleared for SPEECH, banned in TEXT — a caption is a written
   * surface. Write it as "kills odor" in the VTT. This is the exact failure the
   * 2026-07-29 caption correction fixed on the other six.
   */
  firefighter: {
    playbackId: 'HqTb7qXS7NIOqO1GnTNNWPdLA3cAPCxS02nhC7lS3w8A',
    title: 'JockShock — a 20-year fire service veteran on turnout gear',
    durationSeconds: 72,
    posterTime: 30,
    aspect: '9/16',
    hook: "Firefighters can't always wash their gear between calls, but they still have to wear it.",
  },

  /** Longest cut — full problem → mechanism → proof. Founder-voiced. */
  longform: {
    playbackId: 'Xcz6p4qkHiB01EZTzfNdpXdbqWsz6ojsbkE3iSjqVkmQ',
    trackId: 'onqZVKyu9ll9s02VesPZNX01o01oTTf4gMSIunJU9mGVV1DLXaT78YFkg',
    title: 'JockShock — we tried every spray too',
    durationSeconds: 50,
    posterTime: 3,
    aspect: '9/16',
    hook: "You've tried every spray out there. So have we. No results.",
  },

  /**
   * ZeroPoint gym B-roll. Spraying real gym iron — no interview, no VO.
   * Asset ID (what Mike pasted): T5ptHjx1ynbtBts02UMp8GwJ0229skqybWm4KHYIgKCZI
   * Mux title: "ZeroPoint Website Gym BRoll"
   * 🛑 No caption track. Ambient only — do not treat as a written surface.
   */
  gymBroll: {
    playbackId: 'XvQ5HSCBsbOVOZWPyGpaxk9q3eGaIbTKhWezB5mRJeM',
    title: 'ZeroPoint — spraying a gym',
    durationSeconds: 23,
    posterTime: 5,
    aspect: '16/9',
    hook: 'Handheld sprayer on a barbell, an Everlast speed bag, then kettlebells.',
  },

  /**
   * Life Change Fitness — owner on camera + fogging B-roll.
   * Asset ID (what Mike pasted): 02aQhAImS3o2B7kcV801cEJstQBJSuEH5wOTrD22coQHU
   * Empty passthrough. Not Fred. Not D1.
   * 🛑 Keep off /gyms as testimony until captions exist and pass claims.
   */
  gymLifeChange: {
    playbackId: '8rVRybeNd301xALm02jZ2OXvF5QX7STbMUt1e6wM76GQc',
    title: 'ZeroPoint at Life Change Fitness',
    durationSeconds: 45,
    posterTime: 5,
    aspect: '16/9',
    hook: 'Gym-owner interview cut with staff fogging treadmills and iron.',
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

/**
 * Recent uploads with empty passthrough. Indexed so the next agent does not
 * treat them as missing. Do not place the woman-to-camera set — bottle
 * overlays say "disinfectant" on a JockShock bottle.
 */
export const UNLABELED = [
  {
    playbackId: 'wSLNfHyBQ2F1MwSzun2FFVi25iR0000zw6qdgT8O1fTBI',
    durationSeconds: 23,
    aspect: '9/16' as const,
    note: 'Gym-bag / locker lifestyle. JOCKSHOCK lower-third. No title.',
  },
  {
    playbackId: 'wlHN3qStTi00mknvY9kqUwS01Oq600u6ldfnj5CgGIkE5M',
    durationSeconds: 30,
    aspect: '9/16' as const,
    note: 'Woman to camera, JS bottles in corners. Claims-unsafe overlays. Do not place.',
  },
  {
    playbackId: 'jwtpvJgjM026A6rLBiAlXgBbDTJpJOLdnPehIbbGVNhs',
    durationSeconds: 26,
    aspect: '9/16' as const,
    note: 'Same speaker / overlay family as wlHN3qSt. Do not place.',
  },
  {
    playbackId: 'YwDS5NXvhsMRemCXUNFToWsw1MIH2ppHvC02PBz5gRzQ',
    durationSeconds: 24,
    aspect: '9/16' as const,
    note: 'Same speaker / overlay family as wlHN3qSt. Do not place.',
  },
  {
    playbackId: 'SAEt02sO4pHylXtaaGbYgXtMgz9V01K3m201IDM2DWwgQ00',
    durationSeconds: 34,
    aspect: '9/16' as const,
    note: 'Same speaker. Overlay reads Stadium Surface / Disinfectant. Do not place.',
  },
] as const;
