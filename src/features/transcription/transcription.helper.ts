import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { downloadAudioAsBuffer } from '../../shared/downloadAudio';
import { logger } from '../../utils/logger';
import { retry } from '../../utils/retry';
import { AZURE_SPEECH } from '../../common/constants';

export const transcribeAudio = async (audioBuffer: Buffer): Promise<string> => {
  try {
    logger.debug(`Transcribing audio buffer of size: ${audioBuffer.length} bytes`);

    const transcribedText = 'transcribed text';

    logger.info('Audio transcribed successfully');
    return transcribedText;
  } catch (error) {
    logger.error('Error transcribing audio:', error);
    throw error;
  }
};

const validateAzureCredentials = (): { apiKey: string; region: string } => {
  const apiKey = process.env.AZURE_API_KEY;
  const region = process.env.AZURE_REGION;

  if (!apiKey || !region) {
    const missingCount = (!apiKey ? 1 : 0) + (!region ? 1 : 0);
    throw new Error(
      `Azure configuration incomplete: ${missingCount} required credential(s) missing`
    );
  }

  return { apiKey, region };
};

const createAzureConfigs = (
  apiKey: string,
  region: string,
  audioBuffer: Buffer,
  languages: string[]
) => {
  const speechConfig = sdk.SpeechConfig.fromSubscription(apiKey, region);
  const autoDetectConfig = sdk.AutoDetectSourceLanguageConfig.fromLanguages(languages);
  const audioConfig = sdk.AudioConfig.fromWavFileInput(audioBuffer);

  return { speechConfig, autoDetectConfig, audioConfig };
};

const performRecognition = (
  speechConfig: sdk.SpeechConfig,
  audioConfig: sdk.AudioConfig,
  autoDetectConfig: sdk.AutoDetectSourceLanguageConfig
): Promise<sdk.SpeechRecognitionResult> => {
  const recognizer = new (sdk.SpeechRecognizer as any)(
    speechConfig,
    audioConfig,
    autoDetectConfig
  );

  return new Promise<sdk.SpeechRecognitionResult>((resolve, reject) => {
    recognizer.recognizeOnceAsync(
      (result: sdk.SpeechRecognitionResult) => {
        recognizer.close();
        resolve(result);
      },
      (err: string) => {
        recognizer.close();
        reject(new Error(`Azure Speech recognition error: ${err}`));
      }
    );
  });
};

const extractTranscriptionResult = (
  result: sdk.SpeechRecognitionResult
): { text: string; detectedLanguage: string } => {
  if (result.reason !== sdk.ResultReason.RecognizedSpeech) {
    throw createRecognitionError(result);
  }

  const text = result.text;
  const detectedLanguage =
    result.properties.getProperty(AZURE_SPEECH.AUTO_DETECT_LANGUAGE_PROPERTY) || 'unknown';

  return { text, detectedLanguage };
};

const createRecognitionError = (result: sdk.SpeechRecognitionResult): Error => {
  if (result.reason === sdk.ResultReason.NoMatch) {
    return new Error('Azure Speech recognition: No speech could be recognized');
  }

  if (result.reason === sdk.ResultReason.Canceled) {
    const cancellation = sdk.CancellationDetails.fromResult(result);
    const errorDetails = cancellation.errorDetails ? `. ${cancellation.errorDetails}` : '';
    return new Error(`Azure Speech recognition canceled: ${cancellation.reason}${errorDetails}`);
  }

  return new Error(`Azure Speech recognition failed with reason: ${result.reason}`);
};

export const transcribeAudioAzure = async (
  audioBuffer: Buffer,
  languages?: string[]
): Promise<{ text: string; detectedLanguage: string }> => {
  try {
    logger.debug(`Transcribing audio buffer with Azure of size: ${audioBuffer.length} bytes`);

    const { apiKey, region } = validateAzureCredentials();
    const languagesToDetect = languages || [...AZURE_SPEECH.DEFAULT_LANGUAGES];
    const { speechConfig, autoDetectConfig, audioConfig } = createAzureConfigs(
      apiKey,
      region,
      audioBuffer,
      languagesToDetect
    );

    const result = await performRecognition(speechConfig, audioConfig, autoDetectConfig);
    const { text, detectedLanguage } = extractTranscriptionResult(result);

    logger.info(`Audio transcribed successfully with Azure. Detected language: ${detectedLanguage}`);

    return { text, detectedLanguage };
  } catch (error) {
    logger.error('Error transcribing audio with Azure:', error);
    throw error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
  }
};

export const downloadAndTranscribe = async (audioUrl: string): Promise<string> => {
  try {
    logger.debug(`Starting download and transcription for URL: ${audioUrl}`);

    const audioBuffer = await retry(
      () => downloadAudioAsBuffer(audioUrl),
      {
        onRetry: (attempt, error) => {
          logger.warn(
            `Download attempt ${attempt} failed for URL ${audioUrl}:`,
            error.message
          );
        },
      }
    );

    const transcribedText = await transcribeAudio(audioBuffer);

    return transcribedText;
  } catch (error) {
    logger.error(`Error in download and transcribe for URL ${audioUrl}:`, error);
    throw error;
  }
};

export const downloadAndTranscribeAzure = async (audioUrl: string): Promise<string> => {
  try {
    logger.debug(`Starting download and Azure transcription for URL: ${audioUrl}`);

    const audioBuffer = await retry(
      () => downloadAudioAsBuffer(audioUrl),
      {
        onRetry: (attempt, error) => {
          logger.warn(
            `Download attempt ${attempt} failed for URL ${audioUrl}:`,
            error.message
          );
        },
      }
    );

    const result = await transcribeAudioAzure(audioBuffer);

    return result.text;
  } catch (error) {
    logger.error(`Error in download and Azure transcribe for URL ${audioUrl}:`, error);
    throw error;
  }
};

