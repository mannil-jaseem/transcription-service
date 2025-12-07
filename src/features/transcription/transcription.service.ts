import { downloadAndTranscribe, downloadAndTranscribeAzure } from './transcription.helper';
import { saveTranscription, listTranscriptions } from '../../shared/mongoCrud';
import { ITranscription, PaginatedResponse } from '../../interfaces';
import { logger } from '../../utils/logger';

export class TranscriptionService {
  async processTranscription(audioUrl: string): Promise<ITranscription> {
    try {
      logger.info(`Processing transcription for URL: ${audioUrl}`);

      const transcribedText = await downloadAndTranscribe(audioUrl);

      const savedTranscription = await saveTranscription({
        audioUrl,
        transcription: transcribedText,
        source: 'mock',
      });

      logger.info(
        `Transcription processed successfully. ID: ${savedTranscription._id}`
      );

      return savedTranscription;
    } catch (error) {
      logger.error(`Error processing transcription for URL ${audioUrl}:`, error);
      throw error;
    }
  }

  async processAzureTranscription(audioUrl: string): Promise<ITranscription> {
    try {
      logger.info(`Processing Azure transcription for URL: ${audioUrl}`);

      const transcribedText = await downloadAndTranscribeAzure(audioUrl);

      const savedTranscription = await saveTranscription({
        audioUrl,
        transcription: transcribedText,
        source: 'azure',
      });

      logger.info(
        `Azure transcription processed successfully. ID: ${savedTranscription._id}`
      );

      return savedTranscription;
    } catch (error) {
      logger.error(`Error processing Azure transcription for URL ${audioUrl}:`, error);
      throw error;
    }
  }

  async getTranscriptions(
    page: number = 1,
    limit: number = 10,
    source?: 'azure' | 'mock'
  ): Promise<PaginatedResponse<ITranscription>> {
    try {
      logger.info(
        `Fetching transcriptions - Page: ${page}, Limit: ${limit}${
          source ? `, Source: ${source}` : ''
        }`
      );

      const result = await listTranscriptions(source, page, limit, 30);

      return result;
    } catch (error) {
      logger.error('Error fetching transcriptions:', error);
      throw error;
    }
  }
}

export const transcriptionService = new TranscriptionService();

