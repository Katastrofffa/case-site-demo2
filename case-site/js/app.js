let currentCase = null;
let balance = 1000;
let isOpening = false;
let inventory = [];

let upgradeMyIds = [];
let upgradeTarget = null;
let isSpinning = false;

const MAX_CHANCE = 80;
const MAX_MY_ITEMS = 5;

const REEL_ITEM_W = 152;
const REEL_TOTAL_ITEMS = 80;
const STORAGE_KEY = 'case_site_state_v1';
const PROFILE_KEY = 'case_site_profile_v1';
const DROPS_KEY = 'case_site_drops_v1';
const DROPS_MAX = 30;

const DONATE_PACKS = [
    { amount: 1000,   price: 'Бесплатно', icon: '💵', badge: '' },
    { amount: 5000,   price: 'Бесплатно', icon: '💰', badge: 'Популярно' },
    { amount: 10000,  price: 'Бесплатно', icon: '💎', badge: '' },
    { amount: 50000,  price: 'Бесплатно', icon: '👑', badge: 'Максимум' },
];

const FAKE_PLAYERS = [
    'ShadowFox', 'NeonBlade', 'xX_Dark_Xx', 'КиберКот', 'Mr.Ghost',
    'ToxicWave', 'Vortex', 'LuckyShot', 'Голодный', 'AWP_God',
    'PandaPro', 'Snegovik', 'FrostBite', 'Zephyr', 'Космос',
];

const menuScreen = document.getElementById('menuScreen');
const caseScreen = document.getElementById('caseScreen');
const casesGrid = document.getElementById('casesGrid');
const dropsStrip = document.getElementById('dropsStrip');
const reel = document.getElementById('reel');
const openBtn = document.getElementById('openBtn');
const fastBtn = document.getElementById('fastBtn');
const resultMsg = document.getElementById('resultMsg');
const caseTitle = document.getElementById('caseTitle');
const casePrice = document.getElementById('casePrice');
const itemsPreview = document.getElementById('itemsPreview');
const balanceEl = document.getElementById('balance');
const balanceEl2 = document.getElementById('balance2');

const navCases = document.getElementById('navCases');
const navUpgrade = document.getElementById('navUpgrade');
const navInventory = document.getElementById('navInventory');
const casesView = document.getElementById('casesView');
const upgradeView = document.getElementById('upgradeView');
const inventoryView = document.getElementById('inventoryView');
const inventoryGrid = document.getElementById('inventoryGrid');
const invTotal = document.getElementById('invTotal');
const sellAllBtn = document.getElementById('sellAllBtn');
const emptyState = document.getElementById('emptyState');

const upgradeMySlot = document.getElementById('upgradeMySlot');
const upgradeTargetSlot = document.getElementById('upgradeTargetSlot');
const upgradeChance = document.getElementById('upgradeChance');
const upgradeChanceFill = document.getElementById('upgradeChanceFill');
const myPriceLabel = document.getElementById('myPriceLabel');
const targetPriceLabel = document.getElementById('targetPriceLabel');
const upgradeBtn = document.getElementById('upgradeBtn');
const upgradeResult = document.getElementById('upgradeResult');
const upgradeTargetsGrid = document.getElementById('upgradeTargetsGrid');
const wheelCanvas = document.getElementById('upgradeWheel');
const wheelArrow = document.getElementById('wheelArrow');
const wheelCenterChance = document.getElementById('wheelCenterChance');
const wheelHint = document.getElementById('wheelHint');

const pickModal = document.getElementById('pickModal');
const pickClose = document.getElementById('pickClose');
const pickGrid = document.getElementById('pickGrid');
const pickTitle = document.getElementById('pickTitle');
const pickSubtitle = document.getElementById('pickSubtitle');

const profileBtn = document.getElementById('profileBtn');
const profileBtnAvatar = document.getElementById('profileBtnAvatar');
const profileBtnIcon = document.getElementById('profileBtnIcon');
const profileGreeting = document.getElementById('profileGreeting');
const profileModal = document.getElementById('profileModal');
const modalClose = document.getElementById('modalClose');
const profileAvatar = document.getElementById('profileAvatar');
const nickInput = document.getElementById('nickInput');
const saveNickBtn = document.getElementById('saveNickBtn');
const avatarInput = document.getElementById('avatarInput');

const donateBtn = document.getElementById('donateBtn');
const donateBtn2 = document.getElementById('donateBtn2');
const donateModal = document.getElementById('donateModal');
const donateClose = document.getElementById('donateClose');
const donateGrid = document.getElementById('donateGrid');

