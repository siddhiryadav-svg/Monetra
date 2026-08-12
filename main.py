from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Finance Dashboard API is running"}

@app.get("/plan")
def get_plan(salary: float, savings_pct: float = 20, rent_pct: float = 28,
             food_pct: float = 17, transport_pct: float = 15, other_pct: float = 20):

    total = savings_pct + rent_pct + food_pct + transport_pct + other_pct
    if total != 100:
        other_pct = other_pct + (100 - total)

    savings = round(salary * savings_pct / 100, 2)
    rent = round(salary * rent_pct / 100, 2)
    food = round(salary * food_pct / 100, 2)
    transport = round(salary * transport_pct / 100, 2)
    other = round(salary * other_pct / 100, 2)

    essential_expenses = rent + food + transport
    essential_pct = round((essential_expenses / salary) * 100, 1)

    return {
        "salary": salary,
        "savings": savings,
        "rent": rent,
        "food": food,
        "transport": transport,
        "other": other,
        "essential_expenses": essential_expenses,
        "essential_pct": essential_pct
    }

import sqlite3

def get_db_connection():
    conn = sqlite3.connect("finance.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            month TEXT NOT NULL,
            section TEXT NOT NULL,
            category TEXT NOT NULL,
            amount REAL NOT NULL,
            user_id INTEGER
        )
    """)
    # Migration safety net: if the table already existed without user_id, add it
    existing_cols = [row["name"] for row in conn.execute("PRAGMA table_info(entries)").fetchall()]
    if "user_id" not in existing_cols:
        conn.execute("ALTER TABLE entries ADD COLUMN user_id INTEGER")
    conn.commit()
    conn.close()

init_db()

from pydantic import BaseModel

# ---------------- AUTH ----------------

from passlib.context import CryptContext
import secrets

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_users_db():
    conn = get_db_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    """)
    existing_cols = [row["name"] for row in conn.execute("PRAGMA table_info(users)").fetchall()]
    if "name" not in existing_cols:
        conn.execute("ALTER TABLE users ADD COLUMN name TEXT")
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_users_db()

def get_user_id_from_token(token: str):
    if not token:
        return None
    conn = get_db_connection()
    row = conn.execute("SELECT user_id FROM sessions WHERE token = ?", (token,)).fetchone()
    conn.close()
    return row["user_id"] if row else None

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@app.get("/me")
def get_me(token: str):
    user_id = get_user_id_from_token(token)
    if not user_id:
        return {"error": "Invalid or missing session token"}
    conn = get_db_connection()
    user = conn.execute("SELECT name, username FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    if not user:
        return {"error": "User not found"}
    return {"name": user["name"], "email": user["username"]}

class UpdateNameRequest(BaseModel):
    token: str
    name: str

@app.put("/me/name")
def update_name(req: UpdateNameRequest):
    user_id = get_user_id_from_token(req.token)
    if not user_id:
        return {"error": "Invalid or missing session token"}
    if not req.name.strip():
        return {"error": "Name cannot be empty"}
    conn = get_db_connection()
    conn.execute("UPDATE users SET name = ? WHERE id = ?", (req.name.strip(), user_id))
    conn.commit()
    conn.close()
    return {"status": "updated", "name": req.name.strip()}

class ChangePasswordRequest(BaseModel):
    token: str
    current_password: str
    new_password: str

@app.put("/me/password")
def change_password(req: ChangePasswordRequest):
    user_id = get_user_id_from_token(req.token)
    if not user_id:
        return {"error": "Invalid or missing session token"}
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not user or not pwd_context.verify(req.current_password, user["password_hash"]):
        conn.close()
        return {"error": "Current password is incorrect"}
    new_hash = pwd_context.hash(req.new_password)
    conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user_id))
    conn.commit()
    conn.close()
    return {"status": "updated"}

class ProfileUpdate(BaseModel):
    token: str
    name: str

class PasswordUpdate(BaseModel):
    token: str
    current_password: str
    new_password: str

