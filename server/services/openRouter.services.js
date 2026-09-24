// import axios from "axios"


// export const askAi = async (messages) => {
//   try {
//       if (!messages || !Array.isArray(messages) || messages.length === 0) {
//         throw new Error("Messages array is empty.");
//       }
//       const response = await axios.post("https://openrouter.ai/api/v1/chat/completions",
//       {

//         model: "openai/gpt-4o-mini",
//         messages: messages

//       },{ 
//     headers: {
//     Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
//   },});

//   const content = response?.date?.choices?.[0]?.messages?.conent;

//   if (!content || !content.trim()) {
//     throw new error("AI returned empty response.");
//   }
//   } catch (error) {

//   }
// }
import axios from "axios";

const askAi = async (prompt) => {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content =
      response?.data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("AI returned an empty response");
    }

    return content;

  } catch (error) {

    console.error(
      "OpenRouter Error:",
      error?.response?.data || error.message
    );

    throw new Error("Failed to communicate with AI");
  }
};

export default askAi;