/**
 * Bridger Western Wiki — Gemini Chat Worker
 * Deploy to Cloudflare Workers
 * Set environment variable: GEMINI_API_KEY = your key
 */

const ALLOWED_ORIGIN = 'https://bridgerwestern.cc';

// Rate limiting: max 10 requests per IP per minute
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 10;
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  const entry = rateLimitMap.get(ip);
  if (now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

function corsHeaders(origin) {
  const allowed = origin === ALLOWED_ORIGIN || origin === 'http://localhost:3000';
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// Wiki content embedded directly — no external fetch needed
const WIKI_CONTENT = `
# Bridger Western Wiki - Full Content Index

Bridger Western is a Roblox survival game set in Ridge B Valley. 2026 Alpha.

## Stands

Stand Tiers: S-Tier: The World, D4C, Killer Queen. A-Tier: Star Platinum, TWAU, King Crimson, Star Platinum The World. B-Tier: Tubular Bells, 20th Century Boy, Hierophant Green, Silver Chariot, Hermit Purple, Tusk Acts 1-3. Tier Pending: Purple Haze, Mandom, Hey Ya.

How to get a Stand: (1) Arrow Shard fishing — 0.1% drop rate, guarantees a Stand. (2) Corpse Part KOTH — requires 3+ players, yellow beam in sky, hold to absorb (15-20% cap). Left Arm gives Tusk (10% chance). Stands are permanent. Stand penalty: reduces gun damage.

The World: Long Timestop ~5s, Shinei autolock punch, Knife Toss, Kick Barrage. RARE.
D4C: Dimension Hop (poncho required), Clone Spawn, Clone Swap. Special: 100 kills + 10 killstreak in Deserts area. DEFAULT.
Killer Queen: Plant Bomb/Detonate, Sheer Heart Attack, Stray Cat air bubble. DEFAULT.
Star Platinum: Skull Breaker, Star Finger, Timestop Movement. 1% chance to evolve to SPTW. RARE.
Star Platinum The World: Heavy Punch, Triple Bearing Shots, 2s Time Stop, Grab Beatdown. DEFAULT.
King Crimson: Epitaph auto-dodge, Time Erasure (iframes+speed), Donut impale. RARE.
Tusk Acts 1-3: Cripple passive (cannot walk or use guns). Left Arm only (2%). Nail Bullets, Nail Glide, Golden Rotation Bullet.
Hermit Purple: Grapple, Chop/Dropkick. Utility. DEFAULT.
Silver Chariot: Rapier Uptilt, Lunge 20dmg, Whirlwind Slash, Armor Removal (speed+dmg boost). DEFAULT.
Hierophant Green: Tentacle Wire, Emerald Splash, 20 Meter Emerald Splash, Stand Pilot. DEFAULT.
Tubular Bells: Balloon Command, Dog/Snail/Swan balloons, TUBULAR BELLS!!! Utility. DEFAULT.
20th Century Boy: Absolute Defense (reflects attacks), Dynamite Strap. Utility. DEFAULT.
Hey Ya: Encouragement passive (random buffs: dodge, damage, healing, speed, accuracy). Utility. DEFAULT.
Mandom: Time Rewind (G) — rewinds 6 seconds for everyone nearby. RARE Utility.
Gold Experience: Life Giver passive, 7 Page Muda, Life Giver Punch, Self/Other Heal. DEFAULT.
Crazy Diamond: Restore Mode (damage→healing), Tracking Barrage, Facial Reconstruction. DEFAULT.
Magicians Red: Flaming Roundhouse Kick, Red Bind, Crossfire Hurricane Special, Stand Pilot. DEFAULT.
Purple Haze: Poison Bulbs passive, Bulb Smash, Poison Bulb Shoot/Trap, Stand Pilot. DEFAULT.
Stone Free: Thread Weaving passive, Heavy Punch 25dmg, String Pull, String Patchworks (heal), Rock Swing. DEFAULT.
Whitesnake: Disc Grab (disables stand), Disc Throw (inverts controls), Acid Spit (sleep). RARE.
TWAU: Checkmate passive, Short Timestop, Long Timestop ~4s, Autotracking Chop. RARE.

Stand Skins: 5% chance on any obtainment roll. Purely cosmetic.
The World skins: Greatest High, OVA.
Star Platinum skins: HFTF, Intro, Judge, OVA, Strength.
Star Platinum The World skins: Final Beatdown, Stone Ocean.
D4C skins: Cracked, M4C.
TWAU skins: Manga, Neo, STW.
Hierophant Green skins: HFTF, Purple, Red, Yellow.
Hermit Purple skins: Hermit Blue, Hermit Gold, Holy's Stand.
Mandom skins: King Mandom, Mintdom, Purple Mandom, Reverse Mandom.
Magicians Red skins: Purple.

Corpse Part spawn locations (8 total): Swamp/Forest, Anthill Island, Red Corner watchtower, Pit of Doom, Mineshaft Entrance, Cave near Ridge B. County, Grassy area between Forest and Abandoned Town, Death Valley.

Arrow Shard: 0.1% fishing drop. Guarantees random Stand. Cannot be stored/traded/dropped. Cannot use if you already have a Stand. Lost on death if unused.

## Weapons

Primary weapons (9): Taurus .357 (starter revolver), Schofield 6 (revolver), Whitney Dragoon (high dmg revolver), Dual Derringers (fast pistol), Mauser (low recoil pistol), Winchester Repeater (8-bullet rifle), Bow (Silver/Dynamite arrows), Malcom .70 (sniper, headshots 50dmg), Bolt Action Rifle (unobtainable).

Secondary weapons (6, requires Tier 3): Mares Leg (7 bullets, faster Winchester), Sabre (melee, parries sabres/vampires), Colt Ocelot (ricochet revolver), DB Shotgun (double barrel), Tommy Gun (25 bullets SMG), Maverick 88 (pump shotgun, 6 pellets).

Mares Leg: Fish it (2% Epic drop), drops rusted. Repair at Flint the Blacksmith for 1,500 Moola. Tier 3 required to equip with primary.

Revolvers have wasteful reloads: Taurus .357, Schofield 6, Whitney Dragoon, Colt Ocelot.
Tier 3 unlocks dual wield (primary + secondary together).
Stand penalty: having a Stand reduces gun damage.

## Cards

Get cards from Mud Witch in Swamp. 150 Moola per roll, choose 1 of 3 random cards. Max 3 cards per character.

All cards:
- Archer's Child: 1.5x bow drawspeed, 2x bow firerate
- Desperado: more gun damage at low HP (not bows)
- Boy With Fists: +20% melee damage, -55% gun accuracy
- Belmont Family Crest: +25% melee vs vampires, +25% damage from humans
- Show Me A Good Time: 0.45s parry frames on slash/equip
- A True Cowboy: lasso auto-aims on horseback, +17% gun damage mounted
- Demolitions Expert: less self-damage from explosions, more to others
- Free Runner: +20 stamina, roll becomes slide
- Poltergeist: nearly invisible during roll, roll costs 80% more stamina
- Can't Lay Off the Tonic: more damage with tonics, take damage without them
- Flesh Automaton: explode on lethal damage
- High Noon: -10 max HP, autoaim 5s at noon
- Snake Eater: name/gang tag visible to others
- Quick Draw: quickdraw state on equipping primary
- Evil Eye: Ocular prowess 50% longer, 50% longer cooldown
- EXECUTIONER: headshots over 40 damage decapitate
- Coin Roller: disabled

Card builds:
- Bow: Archer's Child + EXECUTIONER + Free Runner
- Aggressive Gunslinger: Desperado + Quick Draw + Poltergeist
- Mounted: A True Cowboy + Quick Draw + EXECUTIONER
- Melee: Boy With Fists + Show Me A Good Time + Free Runner
- Vampire Hunter: Belmont Family Crest + Show Me A Good Time + Free Runner
- Stealth: Poltergeist + EXECUTIONER + Quick Draw

## Items

Consumables: Ammo Box (replenish ammo), Silver Ammo (silver damage to vampires), Tonic (heals HP, blurs screen if overused), Dogbane Herb (4% chest drop — trade at Mud Witch for 2500 Moola / -20 years age / Stand removal), Arrow Pack (5 arrows), Knives.

Combat items: Dynamite (Outlaws throw 2 at tier 2, 3 at tier 3), Molotov (fire pool), Smoke Bomb (smoke screen — combine with Molotov for big explosion), Silver Dagger (8 dmg base, 16 vs vampires, M2 grab+shank 28 dmg), Wooden Stake (anti-vampire, burns for ~10s), Steel Wireset (silver burn vs vampires with Silver Wireset card).

Equipment: Lasso, Poncho (less overall damage, more limb damage), Cowboy Hat (blocks 1 headshot), Lantern, Coin (deflects hitscan shot when shot during glimmer).

Rokakaka Fruit: Two Tier 3 Stand users split it together. Equalizes ages, swaps 1-2 cards, 1% chance to trade Stands + turn Stand into shiny. Cannot be dropped, kept on death, can be banked.

## Fishing

Fishing rod: 150 Moola. Bait: 15 Moola (2x faster). Location: Tackle Bait shop (follow train tracks).
Drop rates: Common 81.7% (Cod $35, Snapper $25, Bass $45), Rare 16.25% (Chests), Epic 2% (Mares Leg), Legendary 0.1% (Golden Bass 15,000 Moola, Arrow Shard).
All water sources have same drop rates. Fishing is safest Moola farming method.

## Locations

Main Town: Gun Store (most guns), General Store (Knives, Cowboy Hat, Poncho, Lasso, Coin, Lantern), Banker (item storage — NOT kept on wipe), Tailor (shirt/pants 15 Moola, accessory 30 Moola), Barbershop (hairstyle 25 Moola, hair color 15 Moola), Red Corner Fight Club (PvP fist fights, lose = 300 Moola).

Mud Witch's Hut (Swamp): Card rolls 150 Moola, Dogbane Herb trades (2500 Moola / -20 years / Stand removal).

Horse Stables (various locations): Replace horse, press M for stats. Pricing 150-1500 Moola, reroll 20 Moola. 800+ Moola = good horse. Rarities: Common, Rare, Epic, LEGENDARY (1 stat boost), MYTHICAL (2 stat boosts). Legendary/Mythical identified by brackets + FULL CAPS. Confirmation prompt appears.

Flint the Blacksmith (Main Town, bridge near train stop): Can Questline, Mares Leg repair 1500 Moola.

Gyro NPC: Spin for 25,000 Moola.

Spawn Point NPCs (various): Change spawn for 150 Moola. 30% chance to auto-change spawn if you die at your own spawn.

Inlaw spawns: Ridge B. County (Hotel, LP. Haris Medical Help, Red Building), Digsite (caravan).
Outlaw spawns: Campsite (outside swamp), Outlaw Hideout (woods fortress), Outlaw Hills (campfire), Red Corner (tunnel), Sandtown (random building).

Red Corner Fight Club: Interact with NPC → step on green mat (vacant) or red mat (occupied). Both mats occupied → teleported underground. Fist fight only (Stand abilities allowed, guns/utilities disabled). Lose = 300 Moola. Spectators can throw items in.

World Map: Shows all locations in Ridge B Valley. Outlaw Camp Dealer (extra guns/throwables, may need Outlaw faction).

## Beginner Guide / FAQ

Choose Outlaw (more freedom, community recommended). Spawn at Red Corner (closest to fishing). Start fishing immediately for safe Moola. Starting Moola is random 50-500 — if under 200, use Wipe in character menu and restart.

Controls: Double-tap W to sprint (auto-vaults). Q to dodge/roll. Z for ADS. Horse sprint: hold Shift. Horse across water: hold Shift + Space. Stand abilities: E, R, T, Y, F, G, H (varies by Stand).

Only buy horses 1,000+ Moola. Cowboy Hat blocks 1 headshot. Poncho reduces overall damage. Tusk users cannot walk (crawl only) and cannot use weapons — need legendary/mythical horse.

Aging system: character ages over time. Dogbane Herb → Mud Witch for -20 years.
`;

const SYSTEM_PROMPT = `You are a helpful assistant for the Bridger Western Wiki (bridgerwestern.cc).
Bridger Western is a Roblox game. Answer questions based ONLY on the wiki content provided.
Keep answers concise and friendly. Always suggest a relevant page link when applicable.
If the answer is not in the wiki content, say: "I don't have that info yet — check the Trello or ask in the community Discord."
Do NOT make up game mechanics or stats not mentioned in the wiki.
Reply in the same language the user writes in.

Available pages:
- /stands/ — Stands guide & tier list
- /stands/stand-abilities/ — Stand abilities
- /stands/skins/ — Stand skins
- /weapons/ — Weapons guide
- /weapons/mares-leg/ — Mare's Leg
- /cards/ — Cards guide
- /cards/all-cards/ — All cards
- /cards/card-builds/ — Card builds
- /cards/how-to-get-cards/ — How to get cards
- /items/ — Items database
- /fishing/ — Fishing guide
- /locations/ — Locations guide
- /locations/map/ — World map
- /locations/horses/ — Horse Stables guide
- /locations/npcs/ — NPCs guide
- /locations/spawn-locations/ — Spawn locations
- /locations/red-corner-fight-club/ — Red Corner Fight Club
- /guides/beginner-guide/ — Beginner guide

WIKI CONTENT:
${WIKI_CONTENT}`;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers });
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait a moment.' }), {
        status: 429,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    const userMessage = (body.message || '').trim().slice(0, 500);
    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    const apiKey = env.GEMINI_API_KEY;
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

    const geminiBody = {
      contents: [{
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT + '\n\nUser question: ' + userMessage }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 512,
      }
    };

    try {
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody)
      });

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        console.error('Gemini error:', errText);
        return new Response(JSON.stringify({ error: 'AI service error. Please try again.' }), {
          status: 502,
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      }

      const geminiData = await geminiRes.json();
      const answer = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.';

      return new Response(JSON.stringify({ answer }), {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });

    } catch (e) {
      console.error('Fetch error:', e);
      return new Response(JSON.stringify({ error: 'Network error. Please try again.' }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }
  }
};
