import { AgentRuntimeErrorType } from '../error';
import { isO1Model, pruneO1Payload } from '../openai';
import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeGithubAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://models.inference.ai.azure.com',
  chatCompletion: {
    handlePayload: (payload) => {
      const { model } = payload;

      if (isO1Model(model)) {
        return pruneO1Payload(payload) as any;
      }

      return { ...payload, stream: payload.stream ?? true };
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_GITHUB_CHAT_COMPLETION === '1',
  },
  errorType: {
    bizError: AgentRuntimeErrorType.ProviderBizError,
    invalidAPIKey: AgentRuntimeErrorType.InvalidGithubToken,
  },
  provider: ModelProvider.Github,
});