// ---------- Web Audio ----------
let audioCtx = null;
function ensureAudio() {
    if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function playTick(volume = 0.12, pitch = 1.0) {
    const ctx = audioCtx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    const baseFreq = (140 + Math.random() * 30) * pitch;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, now + 0.055);
    oscGain.gain.setValueAtTime(volume, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    osc.connect(oscGain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);

    const bufferSize = Math.floor(ctx.sampleRate * 0.035);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 2800 * pitch;
    noiseFilter.Q.value = 1.2;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.7, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
    noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
    noise.start(now);
}

let lastTickTime = 0;
function tickForSpeed(t, nowMs) {
    const speedFactor = 1 - t;
    const interval = 35 + (1 - speedFactor) * 185;
    if (nowMs - lastTickTime < interval) return;
    lastTickTime = nowMs;
    playTick(0.05 + speedFactor * 0.10, 0.85 + speedFactor * 0.35);
}

function playWinSound() {
    const ctx = audioCtx;
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const start = now + i * 0.06;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 1.0);
    });
}

function playLoseSound() {
    const ctx = audioCtx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.6);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.65);
}

function playCoinSound() {
    const ctx = audioCtx;
    if (!ctx) return;
    const now = ctx.currentTime;
    [880, 1174.66].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const start = now + i * 0.08;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.4);
    });
}

// ---------- Сохранение ----------
function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ balance, inventory })); } catch (e) {}
}
function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (typeof data.balance === 'number') balance = data.balance;
        if (Array.isArray(data.inventory)) inventory = data.inventory;
    } catch (e) {}
}

function getSellPrice(item) {
    if (typeof item.price === 'number') return item.price;
    return RARITY_SELL_PRICE[item.rarity] || 10;
}

// ---------- Дропы (последние выпадения) ----------
function loadDrops() {
    try {
        const raw = localStorage.getItem(DROPS_KEY);
        if (!raw) return [];
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
}

function saveDrops(drops) {
    try { localStorage.setItem(DROPS_KEY, JSON.stringify(drops)); } catch (e) {}
}

function pushDrop(entry) {
    const drops = loadDrops();
    drops.unshift(entry);
    if (drops.length > DROPS_MAX) drops.length = DROPS_MAX;
    saveDrops(drops);
    renderDrops();
}

function renderDrops() {
    if (!dropsStrip) return;
    const drops = loadDrops();

    if (drops.length === 0) {
        // Заполняем фейками при первом запуске
        const allItems = [];
        CASES.forEach(c => c.items.forEach(it => allItems.push(it)));
        const fakeDrops = [];
        for (let i = 0; i < 12; i++) {
            const item = allItems[Math.floor(Math.random() * allItems.length)];
            const name = FAKE_PLAYERS[Math.floor(Math.random() * FAKE_PLAYERS.length)];
            fakeDrops.push({
                name: item.name,
                image: item.image,
                rarity: item.rarity,
                price: getSellPrice(item),
                player: name,
                you: false,
                ts: Date.now() - i * 60000,
            });
        }
        saveDrops(fakeDrops);
        renderDrops();
        return;
    }

    dropsStrip.innerHTML = drops.map((d, i) => {
        const r = RARITIES[d.rarity] || RARITIES.secret;
        return `
            <div class="drop-card ${d.you ? 'you' : ''}" style="--rarity:${r.color}; animation-delay:${Math.min(i * 0.03, 0.3)}s;">
                <div class="drop-img-wrap">
                    <img src="${d.image}" alt="" onerror="this.style.display='none'">
                </div>
                <div class="drop-player">${d.you ? 'Ты' : d.player}</div>
                <div class="drop-price">${d.price.toLocaleString('ru-RU')} ₽</div>
            </div>
        `;
    }).join('');
}

// ---------- Профиль ----------
let profile = { nick: 'Игрок', avatar: '' };

function saveProfile() { try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch (e) {} }
function loadProfile() {
    try {
        const raw = localStorage.getItem(PROFILE_KEY);
        if (raw) {
            const data = JSON.parse(raw);
            if (data.nick) profile.nick = data.nick;
            if (data.avatar) profile.avatar = data.avatar;
        }
    } catch (e) {}
}

function updateProfileUI() {
    profileGreeting.textContent = `Привет, ${profile.nick}!`;
    if (profile.avatar) {
        profileBtnAvatar.src = profile.avatar;
        profileBtnAvatar.style.display = '';
        profileBtnIcon.style.display = 'none';
        profileAvatar.src = profile.avatar;
    } else {
        profileBtnAvatar.style.display = 'none';
        profileBtnIcon.style.display = '';
        profileAvatar.removeAttribute('src');
        profileAvatar.style.background = 'var(--bg-soft)';
    }
    nickInput.value = profile.nick;
}

profileBtn.addEventListener('click', () => { profileModal.classList.add('active'); updateProfileUI(); });
modalClose.addEventListener('click', () => profileModal.classList.remove('active'));
profileModal.addEventListener('click', (e) => { if (e.target === profileModal) profileModal.classList.remove('active'); });

saveNickBtn.addEventListener('click', () => {
    const newNick = nickInput.value.trim();
    if (!newNick) { alert('Ник не может быть пустым'); return; }
    profile.nick = newNick; saveProfile(); updateProfileUI();
});

avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 300 * 1024) { alert('Файл слишком большой. Максимум 300 КБ.'); return; }
    const reader = new FileReader();
    reader.onload = () => { profile.avatar = reader.result; saveProfile(); updateProfileUI(); };
    reader.readAsDataURL(file);
});

