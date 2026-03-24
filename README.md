# Son of Ion — Personal AI Assistant (Home & Family Hub)

## What This Is
A self-hosted personal AI assistant running on a Proxmox home server.
Claude is the reasoning and decision-making layer.

## Infrastructure
- **Proxmox server** (home, always-on)
  - Home Assistant LXC — primary data source and control layer
  - Node.js LXC — Claude backend lives here; runs backend, scheduler, voice pipeline, frontend
  - Cloudflare tunnel — exposes the frontend remotely
- **Remote VPS** *(planned)* — receives regular backups for disaster recovery

## Home Assistant Integrations (already connected)
- Apple Calendar — family schedule
- Octopus Energy — electricity tariffs (Agile or equivalent), consumption data
- Škoda Enyaq — EV battery state, charge status
- Second EV — battery state, charge status
- Smart home sensors — various (lights, presence, environment, etc.)
- Plus other integrations available in Home Assistant

## Claude's Responsibilities
- Answer voice and text queries about home state, calendar, energy
- Generate the morning briefing (calendar events, EV charge recommendation, family tasks)
- Suggest which EV to charge based on upcoming calendar events + battery levels + habits
- Create or modify Home Assistant automations on request (user-confirmed before applying)
- Add/update Apple Calendar events on request
- Manage family chore and reward tracking for the children
- Handle scheduled background tasks

## Voice Pipeline
- Target devices: Google Home Hub + Apple HomePod Mini
- Protocol: Wyoming (Home Assistant native voice stack)
- STT: Whisper (local)
- TTS: Piper (local) — primary languages: **English** and **Romanian**

## Key Principles
- Home Assistant is the single source of truth — always fetch fresh state, never rely on cached or assumed values
- Any Home Assistant automation must be confirmed by the user before being applied
- Prioritise privacy — all processing stays local where possible
- Concise voice responses; more detailed text/UI responses

## Vault
Personal family data lives in `/vault/` — this folder is gitignored and never committed.
See `/vault/README.md` for structure.

## What Is Not Built Yet
- [ ] Voice pipeline (STT/TTS via Wyoming + Piper)
- [ ] Morning briefing cron job
- [ ] Frontend UI
- [ ] Chore/reward tracker persistence
- [ ] Backup automation to remote VPS

## Suggested Build Order
1. Morning briefing cron (high value, works with existing HA data today)
2. Frontend UI (dashboard-app scaffold already exists)
3. Voice pipeline (Wyoming + Whisper + Piper)
4. Chore/reward tracker
5. VPS backup automation
