import { useState, useEffect } from 'react'
import './App.css'

const PRIMARY = 'var(--primary)'
const PRIMARY_MUTED = 'var(--primary-muted)'
const HIGHLIGHT = 'var(--highlight)'
const NEGATIVE = 'var(--negative)'
const CARD_SHADOW = 'var(--card-shadow)'
const ACCENT = 'var(--accent)'

function getThemeVars(darkMode) {
  if (darkMode) {
    return {
      '--primary': '#E8E3F5',
      '--primary-muted': '#A99FC7',
      '--highlight': '#6FE0D0',
      '--negative': '#F294A8',
      '--accent': '#8F7FD4',
      '--card-bg': 'rgba(40,32,66,0.85)',
      '--card-shadow': '0 4px 14px rgba(0,0,0,0.35)',
      '--input-bg': 'rgba(255,255,255,0.08)',
      '--page-bg': 'linear-gradient(160deg, #241B3D 0%, #1A2E45 100%)',
      '--shell-bg': 'rgba(30,24,50,0.5)',
      '--sidebar-bg': 'rgba(35,28,58,0.7)',
      '--border-color': 'rgba(255,255,255,0.12)',
      '--menu-bg': '#2E2450',
      '--active-nav-bg': 'rgba(143,127,212,0.25)',
      '--banner-bg': 'linear-gradient(135deg, rgba(143,127,212,0.35), rgba(111,224,208,0.2))',
      '--tag-negative-bg': 'rgba(242,148,168,0.2)',
      '--tag-positive-bg': 'rgba(111,224,208,0.2)'
    }
  }
  return {
    '--primary': '#5B4B8A',
    '--primary-muted': '#8B7FB0',
    '--highlight': '#4FA8A0',
    '--negative': '#E8748A',
    '--accent': '#5B4B8A',
    '--card-bg': 'rgba(255,255,255,0.85)',
    '--card-shadow': '0 4px 14px rgba(91,75,138,0.10)',
    '--input-bg': 'rgba(255,255,255,0.8)',
    '--page-bg': 'linear-gradient(160deg, #FDE2E4 0%, #CDE7F0 100%)',
    '--shell-bg': 'rgba(255,255,255,0.5)',
    '--sidebar-bg': 'rgba(255,255,255,0.7)',
    '--border-color': '#eee',
    '--menu-bg': '#ffffff',
    '--active-nav-bg': 'linear-gradient(135deg,#FDE2E4,#CDE7F0)',
    '--banner-bg': 'linear-gradient(135deg,#FDE2E4,#CDE7F0)',
    '--tag-negative-bg': '#FDE2E4',
    '--tag-positive-bg': '#DCF2EF'
  }
}

const spendingCategories = [
  "Rent", "Electricity", "Subscriptions", "Food",
  "Transport", "Maintenance", "Debt / EMI"
]

const spendingColors = {
  "Rent": "#8B7FB0",
  "Electricity": "#E8748A",
  "Subscriptions": "#7EC8CD",
  "Food": "#F4B183",
  "Transport": "#B08DD8",
  "Maintenance": "#6FBF9E",
  "Debt / EMI": "#A6A6C8"
}

const incomeCategories = [
  "Salary / Paycheck", "Freelance / Side income"
]
const savingsCategories = ["SIP", "Stocks"];

function generateMonthOptions() {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const now = new Date()
  const options = []
  const startYear = now.getFullYear() - 3
  const endYear = now.getFullYear() + 10
  for (let y = startYear; y <= endYear; y++) {
    for (let m = 1; m <= 12; m++) {
      const value = `${y}-${String(m).padStart(2, '0')}`
      const label = `${monthNames[m - 1]} ${y}`
      options.push({ value, label })
    }
  }
  return options
}

function generateMonthNumOptions() {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return monthNames.map((name, i) => ({ value: String(i + 1).padStart(2, '0'), label: name }))
}

function generateYearOptions() {
  const now = new Date()
  const startYear = now.getFullYear() - 3
  const endYear = now.getFullYear() + 10
  const years = []
  for (let y = startYear; y <= endYear; y++) years.push(y)
  return years
}

const monthOptions = generateMonthOptions()
const monthNumOptions = generateMonthNumOptions()
const yearOptions = generateYearOptions()

const monthShortLabels = {
  "2026-01": "Jan", "2026-02": "Feb", "2026-03": "Mar", "2026-04": "Apr",
  "2026-05": "May", "2026-06": "Jun", "2026-07": "Jul", "2026-08": "Aug",
  "2026-09": "Sep", "2026-10": "Oct", "2026-11": "Nov", "2026-12": "Dec"
}

function getLast6Months(selectedMonth) {
  const [year, monthNum] = selectedMonth.split('-').map(Number)
  const months = []
  for (let i = 5; i >= 0; i--) {
    let m = monthNum - i
    let y = year
    if (m <= 0) {
      m += 12
      y -= 1
    }
    months.push(`${y}-${String(m).padStart(2, '0')}`)
  }
  return months
}

function getPreviousMonth(selectedMonth) {
  const [year, monthNum] = selectedMonth.split('-').map(Number)
  let m = monthNum - 1
  let y = year
  if (m <= 0) {
    m = 12
    y -= 1
  }
  return `${y}-${String(m).padStart(2, '0')}`
}

const tabButtonStyle = (active) => ({
  padding: '9px 18px',
  fontWeight: active ? '600' : '400',
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: '14px',
  background: active ? ACCENT : 'var(--card-bg)',
  color: active ? '#fff' : PRIMARY,
  border: 'none',
  borderRadius: '20px',
  cursor: 'pointer',
  boxShadow: active ? '0 3px 10px rgba(91,75,138,0.25)' : 'none'
})

const sidebarItemStyle = (active) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
  padding: '11px 14px',
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: '15px',
  fontWeight: active ? '600' : '400',
  background: active ? 'var(--active-nav-bg)' : 'transparent',
  color: PRIMARY,
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  textAlign: 'left',
  boxShadow: active ? '0 2px 8px rgba(91,75,138,0.15)' : 'none'
})

const OverviewIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 10l9-7 9 7" />
    <path d="M5 10v10h14V10" />
  </svg>
)
const CashFlowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
const SavingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 8a5 5 0 00-9.6-2H8a5 5 0 00-5 5c0 1.5.6 2.8 1.6 3.8L4 18h3v2h4v-2h2l1-1" />
    <circle cx="16" cy="9" r="0.5" fill="currentColor" />
  </svg>
)
const InvestmentsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3v18h18" />
    <path d="M7 14l4-4 3 3 5-6" />
  </svg>
)

const actionButtonStyle = {
  padding: '9px 18px',
  height: 'fit-content',
  background: ACCENT,
  color: '#fff',
  border: 'none',
  borderRadius: '20px',
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: '14px',
  cursor: 'pointer',
  boxShadow: '0 3px 10px rgba(91,75,138,0.25)'
}

const secondaryButtonStyle = {
  ...actionButtonStyle,
  background: 'var(--card-bg)',
  color: PRIMARY,
  boxShadow: 'none'
}

const inputStyle = {
  padding: '9px 12px',
  fontSize: '14px',
  fontFamily: "'IBM Plex Sans', sans-serif",
  border: 'none',
  borderRadius: '10px',
  background: 'var(--input-bg)',
  color: PRIMARY
}

