# Cloudinary File Storage Documentation

This document explains how Cloudinary is integrated and used in this project for storing file data.

## Table of Contents

- [Overview](#overview)
- [Setup and Configuration](#setup-and-configuration)
- [Implementation Details](#implementation-details)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)

## Overview

Cloudinary is used as a cloud storage solution for storing files (images, audio, video, documents, etc.) in this application. The implementation uses Cloudinary's **raw file upload** feature, which allows storing any file type without Cloudinary processing it as an image.

### Key Features

- **Raw File Storage**: Files are stored as raw resources, preserving their original format
- **Stream-based Upload**: Uses Node.js streams for efficient memory handling
- **Folder Organization**: Files are organized in Cloudinary folders
- **Secure URLs**: Uses HTTPS secure URLs for file access
- **File Deletion**: Supports deleting files from Cloudinary

## Setup and Configuration

### 1. Install Dependencies

The following packages are required:

```bash
npm install cloudinary streamifier
```

- `cloudinary`: Official Cloudinary SDK for Node.js
- `streamifier`: Converts Node.js buffers to readable streams

### 2. Environment Variables

Configure Cloudinary credentials in your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_ACCESS_KEY=your_api_key
CLOUDINARY_SECRET_ACCESS_KEY=your_api_secret
```

### 3. Initialize Cloudinary

Cloudinary is initialized in `server.js`:

```javascript
import * as cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_ACCESS_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_ACCESS_KEY,
  secure: true, // Use HTTPS
});
```

**Important**: Initialize Cloudinary before importing routes or controllers that use it.

## Implementation Details

### Helper Functions (`helpers/cloudinary.js`)

The project provides two main helper functions for Cloudinary operations:

#### 1. `uploadRaw(folder, buffer)`

Uploads a file buffer to Cloudinary as a raw resource.

**Parameters:**
- `folder` (string): The Cloudinary folder where the file will be stored
- `buffer` (Buffer): The file data as a Node.js Buffer

**Returns:** Promise that resolves to Cloudinary upload result

**Example:**
```javascript
const result = await uploadRaw("CORRUPTED_FOLDER", fileBuffer);
// result contains:
// - public_id: Unique identifier for the file
// - secure_url: HTTPS URL to access the file
// - url: HTTP URL (use secure_url instead)
// - format: File format
// - bytes: File size in bytes
```

**How it works:**
1. Creates an upload stream using `cloudinary.v2.uploader.upload_stream()`
2. Configures the upload with:
   - `folder`: Organizes files in Cloudinary
   - `resource_type: "raw"`: Treats file as raw data (not an image)
3. Converts the buffer to a readable stream using `streamifier`
4. Pipes the stream to Cloudinary's upload stream
5. Returns a Promise that resolves with the upload result

#### 2. `deleteRaw(public_id)`

Deletes a file from Cloudinary.

**Parameters:**
- `public_id` (string): The Cloudinary public_id of the file to delete

**Returns:** Promise that resolves to deletion result

**Example:**
```javascript
const result = await deleteRaw("CORRUPTED_FOLDER/abc123");
// result contains:
// - result: "ok" if successful
```

**How it works:**
1. Calls `cloudinary.v2.uploader.destroy()` with the public_id
2. Specifies `resource_type: "raw"` to match the upload type
3. Returns a Promise with the deletion result

## Usage Examples

### Uploading a File

Here's how files are uploaded in the `addImage` controller:

```javascript
import { uploadRaw } from "../helpers/cloudinary.js";
import { CORRUPTED_FOLDER } from "../constants.js";

// Assuming you have a file buffer (e.g., from multer)
const fileBuffer = req.file.buffer;

// Optional: Encrypt the buffer before uploading
// const encryptedBuffer = encryptRawBuffer(fileBuffer, publicKey);

// Upload to Cloudinary
const result = await uploadRaw(CORRUPTED_FOLDER, fileBuffer);

// Store the result in your database
await Image.create({
  user_id: req.user.id,
  public_id: result.public_id,  // Store for later deletion
  url: result.secure_url,        // Store for file access
  // ... other fields
});
```

### Deleting a File

Here's how files are deleted:

```javascript
import { deleteRaw } from "../helpers/cloudinary.js";

// Get the file record from database
const image = await Image.findById(imageId);

// Delete from Cloudinary
await deleteRaw(image.public_id);

// Delete from database
await image.remove();
```

### Error Handling

Always handle errors and clean up Cloudinary resources on failure:

```javascript
let publicId;
try {
  const result = await uploadRaw(CORRUPTED_FOLDER, buffer);
  publicId = result.public_id;
  
  // Save to database...
} catch (error) {
  // Clean up Cloudinary resource if upload succeeded but DB save failed
  if (publicId) {
    await deleteRaw(publicId);
  }
  throw error;
}
```

### Working with File Streams

The implementation uses streams for efficient memory usage:

```javascript
// Buffer → Stream → Cloudinary
streamifier.createReadStream(buffer).pipe(cld_upload_stream);
```

This approach:
- Prevents loading entire file into memory
- Works well with large files
- Provides better performance for concurrent uploads

## API Reference

### Cloudinary Configuration Options

When configuring Cloudinary, you can set:

- `cloud_name`: Your Cloudinary cloud name
- `api_key`: Your API key
- `api_secret`: Your API secret key
- `secure`: Boolean to force HTTPS URLs (recommended: `true`)

### Upload Options

The `uploadRaw` function uses these Cloudinary options:

- `folder`: String - Organizes files in folders
- `resource_type`: `"raw"` - Treats file as raw data

Additional options you can add:

```javascript
{
  folder: "my_folder",
  resource_type: "raw",
  public_id: "custom_id",        // Custom file identifier
  overwrite: true,                // Overwrite existing files
  tags: ["tag1", "tag2"],         // Add tags for organization
  context: { alt: "Description" } // Add metadata
}
```

### Upload Result Object

The upload function returns an object with:

```javascript
{
  public_id: "folder/filename",     // Unique identifier
  secure_url: "https://...",        // HTTPS URL (use this)
  url: "http://...",                // HTTP URL
  format: "pdf",                    // File format
  bytes: 12345,                     // File size
  created_at: "2024-01-01T00:00:00Z",
  // ... other Cloudinary metadata
}
```

## Best Practices

### 1. Use Secure URLs

Always use `secure_url` instead of `url` for HTTPS:

```javascript
const result = await uploadRaw(folder, buffer);
const fileUrl = result.secure_url; // ✅ Use this
// const fileUrl = result.url;     // ❌ Avoid HTTP
```

### 2. Store Public ID

Store the `public_id` in your database for easy deletion:

```javascript
await Image.create({
  public_id: result.public_id, // Required for deletion
  url: result.secure_url,
});
```

### 3. Error Handling

Implement proper error handling:

```javascript
try {
  const result = await uploadRaw(folder, buffer);
  // Process result
} catch (error) {
  console.error("Cloudinary upload error:", error);
  // Handle error appropriately
}
```

### 4. Clean Up on Failure

If database save fails after Cloudinary upload, delete the Cloudinary resource:

```javascript
let publicId;
try {
  const result = await uploadRaw(folder, buffer);
  publicId = result.public_id;
  await saveToDatabase(result);
} catch (error) {
  if (publicId) {
    await deleteRaw(publicId); // Clean up
  }
  throw error;
}
```

### 5. Folder Organization

Use meaningful folder names:

```javascript
// ✅ Good
const folder = "user_uploads";
const folder = "encrypted_files";
const folder = "documents/2024";

// ❌ Avoid
const folder = "folder1";
const folder = "";
```

### 6. File Size Considerations

- Cloudinary has file size limits (check your plan)
- For very large files, consider chunked uploads
- Monitor upload times and implement progress tracking if needed

### 7. Resource Type

Use `resource_type: "raw"` for:
- Documents (PDF, DOCX, etc.)
- Audio files (MP3, WAV, etc.)
- Video files (MP4, etc.)
- Any binary data

Use `resource_type: "image"` (default) only for images you want Cloudinary to process.

## Integration with Multer

This project uses Multer for handling file uploads:

```javascript
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

// In route handler
router.post("/file", upload.single("file"), async (req, res) => {
  const buffer = req.file.buffer; // Get buffer from multer
  const result = await uploadRaw(CORRUPTED_FOLDER, buffer);
  // ...
});
```

**Why memory storage?**
- Files are encrypted/processed before upload
- Buffer is needed for encryption operations
- Files are then streamed to Cloudinary

## Troubleshooting

### Common Issues

1. **"Invalid API credentials"**
   - Check your `.env` file has correct values
   - Verify credentials in Cloudinary dashboard

2. **"File too large"**
   - Check Cloudinary plan limits
   - Consider file compression before upload

3. **"Upload timeout"**
   - Check network connection
   - Consider implementing retry logic
   - For large files, use chunked uploads

4. **"Public ID already exists"**
   - Use `overwrite: true` in upload options
   - Or generate unique public_ids

### Debugging

Enable Cloudinary logging:

```javascript
cloudinary.v2.config({
  // ... config
  verbose: true, // Enable verbose logging
});
```

## Additional Resources

- [Cloudinary Node.js SDK Documentation](https://cloudinary.com/documentation/node_integration)
- [Cloudinary Raw Upload Guide](https://cloudinary.com/documentation/upload_images#raw_file_upload)
- [Streamifier Documentation](https://www.npmjs.com/package/streamifier)

## Summary

This implementation provides a robust solution for storing files in Cloudinary:

1. **Configuration**: Set up credentials in `.env` and initialize in `server.js`
2. **Upload**: Use `uploadRaw(folder, buffer)` to upload files
3. **Delete**: Use `deleteRaw(public_id)` to remove files
4. **Store Metadata**: Save `public_id` and `secure_url` in your database
5. **Error Handling**: Always clean up Cloudinary resources on failure

The stream-based approach ensures efficient memory usage and works well with large files and concurrent uploads.
