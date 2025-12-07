import mongoose, { Schema, Model } from 'mongoose';
import { IRealTimeLog } from '../interfaces';

const RealTimeLogSchema: Schema = new Schema<IRealTimeLog>(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    audioChunksReceived: {
      type: Number,
      default: 0,
    },
    transcriptionEvents: {
      type: [String],
      default: [],
    },
    partialTranscriptions: {
      type: [String],
      default: [],
    },
    finalTranscription: {
      type: String,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
    duration: {
      type: Number,
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

export const RealTimeLogModel: Model<IRealTimeLog> =
  mongoose.models.RealTimeLog ||
  mongoose.model<IRealTimeLog>('RealTimeLog', RealTimeLogSchema);

RealTimeLogSchema.index({ sessionId: 1, createdAt: -1 });
RealTimeLogSchema.index({ createdAt: -1 });

