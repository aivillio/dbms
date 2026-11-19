import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

REPORT_SRC = r"C:\Users\aivil\Downloads\dbms\DBMS_Mini_Project_Report.docx"
REPORT_DEST_DBMS = r"C:\Users\aivil\Downloads\dbms\DBMS_Mini_Project_Report.docx"
REPORT_DEST_DOWNLOADS = r"C:\Users\aivil\Downloads\DBMS_Mini_Project_Report.docx"
ASSETS_DIR = r"C:\Users\aivil\Downloads\dbms\report_assets"

doc = docx.Document(REPORT_SRC)

def add_image_and_caption(target_p, img_filename, caption_text, width=Inches(6.2)):
    img_path = os.path.join(ASSETS_DIR, img_filename)
    if not os.path.exists(img_path):
        print(f"Warning: Image {img_path} not found!")
        return
    
    # Insert paragraph before target_p
    p_img = target_p.insert_paragraph_before()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_before = Pt(8)
    p_img.paragraph_format.space_after = Pt(4)
    run_img = p_img.add_run()
    run_img.add_picture(img_path, width=width)
    
    p_cap = target_p.insert_paragraph_before()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(2)
    p_cap.paragraph_format.space_after = Pt(12)
    run_cap = p_cap.add_run(caption_text)
    run_cap.font.name = "Calibri"
    run_cap.font.size = Pt(9.5)
    run_cap.font.italic = True
    run_cap.font.bold = True
    run_cap.font.color.rgb = RGBColor(0x33, 0x41, 0x55) # Slate 700

# 1. CHAPTER 3: Insert ER Diagram before 3.1 Entity Summary & Cardinalities
for i, p in enumerate(doc.paragraphs):
    if p.text.strip().startswith("3.1 Entity Summary"):
        print(f"Inserting ER Diagram before paragraph {i}...")
        add_image_and_caption(
            p,
            "chapter3_er_diagram.png",
            "Figure 3.1: Complete Entity-Relationship (ER) Diagram (Smart Campus Booking System)",
            width=Inches(6.3)
        )
        break

# 2. CHAPTER 4.2: Insert Relational Schema Diagram before Chapter 5 DDL Statements
for i, p in enumerate(doc.paragraphs):
    if p.text.strip().startswith("5. DDL STATEMENTS"):
        print(f"Inserting Relational Schema Diagram before paragraph {i}...")
        add_image_and_caption(
            p,
            "chapter4_relational_schema.png",
            "Figure 4.1: Relational Schema Diagram with Foreign Key Mappings (3NF Normalized)",
            width=Inches(6.3)
        )
        break

# 3. CHAPTER 5: Insert DDL Terminal Screenshot before Chapter 6 DML Statements
for i, p in enumerate(doc.paragraphs):
    if p.text.strip().startswith("6. DML STATEMENTS"):
        print(f"Inserting DDL Terminal Screenshot before paragraph {i}...")
        add_image_and_caption(
            p,
            "chapter5_ddl_terminal.png",
            "Figure 5.1: MySQL Terminal Execution — Schema Creation and Constraint Verification",
            width=Inches(6.2)
        )
        break

# 4. CHAPTER 6: Insert DML Screenshots before Chapter 7 Queries
for i, p in enumerate(doc.paragraphs):
    if p.text.strip().startswith("7. QUERIES"):
        print(f"Inserting DML Screenshots before paragraph {i}...")
        add_image_and_caption(
            p,
            "chapter6_dml_part1.png",
            "Figure 6.1: MySQL Terminal Output — Verified Seed Records (DEPARTMENTS, USERS, VENUES, RESOURCES)",
            width=Inches(6.2)
        )
        add_image_and_caption(
            p,
            "chapter6_dml_part2.png",
            "Figure 6.2: MySQL Terminal Output — Verified Seed Records (BOOKINGS, BOOKING_RESOURCES, APPROVAL_LOGS)",
            width=Inches(6.2)
        )
        break

# 5. CHAPTER 7: Insert Query Results Screenshot before Chapter 8
for i, p in enumerate(doc.paragraphs):
    if p.text.strip().startswith("8. STORED PROCEDURES"):
        print(f"Inserting Query Output Screenshot before paragraph {i}...")
        add_image_and_caption(
            p,
            "chapter7_queries_output.png",
            "Figure 7.1: MySQL Terminal Execution Results for Chapter 7 Queries (7.1 through 7.5)",
            width=Inches(6.2)
        )
        break

# Save updated report to both destinations
doc.save(REPORT_DEST_DBMS)
doc.save(REPORT_DEST_DOWNLOADS)
print(f"Successfully updated report at:\n  - {REPORT_DEST_DBMS}\n  - {REPORT_DEST_DOWNLOADS}")