// ---------- Донат ----------
function renderDonatePacks() {
    donateGrid.innerHTML = '';
    DONATE_PACKS.forEach(pack => {
        const el = document.createElement('div');
        el.className = 'donate-pack';
        el.innerHTML = `
            ${pack.badge ? `<div class="donate-pack-badge">${pack.badge}</div>` : ''}
            <div class="donate-pack-icon">${pack.icon}</div>
            <div class="donate-pack-amount">+${pack.amount.toLocaleString('ru-RU')} ₽</div>
            <div class="donate-pack-price">${pack.price}</div>
        `;
        el.addEventListener('click', () => claimDonate(pack));
        donateGrid.appendChild(el);
    });
}

function claimDonate(pack) {
    ensureAudio(); playCoinSound();
    balance += pack.amount;
    updateBalance(); saveState();
    showToast(`+${pack.amount.toLocaleString('ru-RU')} ₽ зачислено`);
}

function openDonateModal() { donateModal.classList.add('active'); renderDonatePacks(); }
function closeDonateModal() { donateModal.classList.remove('active'); }

donateBtn.addEventListener('click', openDonateModal);
donateBtn2.addEventListener('click', openDonateModal);
donateClose.addEventListener('click', closeDonateModal);
donateModal.addEventListener('click', (e) => { if (e.target === donateModal) closeDonateModal(); });