@app.get("/profile")
def get_profile(token: str):
    user_id = get_user_id_from_token(token)
    if not user_id:
        return {"error": "Invalid or missing session token"}
    conn = get_db_connection()
    user = conn.execute("SELECT name, username FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    if not user:
        return {"error": "User not found"}
    return {"name": user["name"], "email": user["username"]}

@app.put("/profile")
def update_profile(req: ProfileUpdate):
    user_id = get_user_id_from_token(req.token)
    if not user_id:
        return {"error": "Invalid or missing session token"}
    if not req.name.strip():
        return {"error": "Name cannot be empty"}
    conn = get_db_connection()
    conn.execute("UPDATE users SET name = ? WHERE id = ?", (req.name.strip(), user_id))
    conn.commit()
    conn.close()
    return {"status": "updated", "name": req.name.strip()}

@app.put("/profile/password")
def update_password(req: PasswordUpdate):
    user_id = get_user_id_from_token(req.token)
    if not user_id:
        return {"error": "Invalid or missing session token"}
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not user or not pwd_context.verify(req.current_password, user["password_hash"]):
        conn.close()
        return {"error": "Current password is incorrect"}
    new_hash = pwd_context.hash(req.new_password)
    conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user_id))
    conn.commit()
    conn.close()
    return {"status": "updated"}

@app.post("/signup")
def signup(req: SignupRequest):
    conn = get_db_connection()
    existing = conn.execute("SELECT id FROM users WHERE username = ?", (req.email,)).fetchone()
    if existing:
        conn.close()
        return {"error": "An account with this email already exists"}

    password_hash = pwd_context.hash(req.password)
    conn.execute(
        "INSERT INTO users (name, username, password_hash) VALUES (?, ?, ?)",
        (req.name, req.email, password_hash)
    )
    conn.commit()
    user_id = conn.execute("SELECT id FROM users WHERE username = ?", (req.email,)).fetchone()["id"]

    token = secrets.token_hex(16)
    conn.execute("INSERT INTO sessions (token, user_id) VALUES (?, ?)", (token, user_id))
    conn.commit()
    conn.close()
    return {"token": token, "name": req.name, "email": req.email}

@app.post("/login")
def login(req: LoginRequest):
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE username = ?", (req.email,)).fetchone()
    if not user or not pwd_context.verify(req.password, user["password_hash"]):
        conn.close()
        return {"error": "Invalid email or password"}

    token = secrets.token_hex(16)
    conn.execute("INSERT INTO sessions (token, user_id) VALUES (?, ?)", (token, user["id"]))
    conn.commit()
    conn.close()
    return {"token": token, "name": user["name"], "email": user["username"]}

class ProfileUpdate(BaseModel):
    token: str
    name: str

@app.put("/profile")
def update_profile(req: ProfileUpdate):
    user_id = get_user_id_from_token(req.token)
    if not user_id:
        return {"error": "Invalid or missing session token"}
    conn = get_db_connection()
    conn.execute("UPDATE users SET name = ? WHERE id = ?", (req.name, user_id))
    conn.commit()
    conn.close()
    return {"status": "updated", "name": req.name}

@app.get("/profile")
def get_profile(token: str):
    user_id = get_user_id_from_token(token)
    if not user_id:
        return {"error": "Invalid or missing session token"}
    conn = get_db_connection()
    user = conn.execute("SELECT name, username FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    if not user:
        return {"error": "User not found"}
    return {"name": user["name"], "email": user["username"]}

class PasswordChangeRequest(BaseModel):
    token: str
    current_password: str
    new_password: str

@app.put("/change-password")
def change_password(req: PasswordChangeRequest):
    user_id = get_user_id_from_token(req.token)
    if not user_id:
        return {"error": "Invalid or missing session token"}
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not user or not pwd_context.verify(req.current_password, user["password_hash"]):
        conn.close()
        return {"error": "Current password is incorrect"}
    new_hash = pwd_context.hash(req.new_password)
    conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user_id))
    conn.commit()
    conn.close()
    return {"status": "updated"}

# ---------------- ENTRIES (now user-scoped) ----------------

class Entry(BaseModel):
    month: str
    section: str
    category: str
    amount: float
    token: str

@app.post("/entries")
def add_entry(entry: Entry):
    user_id = get_user_id_from_token(entry.token)
    if not user_id:
        return {"error": "Invalid or missing session token"}

    conn = get_db_connection()
    conn.execute(
        "INSERT INTO entries (month, section, category, amount, user_id) VALUES (?, ?, ?, ?, ?)",
        (entry.month, entry.section, entry.category, entry.amount, user_id)
    )
    conn.commit()
    conn.close()
    return {"status": "saved"}

