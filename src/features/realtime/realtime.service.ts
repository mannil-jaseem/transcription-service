import {
  IRealTimeLog,
  SaveRealTimeLogData,
  TranscriptionEvent,
} from '../../interfaces';
import { RealTimeLogModel } from '../../models/realtimeLog.model';
import { logger } from '../../utils/logger';
import {
  processAudioChunk,
  generateFinalTranscription,
} from './realtime.helper';

export class RealTimeService {
  async processChunk(
    chunkIndex: number,
    sessionId: string
  ): Promise<TranscriptionEvent> {
    try {
      logger.debug(
        `RealTimeService: Processing chunk ${chunkIndex} for session ${sessionId}`
      );

      const transcriptionEvent = processAudioChunk(chunkIndex, sessionId);

      await this.updateLogWithPartial(sessionId, transcriptionEvent.partial!);

      return transcriptionEvent;
    } catch (error) {
      logger.error(
        `Error processing chunk for session ${sessionId}:`,
        error
      );
      throw error;
    }
  }

  async finalizeTranscription(
    sessionId: string
  ): Promise<TranscriptionEvent> {
    try {
      logger.debug(`RealTimeService: Finalizing transcription for session ${sessionId}`);

      const finalEvent = generateFinalTranscription(sessionId);

      await this.updateLogWithFinal(sessionId, finalEvent.final!);

      return finalEvent;
    } catch (error) {
      logger.error(
        `Error finalizing transcription for session ${sessionId}:`,
        error
      );
      throw error;
    }
  }

  async createSession(sessionId: string): Promise<IRealTimeLog> {
    try {
      logger.debug(`RealTimeService: Creating session ${sessionId}`);

      const logData: SaveRealTimeLogData = {
        sessionId,
        audioChunksReceived: 0,
        transcriptionEvents: [],
        partialTranscriptions: [],
        startedAt: new Date(),
      };

      const log = new RealTimeLogModel(logData);
      const savedLog = await log.save();

      logger.info(`Session ${sessionId} created successfully`);
      return savedLog;
    } catch (error) {
      logger.error(`Error creating session ${sessionId}:`, error);
      throw error;
    }
  }

  private async updateLogWithPartial(
    sessionId: string,
    partialText: string
  ): Promise<void> {
    try {
      await RealTimeLogModel.findOneAndUpdate(
        { sessionId },
        {
          $inc: { audioChunksReceived: 1 },
          $push: {
            transcriptionEvents: `partial:${partialText}`,
            partialTranscriptions: partialText,
          },
        },
        { upsert: false }
      );
    } catch (error) {
      logger.error(
        `Error updating log with partial for session ${sessionId}:`,
        error
      );
    }
  }

  private async updateLogWithFinal(
    sessionId: string,
    finalText: string
  ): Promise<void> {
    try {
      const endedAt = new Date();
      const log = await RealTimeLogModel.findOne({ sessionId });

      if (log) {
        const duration = endedAt.getTime() - log.startedAt.getTime();

        await RealTimeLogModel.findOneAndUpdate(
          { sessionId },
          {
            $set: {
              finalTranscription: finalText,
              endedAt,
              duration,
            },
            $push: {
              transcriptionEvents: `final:${finalText}`,
            },
          }
        );

        logger.info(
          `Session ${sessionId} finalized. Duration: ${duration}ms`
        );
      }
    } catch (error) {
      logger.error(
        `Error updating log with final for session ${sessionId}:`,
        error
      );
    }
  }

  async getLogBySessionId(sessionId: string): Promise<IRealTimeLog | null> {
    try {
      return await RealTimeLogModel.findOne({ sessionId }).exec();
    } catch (error) {
      logger.error(`Error fetching log for session ${sessionId}:`, error);
      throw error;
    }
  }
}

export const realTimeService = new RealTimeService();

