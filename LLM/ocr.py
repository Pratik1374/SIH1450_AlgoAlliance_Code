from __future__ import print_function
import fitz  # PyMuPDF
import io
from PIL import Image
import os
import pytesseract

from flask import Flask, request, jsonify, send_file
from datetime import datetime
from flask_cors import CORS
from pyngrok import ngrok
import requests
import base64

OUTPUT_FOLDER = "D:\\hackathon2023_override\\ocr\\received_docs"
IMAGE_FOLDER = "D:\hackathon2023_override\ocr\images"

def extract_images_from_pdf(pdf_path,output_folder = IMAGE_FOLDER ):
    # Open the PDF file
    pdf_document = fitz.open(pdf_path)

    for page_number in range(pdf_document.page_count):
        page = pdf_document[page_number]

        images = page.get_images(full=True)
        for img_index, img_info in enumerate(images):
            img_index += 1
            image_index = img_info[0]

            # Get the image
            base_image = pdf_document.extract_image(image_index)
            image_bytes = base_image["image"]

            # Convert image bytes to a PIL Image
            image = Image.open(io.BytesIO(image_bytes))

            # Save the image to a file as PNG
            image_filename = f"{output_folder}/page{page_number + 1}_img{img_index}.png"
            image.save(image_filename, format="PNG")

    # Close the PDF file
    pdf_document.close()

def get_ocr_text(image_folder):
    data = ""
    for path in os.listdir(image_folder):
        abs_path = os.path.join(image_folder,path)
        img = Image.open(abs_path)
        text = pytesseract.image_to_string(img)
        data+=text+"\n"
    return data
def print_descr(annot):
        """Print a short description to the right of each annot rect."""
        annot.parent.insert_text(
            annot.rect.br + (10, -5), "%s annotation" % annot.type[1], color=red
        )
def make_pdf(data,file_name):
    red = (1, 0, 0)
    blue = (0, 0, 1)
    gold = (1, 1, 0)
    green = (0, 1, 0)

    displ = fitz.Rect(0, 50, 0, 50)
    r = fitz.Rect(72, 72, 220, 100)
    t1 = data

    doc = fitz.open(file_name)
    page = doc.new_page()

    page.set_rotation(0)

    annot = page.add_caret_annot(r.tl)
    print_descr(annot)

    doc.save("D:\hackathon2023_override\ocr\changed"+"\\"+file_name, deflate=True)
    return doc
def save_pdf(pdf_content, output_folder=OUTPUT_FOLDER):
    # Create the directory if it doesn't exist
    os.makedirs(output_folder, exist_ok=True)

    # Generate a filename based on the current datetime
    current_datetime = datetime.now().strftime("%Y%m%d%H%M%S")
    output_filename = os.path.join(output_folder, f"{current_datetime}.pdf")

    # Write the PDF content to the file
    with open(output_filename, "wb") as pdf_file:
        pdf_file.write(pdf_content)

    return output_filename

app = Flask(__name__)
@app.route('/square', methods=['POST'])
def get_ocr_pdf():
    data = data["input_string"]
    data_pdf = base64.b64decode(data)
    file_name = save_pdf(data_pdf)
    extract_images_from_pdf(file_name)
    text = get_ocr_text(IMAGE_FOLDER)
    doc = make_pdf(text,file_name)
    return_pdf = base64.b64encode(doc)

    return jsonify({'output_string': return_pdf})