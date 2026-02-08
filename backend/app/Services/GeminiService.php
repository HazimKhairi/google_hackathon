<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class GeminiService
{
    private $client;
    private $apiKey;
    private $baseUrl;

    public function __construct()
    {
        $this->client = new Client();
        $this->apiKey = env('GOOGLE_GEMINI_API_KEY');
        $this->baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/';
    }

    /**
     * Generate narrative text using Gemini AI
     * 
     * @param string $prompt User's prompt for story generation
     * @param array $context Additional context for the narrative
     * @return array
     */
    public function generateNarrative(string $prompt, array $context = []): array
    {
        try {
            $url = $this->baseUrl . 'gemini-pro:generateContent?key=' . $this->apiKey;
            
            $requestBody = [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => $this->buildNarrativePrompt($prompt, $context)
                            ]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'topK' => 40,
                    'topP' => 0.95,
                    'maxOutputTokens' => 1024,
                ]
            ];

            $response = $this->client->post($url, [
                'json' => $requestBody,
                'headers' => [
                    'Content-Type' => 'application/json',
                ]
            ]);

            $responseData = json_decode($response->getBody()->getContents(), true);
            
            if (isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
                return [
                    'success' => true,
                    'narrative' => $responseData['candidates'][0]['content']['parts'][0]['text'],
                    'usage' => $responseData['usageMetadata'] ?? null
                ];
            }

            return [
                'success' => false,
                'error' => 'Tidak ada teks yang dihasilkan dari Gemini API'
            ];

        } catch (RequestException $e) {
            Log::error('Gemini API request failed: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Gagal menghubungi Gemini API: ' . $e->getMessage()
            ];
        } catch (\Exception $e) {
            Log::error('Gemini service error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Ralat tidak dijangka: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Describe user uploaded image using Gemini Vision
     * 
     * @param string $imagePath Path to the image file
     * @param string $prompt Optional prompt for image analysis
     * @return array
     */
    public function describeUserImage(string $imagePath, string $prompt = ''): array
    {
        try {
            // Check if image exists
            if (!file_exists($imagePath)) {
                return [
                    'success' => false,
                    'error' => 'Fail gambar tidak dijumpai'
                ];
            }

            // Get image data and mime type
            $imageData = base64_encode(file_get_contents($imagePath));
            $mimeType = mime_content_type($imagePath);

            $url = $this->baseUrl . 'gemini-pro-vision:generateContent?key=' . $this->apiKey;
            
            $defaultPrompt = $prompt ?: 'Terangkan gambar ini dengan terperinci dalam konteks permainan RPG. Nyatakan apa yang kamu lihat, suasana, dan objek yang menarik untuk dijadikan elemen cerita.';
            
            $requestBody = [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => $defaultPrompt
                            ],
                            [
                                'inline_data' => [
                                    'mime_type' => $mimeType,
                                    'data' => $imageData
                                ]
                            ]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.4,
                    'topK' => 32,
                    'topP' => 1,
                    'maxOutputTokens' => 512,
                ]
            ];

            $response = $this->client->post($url, [
                'json' => $requestBody,
                'headers' => [
                    'Content-Type' => 'application/json',
                ]
            ]);

            $responseData = json_decode($response->getBody()->getContents(), true);
            
            if (isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
                return [
                    'success' => true,
                    'description' => $responseData['candidates'][0]['content']['parts'][0]['text'],
                    'image_path' => $imagePath,
                    'usage' => $responseData['usageMetadata'] ?? null
                ];
            }

            return [
                'success' => false,
                'error' => 'Tidak ada deskripsi yang dihasilkan dari Gemini Vision'
            ];

        } catch (RequestException $e) {
            Log::error('Gemini Vision API request failed: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Gagal menghubungi Gemini Vision API: ' . $e->getMessage()
            ];
        } catch (\Exception $e) {
            Log::error('Gemini Vision service error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Ralat tidak dijangka: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Generate image using Google Imagen API (Vertex AI)
     * 
     * @param string $prompt Prompt for image generation
     * @param array $options Additional options for image generation
     * @return array
     */
    public function generateImage(string $prompt, array $options = []): array
    {
        try {
            // For Vertex AI Imagen, we need different authentication (Service Account)
            // This is a simplified implementation - in production, use proper OAuth2
            
            $projectId = env('GOOGLE_CLOUD_PROJECT_ID');
            $location = env('GOOGLE_CLOUD_LOCATION', 'us-central1');
            
            if (!$projectId) {
                return [
                    'success' => false,
                    'error' => 'Google Cloud Project ID tidak dikonfigurasi'
                ];
            }

            $url = "https://{$location}-aiplatform.googleapis.com/v1/projects/{$projectId}/locations/{$location}/publishers/google/models/imagegeneration:predict";
            
            $requestBody = [
                'instances' => [
                    [
                        'prompt' => $prompt
                    ]
                ],
                'parameters' => [
                    'sampleCount' => $options['sample_count'] ?? 1,
                    'aspectRatio' => $options['aspect_ratio'] ?? '1:1',
                    'safetyFilterLevel' => 'block_some',
                    'includeRaiReason' => false
                ]
            ];

            // Note: This requires proper authentication with Service Account
            // For now, we'll return a placeholder implementation
            return [
                'success' => false,
                'error' => 'Imagen API belum dikonfigurasi sepenuhnya. Perlu Service Account authentication.',
                'todo' => 'Implement proper Google Cloud authentication'
            ];

        } catch (\Exception $e) {
            Log::error('Imagen API service error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Ralat Imagen API: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Build narrative prompt with context
     * 
     * @param string $userPrompt
     * @param array $context
     * @return string
     */
    private function buildNarrativePrompt(string $userPrompt, array $context = []): string
    {
        $systemPrompt = "Kamu adalah seorang Game Master (GM) yang mahir dalam permainan role-playing. Tugas kamu adalah mencipta naratif yang menarik berdasarkan input pemain. ";
        $systemPrompt .= "Gunakan gaya bahasa yang deskriptif dan imersif. Sertakan dialog, deskripsi suasana, dan elemen yang membolehkan pemain berinteraksi. ";
        $systemPrompt .= "Jawab dalam Bahasa Malaysia/Melayu.\n\n";
        
        if (!empty($context)) {
            $systemPrompt .= "Konteks permainan semasa:\n";
            foreach ($context as $key => $value) {
                $systemPrompt .= "- {$key}: {$value}\n";
            }
            $systemPrompt .= "\n";
        }
        
        $systemPrompt .= "Prompt pemain: " . $userPrompt;
        
        return $systemPrompt;
    }
}