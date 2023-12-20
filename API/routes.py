from flask import Flask, request, jsonify, send_file
import uuid
import fitz
from datetime import datetime
import jwt
from flask_sqlalchemy import SQLAlchemy
from time import time
from flask_cors import CORS
from pyngrok import ngrok  
import os
from gradio_client import Client
import pdfplumber
from nltk.tokenize import sent_tokenize
import nltk
import pytz
import base64
import requests
from flask_cors import CORS
import httpx
import requests


client = httpx.Client(timeout=50) 


# nltk.download('punkt')


UPLOAD_FOLDER = 'D:\\chroma\\SIH\\Docs'

app = Flask(__name__)
CORS(app)

public_url = ngrok.connect(5000)
print(" * ngrok tunnel \"{}\" -> \"http://127.0.0.1:{}/\"".format(public_url, 5000))

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:9119@localhost:6174/SIH_DB'
db = SQLAlchemy(app)

# summarization_url = Client("https://df23449496adacabed.gradio.live/")
chat_with_doc_url = Client("https://e7e5d4b57587600893.gradio.live/")



class LoginTable(db.Model):
    email = db.Column(db.String(255), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    JWT_token = db.Column(db.String(255), nullable=False)

class UsersHistory(db.Model):
    uuid = db.Column(db.String(36), primary_key=True)
    email = db.Column(db.String(255), nullable=False)
    tab_name = db.Column(db.String(255), nullable=False)
    datetime = db.Column(db.String(255), nullable=False)
    query = db.Column(db.Text, nullable=True)
    response = db.Column(db.Text, nullable=True)
    doc_path = db.Column(db.String(255))
    chat_type = db.Column(db.String(255), nullable=False)

def create_paragraph_from_chunks(chunks):
  # Join the chunks into a single string
  text = " ".join(chunks)
  
  # Apply basic sentence boundary detection
  sentences = re.split(r'[.!?]\s+', text)
  
  # Remove empty sentences
  sentences = [sentence for sentence in sentences if sentence.strip()]
  
  # Combine sentences into a single paragraph
  paragraph = " ".join(sentences)
  
  # Return the processed paragraph
  return paragraph

def convert_pdf_to_text(pdf_file):
    # Open the PDF using pdfplumber
    with pdfplumber.open(pdf_file) as pdf:
        # Extract text from all pages
        text_data = ""
        for page in pdf.pages:
            # Extract page content using pdfplumber's extract_text() method
            page_content = page.extract_text()
            # Append extracted content
            text_data += page_content

    # Return the combined text data
    return text_data

def get_average_font_size(doc, sample_size=20):
    font_sizes = []
    for page_num in [0,len(doc)//2, len(doc)//2, len(doc)-1]:
        page = doc[page_num]
        text_blocks = page.get_text("dict")["blocks"]
        for block in text_blocks[:sample_size]:
            if block['type'] == 0:
                for line in block["lines"]:
                    for span in line["spans"]:
                        font_sizes.append(span["size"])
    return sum(font_sizes) / len(font_sizes) if font_sizes else 0

def extract_sections(pdf_path, section_names):
    doc = fitz.open(pdf_path)
    threshold_font_size = get_average_font_size(doc,5)
    sections = {name: "" for name in section_names}
    print(sections)
    current_section = None

    for page in doc:
        text_blocks = page.get_text("dict")["blocks"]
        for block in text_blocks:
            if block['type'] == 0:  # Text block
                for line in block["lines"]:
                    for span in line["spans"]:
                        # Check if the span is a section header
                        if span["size"] >= threshold_font_size:
                            text_lower = span["text"].lower()
                            for section in section_names:
                                if section in text_lower:
                                    # print(section)
                                    current_section = section
                                    break

                        # Add text to the current section
                        if current_section!=None:
                            # print(span["text"])
                            sections[current_section] += span["text"] + ""

    return sections



@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    user = LoginTable.query.filter_by(email=data['email'], password=data['password']).first()

    if user:
        
        jwt_token = jwt.encode({'email': user.email, 'timestamp': time()}, 'AlgoAlliance6174', algorithm='HS256')
        
        
        user.JWT_token = jwt_token
        db.session.commit()

        return jsonify({'token': jwt_token}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

#  @app.route('/add_user_history', methods=['POST'])

@app.route('/add_user_history_first', methods=['POST'])
def add_user_history_first():
    data = request.get_json()
    uuid_value = str(uuid.uuid4())
    current_utc_datetime = datetime.utcnow()
    # Define the Indian timezone
    indian_timezone = pytz.timezone('Asia/Kolkata')
    # Convert the UTC time to the Indian timezone
    current_indian_datetime = current_utc_datetime.replace(tzinfo=pytz.utc).astimezone(indian_timezone)
    # Format the datetime as a string with a format recognized by PostgreSQL
    formatted_datetime = current_indian_datetime.strftime('%H%M%S%Y%m%d%f')[:-3]
    title_datetime = current_indian_datetime.strftime('Date: %Y/%m/%d Time: %H:%M:%S')

    entry = UsersHistory(
        uuid=uuid_value,
        email=data['email'],
        tab_name=formatted_datetime,
        datetime=title_datetime,
        query="",
        response="",
        doc_path="",
        chat_type=data['chat_type']
    )
    db.session.add(entry)
    db.session.commit()

    return jsonify({'result': {'title':title_datetime,'tab_name':formatted_datetime}}), 201

@app.route('/add_user_history', methods=['POST'])
def add_user_history():
    data = request.get_json()
    
    uuid_value = str(uuid.uuid4())
    current_utc_datetime = datetime.utcnow()
    # Define the Indian timezone
    indian_timezone = pytz.timezone('Asia/Kolkata')
    # Convert the UTC time to the Indian timezone
    current_indian_datetime = current_utc_datetime.replace(tzinfo=pytz.utc).astimezone(indian_timezone)
    # Format the datetime as a string with a format recognized by PostgreSQL
    formatted_datetime = current_indian_datetime.strftime('%H%M%S%Y%m%d%f')[:-3]
    title_datetime = current_indian_datetime.strftime('Date: %Y/%m/%d Time: %H:%M:%S')

    entry = UsersHistory(
        uuid=uuid_value,
        email=data['email'],
        tab_name=data['tab_name'],
        datetime=title_datetime,
        query=data['query'],
        response=data['response'],
        doc_path=data.get('doc_path'),
        chat_type=data['chat_type']
    )
    db.session.add(entry)
    db.session.commit()

    return jsonify({'result': 'Entry added successfully'}), 201

@app.route('/get_all_tab_history_items',methods=['POST'])
def get_all_tab_history_items():
    data = request.get_json()
    email = data['email']

    entries = db.session.query(UsersHistory.tab_name,UsersHistory.chat_type) \
                        .filter_by(email=email) \
                        .group_by(UsersHistory.tab_name,UsersHistory.chat_type) \
                        .all()

    tab_names_list = []
    for entry in entries:
        tab_names_list.append({
            'tab_name': entry.tab_name,
            'chat_type': entry.chat_type
        })

    return jsonify({'result': tab_names_list}), 200

@app.route('/get_specific_tab_history',methods=['POST'])
def get_specific_tab_history():
    data = request.get_json()
    email = data['email']
    tab_name = data['tab_name']
    chat_type = data['chat_type']

    entries = db.session.query(
    UsersHistory.uuid,
    UsersHistory.query,
    UsersHistory.response,
    UsersHistory.chat_type,
    UsersHistory.doc_path,
    ).filter_by(email=email, tab_name=tab_name, chat_type=chat_type).filter(
    UsersHistory.doc_path != ""
    ).all()


    entries_list = []

    try:
        for entry in entries:
            entries_list.append({
                'uuid': entry.uuid,
                'query': entry.query,
                'response': entry.response,
                'file_name': entry.doc_path
            })
    except Exception as e:
        print(f"An error occurred: {e}")

    return jsonify({'result': entries_list}), 200

##########
@app.route('/doc_summarization', methods=['POST'])
def doc_summarization():
    # Check if the file is present
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded.'}), 400

    # Get the uploaded file
    file = request.files['file']
    tab_name = request.form['tab_name']
    emailID = request.form['email']

        # check if the file is valid PDF
    if not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Invalid file format. Please upload a PDF.'}), 400

    # create the directory if it doesn't exist
    target_directory = os.path.join(UPLOAD_FOLDER, emailID)
    os.makedirs(target_directory, exist_ok=True)

    # create a unique filename for the uploaded file
    filename = f'{os.urandom(16).hex()}.pdf'

    filepath = os.path.join(target_directory, filename)
    # save the file to the uploads folder
    file.save(filepath)


    # extract text from the PDF
    with open(os.path.join(target_directory, filename), 'rb') as f:
        # Replace this line with your chosen PDF-to-text conversion library
        text_data = convert_pdf_to_text(f)

    sentences = sent_tokenize(text_data)

    # initialize variables
    current_chunk = []
    current_chunk_size = 0
    max_chunk_size = 1024
    chunks = []

    # iterate through sentences to form chunks
    for sentence in sentences:
        current_chunk.append(sentence)
        current_chunk_size += len(sentence.split())        
        # if the current chunk size exceeds the maximum allowed
        if current_chunk_size >= max_chunk_size:
            chunks.append(' '.join(current_chunk))
            current_chunk = []
            current_chunk_size = 0

    # handle any remaining sentences
    if current_chunk:
        chunks.append(' '.join(current_chunk))

    # print the length of each chunk
    sys_prompt = """Generate a summary that is clear, concise, and accurate for the following text. Summarize the content point-to-point, focusing on the most important topics. Present the summary in simple and easy-to-understand language. Ensure that the key information is highlighted and the overall summary provides a comprehensive understanding of the given text."""

    result = ""
    for i, chunk in enumerate(chunks, 1):
        result =result + summarization_url.predict(
		sys_prompt,	# str  in 'system_prompt' Textbox component
		chunk,	# str  in 'text_input' Textbox component
		api_name="/predict"
        )
        # return the result for the current chunk

    data = {
    'email': emailID,
    'query': "Summarize the following doc",
    'response': result,
    'doc_path': filepath,
    'tab_name':tab_name,
    # 'datetime':
    'chat_type': 'Doc Summary'
    }

    # Make a POST request to the '/add_user_history' endpoint
    requests.post('http://localhost:5000/add_user_history', json=data)

    
    # return the chunked tokens as response
    return jsonify({'result': result})
##########

import requests

def get_final_pdf(input_string):
    endpoint_url = 'https://example.com/your-endpoint'  # Replace with the actual URL

    # Define the input data (string) to be sent in the request
    data = {'input_string': input_string}

    try:
        # Make a POST request to the endpoint with the input data
        response = requests.post(endpoint_url, json=data)

        # Check if the request was successful (status code 200)
        if response.status_code == 200:
            # Extract the string from the response
            output_string = response.json().get('output_string', '')
            return output_string
        else:
            # Handle unsuccessful request (e.g., print error message)
            print(f"Error: {response.status_code}, {response.text}")
            return None
    except requests.RequestException as e:
        # Handle exceptions (e.g., connection error)
        print(f"Request Exception: {e}")
        return None

@app.route('/upload_doc_for_chat', methods=['POST'])
async def upload_doc_for_chat():
    try:
        if 'file' in request.files:
            file = request.files['file']
            if file.filename.endswith('.pdf'):
                pdf_content = file.read()
                pdf_content_base64 = base64.b64encode(pdf_content).decode('utf-8')
                output_string = get_final_pdf(pdf_content_base64)
                result = chat_with_doc_url.predict(
                    "",
                    output_string,
                    api_name="/predict",
                )
                return jsonify({'result': result})
            else:
                return jsonify({'error': 'Invalid file format. Please upload a PDF.'}), 400
        else:
            return jsonify({'error': 'File not provided.'}), 400
    except Exception as e:
        return jsonify({'result': 'file will be uploaded'}), 400

@app.route('/chat-with-doc', methods=['POST'])
async def chat_with_doc():
    try:
        data = request.get_json()
        prompt = data['prompt']
        emailID = data['email']
        tab_name = data['tab_name']
        filename = data['file_name']
        print(filename)
        result = chat_with_doc_url.predict(
            prompt,
            "",
            api_name="/predict"
        )
        print(data)
        data = {
        'email': emailID,
        'query': prompt,
        'response': result,
        'tab_name' : tab_name,
        'doc_path': "",
        'doc_path':filename,
        'chat_type': 'chat-with-doc'
        }

        # Make a POST request to the '/add_user_history' endpoint
        response = requests.post('http://localhost:5000/add_user_history', json=data)

        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'result': "Something went wrong"})


@app.route('/grammar_correction', methods=['POST'])
def grammar_correction():
    data = request.get_json()
    prompt = data['prompt']
    email = data['email']
    tab_name = data['tab_name']

    client = Client(summarization_url)

    result = client.predict(
        prompt,
        api_name="/predict"
    )

    data = {
    'email': email,
    'query': prompt,
    'response': result,
    'tab_name' : tab_name,
    'doc_path': "",
    'chat_type': "grammar"
    }

    # Make a POST request to the '/add_user_history' endpoint
    response = requests.post('http://localhost:5000/add_user_history', json=data)


    return jsonify({'Result': result})

@app.route('/chatbot', methods=['POST'])
def chatbot():
    data = request.get_json()
    prompt = data['prompt']
    emailID = data['email']
    tab_name = data['tab_name']

    client = Client(summarization_url)

    result = client.predict(
        prompt,
        api_name="/predict"
    )

    data = {
    'email': email,
    'query': prompt,
    'response': result,
    'tab_name' : tab_name,
    'doc_path': "",
    'chat_type': "chatbot"
    }

    # Make a POST request to the '/add_user_history' endpoint
    response = requests.post('http://localhost:5000/add_user_history', json=data)


    return jsonify({'Result': result})

@app.route('/')
def hello_world():
    return 'Hello, World! This is your Flask API.'

@app.route('/document_summarization', methods=['POST'])
def document_summarization():
    # Extract user_id and file from the form-data
    emailID = request.form['email']
    file = request.files['file']
    tab_name = request.form['tab_name']

    # Check if a file is received and if it's a PDF
    if file and file.filename.endswith('.pdf'):
        # Secure the filename and define the save path
        filename = file.filename
        # save_path = os.path.join('D:\\hackathon\\almost_there\\testing\\api_testing\\uploads', filename)
        target_directory = os.path.join(UPLOAD_FOLDER, "UserDocFolder")
        os.makedirs(target_directory, exist_ok=True)
        print(filename)
        file.save(os.path.join(target_directory, filename))
        # # Save the file
        # file.save(save_path)
        section_list = ["abstract","introduction","methodology","intro","references","method", "approach"]
        sections = extract_sections(os.path.join(target_directory,filename),section_list)

        filepath = os.path.join(target_directory, filename)
        print(filepath)
        # save the file to the uploads folder
        required_list = ["abstract","introduction","methodology","intro","method", "approach"]
        extracted_text = ""
        for section in section_list:
            extracted_text += sections[section] 
    else:
        extracted_text = "Something went wrong... please try again"


    result = summarization_url.predict(
		extracted_text,	# str  in 'article' Textbox component
		api_name="/predict"
    )
    data = {
    'email': emailID,
    'query': "Summarize the following doc",
    'response': result,
    'doc_path': filepath,
    'tab_name':tab_name,
    'chat_type': 'summarization'
    }

    # Make a POST request to the '/add_user_history' endpoint
    requests.post('http://localhost:5000/add_user_history', json=data)


    return jsonify({"response": result})


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run()
