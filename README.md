Product Requirements Document (PRD) v1.0
Project Name: AI Nexus: Multimodal Game Master

Team Composition: 3 Frontend, 3 Backend

Core Tech: WebSockets (Real-time), Google Gemini (Text & Vision), Imagen (Image Generation)

1. Executive Summary
   Satu platform naratif interaktif di mana 4 orang pemain bekerjasama dalam satu sesi yang dikendalikan oleh AI Game Master. Keunikan projek ini adalah integrasi Real-time Multimodal; setiap tindakan pemain (teks atau gambar) akan menjana respon teks dan visual unik daripada AI secara serentak kepada semua pemain.

2. User Roles & Flow (The "4-Player" Logic)
   User Roles

Player 1 (The Catalyst): Memulakan sesi dengan prompt "Cari Game Master".

Player 2, 3, 4 (The Squad): Memberi input, memuat naik gambar bukti, dan menerima hasil generate.

Functional User Flow

Room Entry: 4 User masuk ke dalam bilik (Socket ID assigned).

GM Initiation: Player 1 hantar prompt ➔ Backend panggil Gemini ➔ Broadcast perwatakan GM ke semua.

Visual Immersion: Setiap kali GM bercakap, AI menjana gambar suasana (Image Gen) ➔ Broadcast imej ke semua.

Collaborative Vision: User hantar gambar ➔ AI Describe gambar dalam konteks game ➔ Semua pemain nampak description tersebut secara real-time.

Final Generation: Hasil akhir cerita dirumuskan dalam bentuk poster digital yang dijana AI.

3. Detailed Task Allocation (6-Person Team)
   Frontend Team (3 Pax)

Role Responsibility Tech Focus
FE 1: Lead Integration Setup WebSocket client, handle room synchronization & real-time state management. Socket.io Client, Zustand/Redux
FE 2: AI Interaction Build UI for prompting, image upload previews, and AI chat bubbles. Tailwind CSS, Framer Motion
FE 3: Media & Assets Rendering AI-generated images, handling loading skeletons for image generation. React/Next.js
Backend Team (3 Pax)

Role Responsibility Tech Focus
BE 1: Socket Architect Build the WebSocket Server, room management (join/leave), and event broadcasting logic. Node.js (Socket.io)
BE 2: AI Engineer Connect to Gemini API (for GM) & Imagen API (for image gen). Prompt engineering. Google Cloud Vertex AI
BE 3: Cloud & Data Database for game history, hosting on Google Cloud Run, and API Security. GCP, Firestore/PostgreSQL 4. Technical Specifications
A. Real-Time Engine (WebSockets)

Events:

join_room: Grouping 4 users.

gm_message: Sending AI text to all.

image_update: Sending the newly generated image URL to all.

describe_request: Processing user image to text.

B. AI Multimodal Stack (Google Cloud)

Text Generation: gemini-1.5-flash (Laju untuk chat).

Image Understanding: gemini-1.5-pro (Untuk describe gambar user dengan tepat).

Image Generation: imagen-3 (Untuk hasilkan visual game yang cantik).

5. UI/UX Requirements
   Theme: Dark mode, cyberpunk/fantasy (sesuai dengan vibe game).

Indicators: "AI is thinking..." atau "AI is painting..." status bar supaya user tak tertunggu-tunggu.

Consistency: Gambar yang dijana perlu mempunyai gaya visual yang sama (Seed consistency).

6. Project Timeline (Hackathon Style)
   Hour 1-4: Setup Repo, WebSocket basic connection (Room join).

Hour 5-12: Integration Gemini API & Imagen API.

Hour 13-18: UI Polishing & handling edge cases (cth: socket disconnect).

Hour 19-24: Final Testing & Pitching Deck preparation.

7. Success Criteria
   Keempat-empat user menerima maklumat yang sama (teks & gambar) pada masa yang sama.

AI mampu memberi respon relevan terhadap gambar yang diupload oleh mana-mana user.

Gambar yang dijana berkualiti tinggi dan mengikut tema prompt awal.
