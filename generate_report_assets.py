import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from PIL import Image, ImageDraw, ImageFont

ASSETS_DIR = r"C:\Users\aivil\Downloads\dbms\report_assets"
os.makedirs(ASSETS_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. CHAPTER 3: VISUAL ER DIAGRAM
# -------------------------------------------------------------
def generate_er_diagram():
    fig, ax = plt.subplots(figsize=(14, 9), dpi=300)
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 9)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    # Palette
    entity_bg = '#e8f0fe'
    entity_border = '#1a73e8'
    rel_bg = '#fef7e0'
    rel_border = '#f9ab00'
    text_color = '#202124'

    def draw_entity(x, y, w, h, name, attrs):
        rect = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.08,rounding_size=0.15",
                                      facecolor=entity_bg, edgecolor=entity_border, linewidth=2)
        ax.add_patch(rect)
        ax.text(x + w/2, y + h - 0.28, name, fontsize=11, fontweight='bold', ha='center', va='center', color='#0d47a1')
        ax.plot([x, x+w], [y + h - 0.48, y + h - 0.48], color=entity_border, lw=1)
        
        for idx, attr in enumerate(attrs):
            y_pos = y + h - 0.72 - (idx * 0.24)
            is_pk = "PK" in attr
            is_fk = "FK" in attr
            font_w = 'bold' if is_pk else 'normal'
            col = '#b71c1c' if is_pk else ('#0d47a1' if is_fk else '#374151')
            ax.text(x + 0.15, y_pos, attr, fontsize=8.5, fontweight=font_w, va='center', color=col)

    def draw_diamond(x, y, w, h, text):
        points = [[x + w/2, y], [x + w, y + h/2], [x + w/2, y + h], [x, y + h/2]]
        poly = patches.Polygon(points, facecolor=rel_bg, edgecolor=rel_border, linewidth=1.8)
        ax.add_patch(poly)
        ax.text(x + w/2, y + h/2, text, fontsize=8.5, fontweight='bold', ha='center', va='center', color='#b06000')

    # Draw Entities
    draw_entity(0.5, 5.8, 2.8, 2.2, "DEPARTMENTS", ["dept_id (PK)", "dept_name", "code"])
    draw_entity(5.5, 5.8, 3.0, 2.8, "USERS", ["user_id (PK)", "dept_id (FK)", "email", "password_hash", "full_name", "role"])
    draw_entity(10.5, 5.8, 3.0, 2.6, "VENUES", ["venue_id (PK)", "dept_id (FK)", "name", "location", "capacity", "requires_approval"])
    
    draw_entity(5.5, 1.8, 3.0, 3.0, "BOOKINGS", ["booking_id (PK)", "user_id (FK)", "venue_id (FK)", "dept_id (FK)", "start_time", "end_time", "status"])
    
    draw_entity(0.5, 1.8, 2.8, 2.2, "APPROVAL_LOGS", ["log_id (PK)", "booking_id (FK)", "approver_id (FK)", "action_status", "comments", "timestamp"])
    
    draw_entity(10.5, 1.8, 3.0, 2.2, "RESOURCES", ["resource_id (PK)", "resource_name", "total_quantity"])
    
    draw_entity(10.5, 0.2, 3.0, 1.4, "BOOKING_RESOURCES", ["booking_id (PK,FK)", "resource_id (PK,FK)", "quantity_allocated"])

    # Relationships (Diamonds)
    draw_diamond(3.6, 6.7, 1.5, 0.8, "Enrolls / Employs\n(1 : N)")
    draw_diamond(8.8, 6.7, 1.4, 0.8, "Controls\n(1 : N)")
    draw_diamond(6.3, 5.0, 1.4, 0.7, "Requests\n(1 : N)")
    draw_diamond(8.8, 3.4, 1.4, 0.7, "Reserves\n(1 : N)")
    draw_diamond(3.6, 2.7, 1.5, 0.7, "Generates\n(1 : N)")
    draw_diamond(8.8, 0.5, 1.4, 0.7, "Allocates\n(M : N)")

    # Connecting Lines with Cardinalities
    def connect(p1, p2, text1="", text2=""):
        ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color='#5f6368', lw=1.5, zorder=1)
        if text1:
            ax.text(p1[0], p1[1], text1, fontsize=9, fontweight='bold', color='#1a73e8')
        if text2:
            ax.text(p2[0], p2[1], text2, fontsize=9, fontweight='bold', color='#1a73e8')

    connect([3.3, 7.1], [3.6, 7.1], " 1")
    connect([5.1, 7.1], [5.5, 7.1], "", "N ")
    
    connect([10.5, 7.1], [10.2, 7.1], " N")
    connect([8.8, 7.1], [8.5, 7.1], "", "1 ")
    
    connect([7.0, 5.8], [7.0, 5.7], " 1")
    connect([7.0, 5.0], [7.0, 4.8], "", " N")
    
    connect([10.5, 6.0], [9.5, 4.1], " 1")
    connect([9.5, 3.4], [8.5, 3.3], "", " N")
    
    connect([5.5, 3.1], [5.1, 3.1], " 1")
    connect([3.6, 3.1], [3.3, 3.1], "", " N")

    connect([8.5, 2.2], [10.5, 0.9], " 1")
    connect([10.5, 2.2], [11.0, 1.6], " 1")

    plt.title("Figure 3.1: Complete Entity-Relationship (ER) Diagram\nSmart Campus Event & Resource Booking System", 
              fontsize=14, fontweight='bold', pad=15, color='#002060')
    plt.tight_layout()
    out_path = os.path.join(ASSETS_DIR, "chapter3_er_diagram.png")
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print("ER Diagram generated:", out_path)

