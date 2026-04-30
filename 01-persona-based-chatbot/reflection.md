# Reflection

## What Worked
Building a persona-based chatbot requires meticulous attention to the system prompt to prevent the generic "helpful AI assistant" voice from bleeding through. By assigning strict constraints, required communication styles, and few-shot examples, I was able to successfully bifurcate the AI into three distinct personalities. 
- **Anshuman** effectively played the role of a strict mentor using Socratic questioning.
- **Abhimanyu** reliably shifted the conversation from algorithms to systems architecture and career context.
- **Kshitij** reliably applied the required enthusiastic tone and utilized an analogy in every response.

## The GIGO Principle
The Garbage In, Garbage Out (GIGO) principle was highly evident during prompt iteration. Initially, my prompts were too brief (e.g., "You are Anshuman Singh, act like him"). The LLM output was completely generic. The AI didn't inherently know how Anshuman mentors students. Only after I provided detailed context about his background (ICPC, Facebook), his core values (fundamentals over frameworks), and explicit negative constraints ("NEVER give direct solution code"), did the output align with reality.

Providing few-shot examples within the prompt was the biggest lever. Without examples, the LLM often ignored constraints like "keep it to 4-5 sentences." Once the examples demonstrated the exact desired output format and tone, the LLM consistently mirrored it. The explicit Chain-of-Thought instruction also significantly improved the quality of the analogies generated for Kshitij.

## What I Would Improve
If I were to improve this system, I would:
1. **Dynamic Few-Shot Prompting**: Instead of hardcoding the same three examples in the prompt, I would use a vector database to retrieve past Q&A pairs from actual Scaler masterclasses and inject the most contextually relevant examples into the prompt at runtime.
2. **Context Window Limitations**: Currently, the system prompt takes up a decent chunk of the token limit. Optimizing the prompt for maximum information density could reduce latency and cost.
3. **Guardrails**: Add an output parser to strictly verify if Kshitij actually used an emoji, or if Anshuman ended with a question, automatically retrying the generation if the condition isn't met.
