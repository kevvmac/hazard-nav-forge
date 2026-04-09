# MissionBrief - Tactical Environment Analysis

Spatial pre-mission briefing tool for high-risk environment operations.
Built at the World Labs Hackathon (April 2026) using the World Labs Marble API and Anthropic Claude API.
🔗 Live demo: hazard-nav-forge.lovable.app

What It Does
MissionBrief generates tactical briefings for teams entering hazardous environments — think Chernobyl reactor rooms, bomb disposal sites, collapsed structures, or chemical spill zones.
A commander uploads a recon photo and/or describes the environment. The app automatically extracts and categorizes all hazards, generates a structured mission brief, and produces a navigable 3D world of the environment that the team can explore before entry.

How It Works
1. User inputs recon image + environment description
2. Claude API analyzes inputs and extracts hazards
3. World Labs Marble API generates a navigable 3D world
4. App surfaces hazard cards, mission brief, and 3D environment link

Features

Multimodal hazard extraction — Upload a JPG recon photo and/or paste an environment description; Claude identifies and categorizes all threats by severity (CRIT / HIGH / MED)
Auto-generated mission brief — Environment summary, entry recommendations, time constraints, and required equipment generated automatically
3D world generation — Marble generates a spatially accurate, navigable 3D environment from the input; opens in World Labs viewer
Mission history — Session log of all generated briefings with thumbnails and reload functionality
Tactical UI — Dark ops dashboard aesthetic built for high-stakes readability


Tech Stack (Layer: Technology)

Frontend: React, TypeScript, Tailwind CSS
Backend: Supabase Edge Functions
AI Analysis: Anthropic Claude API (claude-sonnet-4-20250514)
3D Generation: World Labs Marble API (Marble 0.1-mini / 0.1-plus)
Deployment: Lovable + Supabase

Example Use Cases

-Nuclear reactor room entry (Chernobyl Elephant's Foot)
-Bomb disposal pre-entry briefing
-Hazmat / chemical spill zone assessment
-Search and rescue in structurally compromised buildings
-High-voltage electrical room protocols


Running Locally
Clone the repo and install dependencies:
bashgit clone https://github.com/kevvmac/hazard-nav-forge
cd hazard-nav-forge
bun install
Set up environment variables — create a .env file at the root:
VITE_ANTHROPIC_API_KEY=your_anthropic_key
VITE_WORLD_LABS_API_KEY=your_world_labs_key
Run the dev server:
bashbun run dev

Built By:
Kevin — Data Analytics & GTM Strategy consultant transitioning into solutions engineering and AI deployment roles.
🔗 LinkedIn: https://www.linkedin.com/in/kevin-macias-2aa5031a1/ 

Built in one day at the World Labs Hackathon, NYC — April 2026

