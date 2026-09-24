import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748b"))
        
        if self._pageNumber > 1:
            self.drawString(54, 750, "Smart Hive AI-IoT — Technical Implementation Plan")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
            
        text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, text)
        self.drawString(54, 36, "CONFIDENTIAL — Smart Hive AI-IoT Architecture & Implementation Plan")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        
        self.restoreState()

def build_pdf():
    pdf_filename = r"c:\Users\Radha\OneDrive\Desktop\Smart Hive\Smart_Hive_Implementation_Plan.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#d97706"),
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#475569"),
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=17,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=12,
        bulletIndent=4,
        spaceAfter=3
    )

    caption_style = ParagraphStyle(
        'Caption',
        parent=styles['Italic'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#64748b"),
        alignment=1,
        spaceBefore=4,
        spaceAfter=10
    )

    story = []

    # Title Banner
    story.append(Paragraph("Smart Hive AI-IoT Monitoring System", title_style))
    story.append(Paragraph("Visual Technical Design Document & Implementation Plan", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#d97706"), spaceAfter=12))

    # Executive Summary
    story.append(Paragraph("Executive Summary", h1_style))
    story.append(Paragraph(
        "The <b>Smart Hive AI-IoT System</b> is an end-to-end edge-cloud monitoring platform designed for real-time beehive health diagnostics, audio spectrogram disease evaluation, 30-day honey yield forecasting (LSTM), and cryptographic origin verification (SHA-256 blockchain audit chain).",
        body_style
    ))

    # Section 1: User Flow Diagram
    story.append(Paragraph("1. End-to-End User Navigation Flow", h1_style))
    story.append(Paragraph(
        "The complete user flow maps interaction from the main landing page through the interactive dashboard overview, individual hive telemetry inspection, acoustic analysis, yield forecasting, and sensor operational mode selection (Mock Engine vs Live IoT ESP32).",
        body_style
    ))

    img_uf_path = r"c:\Users\Radha\OneDrive\Desktop\Smart Hive\smart_hive_user_flow_diagram.png"
    if os.path.exists(img_uf_path):
        story.append(Image(img_uf_path, width=6.8*inch, height=3.8*inch))
        story.append(Paragraph("Figure 1: Complete Smart Hive User Navigation Flow Diagram", caption_style))

    story.append(PageBreak())

    # Section 2: System Architecture
    story.append(Paragraph("2. System Architecture Overview", h1_style))
    story.append(Paragraph(
        "The system employs a 4-layered architecture bridging Data Input, Edge Compute, Cloud Processing, and Dashboard Visualizations.",
        body_style
    ))

    img_arch_path = r"c:\Users\Radha\OneDrive\Desktop\Smart Hive\smart_hive_architecture_diagram.png"
    if os.path.exists(img_arch_path):
        story.append(Image(img_arch_path, width=6.8*inch, height=3.8*inch))
        story.append(Paragraph("Figure 2: 3D System Architecture Breakdown", caption_style))

    # Section 3: Hardware Integration
    story.append(PageBreak())
    story.append(Paragraph("3. IoT Hardware Integration & Schematic", h1_style))
    story.append(Paragraph(
        "Industrial sensor components mounted inside the Langstroth hive box communicate via I2C, I2S, and HX711 interfaces to an ESP32-S3 microcontroller operating on a 15-minute low-power deep sleep cycle.",
        body_style
    ))

    img_hw_path = r"c:\Users\Radha\OneDrive\Desktop\Smart Hive\smart_hive_hardware_setup.png"
    if os.path.exists(img_hw_path):
        story.append(Image(img_hw_path, width=6.8*inch, height=3.8*inch))
        story.append(Paragraph("Figure 3: Technical Hardware Schematic & Component Callouts", caption_style))

    # Section 4: Dashboard UI
    story.append(PageBreak())
    story.append(Paragraph("4. Real-Time Glassmorphic Dashboard Specification", h1_style))
    story.append(Paragraph(
        "The web interface displays real-time radial telemetry gauges, audio spectrogram waveforms, yield bar charts, alert feeds, and cryptographic audit proofs.",
        body_style
    ))

    img_ui_path = r"c:\Users\Radha\OneDrive\Desktop\Smart Hive\smart_hive_dashboard_ui.png"
    if os.path.exists(img_ui_path):
        story.append(Image(img_ui_path, width=6.8*inch, height=3.8*inch))
        story.append(Paragraph("Figure 4: Glassmorphic Dark Theme Dashboard Interface", caption_style))

    story.append(Paragraph("Core Analytical Capabilities:", h1_style))
    story.append(Paragraph("• <b>Audio Spectrogram CNN:</b> Instant evaluation of bee hums (Healthy ~225Hz vs Queenless/Mites <160Hz).", bullet_style))
    story.append(Paragraph("• <b>Yield Forecasting LSTM:</b> Time-series linear prediction modeling 30-day honey accumulation.", bullet_style))
    story.append(Paragraph("• <b>SHA-256 Authenticity Chain:</b> Deterministic block signatures preventing honey origin fraud.", bullet_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Implementation Plan PDF built successfully: {pdf_filename}")

if __name__ == '__main__':
    build_pdf()
