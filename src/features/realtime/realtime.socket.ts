import { Server as SocketIOServer, Socket } from 'socket.io';
import { generateUUID } from '../../common/common';
import { logger } from '../../utils/logger';
import { realTimeService } from './realtime.service';
import { AudioChunkEvent } from '../../interfaces';

export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  AUDIO_CHUNK: 'audio-chunk',
  TRANSCRIPTION_PARTIAL: 'transcription-partial',
  TRANSCRIPTION_FINAL: 'transcription-final',
  SESSION_START: 'session-start',
  SESSION_END: 'session-end',
  ERROR: 'error',
} as const;

export const initializeRealtimeSocket = (io: SocketIOServer): void => {
  io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);

    const sessionId = generateUUID();
    let chunkIndex = 0;

    (socket as any).sessionId = sessionId;

    socket.on(SOCKET_EVENTS.SESSION_START, async () => {
      try {
        logger.info(`Session started: ${sessionId} for socket ${socket.id}`);
        await realTimeService.createSession(sessionId);
        socket.emit(SOCKET_EVENTS.SESSION_START, { sessionId });
      } catch (error) {
        logger.error(`Error starting session ${sessionId}:`, error);
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Failed to start session',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    socket.on(SOCKET_EVENTS.AUDIO_CHUNK, async (data: AudioChunkEvent) => {
      try {
        if (!data || !data.chunk) {
          socket.emit(SOCKET_EVENTS.ERROR, {
            message: 'Invalid audio chunk data',
          });
          return;
        }

        logger.debug(
          `Received audio chunk ${chunkIndex} for session ${sessionId}`
        );

        const transcriptionEvent = await realTimeService.processChunk(
          chunkIndex,
          sessionId
        );

        socket.emit(SOCKET_EVENTS.TRANSCRIPTION_PARTIAL, {
          partial: transcriptionEvent.partial,
          sessionId: transcriptionEvent.sessionId,
          timestamp: transcriptionEvent.timestamp,
        });

        chunkIndex++;
      } catch (error) {
        logger.error(
          `Error processing audio chunk for session ${sessionId}:`,
          error
        );
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Failed to process audio chunk',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    socket.on(SOCKET_EVENTS.SESSION_END, async () => {
      try {
        logger.info(`Session ending: ${sessionId} for socket ${socket.id}`);

        const finalEvent = await realTimeService.finalizeTranscription(
          sessionId
        );

        socket.emit(SOCKET_EVENTS.TRANSCRIPTION_FINAL, {
          final: finalEvent.final,
          sessionId: finalEvent.sessionId,
          timestamp: finalEvent.timestamp,
        });

        socket.emit(SOCKET_EVENTS.SESSION_END, {
          sessionId,
          message: 'Session ended successfully',
        });
      } catch (error) {
        logger.error(`Error ending session ${sessionId}:`, error);
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Failed to end session',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
      try {
        logger.info(`Client disconnected: ${socket.id}, session: ${sessionId}`);

        const log = await realTimeService.getLogBySessionId(sessionId);
        if (log && !log.endedAt) {
          await realTimeService.finalizeTranscription(sessionId);
          logger.info(`Auto-finalized session ${sessionId} on disconnect`);
        }
      } catch (error) {
        logger.error(
          `Error handling disconnect for session ${sessionId}:`,
          error
        );
      }
    });
  });

  logger.info('Real-time transcription socket handlers initialized');
};

