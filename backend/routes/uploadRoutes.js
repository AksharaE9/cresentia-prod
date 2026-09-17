import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/videos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `video-${cleanName}-${uniqueSuffix}${ext}`);
  }
});

// Multer file filter for video formats
const fileFilter = (req, file, cb) => {
  const allowedExts = ['.mp4', '.webm', '.ogg', '.mov', '.mkv', '.avi'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (file.mimetype.startsWith('video/') || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files (MP4, WebM, OGG, MOV, MKV, AVI) are supported.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB max
  }
});

// Direct video file upload endpoint (admin / instructor)
router.post('/video-file', protect, authorizeRoles('admin', 'instructor'), (req, res) => {
  upload.single('video')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds 500MB limit.' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please select a video file to upload.' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const relativeUrl = `/uploads/videos/${req.file.filename}`;
    const fullUrl = `${protocol}://${host}${relativeUrl}`;

    res.status(201).json({
      message: 'Video uploaded successfully',
      url: fullUrl,
      relativeUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  });
});

// Cloudinary video upload endpoint (simplified - just returns the Cloudinary URL)
router.post('/videos', protect, authorizeRoles('admin'), (req, res) => {
  const { cloudinaryUrl } = req.body;

  if (!cloudinaryUrl) {
    return res.status(400).json({
      message: 'Cloudinary URL is required. Please upload your video to Cloudinary and provide the URL.'
    });
  }

  // Validate that it's a Cloudinary URL
  if (!cloudinaryUrl.includes('cloudinary.com')) {
    return res.status(400).json({
      message: 'Please provide a valid Cloudinary URL'
    });
  }

  res.status(201).json({ url: cloudinaryUrl });
});

// Helper endpoint to get Cloudinary upload instructions
router.get('/cloudinary-info', protect, authorizeRoles('admin'), (req, res) => {
  res.json({
    message: 'Video Upload Instructions',
    instructions: [
      '1. Go to https://cloudinary.com/console/media_library',
      '2. Upload your video file to Cloudinary',
      '3. Copy the video URL from Cloudinary',
      '4. Paste the URL in the Cloudinary URL field below',
      '5. Add video title and duration'
    ],
    cloudinaryUrl: 'https://cloudinary.com/console/media_library'
  });
});

export default router;
