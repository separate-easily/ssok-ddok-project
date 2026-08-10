import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

const openaiApiKey = defineSecret('OPENAI_API_KEY');

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `당신은 초등학생 대상 분리수거 교육 앱 '쏙쏙분리 똑똑분리'의 챗봇 '쏙쏙이'입니다.
아이들도 이해할 수 있도록 쉽고 친절한 말투로, 분리수거/재활용/환경 보호에 대해서만 답변하세요.
관련 없는 질문에는 정중히 화제를 분리수거 이야기로 돌려주세요. 답변은 3~4문장 이내로 짧게 작성하세요.`;

export const chatWithAI = onCall(
  { secrets: [openaiApiKey], region: 'asia-northeast3' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', '로그인 후 이용할 수 있습니다.');
    }

    const messages = request.data?.messages as ChatMessage[] | undefined;
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new HttpsError('invalid-argument', 'messages 배열이 필요합니다.');
    }

    const recentMessages = messages.slice(-10).map((m) => ({
      role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: String(m.content ?? '').slice(0, 2000),
    }));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey.value()}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...recentMessages],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new HttpsError('internal', 'AI 응답을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.');
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = data.choices?.[0]?.message?.content?.trim();

    return { reply: reply || '죄송해요, 지금은 답변을 만들지 못했어요. 다시 물어봐 주세요!' };
  }
);
