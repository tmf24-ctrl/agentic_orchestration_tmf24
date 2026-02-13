OpenAI Image Generation — Best Practices

Recommended model
- `gpt-image-1` is OpenAI's image generation model (current as of 2024–2025). Use it for creative and photorealistic image generation. If OpenAI releases newer image-specialized models, prefer the newest official image model.

Prompting best practices
- Start with the high-level intent: describe what you want in one clear sentence.
- Provide stylistic constraints: art style (photorealistic, oil painting, watercolor, pixel art), lens (50mm, wide-angle), lighting (golden hour, soft lighting), mood, and color palette.
- Specify composition and camera or art direction: subject placement, background, foreground elements, aspect ratio, and framing (close-up, portrait, full-body).
- Include reference details: exact objects, clothing, textures, and brand-safe text to avoid unwanted logos.
- Use negative prompts or exclusions where supported: indicate what to avoid (no text, no watermark, avoid noisy backgrounds).
- Keep prompts deterministic when you want reproducible results (lower temperature / seed when supported). Use precise, unambiguous language.

Example prompts
- Photorealistic portrait: "A photorealistic portrait of an elderly woman with silver hair and green eyes, soft golden hour lighting, shallow depth of field, 85mm lens, high detail skin texture, muted earth-tone background."
- Fantasy scene: "A wide-angle fantasy landscape with a floating island above a misty valley, bioluminescent plants, dramatic volumetric lighting, in the style of studio ghibli, vibrant colors."

Prompt engineering tips
- Break complex scenes into parts: generate background, subject, and accents separately if you need fine-grained control, then composite externally.
- Use multiple prompts and pick the best result; generate `n` variations per prompt.
- For text-heavy images, consider generating the base art and overlaying typography with a dedicated design tool.

Technical tips
- Aspect ratios: set `size` to match desired aspect ratio (e.g., `1024x1024`, `1024x512`).
- For large images or high quality, request the highest allowed size and do any post-processing (upscaling) if available.
- If the API returns URLs, download and archive the images alongside prompt metadata.
- Save prompt => image mapping in a separate metadata store. This CLI saves a `.txt` metadata file in `references/AI feedback/` for each generation.

Ethics and safety
- Avoid generating content that violates platform policies (explicit sexual content, hateful imagery, personal data misuse, or copyrighted logos). Review OpenAI policy and local regulations.
