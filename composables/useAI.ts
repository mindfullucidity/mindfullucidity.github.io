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
      // If the error has a context body, try to parse it for a more specific message
      if (error.context?.body) {
        let errorBodyText = error.context.body;
        // If it's a ReadableStream, convert it to text
        if (error.context.body instanceof ReadableStream) {
          try {
            errorBodyText = await new Response(error.context.body).text();
          } catch (e) {
            console.error("Failed to read error body as text:", e);
            return { data: null, error: { message: error.message || "Unknown error reading response body." } };
          }
        }
        // Try to parse the error body as JSON
        try {
          const errorBody = JSON.parse(errorBodyText);
          // Prioritize a specific 'error' field if it exists
          const errorMessage = errorBody.error || errorBody.message || JSON.stringify(errorBody);
          return { data: null, error: { message: errorMessage } };
        } catch (e) {
          // If parsing fails, return the raw text or the original error message
          return { data: null, error: { message: errorBodyText || error.message || "Unknown error." } };
        }
      }
      // Fallback to the original error message if no context body
      return { data: null, error: { message: error.message || "Unknown error." } };
    }
    return { data, error: null };
  };

  const invokeAIAnalysis = async (payload: { entry: any; analyses: any[]; generate: any; }, signal?: AbortSignal) => {
    return _invokeSupabaseFunction('ai_analysis', payload, signal);
  };

  const invokeEnhance = async (payload: { type: string; object: any; }) => {
    return _invokeSupabaseFunction('enhance', payload);
  };

  const streamAIAnalysis = async (
    payload: { entry: any; analyses: any[]; generate: any; },
    onChunk: (chunk: string) => void,
    signal?: AbortSignal,
  ) => {
    
    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/ai_analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'X-AI-Settings': JSON.stringify(settingsCookie.value),
        },
        body: JSON.stringify(payload),
        signal,
      });

      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('streamAIAnalysis: Response not OK. Error data:', errorData);
        throw new Error(errorData.error || 'Failed to stream AI analysis');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (!reader) {
        console.error('streamAIAnalysis: Failed to get readable stream reader.');
        throw new Error('Failed to get readable stream reader.');
      }

      while (true) {
        
        const { done, value } = await reader.read();
        
        if (done) {
          
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.substring(0, newlineIndex).trim();
          buffer = buffer.substring(newlineIndex + 1);

          if (line.startsWith('data:')) {
            try {
              const jsonString = line.substring(5).trim();
              const parsed = JSON.parse(jsonString);
              if (parsed.content) {
                onChunk(parsed.content);
                
              }
            } catch (e) {
              console.error('streamAIAnalysis: Error parsing SSE data:', e, 'Line:', line);
            }
          }
        }
      }
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        
      } else {
        console.error('streamAIAnalysis: Error during AI analysis streaming:', error);
        throw error;
      }
    }
  };

  return {
    invokeAIAnalysis,
    invokeEnhance,
    streamAIAnalysis,
  };
};
