from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from google import genai

load_dotenv()

app = Flask(__name__)
CORS(app)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

@app.route('/')
def home():
    return "Python Tutor App backend is running!"

@app.route('/get-question')
def get_question():
    level = request.args.get('level', 'easy')  # default to easy
    
    prompt = f"Generate one {level} level Python coding question for a beginner. Just give the question, no answer."
    
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )
    return response.text


@app.route('/check-answer', methods=['POST'])
def check_answer():
    data = request.get_json()
    question = data.get('question')
    user_code = data.get('code')
    
    prompt = f"""Question: {question}
User's answer: {user_code}

Is this answer correct? Reply with:
1. "Correct!" or "Incorrect" 
2. A short explanation (1-2 sentences)
3. If incorrect, a helpful hint (not the full answer)"""
    
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )
    return response.text

if __name__ == '__main__':
    app.run(debug=True)