import os
import sys
import json
import time
import PyPDF2
from dotenv import load_dotenv

load_dotenv()


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
        print(f" ⤷ Extracted text from '{os.path.basename(pdf_path)}' in {duration:.2f}s", file=sys.stderr)

        return text.strip()

    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {e}", file=sys.stderr)
        return ""


def process_documents(user_id, base_dir):
    """Process all PDFs in user's upload directories"""
    
    print(f"\n=== Extracting text for user {user_id} ===", file=sys.stderr)
    
    extracted_data = {
        "certificates": [],
        "projects": [],
        "other": []
    }
    
    # Check each category directory
    categories = {
        "Certificates": "certificates",
        "Project": "projects",
        "Other": "other"
    }
    
    for dir_name, key in categories.items():
        category_dir = os.path.join(base_dir, dir_name)
        
        if not os.path.exists(category_dir):
            continue
            
        for filename in os.listdir(category_dir):
            # Only process files for this user
            if not filename.startswith(f"{user_id}_"):
                continue
                
            if filename.lower().endswith('.pdf'):
                pdf_path = os.path.join(category_dir, filename)
                print(f"\nProcessing: {filename}", file=sys.stderr)
                
                text = extract_pdf_text(pdf_path)
                
                if text:
                    extracted_data[key].append({
                        "fileName": filename,
                        "text": text
                    })
    
    return extracted_data


def main():
    if len(sys.argv) < 2:
        print("Usage: python exractor.py <user_id> [base_dir]", file=sys.stderr)
        sys.exit(1)
    
    user_id = sys.argv[1]
    base_dir = sys.argv[2] if len(sys.argv) > 2 else "uploads"
    
    # Extract documents
    extracted_data = process_documents(user_id, base_dir)
    
    # Output as JSON to stdout (Node.js will read this)
    print(json.dumps(extracted_data, ensure_ascii=False))
    
    # Summary to stderr (won't interfere with JSON output)
    total = len(extracted_data["certificates"]) + len(extracted_data["projects"]) + len(extracted_data["other"])
    print(f"\n✔ Extracted {total} documents", file=sys.stderr)


if __name__ == "__main__":
    main()
