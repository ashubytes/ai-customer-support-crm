import axios from 'axios';
import { config } from '../config/env';
import { TicketCategory, TicketPriority, TicketSentiment } from '../types';

export interface AiAnalysisResult {
  category: TicketCategory;
  priority: TicketPriority;
  sentiment: TicketSentiment;
  summary: string;
  suggested_reply: string;
  is_fallback?: boolean;
}

export interface AiSuggestedReplyResult {
  suggested_reply: string;
  is_fallback?: boolean;
}

export class AiService {
  private static client = axios.create({
    baseURL: config.aiServiceUrl,
    timeout: 8000, // 8 second timeout
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Fallback rule-based NLP analyzer in case FastAPI microservice or Gemini is unavailable
   */
  private static localFallbackAnalysis(
    subject: string,
    description: string
  ): AiAnalysisResult {
    const text = `${subject} ${description}`.toLowerCase();

    // Determine category
    let category: TicketCategory = 'Other';
    if (text.includes('pay') || text.includes('card') || text.includes('checkout') || text.includes('transaction')) {
      category = 'Payment';
    } else if (text.includes('bill') || text.includes('invoice') || text.includes('charge') || text.includes('cost')) {
      category = 'Billing';
    } else if (text.includes('refund') || text.includes('money back') || text.includes('return')) {
      category = 'Refund';
    } else if (text.includes('login') || text.includes('password') || text.includes('auth') || text.includes('locked')) {
      category = 'Login';
    } else if (text.includes('account') || text.includes('profile') || text.includes('sso') || text.includes('subscription')) {
      category = 'Account';
    } else if (text.includes('api') || text.includes('error') || text.includes('500') || text.includes('bug') || text.includes('crash') || text.includes('timeout')) {
      category = 'Technical Issue';
    } else if (text.includes('order') || text.includes('tracking')) {
      category = 'Order';
    } else if (text.includes('product') || text.includes('feature')) {
      category = 'Product';
    } else if (text.includes('delivery') || text.includes('shipping')) {
      category = 'Delivery';
    }

    // Determine priority
    let priority: TicketPriority = 'Medium';
    if (text.includes('urgent') || text.includes('critical') || text.includes('down') || text.includes('emergency') || text.includes('outage')) {
      priority = 'Urgent';
    } else if (text.includes('double charge') || text.includes('fail') || text.includes('locked out') || text.includes('cannot')) {
      priority = 'High';
    } else if (text.includes('inquiry') || text.includes('question') || text.includes('how to')) {
      priority = 'Low';
    }

    // Determine sentiment
    let sentiment: TicketSentiment = 'Neutral';
    if (text.includes('angry') || text.includes('worst') || text.includes('error') || text.includes('terrible') || text.includes('failing') || text.includes('charge twice') || text.includes('refund')) {
      sentiment = 'Negative';
    } else if (text.includes('thank') || text.includes('great') || text.includes('appreciate') || text.includes('awesome') || text.includes('love')) {
      sentiment = 'Positive';
    }

    const summary = subject.length > 80 ? subject.substring(0, 77) + '...' : subject;
    const suggested_reply = `Hello, thank you for reaching out to support regarding "${subject}". We have noted your request and our engineering & support team is reviewing it immediately.`;

    return {
      category,
      priority,
      sentiment,
      summary,
      suggested_reply,
      is_fallback: true,
    };
  }

  /**
   * Analyze new support ticket using FastAPI microservice (Gemini) with graceful fallback
   */
  public static async analyzeTicket(
    subject: string,
    description: string
  ): Promise<AiAnalysisResult> {
    try {
      const response = await this.client.post('/api/ai/analyze-ticket', {
        subject,
        description,
      });

      if (response.data && response.data.category) {
        return {
          ...response.data,
          is_fallback: false,
        };
      }
      return this.localFallbackAnalysis(subject, description);
    } catch (error: any) {
      console.warn(`[AI-SERVICE] Notice: AI Microservice unreachable (${error.message}). Using resilient local NLP fallback.`);
      return this.localFallbackAnalysis(subject, description);
    }
  }

  /**
   * Request smart response suggestion based on ticket and conversation history
   */
  public static async suggestResponse(
    subject: string,
    description: string,
    messages: Array<{ sender_type: string; message: string }>
  ): Promise<AiSuggestedReplyResult> {
    try {
      const response = await this.client.post('/api/ai/suggest-response', {
        subject,
        description,
        messages,
      });

      if (response.data && response.data.suggested_reply) {
        return {
          suggested_reply: response.data.suggested_reply,
          is_fallback: false,
        };
      }
      return {
        suggested_reply: `Hello, thank you for reaching out. We are actively investigating your issue regarding "${subject}" and will follow up shortly with a resolution.`,
        is_fallback: true,
      };
    } catch (error: any) {
      console.warn(`[AI-SERVICE] Suggest response fallback: ${error.message}`);
      return {
        suggested_reply: `Hello, thank you for your patience. I am looking into your request regarding "${subject}" and will update you shortly.`,
        is_fallback: true,
      };
    }
  }
}
