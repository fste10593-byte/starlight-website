const morningVerses = [
  { text: "This is the day the Lord has made; let us rejoice and be glad in it.", ref: "Psalm 118:24" },
  { text: "The steadfast love of the Lord never ceases; His mercies never come to an end. They are new every morning.", ref: "Lamentations 3:22-23" },
  { text: "Let the morning bring me word of Your unfailing love, for I have put my trust in You.", ref: "Psalm 143:8" },
  { text: "But I will sing of Your strength; in the morning I will sing of Your love.", ref: "Psalm 59:16" },
  { text: "She is clothed with strength and dignity; she can laugh at the days to come.", ref: "Proverbs 31:25" },
  { text: "You are altogether beautiful, my love; there is no flaw in you.", ref: "Song of Solomon 4:7" },
  { text: "I praise You because I am fearfully and wonderfully made.", ref: "Psalm 139:14" },
  { text: "Arise, shine, for your light has come, and the glory of the Lord rises upon you.", ref: "Isaiah 60:1" },
  { text: "The Lord bless you and keep you; the Lord make His face shine on you.", ref: "Numbers 6:24-25" },
];

const eveningVerses = [
  { text: "He grants sleep to those He loves.", ref: "Psalm 127:2" },
  { text: "In peace I will lie down and sleep, for You alone, Lord, make me dwell in safety.", ref: "Psalm 4:8" },
  { text: "Cast all your anxiety on Him because He cares for you.", ref: "1 Peter 5:7" },
  { text: "Do not be anxious about anything, but in every situation, by prayer, present your requests to God.", ref: "Philippians 4:6" },
  { text: "Come to Me, all you who are weary and burdened, and I will give you rest.", ref: "Matthew 11:28" },
  { text: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures.", ref: "Psalm 23:1-2" },
  { text: "I have loved you with an everlasting love; I have drawn you with unfailing kindness.", ref: "Jeremiah 31:3" },
  { text: "She is more precious than rubies; nothing you desire can compare with her.", ref: "Proverbs 3:15" },
  { text: "Be still, and know that I am God.", ref: "Psalm 46:10" },
  { text: "The Lord your God is with you, the Mighty Warrior who saves. He will rejoice over you with great delight.", ref: "Zephaniah 3:17" },
];

let currentVerseIndex = -1;

function loadVerse() {
  const h = new Date().getHours();
  const isMorning = h >= 5 && h < 17;
  const list = isMorning ? morningVerses : eveningVerses;

  let idx;
  do { idx = Math.floor(Math.random() * list.length); } while (idx === currentVerseIndex && list.length > 1);
  currentVerseIndex = idx;

  const v = list[idx];
  const textEl  = document.getElementById('verse-text');
  const refEl   = document.getElementById('verse-ref');
  const labelEl = document.getElementById('verse-period-label');

  textEl.style.opacity = '0';
  refEl.style.opacity  = '0';
  setTimeout(() => {
    textEl.textContent = '"' + v.text + '"';
    refEl.textContent  = '— ' + v.ref;
    labelEl.textContent = isMorning ? '🌅 Morning Verse' : '🌙 Evening Verse';
    textEl.style.transition = 'opacity 0.5s';
    refEl.style.transition  = 'opacity 0.5s';
    textEl.style.opacity = '1';
    refEl.style.opacity  = '1';
  }, 250);
}

function updateClock() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const el = document.getElementById('hero-time');
  if (el) el.textContent = dateStr + '  ·  ' + timeStr;
}

function getMessages() {
  return JSON.parse(localStorage.getItem('starlight_messages') || '[]');
}
function saveMessages(msgs) {
  localStorage.setItem('starlight_messages', JSON.stringify(msgs));
}

function saveMessage() {
  const input = document.getElementById('msg-input');
  const text = input.value.trim();
  if (!text) return;
  const msgs = getMessages();
  msgs.unshift({
    id: Date.now(),
    text: text,
    date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  });
  saveMessages(msgs);
  input.value = '';
  renderMessages();
  showNotif('Message sent to Starlight 💚');
}

