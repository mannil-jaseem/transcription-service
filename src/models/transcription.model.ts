import mongoose, { Schema, Model } from 'mongoose';
import { ITranscription } from '../interfaces';

const TranscriptionSchema: Schema = new Schema<ITranscription>(
  {
    audioUrl: {
      type: String,
      required: true,
      index: true,
    },
    transcription: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ['azure', 'mock'],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const TranscriptionModel: Model<ITranscription> =
  mongoose.models.Transcription ||
  mongoose.model<ITranscription>('Transcription', TranscriptionSchema);

TranscriptionSchema.index({ source: 1, createdAt: -1 });
TranscriptionSchema.index({ createdAt: -1 });

