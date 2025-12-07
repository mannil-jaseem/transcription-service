import { logger } from '../utils/logger';
import {
  ITranscription,
  SaveTranscriptionData,
  PaginatedResponse,
} from '../interfaces';
import { TranscriptionModel } from '../models/transcription.model';

export const saveTranscription = async (
  data: SaveTranscriptionData
): Promise<ITranscription> => {
  try {
    const transcriptionData = {
      ...data,
      createdAt: data.createdAt || new Date(),
    };

    const transcription = new TranscriptionModel(transcriptionData);
    const savedTranscription = await transcription.save();

    logger.info(
      `Transcription saved successfully with ID: ${savedTranscription._id}`
    );
    return savedTranscription;
  } catch (error) {
    logger.error('Error saving transcription:', error);
    throw error;
  }
};

export const listTranscriptions = async (
  source?: 'azure' | 'mock',
  page: number = 1,
  limit: number = 10,
  daysBack: number = 30
): Promise<PaginatedResponse<ITranscription>> => {
  try {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysBack);

    const filter: any = {
      createdAt: { $gte: dateThreshold },
    };
    
    if (source) {
      filter.source = source;
    }

    const pageNumber = Math.max(1, Math.floor(page));
    const limitNumber = Math.max(1, Math.min(100, Math.floor(limit)));
    const skip = (pageNumber - 1) * limitNumber;

    logger.debug(
      `Fetching transcriptions - Page: ${pageNumber}, Limit: ${limitNumber}, Days Back: ${daysBack}${
        source ? `, Source: ${source}` : ''
      }`
    );

    const [transcriptions, total] = await Promise.all([
      TranscriptionModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .exec(),
      TranscriptionModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    logger.info(
      `Found ${transcriptions.length} transcription(s) out of ${total} total${
        source ? ` with source: ${source}` : ''
      } (Page ${pageNumber}/${totalPages})`
    );

    return {
      data: transcriptions,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
      },
    };
  } catch (error) {
    logger.error('Error listing transcriptions:', error);
    throw error;
  }
};

