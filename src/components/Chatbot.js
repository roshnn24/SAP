import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageCircle } from 'lucide-react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your policy assistant. I can help you understand company policies, answer questions about expense guidelines, and provide information about bill processing. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const predefinedQuestions = [
    'What is the travel expense policy?',
    'How much can I spend on meals?',
    'What documents do I need for reimbursement?',
    'What is the approval process for office supplies?',
    'Can I expense software subscriptions?'
  ];

  const botResponses = {
    'travel': 'Our travel expense policy allows for reasonable business travel expenses including accommodation, meals, and transportation. Please refer to the Travel Expense Policy document for detailed guidelines and limits.',
    'meal': 'Meal expenses are covered up to $50 per day for business meals. Entertainment expenses require prior approval for amounts over $100. Please keep all receipts.',
    'documents': 'For reimbursement, you need to submit: 1) Original receipts, 2) Completed expense form, 3) Business purpose explanation, and 4) Manager approval.',
    'approval': 'Office supplies under $100 can be purchased directly. Items over $100 require manager approval. All purchases must be documented with receipts.',
    'software': 'Software subscriptions are generally covered if they are business-related and approved by your manager. Please check the IT Equipment Policy for specific guidelines.'
  };

  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('travel')) return botResponses.travel;
    if (lowerMessage.includes('meal') || lowerMessage.includes('food')) return botResponses.meal;
    if (lowerMessage.includes('document') || lowerMessage.includes('receipt')) return botResponses.documents;
    if (lowerMessage.includes('approval') || lowerMessage.includes('supplies')) return botResponses.approval;
    if (lowerMessage.includes('software') || lowerMessage.includes('subscription')) return botResponses.software;
    
    return 'I understand your question about policies. For specific details, please refer to the relevant policy document in the Policies section, or contact HR for clarification.';
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: getBotResponse(inputMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handlePredefinedQuestion = (question) => {
    setInputMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-text mb-2">Policy Assistant</h1>
        <p className="text-dark-muted">Ask questions about company policies and get instant answers</p>
      </div>

      <div className="card h-[600px] flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-dark-border mb-4">
          <div className="p-2 bg-dark-accent bg-opacity-20 rounded-lg">
            <Bot className="w-6 h-6 text-dark-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-dark-text">Policy Assistant</h2>
            <p className="text-sm text-dark-muted">Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`p-2 rounded-lg ${message.type === 'user' ? 'bg-dark-accent' : 'bg-dark-surface'}`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-dark-accent" />
                  )}
                </div>
                <div className={`rounded-lg p-3 ${message.type === 'user' ? 'bg-dark-accent text-white' : 'bg-dark-surface text-dark-text'}`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-dark-muted'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-dark-surface">
                  <Bot className="w-4 h-4 text-dark-accent" />
                </div>
                <div className="rounded-lg p-3 bg-dark-surface">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-dark-muted rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-dark-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-dark-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Predefined Questions */}
        <div className="mb-4">
          <p className="text-sm text-dark-muted mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {predefinedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handlePredefinedQuestion(question)}
                className="text-xs bg-dark-surface hover:bg-dark-card text-dark-text px-3 py-1 rounded-full border border-dark-border transition-colors duration-200"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about policies..."
              className="input-field w-full pr-12"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-accent hover:text-dark-text disabled:text-dark-muted disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;





