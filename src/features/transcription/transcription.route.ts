import { Router } from 'express';
import { transcriptionController } from './transcription.controller';
import { validate } from '../../middlewares/validate.middleware';
import { transcriptionSchema, azureTranscriptionSchema } from './transcription.validation';

const router: Router = Router();

router.post(
  '/transcription',
  validate(transcriptionSchema),
  transcriptionController.createTranscription.bind(transcriptionController)
);

router.post(
  '/azure-transcription',
  validate(azureTranscriptionSchema),
  transcriptionController.createAzureTranscription.bind(transcriptionController)
);

router.get(
  '/transcriptions',
  transcriptionController.getTranscriptions.bind(transcriptionController)
);

export default router;

