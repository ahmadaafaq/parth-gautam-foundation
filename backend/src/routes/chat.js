const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const supabase = require('../db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/chat
router.post('/', async (req, res, next) => {
  try {
    const { user_id, message, session_id } = req.body;

    // Get user context
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('name, ward, interests')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    // Get last 10 messages for this session
    const { data: history } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('user_id', user_id)
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })
      .limit(10);

    // Build system prompt
    const systemPrompt = `You are an AI assistant for Parth Gautam Foundation's Citizen Super App.
You help citizens with healthcare, education, and community services.

User Context:
- Name: ${user.name}
- Ward: ${user.ward}
- Interests: ${(user.interests || []).join(', ')}

Provide helpful, concise responses about:
- Healthcare services (doctor appointments, health camps)
- Education opportunities (scholarships, skill training)
- Community programs (volunteer work, issue reporting)
- Citizen card benefits

Be friendly and actionable.`;

    // Build chat history for Gemini (alternating user/model turns)
    const chatHistory = (history || []).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    // Persist user message and assistant response
    await supabase.from('chat_messages').insert([
      { user_id, session_id, role: 'user', content: message },
      { user_id, session_id, role: 'assistant', content: responseText },
    ]);

    return res.json({ response: responseText });
  } catch (err) {
    console.error('[CHAT ERROR]', err);
    next(err);
  }
});

module.exports = router;
