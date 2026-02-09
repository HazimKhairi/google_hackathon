<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class ImageGenerationService
{
    /**
     * Generate image using ApiFree Nano Banana PRO EDIT (async: submit + poll)
     * Includes retry logic for rate limiting
     */
    public static function generateWithApiFree(string $prompt, int $retryCount = 0): ?string
    {
        $apiKey = env('APIFREE_API_KEY');

        if (!$apiKey) {
            \Log::info('[ApiFree] API key not found, skipping');
            return null;
        }

        try {
            \Log::info('[ApiFree] Submitting image generation for: ' . $prompt . ($retryCount > 0 ? " (retry {$retryCount})" : ''));

            // Add delay between retries to avoid rate limiting
            if ($retryCount > 0) {
                sleep(5 * $retryCount);
            }

            // Step 1: Submit request
            $submitResponse = Http::timeout(15)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post('https://api.apifree.ai/v1/image/submit', [
                    'model' => 'google/nano-banana-pro/edit',
                    'prompt' => $prompt,
                    'aspect_ratio' => '1:1',
                    'resolution' => '1K',
                ]);

            if (!$submitResponse->successful()) {
                \Log::warning('[ApiFree] Submit failed: ' . $submitResponse->status() . ' - ' . $submitResponse->body());
                return null;
            }

            $submitData = $submitResponse->json();

            if (($submitData['code'] ?? 0) !== 200) {
                \Log::warning('[ApiFree] Submit error: ' . json_encode($submitData));
                return null;
            }

            $requestId = $submitData['resp_data']['request_id'] ?? null;

            if (!$requestId) {
                \Log::warning('[ApiFree] No request_id in response');
                return null;
            }

            \Log::info('[ApiFree] Request submitted, ID: ' . $requestId);

            // Step 2: Poll for result (max 90 seconds, check every 3 seconds)
            $maxAttempts = 30;
            for ($i = 0; $i < $maxAttempts; $i++) {
                sleep(3);

                $resultResponse = Http::timeout(10)
                    ->withHeaders([
                        'Authorization' => 'Bearer ' . $apiKey,
                    ])
                    ->get("https://api.apifree.ai/v1/image/{$requestId}/result");

                if (!$resultResponse->successful()) {
                    \Log::warning('[ApiFree] Poll failed: ' . $resultResponse->status());
                    continue;
                }

                $resultData = $resultResponse->json();
                $status = $resultData['resp_data']['status'] ?? 'unknown';

                if ($status === 'success') {
                    $imageList = $resultData['resp_data']['image_list'] ?? [];
                    if (!empty($imageList)) {
                        $imageUrl = $imageList[0];
                        \Log::info('[ApiFree] Image generated successfully: ' . $imageUrl);
                        return $imageUrl;
                    }
                    \Log::warning('[ApiFree] Success but empty image_list');
                    return null;
                }

                if ($status === 'error' || $status === 'failed') {
                    \Log::error('[ApiFree] Generation failed. Full response: ' . json_encode($resultData));

                    // Retry once if rate limited
                    if ($retryCount < 1) {
                        \Log::info('[ApiFree] Retrying after failure...');
                        return self::generateWithApiFree($prompt, $retryCount + 1);
                    }
                    return null;
                }

                \Log::info("[ApiFree] Status: {$status}, attempt {$i}/{$maxAttempts}");
            }

            \Log::warning('[ApiFree] Timed out after polling');
            return null;

        } catch (\Exception $e) {
            \Log::error('[ApiFree] Error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Generate image using Replicate (Better quality, requires API token)
     */
    public static function generateWithReplicate(string $prompt): ?string
    {
        $apiToken = env('REPLICATE_API_TOKEN');

        if (!$apiToken) {
            return null;
        }

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $apiToken,
                    'Content-Type' => 'application/json',
                ])
                ->post('https://api.replicate.com/v1/predictions', [
                    'version' => '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
                    'input' => [
                        'prompt' => $prompt,
                        'width' => 512,
                        'height' => 512,
                        'num_outputs' => 1,
                    ]
                ]);

            if ($response->successful()) {
                $imageUrl = $response->json()['output'][0] ?? null;
                if ($imageUrl) {
                    return $imageUrl;
                }
            }

            return null;

        } catch (\Exception $e) {
            \Log::error('Replicate failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Generate a placeholder SVG when all APIs fail
     */
    public static function generatePlaceholder(string $prompt): string
    {
        // Return a nice placeholder SVG as data URL
        $shortPrompt = substr($prompt, 0, 40);
        $encoded = rawurlencode($shortPrompt);
        return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512'%3E%3Crect fill='%23162029' width='512' height='512'/%3E%3Ctext fill='%23E5B96F' font-family='serif' font-size='18' x='50%25' y='45%25' text-anchor='middle'%3EImage Generation%3C/text%3E%3Ctext fill='%23E5B96F' font-family='serif' font-size='18' x='50%25' y='55%25' text-anchor='middle'%3EIn Progress...%3C/text%3E%3C/svg%3E";
    }

    /**
     * Generate image (auto-select best available service)
     * Priority: ApiFree Nano Banana -> Replicate -> Placeholder
     */
    public static function generate(string $prompt, string $seed = null): string
    {
        // Priority 1: ApiFree Nano Banana PRO EDIT
        if (env('APIFREE_API_KEY')) {
            $result = self::generateWithApiFree($prompt);
            if ($result) {
                return $result;
            }
        }

        // Priority 2: Replicate (paid)
        if (env('REPLICATE_API_TOKEN')) {
            $result = self::generateWithReplicate($prompt);
            if ($result) {
                return $result;
            }
        }

        // Fallback: placeholder image (Pollinations is broken)
        \Log::warning('[ImageGen] All APIs failed for: ' . $prompt);
        return self::generatePlaceholder($prompt);
    }
}
