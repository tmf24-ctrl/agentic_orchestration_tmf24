const { Storage } = require('@google-cloud/storage');
const path = require('path');

async function uploadToGCS(localPath, bucketName, destName) {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS must be set to a service account JSON file');
  }
  const storage = new Storage();
  const bucket = storage.bucket(bucketName);

  await bucket.upload(localPath, { destination: destName });
  const file = bucket.file(destName);

  // create a signed URL valid for 15 minutes
  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000
  });

  return { gcsUri: `gs://${bucketName}/${destName}`, signedUrl };
}

module.exports = { uploadToGCS };
