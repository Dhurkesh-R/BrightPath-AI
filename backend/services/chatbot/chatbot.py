import logging
from .conversation.llm_interface import LLMInterface
from .data.storage import Storage
from .conversation.planner import Planner
from .conversation.memory import ConversationBufferMemory, SummarizedMemory, HybridMemory, VectorMemory


class ChatBot:
    def __init__(self, user_role: str = "student"):
        """
        user_role: one of ["student", "teacher", "parent"]
        """
        self.llm = LLMInterface()
        self.storage = Storage()
        self.planner = Planner()
        self.data = self.storage.load()

        # --- Memory setup ---
        self.buffer = ConversationBufferMemory(max_turns=10)
        self.summary = SummarizedMemory()
        self.vector = VectorMemory(embed_fn=lambda x: [0.1] * 768)  # placeholder embedding fn
        self.memory = HybridMemory(self.buffer, self.summary, self.vector)

        # --- User role (context switch) ---
        self.user_role = user_role

    def _get_system_prompt(self) -> str:
        """Define the system instruction depending on user role."""
        base_prompt = """
You are BrightPath AI, a supportive and adaptive student companion.
Your job is to assist with studies, personal growth, and guidance.
Always be warm, practical, and encouraging. Use memory wisely (internal use).
Do not share summaries unless explicitly asked.
"""

        if self.user_role == "student":
            role_prompt = """
The user is a student. 
- Encourage curiosity, creativity, and problem-solving. 
- Provide clear study help, motivational advice, and habit-building guidance. 
- Avoid sounding like a strict teacher — be more like a mentor or friend.
"""
        elif self.user_role == "teacher":
            role_prompt = """
The user is a teacher.
- Help them with classroom strategies, teaching aids, student well-being ideas, and technology in education. 
- Be respectful, professional, and solution-focused. 
- Suggest innovative teaching techniques.
"""
        elif self.user_role == "parent":
            role_prompt = """
The user is a parent.
- Help them understand their child's strengths, learning needs, and mental/physical health. 
- Give supportive parenting advice, focus on encouragement, not judgment. 
- Suggest ways to build healthy routines at home.
"""
        else:
            role_prompt = "The user role is not specified clearly. Default to student-supportive mode."

        return base_prompt + role_prompt

    def chat(self, user_input: str) -> str:
        """Main chat loop with memory + role-awareness."""
        # --- Update memory ---
        self.memory.update("user", user_input)

        # --- Build context for prompt ---
        system_prompt = self._get_system_prompt()
        memory_context = self.memory.get_context(query=user_input)

        final_prompt = f"""{system_prompt}

--- Memory Context ---
{memory_context}

--- Conversation ---
User: {user_input}
Assistant:"""

        # --- Get LLM response ---
        reply = self.llm.get_reply(final_prompt)
        logging.info(reply)

        # --- Store bot reply in memory ---
        self.memory.update("assistant", reply)

        return reply


if __name__ == "__main__":
    bot = ChatBot(user_role="student")
    print(bot.chat("Hi, I’m struggling with math homework."))
