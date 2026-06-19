import { useState, useEffect } from 'react';

/* ── storage hook ── */
function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; }
    catch { return init; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)); }, [key, val]);
  return [val, setVal];
}

/* ── utils ── */
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const today = () => new Date().toISOString().slice(0, 10);

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

function daysBetween(start, end) {
  if (!start || !end) return 1;
  const diff = Math.round((new Date(end) - new Date(start)) / 86400000);
  return Math.max(1, diff + 1);
}

function eur(amount) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount || 0);
}

const TRANSPORT = { Flug: '✈️', Zug: '🚂', Auto: '🚗', Bus: '🚌' };
const CATEGORY  = { Bücher: '📚', Technik: '💻', Bürobedarf: '🖊️', Sonstiges: '📦' };

const COUNTRY_FLAGS = {
  'Deutschland': '🇩🇪', 'Österreich': '🇦🇹', 'Schweiz': '🇨🇭',
  'Frankreich': '🇫🇷', 'Italien': '🇮🇹', 'Spanien': '🇪🇸',
  'Portugal': '🇵🇹', 'Niederlande': '🇳🇱', 'Belgien': '🇧🇪',
  'Luxemburg': '🇱🇺', 'Polen': '🇵🇱', 'Tschechien': '🇨🇿',
  'Slowakei': '🇸🇰', 'Ungarn': '🇭🇺', 'Rumänien': '🇷🇴',
  'Kroatien': '🇭🇷', 'Slowenien': '🇸🇮', 'Serbien': '🇷🇸',
  'Griechenland': '🇬🇷', 'Türkei': '🇹🇷', 'Schweden': '🇸🇪',
  'Norwegen': '🇳🇴', 'Dänemark': '🇩🇰', 'Finnland': '🇫🇮',
  'Irland': '🇮🇪', 'Großbritannien': '🇬🇧', 'England': '🇬🇧',
  'USA': '🇺🇸', 'Vereinigte Staaten': '🇺🇸', 'Kanada': '🇨🇦',
  'Mexiko': '🇲🇽', 'Brasilien': '🇧🇷', 'Argentinien': '🇦🇷',
  'Japan': '🇯🇵', 'China': '🇨🇳', 'Südkorea': '🇰🇷',
  'Indien': '🇮🇳', 'Australien': '🇦🇺', 'Singapur': '🇸🇬',
  'Russland': '🇷🇺', 'Israel': '🇮🇱', 'Marokko': '🇲🇦',
  'Südafrika': '🇿🇦', 'Ägypten': '🇪🇬', 'VAE': '🇦🇪',
  'Vereinigte Arabische Emirate': '🇦🇪', 'Saudi-Arabien': '🇸🇦',
};

function countryFlag(country) {
  if (!country) return '🌍';
  return COUNTRY_FLAGS[country] || '🌍';
}

