/**
 * Upload Routes
 * POST   /api/upload/mod-file      - Upload mod file
 * POST   /api/upload/mod-images    - Upload mod images
 * POST   /api/upload/store-image   - Upload store logo/banner
 * POST   /api/upload/sign-url      - Generate signed download URL
 * DELETE /api/upload/delete        - Delete file
 */

import { Router } from 'express';
import * as uploadController from './controller.js';
import authenticate from '../../middleware/auth.js';
import { upload, validateUpload } from '../../middleware/upload.js';

const router = Router();

router.use(authenticate);

// Upload fields configuration
const modFileUpload = upload.fields([{ name: 'file', maxCount: 1 }]);
const imagesUpload = upload.fields([{ name: 'images', maxCount: 10 }]);
const storeImageUpload = upload.fields([{ name: 'image', maxCount: 1 }]);

router.post('/mod-file', modFileUpload, validateUpload, uploadController.uploadModFile);
router.post('/mod-images', imagesUpload, validateUpload, uploadController.uploadModImages);
router.post('/store-image', storeImageUpload, validateUpload, uploadController.uploadStoreImage);
router.post('/sign-url', uploadController.generateSignedUrl);
router.delete('/delete', uploadController.deleteFile);

export default router;
