/**
 * useEnhancedChat Hook
 *
 * 3-Tier Knowledge System을 사용하는 챗봇 통합 훅
 * 컴포넌트에서 쉽게 사용할 수 있도록 상태 관리를 제공합니다.
 */

import { useState, useCallback } from "react";
import {
  sendEnhancedMessage,
  analyzeQuery,
  type EnhancedChatResponse,
  type KnowledgeRoutingResult,
  type ChatMessage,
} from "../types";

interface UseEnhancedChatState {
  isLoading: boolean;
  error: string | null;
  lastResponse: EnhancedChatResponse | null;
  conversationHistory: ChatMessage[];
}

interface UseEnhancedChatReturn extends UseEnhancedChatState {
  sendMessage: (message: string) => Promise<EnhancedChatResponse | null>;
  analyzeMessage: (message: string) => Promise<KnowledgeRoutingResult | null>;
  clearHistory: () => void;
  clearError: () => void;
}

/**
 * 향상된 챗봇 기능을 위한 React 훅
 */
export function useEnhancedChat(): UseEnhancedChatReturn {
  const [state, setState] = useState<UseEnhancedChatState>({
    isLoading: false,
    error: null,
    lastResponse: null,
    conversationHistory: [],
  });

  /**
   * 메시지 전송 및 응답 받기
   */
  const sendMessage = useCallback(async (message: string): Promise<EnhancedChatResponse | null> => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      // 사용자 메시지를 히스토리에 추가
      const userMessage: ChatMessage = { role: "user", content: message };

      const response = await sendEnhancedMessage(message, state.conversationHistory);

      // 응답을 히스토리에 추가
      const assistantMessage: ChatMessage = { role: "assistant", content: response.answer };

      setState(prev => ({
        ...prev,
        isLoading: false,
        lastResponse: response,
        conversationHistory: [
          ...prev.conversationHistory,
          userMessage,
          assistantMessage,
        ],
      }));

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return null;
    }
  }, [state.conversationHistory]);

  /**
   * 메시지 분석만 수행 (답변 생성 없이)
   */
  const analyzeMessage = useCallback(async (message: string): Promise<KnowledgeRoutingResult | null> => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const result = await analyzeQuery(message);

      setState(prev => ({
        ...prev,
        isLoading: false,
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "분석 중 오류가 발생했습니다.";

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return null;
    }
  }, []);

  /**
   * 대화 히스토리 초기화
   */
  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      conversationHistory: [],
      lastResponse: null,
    }));
  }, []);

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...state,
    sendMessage,
    analyzeMessage,
    clearHistory,
    clearError,
  };
}

export default useEnhancedChat;