// ---------- Toast ----------
let toastEl = null; let toastTimer = null;
function showToast(text) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = text;
    requestAnimationFrame(() => toastEl.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

// ---------- Меню ----------
function renderMenu() {
    casesGrid.innerHTML = '';
    CASES.forEach((c, i) => {
        const card = document.createElement('div');
        card.className = 'case-card';
        card.style.animation = `itemIn 0.5s var(--ease) ${i * 0.06}s backwards`;
        card.innerHTML = `
            <div class="case-cover">
                ${c.cover
                    ? `<img src="${c.cover}" alt="${c.name}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'placeholder',textContent:'📦'}))">`
                    : `<div class="placeholder">📦</div>`}
            </div>
            <div class="case-name">${c.name}</div>
            <div class="case-price">${c.price.toLocaleString('ru-RU')} ₽</div>
        `;
        card.addEventListener('click', () => openCase(c));
        casesGrid.appendChild(card);
    });
}

function updateBalance() {
    balanceEl.textContent = balance.toLocaleString('ru-RU');
    balanceEl2.textContent = balance.toLocaleString('ru-RU');
}

function openCase(c) {
    currentCase = c;
    caseTitle.textContent = c.name;
    casePrice.textContent = c.price.toLocaleString('ru-RU');
    resultMsg.textContent = '';
    resultMsg.style.color = 'var(--accent)';
    buildReel(c.items);
    renderItemsPreview(c.items);
    menuScreen.classList.remove('active');
    caseScreen.classList.add('active');
    openBtn.disabled = false;
    fastBtn.disabled = false;
}

document.getElementById('backBtn').addEventListener('click', () => {
    if (isOpening) return;
    caseScreen.classList.remove('active');
    menuScreen.classList.add('active');
});

// ---------- Навигация ----------
function switchTab(tab) {
    navCases.classList.remove('active');
    navUpgrade.classList.remove('active');
    navInventory.classList.remove('active');
    casesView.style.display = 'none';
    upgradeView.style.display = 'none';
    inventoryView.style.display = 'none';

    if (tab === 'cases') { navCases.classList.add('active'); casesView.style.display = ''; }
    if (tab === 'upgrade') { navUpgrade.classList.add('active'); upgradeView.style.display = ''; renderUpgradeTab(); }
    if (tab === 'inventory') { navInventory.classList.add('active'); inventoryView.style.display = ''; renderInventory(); }
}

navCases.addEventListener('click', () => switchTab('cases'));
navUpgrade.addEventListener('click', () => switchTab('upgrade'));
navInventory.addEventListener('click', () => switchTab('inventory'));

// ---------- Превью ----------
function renderItemsPreview(items) {
    itemsPreview.innerHTML = '';
    const total = items.reduce((s, i) => s + i.chance, 0);
    items.forEach(item => {
        const r = RARITIES[item.rarity] || RARITIES.secret;
        const el = document.createElement('div');
        el.className = 'preview-item';
        el.style.setProperty('--rarity', r.color);
        const percent = ((item.chance / total) * 100).toFixed(3);
        el.dataset.tooltip = `${item.name}\n${percent}%`;
        el.innerHTML = `<img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">`;
        itemsPreview.appendChild(el);
    });
}

function createReelItem(item) {
    const r = RARITIES[item.rarity] || RARITIES.secret;
    const el = document.createElement('div');
    el.className = 'reel-item';
    el.style.setProperty('--rarity', r.color);
    el.innerHTML = `<img src="${item.image}" alt="" onerror="this.style.display='none'">`;
    return el;
}

function randomItem(items) { return items[Math.floor(Math.random() * items.length)]; }

function buildReel(items) {
    reel.innerHTML = '';
    for (let i = 0; i < REEL_TOTAL_ITEMS; i++) reel.appendChild(createReelItem(randomItem(items)));
    reel.style.transition = 'none';
    reel.style.transform = 'translateX(0)';
}

function rollItem(items) {
    const total = items.reduce((s, i) => s + i.chance, 0);
    let roll = Math.random() * total;
    for (const item of items) {
        if (roll < item.chance) return item;
        roll -= item.chance;
    }
    return items[items.length - 1];
}

function spin(items, speedKey, onFinish) {
    const cfg = SPIN_SETTINGS[speedKey] || SPIN_SETTINGS.normal;
    const duration = cfg.duration;
    const power = cfg.slowdownPower;

    const winItem = rollItem(items);
    buildReel(items);

    requestAnimationFrame(() => {
        const container = document.querySelector('.reel-container');
        reel.style.transition = 'none';
        reel.style.transform = 'translateX(0)';
        void reel.offsetWidth;

        const containerWidth = container.clientWidth || 320;

        const stopIndex = Math.floor(REEL_TOTAL_ITEMS * 0.6) + Math.floor(Math.random() * (REEL_TOTAL_ITEMS * 0.3));
        const jitter = (Math.random() - 0.5) * (REEL_ITEM_W * 0.6);
        const randomOffset = stopIndex * REEL_ITEM_W + REEL_ITEM_W / 2 - containerWidth / 2 + jitter;
        const exactOffset = stopIndex * REEL_ITEM_W + REEL_ITEM_W / 2 - containerWidth / 2;

        const stopEl = reel.children[stopIndex];
        if (stopEl) {
            const r = RARITIES[winItem.rarity] || RARITIES.secret;
            stopEl.style.setProperty('--rarity', r.color);
            stopEl.innerHTML = `<img src="${winItem.image}" alt="" onerror="this.style.display='none'">`;
        }

        ensureAudio();
        lastTickTime = 0;

        const startTime = performance.now();
        function easeOutQuint(t) { return 1 - Math.pow(1 - t, power + 1); }

        function frame(now) {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            const eased = easeOutQuint(t);
            const x = randomOffset * eased;

            reel.style.transform = `translateX(-${x}px)`;
            if (t < 0.985) tickForSpeed(t, now);

            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                reel.style.transition = 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)';
                const bounce = jitter > 0 ? -6 : 6;
                reel.style.transform = `translateX(-${randomOffset + bounce}px)`;

                setTimeout(() => {
                    reel.style.transition = 'transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)';
                    reel.style.transform = `translateX(-${exactOffset}px)`;

                    setTimeout(() => {
                        reel.style.transition = 'none';
                        reel.style.transform = `translateX(-${exactOffset}px)`;
                        playWinSound();
                        onFinish(winItem);
                    }, 230);
                }, 120);
            }
        }
        requestAnimationFrame(frame);
    });
}

// ---------- Инвентарь ----------
function addToInventory(item) {
    inventory.push({
        id: Date.now() + Math.random().toString(36).slice(2, 8),
        name: item.name,
        rarity: item.rarity,
        image: item.image,
        price: getSellPrice(item),
        openedAt: Date.now(),
    });
    saveState();
}

function renderInventory() {
    inventoryGrid.innerHTML = '';
    if (inventory.length === 0) {
        emptyState.style.display = '';
        sellAllBtn.disabled = true;
        invTotal.textContent = '0';
        return;
    }
    emptyState.style.display = 'none';
    sellAllBtn.disabled = false;

    let total = 0;
    inventory.forEach((invItem, i) => {
        total += invItem.price;
        const r = RARITIES[invItem.rarity] || RARITIES.secret;
        const el = document.createElement('div');
        el.className = 'inv-item';
        el.style.setProperty('--rarity', r.color);
        el.style.animationDelay = `${Math.min(i * 0.03, 0.3)}s`;
        el.innerHTML = `
            <div class="inv-img-wrap">
                <img src="${invItem.image}" alt="" onerror="this.style.display='none'">
            </div>
            <div class="item-name">${invItem.name}</div>
            <div class="item-price">Цена: <span>${invItem.price.toLocaleString('ru-RU')} ₽</span></div>
            <button class="sell-btn" data-id="${invItem.id}">Продать</button>
        `;
        inventoryGrid.appendChild(el);
    });

    invTotal.textContent = total.toLocaleString('ru-RU');
    inventoryGrid.querySelectorAll('.sell-btn').forEach(btn => {
        btn.addEventListener('click', () => sellItem(btn.dataset.id));
    });
}

