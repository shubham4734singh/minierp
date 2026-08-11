import { Request, Response } from 'express';
import cloudinary from '../utils/cloudinary';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'minierp_products',
    });

    res.json({ url: result.secure_url });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ error: error?.message || 'Failed to upload image' });
  }
};
