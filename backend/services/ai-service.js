export const getAIReply = async (messages) => {
    try {
      const response = await axios.post(
        "http://localhost:11434/api/chat",
        {
          model: "phi3",
          messages,
          stream: false
        },
        { timeout: 120000 }
      );
  
      const content =
        response?.data?.message?.content?.trim();
  
      // 🔥 IMPORTANT GUARD
      if (!content) {
        return "AI could not generate a response right now. Please try again.";
      }
  
      return content;
    } catch (error) {
      console.error("Ollama error:", error.message);
      return "AI is temporarily unavailable. Please try again.";
    }
  };
  