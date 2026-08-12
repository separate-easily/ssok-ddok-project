/**
 * 프론트엔드용 타입 내보내기
 *
 * 3-Tier Knowledge System 타입을 한 곳에서 import 할 수 있도록 합니다.
 */

// Knowledge Schema Types
export type {
  KnowledgeTier,
  KnowledgeSourceType,
  SourceCredibility,
  LocalRulebookSource,
  NationalOfficialSource,
  WebGeneralSource,
  KnowledgeSource,
  WebSearchResult,
  SearchContext,
  KnowledgeRoutingResult,
  EnhancedChatResponse,
  ContactInfo,
  AppInfo,
} from "../data/knowledgeSchema";

// Knowledge Schema Constants
export {
  PYEONGTAEK_CONTACTS,
  OFFICIAL_APPS,
  TRUSTED_DOMAINS,
  WEB_SEARCH_DISCLAIMER,
} from "../data/knowledgeSchema";

// Knowledge Schema Utilities
export {
  evaluateDomainCredibility,
  isPyeongtaekDomain,
  isGovernmentDomain,
  getSourceTypeLabel,
  tierToSourceType,
  formatReference,
  webResultToSource,
  createDefaultSuggestions,
  generateSourceAttribution,
} from "../data/knowledgeSchema";

// Rulebook Types
export type { Rule, Rulebook, SourceRef, ConditionTriggers } from "../data/rulebookSchema";

// Chat Service Types
export type { ChatMessage, ChatResponse, ChatOptions } from "../services/chatService";

// Chat Service Functions
export {
  sendMessage,
  sendEnhancedMessage,
  analyzeQuery,
  exampleQuestions,
  isApiKeyConfigured,
} from "../services/chatService";

// React Hooks
export { useEnhancedChat } from "../hooks/useEnhancedChat";