/* ── Modal ── */
function Modal({ defaultType, onClose, onSave }) {
  const [type, setType] = useState(defaultType || null);
  const t0 = today();
  const [trip, setTrip] = useState({ destination: '', country: 'Deutschland', purpose: '', startDate: t0, endDate: t0, transport: 'Zug' });
  const [purch, setPurch] = useState({ name: '', amount: '', category: 'Technik', date: t0 });

  function save() {
    if (type === 'trip') {
      if (!trip.destination.trim()) return alert('Bitte Stadt angeben.');
      onSave({ ...trip, type: 'trip', id: uid() });
    } else {
      if (!purch.name.trim() || !purch.amount) return alert('Bitte Bezeichnung und Betrag angeben.');
      onSave({ ...purch, type: 'purchase', id: uid(), amount: parseFloat(String(purch.amount).replace(',', '.')) });
    }
    onClose();
  }

  function setT(k, v) { setTrip(p => ({ ...p, [k]: v })); }
  function setP(k, v) { setPurch(p => ({ ...p, [k]: v })); }

  return (
    <div className="modal-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-handle" />
        <div className="modal-title">{type ? (type === 'trip' ? '✈️ Neue Dienstreise' : '🛍️ Neue Anschaffung') : 'Neuer Eintrag'}</div>

        {!type && (
          <div className="type-picker">
            <button className="type-btn" onClick={() => setType('trip')}>
              <span className="type-btn-icon">✈️</span>
              <span className="type-btn-label">Dienstreise</span>
            </button>
            <button className="type-btn" onClick={() => setType('purchase')}>
              <span className="type-btn-icon">🛍️</span>
              <span className="type-btn-label">Anschaffung</span>
            </button>
          </div>
        )}

        {type === 'trip' && (
          <div className="form">
            <div className="field">
              <label>Stadt *</label>
              <input autoFocus placeholder="z.B. München" value={trip.destination} onChange={e => setT('destination', e.target.value)} />
            </div>
            <div className="field">
              <label>Land</label>
              <input placeholder="Deutschland" value={trip.country} onChange={e => setT('country', e.target.value)} />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Abreise</label>
                <input type="date" value={trip.startDate} onChange={e => setT('startDate', e.target.value)} />
              </div>
              <div className="field">
                <label>Rückkehr</label>
                <input type="date" value={trip.endDate} min={trip.startDate} onChange={e => setT('endDate', e.target.value)} />
              </div>
            </div>
            <button className="btn-primary" onClick={save}>Speichern</button>
          </div>
        )}

        {type === 'purchase' && (
          <div className="form">
            <div className="field">
              <label>Bezeichnung *</label>
              <input autoFocus placeholder="z.B. Fachbuch, Laptop" value={purch.name} onChange={e => setP('name', e.target.value)} />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Betrag (€) *</label>
                <input type="number" inputMode="decimal" step="0.01" min="0" placeholder="0,00" value={purch.amount} onChange={e => setP('amount', e.target.value)} />
              </div>
              <div className="field">
                <label>Datum</label>
                <input type="date" value={purch.date} onChange={e => setP('date', e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label>Kategorie</label>
              <select value={purch.category} onChange={e => setP('category', e.target.value)}>
                {Object.keys(CATEGORY).map(k => <option key={k} value={k}>{CATEGORY[k]} {k}</option>)}
              </select>
            </div>
            <button className="btn-primary" onClick={save}>Speichern</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── HomeScreen ── */
function HomeScreen({ trips, purchases }) {
  const totalDays  = trips.reduce((s, t) => s + daysBetween(t.startDate, t.endDate), 0);
  const totalSpent = purchases.reduce((s, p) => s + (p.amount || 0), 0);
  const byCat = purchases.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + p.amount; return acc; }, {});

  const recentTrips = [...trips].sort((a,b) => b.startDate.localeCompare(a.startDate));
  const recentPurch = [...purchases].sort((a,b) => b.date.localeCompare(a.date)).slice(0,3);

  return (<>
    <div className="welcome">
      <div className="welcome-tag">Steuerjahr 2026</div>
      <h2>Guten Tag!</h2>
      <p>Hier ist Ihre aktuelle Übersicht.</p>
    </div>

    <div className="stat-grid">
      <div className="stat-card accent">
        <div className="stat-icon">✈️</div>
        <div className="stat-value">{trips.length}</div>
        <div className="stat-label">Reisen</div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">📅</div>
        <div className="stat-value">{totalDays}</div>
        <div className="stat-label">Tage</div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">🛍️</div>
        <div className="stat-value">{purchases.length}</div>
        <div className="stat-label">Käufe</div>
      </div>
    </div>

    {purchases.length > 0 && (
      <div className="summary-card">
        <div className="section-title" style={{marginBottom:10}}>Ausgaben nach Kategorie</div>
        {Object.entries(byCat).map(([cat, amt]) => (
          <div className="summary-row" key={cat}>
            <span>{CATEGORY[cat]} {cat}</span>
            <span style={{color:'var(--brown-600)',fontWeight:600}}>{eur(amt)}</span>
          </div>
        ))}
        <div className="summary-row">
          <span>Gesamt</span>
          <span style={{color:'var(--green-500)'}}>{eur(totalSpent)}</span>
        </div>
      </div>
    )}

    {recentTrips.length > 0 && <>
      <div className="section-header">
        <span className="section-title">Letzte Dienstreisen</span>
      </div>
      {recentTrips.map(t => (
        <div className="card" key={t.id}>
          <div className="card-icon trip" style={{fontSize:28}}>{countryFlag(t.country)}</div>
          <div className="card-body">
            <div className="card-title">{t.destination}{t.country && t.country !== 'Deutschland' ? `, ${t.country}` : ''}</div>
            <div style={{marginTop:4}}>
              <span className="badge">{daysBetween(t.startDate,t.endDate)} {daysBetween(t.startDate,t.endDate)===1?'Tag':'Tage'}</span>
            </div>
          </div>
          <div className="card-right">
            <div className="card-date">{formatDate(t.startDate)}</div>
          </div>
        </div>
      ))}
    </>}

    {recentPurch.length > 0 && <>
      <div className="section-header">
        <span className="section-title">Letzte Anschaffungen</span>
      </div>
      {recentPurch.map(p => (
        <div className="card" key={p.id}>
          <div className="card-icon purchase">{CATEGORY[p.category]}</div>
          <div className="card-body">
            <div className="card-title">{p.name}</div>
            <div style={{marginTop:4}}><span className="badge">{p.category}</span></div>
          </div>
          <div className="card-right">
            <div className="card-amount">{eur(p.amount)}</div>
            <div className="card-date">{formatDate(p.date)}</div>
          </div>
        </div>
      ))}
    </>}

    {trips.length === 0 && purchases.length === 0 && (
      <div className="empty">
        <div className="empty-icon">📋</div>
        <div className="empty-title">Noch keine Einträge</div>
        <div className="empty-sub">Tippen Sie auf + um Ihre erste Dienstreise oder Anschaffung hinzuzufügen.</div>
      </div>
    )}
  </>);
}

/* ── TripsScreen ── */
function TripsScreen({ trips, onDelete }) {
  const sorted = [...trips].sort((a,b) => b.startDate.localeCompare(a.startDate));
  return (<>
    <div className="section-header">
      <span className="section-title">Dienstreisen</span>
      <span className="section-count">{trips.length} {trips.length === 1 ? 'Eintrag' : 'Einträge'}</span>
    </div>
    {sorted.length === 0 && (
      <div className="empty">
        <div className="empty-icon">✈️</div>
        <div className="empty-title">Keine Dienstreisen</div>
        <div className="empty-sub">Fügen Sie Ihre erste Geschäftsreise hinzu.</div>
      </div>
    )}
    {sorted.map(t => (
      <div className="card" key={t.id}>
        <div className="card-icon trip" style={{fontSize:28}}>{countryFlag(t.country)}</div>
        <div className="card-body">
          <div className="card-title">{t.destination}{t.country && t.country !== 'Deutschland' ? `, ${t.country}` : ''}</div>
          <div style={{marginTop:4}}>
            <span className="badge">{daysBetween(t.startDate,t.endDate)} {daysBetween(t.startDate,t.endDate)===1?'Tag':'Tage'}</span>
          </div>
          <div style={{fontSize:11,color:'var(--brown-400)',marginTop:4}}>
            {formatDate(t.startDate)}{t.endDate !== t.startDate ? ` – ${formatDate(t.endDate)}` : ''}
          </div>
        </div>
        <button className="delete-btn" onClick={() => onDelete(t.id,'trip')} title="Löschen">🗑</button>
      </div>
    ))}
  </>);
}

/* ── PurchasesScreen ── */
function PurchasesScreen({ purchases, onDelete }) {
  const sorted = [...purchases].sort((a,b) => b.date.localeCompare(a.date));
  const total  = purchases.reduce((s,p) => s + (p.amount||0), 0);
  return (<>
    <div className="section-header">
      <span className="section-title">Anschaffungen</span>
      <span className="section-count">{purchases.length} {purchases.length === 1 ? 'Eintrag' : 'Einträge'}</span>
    </div>
    {purchases.length > 0 && (
      <div className="total-banner">
        <div className="total-label">Gesamtausgaben</div>
        <div className="total-amount">{eur(total)}</div>
      </div>
    )}
    {sorted.length === 0 && (
      <div className="empty">
        <div className="empty-icon">🛍️</div>
        <div className="empty-title">Keine Anschaffungen</div>
        <div className="empty-sub">Fügen Sie Ihre erste Anschaffung hinzu.</div>
      </div>
    )}
    {sorted.map(p => (
      <div className="card" key={p.id}>
        <div className="card-icon purchase">{CATEGORY[p.category]}</div>
        <div className="card-body">
          <div className="card-title">{p.name}</div>
          <div style={{marginTop:4}}><span className="badge">{p.category}</span></div>
        </div>
        <div className="card-right" style={{marginRight:8}}>
          <div className="card-amount">{eur(p.amount)}</div>
          <div className="card-date">{formatDate(p.date)}</div>
        </div>
        <button className="delete-btn" onClick={() => onDelete(p.id,'purchase')} title="Löschen">🗑</button>
      </div>
    ))}
  </>);
}

/* ── App ── */
export default function App() {
  const [trips,     setTrips]     = useLocalStorage('steuer_trips',     []);
  const [purchases, setPurchases] = useLocalStorage('steuer_purchases', []);
  const [tab,       setTab]       = useState('home');
  const [modal,     setModal]     = useState(null);

  const fabType = { home: null, trips: 'trip', purchases: 'purchase' };

  function handleSave(entry) {
    if (entry.type === 'trip')     setTrips(ts => [entry, ...ts]);
    else                           setPurchases(ps => [entry, ...ps]);
  }

  function handleDelete(id, type) {
    if (!confirm('Eintrag wirklich löschen?')) return;
    if (type === 'trip') setTrips(ts => ts.filter(t => t.id !== id));
    else                 setPurchases(ps => ps.filter(p => p.id !== id));
  }

  return (
    <div className="app">
      <div className="header">
        <div className="header-title">Steuer App</div>
        <div className="header-sub">Steuerjahr 2026</div>
      </div>

      <div className="content">
        {tab === 'home'      && <HomeScreen trips={trips} purchases={purchases} />}
        {tab === 'trips'     && <TripsScreen trips={trips} onDelete={handleDelete} />}
        {tab === 'purchases' && <PurchasesScreen purchases={purchases} onDelete={handleDelete} />}
      </div>

      <button className="fab" onClick={() => setModal({ type: fabType[tab] })}>+</button>

      <div className="tabbar">
        {[
          { id: 'home',      icon: '🏠', label: 'Übersicht' },
          { id: 'trips',     icon: '✈️',  label: 'Dienstreisen' },
          { id: 'purchases', icon: '🛍️', label: 'Anschaffungen' },
        ].map(t => (
          <button key={t.id} className={`tab${tab===t.id?' active':''}`} onClick={() => setTab(t.id)}>
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
            {tab === t.id && <span className="tab-dot" />}
          </button>
        ))}
      </div>

      {modal && (
        <Modal
          defaultType={modal.type}
          onClose={() => setModal(null)}
          onSave={entry => { handleSave(entry); setModal(null); }}
        />
      )}
    </div>
  );
}