const cardBaseStyle = {
  background: 'var(--card-bg)',
  borderRadius: '16px',
  boxShadow: CARD_SHADOW
}

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function SummaryCards({ cards }) {
  return (
    <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
      {cards.map((card, i) => (
        <div key={i} style={{
          flex: '1 1 160px',
          minWidth: '150px',
          ...cardBaseStyle,
          padding: '16px 18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            {card.icon && <span style={{ fontSize: '14px' }}>{card.icon}</span>}
            <div style={{ fontSize: '11px', color: PRIMARY_MUTED, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              {card.label}
            </div>
            {card.tooltip && (
              <span title={card.tooltip} style={{ fontSize: '11px', color: PRIMARY_MUTED, cursor: 'help', border: `1px solid ${PRIMARY_MUTED}`, borderRadius: '50%', width: '14px', height: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                ?
              </span>
            )}
          </div>
          <div style={{ fontSize: '21px', fontWeight: '600', fontFamily: "'Poppins', sans-serif", color: card.color || PRIMARY }}>
            {card.value}
          </div>
          {card.subtext && (
            <div style={{ fontSize: '12px', color: card.subtextColor || PRIMARY_MUTED, marginTop: '4px' }}>
              {card.subtext}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function DonutChart({ categories, amounts, colors, total }) {
  let cumulative = 0
  const radius = 60
  const circumference = 2 * Math.PI * radius

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        {categories.map(cat => {
          const value = parseFloat(amounts[cat]) || 0
          if (value === 0 || total === 0) return null
          const fraction = value / total
          const dash = fraction * circumference
          const gap = circumference - dash
          const offset = -cumulative * circumference
          cumulative += fraction
          return (
            <circle
              key={cat}
              cx="90" cy="90" r={radius}
              fill="none"
              stroke={colors[cat] || '#999'}
              strokeWidth="60"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
              transform="rotate(-90 90 90)"
            />
          )
        })}
      </svg>
      <div>
        {categories.map(cat => {
          const value = parseFloat(amounts[cat]) || 0
          const percent = total > 0 ? Math.round((value / total) * 100) : 0
          return (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '14px', color: PRIMARY }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors[cat] || '#999', display: 'inline-block' }}></span>
              <span>{cat}</span>
              <span style={{ marginLeft: 'auto', color: PRIMARY_MUTED, fontSize: '13px' }}>
                {value > 0 ? `${percent}%` : '–'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SavingsRateChart({ data }) {
  const maxRate = Math.max(...data.map(d => d.rate), 10)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '190px', padding: '10px 0' }}>
      {data.map(d => (
        <div key={d.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: PRIMARY, marginBottom: '2px' }}>
            ₹{d.amount}
          </div>
          <div style={{ fontSize: '12px', color: HIGHLIGHT, marginBottom: '4px' }}>
            {d.rate}%
          </div>
          <div style={{
            width: '100%',
            maxWidth: '40px',
            height: `${Math.max((d.rate / maxRate) * 100, 2)}px`,
            background: d.rate >= 0 ? 'linear-gradient(180deg,#7EC8CD,#4FA8A0)' : NEGATIVE,
            borderRadius: '8px 8px 0 0'
          }}></div>
          <div style={{ fontSize: '12px', color: PRIMARY_MUTED, marginTop: '6px' }}>
            {monthShortLabels[d.month]}
          </div>
        </div>
      ))}
    </div>
  )
}

function LandingPage({ darkMode, toggleDarkMode, onGetStarted, onLogin }) {
  const features = [
    { icon: '💰', title: 'Cash Flow', desc: 'Track income and spending by category, with a visual breakdown of where your money goes.' },
    { icon: '🏦', title: 'Savings Goals', desc: 'Set a monthly savings target and watch your progress with a 6-month trend view.' },
    { icon: '📈', title: 'Live Investments', desc: 'See real Nifty 50 stock prices, matched against what you can actually afford to invest.' },
  ]
  return (
    <div style={{ ...getThemeVars(darkMode), minHeight: '100vh', background: 'var(--page-bg)', fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px' }}>
        <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '700', color: PRIMARY, margin: 0 }}>Monetra</p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={toggleDarkMode} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer' }}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={onLogin} style={{ ...secondaryButtonStyle }}>Log in</button>
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '40px auto 0', textAlign: 'center', padding: '0 24px' }}>
        <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '38px', fontWeight: '700', color: PRIMARY, margin: '0 0 14px', lineHeight: 1.2 }}>
          Your money, all in one calm place
        </p>
        <p style={{ fontSize: '15px', color: PRIMARY_MUTED, margin: '0 0 28px' }}>
          Monetra brings your spending, savings, and investments together — so you always know exactly where you stand.
        </p>
        <button onClick={onGetStarted} style={{ ...actionButtonStyle, padding: '14px 32px', fontSize: '16px' }}>
          Get started — it's free
        </button>
      </div>

      <div style={{ maxWidth: '900px', margin: '60px auto', padding: '0 24px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {features.map((f, i) => (
          <div key={i} style={{ ...cardBaseStyle, padding: '24px', flex: '1 1 240px' }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>{f.icon}</div>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '600', color: PRIMARY, margin: '0 0 8px' }}>{f.title}</p>
            <p style={{ fontSize: '13px', color: PRIMARY_MUTED, margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function AuthScreen({ authScreen, setAuthScreen, authName, setAuthName, authUsername, setAuthUsername, authPassword, setAuthPassword, authConfirmPassword, setAuthConfirmPassword, authError, handleLogin, handleSignup, darkMode }) {
  const isLogin = authScreen === 'login'
  const themeVars = getThemeVars(darkMode)
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async () => {
    setSubmitting(true)
    await (isLogin ? handleLogin() : handleSignup())
    setSubmitting(false)
  }
  return (
    <div style={{ ...themeVars, minHeight: '100vh', background: 'var(--page-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <div style={{ background: 'var(--menu-bg)', borderRadius: '20px', padding: '3rem 2.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 10px 40px rgba(91,75,138,0.18)' }}>
        <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '32px', fontWeight: '700', margin: '0 0 6px', color: PRIMARY, textAlign: 'center' }}>Monetra</p>
        <p style={{ fontSize: '13px', color: PRIMARY_MUTED, margin: '0 0 24px', textAlign: 'center' }}>
          {isLogin ? 'Log in to your dashboard' : 'Create your account'}
        </p>

        {!isLogin && (
          <>
            <label style={{ fontSize: '12px', color: PRIMARY, fontWeight: '500', display: 'block', marginBottom: '6px' }}>Name</label>
            <input
              type="text"
              value={authName}
              onChange={(e) => setAuthName(e.target.value)}
              placeholder="Your name"
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', height: '42px', marginBottom: '16px' }}
            />
          </>
        )}

        <label style={{ fontSize: '12px', color: PRIMARY, fontWeight: '500', display: 'block', marginBottom: '6px' }}>Email</label>
        <input
          type="email"
          value={authUsername}
          onChange={(e) => setAuthUsername(e.target.value)}
          placeholder="you@example.com"
          style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', height: '42px', marginBottom: '16px' }}
        />

        <label style={{ fontSize: '12px', color: PRIMARY, fontWeight: '500', display: 'block', marginBottom: '6px' }}>Password</label>
        <div style={{ position: 'relative', marginBottom: isLogin ? '20px' : '16px' }}>
          <input
            type={showPw ? 'text' : 'password'}
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', height: '42px', paddingRight: '40px' }}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px', color: PRIMARY_MUTED, padding: 0 }}
          >
            {showPw ? '🙈' : '👁️'}
          </button>
        </div>

        {!isLogin && (
          <>
            <label style={{ fontSize: '12px', color: PRIMARY, fontWeight: '500', display: 'block', marginBottom: '6px' }}>Confirm password</label>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <input
                type={showConfirmPw ? 'text' : 'password'}
                value={authConfirmPassword}
                onChange={(e) => setAuthConfirmPassword(e.target.value)}
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', height: '42px', paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px', color: PRIMARY_MUTED, padding: 0 }}
              >
                {showConfirmPw ? '🙈' : '👁️'}
              </button>
            </div>
          </>
        )}

        {authError && (
          <p style={{ color: NEGATIVE, fontSize: '13px', marginBottom: '12px' }}>{authError}</p>
        )}

        <button onClick={onSubmit} disabled={submitting} style={{ ...actionButtonStyle, width: '100%', padding: '12px', fontSize: '14px' }}>
          {submitting ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
        </button>

        <p style={{ textAlign: 'center', fontSize: '12.5px', color: PRIMARY_MUTED, marginTop: '18px' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setAuthScreen(isLogin ? 'signup' : 'login')} style={{ color: NEGATIVE, fontWeight: '500', cursor: 'pointer' }}>
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  )
}

function StockRowSkeleton() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '0.5px solid var(--border-color)' }}>
      <div>
        <div style={{ width: '120px', height: '14px', borderRadius: '4px', background: 'linear-gradient(90deg,#eee,#f5f5f5,#eee)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', marginBottom: '6px' }}></div>
        <div style={{ width: '70px', height: '11px', borderRadius: '4px', background: 'linear-gradient(90deg,#eee,#f5f5f5,#eee)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }}></div>
      </div>
      <div style={{ width: '60px', height: '20px', borderRadius: '4px', background: 'linear-gradient(90deg,#eee,#f5f5f5,#eee)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }}></div>
    </div>
  )
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('monetra_token') || null)
  const [currentUsername, setCurrentUsername] = useState(() => localStorage.getItem('monetra_username') || null)
  const [authScreen, setAuthScreen] = useState('login')
  const [showLanding, setShowLanding] = useState(true)
  const [authName, setAuthName] = useState('')
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authConfirmPassword, setAuthConfirmPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const [activeTab, setActiveTab] = useState('spending')
  const [mainPage, setMainPage] = useState('overview')
  const getCurrentMonthValue = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue())
  const [spendingAmounts, setSpendingAmounts] = useState({})
  const [incomeAmounts, setIncomeAmounts] = useState({})
  const [savingsAmounts, setSavingsAmounts] = useState({});
  const [customSpendingCategories, setCustomSpendingCategories] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryAmount, setNewCategoryAmount] = useState('')
  const [goalAmounts, setGoalAmounts] = useState({})
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [newGoalAmount, setNewGoalAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingGoal, setSavingGoal] = useState(false)
  const [savingLimits, setSavingLimits] = useState(false)
  const [savingsRateHistory, setSavingsRateHistory] = useState([])
  const [nifty50Stocks, setNifty50Stocks] = useState([])
  const [nifty50LastUpdated, setNifty50LastUpdated] = useState(null)
  const [loadingStocks, setLoadingStocks] = useState(false)
  const [stockSearch, setStockSearch] = useState('')
  const [watchlist, setWatchlist] = useState([])
  const [showWatchlistForm, setShowWatchlistForm] = useState(false)
  const [watchlistSearch, setWatchlistSearch] = useState('')
  const [investTab, setInvestTab] = useState('all')
  const [sortBy, setSortBy] = useState('change_desc')
  const [prevMonthTotals, setPrevMonthTotals] = useState(null)
  const [categoryLimits, setCategoryLimits] = useState({})
  const [showLimitsForm, setShowLimitsForm] = useState(false)
  const [limitInputs, setLimitInputs] = useState({})
  const [yearlySummary, setYearlySummary] = useState(null)
  const [settingsName, setSettingsName] = useState('')
  const [settingsMsg, setSettingsMsg] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmNewPw, setShowConfirmNewPw] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('monetra_dark') === 'true')
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const [toast, setToast] = useState(null)

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  const toggleDarkMode = () => {
    const newVal = !darkMode
    setDarkMode(newVal)
    localStorage.setItem('monetra_dark', newVal)
  }

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  useEffect(() => {
    const pageTitles = {
      overview: 'Overview',
      cashflow: 'Cash Flow',
      savings: 'Savings',
      investments: 'Investments',
      settings: 'Settings'
    }
    document.title = token ? `Monetra — ${pageTitles[mainPage] || ''}` : 'Monetra'
  }, [mainPage, token])

  const handleLogin = async () => {
    setAuthError('')
    if (!isValidEmail(authUsername)) {
      setAuthError('Please enter a valid email address')
      return
    }
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authUsername, password: authPassword })
    }).then(r => r.json())
    if (res.error) { setAuthError(res.error); return }
    localStorage.setItem('monetra_token', res.token)
    localStorage.setItem('monetra_username', res.name || res.email)
    setToken(res.token)
    setCurrentUsername(res.name || res.email)
    setAuthUsername('')
    setAuthPassword('')
  }

  const handleSignup = async () => {
    setAuthError('')
    if (!authName.trim()) {
      setAuthError('Please enter your name')
      return
    }
    if (!isValidEmail(authUsername)) {
      setAuthError('Please enter a valid email address')
      return
    }
    if (authPassword !== authConfirmPassword) {
      setAuthError("Passwords don't match")
      return
    }
    const res = await fetch(`${API}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: authName, email: authUsername, password: authPassword })
    }).then(r => r.json())
    if (res.error) { setAuthError(res.error); return }
    localStorage.setItem('monetra_token', res.token)
    localStorage.setItem('monetra_username', res.name || res.email)
    setToken(res.token)
    setCurrentUsername(res.name || res.email)
    setAuthName('')
    setAuthUsername('')
    setAuthPassword('')
    setAuthConfirmPassword('')
  }

  const handleLogout = () => {
    localStorage.removeItem('monetra_token')
    localStorage.removeItem('monetra_username')
    setToken(null)
    setCurrentUsername(null)
    setShowLanding(true)
  }

  const loadEntries = (month, section, setter) => {
    if (!token) return
    fetch(`${API}/entries?month=${month}&section=${section}&token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return
        const loaded = {}
        data.forEach(entry => {
          loaded[entry.category] = entry.amount
        })
        setter(loaded)
      })
  }

  useEffect(() => {
    if (!token) return
    loadEntries(selectedMonth, 'spending', setSpendingAmounts)
    loadEntries(selectedMonth, 'income', setIncomeAmounts)
    loadEntries(selectedMonth, 'savings', setSavingsAmounts)
    loadEntries(selectedMonth, 'goal', setGoalAmounts)
  }, [selectedMonth, token])

  useEffect(() => {
    if (!token) return
    const prevMonth = getPreviousMonth(selectedMonth)
    Promise.all([
      fetch(`${API}/entries?month=${prevMonth}&section=spending&token=${token}`).then(r => r.json()),
      fetch(`${API}/entries?month=${prevMonth}&section=income&token=${token}`).then(r => r.json())
    ]).then(([spendRes, incomeRes]) => {
      if (!Array.isArray(spendRes) || !Array.isArray(incomeRes)) return
      const spendTotal = spendRes.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
      const incomeTotalP = incomeRes.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
      setPrevMonthTotals({ month: prevMonth, spending: spendTotal, income: incomeTotalP })
    })
  }, [selectedMonth, token])

  useEffect(() => {
    if (!token) return
    const months = getLast6Months(selectedMonth)
    const fetchAll = async () => {
      const results = []
      for (const month of months) {
        const [spendRes, incomeRes] = await Promise.all([
          fetch(`${API}/entries?month=${month}&section=spending&token=${token}`).then(r => r.json()),
          fetch(`${API}/entries?month=${month}&section=income&token=${token}`).then(r => r.json())
        ])
        const spendArr = Array.isArray(spendRes) ? spendRes : []
        const incomeArr = Array.isArray(incomeRes) ? incomeRes : []
        const spendTotal = spendArr.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
        const incomeTotalM = incomeArr.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
        const amount = incomeTotalM - spendTotal
        const rate = incomeTotalM > 0 ? Math.round((amount / incomeTotalM) * 100) : 0
        results.push({ month, rate, amount })
      }
      setSavingsRateHistory(results)
    }
    fetchAll()
  }, [selectedMonth, token])

  useEffect(() => {
    if (mainPage === 'investments' && nifty50Stocks.length === 0) {
      setLoadingStocks(true)
      fetch(`${API}/nifty50`)
        .then(res => res.json())
        .then(data => {
          setNifty50Stocks(data.stocks)
          setNifty50LastUpdated(data.last_updated)
          setLoadingStocks(false)
        })
        .catch(() => setLoadingStocks(false))
    }
  }, [mainPage])

  useEffect(() => {
    if (!token) return
    fetch(`${API}/entries?month=all&section=watchlist&token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return
        setWatchlist(data.map(e => e.category))
      })
  }, [token])

  useEffect(() => {
    if (!token) return
    fetch(`${API}/entries?month=all&section=limit&token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return
        const loaded = {}
        data.forEach(entry => { loaded[entry.category] = entry.amount })
        setCategoryLimits(loaded)
        setLimitInputs(loaded)
      })
  }, [token])

  useEffect(() => {
    if (!token) return
    const fetchYearly = async () => {
      let totalIncome = 0
      let totalSpent = 0
      let totalSaved = 0
      const categoryTotals = {}

      const currentYear = new Date().getFullYear()
      const yearMonths = monthOptions.filter(m => m.value.startsWith(String(currentYear)))

      for (const m of yearMonths) {
        const [spendRes, incomeRes, savingsRes] = await Promise.all([
          fetch(`${API}/entries?month=${m.value}&section=spending&token=${token}`).then(r => r.json()),
          fetch(`${API}/entries?month=${m.value}&section=income&token=${token}`).then(r => r.json()),
          fetch(`${API}/entries?month=${m.value}&section=savings&token=${token}`).then(r => r.json())
        ])
        const spendArr = Array.isArray(spendRes) ? spendRes : []
        const incomeArr = Array.isArray(incomeRes) ? incomeRes : []
        const savingsArr = Array.isArray(savingsRes) ? savingsRes : []

        spendArr.forEach(e => {
          totalSpent += parseFloat(e.amount) || 0
          categoryTotals[e.category] = (categoryTotals[e.category] || 0) + (parseFloat(e.amount) || 0)
        })
        incomeArr.forEach(e => { totalIncome += parseFloat(e.amount) || 0 })
        savingsArr.forEach(e => { totalSaved += parseFloat(e.amount) || 0 })
      }

      let topCategory = null
      let topCategoryAmount = 0
      Object.entries(categoryTotals).forEach(([cat, amt]) => {
        if (amt > topCategoryAmount) {
          topCategory = cat
          topCategoryAmount = amt
        }
      })

      setYearlySummary({ totalIncome, totalSpent, totalSaved, topCategory, topCategoryAmount })
    }
    fetchYearly()
  }, [token])

  useEffect(() => {
    if (mainPage === 'settings' && token) {
      fetch(`${API}/profile?token=${token}`)
        .then(r => r.json())
        .then(data => {
          if (!data.error) setSettingsName(data.name || '')
        })
    }
  }, [mainPage, token])

  const handleUpdateName = async () => {
    setSettingsMsg('')
    setSavingName(true)
    const res = await fetch(`${API}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, name: settingsName })
    }).then(r => r.json())
    setSavingName(false)
    if (res.error) { setSettingsMsg(res.error); return }
    localStorage.setItem('monetra_username', res.name)
    setCurrentUsername(res.name)
    showToast('Name updated!')
  }

  const handleUpdatePassword = async () => {
    setPasswordMsg('')
    if (newPassword !== confirmNewPassword) {
      setPasswordMsg("New passwords don't match")
      return
    }
    setSavingPassword(true)
    const res = await fetch(`${API}/profile/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, current_password: currentPassword, new_password: newPassword })
    }).then(r => r.json())
    setSavingPassword(false)
    if (res.error) { setPasswordMsg(res.error); return }
    setCurrentPassword('')
    setNewPassword('')
    setConfirmNewPassword('')
    showToast('Password updated!')
  }

  const addToWatchlist = async (symbol) => {
    if (watchlist.includes(symbol)) return
    await fetch(`${API}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month: 'all', section: 'watchlist', category: symbol, amount: 1, token })
    })
    setWatchlist(prev => [...prev, symbol])
  }

  const removeFromWatchlist = async (symbol) => {
    await fetch(`${API}/watchlist/${symbol}?token=${token}`, { method: 'DELETE' })
    setWatchlist(prev => prev.filter(s => s !== symbol))
  }

  const handleChange = (section, category, value) => {
    if (section === 'spending') {
      setSpendingAmounts(prev => ({ ...prev, [category]: value }))
    } else if (section === 'income') {
      setIncomeAmounts(prev => ({ ...prev, [category]: value }))
    } else if (section === 'savings') {
      setSavingsAmounts(prev => ({ ...prev, [category]: value }))
    }
  }

  const handleSave = async (section, categories, amounts) => {
    setSaving(true)
    for (const category of categories) {
      const amount = parseFloat(amounts[category])
      if (!isNaN(amount) && amount > 0) {
        await fetch(`${API}/entries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            month: selectedMonth,
            section: section,
            category: category,
            amount: amount,
            token: token
          })
        })
      }
    }
    setSaving(false)
    showToast("Saved!")
  }

  const handleSaveGoal = async () => {
    if (newGoalAmount) {
      setSavingGoal(true)
      await handleSave('goal', ['monthly_goal'], { monthly_goal: newGoalAmount })
      setGoalAmounts(prev => ({ ...prev, monthly_goal: newGoalAmount }))
      setNewGoalAmount('')
      setShowGoalForm(false)
      setSavingGoal(false)
    }
  }

  const handleSaveLimits = async () => {
    setSavingLimits(true)
    for (const cat of allSpendingCategories) {
      const val = parseFloat(limitInputs[cat])
      if (!isNaN(val) && val > 0) {
        await fetch(`${API}/entries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ month: 'all', section: 'limit', category: cat, amount: val, token })
        })
      }
    }
    setCategoryLimits({ ...limitInputs })
    setShowLimitsForm(false)
    setSavingLimits(false)
    showToast('Limits saved!')
  }

  const allSpendingCategories = [...spendingCategories, ...customSpendingCategories]
  const spendingTotal = allSpendingCategories.reduce((sum, cat) => sum + (parseFloat(spendingAmounts[cat]) || 0), 0)
  const incomeTotal = incomeCategories.reduce((sum, cat) => sum + (parseFloat(incomeAmounts[cat]) || 0), 0)

  const categories = activeTab === 'spending' ? allSpendingCategories : incomeCategories
  const amounts = activeTab === 'spending' ? spendingAmounts : incomeAmounts
  const total = activeTab === 'spending' ? spendingTotal : incomeTotal

  const savedThisMonth = incomeTotal - spendingTotal
  const savingsRate = incomeTotal > 0 ? Math.round((savedThisMonth / incomeTotal) * 100) : 0
  const savingsGoal = parseFloat(goalAmounts['monthly_goal']) || 0
  const goalProgress = savingsGoal > 0 ? Math.round((savedThisMonth / savingsGoal) * 100) : 0

  const spendingChangePct = prevMonthTotals && prevMonthTotals.spending > 0
    ? Math.round(((spendingTotal - prevMonthTotals.spending) / prevMonthTotals.spending) * 100)
    : null
  const incomeChangePct = prevMonthTotals && prevMonthTotals.income > 0
    ? Math.round(((incomeTotal - prevMonthTotals.income) / prevMonthTotals.income) * 100)
    : null

  if (!token) {
    if (showLanding) {
      return (
        <LandingPage
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onGetStarted={() => { setAuthScreen('signup'); setShowLanding(false) }}
          onLogin={() => { setAuthScreen('login'); setShowLanding(false) }}
        />
      )
    }
    return (
      <AuthScreen
        authScreen={authScreen}
        setAuthScreen={setAuthScreen}
        authName={authName}
        setAuthName={setAuthName}
        authUsername={authUsername}
        setAuthUsername={setAuthUsername}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        authConfirmPassword={authConfirmPassword}
        setAuthConfirmPassword={setAuthConfirmPassword}
        authError={authError}
        handleLogin={handleLogin}
        handleSignup={handleSignup}
        darkMode={darkMode}
      />
    )
  }

  return (
    <div style={{ ...getThemeVars(darkMode), minHeight: '100vh', background: 'var(--page-bg)', padding: isMobile ? '12px' : '24px', fontFamily: "'IBM Plex Sans', sans-serif" }}>
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', width: '100%', background: 'var(--shell-bg)', borderRadius: '24px', overflow: 'hidden', backdropFilter: 'blur(6px)' }}>
      <div style={{ width: isMobile ? '100%' : '220px', flexShrink: 0, background: 'var(--sidebar-bg)', padding: isMobile ? '14px' : '24px 14px', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ marginBottom: isMobile ? '12px' : '28px', marginTop: 0, paddingLeft: '8px', fontFamily: "'Poppins', sans-serif", fontWeight: '700', color: PRIMARY, fontSize: isMobile ? '24px' : '30px' }}>Monetra</h1>
        <nav style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '4px', overflowX: isMobile ? 'auto' : 'visible' }}>
          <button onClick={() => setMainPage('overview')} style={{ ...sidebarItemStyle(mainPage === 'overview'), whiteSpace: 'nowrap', width: isMobile ? 'auto' : '100%' }}>
            <OverviewIcon /> {!isMobile && 'Overview'}
          </button>
          <button onClick={() => setMainPage('cashflow')} style={{ ...sidebarItemStyle(mainPage === 'cashflow'), whiteSpace: 'nowrap', width: isMobile ? 'auto' : '100%' }}>
            <CashFlowIcon /> {!isMobile && 'Cash Flow'}
          </button>
          <button onClick={() => setMainPage('savings')} style={{ ...sidebarItemStyle(mainPage === 'savings'), whiteSpace: 'nowrap', width: isMobile ? 'auto' : '100%' }}>
            <SavingsIcon /> {!isMobile && 'Savings'}
          </button>
          <button onClick={() => setMainPage('investments')} style={{ ...sidebarItemStyle(mainPage === 'investments'), whiteSpace: 'nowrap', width: isMobile ? 'auto' : '100%' }}>
            <InvestmentsIcon /> {!isMobile && 'Investments'}
          </button>
        </nav>
        <div style={{ marginTop: 'auto', paddingLeft: '8px' }}>
          <button
            onClick={toggleDarkMode}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
              padding: '10px 8px', background: 'transparent', border: 'none',
              color: PRIMARY, fontSize: '14px', cursor: 'pointer', fontFamily: "'IBM Plex Sans', sans-serif",
              marginBottom: '8px'
            }}
          >
            <span style={{ fontSize: '16px' }}>{darkMode ? '☀️' : '🌙'}</span>
            {darkMode ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
        <div style={{ paddingLeft: '8px', position: 'relative' }}>
          <div
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px', borderRadius: '12px' }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,#8B7FB0,#E8748A)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: '600', fontFamily: "'Poppins', sans-serif", flexShrink: 0
            }}>
              {currentUsername ? currentUsername.charAt(0).toUpperCase() : '?'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '14px', color: PRIMARY, fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUsername}
              </div>
              <div style={{ fontSize: '12px', color: PRIMARY_MUTED }}>View account</div>
            </div>
          </div>

          {showAccountMenu && (
            <div style={{
              position: 'absolute', bottom: '68px', left: '8px', width: '190px',
              background: 'var(--menu-bg)', borderRadius: '14px',
              boxShadow: '0 8px 24px rgba(91,75,138,0.2)', padding: '8px', zIndex: 10
            }}>
              <div style={{ padding: '8px 10px', fontSize: '13px', color: PRIMARY, borderBottom: '0.5px solid var(--border-color)', marginBottom: '4px' }}>
                Signed in as<br /><strong>{currentUsername}</strong>
              </div>
              <button
                onClick={() => { setMainPage('settings'); setShowAccountMenu(false) }}
                style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: PRIMARY, fontSize: '13px', cursor: 'pointer', padding: '8px 10px', borderRadius: '8px' }}
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: NEGATIVE, fontSize: '13px', cursor: 'pointer', padding: '8px 10px', borderRadius: '8px' }}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>

      <div key={mainPage} style={{ flex: 1, padding: isMobile ? '16px' : '30px 36px', animation: 'fadeIn 0.25s ease', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedMonth.split('-')[1]}
            onChange={(e) => setSelectedMonth(`${selectedMonth.split('-')[0]}-${e.target.value}`)}
            style={inputStyle}
          >
            {monthNumOptions.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={selectedMonth.split('-')[0]}
            onChange={(e) => setSelectedMonth(`${e.target.value}-${selectedMonth.split('-')[1]}`)}
            style={inputStyle}
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {mainPage === 'cashflow' && activeTab === 'spending' && (
            <button onClick={() => setShowAddForm(!showAddForm)} style={actionButtonStyle}>
              + Add entry
            </button>
          )}
          {mainPage === 'cashflow' && activeTab === 'spending' && (
            <button onClick={() => setShowLimitsForm(!showLimitsForm)} style={secondaryButtonStyle}>
              Set limits
            </button>
          )}
          {mainPage === 'savings' && (
            <button onClick={() => setShowGoalForm(!showGoalForm)} style={actionButtonStyle}>
              Set monthly goal
            </button>
          )}
          {mainPage === 'investments' && (
            <button onClick={() => setShowWatchlistForm(!showWatchlistForm)} style={actionButtonStyle}>
              + Add stock to watchlist
            </button>
          )}
          <a
            href={`${API}/report?month=${selectedMonth}&token=${token}`}
            style={{ ...secondaryButtonStyle, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          >
            Download Report
          </a>
          <a
            href={`${API}/export/csv?token=${token}`}
            style={{ ...secondaryButtonStyle, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          >
            Export CSV
          </a>
        </div>
      </div>

      {showAddForm && mainPage === 'cashflow' && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Amount"
            value={newCategoryAmount}
            onChange={(e) => setNewCategoryAmount(e.target.value)}
            style={{ ...inputStyle, width: '100px' }}
          />
          <button onClick={() => {
            if (newCategoryName.trim() && newCategoryAmount) {
              setCustomSpendingCategories(prev => [...prev, newCategoryName.trim()])
              setSpendingAmounts(prev => ({ ...prev, [newCategoryName.trim()]: newCategoryAmount }))
              setNewCategoryName('')
              setNewCategoryAmount('')
              setShowAddForm(false)
            }
          }} style={actionButtonStyle}>
            Add
          </button>
        </div>
      )}

      {showGoalForm && mainPage === 'savings' && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Monthly goal amount"
            value={newGoalAmount}
            onChange={(e) => setNewGoalAmount(e.target.value)}
            style={{ ...inputStyle, width: '160px' }}
          />
          <button onClick={handleSaveGoal} disabled={savingGoal} style={actionButtonStyle}>
            {savingGoal ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}

      {showWatchlistForm && mainPage === 'investments' && (
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Search stock to add..."
            value={watchlistSearch}
            onChange={(e) => setWatchlistSearch(e.target.value)}
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', marginBottom: '8px' }}
          />
          {watchlistSearch && (
            <div style={{ ...cardBaseStyle, maxHeight: '200px', overflowY: 'auto' }}>
              {nifty50Stocks
                .filter(stock =>
                  stock.name.toLowerCase().includes(watchlistSearch.toLowerCase()) ||
                  stock.symbol.toLowerCase().includes(watchlistSearch.toLowerCase())
                )
                .map(stock => (
                  <div key={stock.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '0.5px solid var(--border-color)' }}>
                    <span style={{ color: PRIMARY, fontSize: '14px' }}>{stock.name} ({stock.symbol.replace('.NS', '')})</span>
                    <button
                      onClick={() => addToWatchlist(stock.symbol)}
                      disabled={watchlist.includes(stock.symbol)}
                      style={{ ...actionButtonStyle, padding: '5px 14px', fontSize: '13px' }}
                    >
                      {watchlist.includes(stock.symbol) ? 'Added' : 'Add'}
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {showLimitsForm && mainPage === 'cashflow' && (
        <div style={{ ...cardBaseStyle, padding: '18px 20px', marginBottom: '15px' }}>
          <h4 style={{ marginTop: 0, fontFamily: "'Poppins', sans-serif", color: PRIMARY }}>Set spending limits per category</h4>
          {allSpendingCategories.map(cat => (
            <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ color: PRIMARY }}>{cat}</label>
              <input
                type="number"
                placeholder="No limit"
                value={limitInputs[cat] || ''}
                onChange={(e) => setLimitInputs(prev => ({ ...prev, [cat]: e.target.value }))}
                style={{ ...inputStyle, width: '120px' }}
              />
            </div>
          ))}
          <button onClick={handleSaveLimits} disabled={savingLimits} style={{ ...actionButtonStyle, marginTop: '6px' }}>
            {savingLimits ? 'Saving...' : 'Save limits'}
          </button>
        </div>
      )}

      {mainPage === 'overview' && (
        <>
          <p style={{ color: PRIMARY_MUTED, marginTop: '10px', marginBottom: '20px' }}>
            Welcome back, {currentUsername ? currentUsername.split(' ')[0] : ''} — here's your snapshot for {monthOptions.find(m => m.value === selectedMonth)?.label}
          </p>

          {incomeTotal === 0 && spendingTotal === 0 && (
            <div style={{ ...cardBaseStyle, padding: '30px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>👋</div>
              <p style={{ color: PRIMARY, fontWeight: '600', fontSize: '16px', margin: '0 0 6px', fontFamily: "'Poppins', sans-serif" }}>
                Let's get started
              </p>
              <p style={{ color: PRIMARY_MUTED, fontSize: '13px', margin: '0 0 16px' }}>
                You haven't logged any income or spending for this month yet. Head to Cash Flow to add your first entry.
              </p>
              <button onClick={() => setMainPage('cashflow')} style={actionButtonStyle}>Go to Cash Flow</button>
            </div>
          )}

          <SummaryCards cards={[
            { label: 'Total Income', value: `₹${incomeTotal.toLocaleString('en-IN')}`, icon: '💰' },
            { label: 'Total Spent', value: `₹${spendingTotal.toLocaleString('en-IN')}`, icon: '💸' },
            { label: 'Saved This Month', value: `₹${savedThisMonth.toLocaleString('en-IN')}`, color: HIGHLIGHT, subtext: `${savingsRate}% savings rate`, subtextColor: HIGHLIGHT, icon: '🏦' },
            { label: 'Watching', value: `${watchlist.length} stocks`, icon: '⭐' },
          ]} />

          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ ...cardBaseStyle, padding: '20px', flex: '1 1 220px' }}>
              <h4 style={{ marginTop: 0, fontFamily: "'Poppins', sans-serif", color: PRIMARY }}>Cash Flow</h4>
              <p style={{ fontSize: '13px', color: PRIMARY_MUTED, marginBottom: '14px' }}>
                {incomeTotal > 0 ? `You've spent ${Math.round((spendingTotal / incomeTotal) * 100)}% of your income this month.` : 'No income logged yet this month.'}
              </p>
              <button onClick={() => setMainPage('cashflow')} style={secondaryButtonStyle}>View details</button>
            </div>
            <div style={{ ...cardBaseStyle, padding: '20px', flex: '1 1 220px' }}>
              <h4 style={{ marginTop: 0, fontFamily: "'Poppins', sans-serif", color: PRIMARY }}>Savings</h4>
              <p style={{ fontSize: '13px', color: PRIMARY_MUTED, marginBottom: '14px' }}>
                {savingsGoal > 0 ? `You're at ${goalProgress}% of your ₹${savingsGoal.toLocaleString('en-IN')} goal.` : 'No savings goal set yet.'}
              </p>
              <button onClick={() => setMainPage('savings')} style={secondaryButtonStyle}>View details</button>
            </div>
            <div style={{ ...cardBaseStyle, padding: '20px', flex: '1 1 220px' }}>
              <h4 style={{ marginTop: 0, fontFamily: "'Poppins', sans-serif", color: PRIMARY }}>Investments</h4>
              <p style={{ fontSize: '13px', color: PRIMARY_MUTED, marginBottom: '14px' }}>
                ₹{savedThisMonth.toLocaleString('en-IN')} available to invest this month.
              </p>
              <button onClick={() => setMainPage('investments')} style={secondaryButtonStyle}>View details</button>
            </div>
          </div>
          <div style={{ ...cardBaseStyle, padding: '20px' }}>
            <h3 style={{ marginTop: 0, fontFamily: "'Poppins', sans-serif", color: PRIMARY }}>Yearly Summary — {new Date().getFullYear()}</h3>
            {!yearlySummary && <p style={{ color: PRIMARY_MUTED, fontSize: '13px' }}>Loading yearly totals...</p>}
            {yearlySummary && (
              <>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: PRIMARY_MUTED, textTransform: 'uppercase' }}>Total Income</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: PRIMARY, fontFamily: "'Poppins', sans-serif" }}>₹{yearlySummary.totalIncome.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: PRIMARY_MUTED, textTransform: 'uppercase' }}>Total Spent</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: PRIMARY, fontFamily: "'Poppins', sans-serif" }}>₹{yearlySummary.totalSpent.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: PRIMARY_MUTED, textTransform: 'uppercase' }}>Total Invested</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: HIGHLIGHT, fontFamily: "'Poppins', sans-serif" }}>₹{yearlySummary.totalSaved.toLocaleString('en-IN')}</div>
                  </div>
                </div>
                {yearlySummary.topCategory && (
                  <p style={{ fontSize: '13px', color: PRIMARY_MUTED, margin: 0 }}>
                    Your biggest spending category this year: <strong style={{ color: PRIMARY }}>{yearlySummary.topCategory}</strong> (₹{yearlySummary.topCategoryAmount.toLocaleString('en-IN')})
                  </p>
                )}
              </>
            )}
          </div>
        </>
      )}

      {mainPage === 'cashflow' && (
        <>
          <SummaryCards cards={[
            { label: 'Total Income', value: `₹${incomeTotal.toLocaleString('en-IN')}`, icon: '💰' },
            { label: 'Total Spent', value: `₹${spendingTotal.toLocaleString('en-IN')}`, icon: '💸' },
            { label: 'Remaining', value: `₹${(incomeTotal - spendingTotal).toLocaleString('en-IN')}`, color: NEGATIVE, icon: '🎯' },
            { label: '% of Income Spent', value: incomeTotal > 0 ? `${Math.round((spendingTotal / incomeTotal) * 100)}%` : '0%', icon: '📊', tooltip: 'What share of your total income went to spending this month. Lower is better for saving.' },
          ]} />

          {(spendingChangePct !== null || incomeChangePct !== null) && (
            <div style={{ ...cardBaseStyle, padding: '14px 20px', marginBottom: '20px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {spendingChangePct !== null && (
                <div style={{ fontSize: '14px', color: PRIMARY }}>
                  You spent{' '}
                  <span style={{ fontWeight: '600', color: spendingChangePct > 0 ? NEGATIVE : HIGHLIGHT }}>
                    {Math.abs(spendingChangePct)}% {spendingChangePct >= 0 ? 'more' : 'less'}
                  </span>
                  {' '}than {monthShortLabels[prevMonthTotals.month] || 'last month'}
                </div>
              )}
              {incomeChangePct !== null && (
                <div style={{ fontSize: '14px', color: PRIMARY }}>
                  Income was{' '}
                  <span style={{ fontWeight: '600', color: incomeChangePct >= 0 ? HIGHLIGHT : NEGATIVE }}>
                    {Math.abs(incomeChangePct)}% {incomeChangePct >= 0 ? 'higher' : 'lower'}
                  </span>
                  {' '}than {monthShortLabels[prevMonthTotals.month] || 'last month'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'spending' && (
            <div style={{ ...cardBaseStyle, padding: '20px', marginBottom: '20px' }}>
              <h4 style={{ marginTop: 0, fontFamily: "'Poppins', sans-serif", color: PRIMARY }}>Where this month's spending went</h4>
              <DonutChart
                categories={allSpendingCategories}
                amounts={spendingAmounts}
                colors={spendingColors}
                total={spendingTotal}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button
              onClick={() => setActiveTab('spending')}
              style={tabButtonStyle(activeTab === 'spending')}
            >
              Spending
            </button>
            <button
              onClick={() => setActiveTab('income')}
              style={tabButtonStyle(activeTab === 'income')}
            >
              Income
            </button>
          </div>

          {categories.map(category => {
            const limit = parseFloat(categoryLimits[category])
            const spent = parseFloat(amounts[category]) || 0
            const overLimit = activeTab === 'spending' && !isNaN(limit) && limit > 0 && spent > limit
            return (
              <div key={category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ color: PRIMARY }}>{category}</label>
                  {overLimit && (
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: 'var(--tag-negative-bg)', color: NEGATIVE, fontWeight: '500' }}>
                      Over ₹{limit} limit
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  placeholder="0"
                  value={amounts[category] || ''}
                  onChange={(e) => handleChange(activeTab, category, e.target.value)}
                  style={{ ...inputStyle, width: '120px' }}
                />
              </div>
            )
          })}

          <h3 style={{ fontFamily: "'Poppins', sans-serif", color: PRIMARY }}>Total: ₹{total.toLocaleString('en-IN')}</h3>

          <button
            onClick={() => handleSave(activeTab, categories, amounts)}
            disabled={saving}
            style={{ ...actionButtonStyle, padding: '11px 22px', fontSize: '16px' }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </>
      )}

      {mainPage === 'savings' && (
        <>
          <p style={{ color: PRIMARY_MUTED, marginTop: '10px', marginBottom: '20px' }}>
            Income vs. expenses, tracked monthly
          </p>

          <SummaryCards cards={[
            { label: 'Monthly Income', value: `₹${incomeTotal.toLocaleString('en-IN')}`, icon: '💰' },
            { label: 'Monthly Spending', value: `₹${spendingTotal.toLocaleString('en-IN')}`, icon: '💸' },
            {
              label: 'Saved This Month',
              value: `₹${savedThisMonth.toLocaleString('en-IN')}`,
              color: HIGHLIGHT,
              subtext: `${savingsRate}% savings rate`,
              subtextColor: HIGHLIGHT,
              icon: '🏦',
              tooltip: 'Savings rate = (Income − Spending) ÷ Income × 100. Higher means you kept a larger share of what you earned.'
            },
            {
              label: 'Goal Progress',
              value: savingsGoal > 0 ? `${goalProgress}%` : '–',
              subtext: savingsGoal > 0 ? `of ₹${savingsGoal.toLocaleString('en-IN')} goal` : 'No goal set yet',
              icon: '🎯',
              tooltip: 'How much of your monthly savings goal you\'ve reached so far, based on this month\'s savings.'
            },
          ]} />

          <div style={{ ...cardBaseStyle, padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, fontFamily: "'Poppins', sans-serif", color: PRIMARY }}>Monthly Investment Contributions</h3>
            {savingsCategories.map(category => (
              <div key={category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ color: PRIMARY }}>{category}</label>
                <input
                  type="number"
                  placeholder="0"
                  value={savingsAmounts[category] || ''}
                  onChange={(e) => handleChange('savings', category, e.target.value)}
                  style={{ ...inputStyle, width: '120px' }}
                />
              </div>
            ))}
            <p style={{ fontSize: '13px', color: PRIMARY_MUTED, marginTop: '10px' }}>
              How much you've put into SIPs and stocks this month — counted toward your total savings.
            </p>
            <button onClick={() => handleSave('savings', savingsCategories, savingsAmounts)} disabled={saving} style={{ ...actionButtonStyle, marginTop: '10px' }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>

          <div style={{ ...cardBaseStyle, padding: '20px' }}>
            <h3 style={{ marginTop: 0, fontFamily: "'Poppins', sans-serif", color: PRIMARY }}>Savings rate, last 6 months</h3>
            <SavingsRateChart data={savingsRateHistory} />
          </div>
        </>
      )}

      {mainPage === 'investments' && (
        <>
          <p style={{ color: PRIMARY_MUTED, marginTop: '10px', marginBottom: '20px' }}>
            Live market prices, matched against what you can afford to invest
          </p>

          <div style={{
            background: 'var(--banner-bg)',
            borderRadius: '16px',
            padding: '18px 20px',
            marginBottom: '20px',
            boxShadow: CARD_SHADOW
          }}>
            <div style={{ fontSize: '11px', color: PRIMARY, textTransform: 'uppercase', marginBottom: '6px', opacity: 0.8 }}>
              Available to invest this month
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700', color: PRIMARY, fontFamily: "'Poppins', sans-serif" }}>
              ₹{savedThisMonth.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '13px', color: PRIMARY, opacity: 0.7, marginTop: '4px' }}>
              Based on your income minus spending this month
            </div>
          </div>

          {loadingStocks && (
            <div style={{ ...cardBaseStyle, padding: '10px 20px' }}>
              {[1, 2, 3, 4, 5].map(i => <StockRowSkeleton key={i} />)}
            </div>
          )}

          {!loadingStocks && nifty50Stocks.length > 0 && (
            <>
              <p style={{ fontSize: '13px', color: PRIMARY_MUTED, marginBottom: '10px' }}>
                Watching {watchlist.length} stocks
              </p>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button
                  onClick={() => setInvestTab('all')}
                  style={tabButtonStyle(investTab === 'all')}
                >
                  All Stocks
                </button>
                <button
                  onClick={() => setInvestTab('watchlist')}
                  style={tabButtonStyle(investTab === 'watchlist')}
                >
                  Watchlist
                </button>
              </div>

              {investTab === 'watchlist' && (
                <>
                  {watchlist.length > 0 && (() => {
                    const watchlistStocks = nifty50Stocks.filter(s => watchlist.includes(s.symbol))
                    const sectorCounts = {}
                    watchlistStocks.forEach(s => {
                      sectorCounts[s.sector] = (sectorCounts[s.sector] || 0) + 1
                    })
                    const sectorColors = ["#8B7FB0", "#E8748A", "#7EC8CD", "#F4B183", "#B08DD8", "#6FBF9E", "#A6A6C8", "#F0A8A0"]
                    const sectorEntries = Object.entries(sectorCounts)
                    return (
                      <div style={{ ...cardBaseStyle, padding: '20px', marginBottom: '16px' }}>
                        <h4 style={{ marginTop: 0, fontFamily: "'Poppins', sans-serif", color: PRIMARY }}>Sector breakdown</h4>
                        <p style={{ fontSize: '12px', color: PRIMARY_MUTED, marginTop: '-8px', marginBottom: '14px' }}>
                          What industries your watchlist covers
                        </p>
                        {sectorEntries.map(([sector, count], i) => {
                          const pct = Math.round((count / watchlistStocks.length) * 100)
                          return (
                            <div key={sector} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: sectorColors[i % sectorColors.length], flexShrink: 0 }}></span>
                              <span style={{ fontSize: '13px', color: PRIMARY, flex: 1 }}>{sector}</span>
                              <div style={{ flex: 2, background: 'var(--input-bg)', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: sectorColors[i % sectorColors.length], borderRadius: '6px' }}></div>
                              </div>
                              <span style={{ fontSize: '12px', color: PRIMARY_MUTED, width: '60px', textAlign: 'right' }}>{count} stock{count > 1 ? 's' : ''} · {pct}%</span>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                <div style={{ ...cardBaseStyle, padding: '10px 20px' }}>
                  {watchlist.length === 0 && (
                    <div style={{ padding: '30px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '32px', marginBottom: '10px' }}>⭐</div>
                      <p style={{ color: PRIMARY, fontWeight: '500', margin: '0 0 4px' }}>No stocks in your watchlist yet</p>
                      <p style={{ color: PRIMARY_MUTED, fontSize: '13px', margin: 0 }}>Use "+ Add stock to watchlist" above to start tracking stocks you're interested in.</p>
                    </div>
                  )}
                  {nifty50Stocks
                    .filter(stock => watchlist.includes(stock.symbol))
                    .map(stock => (
                      <div key={stock.symbol} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: '0.5px solid var(--border-color)'
                      }}>
                        <div>
                          <div style={{ fontWeight: '600', color: PRIMARY }}>{stock.name}</div>
                          <div style={{ fontSize: '12px', color: PRIMARY_MUTED }}>{stock.symbol.replace('.NS', '')}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: PRIMARY }}>₹{stock.price.toLocaleString('en-IN')}</div>
                            <div style={{ fontSize: '13px', color: stock.change_pct >= 0 ? HIGHLIGHT : NEGATIVE }}>
                              {stock.change_pct >= 0 ? '+' : ''}{stock.change_pct}%
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromWatchlist(stock.symbol)}
                            style={{ padding: '5px 12px', fontSize: '12px', color: NEGATIVE, background: 'transparent', border: `0.5px solid ${NEGATIVE}55`, borderRadius: '14px', cursor: 'pointer' }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
                </>
              )}

              {investTab === 'all' && (
                <>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Search stocks by name or symbol..."
                      value={stockSearch}
                      onChange={(e) => setStockSearch(e.target.value)}
                      style={{ ...inputStyle, flex: '1 1 200px', boxSizing: 'border-box' }}
                    />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="change_desc">Sort: % change (high to low)</option>
                      <option value="change_asc">Sort: % change (low to high)</option>
                      <option value="price_desc">Sort: Price (high to low)</option>
                      <option value="price_asc">Sort: Price (low to high)</option>
                      <option value="name_asc">Sort: Name (A-Z)</option>
                    </select>
                  </div>
              <div style={{ ...cardBaseStyle, padding: '10px 20px' }}>
                {nifty50Stocks
                  .filter(stock =>
                    stock.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
                    stock.symbol.toLowerCase().includes(stockSearch.toLowerCase())
                  )
                  .sort((a, b) => {
                    if (sortBy === 'change_desc') return b.change_pct - a.change_pct
                    if (sortBy === 'change_asc') return a.change_pct - b.change_pct
                    if (sortBy === 'price_desc') return b.price - a.price
                    if (sortBy === 'price_asc') return a.price - b.price
                    if (sortBy === 'name_asc') return a.name.localeCompare(b.name)
                    return 0
                  })
                  .slice(0, stockSearch ? undefined : 10)
                  .map(stock => (
                  <div key={stock.symbol} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '0.5px solid var(--border-color)'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', color: PRIMARY }}>{stock.name}</div>
                      <div style={{ fontSize: '12px', color: PRIMARY_MUTED }}>{stock.symbol.replace('.NS', '')}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: stock.price <= savedThisMonth ? 'var(--tag-positive-bg)' : 'var(--tag-negative-bg)',
                        color: stock.price <= savedThisMonth ? HIGHLIGHT : NEGATIVE
                      }}>
                        {stock.price <= savedThisMonth ? 'Within budget' : 'Above budget'}
                      </span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: PRIMARY }}>₹{stock.price.toLocaleString('en-IN')}</div>
                        <div style={{ fontSize: '13px', color: stock.change_pct >= 0 ? HIGHLIGHT : NEGATIVE }}>
                          {stock.change_pct >= 0 ? '+' : ''}{stock.change_pct}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {!stockSearch && nifty50Stocks.length > 10 && (
                <p style={{ fontSize: '13px', color: PRIMARY_MUTED, marginTop: '10px' }}>
                  Showing top 10 of {nifty50Stocks.length}. Search above to find others.
                </p>
              )}
                </>
              )}
            </>
          )}
        </>
      )}

      {mainPage === 'settings' && (
        <>
          <p style={{ color: PRIMARY_MUTED, marginTop: '10px', marginBottom: '20px' }}>
            Manage your account details
          </p>

          <div style={{ ...cardBaseStyle, padding: '20px', marginBottom: '20px', maxWidth: '440px' }}>
            <h3 style={{ marginTop: 0, fontFamily: "'Poppins', sans-serif", color: PRIMARY }}>Profile</h3>
            <label style={{ fontSize: '12px', color: PRIMARY, fontWeight: '500', display: 'block', marginBottom: '6px' }}>Name</label>
            <input
              type="text"
              value={settingsName}
              onChange={(e) => setSettingsName(e.target.value)}
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', marginBottom: '10px' }}
            />
            {settingsMsg && <p style={{ color: NEGATIVE, fontSize: '13px', margin: '0 0 10px' }}>{settingsMsg}</p>}
            <button onClick={handleUpdateName} disabled={savingName} style={actionButtonStyle}>{savingName ? 'Saving...' : 'Save name'}</button>
          </div>

          <div style={{ ...cardBaseStyle, padding: '20px', maxWidth: '440px' }}>
            <h3 style={{ marginTop: 0, fontFamily: "'Poppins', sans-serif", color: PRIMARY }}>Change password</h3>
            <label style={{ fontSize: '12px', color: PRIMARY, fontWeight: '500', display: 'block', marginBottom: '6px' }}>Current password</label>
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <input
                type={showCurrentPw ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', paddingRight: '40px' }}
              />
              <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px', color: PRIMARY_MUTED, padding: 0 }}>
                {showCurrentPw ? '🙈' : '👁️'}
              </button>
            </div>
            <label style={{ fontSize: '12px', color: PRIMARY, fontWeight: '500', display: 'block', marginBottom: '6px' }}>New password</label>
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <input
                type={showNewPw ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', paddingRight: '40px' }}
              />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px', color: PRIMARY_MUTED, padding: 0 }}>
                {showNewPw ? '🙈' : '👁️'}
              </button>
            </div>
            <label style={{ fontSize: '12px', color: PRIMARY, fontWeight: '500', display: 'block', marginBottom: '6px' }}>Confirm new password</label>
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <input
                type={showConfirmNewPw ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', paddingRight: '40px' }}
              />
              <button type="button" onClick={() => setShowConfirmNewPw(!showConfirmNewPw)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px', color: PRIMARY_MUTED, padding: 0 }}>
                {showConfirmNewPw ? '🙈' : '👁️'}
              </button>
            </div>
            {passwordMsg && <p style={{ color: NEGATIVE, fontSize: '13px', margin: '0 0 10px' }}>{passwordMsg}</p>}
            <button onClick={handleUpdatePassword} disabled={savingPassword} style={actionButtonStyle}>{savingPassword ? 'Updating...' : 'Update password'}</button>
          </div>
        </>
      )}
    </div>
    </div>

    {toast && (
      <div style={{
        position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
        background: ACCENT, color: '#fff', padding: '12px 24px', borderRadius: '20px',
        fontSize: '14px', fontFamily: "'IBM Plex Sans', sans-serif",
        boxShadow: '0 6px 20px rgba(91,75,138,0.35)', zIndex: 100
      }}>
        {toast}
      </div>
    )}
    </div>
  )
}

export default App