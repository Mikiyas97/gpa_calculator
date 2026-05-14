import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# MASTER PROMPT
MASTER_PROMPT = """You are an Academic GPA Advisor AI. 

You must always respond using clean, well-structured Markdown formatting.

### OUTPUT RULES:
1. Always use Markdown formatting (headings, bullet points, tables).
2. ALWAYS format mathematical expressions using LaTeX ($ ... $ or $$ ... $$).
3. CONCISENESS RULE (CRITICAL): Be extremely brief and direct. Only explain in detail if asked.

### STUDENT DATA:
- **Current GPA**: {current_gpa}
- **Target Graduation GPA**: {target_gpa}
- **Required Future GPA**: {required_future_gpa}
- **Profile**: {profile_str}
- **History Summary**: {history_summary}
- **Detailed Records**: 
{detailed_records}

### STRATEGY:
- If a target GPA is set, calculate and explain the feasibility.
- Identify weak subjects and suggest improvement strategies.
- Prioritize high-credit subjects in your recommendations.
"""

class AdvisorSystem:
    @staticmethod
    def summarize_academic_data(records):
        if not records:
            return 0.0, "No records.", "No detailed records."
        
        all_gpas = [float(r.get('gpa', 0)) for r in records]
        avg_gpa = sum(all_gpas) / len(all_gpas) if all_gpas else 0.0
        h_summary = " | ".join([f"{r['semester']}: {r['gpa']}" for r in records])
        
        detailed_rows = []
        for r in records:
            subjects = r.get('subjects', [])
            sub_str = ", ".join([f"{s['name']}: {s['grade']}({s['score']})" for s in subjects])
            detailed_rows.append(f"- {r.get('year', 'N/A')} {r.get('semester', 'N/A')} (GPA: {r.get('gpa', 'N/A')}): {sub_str}")
        
        detailed_records = "\n".join(detailed_rows)
        return avg_gpa, h_summary, detailed_records

    @staticmethod
    def estimate_tokens(text):
        return len(text) // 4

    @staticmethod
    def get_response(user_message, profile, records, history=None, target_gpa=None, required_future_gpa=None):
        model_name = os.getenv("MODEL_NAME", "gemini-1.5-flash")
        
        avg_gpa, h_summary, detailed_records = AdvisorSystem.summarize_academic_data(records)
        
        p_str = f"{profile.get('studentProgram', 'General')}, {profile.get('uniName', 'N/A')}"
        
        sys_prompt = MASTER_PROMPT.format(
            current_gpa=f"{avg_gpa:.2f}" if records else "0.00",
            target_gpa=target_gpa or "Not set",
            required_future_gpa=required_future_gpa or "N/A",
            profile_str=p_str,
            history_summary=h_summary,
            detailed_records=detailed_records
        )

        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=sys_prompt
        )

        safe_history = []
        if history:
            current_tokens = AdvisorSystem.estimate_tokens(sys_prompt + user_message)
            for msg in reversed(history[-10:]): # Keep more context
                content = msg.get('parts', [msg.get('content', '')])[0]
                msg_tokens = AdvisorSystem.estimate_tokens(content)
                if current_tokens + msg_tokens > 1000000: break # Gemini has large context
                role = 'model' if msg.get('role') == 'assistant' else 'user'
                safe_history.insert(0, {"role": role, "parts": [content]})
                current_tokens += msg_tokens

        chat = model.start_chat(history=safe_history)
        response = chat.send_message(user_message)
        return response.text