@app.get("/entries")
def get_entries(month: str, token: str, section: str = None):
    user_id = get_user_id_from_token(token)
    if not user_id:
        return {"error": "Invalid or missing session token"}

    conn = get_db_connection()
    if section:
        rows = conn.execute(
            "SELECT * FROM entries WHERE month = ? AND section = ? AND user_id = ?",
            (month, section, user_id)
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM entries WHERE month = ? AND user_id = ?",
            (month, user_id)
        ).fetchall()
    conn.close()
    return [dict(row) for row in rows]

class EntryUpdate(BaseModel):
    amount: float
    token: str

@app.put("/entries/{entry_id}")
def update_entry(entry_id: int, entry: EntryUpdate):
    user_id = get_user_id_from_token(entry.token)
    if not user_id:
        return {"error": "Invalid or missing session token"}
    conn = get_db_connection()
    conn.execute(
        "UPDATE entries SET amount = ? WHERE id = ? AND user_id = ?",
        (entry.amount, entry_id, user_id)
    )
    conn.commit()
    conn.close()
    return {"status": "updated"}

@app.delete("/entries/{entry_id}")
def delete_entry(entry_id: int, token: str):
    user_id = get_user_id_from_token(token)
    if not user_id:
        return {"error": "Invalid or missing session token"}
    conn = get_db_connection()
    conn.execute("DELETE FROM entries WHERE id = ? AND user_id = ?", (entry_id, user_id))
    conn.commit()
    conn.close()
    return {"status": "deleted"}

@app.delete("/watchlist/{symbol}")
def remove_from_watchlist(symbol: str, token: str):
    user_id = get_user_id_from_token(token)
    if not user_id:
        return {"error": "Invalid or missing session token"}
    conn = get_db_connection()
    conn.execute(
        "DELETE FROM entries WHERE month = 'all' AND section = 'watchlist' AND category = ? AND user_id = ?",
        (symbol, user_id)
    )
    conn.commit()
    conn.close()
    return {"status": "removed"}

# ---------------- NIFTY 50 LIVE PRICES (shared, not user-specific) ----------------

import yfinance as yf
from datetime import datetime, timedelta

NIFTY50_STOCKS = {
    "RELIANCE.NS": "Reliance Industries",
    "TCS.NS": "TCS",
    "HDFCBANK.NS": "HDFC Bank",
    "ICICIBANK.NS": "ICICI Bank",
    "INFY.NS": "Infosys",
    "HINDUNILVR.NS": "Hindustan Unilever",
    "ITC.NS": "ITC",
    "SBIN.NS": "SBI",
    "BHARTIARTL.NS": "Bharti Airtel",
    "KOTAKBANK.NS": "Kotak Mahindra Bank",
    "LT.NS": "Larsen & Toubro",
    "AXISBANK.NS": "Axis Bank",
    "ASIANPAINT.NS": "Asian Paints",
    "MARUTI.NS": "Maruti Suzuki",
    "SUNPHARMA.NS": "Sun Pharma",
    "TITAN.NS": "Titan Company",
    "ULTRACEMCO.NS": "UltraTech Cement",
    "NESTLEIND.NS": "Nestle India",
    "WIPRO.NS": "Wipro",
    "TATASTEEL.NS": "Tata Steel",
    "TATAMOTORS.NS": "Tata Motors",
    "POWERGRID.NS": "Power Grid Corp",
    "NTPC.NS": "NTPC",
    "HCLTECH.NS": "HCL Technologies",
    "M&M.NS": "Mahindra & Mahindra",
    "BAJFINANCE.NS": "Bajaj Finance",
    "ADANIENT.NS": "Adani Enterprises",
    "JSWSTEEL.NS": "JSW Steel",
    "ONGC.NS": "ONGC",
    "TECHM.NS": "Tech Mahindra",
    "COALINDIA.NS": "Coal India",
    "GRASIM.NS": "Grasim Industries",
    "HINDALCO.NS": "Hindalco Industries",
    "DRREDDY.NS": "Dr Reddy's Labs",
    "CIPLA.NS": "Cipla",
    "BAJAJFINSV.NS": "Bajaj Finserv",
    "DIVISLAB.NS": "Divi's Laboratories",
    "BRITANNIA.NS": "Britannia Industries",
    "EICHERMOT.NS": "Eicher Motors",
    "HEROMOTOCO.NS": "Hero MotoCorp",
    "APOLLOHOSP.NS": "Apollo Hospitals",
    "ADANIPORTS.NS": "Adani Ports",
    "BPCL.NS": "BPCL",
    "SBILIFE.NS": "SBI Life Insurance",
    "HDFCLIFE.NS": "HDFC Life Insurance",
    "INDUSINDBK.NS": "IndusInd Bank",
    "TATACONSUM.NS": "Tata Consumer Products",
    "SHRIRAMFIN.NS": "Shriram Finance",
    "BAJAJ-AUTO.NS": "Bajaj Auto",
    "UPL.NS": "UPL",
    "LTIM.NS": "LTIMindtree",
}

