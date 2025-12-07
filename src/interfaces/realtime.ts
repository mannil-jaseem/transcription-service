import { Document } from 'mongoose';

export interface IRealTimeLog extends Document {
  sessionId: string;
  audioChunksReceived: number;
  transcriptionEvents: string[];
  partialTranscriptions: string[];
  finalTranscription?: string;
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  createdAt: Date;
}

export interface SaveRealTimeLogData {
  sessionId: string;
  audioChunksReceived?: number;
  transcriptionEvents?: string[];
  partialTranscriptions?: string[];
  finalTranscription?: string;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  createdAt?: Date;
}

export interface AudioChunkEvent {
  chunk: string | Buffer;
  chunkIndex: number;
  sessionId: string;
}

export interface TranscriptionEvent {
  partial?: string;
  final?: string;
  sessionId: string;
  timestamp: Date;
}

