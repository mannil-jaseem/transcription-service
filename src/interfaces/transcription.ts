import { Document } from 'mongoose';

export interface ITranscription extends Document {
  audioUrl: string;
  transcription: string;
  source: 'azure' | 'mock';
  createdAt: Date;
}

export interface SaveTranscriptionData {
  audioUrl: string;
  transcription: string;
  source: 'azure' | 'mock';
  createdAt?: Date;
}