NIFTY50_SECTORS = {
    "RELIANCE.NS": "Energy",
    "TCS.NS": "IT",
    "HDFCBANK.NS": "Banking",
    "ICICIBANK.NS": "Banking",
    "INFY.NS": "IT",
    "HINDUNILVR.NS": "FMCG",
    "ITC.NS": "FMCG",
    "SBIN.NS": "Banking",
    "BHARTIARTL.NS": "Telecom",
    "KOTAKBANK.NS": "Banking",
    "LT.NS": "Infrastructure",
    "AXISBANK.NS": "Banking",
    "ASIANPAINT.NS": "Consumer Goods",
    "MARUTI.NS": "Auto",
    "SUNPHARMA.NS": "Pharma",
    "TITAN.NS": "Consumer Goods",
    "ULTRACEMCO.NS": "Materials",
    "NESTLEIND.NS": "FMCG",
    "WIPRO.NS": "IT",
    "TATASTEEL.NS": "Materials",
    "TATAMOTORS.NS": "Auto",
    "POWERGRID.NS": "Energy",
    "NTPC.NS": "Energy",
    "HCLTECH.NS": "IT",
    "M&M.NS": "Auto",
    "BAJFINANCE.NS": "Financial Services",
    "ADANIENT.NS": "Infrastructure",
    "JSWSTEEL.NS": "Materials",
    "ONGC.NS": "Energy",
    "TECHM.NS": "IT",
    "COALINDIA.NS": "Energy",
    "GRASIM.NS": "Materials",
    "HINDALCO.NS": "Materials",
    "DRREDDY.NS": "Pharma",
    "CIPLA.NS": "Pharma",
    "BAJAJFINSV.NS": "Financial Services",
    "DIVISLAB.NS": "Pharma",
    "BRITANNIA.NS": "FMCG",
    "EICHERMOT.NS": "Auto",
    "HEROMOTOCO.NS": "Auto",
    "APOLLOHOSP.NS": "Healthcare",
    "ADANIPORTS.NS": "Infrastructure",
    "BPCL.NS": "Energy",
    "SBILIFE.NS": "Financial Services",
    "HDFCLIFE.NS": "Financial Services",
    "INDUSINDBK.NS": "Banking",
    "TATACONSUM.NS": "FMCG",
    "SHRIRAMFIN.NS": "Financial Services",
    "BAJAJ-AUTO.NS": "Auto",
    "UPL.NS": "Materials",
    "LTIM.NS": "IT",
}

_nifty_cache = {"data": None, "timestamp": None}
CACHE_DURATION = timedelta(minutes=5)

@app.get("/nifty50")
def get_nifty50():
    now = datetime.now()
    if _nifty_cache["data"] and _nifty_cache["timestamp"] and (now - _nifty_cache["timestamp"] < CACHE_DURATION):
        return {
            "stocks": _nifty_cache["data"],
            "last_updated": _nifty_cache["timestamp"].isoformat()
        }

    symbols = list(NIFTY50_STOCKS.keys())
    data = yf.download(symbols, period="2d", group_by="ticker", progress=False)

    results = []
    for symbol in symbols:
        try:
            closes = data[symbol]["Close"].dropna()
            if len(closes) >= 2:
                current = closes.iloc[-1]
                previous = closes.iloc[-2]
                change_pct = round(((current - previous) / previous) * 100, 2)
            elif len(closes) == 1:
                current = closes.iloc[-1]
                change_pct = 0.0
            else:
                continue
            results.append({
                "symbol": symbol,
                "name": NIFTY50_STOCKS[symbol],
                "price": round(float(current), 2),
                "change_pct": change_pct,
                "sector": NIFTY50_SECTORS.get(symbol, "Other")
            })
        except Exception:
            continue

    _nifty_cache["data"] = results
    _nifty_cache["timestamp"] = now

    return {
        "stocks": results,
        "last_updated": now.isoformat()
    }

