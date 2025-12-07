import { Request, Response, NextFunction } from 'express';
import { transcriptionService } from './transcription.service';
import { HTTP_STATUS } from '../../common/constants';
import { logger } from '../../utils/logger';

export class TranscriptionController {
  private readonly audioPath: string;

  constructor() {
    this.audioPath = '/home/jaseem/Desktop/jaseem/trancsribtion/audio/harvard.wav'
  }

  async createTranscription(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      let { audioUrl } = (req as any).validatedData.body;
      // replace audioUrl with audioPath for testing
      audioUrl = this.audioPath;
      logger.info(`TranscriptionController: Processing transcription for URL: ${audioUrl}`);

      const savedTranscription = await transcriptionService.processTranscription(
        audioUrl
      );

      // Format success response as per requirements
      const response = {
        success: true,
        message: 'Successfully transcribed data',
        data: {
          _id: savedTranscription._id,
        },
      };

      res.status(HTTP_STATUS.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  async createAzureTranscription(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      let { audioUrl } = (req as any).validatedData.body;
      // replace audioUrl with audioPath for testing
      audioUrl = this.audioPath;
      logger.info(`TranscriptionController: Processing Azure transcription for URL: ${audioUrl}`);

      const savedTranscription = await transcriptionService.processAzureTranscription(
        audioUrl
      );

      // Format success response as per requirements
      const response = {
        success: true,
        message: 'Successfully transcribed data',
        data: {
          _id: savedTranscription._id,
        },
      };

      res.status(HTTP_STATUS.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getTranscriptions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const source = req.query.source as 'mock' | 'azure' | undefined;
      
      const validSource = source && (source === 'mock' || source === 'azure') ? source : undefined;
      
      logger.info(
        `TranscriptionController: Fetching transcriptions - Page: ${page}, Limit: ${limit}${
          validSource ? `, Source: ${validSource}` : ''
        }`
      );

      const result = await transcriptionService.getTranscriptions(
        page,
        limit,
        validSource
      );

      const response = {
        success: true,
        message: 'Successfully fetched transcriptions',
        data: result.data,
        pagination: result.pagination,
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const transcriptionController = new TranscriptionController();

