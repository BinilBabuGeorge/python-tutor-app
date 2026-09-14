from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import random
from google import genai

load_dotenv()

app = Flask(__name__)
CORS(app)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

TOPICS = {
    'easy': ['basic arithmetic', 'string manipulation', 'list operations', 'simple loops', 'basic conditionals', 'counting characters', 'finding min or max in a list', 'reversing a string', 'simple functions with parameters', 'checking divisibility'],
    'medium': ['nested loops', 'dictionaries', 'list comprehensions', 'string formatting', 'sorting algorithms', 'recursion basics', 'file-like text processing', 'tuple operations', 'set operations', 'error handling'],
    'hard': ['recursion', 'algorithms and Big O', 'data structures like stacks or queues', 'dynamic programming basics', 'object-oriented programming', 'advanced string parsing', 'graph traversal basics', 'sorting from scratch', 'matrix operations', 'combinatorics']
}

@app.route('/')
def home():
    return "Python Tutor App backend is running!"

@app.route('/get-question')
def get_question():
    level = request.args.get('level', 'easy')
    topic = random.choice(TOPICS.get(level, TOPICS['easy']))
    
    prompt = f"Generate one {level} level Python coding question for a beginner, focused on the topic: {topic}. Just give the question, no answer. Do not use a basic even/odd checker unless that is specifically the topic given."
    
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
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)