# ---------------- PDF REPORT (now user-scoped) ----------------

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
import os

def get_section_entries(month: str, section: str, user_id: int):
    conn = get_db_connection()
    rows = conn.execute(
        "SELECT category, amount FROM entries WHERE month = ? AND section = ? AND user_id = ?",
        (month, section, user_id)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/export/csv")
def export_csv(token: str):
    user_id = get_user_id_from_token(token)
    if not user_id:
        return {"error": "Invalid or missing session token"}

    import pandas as pd
    import io
    from fastapi.responses import StreamingResponse

    conn = get_db_connection()
    rows = conn.execute(
        "SELECT month, section, category, amount FROM entries WHERE user_id = ? ORDER BY month, section, category",
        (user_id,)
    ).fetchall()
    conn.close()

    df = pd.DataFrame([dict(r) for r in rows])
    if df.empty:
        df = pd.DataFrame(columns=["month", "section", "category", "amount"])

    buffer = io.StringIO()
    df.to_csv(buffer, index=False)
    buffer.seek(0)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=monetra_export.csv"}
    )

@app.get("/report")
def generate_report(month: str, token: str):
    user_id = get_user_id_from_token(token)
    if not user_id:
        return {"error": "Invalid or missing session token"}

    spending = get_section_entries(month, "spending", user_id)
    income = get_section_entries(month, "income", user_id)
    savings = get_section_entries(month, "savings", user_id)
    goal_rows = get_section_entries(month, "goal", user_id)

    spending_total = sum(e["amount"] for e in spending)
    income_total = sum(e["amount"] for e in income)
    savings_total = sum(e["amount"] for e in savings)
    remaining = income_total - spending_total
    goal_amount = goal_rows[0]["amount"] if goal_rows else 0

    os.makedirs("reports", exist_ok=True)
    filepath = f"reports/Monetra_Report_{month}_user{user_id}.pdf"

    doc = SimpleDocTemplate(filepath, pagesize=letter, topMargin=0.6*inch, bottomMargin=0.6*inch)
    styles = getSampleStyleSheet()
    espresso = colors.HexColor("#4A3728")

    title_style = ParagraphStyle('TitleStyle', parent=styles['Title'], textColor=espresso, fontSize=22)
    heading_style = ParagraphStyle('HeadingStyle', parent=styles['Heading2'], textColor=espresso, spaceBefore=16, spaceAfter=8)
    normal_style = styles['Normal']

    story = []
    story.append(Paragraph("Monetra", title_style))
    story.append(Paragraph(f"Monthly Summary Report — {month}", normal_style))
    story.append(Spacer(1, 20))

    summary_data = [
        ["Total Income", f"Rs {income_total:,.2f}"],
        ["Total Spent", f"Rs {spending_total:,.2f}"],
        ["Remaining", f"Rs {remaining:,.2f}"],
        ["Total Saved (SIP + Stocks)", f"Rs {savings_total:,.2f}"],
    ]
    if goal_amount:
        summary_data.append(["Monthly Savings Goal", f"Rs {goal_amount:,.2f}"])

    summary_table = Table(summary_data, colWidths=[3*inch, 2.5*inch])
    summary_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('TEXTCOLOR', (0, 0), (-1, -1), espresso),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor("#4A372833")),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
    ]))
    story.append(summary_table)

    if spending:
        story.append(Paragraph("Spending by Category", heading_style))
        spend_data = [["Category", "Amount"]] + [[e["category"], f"Rs {e['amount']:,.2f}"] for e in spending]
        spend_table = Table(spend_data, colWidths=[3*inch, 2.5*inch])
        spend_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (-1, -1), espresso),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F0E6DA")),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor("#4A372822")),
        ]))
        story.append(spend_table)

    if income:
        story.append(Paragraph("Income by Category", heading_style))
        income_data = [["Category", "Amount"]] + [[e["category"], f"Rs {e['amount']:,.2f}"] for e in income]
        income_table = Table(income_data, colWidths=[3*inch, 2.5*inch])
        income_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (-1, -1), espresso),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F0E6DA")),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor("#4A372822")),
        ]))
        story.append(income_table)

    doc.build(story)
    return FileResponse(filepath, media_type="application/pdf", filename=f"Monetra_Report_{month}.pdf")