function deleteMessage(id) {
  const msgs = getMessages().filter(function(m) { return m.id !== id; });
  saveMessages(msgs);
  renderMessages();
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function renderMessages() {
  const list = document.getElementById('messages-list');
  const msgs = getMessages();
  if (msgs.length === 0) {
    list.innerHTML = '<p style="color:var(--text-light);font-size:0.9rem;text-align:center;padding:1rem;">No messages yet. Write her something sweet 💚</p>';
    return;
  }
  list.innerHTML = msgs.map(function(m) {
    return '<div class="msg-bubble"><button class="delete-btn" onclick="deleteMessage(' + m.id + ')">✕</button><p>' + escapeHtml(m.text) + '</p><small>💚 ' + m.date + '</small></div>';
  }).join('');
}

const meals = [
  { id: 'breakfast', name: 'Breakfast', hour: 7,  minute: 0 },
  { id: 'lunch',     name: 'Lunch',     hour: 12, minute: 0 },
  { id: 'merienda',  name: 'Merienda',  hour: 15, minute: 0 },
  { id: 'dinner',    name: 'Dinner',    hour: 19, minute: 0 },
];

const mealRemindedToday = {};

function updateMealStatus() {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  meals.forEach(function(meal) {
    const mealMin = meal.hour * 60 + meal.minute;
    const el = document.getElementById('status-' + meal.id);
    if (!el) return;
    el.className = 'meal-status';
    let label = '';
    if (nowMin >= mealMin - 15 && nowMin < mealMin + 30) {
      el.classList.add('status-now');
      label = '🔔 Time to eat!';
      if (!mealRemindedToday[meal.id]) {
        mealRemindedToday[meal.id] = true;
        showNotif(meal.name + ' time, Starlight! Please eat 💚');
      }
    } else if (nowMin >= mealMin + 30) {
      el.classList.add('status-done');
      label = '✓ Done';
    } else {
      el.classList.add('status-upcoming');
      const diff = mealMin - nowMin;
      label = diff < 60 ? 'In ' + diff + ' min' : 'In ' + Math.round(diff / 60) + 'h';
    }
    el.textContent = label;
  });
}

let calYear  = new Date().getFullYear();
let calMonth = new Date().getMonth();

function getCalNotes() {
  return JSON.parse(localStorage.getItem('starlight_cal_notes') || '[]');
}
function saveCalNotes(notes) {
  localStorage.setItem('starlight_cal_notes', JSON.stringify(notes));
}

function addCalNote() {
  const date = document.getElementById('note-date').value;
  const text = document.getElementById('note-text').value.trim();
  if (!date || !text) { showNotif('Please pick a date and write a note 💚'); return; }
  const notes = getCalNotes();
  notes.push({ id: Date.now(), date: date, text: text });
  saveCalNotes(notes);
  document.getElementById('note-date').value = '';
  document.getElementById('note-text').value = '';
  renderCalendar();
  renderCalNotes();
  showNotif('Note added 💚');
}

function deleteCalNote(id) {
  const notes = getCalNotes().filter(function(n) { return n.id !== id; });
  saveCalNotes(notes);
  renderCalendar();
  renderCalNotes();
}

function changeMonth(delta) {
  calMonth += delta;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  renderCalendar();
}

function renderCalendar() {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('cal-title').textContent = months[calMonth] + ' ' + calYear;

  const today = new Date();
  const notes = getCalNotes();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  let html = '';
  for (let i = 0; i < firstDay; i++) html += '<div class="cal-day empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = calYear + '-' + String(calMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const isToday = d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
    const hasNote = notes.some(function(n) { return n.date === dateStr; });
    html += '<div class="cal-day' + (isToday ? ' today' : '') + (hasNote ? ' has-note' : '') + '">' + d + '</div>';
  }
  document.getElementById('cal-grid').innerHTML = html;
}

function renderCalNotes() {
  const list  = document.getElementById('cal-notes-list');
  const notes = getCalNotes().sort(function(a, b) { return a.date.localeCompare(b.date); });
  if (notes.length === 0) {
    list.innerHTML = '<p style="font-size:0.82rem;color:var(--text-light);">No notes yet.</p>';
    return;
  }
  list.innerHTML = notes.map(function(n) {
    const d = new Date(n.date + 'T00:00:00');
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return '<div class="cal-note-item"><div><span class="date">' + label + '</span>' + escapeHtml(n.text) + '</div><button onclick="deleteCalNote(' + n.id + ')">✕</button></div>';
  }).join('');
}

let notifTimer = null;
function showNotif(msg) {
  const el = document.getElementById('notif-popup');
  document.getElementById('notif-text').textContent = msg;
  el.style.display = 'block';
  if (notifTimer) clearTimeout(notifTimer);
  notifTimer = setTimeout(function() { el.style.display = 'none'; }, 3500);
}

document.addEventListener('DOMContentLoaded', function() {
  loadVerse();
  updateClock();
  renderMessages();
  updateMealStatus();
  renderCalendar();
  renderCalNotes();

  setInterval(updateClock, 30000);
  setInterval(updateMealStatus, 60000);

  document.getElementById('msg-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveMessage();
    }
  });
});