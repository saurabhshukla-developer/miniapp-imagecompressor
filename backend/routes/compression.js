import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = join(__dirname, '../uploads');
const compressedDir = join(__dirname, '../compressed');

// Create directories if they don't exist
(async () => {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(compressedDir, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
})();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Compression endpoint
router.post('/image', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload error' });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const {
      quality = 80,
      maxWidth,
      maxHeight,
      format = 'jpeg',
      targetSize
    } = req.body;

    const inputPath = req.file.path;
    const outputFilename = `compressed-${uuidv4()}.${format}`;
    const outputPath = join(compressedDir, outputFilename);

    // Get original image metadata
    const metadata = await sharp(inputPath).metadata();
    let width = metadata.width;
    let height = metadata.height;

    // Calculate dimensions if maxWidth or maxHeight is provided
    if (maxWidth || maxHeight) {
      const maxW = maxWidth ? parseInt(maxWidth) : width;
      const maxH = maxHeight ? parseInt(maxHeight) : height;
      
      if (width > maxW || height > maxH) {
        const ratio = Math.min(maxW / width, maxH / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
    }

    // Start with the specified quality
    let compressionQuality = parseInt(quality);
    
    // Create sharp instance with initial settings
    let sharpInstance = sharp(inputPath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });

    // Apply format-specific settings
    const formatOptions = {};
    if (format === 'jpeg' || format === 'jpg') {
      formatOptions.quality = compressionQuality;
      formatOptions.mozjpeg = true;
      sharpInstance = sharpInstance.jpeg(formatOptions);
    } else if (format === 'png') {
      formatOptions.quality = compressionQuality;
      formatOptions.compressionLevel = 9;
      sharpInstance = sharpInstance.png(formatOptions);
    } else if (format === 'webp') {
      formatOptions.quality = compressionQuality;
      sharpInstance = sharpInstance.webp(formatOptions);
    }

    // If target size is specified, adjust quality iteratively
    if (targetSize) {
      const targetSizeBytes = parseInt(targetSize) * 1024; // Convert KB to bytes
      let currentSize = 0;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        await sharpInstance.toFile(outputPath);
        const stats = await fs.stat(outputPath);
        currentSize = stats.size;

        if (currentSize <= targetSizeBytes) {
          break;
        }

        // Reduce quality by 10% each iteration
        compressionQuality = Math.max(10, compressionQuality - 10);
        
        // Recreate sharp instance with new quality
        sharpInstance = sharp(inputPath)
          .resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true
          });

        if (format === 'jpeg' || format === 'jpg') {
          sharpInstance = sharpInstance.jpeg({ quality: compressionQuality, mozjpeg: true });
        } else if (format === 'png') {
          sharpInstance = sharpInstance.png({ quality: compressionQuality, compressionLevel: 9 });
        } else if (format === 'webp') {
          sharpInstance = sharpInstance.webp({ quality: compressionQuality });
        }

        attempts++;
      }
    } else {
      await sharpInstance.toFile(outputPath);
    }

    // Get compressed file stats (for logging purposes)
    const compressedStats = await fs.stat(outputPath);
    const originalStats = await fs.stat(inputPath);
    
    // Log compression info
    const compressionRatio = ((1 - compressedStats.size / originalStats.size) * 100).toFixed(2);
    console.log(`Compressed: ${req.file.originalname} - ${compressionRatio}% reduction`);

    // Send compressed image
    res.download(outputPath, `compressed-${req.file.originalname}`, async (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      
      // Clean up files after download
      try {
        await fs.unlink(inputPath);
        await fs.unlink(outputPath);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    });

  } catch (error) {
    console.error('Compression error:', error);
    res.status(500).json({ error: 'Failed to compress image', details: error.message });
    
    // Clean up on error
    try {
      if (req.file) {
        await fs.unlink(req.file.path);
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  }
});

// Get compression history (not available - database removed)
router.get('/history', async (req, res) => {
  res.json({ 
    message: 'Compression history is not available. Database has been removed from this project.',
    history: []
  });
});

export default router;

