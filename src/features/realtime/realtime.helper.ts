import { logger } from '../../utils/logger';
import { TranscriptionEvent } from '../../interfaces';

export const generateMockPartialTranscription = (
  chunkIndex: number,
  _sessionId: string
): string => {
  const mockPartials = [
    'Hello',
    'Hello world',
    'Hello world, this',
    'Hello world, this is',
    'Hello world, this is a',
    'Hello world, this is a test',
    'Hello world, this is a test of',
    'Hello world, this is a test of real-time',
    'Hello world, this is a test of real-time transcription',
  ];

  const index = Math.min(chunkIndex, mockPartials.length - 1);
  return mockPartials[index] || mockPartials[mockPartials.length - 1];
};

export const generateMockFinalTranscription = (_sessionId: string): string => {
  return 'Hello world, this is a test of real-time transcription.';
};

export const processAudioChunk = (
  chunkIndex: number,
  sessionId: string
): TranscriptionEvent => {
  logger.debug(
    `Processing audio chunk ${chunkIndex} for session ${sessionId}`
  );

  const partialText = generateMockPartialTranscription(chunkIndex, sessionId);

  return {
    partial: partialText,
    sessionId,
    timestamp: new Date(),
  };
};

export const generateFinalTranscription = (
  sessionId: string
): TranscriptionEvent => {
  logger.debug(`Generating final transcription for session ${sessionId}`);

  const finalText = generateMockFinalTranscription(sessionId);

  return {
    final: finalText,
    sessionId,
    timestamp: new Date(),
  };
};

