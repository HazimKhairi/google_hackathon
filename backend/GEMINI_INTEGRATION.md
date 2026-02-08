# Google Hackathon - AI Integration Documentation

## Overview

Projek ini mengintegrasikan Google Gemini AI untuk menyokong sistem Game Master (GM) yang pintar. Sistem ini boleh menghasilkan naratif, menganalisis gambar, dan menghasilkan visual berdasarkan cerita.

## API Endpoints

### 1. Generate Narrative (Gemini AI)
Menghasilkan naratif untuk permainan RPG menggunakan Gemini AI.

**Endpoint:** `POST /api/messages/generate-narrative`

**Request Body:**
```json
{
    "room_id": 1,
    "prompt": "Pemain memasuki gua yang gelap dan misterius",
    "context": {
        "location": "Gua Mistik",
        "characters": "Warrior Elf, Wizard Human",
        "previous_events": "Baru sampai di hutan"
    }
}
```

**Response:**
```json
{
    "message": {
        "id": 15,
        "room_id": 1,
        "sender_role": "gm",
        "content": "Angin sejuk bertiup dari dalam gua... [naratif generated]",
        "image_url": null,
        "created_at": "2026-02-08T10:30:00.000Z"
    },
    "usage": {
        "prompt_token_count": 45,
        "candidates_token_count": 150,
        "total_token_count": 195
    }
}
```

### 2. Describe Image (Gemini Vision)
Menganalisis dan menerangkan gambar yang dimuat naik menggunakan Gemini Vision.

**Endpoint:** `POST /api/messages/describe-image`

**Request Body:** (multipart/form-data)
- `room_id`: 1
- `image`: [file upload]
- `prompt`: "Terangkan gambar ini dalam konteks fantasy RPG" (optional)

**Response:**
```json
{
    "user_message": {
        "id": 16,
        "room_id": 1,
        "sender_role": "player",
        "content": null,
        "image_url": "/storage/messages/image123.jpg",
        "created_at": "2026-02-08T10:31:00.000Z"
    },
    "gm_response": {
        "id": 17,
        "room_id": 1,
        "sender_role": "gm",
        "content": "Dalam gambar ini kelihatan... [AI description]",
        "image_url": null,
        "created_at": "2026-02-08T10:31:05.000Z"
    }
}
```

### 3. Generate Image (Imagen API - Placeholder)
Menghasilkan gambar berdasarkan naratif cerita.

**Endpoint:** `POST /api/messages/generate-image`

**Request Body:**
```json
{
    "room_id": 1,
    "prompt": "A dark mystical cave with glowing crystals",
    "options": {
        "aspect_ratio": "16:9",
        "sample_count": 1
    }
}
```

**Response:** (Currently returns placeholder)
```json
{
    "message": "Image generation akan diimplementasi setelah konfigurasi Imagen API",
    "error": "Imagen API belum dikonfigurasi sepenuhnya. Perlu Service Account authentication."
}
```

## Konfigurasi Persekitaran

Tambahkan konfigurasi berikut ke file `.env`:

```env
# Google AI Services Configuration
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_CLOUD_PROJECT_ID=your_project_id_here
GOOGLE_CLOUD_LOCATION=us-central1
```

## Cara Mendapatkan API Keys

### Google Gemini API Key
1. Pergi ke [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Login dengan akaun Google anda
3. Klik "Create API Key"
4. Salin API key dan masukkan ke dalam `.env`

### Google Cloud Project (untuk Imagen)
1. Pergi ke [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau gunakan yang sedia ada
3. Enable Vertex AI API
4. Buat Service Account untuk authentication
5. Download Service Account JSON key
6. Set environment variable untuk authentication

## Struktur Service Class

### GeminiService Methods

#### `generateNarrative(string $prompt, array $context = []): array`
- **Input:** Prompt pengguna dan konteks permainan
- **Output:** Array dengan narrative text dan metadata usage
- **Fungsi:** Menghasilkan cerita berdasarkan input GM

#### `describeUserImage(string $imagePath, string $prompt = ''): array`
- **Input:** Path ke image file dan optional prompt
- **Output:** Array dengan deskripsi image
- **Fungsi:** Menganalisis gambar menggunakan Gemini Vision

#### `generateImage(string $prompt, array $options = []): array`
- **Input:** Prompt untuk image generation
- **Output:** Array dengan image data (masih placeholder)
- **Fungsi:** Menghasilkan gambar menggunakan Imagen API

## Error Handling

Service class mengembalikan response dalam format:
```php
[
    'success' => true/false,
    'narrative|description|image_url' => 'content',
    'error' => 'error message if failed',
    'usage' => 'API usage metadata'
]
```

## Dependencies Yang Diperlukan

```bash
composer require guzzlehttp/guzzle
```

Atau tambahkan secara manual ke `composer.json`:
```json
{
    "require": {
        "guzzlehttp/guzzle": "^7.0"
    }
}
```

## Testing

Untuk test API endpoints, boleh gunakan tools seperti Postman atau curl:

```bash
# Test narrative generation
curl -X POST http://localhost:8000/api/messages/generate-narrative \
  -H "Content-Type: application/json" \
  -d '{"room_id": 1, "prompt": "Test prompt"}'

# Test image description
curl -X POST http://localhost:8000/api/messages/describe-image \
  -F "room_id=1" \
  -F "image=@path/to/your/image.jpg"
```

## Struktur Database

Pastikan migration untuk table `messages` sudah dijalankan:

```bash
php artisan migrate
```

Table `messages` mengandungi:
- `id`
- `room_id` (foreign key ke rooms)
- `sender_role` ('player', 'gm', 'system')
- `content` (nullable, untuk teks)
- `image_url` (nullable, untuk gambar)
- `created_at`, `updated_at`

## Next Steps

1. **Set up API Keys** - Dapatkan Google Gemini API key
2. **Test Basic Functions** - Cuba generate narrative dan describe image
3. **Implement Imagen** - Setup Google Cloud authentication untuk image generation
4. **Frontend Integration** - Integrasikan dengan React/Vue frontend
5. **Error Handling** - Tambah better error handling dan retry logic
6. **Caching** - Implement caching untuk mengurangkan API calls
7. **Rate Limiting** - Tambah rate limiting untuk API endpoints

## Sokongan

Jika ada issues:
1. Check API keys dalam `.env` file
2. Verify network connectivity ke Google APIs
3. Check Laravel logs (`storage/logs/laravel.log`)
4. Ensure proper file permissions untuk image uploads

---

**Dicipta untuk Google Hackathon 2026** 🚀