function sellItem(id) {
    const idx = inventory.findIndex(i => i.id === id);
    if (idx === -1) return;
    const item = inventory[idx];
    balance += item.price;
    inventory.splice(idx, 1);
    upgradeMyIds = upgradeMyIds.filter(x => x !== id);
    updateBalance(); saveState(); renderInventory();
}

sellAllBtn.addEventListener('click', () => {
    if (inventory.length === 0) return;
    const total = inventory.reduce((s, i) => s + i.price, 0);
    if (!confirm(`Продать все скины за ${total.toLocaleString('ru-RU')} ₽?`)) return;
    balance += total;
    inventory = [];
    upgradeMyIds = [];
    updateBalance(); saveState(); renderInventory();
});

// ---------- Открытие кейса ----------
function startOpen(speedKey) {
    if (!currentCase || isOpening) return;
    if (balance < currentCase.price) {
        resultMsg.textContent = 'Недостаточно средств';
        resultMsg.style.color = 'var(--danger)';
        return;
    }

    isOpening = true;
    openBtn.disabled = true;
    fastBtn.disabled = true;
    resultMsg.textContent = 'Крутим...';
    resultMsg.style.color = 'var(--accent)';

    balance -= currentCase.price;
    updateBalance(); saveState();

    spin(currentCase.items, speedKey, (winItem) => {
        const r = RARITIES[winItem.rarity] || RARITIES.secret;
        resultMsg.innerHTML = `Выпало: <span style="color:${r.color}">${winItem.name}</span>`;
        addToInventory(winItem);

        pushDrop({
            name: winItem.name,
            image: winItem.image,
            rarity: winItem.rarity,
            price: getSellPrice(winItem),
            player: profile.nick,
            you: true,
            ts: Date.now(),
        });

        isOpening = false;
        openBtn.disabled = false;
        fastBtn.disabled = false;
    });
}

openBtn.addEventListener('click', () => startOpen('normal'));
fastBtn.addEventListener('click', () => startOpen('fast'));

// ============================================================
// АПГРЕЙД
// ============================================================

function getMyItems() {
    return upgradeMyIds
        .map(id => inventory.find(i => i.id === id))
        .filter(Boolean);
}

function getMyTotalPrice() {
    return getMyItems().reduce((sum, it) => sum + getSellPrice(it), 0);
}

function getUpgradeChance() {
    const myTotal = getMyTotalPrice();
    if (!upgradeMyIds.length || !upgradeTarget) return 0;
    const targetPrice = getSellPrice(upgradeTarget);
    if (targetPrice <= myTotal) return 0;
    let chance = (myTotal / targetPrice) * 100;
    chance = Math.min(chance, MAX_CHANCE);
    return Math.max(chance, 0);
}

function canUpgrade() {
    if (!upgradeMyIds.length || !upgradeTarget) return false;
    return getSellPrice(upgradeTarget) > getMyTotalPrice();
}

function updateChanceUI() {
    const myTotal = getMyTotalPrice();
    const targetPrice = upgradeTarget ? getSellPrice(upgradeTarget) : 0;
    const chance = getUpgradeChance();
    const valid = canUpgrade();

    myPriceLabel.textContent = upgradeMyIds.length ? myTotal.toLocaleString('ru-RU') + ' ₽' : '—';
    targetPriceLabel.textContent = targetPrice ? targetPrice.toLocaleString('ru-RU') + ' ₽' : '—';

    if (upgradeMyIds.length && upgradeTarget) {
        if (valid) {
            upgradeChance.textContent = chance.toFixed(2) + '%';
            upgradeChance.style.background = 'linear-gradient(90deg, var(--success-light), var(--success))';
            upgradeChance.style.webkitBackgroundClip = 'text';
            upgradeChance.style.backgroundClip = 'text';
            upgradeChance.style.color = 'transparent';
            wheelCenterChance.textContent = chance.toFixed(2) + '%';
            wheelCenterChance.style.background = 'linear-gradient(180deg, var(--success-light), var(--success))';
            wheelCenterChance.style.webkitBackgroundClip = 'text';
            wheelCenterChance.style.backgroundClip = 'text';
            wheelCenterChance.style.color = 'transparent';
            upgradeChanceFill.style.width = chance + '%';
        } else {
            upgradeChance.textContent = 'Цель дешевле';
            upgradeChance.style.background = 'none';
            upgradeChance.style.color = 'var(--danger)';
            wheelCenterChance.textContent = '—';
            wheelCenterChance.style.background = 'none';
            wheelCenterChance.style.color = 'var(--danger)';
            upgradeChanceFill.style.width = '0%';
        }
    } else {
        upgradeChance.textContent = '—';
        upgradeChance.style.background = 'linear-gradient(90deg, var(--success-light), var(--success))';
        upgradeChance.style.webkitBackgroundClip = 'text';
        upgradeChance.style.backgroundClip = 'text';
        upgradeChance.style.color = 'transparent';
        wheelCenterChance.textContent = '—';
        wheelCenterChance.style.background = 'linear-gradient(180deg, #fff, #b9c8ff)';
        wheelCenterChance.style.webkitBackgroundClip = 'text';
        wheelCenterChance.style.backgroundClip = 'text';
        wheelCenterChance.style.color = 'transparent';
        upgradeChanceFill.style.width = '0%';
    }

    upgradeBtn.disabled = !valid || isSpinning;
}

