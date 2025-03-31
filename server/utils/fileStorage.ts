import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { promisify } from 'util';

// Use promisified fs methods for better performance
const writeFileAsync = fs.promises.writeFile;
const unlinkAsync = fs.promises.unlink;
const existsAsync = promisify(fs.exists);
const statAsync = fs.promises.stat;

// File size limit (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// Cache for recently accessed files to avoid redundant disk operations
const fileCache = new Map<string, { buffer: Buffer, contentType: string, timestamp: number }>();
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes
const CACHE_MAX_SIZE = 50; // Maximum items in cache

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create a public directory for serving images
const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(publicUploadsDir)) {
  fs.mkdirSync(publicUploadsDir, { recursive: true });
}

/**
 * Clean expired items from the file cache
 */
function cleanupFileCache() {
  const now = Date.now();
  // Convert to array first to avoid iterator issues
  Array.from(fileCache.entries()).forEach(([key, value]) => {
    if (now - value.timestamp > CACHE_MAX_AGE) {
      fileCache.delete(key);
    }
  });
}

/**
 * Save a file to disk and return the file path
 * @param base64Data Base64 encoded data URI
 * @param filename Optional filename
 * @returns The path to the saved file
 */
export async function saveFile(base64Data: string, filename?: string): Promise<string> {
  // Periodically clean up the file cache
  cleanupFileCache();
  
  try {
    // Extract the base64 data from the data URI
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 data URI');
    }

    // Extract content type and base64 data
    const contentType = matches[1];
    const base64 = matches[2];
    const buffer = Buffer.from(base64, 'base64');

    // Check file size
    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // Generate a unique filename if not provided
    const extension = contentType.split('/')[1] || 'webp'; // default to webp if extension cannot be determined
    const finalFilename = filename || `${randomUUID()}.${extension}`;
    
    // Save file to both uploads (original) and public/uploads (for serving)
    const filePath = path.join(uploadsDir, finalFilename);
    const publicFilePath = path.join(publicUploadsDir, finalFilename);
    
    // Use Promise.all to write files concurrently for better performance
    await Promise.all([
      writeFileAsync(filePath, buffer),
      writeFileAsync(publicFilePath, buffer)
    ]);
    
    // Add to cache for potential reuse
    if (fileCache.size >= CACHE_MAX_SIZE) {
      // If cache is full, remove the oldest entry
      const oldestKey = Array.from(fileCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      fileCache.delete(oldestKey);
    }
    fileCache.set(finalFilename, { buffer, contentType, timestamp: Date.now() });
    
    // Return public path for serving
    return `/uploads/${finalFilename}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Delete a file from disk
 * @param filePath Path to the file to delete
 * @returns True if the file was deleted, false otherwise
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    // Extract the filename from the path
    const filename = path.basename(filePath);
    
    // Delete from cache if exists
    fileCache.delete(filename);
    
    // Delete from both directories
    const originalPath = path.join(uploadsDir, filename);
    const publicPath = path.join(publicUploadsDir, filename);
    
    const [originalExists, publicExists] = await Promise.all([
      existsAsync(originalPath),
      existsAsync(publicPath)
    ]);
    
    const deletePromises = [];
    
    if (originalExists) {
      deletePromises.push(unlinkAsync(originalPath));
    }
    
    if (publicExists) {
      deletePromises.push(unlinkAsync(publicPath));
    }
    
    // Execute all deletes concurrently
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Get file stats for a given path
 * @param filePath Path to the file
 * @returns File statistics or null if file doesn't exist
 */
export async function getFileStats(filePath: string): Promise<{ size: number, modifiedTime: Date } | null> {
  try {
    const filename = path.basename(filePath);
    const fullPath = path.join(publicUploadsDir, filename);
    
    if (await existsAsync(fullPath)) {
      const stats = await statAsync(fullPath);
      return {
        size: stats.size,
        modifiedTime: stats.mtime
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting file stats:', error);
    return null;
  }
}