---
name: pdf
description: "Comprehensive PDF manipulation toolkit for extracting text and tables, creating new PDFs, merging/splitting documents, and handling forms. Use when filling PDF forms or programmatically processing, generating, or analyzing PDF documents."
compatibility: "OpenCode"
metadata:
  author: openclaw/skillmd
  version: "1.0.0"
---

# PDF Processing Guide

## When This Skill Activates

Activate when the user asks to:
- Extract text or tables from PDFs
- Create, merge, split, or rotate PDFs
- Add watermarks or password protection
- OCR scanned PDFs
- Fill PDF forms
- Convert PDFs to text

## Quick Start
```python
from pypdf import PdfReader, PdfWriter

# Read a PDF
reader = PdfReader("document.pdf")
print(f"Pages: {len(reader.pages)}")

# Extract text
text = ""
for page in reader.pages:
    text += page.extract_text()
```

## Python Libraries

### pypdf - Basic Operations

#### Merge PDFs
```python
from pypdf import PdfWriter, PdfReader

writer = PdfWriter()
for pdf_file in ["doc1.pdf", "doc2.pdf", "doc3.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)

with open("merged.pdf", "wb") as output:
    writer.write(output)
```

#### Split PDF
```python
reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    with open(f"page_{i+1}.pdf", "wb") as output:
        writer.write(output)
```

#### Rotate Pages
```python
reader = PdfReader("input.pdf")
writer = PdfWriter()

page = reader.pages[0]
page.rotate(90)  # Rotate 90 degrees clockwise
writer.add_page(page)

with open("rotated.pdf", "wb") as output:
    writer.write(output)
```

#### Extract Metadata
```python
reader = PdfReader("document.pdf")
meta = reader.metadata
print(f"Author: {meta.author}")
print(f"Title: {meta.title}")
print(f"Subject: {meta.subject}")
print(f"Creator: {meta.creator}")
```

### pdfplumber - Text and Table Extraction

#### Extract Text
```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        print(text)
```

#### Extract Tables
```python
with pdfplumber.open("document.pdf") as pdf:
    for i, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        for j, table in enumerate(tables):
            print(f"Table {j+1} on page {i+1}:")
            for row in table:
                print(row)
```

#### Extract Tables to DataFrame
```python
import pdfplumber
import pandas as pd

with pdfplumber.open("document.pdf") as pdf:
    page = pdf.pages[0]
    table = page.extract_table()
    df = pd.DataFrame(table[1:], columns=table[0])
    print(df)
```

### reportlab - Create PDFs

#### Simple PDF
```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas("hello.pdf", pagesize=letter)
width, height = letter

c.drawString(100, height - 100, "Hello World!")
c.line(100, height - 140, 400, height - 140)
c.save()
```

#### Multi-page with Platypus
```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

doc = SimpleDocTemplate("report.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = []

story.append(Paragraph("Report Title", styles['Title']))
story.append(Spacer(1, 12))
story.append(Paragraph("This is the body text.", styles['Normal']))

doc.build(story)
```

## Command-Line Tools

### pdftotext (poppler-utils)
```bash
# Extract text
pdftotext input.pdf output.txt

# Preserve layout
pdftotext -layout input.pdf output.txt

# Specific pages
pdftotext -f 1 -l 5 input.pdf output.txt
```

### qpdf
```bash
# Merge PDFs
qpdf --empty --pages file1.pdf file2.pdf -- merged.pdf

# Split pages
qpdf input.pdf --pages . 1-5 -- pages1-5.pdf

# Rotate pages
qpdf input.pdf output.pdf --rotate=+90:1

# Remove password
qpdf --password=mypassword --decrypt encrypted.pdf decrypted.pdf

# Linearize (optimize for web)
qpdf --linearize input.pdf output.pdf
```

## Common Tasks

### OCR Scanned PDFs
```python
import pytesseract
from pdf2image import convert_from_path

images = convert_from_path('scanned.pdf')
text = ""
for i, image in enumerate(images):
    text += f"Page {i+1}:\n"
    text += pytesseract.image_to_string(image)
    text += "\n\n"
```

### Add Watermark
```python
from pypdf import PdfReader, PdfWriter

watermark = PdfReader("watermark.pdf").pages[0]
reader = PdfReader("document.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.merge_page(watermark)
    writer.add_page(page)

with open("watermarked.pdf", "wb") as output:
    writer.write(output)
```

### Password Protection
```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()

for page in reader.pages:
    writer.add_page(page)

writer.encrypt("userpassword", "ownerpassword")

with open("encrypted.pdf", "wb") as output:
    writer.write(output)
```

### Fill PDF Forms
```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("form.pdf")
writer = PdfWriter()
writer.append(reader)

# Get form field names
fields = reader.get_fields()
for name, field in fields.items():
    print(f"Field: {name}, Type: {field.get('/FT')}")

# Fill fields
writer.update_page_form_field_values(
    writer.pages[0],
    {"field_name": "value", "another_field": "another_value"}
)

with open("filled_form.pdf", "wb") as output:
    writer.write(output)
```

### PDF to Images
```python
from pdf2image import convert_from_path

# Convert all pages
images = convert_from_path('document.pdf', dpi=300)
for i, image in enumerate(images):
    image.save(f'page_{i+1}.png', 'PNG')

# Convert specific pages
images = convert_from_path('document.pdf', first_page=1, last_page=3)
```

## Installation Commands

```bash
# Core libraries
pip install pypdf pdfplumber reportlab

# OCR support
pip install pytesseract pdf2image
# Also needs: apt-get install tesseract-ocr poppler-utils

# CLI tools
apt-get install poppler-utils qpdf

# All at once
pip install pypdf pdfplumber reportlab pytesseract pdf2image
```

## Quick Reference

| Task | Best Tool | Command/Code |
|------|-----------|--------------|
| Read/extract text | pdfplumber | `page.extract_text()` |
| Extract tables | pdfplumber | `page.extract_tables()` |
| Merge PDFs | pypdf | `writer.add_page(page)` |
| Split PDFs | pypdf | One page per PdfWriter |
| Rotate pages | pypdf | `page.rotate(90)` |
| Create PDFs | reportlab | Canvas or Platypus |
| Fill forms | pypdf | `update_page_form_field_values()` |
| Add watermark | pypdf | `page.merge_page(watermark)` |
| Password protect | pypdf | `writer.encrypt()` |
| OCR scanned PDFs | pytesseract + pdf2image | Convert to image first |
| CLI text extract | poppler-utils | `pdftotext input.pdf` |
| CLI merge/split | qpdf | `qpdf --empty --pages ...` |
| PDF to images | pdf2image | `convert_from_path()` |
| Extract metadata | pypdf | `reader.metadata` |