function updateSlotsUI() {
    const myItems = getMyItems();

    if (myItems.length > 0) {
        upgradeMySlot.classList.add('filled');
        upgradeMySlot.innerHTML = myItems.map(it => {
            const r = RARITIES[it.rarity] || RARITIES.secret;
            return `
                <div class="slot-my-item" style="--rarity:${r.color}">
                    <img src="${it.image}" alt="" onerror="this.style.display='none'">
                    <button class="slot-remove" data-id="${it.id}" title="Убрать">×</button>
                </div>
            `;
        }).join('') + `<div class="slot-count">${myItems.length} / ${MAX_MY_ITEMS}</div>`;

        upgradeMySlot.querySelectorAll('.slot-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isSpinning) return;
                const id = btn.dataset.id;
                upgradeMyIds = upgradeMyIds.filter(x => x !== id);
                updateSlotsUI();
                updateChanceUI();
                renderUpgradeTargets();
                drawWheel();
            });
        });
    } else {
        upgradeMySlot.classList.remove('filled');
        upgradeMySlot.innerHTML = `
            <div class="upgrade-slot-empty">
                <div class="slot-icon">📦</div>
                <span>Выбери до 5 скинов</span>
            </div>`;
    }

    if (upgradeTarget) {
        const r = RARITIES[upgradeTarget.rarity] || RARITIES.secret;
        upgradeTargetSlot.classList.add('filled');
        upgradeTargetSlot.style.setProperty('--rarity', r.color);
        upgradeTargetSlot.innerHTML = `<img src="${upgradeTarget.image}" alt="" onerror="this.style.display='none'">`;
    } else {
        upgradeTargetSlot.classList.remove('filled');
        upgradeTargetSlot.style.removeProperty('--rarity');
        upgradeTargetSlot.innerHTML = `
            <div class="upgrade-slot-empty">
                <div class="slot-icon">🎯</div>
                <span>Выбери цель из кейсов</span>
            </div>`;
    }

    if (!myItems.length && !upgradeTarget) wheelHint.textContent = 'Выбери свои скины и цель';
    else if (!myItems.length) wheelHint.textContent = 'Выбери свои скины';
    else if (!upgradeTarget) wheelHint.textContent = 'Выбери целевой скин';
    else if (!canUpgrade()) wheelHint.textContent = 'Цель должна быть дороже суммы твоих скинов';
    else wheelHint.textContent = 'Готово — жми «Крутить»';
}

function renderUpgradeTab() {
    renderUpgradeTargets();
    updateSlotsUI();
    updateChanceUI();
    drawWheel();
    setArrowAngle(0);
}

function renderUpgradeTargets() {
    upgradeTargetsGrid.innerHTML = '';
    const seen = new Set();
    const allItems = [];
    CASES.forEach(c => c.items.forEach(it => {
        if (!seen.has(it.name)) { seen.add(it.name); allItems.push(it); }
    }));
    allItems.sort((a, b) => getSellPrice(a) - getSellPrice(b));

    const myTotal = getMyTotalPrice();
    const hasMine = upgradeMyIds.length > 0;

    allItems.forEach(item => {
        const r = RARITIES[item.rarity] || RARITIES.secret;
        const itemPrice = getSellPrice(item);
        const tooCheap = hasMine && itemPrice <= myTotal;

        const el = document.createElement('div');
        el.className = 'target-item';
        el.style.setProperty('--rarity', r.color);
        if (upgradeTarget && upgradeTarget.name === item.name) el.classList.add('selected');
        if (tooCheap) {
            el.style.opacity = '0.35';
            el.style.cursor = 'not-allowed';
            el.title = 'Цель должна быть дороже суммы твоих скинов';
        }
        el.innerHTML = `
            <img src="${item.image}" alt="" onerror="this.style.display='none'">
            <div class="target-name">${item.name}</div>
            <div class="target-price">${itemPrice.toLocaleString('ru-RU')} ₽</div>
        `;
        el.addEventListener('click', () => {
            if (isSpinning || tooCheap) return;
            upgradeTarget = item;
            renderUpgradeTargets();
            updateSlotsUI();
            updateChanceUI();
            drawWheel();
        });
        upgradeTargetsGrid.appendChild(el);
    });
}

