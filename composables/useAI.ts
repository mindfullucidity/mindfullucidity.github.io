import { useSupabaseClient } from '#imports';
import { useCookie } from '#app';

export const useAI = () => {
  const supabase = useSupabaseClient();
  const settingsCookie = useCookie('settings');

  const _invokeSupabaseFunction = async (functionName: string, payload: any, signal?: AbortSignal) => {
    const { data, error } = await supabase.functions.invoke(functionName, {
      signal,
      body: payload,
      headers: {
        'X-AI-Settings': JSON.stringify(settingsCookie.value),
      },
    });

    if (error) {
      if (error.context && error.context.body) {
        let errorBodyText = error.context.body;
        if (error.context.body instanceof ReadableStream) {
          errorBodyText = await new Response(error.context.body).text();
        }
        try {
          const errorBody = JSON.parse(errorBodyText);
          const errorMessage = typeof errorBody.error === 'string' ? errorBody.error : JSON.stringify(errorBody.error);
          return { data: null, error: { message: errorMessage || error.message } };
        } catch (e) {
          return { data: null, error: { message: errorBodyText || error.message } };
        }
      }
      return { data: null, error: { message: error.message } };
    }
    return { data, error: null };
  };

  const invokeAIAnalysis = async (payload: { entry: any; analyses: any[]; generate: any; }, signal?: AbortSignal) => {
    return _invokeSupabaseFunction('ai_analysis', payload, signal);
  };

  const invokeEnhance = async (payload: { type: string; object: any; }) => {
    return _invokeSupabaseFunction('enhance', payload);
  };

  return {
    invokeAIAnalysis,
    invokeEnhance,
  };
};
