import os
import json
import time
import PyPDF2
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-2.5-flash')


def extract_pdf_text(pdf_path):
    """Extract text from PDF file"""
    start = time.time()

    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"

        duration = time.time() - start
        print(f" ⤷ Extracted text from '{os.path.basename(pdf_path)}' in {duration:.2f}s")

        return text.strip()

    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {e}")
        return ""


def process_pdfs_to_json(input_dir, output_json):
    """Process all PDFs in directory and save extracted text to JSON"""
    
    print("\n=== STEP 1: Extracting text from PDFs ===")
    total_start = time.time()

    pdf_data = {}

    for filename in os.listdir(input_dir):
        if filename.lower().endswith('.pdf'):
            pdf_path = os.path.join(input_dir, filename)
            print(f"\nProcessing file: {filename}")

            pdf_data[filename] = extract_pdf_text(pdf_path)

    # Write JSON duration
    json_start = time.time()
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(pdf_data, f, indent=2, ensure_ascii=False)
    json_duration = time.time() - json_start

    total_duration = time.time() - total_start

    print(f"\n✔ PDF extraction complete in {total_duration:.2f}s")
    print(f"✔ JSON saved to {output_json} in {json_duration:.2f}s")

    return pdf_data


def generate_sequelize_queries(pdf_data, output_queries_file):
    """Send PDF text to Gemini and generate Sequelize queries"""

    print("\n=== STEP 2: Generating Sequelize Queries Using Gemini ===")

    # ------------------------  
    # Timer: Preparing prompt  
    # ------------------------
    prep_start = time.time()

    schema_prompt = """
    You are an expert backend engineer.

    Generate Sequelize INSERT queries based on the database schema and extracted document text.

    STRICT OUTPUT FORMAT:
    Return ONLY a JSON ARRAY of objects.
    {
      "type": "INSERT_DOCUMENT" | "INSERT_PROJECT" | "INSERT_CERTIFICATE" | "INSERT_JOB_DESCRIPTION" | "INSERT_GENERATED_RESUME",
      "query": "SQL query string"
    }
    """

    pdf_content = "\n\n".join([
        f"File: {filename}\n{text[:4000]}"
        for filename, text in pdf_data.items()
    ])

    full_prompt = f"{schema_prompt}\n\nDocument Content:\n{pdf_content}"

    prep_duration = time.time() - prep_start
    print(f" ⤷ Prompt prepared in {prep_duration:.2f}s")

    # ------------------------
    # Timer: Gemini API call
    # ------------------------
    api_start = time.time()

    try:
        response = model.generate_content(full_prompt)
        api_duration = time.time() - api_start

        print(f" ⤷ Gemini API call completed in {api_duration:.2f}s")

        generated_text = response.text

        # ------------------------
        # Timer: JSON parsing
        # ------------------------
        parse_start = time.time()

        start_idx = generated_text.find('[')
        end_idx = generated_text.rfind(']') + 1

        if start_idx != -1 and end_idx > start_idx:
            queries_json = generated_text[start_idx:end_idx]
            queries = json.loads(queries_json)
        else:
            queries = json.loads(generated_text)

        parse_duration = time.time() - parse_start
        print(f" ⤷ Response parsed in {parse_duration:.2f}s")

        # Save queries
        save_start = time.time()
        with open(output_queries_file, 'w', encoding='utf-8') as f:
            json.dump(queries, f, indent=2, ensure_ascii=False)
        save_duration = time.time() - save_start

        print(f" ✔ Saved generated queries in {save_duration:.2f}s")
        print(f" ✔ Total queries generated: {len(queries)}")

        return queries

    except Exception as e:
        print(f"Gemini Error: {e}")
        return []


def main():
    global_start = time.time()

    input_dir = "pdfs"
    extracted_json = "extracted_text.json"
    queries_json = "sequelize_queries.json"

    os.makedirs(input_dir, exist_ok=True)

    # Step 1
    pdf_data = process_pdfs_to_json(input_dir, extracted_json)

    if not pdf_data:
        print("No PDF files found. Exiting.")
        return

    # Step 2
    queries = generate_sequelize_queries(pdf_data, queries_json)

    print("\n=== SAMPLE OUTPUT (First 3 Queries) ===")
    for i, query in enumerate(queries[:3]):
        print(f"{i+1}. {query}")

    total_runtime = time.time() - global_start
    print(f"\n=== TOTAL SCRIPT RUNTIME: {total_runtime:.2f}s ===")


if __name__ == "__main__":
    main()