// ---------- Колесо ----------
function drawWheel() {
    const ctx = wheelCanvas.getContext('2d');
    const W = wheelCanvas.width;
    const H = wheelCanvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(W, H) / 2 - 10;

    const chance = getUpgradeChance();
    const valid = canUpgrade();
    const winFrac = valid ? Math.max(0, Math.min(1, chance / 100)) : 0;

    ctx.clearRect(0, 0, W, H);

    const winStart = Math.PI / 2;
    const winEnd = winStart + winFrac * Math.PI * 2;
    const loseEnd = winStart + Math.PI * 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, winEnd, loseEnd);
    ctx.closePath();
    const loseGrad = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius);
    loseGrad.addColorStop(0, '#2e3648');
    loseGrad.addColorStop(1, '#1c2230');
    ctx.fillStyle = loseGrad;
    ctx.fill();

    if (winFrac > 0.0001) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, winStart, winEnd);
        ctx.closePath();
        const winGrad = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius);
        winGrad.addColorStop(0, '#2ecc71');
        winGrad.addColorStop(1, '#1e9e55');
        ctx.fillStyle = winGrad;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, winStart, winEnd);
        ctx.closePath();
        ctx.strokeStyle = 'rgba(126,224,163,0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    const ticks = 60;
    for (let i = 0; i < ticks; i++) {
        const a = winStart + (i / ticks) * Math.PI * 2;
        const x1 = cx + Math.cos(a) * (radius - 6);
        const y1 = cy + Math.sin(a) * (radius - 6);
        const x2 = cx + Math.cos(a) * radius;
        const y2 = cy + Math.sin(a) * radius;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#5b8cff';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(91,140,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (winFrac > 0.08) {
        const a = winStart + (winFrac * Math.PI * 2) / 2;
        const lx = cx + Math.cos(a) * radius * 0.75;
        const ly = cy + Math.sin(a) * radius * 0.75;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('WIN', lx, ly);
    }
    if (winFrac < 0.92) {
        const a = winStart + winFrac * Math.PI * 2 + ((1 - winFrac) * Math.PI * 2) / 2;
        const lx = cx + Math.cos(a) * radius * 0.7;
        const ly = cy + Math.sin(a) * radius * 0.7;
        ctx.fillStyle = 'rgba(138,145,158,0.8)';
        ctx.font = 'bold 16px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('LOSE', lx, ly);
    }
}

function setArrowAngle(deg) {
    const container = wheelCanvas.parentElement;
    const radius = container.clientWidth / 2 - 10;
    wheelArrow.style.transform = `rotate(${deg}deg) translateY(${radius}px) rotate(180deg)`;
}

function spinArrow(win, onFinish) {
    const chance = getUpgradeChance();
    const winFrac = Math.max(0, Math.min(1, chance / 100));

    let targetDeg;
    if (win) {
        const margin = Math.min(winFrac * 360 * 0.15, 3);
        const lo = margin;
        const hi = winFrac * 360 - margin;
        targetDeg = lo + Math.random() * Math.max(0.1, hi - lo);
    } else {
        const lo = winFrac * 360 + Math.min((1 - winFrac) * 360 * 0.05, 2);
        const hi = 360 - 0.5;
        targetDeg = lo + Math.random() * Math.max(0.1, hi - lo);
    }

    const spins = 5 + Math.floor(Math.random() * 2);
    const totalDeg = spins * 360 + targetDeg;

    const duration = 4000;
    const startTime = performance.now();

    ensureAudio();
    lastTickTime = 0;

    let lastTickDeg = 0;

    function frame(now) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - t, 4);
        const currentDeg = totalDeg * eased;

        setArrowAngle(currentDeg);

        if (currentDeg - lastTickDeg > 8) {
            lastTickDeg = currentDeg;
            playTick(0.04 + (1 - t) * 0.08, 0.85 + (1 - t) * 0.3);
        }

        if (t < 1) {
            requestAnimationFrame(frame);
        } else {
            setArrowAngle(targetDeg);
            setTimeout(() => onFinish(), 200);
        }
    }
    requestAnimationFrame(frame);
}

