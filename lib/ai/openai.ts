import OpenAI from 'openai';
import type { AIGenerationResult, Topic, Post, NewsletterGenerationInput } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateBlogPost(topic: Topic): Promise<AIGenerationResult> {
  try {
    const prompt = `You are an expert AI business consultant writing for business owners.

Topic: ${topic.title}
Description: ${topic.description}
Category: ${topic.category}
Content Reference: ${topic.content}

Write a comprehensive, engaging blog post (800-1200 words) about this topic. Focus on:
1. Practical applications for business owners
2. Real-world examples and use cases
3. Step-by-step implementation guidance
4. Benefits and ROI potential
5. Common pitfalls to avoid

Make it conversational, authoritative, and actionable. Use markdown formatting.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI consultant who writes engaging, practical content for business owners about AI tools and strategies.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated');
    }

    return {
      success: true,
      content,
      tokensUsed: completion.usage?.total_tokens,
    };
  } catch (error) {
    console.error('Error generating blog post:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function generateNewsletterContent(
  input: NewsletterGenerationInput
): Promise<AIGenerationResult> {
  try {
    const topicsText = input.topics
      .map((t, i) => `${i + 1}. ${t.title}: ${t.description}`)
      .join('\n');

    const recentPostsText = input.recentPosts
      ? input.recentPosts
          .map((p, i) => `${i + 1}. ${p.title}: ${p.excerpt}`)
          .join('\n')
      : '';

    const prompt = `Create an engaging daily newsletter for business owners about AI tools and strategies.

Topics to cover:
${topicsText}

${recentPostsText ? `Recent blog posts to reference:\n${recentPostsText}\n` : ''}

${input.customPrompt ? `Additional instructions:\n${input.customPrompt}\n` : ''}

Structure the newsletter with:
1. A catchy subject line (return this on the first line as "SUBJECT: ...")
2. A warm greeting
3. 2-3 key insights or tips (one paragraph each)
4. Links to recent blog posts (if provided)
5. A call-to-action
6. A friendly sign-off

Keep it concise (300-500 words), conversational, and valuable. Use markdown formatting.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI consultant who writes engaging daily newsletters for business owners.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated');
    }

    return {
      success: true,
      content,
      tokensUsed: completion.usage?.total_tokens,
    };
  } catch (error) {
    console.error('Error generating newsletter:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function generateBlogExcerpt(content: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You create compelling 2-3 sentence excerpts from blog posts.',
        },
        {
          role: 'user',
          content: `Create a compelling excerpt (2-3 sentences) from this blog post:\n\n${content.substring(0, 1000)}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating excerpt:', error);
    return content.substring(0, 200) + '...';
  }
}
