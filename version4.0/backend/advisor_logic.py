import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# MASTER PROMPT Integration
MASTER_PROMPT = """You are an Academic GPA Advisor AI. 
You must always respond using clean, well-structured Markdown formatting.

OUTPUT RULES:
1. Use headings (#, ##, ###), bullet points (-), and bold (**text**).
2. ALWAYS format math with LaTeX: Inline $ ... $, Block $$ ... $$.
3. Use tables for subjects, scores, and GPA breakdowns.
4. Be concise, structured, and professional.
5. End with a short motivational message in **bold**.

STUDENT DATA:
- GPA: {current_gpa}
- Profile: {profile_str}
- History: {history_summary}
- Weaknesses: {weak_points}

STYLE: Professional, structured, student-friendly advisor."""

class AdvisorSystem:
    @staticmethod
    def summarize_academic_data(records):
        if not records: return 0.0, "No records.", "None"
        all_gpas = [float(r.get('gpa', 0)) for r in records]
        avg_gpa = sum(all_gpas) / len(all_gpas) if all_gpas else 0.0
        h_summary = " | ".join([f"{r['semester']}: {r['gpa']}" for r in records])
        
        all_subjects = []
        for r in records: all_subjects.extend(r.get('subjects', []))
        weakest = sorted(all_subjects, key=lambda x: float(x.get('score', 100)))[:3]
        weak_str = ", ".join([s['name'] for s in weakest])
        
        return avg_gpa, h_summary, weak_str

    @staticmethod
    def estimate_tokens(text):
        return len(text) // 4

    @staticmethod
    def get_response(user_message, profile, records, history=None):
        model_name = os.getenv("MODEL_NAME", "gemini-1.5-flash")
        
        avg_gpa, h_summary, weak_points = AdvisorSystem.summarize_academic_data(records)
        
        # Build compact profile string
        p_str = f"{profile.get('studentProgram', 'General')}, {profile.get('uniName', 'N/A')}"
        
        # Inject student data into Master Prompt
        sys_prompt = MASTER_PROMPT.format(
            current_gpa=f"{avg_gpa:.2f}" if records else "N/A",
            profile_str=p_str,
            history_summary=h_summary,
            weak_points=weak_points
        )

        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=sys_prompt
        )

        safe_history = []
        if history:
            current_tokens = AdvisorSystem.estimate_tokens(sys_prompt + user_message)
            for msg in reversed(history[-5:]):
                content = msg.get('parts', [msg.get('content', '')])[0]
                msg_tokens = AdvisorSystem.estimate_tokens(content)
                if current_tokens + msg_tokens > 200000: break
                role = 'model' if msg.get('role') == 'assistant' else 'user'
                safe_history.insert(0, {"role": role, "parts": [content]})
                current_tokens += msg_tokens

        chat = model.start_chat(history=safe_history)
        response = chat.send_message(user_message)
        return response.text