# -------------------------------------------------------------
# 2. CHAPTER 4.2: RELATIONAL SCHEMA DIAGRAM WITH PK->FK ARROWS
# -------------------------------------------------------------
def generate_schema_diagram():
    fig, ax = plt.subplots(figsize=(15, 10), dpi=300)
    ax.set_xlim(0, 15)
    ax.set_ylim(0, 10)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    def draw_table_box(x, y, w, h, title, cols):
        # Header
        hdr = patches.Rectangle((x, y + h - 0.45), w, 0.45, facecolor='#002060', edgecolor='#002060')
        ax.add_patch(hdr)
        ax.text(x + w/2, y + h - 0.22, title, color='white', fontsize=10.5, fontweight='bold', ha='center', va='center')
        # Body
        body = patches.Rectangle((x, y), w, h - 0.45, facecolor='#f8fafc', edgecolor='#cbd5e1', lw=1.5)
        ax.add_patch(body)
        
        for idx, col in enumerate(cols):
            yp = y + h - 0.75 - (idx * 0.28)
            is_pk = "PK" in col
            is_fk = "FK" in col
            f_w = 'bold' if (is_pk or is_fk) else 'normal'
            txt_col = '#b91c1c' if is_pk else ('#1d4ed8' if is_fk else '#1e293b')
            ax.text(x + 0.15, yp, col, fontsize=8.5, fontweight=f_w, color=txt_col, va='center')

    # Tables layout
    draw_table_box(0.5, 7.0, 3.8, 2.2, "DEPARTMENTS", ["dept_id [PK]", "dept_name [UNIQUE]", "code [UNIQUE]"])
    draw_table_box(5.5, 7.0, 4.2, 2.7, "USERS", ["user_id [PK]", "dept_id [FK -> DEPARTMENTS]", "email [UNIQUE]", "password_hash", "full_name", "role"])
    draw_table_box(10.5, 7.0, 4.0, 2.7, "VENUES", ["venue_id [PK]", "dept_id [FK -> DEPARTMENTS]", "name [UNIQUE]", "location", "capacity", "requires_approval"])
    
    draw_table_box(5.5, 2.8, 4.2, 3.2, "BOOKINGS", ["booking_id [PK]", "user_id [FK -> USERS]", "venue_id [FK -> VENUES]", "dept_id [FK -> DEPARTMENTS]", "start_time", "end_time", "status"])
    draw_table_box(0.5, 2.8, 4.0, 2.9, "APPROVAL_LOGS", ["log_id [PK]", "booking_id [FK -> BOOKINGS]", "approver_id [FK -> USERS]", "action_status", "comments", "timestamp"])
    draw_table_box(10.5, 3.5, 4.0, 2.2, "RESOURCES", ["resource_id [PK]", "resource_name [UNIQUE]", "total_quantity"])
    draw_table_box(10.5, 0.8, 4.0, 2.0, "BOOKING_RESOURCES", ["booking_id [PK, FK -> BOOKINGS]", "resource_id [PK, FK -> RESOURCES]", "quantity_allocated"])

    # Draw Curved Arrows for Foreign Keys
    def draw_fk_arrow(start_pt, end_pt, col='#2563eb'):
        arrow = patches.FancyArrowPatch(start_pt, end_pt, connectionstyle="arc3,rad=-0.25",
                                        arrowstyle="->", mutation_scale=14, lw=1.8, color=col)
        ax.add_patch(arrow)

    # USERS.dept_id -> DEPARTMENTS.dept_id
    draw_fk_arrow((5.5, 8.8), (4.3, 8.8), '#2563eb')
    # VENUES.dept_id -> DEPARTMENTS.dept_id
    draw_fk_arrow((10.5, 8.8), (4.3, 8.4), '#2563eb')
    # BOOKINGS.user_id -> USERS.user_id
    draw_fk_arrow((7.6, 5.4), (7.6, 7.0), '#16a34a')
    # BOOKINGS.venue_id -> VENUES.venue_id
    draw_fk_arrow((9.7, 5.1), (11.0, 7.0), '#d97706')
    # BOOKINGS.dept_id -> DEPARTMENTS.dept_id
    draw_fk_arrow((5.5, 4.8), (3.0, 7.0), '#9333ea')
    # APPROVAL_LOGS.booking_id -> BOOKINGS.booking_id
    draw_fk_arrow((4.5, 4.8), (5.5, 5.6), '#dc2626')
    # BOOKING_RESOURCES.booking_id -> BOOKINGS.booking_id
    draw_fk_arrow((10.5, 2.1), (9.7, 3.4), '#0891b2')
    # BOOKING_RESOURCES.resource_id -> RESOURCES.resource_id
    draw_fk_arrow((12.5, 2.8), (12.5, 3.5), '#ea580c')

    # Legend
    leg_box = patches.Rectangle((0.5, 0.5), 9.2, 1.8, facecolor='#f1f5f9', edgecolor='#94a3b8', lw=1)
    ax.add_patch(leg_box)
    ax.text(0.7, 1.9, "SCHEMA ANNOTATION & REFERENTIAL INTEGRITY CONSTRAINTS:", fontsize=9.5, fontweight='bold', color='#0f172a')
    ax.text(0.7, 1.55, "• Underlined / Red: PRIMARY KEY (PK)", fontsize=8.5, fontweight='bold', color='#b91c1c')
    ax.text(0.7, 1.25, "• Blue: FOREIGN KEY (FK) with Referential Direction Arrow (FK -> PK)", fontsize=8.5, fontweight='bold', color='#1d4ed8')
    ax.text(0.7, 0.95, "• Cascading Rules: ON DELETE CASCADE (Bookings, Allocations, Logs); ON DELETE SET NULL (Departments)", fontsize=8.5, color='#334155')
    ax.text(0.7, 0.65, "• Domain Checks: capacity > 0, total_quantity >= 0, quantity_allocated > 0, end_time > start_time", fontsize=8.5, color='#334155')

    plt.title("Figure 4.1: Relational Schema Diagram with Foreign Key Mappings\nSmart Campus Event & Resource Booking System (3NF Normalized)", 
              fontsize=14, fontweight='bold', pad=15, color='#002060')
    plt.tight_layout()
    out_path = os.path.join(ASSETS_DIR, "chapter4_relational_schema.png")
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print("Schema Diagram generated:", out_path)

generate_er_diagram()
generate_schema_diagram()