// ---------- Логика апгрейда ----------
upgradeBtn.addEventListener('click', () => {
    if (isSpinning) return;
    const myItems = getMyItems();
    if (!myItems.length || !upgradeTarget) return;

    if (!canUpgrade()) {
        upgradeResult.textContent = 'Цель должна быть дороже суммы твоих скинов';
        upgradeResult.style.color = 'var(--danger)';
        return;
    }

    const chance = getUpgradeChance() / 100;
    const win = Math.random() < chance;

    isSpinning = true;
    upgradeBtn.disabled = true;
    upgradeResult.textContent = 'Крутим...';
    upgradeResult.style.color = 'var(--accent)';

    spinArrow(win, () => {
        if (win) {
            playWinSound();
            inventory = inventory.filter(i => !upgradeMyIds.includes(i.id));
            const newItem = {
                id: Date.now() + Math.random().toString(36).slice(2, 8),
                name: upgradeTarget.name,
                rarity: upgradeTarget.rarity,
                image: upgradeTarget.image,
                price: getSellPrice(upgradeTarget),
                openedAt: Date.now(),
            };
            inventory.push(newItem);
            upgradeResult.innerHTML = `🎉 Апгрейд успешен! Получен <strong>${upgradeTarget.name}</strong>`;
            upgradeResult.style.color = 'var(--success-light)';

            pushDrop({
                name: upgradeTarget.name,
                image: upgradeTarget.image,
                rarity: upgradeTarget.rarity,
                price: getSellPrice(upgradeTarget),
                player: profile.nick,
                you: true,
                ts: Date.now(),
            });

            saveState();
            upgradeMyIds = [];
            upgradeTarget = null;
        } else {
            playLoseSound();
            const lostNames = myItems.map(i => i.name).join(', ');
            inventory = inventory.filter(i => !upgradeMyIds.includes(i.id));
            upgradeResult.innerHTML = `💀 Скины сгорели: <strong>${lostNames}</strong>`;
            upgradeResult.style.color = 'var(--danger)';
            saveState();
            upgradeMyIds = [];
            upgradeTarget = null;
        }

        isSpinning = false;
        renderUpgradeTab();
        updateBalance();
        setTimeout(() => {
            wheelArrow.style.transition = 'transform 0.4s ease';
            setArrowAngle(0);
            setTimeout(() => { wheelArrow.style.transition = ''; }, 420);
        }, 800);
    });
});

// ---------- Слот "Мои скины" ----------
upgradeMySlot.addEventListener('click', () => {
    if (isSpinning) return;
    if (inventory.length === 0) { showToast('Инвентарь пуст'); return; }

    pickTitle.textContent = 'Выбери свои скины';
    pickSubtitle.textContent = `Можно выбрать до ${MAX_MY_ITEMS} скинов (выбрано: ${upgradeMyIds.length})`;
    pickGrid.innerHTML = '';

    inventory.forEach(inv => {
        const r = RARITIES[inv.rarity] || RARITIES.secret;
        const isSelected = upgradeMyIds.includes(inv.id);
        const el = document.createElement('div');
        el.className = 'pick-item' + (isSelected ? ' selected' : '');
        el.style.setProperty('--rarity', r.color);
        el.innerHTML = `
            <div class="pick-check">${isSelected ? '✓' : ''}</div>
            <img src="${inv.image}" alt="" onerror="this.style.display='none'">
            <div class="pick-price">${inv.price.toLocaleString('ru-RU')} ₽</div>
        `;
        el.addEventListener('click', () => {
            if (upgradeMyIds.includes(inv.id)) {
                upgradeMyIds = upgradeMyIds.filter(x => x !== inv.id);
            } else {
                if (upgradeMyIds.length >= MAX_MY_ITEMS) {
                    showToast(`Максимум ${MAX_MY_ITEMS} скинов`);
                    return;
                }
                upgradeMyIds.push(inv.id);
            }
            pickSubtitle.textContent = `Можно выбрать до ${MAX_MY_ITEMS} скинов (выбрано: ${upgradeMyIds.length})`;
            const sel = upgradeMyIds.includes(inv.id);
            el.classList.toggle('selected', sel);
            el.querySelector('.pick-check').textContent = sel ? '✓' : '';

            updateSlotsUI();
            updateChanceUI();
            renderUpgradeTargets();
            drawWheel();
        });
        pickGrid.appendChild(el);
    });

    pickModal.classList.add('active');
});

pickClose.addEventListener('click', () => pickModal.classList.remove('active'));
pickModal.addEventListener('click', (e) => { if (e.target === pickModal) pickModal.classList.remove('active'); });

// ---------- Старт ----------
loadState();
loadProfile();
updateBalance();
updateProfileUI();
renderMenu();
renderDrops();
renderUpgradeTab();
setArrowAngle(0);