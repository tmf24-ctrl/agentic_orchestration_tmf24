Gemini 3 (overview and recommended upload flow)

Overview
- Gemini is Google's advanced multimodal model family (Gemini 3 referenced here). Google typically exposes models via the Generative AI APIs (Google Cloud). API surface and exact endpoints can change; follow the Google Cloud docs for the most up-to-date endpoints and authentication flows.

Main points for file uploads (images / video)
- Google services generally expect large binaries to be hosted in a location the model can access (for example, Google Cloud Storage). Upload your image/video to a GCS bucket, make it accessible to the service request (signed URL or internal access), then include a reference (URI) in the API request payload.

Recommended flow (Node.js)
1. Upload local file to Google Cloud Storage (GCS). Use `@google-cloud/storage` or `gcloud` CLI. Upload the file and, if needed, create a signed URL or make the object readable by the service account.
2. Call the Gemini 3 model endpoint (models.generate or models.predict) and include an input that references the GCS URI. For multimodal inputs, the request body typically allows an `input` array with items that point to content URIs or include mime-typed content.
3. The model will return text or structured output. Save that text into your workspace under `references/AI feedback/` as a `.txt` or other structured artifact.

Example (conceptual curl)
Note: Replace placeholders with your project's values. Google APIs may require a specific endpoint such as `https://generativelanguage.googleapis.com/v1alpha2/models/{model}:predict` or a similar `generate` endpoint.

curl -X POST \
  -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{
      "input": [{
        "mime_type": "image/png",
        "uri": "gs://your-bucket/path/to/image.png"
      }],
      "params": {"temperature": 0.2}
    }]
  }' \
  "https://generativelanguage.googleapis.com/v1/models/REPLACE_WITH_MODEL:predict"

Node.js (conceptual)
1. Upload file to GCS using `@google-cloud/storage`.
2. Call the REST endpoint with an auth token from ADC (Application Default Credentials) or IAM.

Important notes
- Authentication: use a service account with the correct IAM roles and set `GOOGLE_APPLICATION_CREDENTIALS` to the JSON key file OR use ADC with `gcloud auth application-default login` for testing.
- File sizes and formats: check the model documentation for supported formats and limits. For large videos, consider pre-processing (extract frames, generate transcripts) and send only what the model needs.
- Streaming vs batch: video analysis may be done by processing frames or sending references and then requesting a video understanding job.

Saving model responses
- After you receive the model response, save it as a file in `references/AI feedback/`.
- Use a predictable filename tied to the upload (e.g., `<timestamp>-<originalname>-response.txt`). This repository's CLI demonstrates saving responses in that folder.

References
- Google Cloud Generative AI docs (search for "Generative AI API" or "Gemini")
