import streamlit as st
import google.generativeai as genai

# Configure the Gemini API key
GEMINI_API_KEY = "AIzaSyACHklx9NQ5T_tFyhAGitANJ73Gtjt9gNA"  # Replace with your actual API key
genai.configure(api_key=GEMINI_API_KEY)

st.title(" 🤖 HackStreetboys AI Chatbot")

# Initialize Chat History
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display Chat History
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Function to Generate AI Chat Responses
def generate_chat_response(user_query):
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")  # Use Gemini AI model

        prompt = f"""
        You are MastermindHub, an AI chatbot that provides intelligent and engaging responses to users.
        Respond naturally and conversationally to the following message:

        **User Message:** {user_query}
        """

        response = model.generate_content(prompt)  # Generate AI response
        return response.text.strip() if response.text else "⚠️ No response generated."

    except Exception as e:
        return f"⚠️ Error processing request: {e}"

# User Chat Input at the Bottom
user_input = st.chat_input("Chat with me... Ask anything!")

if user_input:
    # Show User Input in Chat
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.markdown(user_input)

    # Generate AI Response
    with st.spinner("🤖 Thinking..."):
        response = generate_chat_response(user_input)

    # Show AI Response in Chat
    st.session_state.messages.append({"role": "assistant", "content": response})
    with st.chat_message("assistant"):
        st.markdown(response)