import {
  BlobSASPermissions,
  BlobSASSignatureValues,
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from '@azure/storage-blob';

let blobServiceClient: BlobServiceClient;
let sharedKeyCredential: StorageSharedKeyCredential;

function getCredential(): StorageSharedKeyCredential {
  if (!sharedKeyCredential) {
    const accountName = process.env.STORAGE_ACCOUNT_NAME!;
    const accountKey = process.env.STORAGE_ACCOUNT_KEY!;
    sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
  }
  return sharedKeyCredential;
}

function getServiceClient(): BlobServiceClient {
  if (!blobServiceClient) {
    const accountName = process.env.STORAGE_ACCOUNT_NAME!;
    const credential = getCredential();
    blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      credential
    );
  }
  return blobServiceClient;
}

/**
 * Generate a SAS URL for the client to upload a file directly to Blob Storage.
 * Token is valid for 1 hour with create+write permissions.
 */
export function generateUploadSasUrl(blobName: string): string {
  const accountName = process.env.STORAGE_ACCOUNT_NAME!;
  const containerName = process.env.STORAGE_CONTAINER || 'book-files';

  const sasOptions: BlobSASSignatureValues = {
    containerName,
    blobName,
    permissions: BlobSASPermissions.parse('cw'), // create + write
    expiresOn: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  };

  const sasToken = generateBlobSASQueryParameters(sasOptions, getCredential()).toString();
  return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
}

/**
 * Generate a SAS URL for the client to read/download a file from Blob Storage.
 * Token is valid for 24 hours with read permission.
 */
export function generateReadSasUrl(blobName: string): string {
  const accountName = process.env.STORAGE_ACCOUNT_NAME!;
  const containerName = process.env.STORAGE_CONTAINER || 'book-files';

  const sasOptions: BlobSASSignatureValues = {
    containerName,
    blobName,
    permissions: BlobSASPermissions.parse('r'), // read only
    expiresOn: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  };

  const sasToken = generateBlobSASQueryParameters(sasOptions, getCredential()).toString();
  return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
}

/**
 * Delete a blob from storage.
 */
export async function deleteBlob(blobName: string): Promise<void> {
  const containerName = process.env.STORAGE_CONTAINER || 'book-files';
  const containerClient = getServiceClient().getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);
  await blobClient.deleteIfExists();
}
