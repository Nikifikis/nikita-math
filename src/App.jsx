import React, { useState, useEffect, useRef } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD7WChz-t65WMNqP2K_EjUNFYSUMO_uJ4I',
  authDomain: 'nikitamath-7b94d.firebaseapp.com',
  projectId: 'nikitamath-7b94d',
  storageBucket: 'nikitamath-7b94d.firebasestorage.app',
  messagingSenderId: '1083097624323',
  appId: '1:1083097624323:web:b39138d380d1aabd694336',
};

// Если ключи не вставлены, игра будет работать в локальном (офлайн) режиме
const isCloudEnabled =
  firebaseConfig.apiKey && firebaseConfig.apiKey.length > 5;
const APP_ID = 'nikita-math-platform';
let auth = null;
let db = null;

if (isCloudEnabled && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
}

// --- 1. ИКОНКИ (SVG) ---
const Icon = ({ children, size = 24, className = '', fill = 'none' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);
const Play = (p) => (
  <Icon {...p} fill={p.fill || 'currentColor'}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </Icon>
);
const HistoryIcon = (p) => (
  <Icon {...p}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </Icon>
);
const ArrowLeft = (p) => (
  <Icon {...p}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </Icon>
);
const CheckCircle = (p) => (
  <Icon {...p}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </Icon>
);
const XCircle = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </Icon>
);
const Trophy = (p) => (
  <Icon {...p}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </Icon>
);
const Zap = (p) => (
  <Icon {...p} fill={p.fill || 'none'}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Icon>
);
const AlertTriangle = (p) => (
  <Icon {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </Icon>
);
const Star = (p) => (
  <Icon {...p}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </Icon>
);
const SkipForward = (p) => (
  <Icon {...p}>
    <polygon points="5 4 15 12 5 20 5 4" />
    <line x1="19" y1="5" x2="19" y2="19" />
  </Icon>
);
const Crown = (p) => (
  <Icon {...p}>
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </Icon>
);
const UserCircle = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="5" />
    <path d="M20 21a8 8 0 0 0-16 0" />
  </Icon>
);
const Users = (p) => (
  <Icon {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
);
const UserPlus = (p) => (
  <Icon {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </Icon>
);
const Folder = (p) => (
  <Icon {...p}>
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
  </Icon>
);
const Trash2 = (p) => (
  <Icon {...p}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </Icon>
);
const BarChart = (p) => (
  <Icon {...p}>
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </Icon>
);
const Lock = (p) => (
  <Icon {...p}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Icon>
);
const DeleteIcon = (p) => (
  <Icon {...p}>
    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
    <line x1="18" y1="9" x2="12" y2="15" />
    <line x1="12" y1="9" x2="18" y2="15" />
  </Icon>
);
const Globe = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </Icon>
);
const CoinsIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
    <path d="M12 18V6" />
  </Icon>
);
const GemIcon = (p) => (
  <Icon {...p} fill={p.fill || '#A855F7'}>
    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
    <line x1="12" y1="22" x2="12" y2="8.5" />
    <line x1="22" y1="8.5" x2="12" y2="8.5" />
    <line x1="2" y1="8.5" x2="12" y2="8.5" />
    <line x1="12" y1="2" x2="18" y2="6" />
    <line x1="12" y1="2" x2="6" y2="6" />
  </Icon>
);
const ShoppingBag = (p) => (
  <Icon {...p}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </Icon>
);
const Swords = (p) => (
  <Icon {...p}>
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" y1="19" x2="19" y2="13" />
    <line x1="16" y1="16" x2="20" y2="20" />
    <line x1="19" y1="21" x2="21" y2="19" />
    <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
    <line x1="5" y1="14" x2="9" y2="18" />
    <line x1="7" y1="17" x2="4" y2="20" />
    <line x1="3" y1="19" x2="5" y2="21" />
  </Icon>
);
const GiftIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="8" width="18" height="14" rx="2" />
    <path d="M12 5a3 3 0 1 0-3 3" />
    <path d="M15 8a3 3 0 1 0-3-3" />
    <path d="M12 5v17" />
    <path d="M3 8h18" />
  </Icon>
);
const CpuIcon = (p) => (
  <Icon {...p}>
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="14" x2="4" y2="14" />
  </Icon>
);
const Shield = (p) => (
  <Icon {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Icon>
);

// --- 2. БАЗОВЫЕ ДАННЫЕ И МАТЕМАТИКА ---
const checkProfanity = (str) => {
  if (!str) return false;
  let cleanStr = str.toLowerCase().replace(/[^a-zа-яё0-9]/g, '');
  const ruBadWords = [
    'хуй',
    'пизд',
    'пидор',
    'ебан',
    'бляд',
    'шлюх',
    'залуп',
    'мудак',
    'гондон',
    'сука',
    'хер',
    'дроч',
    'манд',
    'даун',
    'дебил',
    'уебок',
    'соси',
    'очко',
    'жопа',
    'гнид',
    'мраз',
    'твар',
    'лох',
  ];
  const enBadWords = [
    'fuck',
    'bitch',
    'shit',
    'cunt',
    'dick',
    'cock',
    'pussy',
    'whore',
    'slut',
    'nigg',
    'gay',
    'asshole',
    'bastard',
    'porno',
    'boob',
    'tits',
  ];
  for (let word of [cleanStr]) {
    for (let root of [...enBadWords, ...ruBadWords]) {
      if (word.includes(root)) return true;
    }
  }
  return false;
};

const LEAGUES = [
  {
    minLevel: 1,
    name: 'Бронзовая Лига',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
  },
  {
    minLevel: 101,
    name: 'Серебряная Лига',
    color: 'text-gray-300',
    bg: 'bg-gray-400/10',
    border: 'border-gray-400/30',
  },
  {
    minLevel: 301,
    name: 'Золотая Лига',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
  },
  {
    minLevel: 501,
    name: 'Платиновая Лига',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  {
    minLevel: 751,
    name: 'Алмазная Лига',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  {
    minLevel: 901,
    name: 'Лига Мастеров',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  {
    minLevel: 1000,
    name: 'Легендарная Лига',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
];
const getLeague = (level) => {
  return (
    LEAGUES.slice()
      .reverse()
      .find((l) => level >= l.minLevel) || LEAGUES[0]
  );
};

const RANKS = [
  { min: 1, title: 'Ученик', icon: '🎒' },
  { min: 51, title: 'Боец', icon: '🥊' },
  { min: 101, title: 'Маг чисел', icon: '🧙‍♂️' },
  { min: 151, title: 'Ниндзя', icon: '🥷' },
  { min: 201, title: 'Ученик калькулятора', icon: '🧮' },
  { min: 251, title: 'Магистр', icon: '📜' },
  { min: 301, title: 'Джедай', icon: '⚔️' },
  { min: 351, title: 'Джонин', icon: '🌀' },
  { min: 401, title: 'Воин', icon: '🛡️' },
  { min: 451, title: 'Рыцарь магии', icon: '🔮' },
  { min: 501, title: 'Капитан отряда', icon: '🎖️' },
  { min: 551, title: 'Элитный боец', icon: '🪖' },
  { min: 601, title: 'Герой', icon: '🦸‍♂️' },
  { min: 651, title: 'Легенда', icon: '🌟' },
  { min: 701, title: 'Пробуждённый', icon: '👁️' },
  { min: 751, title: 'Мастер силы', icon: '🌌' },
  { min: 801, title: 'Грандмастер', icon: '👑' },
  { min: 851, title: 'Хокаге', icon: '⛩️' },
  { min: 901, title: 'Человек-калькулятор', icon: '🤯' },
  { min: 951, title: 'Киборг', icon: '🤖' },
];
const getRank = (level) => {
  return (
    RANKS.slice()
      .reverse()
      .find((r) => level >= r.min) || RANKS[0]
  );
};

const RAID_BOSSES = [
  {
    id: 'boss_1',
    name: 'Гоблин-Счетовод',
    icon: '👺',
    hp: 5000,
    league: 'Бронзовая Лига',
    bg: 'bg-orange-900/20',
    border: 'border-orange-500/50',
    recLvl: 1,
  },
  {
    id: 'boss_2',
    name: 'Кибер-Орк',
    icon: '👹',
    hp: 25000,
    league: 'Серебряная Лига',
    bg: 'bg-gray-800/40',
    border: 'border-gray-500/50',
    recLvl: 101,
  },
  {
    id: 'boss_3',
    name: 'Меха-Дракон',
    icon: '🐲',
    hp: 100000,
    league: 'Золотая Лига',
    bg: 'bg-yellow-900/20',
    border: 'border-yellow-500/50',
    recLvl: 301,
  },
  {
    id: 'boss_4',
    name: 'Разрушитель Миров',
    icon: '🌋',
    hp: 500000,
    league: 'Лига Мастеров',
    bg: 'bg-purple-900/20',
    border: 'border-purple-500/50',
    recLvl: 751,
  },
  {
    id: 'boss_5',
    name: 'Абсолютный ИИ',
    icon: '👁️‍🗨️',
    hp: 2000000,
    league: 'Легендарная Лига',
    bg: 'bg-red-900/20',
    border: 'border-red-500/50',
    recLvl: 1000,
  },
];

const CYBORG_STAGES = [
  {
    lvl: 1,
    name: 'Консервная банка',
    icon: 'https://raw.githubusercontent.com/Nikifikis/nikita-math/refs/heads/main/public/avatars/robot-lvl1.png',
    reqLevel: 1,
    cost: 0,
    dmg: 0,
  },
  { lvl: 2, name: 'Ржавый бот', icon: 'https://raw.githubusercontent.com/Nikifikis/nikita-math/refs/heads/main/public/avatars/robot-lvl02.png', reqLevel: 10, cost: 100, dmg: 5 },
  {
    lvl: 3,
    name: 'Собранный на коленке',
    icon: 'https://raw.githubusercontent.com/Nikifikis/nikita-math/refs/heads/main/public/avatars/robot-lvl03.png',
    reqLevel: 25,
    cost: 300,
    dmg: 12,
  },
  {
    lvl: 4,
    name: 'Базовый автоматон',
    icon: 'https://raw.githubusercontent.com/Nikifikis/nikita-math/refs/heads/main/public/avatars/robot-lvl04.png',
    reqLevel: 50,
    cost: 700,
    dmg: 20,
  },
  {
    lvl: 5,
    name: 'Железный дровосек',
    icon: 'https://raw.githubusercontent.com/Nikifikis/nikita-math/refs/heads/main/public/avatars/robot-lvl05..png',
    reqLevel: 75,
    cost: 1200,
    dmg: 30,
  },
  {
    lvl: 6,
    name: 'Бронированный дроид',
    icon: 'https://raw.githubusercontent.com/Nikifikis/nikita-math/refs/heads/main/public/avatars/robot-lvl06.png',
    reqLevel: 100,
    cost: 2000,
    dmg: 45,
  },
  { lvl: 7, name: 'Разведчик', icon: 'https://raw.githubusercontent.com/Nikifikis/nikita-math/refs/heads/main/public/avatars/robot-lvl07.png', reqLevel: 150, cost: 3500, dmg: 60 },
  { lvl: 8, name: 'Штурмовик', icon: 'https://raw.githubusercontent.com/Nikifikis/nikita-math/refs/heads/main/public/avatars/robot-lvl08.png', reqLevel: 200, cost: 5000, dmg: 80 },
  {
    lvl: 9,
    name: 'Киборг-новичок',
    icon: 'https://raw.githubusercontent.com/Nikifikis/nikita-math/refs/heads/main/public/avatars/robot-lvl09.png',
    reqLevel: 250,
    cost: 7500,
    dmg: 105,
  },
  {
    lvl: 10,
    name: 'Улучшенный киборг',
    icon: 'https://raw.githubusercontent.com/Nikifikis/nikita-math/refs/heads/main/public/avatars/robot-lvl10.png',
    reqLevel: 300,
    cost: 10000,
    dmg: 135,
  },
  {
    lvl: 11,
    name: 'Стальной воин',
    icon: 'https://raw.githubusercontent.com/Nikifikis/nikita-math/refs/heads/main/public/avatars/robot-lvl11.png',
    reqLevel: 350,
    cost: 15000,
    dmg: 170,
  },
  {
    lvl: 12,
    name: 'Неоновый боец',
    icon: 'https://raw.githubusercontent.com/Nikifikis/nikita-math/refs/heads/main/public/avatars/robot-lvl12.png',
    reqLevel: 400,
    cost: 20000,
    dmg: 210,
  },
  {
    lvl: 13,
    name: 'Хромированный страж',
    icon: 'https://raw.githubusercontent.com/Nikifikis/nikita-math/refs/heads/main/public/avatars/robot-lvl13.png',
    reqLevel: 450,
    cost: 28000,
    dmg: 255,
  },
  {
    lvl: 14,
    name: 'Плазменный убийца',
    icon: 'https://raw.githubusercontent.com/Nikifikis/nikita-math/refs/heads/main/public/avatars/robot-lvl14.png',
    reqLevel: 500,
    cost: 38000,
    dmg: 305,
  },
  {
    lvl: 15,
    name: 'Титановый владыка',
    icon: 'https://raw.githubusercontent.com/Nikifikis/nikita-math/refs/heads/main/public/avatars/robot-lvl15.png',
    reqLevel: 600,
    cost: 50000,
    dmg: 360,
  },
  {
    lvl: 16,
    name: 'Кибер-ниндзя',
    icon: 'https://raw.githubusercontent.com/Nikifikis/nikita-math/refs/heads/main/public/avatars/robot-lvl16.png',
    reqLevel: 700,
    cost: 65000,
    dmg: 420,
  },
  {
    lvl: 17,
    name: 'Квантовый призрак',
    icon: 'https://raw.githubusercontent.com/Nikifikis/nikita-math/refs/heads/main/public/avatars/robot-lvl17.png',
    reqLevel: 800,
    cost: 85000,
    dmg: 490,
  },
  {
    lvl: 18,
    name: 'Нано-богатырь',
    icon: 'https://raw.githubusercontent.com/Nikifikis/nikita-math/refs/heads/main/public/avatars/robot-lvl18.png',
    reqLevel: 900,
    cost: 110000,
    dmg: 570,
  },
  {
    lvl: 19,
    name: 'Машина судного дня',
    icon: 'https://raw.githubusercontent.com/Nikifikis/nikita-math/refs/heads/main/public/avatars/robot-lvl19.png',
    reqLevel: 950,
    cost: 150000,
    dmg: 660,
  },
  {
    lvl: 20,
    name: 'Абсолютный ИИ',
    icon: 'https://raw.githubusercontent.com/Nikifikis/nikita-math/refs/heads/main/public/avatars/robot-lvl20.png',
    reqLevel: 1000,
    cost: 200000,
    dmg: 800,
  },
];

const AVATARS = [
  { id: 'default', name: 'Школьник', icon: '👤', price: 0, currency: 'coins' },
  { id: 'nerd', name: 'Ботаник', icon: '🤓', price: 500, currency: 'coins' },
  { id: 'ninja', name: 'Ниндзя', icon: '🥷', price: 1500, currency: 'coins' },
  { id: 'hero', name: 'Герой', icon: '🦸‍♂️', price: 3000, currency: 'coins' },
  { id: 'wizard', name: 'Маг', icon: '🧙‍♂️', price: 5000, currency: 'coins' },
  { id: 'robot', name: 'Андроид', icon: '🤖', price: 5, currency: 'gems' },
  { id: 'vampire', name: 'Вампир', icon: '🧛‍♂️', price: 15, currency: 'gems' },
  { id: 'dragon', name: 'Дракон', icon: '🐉', price: 30, currency: 'gems' },
  { id: 'king', name: 'Легенда', icon: '👑', price: 50, currency: 'gems' },
];

const SUPER_IMPLANTS = [
  {
    id: 'imp_optic',
    name: 'Оптический прицел',
    icon: '👁️',
    price: 5,
    dmg: 15,
    desc: '+15 Урона по боссам',
  },
  {
    id: 'imp_core',
    name: 'Плазменный реактор',
    icon: '🔥',
    price: 15,
    dmg: 50,
    desc: '+50 Урона по боссам',
  },
  {
    id: 'imp_brain',
    name: 'Нейро-ускоритель',
    icon: '🧠',
    price: 35,
    dmg: 120,
    desc: '+120 Урона по боссам',
  },
  {
    id: 'imp_god',
    name: 'Чип Разрушителя',
    icon: '💥',
    price: 80,
    dmg: 300,
    desc: '+300 Урона по боссам',
  },
];

const getAvatarIcon = (id) =>
  (AVATARS.find((a) => a.id === id) || AVATARS[0]).icon;

const LEVELS = {
  beginner: { label: 'Начинающий', addSub: 20, mulDiv: 10, icon: '🌱' },
  machine: { label: 'Машинка', addSub: 100, mulDiv: 20, icon: '⚙️' },
  cyborg: { label: 'Киборг', addSub: 1000, mulDiv: 100, icon: '🤖' },
};
const MODES = {
  addsub: 'Сложение и Вычитание',
  muldiv: 'Умножение и Деление',
  mixed: 'Все действия',
};
const calculate = (a, op, b) => {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  if (op === '/') return a / b;
  return 0;
};

const getCampaign1LevelConfig = (level, baseSpeed = 10) => {
  const isBoss = level % 50 === 0;
  const terms = isBoss ? 3 : 2;
  let addSub = 10,
    mulDiv = 5,
    mode = 'addsub';
  if (level <= 20) {
    addSub = 10 + level;
    mode = 'addsub';
  } else if (level <= 50) {
    addSub = 30 + Math.floor((level - 20) * 0.5);
    mulDiv = Math.min(10, 5 + Math.floor((level - 20) / 6));
    mode = level % 4 === 0 ? 'muldiv' : 'addsub';
  } else if (level <= 100) {
    addSub = 50 + Math.floor((level - 50) * 1);
    mulDiv = 10;
    mode = level % 3 === 0 ? 'muldiv' : 'addsub';
  } else if (level <= 200) {
    addSub = 100 + Math.floor((level - 100) * 1);
    mulDiv = 10 + Math.floor((level - 100) * 0.1);
    mode = level % 2 === 0 ? 'muldiv' : 'addsub';
  } else if (level <= 500) {
    addSub = 200 + Math.floor((level - 200) * 1);
    mulDiv = 20 + Math.floor((level - 200) * 0.1);
    const cycle = level % 10;
    mode = cycle < 4 ? 'addsub' : cycle < 7 ? 'muldiv' : 'mixed';
  } else {
    addSub = 500 + Math.floor((level - 500) * 1);
    mulDiv = Math.min(99, 50 + Math.floor((level - 500) * 0.1));
    const cycle = level % 10;
    mode = cycle < 3 ? 'addsub' : cycle < 6 ? 'muldiv' : 'mixed';
  }
  if (isBoss) mode = 'mixed';
  let targetSpeed = baseSpeed + Math.floor(level / 40);
  if (isBoss) targetSpeed = Math.max(Math.ceil(baseSpeed / 2), targetSpeed - 2);
  return {
    level,
    isBoss,
    terms,
    ranges: { addSub, mulDiv },
    mode,
    timeLimit: 120,
    targetSpeed,
    target: targetSpeed * 2,
  };
};

const generateCampaign1Equation = (mode, ranges, terms) => {
  const safeRanges = ranges || { addSub: 20, mulDiv: 10 };
  const maxAddSub = Math.max(2, parseInt(safeRanges.addSub, 10) || 2);
  const maxMulDiv = Math.max(2, parseInt(safeRanges.mulDiv, 10) || 2);
  const opsGroup =
    mode === 'addsub'
      ? ['+', '-']
      : mode === 'muldiv'
      ? ['*', '/']
      : ['+', '-', '*', '/'];
  for (let i = 0; i < 2000; i++) {
    let n1, n2, n3, op1, op2, ans;
    if (terms === 2) {
      op1 = opsGroup[Math.floor(Math.random() * opsGroup.length)];
      if (op1 === '+') {
        n1 = Math.floor(Math.random() * maxAddSub) + 1;
        n2 = Math.floor(Math.random() * maxAddSub) + 1;
        ans = n1 + n2;
      } else if (op1 === '-') {
        n1 = Math.floor(Math.random() * maxAddSub) + 1;
        n2 = Math.floor(Math.random() * maxAddSub) + 1;
        if (n1 < n2) [n1, n2] = [n2, n1];
        ans = n1 - n2;
      } else if (op1 === '*') {
        n1 = Math.floor(Math.random() * maxMulDiv) + 1;
        n2 = Math.floor(Math.random() * maxMulDiv) + 1;
        ans = n1 * n2;
      } else if (op1 === '/') {
        ans = Math.floor(Math.random() * maxMulDiv) + 1;
        n2 = Math.floor(Math.random() * maxMulDiv) + 1;
        n1 = ans * n2;
      }
      return {
        display: `${n1} ${op1.replace('*', '×').replace('/', '÷')} ${n2}`,
        answer: ans,
        opsUsed: [op1],
      };
    } else {
      op1 = opsGroup[Math.floor(Math.random() * opsGroup.length)];
      op2 = opsGroup[Math.floor(Math.random() * opsGroup.length)];
      const getNum = (op) =>
        Math.floor(
          Math.random() * (['*', '/'].includes(op) ? maxMulDiv : maxAddSub)
        ) + 1;
      n1 = getNum(op1);
      n2 = getNum(op1);
      n3 = getNum(op2);
      if (op1 === '/') n1 = n1 * n2;
      if (op2 === '/' && ['+', '-'].includes(op1)) n2 = n2 * n3;
      if (op1 === '*' && op2 === '/') n2 = n2 * n3;
      if (op1 === '/' && op2 === '/') n1 = n1 * n2 * n3;
      if ((op1 === '+' || op1 === '-') && (op2 === '*' || op2 === '/')) {
        ans = calculate(n1, op1, calculate(n2, op2, n3));
      } else {
        ans = calculate(calculate(n1, op1, n2), op2, n3);
      }
      if (Number.isInteger(ans) && ans >= 0 && ans <= 100000)
        return {
          display: `${n1} ${op1.replace('*', '×').replace('/', '÷')} ${n2} ${op2
            .replace('*', '×')
            .replace('/', '÷')} ${n3}`,
          answer: ans,
          opsUsed: [op1, op2],
        };
    }
  }
  return { display: '10 + 5', answer: 15, opsUsed: ['+'] };
};

const getCampaign2LevelConfig = (level, baseSpeed = 10) => {
  const isBoss = level % 50 === 0;
  let targetSpeed = Math.max(5, baseSpeed - 2 + Math.floor(level / 60));
  if (isBoss) targetSpeed = Math.max(5, targetSpeed - 2);
  return {
    level,
    isBoss,
    timeLimit: 120,
    targetSpeed,
    target: targetSpeed * 2,
  };
};

const generateCampaign2Equation = (level) => {
  let types = [];
  if (level <= 50) types = ['negative', 'eq_addsub'];
  else if (level <= 100)
    types = [
      'negative',
      'eq_addsub',
      'eq_muldiv',
      'square_small',
      'root_small',
    ];
  else if (level <= 200)
    types = [
      'negative',
      'eq_addsub',
      'eq_muldiv',
      'square_mid',
      'root_small',
      'percent_easy',
    ];
  else if (level <= 300)
    types = [
      'negative',
      'eq_all',
      'square_mid',
      'root_mid',
      'percent_mid',
      'power_2_3',
    ];
  else if (level <= 400)
    types = [
      'eq_all',
      'square_large',
      'root_large',
      'percent_hard',
      'power_all',
      'cube',
    ];
  else
    types = [
      'eq_all',
      'square_large',
      'root_large',
      'percent_hard',
      'power_all',
      'cube',
      'negative_hard',
    ];
  const type = types[Math.floor(Math.random() * types.length)];
  let display = '',
    answer = 0,
    opsUsed = [type];
  switch (type) {
    case 'negative':
      let a = Math.floor(Math.random() * 41) - 20;
      let b = Math.floor(Math.random() * 41) - 20;
      let op = Math.random() > 0.5 ? '+' : '-';
      answer = op === '+' ? a + b : a - b;
      display = `${a < 0 ? `(${a})` : a} ${op} ${b < 0 ? `(${b})` : b}`;
      break;
    case 'negative_hard':
      let a2 = Math.floor(Math.random() * 101) - 50;
      let b2 = Math.floor(Math.random() * 101) - 50;
      answer = a2 - b2;
      display = `${a2} - ${b2 < 0 ? `(${b2})` : b2}`;
      break;
    case 'eq_addsub':
      let eqAns = Math.floor(Math.random() * 50) + 1;
      let eqA = Math.floor(Math.random() * 50) + 1;
      let eqOp = Math.random() > 0.5 ? '+' : '-';
      if (eqOp === '+') {
        display =
          Math.random() > 0.5
            ? `? + ${eqA} = ${eqAns + eqA}`
            : `${eqA} + ? = ${eqAns + eqA}`;
        answer = eqAns;
      } else {
        let bResult = eqAns - eqA;
        display = `? - ${eqA} = ${bResult}`;
        answer = eqAns;
      }
      break;
    case 'eq_muldiv':
    case 'eq_all':
      let eqMAns = Math.floor(Math.random() * 12) + 2;
      let eqMA = Math.floor(Math.random() * 12) + 2;
      if (Math.random() > 0.5) {
        display =
          Math.random() > 0.5
            ? `? × ${eqMA} = ${eqMAns * eqMA}`
            : `${eqMA} × ? = ${eqMAns * eqMA}`;
        answer = eqMAns;
      } else {
        let bRes = eqMAns;
        answer = eqMA * eqMAns;
        display = `? ÷ ${eqMA} = ${bRes}`;
      }
      break;
    case 'square_small':
      let sq = Math.floor(Math.random() * 10) + 1;
      answer = sq * sq;
      display = `${sq}²`;
      break;
    case 'square_mid':
      let sq2 = Math.floor(Math.random() * 15) + 1;
      answer = sq2 * sq2;
      display = `${sq2}²`;
      break;
    case 'square_large':
      let sq3 = Math.floor(Math.random() * 20) + 1;
      answer = sq3 * sq3;
      display = `${sq3}²`;
      break;
    case 'root_small':
      let rt = Math.floor(Math.random() * 10) + 1;
      answer = rt;
      display = `√${rt * rt}`;
      break;
    case 'root_mid':
      let rt2 = Math.floor(Math.random() * 15) + 1;
      answer = rt2;
      display = `√${rt2 * rt2}`;
      break;
    case 'root_large':
      let rt3 = Math.floor(Math.random() * 20) + 1;
      answer = rt3;
      display = `√${rt3 * rt3}`;
      break;
    case 'cube':
      let cb = Math.floor(Math.random() * 5) + 1;
      answer = cb * cb * cb;
      display = `${cb}³`;
      break;
    case 'percent_easy':
      let pE = Math.random() > 0.5 ? 10 : 50;
      answer = Math.floor(Math.random() * 20) + 1;
      display = `${pE}% от ${answer * (100 / pE)}`;
      break;
    case 'percent_mid':
      let pMArr = [10, 20, 25, 50];
      let pM = pMArr[Math.floor(Math.random() * pMArr.length)];
      answer = Math.floor(Math.random() * 30) + 1;
      display = `${pM}% от ${answer * (100 / pM)}`;
      break;
    case 'percent_hard':
      let pHArr = [5, 10, 20, 25, 50, 75];
      let pH = pHArr[Math.floor(Math.random() * pHArr.length)];
      answer = Math.floor(Math.random() * 40) + 1;
      let total = (answer * 100) / pH;
      answer = Math.floor((total * pH) / 100);
      while ((answer * 100) % pH !== 0) {
        answer++;
        total = (answer * 100) / pH;
      }
      display = `${pH}% от ${total}`;
      break;
    case 'power_2_3':
      if (Math.random() > 0.5) {
        let p2 = Math.floor(Math.random() * 6) + 2;
        answer = Math.pow(2, p2);
        display = `2^${p2}`;
      } else {
        let p3 = Math.floor(Math.random() * 3) + 2;
        answer = Math.pow(3, p3);
        display = `3^${p3}`;
      }
      break;
    case 'power_all':
      let rBase = Math.random();
      if (rBase < 0.4) {
        let p2 = Math.floor(Math.random() * 9) + 2;
        answer = Math.pow(2, p2);
        display = `2^${p2}`;
      } else if (rBase < 0.7) {
        let p3 = Math.floor(Math.random() * 4) + 2;
        answer = Math.pow(3, p3);
        display = `3^${p3}`;
      } else {
        let p10 = Math.floor(Math.random() * 4) + 2;
        answer = Math.pow(10, p10);
        display = `10^${p10}`;
      }
      break;
  }
  display = display
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\^4/g, '⁴')
    .replace(/\^5/g, '⁵')
    .replace(/\^6/g, '⁶')
    .replace(/\^7/g, '⁷')
    .replace(/\^8/g, '⁸')
    .replace(/\^9/g, '⁹')
    .replace(/\^10/g, '¹⁰');
  return { display, answer, opsUsed };
};

// =========================================================================
// 3. ГЛАВНАЯ ЛОГИКА (APP)
// =========================================================================
function MainApp() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('auth');

  // --- ПРОФИЛЬ ---
  const [role, setRole] = useState('student');
  const [classes, setClasses] = useState([]);
  const [classProfiles, setClassProfiles] = useState({});
  const [myPublicProfile, setMyPublicProfile] = useState(null);

  const [activeClassId, setActiveClassId] = useState(null);
  const [newClassName, setNewClassName] = useState('');
  const [newStudentLogin, setNewStudentLogin] = useState('');
  const [teacherMessage, setTeacherMessage] = useState({ text: '', type: '' });

  const [unlockedLevel1, setUnlockedLevel1] = useState(1);
  const [selectedLevel1, setSelectedLevel1] = useState(1);
  const [unlockedLevel2, setUnlockedLevel2] = useState(1);
  const [selectedLevel2, setSelectedLevel2] = useState(1);
  const [campaignPace, setCampaignPace] = useState(10);
  const [score, setScore] = useState(0);

  const [coins, setCoins] = useState(0);
  const [gems, setGems] = useState(0);
  const [inventory, setInventory] = useState(['default']);
  const [equippedAvatar, setEquippedAvatar] = useState('default');
  const [cyborgLevel, setCyborgLevel] = useState(1);
  const [ownedImplants, setOwnedImplants] = useState([]);
  const [lastDailyChest, setLastDailyChest] = useState(0);
  const [claimedRaids, setClaimedRaids] = useState([]);
  const [rewardModal, setRewardModal] = useState(null);

  const [currentTime, setCurrentTime] = useState(new Date());

  // --- РЕЙДЫ ---
  const [selectedBoss, setSelectedBoss] = useState(null);
  const [raidRooms, setRaidRooms] = useState([]);
  const [activeRaidId, setActiveRaidId] = useState(null);
  const [activeRaidData, setActiveRaidData] = useState(null);
  const [showCreateSquad, setShowCreateSquad] = useState(false);
  const [newSquadName, setNewSquadName] = useState('');
  const [newSquadPin, setNewSquadPin] = useState('');
  const [isSquadPrivate, setIsSquadPrivate] = useState(false);
  const [joinPinInput, setJoinPinInput] = useState('');
  const [joiningSquadId, setJoiningSquadId] = useState(null);
  const [raidEq, setRaidEq] = useState(null);
  const [raidInput, setRaidInput] = useState('');
  const [raidFlashError, setRaidFlashError] = useState(false);

  // --- ИГРА ---
  const [gameMode, setGameMode] = useState('freeplay');
  const [freeplaySettings, setFreeplaySettings] = useState({
    mode: 'addsub',
    level: 'beginner',
    ranges: { addSub: 20, mulDiv: 10 },
    terms: 2,
    timeLimit: 120,
  });
  const [gameState, setGameState] = useState({
    timeLeft: 120,
    currentEq: null,
    correct: 0,
    incorrect: 0,
    mistakes: [],
    target: null,
    targetAlerted: false,
    justRankedUp: false,
    earnedPoints: 0,
    earnedCoins: 0,
  });
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState([]);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [flashError, setFlashError] = useState(false);

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isTeacherCheckbox, setIsTeacherCheckbox] = useState(false);
  const [authError, setAuthError] = useState('');
  const [globalProfiles, setGlobalProfiles] = useState([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  const timerRef = useRef(null);

  // БЕЗОПАСНАЯ ДАТА (без точек)
  const getTodayString = () => {
    const d = new Date();
    return `${d.getDate()}_${d.getMonth() + 1}_${d.getFullYear()}`;
  };

  // ТАЙМЕР
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const currentHour = currentTime.getHours();
  const isRaidActive =
    role === 'teacher' || (currentHour >= 18 && currentHour < 21);

  // ИНИЦИАЛИЗАЦИЯ
  useEffect(() => {
    if (!isCloudEnabled) {
      try {
        const sl1 = localStorage.getItem('nikitaMathLevel1');
        if (sl1) {
          setUnlockedLevel1(parseInt(sl1, 10) || 1);
          setSelectedLevel1(parseInt(sl1, 10) || 1);
        }
        const sl2 = localStorage.getItem('nikitaMathLevel2');
        if (sl2) {
          setUnlockedLevel2(parseInt(sl2, 10) || 1);
          setSelectedLevel2(parseInt(sl2, 10) || 1);
        }
        const sp = localStorage.getItem('nikitaMathPace');
        if (sp) setCampaignPace(parseInt(sp, 10) || 10);
        const sScore = localStorage.getItem('nikitaMathScore');
        if (sScore) setScore(parseInt(sScore, 10) || 0);
        const sCoins = localStorage.getItem('nikitaMathCoins');
        if (sCoins) setCoins(parseInt(sCoins, 10) || 0);
        const sGems = localStorage.getItem('nikitaMathGems');
        if (sGems) setGems(parseInt(sGems, 10) || 0);
        const sInv = localStorage.getItem('nikitaMathInventory');
        if (sInv) setInventory(JSON.parse(sInv) || ['default']);
        const sEq = localStorage.getItem('nikitaMathEquipped');
        if (sEq) setEquippedAvatar(sEq);
        const sCyb = localStorage.getItem('nikitaMathCyborgLvl');
        if (sCyb) setCyborgLevel(parseInt(sCyb, 10) || 1);
        const sImpl = localStorage.getItem('nikitaMathImplants');
        if (sImpl) setOwnedImplants(JSON.parse(sImpl) || []);
        const sDaily = localStorage.getItem('nikitaMathLastDaily');
        if (sDaily) setLastDailyChest(parseInt(sDaily, 10) || 0);
        const sClaimed = localStorage.getItem('nikitaMathClaimedRaids');
        if (sClaimed) setClaimedRaids(JSON.parse(sClaimed) || []);
        const sh = localStorage.getItem('nikitaMathHistory');
        if (sh) setHistory(JSON.parse(sh) || []);
      } catch (e) {
        console.error(e);
      }
      setAuthChecked(true);
      setView(user ? 'home' : 'auth');
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((usr) => {
      setUser(usr);
      setAuthChecked(true);
      if (usr) {
        setView('home');
        db.collection('artifacts')
          .doc(APP_ID)
          .collection('users')
          .doc(usr.uid)
          .onSnapshot(
            (doc) => {
              if (doc.exists) {
                const data = doc.data() || {};
                if (data.role) setRole(data.role);
                if (data.classes) {
                  setClasses(data.classes || []);
                } else if (data.myStudents && data.myStudents.length > 0) {
                  const defaultClass = {
                    id: 'default',
                    name: 'Основной класс',
                    students: data.myStudents,
                  };
                  setClasses([defaultClass]);
                  safeSave({ classes: [defaultClass] });
                } else {
                  setClasses([]);
                }

                if (data.unlockedLevel1 !== undefined)
                  setUnlockedLevel1(data.unlockedLevel1 || 1);
                if (data.unlockedLevel2 !== undefined)
                  setUnlockedLevel2(data.unlockedLevel2 || 1);
                if (data.campaignPace !== undefined)
                  setCampaignPace(data.campaignPace || 10);
                if (data.score !== undefined) setScore(data.score || 0);
                if (data.coins !== undefined) setCoins(data.coins || 0);
                if (data.gems !== undefined) setGems(data.gems || 0);
                if (data.inventory) setInventory(data.inventory || ['default']);
                if (data.equippedAvatar) setEquippedAvatar(data.equippedAvatar);
                if (data.cyborgLevel !== undefined)
                  setCyborgLevel(data.cyborgLevel || 1);
                if (data.ownedImplants)
                  setOwnedImplants(data.ownedImplants || []);
                if (data.lastDailyChest !== undefined)
                  setLastDailyChest(data.lastDailyChest || 0);
                if (data.claimedRaids) setClaimedRaids(data.claimedRaids || []);
                if (data.history) {
                  try {
                    setHistory(JSON.parse(data.history) || []);
                  } catch (e) {
                    setHistory([]);
                  }
                }
              }
            },
            (error) => console.error('Firestore error:', error)
          );

        const username = usr.email.split('@')[0];
        db.collection('artifacts')
          .doc(APP_ID)
          .collection('public')
          .doc('data')
          .collection('profiles')
          .doc(username)
          .onSnapshot(
            (doc) => {
              if (doc.exists) setMyPublicProfile(doc.data());
            },
            (error) => console.error('Firestore error:', error)
          );
      } else {
        setView('auth');
      }
    });
    return () => unsubscribe && unsubscribe();
  }, [role, user]);

  useEffect(() => {
    if (!isCloudEnabled || role !== 'teacher' || classes.length === 0) return;
    const allStudents = [...new Set(classes.flatMap((c) => c.students || []))];
    if (allStudents.length === 0) return;
    const unsubscribes = allStudents.map((studentName) => {
      return db
        .collection('artifacts')
        .doc(APP_ID)
        .collection('public')
        .doc('data')
        .collection('profiles')
        .doc(studentName)
        .onSnapshot(
          (doc) => {
            if (doc.exists) {
              setClassProfiles((prev) => ({
                ...prev,
                [studentName]: doc.data(),
              }));
            }
          },
          (error) => console.error('Firestore error:', error)
        );
    });
    return () => unsubscribes.forEach((unsub) => unsub());
  }, [role, classes]);

  // ПОДПИСКА НА СПИСОК ОТРЯДОВ С ЗАЩИТОЙ
  useEffect(() => {
    if (view === 'raidSquadSelect' && selectedBoss && isCloudEnabled) {
      const unsub = db
        .collection('artifacts')
        .doc(APP_ID)
        .collection('public')
        .doc('data')
        .collection('raid_rooms')
        .onSnapshot(
          (snap) => {
            const rooms = [];
            snap.forEach((doc) => {
              const data = doc.data();
              if (
                data.bossId === selectedBoss.id &&
                data.date === getTodayString()
              ) {
                rooms.push(data);
              }
            });
            setRaidRooms(rooms);
          },
          (error) => {
            console.error('Ошибка при чтении комнат Босса:', error);
          }
        );
      return () => unsub();
    }
  }, [view, selectedBoss]);

  useEffect(() => {
    if (view === 'raidGame' && activeRaidId && isCloudEnabled) {
      const unsub = db
        .collection('artifacts')
        .doc(APP_ID)
        .collection('public')
        .doc('data')
        .collection('raid_rooms')
        .doc(activeRaidId)
        .onSnapshot(
          (doc) => {
            if (doc.exists) {
              setActiveRaidData(doc.data());
            }
          },
          (error) => {
            console.error('Ошибка обновления боя:', error);
          }
        );
      return () => unsub();
    }
  }, [view, activeRaidId]);

  const safeSave = (updates) => {
    if (isCloudEnabled && user) {
      db.collection('artifacts')
        .doc(APP_ID)
        .collection('users')
        .doc(user.uid)
        .set(updates, { merge: true })
        .catch((e) => console.error(e));
    } else {
      try {
        if (updates.unlockedLevel1 !== undefined)
          localStorage.setItem('nikitaMathLevel1', updates.unlockedLevel1);
        if (updates.unlockedLevel2 !== undefined)
          localStorage.setItem('nikitaMathLevel2', updates.unlockedLevel2);
        if (updates.campaignPace !== undefined)
          localStorage.setItem('nikitaMathPace', updates.campaignPace);
        if (updates.score !== undefined)
          localStorage.setItem('nikitaMathScore', updates.score);
        if (updates.coins !== undefined)
          localStorage.setItem('nikitaMathCoins', updates.coins);
        if (updates.gems !== undefined)
          localStorage.setItem('nikitaMathGems', updates.gems);
        if (updates.inventory !== undefined)
          localStorage.setItem(
            'nikitaMathInventory',
            JSON.stringify(updates.inventory || [])
          );
        if (updates.equippedAvatar !== undefined)
          localStorage.setItem('nikitaMathEquipped', updates.equippedAvatar);
        if (updates.cyborgLevel !== undefined)
          localStorage.setItem('nikitaMathCyborgLvl', updates.cyborgLevel);
        if (updates.ownedImplants !== undefined)
          localStorage.setItem(
            'nikitaMathImplants',
            JSON.stringify(updates.ownedImplants || [])
          );
        if (updates.lastDailyChest !== undefined)
          localStorage.setItem('nikitaMathLastDaily', updates.lastDailyChest);
        if (updates.claimedRaids !== undefined)
          localStorage.setItem(
            'nikitaMathClaimedRaids',
            JSON.stringify(updates.claimedRaids || [])
          );
        if (updates.history !== undefined)
          localStorage.setItem(
            'nikitaMathHistory',
            Array.isArray(updates.history)
              ? JSON.stringify(updates.history)
              : '[]'
          );
      } catch (e) {
        console.error('Ошибка сохранения в localStorage', e);
      }
    }
  };

  const updatePublicProfile = (
    level1,
    level2,
    pace,
    newScore,
    newCoins,
    newGems,
    newAvatar
  ) => {
    if (isCloudEnabled && user && role === 'student') {
      const username = user.email.split('@')[0];
      db.collection('artifacts')
        .doc(APP_ID)
        .collection('public')
        .doc('data')
        .collection('profiles')
        .doc(username)
        .set(
          {
            username: username,
            unlockedLevel: level1 || 1,
            unlockedLevel2: level2 || 1,
            campaignPace: pace || 10,
            score: newScore || 0,
            coins: newCoins || 0,
            gems: newGems || 0,
            avatar: newAvatar || equippedAvatar,
            lastActive: Date.now(),
          },
          { merge: true }
        )
        .catch((e) => console.error(e));
    }
  };

  const handleBuyAvatar = (avatar) => {
    const safeInventory = inventory || [];
    if (safeInventory.includes(avatar.id)) return;
    let canAfford = false;
    let newCoins = coins || 0;
    let newGems = gems || 0;
    if (avatar.currency === 'coins' && newCoins >= avatar.price) {
      newCoins -= avatar.price;
      canAfford = true;
    } else if (avatar.currency === 'gems' && newGems >= avatar.price) {
      newGems -= avatar.price;
      canAfford = true;
    }
    if (canAfford) {
      const newInventory = [...safeInventory, avatar.id];
      setCoins(newCoins);
      setGems(newGems);
      setInventory(newInventory);
      safeSave({ coins: newCoins, gems: newGems, inventory: newInventory });
      updatePublicProfile(
        unlockedLevel1,
        unlockedLevel2,
        campaignPace,
        score,
        newCoins,
        newGems,
        equippedAvatar
      );
    }
  };

  const handleBuyImplant = (implant) => {
    const safeImplants = ownedImplants || [];
    if (safeImplants.includes(implant.id)) return;
    let safeGems = gems || 0;
    if (safeGems >= implant.price) {
      const newGems = safeGems - implant.price;
      const newImplants = [...safeImplants, implant.id];
      setGems(newGems);
      setOwnedImplants(newImplants);
      safeSave({ gems: newGems, ownedImplants: newImplants });
      updatePublicProfile(
        unlockedLevel1,
        unlockedLevel2,
        campaignPace,
        score,
        coins,
        newGems,
        equippedAvatar
      );
    }
  };

  const handleUpgradeCyborg = () => {
    const safeLevel = cyborgLevel || 1;
    if (safeLevel >= CYBORG_STAGES.length) return;
    const nextStage = CYBORG_STAGES[safeLevel];
    let safeCoins = coins || 0;
    if (
      (unlockedLevel1 || 1) >= nextStage.reqLevel &&
      safeCoins >= nextStage.cost
    ) {
      const newCoins = safeCoins - nextStage.cost;
      const newLevel = safeLevel + 1;
      setCoins(newCoins);
      setCyborgLevel(newLevel);
      safeSave({ coins: newCoins, cyborgLevel: newLevel });
      updatePublicProfile(
        unlockedLevel1,
        unlockedLevel2,
        campaignPace,
        score,
        newCoins,
        gems,
        equippedAvatar
      );
    }
  };

  const handleEquipAvatar = (id) => {
    const safeInventory = inventory || [];
    if (safeInventory.includes(id)) {
      setEquippedAvatar(id);
      safeSave({ equippedAvatar: id });
      updatePublicProfile(
        unlockedLevel1,
        unlockedLevel2,
        campaignPace,
        score,
        coins,
        gems,
        id
      );
    }
  };

  const openChest = (type) => {
    let rng = Math.random();
    let rewardTitle = '';
    let cAdd = 0,
      gAdd = 0;
    let newInventory = [...(inventory || [])];
    let safeCoins = coins || 0;
    let safeGems = gems || 0;
    if (type === 'daily') {
      setLastDailyChest(Date.now());
      safeSave({ lastDailyChest: Date.now() });
      if (rng < 0.7) {
        cAdd = 150;
        rewardTitle = '150 Монет';
      } else if (rng < 0.95) {
        gAdd = 1;
        rewardTitle = '1 Кристалл';
      } else {
        gAdd = 5;
        rewardTitle = 'ДЖЕКПОТ! 5 Кристаллов';
      }
      setRewardModal({
        title: 'Ежедневный сундук',
        reward: rewardTitle,
        icon: '🎁',
      });
    } else if (type === 'normal' && safeCoins >= 100) {
      cAdd = -100;
      if (rng < 0.6) {
        cAdd += 120;
        rewardTitle = 'Окупился! +120 Монет';
      } else if (rng < 0.8) {
        cAdd += 50;
        rewardTitle = 'Не повезло... +50 Монет';
      } else if (rng < 0.95) {
        gAdd += 1;
        rewardTitle = 'Редкий дроп! +1 Кристалл';
      } else {
        const coinAvatars = AVATARS.filter(
          (a) => a.currency === 'coins' && a.id !== 'default'
        );
        const randomAvatar =
          coinAvatars[Math.floor(Math.random() * coinAvatars.length)];
        if (!newInventory.includes(randomAvatar.id)) {
          newInventory.push(randomAvatar.id);
          rewardTitle = `Новый Аватар: ${randomAvatar.name}!`;
        } else {
          gAdd += 2;
          rewardTitle = 'Аватар уже есть. Компенсация: +2 Кристалла';
        }
      }
      setRewardModal({
        title: 'Обычный сундук',
        reward: rewardTitle,
        icon: '📦',
      });
    } else if (type === 'epic' && safeGems >= 10) {
      gAdd = -10;
      if (rng < 0.5) {
        cAdd += 1000;
        rewardTitle = 'Гора Золота! +1000 Монет';
      } else if (rng < 0.8) {
        gAdd += 15;
        rewardTitle = 'Прибыль! +15 Кристаллов';
      } else {
        const gemAvatars = AVATARS.filter((a) => a.currency === 'gems');
        const randomAvatar =
          gemAvatars[Math.floor(Math.random() * gemAvatars.length)];
        if (!newInventory.includes(randomAvatar.id)) {
          newInventory.push(randomAvatar.id);
          rewardTitle = `ЭПИЧЕСКИЙ АВАТАР: ${randomAvatar.name}!`;
        } else {
          gAdd += 10;
          rewardTitle = 'Аватар уже есть. Компенсация: +10 Кристаллов';
        }
      }
      setRewardModal({
        title: 'Эпический сундук',
        reward: rewardTitle,
        icon: '✨',
      });
    } else {
      return;
    }

    const finalCoins = safeCoins + cAdd;
    const finalGems = safeGems + gAdd;
    setCoins(finalCoins);
    setGems(finalGems);
    setInventory(newInventory);
    safeSave({ coins: finalCoins, gems: finalGems, inventory: newInventory });
    updatePublicProfile(
      unlockedLevel1,
      unlockedLevel2,
      campaignPace,
      score,
      finalCoins,
      finalGems,
      equippedAvatar
    );
  };

  const selectRaidBoss = (boss) => {
    setSelectedBoss(boss);
    setView('raidSquadSelect');
  };

  // --- ФУНКЦИИ РЕЙДА (С ФОЛБЭКОМ ПРИ ОШИБКАХ FIREBASE) ---
  const createSquad = async () => {
    if (!selectedBoss) return;

    // Автогенерация имени, если ребенок ничего не ввел
    const finalSquadName =
      newSquadName?.trim() || `Отряд ${user?.email?.split('@')[0] || 'Героев'}`;
    const todayStr = getTodayString();
    const roomId = `squad_${Date.now()}_${todayStr}`;
    const squadData = {
      id: roomId,
      bossId: selectedBoss.id,
      date: todayStr,
      name: finalSquadName,
      isPrivate: isSquadPrivate,
      pin: isSquadPrivate ? newSquadPin : null,
      bossMaxHp: selectedBoss.hp,
      bossHp: selectedBoss.hp,
      participants: {},
      createdAt: Date.now(),
    };

    if (isCloudEnabled) {
      try {
        await db
          .collection('artifacts')
          .doc(APP_ID)
          .collection('public')
          .doc('data')
          .collection('raid_rooms')
          .doc(roomId)
          .set(squadData);
        setNewSquadName('');
        setNewSquadPin('');
        joinRaidRoom(roomId);
      } catch (e) {
        console.error('Firebase заблокировал создание отряда:', e);
        setRewardModal({
          title: 'Сбой подключения',
          reward:
            'База данных заблокировала запрос.\nУбедись, что в Firestore Rules разрешена запись (Test Mode).\n\nЗапускаем босса в Локальном Режиме (Офлайн)!',
          icon: '⚠️',
        });
        setRaidRooms((prev) => [...(prev || []), squadData]);
        setNewSquadName('');
        setNewSquadPin('');
        joinRaidRoom(roomId, squadData);
      }
    } else {
      setRaidRooms((prev) => [...(prev || []), squadData]);
      setNewSquadName('');
      setNewSquadPin('');
      joinRaidRoom(roomId, squadData);
    }
  };

  const attemptJoinSquad = (room) => {
    if (room.isPrivate) {
      setJoiningSquadId(room.id);
      setJoinPinInput('');
    } else {
      joinRaidRoom(room.id, room);
    }
  };

  const confirmJoinPrivateSquad = () => {
    const safeRooms = raidRooms || [];
    const room = safeRooms.find((r) => r.id === joiningSquadId);
    if (room && room.pin === joinPinInput) {
      setJoiningSquadId(null);
      joinRaidRoom(room.id, room);
    } else {
      setRewardModal({
        title: 'Ошибка доступа',
        reward: 'Неверный ПИН-код!',
        icon: '🔒',
      });
      setJoinPinInput('');
    }
  };

  const joinRaidRoom = (roomId, fallbackRoomData = null) => {
    setActiveRaidId(roomId);
    if (!isCloudEnabled || fallbackRoomData) {
      const localRoom = fallbackRoomData ||
        (raidRooms || []).find((r) => r.id === roomId) || {
          id: roomId,
          bossId: selectedBoss?.id,
          bossMaxHp: selectedBoss?.hp || 5000,
          bossHp: selectedBoss?.hp || 5000,
          participants: {},
          name: 'Локальный отряд',
        };
      setActiveRaidData(localRoom);
    }
    setRaidEq(
      generateCampaign1Equation('mixed', { addSub: 100, mulDiv: 20 }, 2)
    );
    setRaidInput('');
    setView('raidGame');
  };

  const handleRaidKeypadPress = (key) => {
    if (view !== 'raidGame' || (activeRaidData?.bossHp || 0) <= 0) return;
    let val = raidInput || '';
    if (key === 'backspace') val = val.slice(0, -1);
    else if (key === 'minus')
      val = val.startsWith('-') ? val.slice(1) : '-' + val;
    else if (val.length < 8) val = val + key;
    setRaidInput(val);
    if (val === '' || val === '-') return;
    const numValue = parseInt(val, 10);
    if (isNaN(numValue)) return;
    const correctAnswer = raidEq?.answer;

    if (numValue === correctAnswer) {
      const safeCyborgLvl = cyborgLevel || 1;
      const cybDmg = CYBORG_STAGES[safeCyborgLvl - 1]?.dmg || 0;
      const implDmg = (ownedImplants || []).reduce((acc, id) => {
        const imp = SUPER_IMPLANTS.find((i) => i.id === id);
        return acc + (imp ? imp.dmg : 0);
      }, 0);
      const baseDamage = 10 + cybDmg + implDmg;
      const damage = Math.floor(baseDamage * ((campaignPace || 10) / 5));
      const myUsername = user?.email?.split('@')[0] || 'guest';

      if (isCloudEnabled && activeRaidId) {
        db.collection('artifacts')
          .doc(APP_ID)
          .collection('public')
          .doc('data')
          .collection('raid_rooms')
          .doc(activeRaidId)
          .update({
            bossHp: firebase.firestore.FieldValue.increment(-damage),
            [`participants.${myUsername}`]:
              firebase.firestore.FieldValue.increment(damage),
          })
          .catch((e) => {
            console.error(
              'Ошибка синхронизации урона, продолжаем локально:',
              e
            );
            const newHp = activeRaidData.bossHp - damage;
            const newParticipants = { ...activeRaidData.participants };
            newParticipants[myUsername] =
              (newParticipants[myUsername] || 0) + damage;
            const newData = {
              ...activeRaidData,
              bossHp: newHp,
              participants: newParticipants,
            };
            setActiveRaidData(newData);
            setRaidRooms((prev) =>
              (prev || []).map((r) => (r.id === activeRaidId ? newData : r))
            );
          });
      } else if (activeRaidData) {
        const newHp = activeRaidData.bossHp - damage;
        const newParticipants = { ...activeRaidData.participants };
        newParticipants[myUsername] =
          (newParticipants[myUsername] || 0) + damage;
        const newData = {
          ...activeRaidData,
          bossHp: newHp,
          participants: newParticipants,
        };
        setActiveRaidData(newData);
        setRaidRooms((prev) =>
          (prev || []).map((r) => (r.id === activeRaidId ? newData : r))
        );
      }
      setRaidEq(
        generateCampaign1Equation('mixed', { addSub: 150, mulDiv: 20 }, 2)
      );
      setRaidInput('');
    } else if (
      val.length >= (correctAnswer?.toString()?.length || 1) &&
      numValue !== correctAnswer
    ) {
      if (
        val.startsWith('-') &&
        val.length < (correctAnswer?.toString()?.length || 1) + 1 &&
        correctAnswer >= 0
      )
        return;
      setRaidFlashError(true);
      setTimeout(() => setRaidFlashError(false), 300);
      setRaidInput('');
    }
  };

  const claimRaidReward = () => {
    if (!activeRaidData || !activeRaidId || !selectedBoss) return;
    const todayStr = getTodayString();
    const claimId = `${activeRaidId}_${todayStr}`;
    const safeClaimed = claimedRaids || [];

    if (safeClaimed.includes(claimId)) {
      setRewardModal({
        title: 'Ошибка',
        reward: 'Ты уже забрал награду за эту арену сегодня!',
        icon: '❌',
      });
      setActiveRaidId(null);
      setView('home');
      return;
    }

    const myUsername = user?.email?.split('@')[0] || 'guest';
    const myDmg = activeRaidData.participants?.[myUsername] || 0;
    if (myDmg === 0) return;

    const sorted = Object.entries(activeRaidData.participants || {}).sort(
      (a, b) => b[1] - a[1]
    );
    const myRank = sorted.findIndex((p) => p[0] === myUsername);

    let coinBase =
      selectedBoss.id === 'boss_1'
        ? 100
        : selectedBoss.id === 'boss_2'
        ? 300
        : selectedBoss.id === 'boss_3'
        ? 1000
        : selectedBoss.id === 'boss_4'
        ? 3000
        : 10000;
    let gemBase =
      selectedBoss.id === 'boss_1'
        ? 1
        : selectedBoss.id === 'boss_2'
        ? 2
        : selectedBoss.id === 'boss_3'
        ? 5
        : selectedBoss.id === 'boss_4'
        ? 15
        : 50;

    let cAdd = coinBase,
      gAdd = gemBase,
      title = 'Участник рейда';
    if (myRank === 0) {
      cAdd = coinBase * 5;
      gAdd = gemBase * 3;
      title = 'Герой Отряда (Топ-1)';
    } else if (myRank <= 2) {
      cAdd = coinBase * 3;
      gAdd = Math.ceil(gemBase * 1.5);
      title = 'Элитный Боец (Топ-3)';
    } else if (myRank <= 4) {
      cAdd = Math.ceil(coinBase * 1.5);
      gAdd = gemBase;
      title = 'Ударный Отряд (Топ-5)';
    }

    const newCoins = (coins || 0) + cAdd;
    const newGems = (gems || 0) + gAdd;
    const newClaimed = [...safeClaimed, claimId];

    setCoins(newCoins);
    setGems(newGems);
    setClaimedRaids(newClaimed);
    safeSave({ coins: newCoins, gems: newGems, claimedRaids: newClaimed });
    updatePublicProfile(
      unlockedLevel1,
      unlockedLevel2,
      campaignPace,
      score,
      newCoins,
      newGems,
      equippedAvatar
    );

    setRewardModal({
      title: title,
      reward: `+${cAdd.toLocaleString('ru-RU')} Монет и +${gAdd} Кристаллов!`,
      icon: '🏆',
    });
    setActiveRaidId(null);
    setSelectedBoss(null);
    setView('home');
  };

  const handleLogin = () => {
    if (!usernameInput || !passwordInput) {
      setAuthError('Заполни все поля!');
      return;
    }
    if (!isCloudEnabled) {
      setUser({
        email: `${usernameInput
          .toLowerCase()
          .trim()
          .replace(/\s/g, '')}@nikita.app`,
        uid: 'local_user',
      });
      setRole(isTeacherCheckbox ? 'teacher' : 'student');
      setAuthChecked(true);
      setView('home');
      return;
    }
    const email = `${usernameInput
      .toLowerCase()
      .trim()
      .replace(/\s/g, '')}@nikita.app`;
    auth
      .signInWithEmailAndPassword(email, passwordInput)
      .catch((e) => setAuthError('Неверный логин или пароль!'));
  };

  const handleRegister = async () => {
    if (!usernameInput || passwordInput.length < 6) {
      setAuthError('Пароль должен быть минимум 6 символов!');
      return;
    }
    if (checkProfanity(usernameInput)) {
      setAuthError('Выбери другое имя!');
      return;
    }
    const username = usernameInput.toLowerCase().trim().replace(/\s/g, '');
    if (!isCloudEnabled) {
      setUser({ email: `${username}@nikita.app`, uid: 'local_user' });
      setRole(isTeacherCheckbox ? 'teacher' : 'student');
      setAuthChecked(true);
      setView('home');
      return;
    }
    const email = `${username}@nikita.app`;
    try {
      const res = await auth.createUserWithEmailAndPassword(
        email,
        passwordInput
      );
      await db
        .collection('artifacts')
        .doc(APP_ID)
        .collection('users')
        .doc(res.user.uid)
        .set({
          role: isTeacherCheckbox ? 'teacher' : 'student',
          classes: [],
          unlockedLevel1: 1,
          unlockedLevel2: 1,
          campaignPace: 10,
          score: 0,
          coins: 0,
          gems: 0,
          inventory: ['default'],
          equippedAvatar: 'default',
          claimedRaids: [],
          cyborgLevel: 1,
          ownedImplants: [],
        });
      if (!isTeacherCheckbox) {
        await db
          .collection('artifacts')
          .doc(APP_ID)
          .collection('public')
          .doc('data')
          .collection('profiles')
          .doc(username)
          .set({
            username: username,
            unlockedLevel: 1,
            unlockedLevel2: 1,
            campaignPace: 10,
            score: 0,
            coins: 0,
            gems: 0,
            avatar: 'default',
            lastActive: Date.now(),
          });
      }
    } catch (e) {
      setAuthError('Имя занято!');
    }
  };

  const handleLogout = () => {
    if (isCloudEnabled) auth.signOut();
    setUnlockedLevel1(1);
    setUnlockedLevel2(1);
    setSelectedLevel1(1);
    setSelectedLevel2(1);
    setHistory([]);
    setRole('student');
    setClasses([]);
    setClassProfiles({});
    setMyPublicProfile(null);
    setScore(0);
    setCoins(0);
    setGems(0);
    setInventory(['default']);
    setEquippedAvatar('default');
    setClaimedRaids([]);
    setCyborgLevel(1);
    setOwnedImplants([]);
    setUsernameInput('');
    setPasswordInput('');
    setIsTeacherCheckbox(false);
    setActiveClassId(null);
    setUser(null);
    setView('auth');
  };

  const loadGlobalLeaderboard = async () => {
    if (!isCloudEnabled || !user) return;
    setIsLoadingLeaderboard(true);
    setView('globalLeaderboard');
    try {
      const snapshot = await db
        .collection('artifacts')
        .doc(APP_ID)
        .collection('public')
        .doc('data')
        .collection('profiles')
        .get();
      const profiles = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.unlockedLevel) profiles.push(data);
      });
      profiles.sort((a, b) => {
        const scoreA =
          a.score !== undefined
            ? a.score
            : (a.unlockedLevel || 1) * 10 * ((a.campaignPace || 10) / 5);
        const scoreB =
          b.score !== undefined
            ? b.score
            : (b.unlockedLevel || 1) * 10 * ((b.campaignPace || 10) / 5);
        return scoreB - scoreA;
      });
      setGlobalProfiles(profiles);
    } catch (e) {}
    setIsLoadingLeaderboard(false);
  };

  const handlePaceChange = (newPace) => {
    setCampaignPace(newPace);
    safeSave({ campaignPace: newPace });
    updatePublicProfile(
      unlockedLevel1,
      unlockedLevel2,
      newPace,
      score,
      coins,
      gems,
      equippedAvatar
    );
  };
  const triggerErrorEffect = () => {
    setFlashError(true);
    setTimeout(() => setFlashError(false), 300);
  };

  // --- ИГРОВЫЕ РЕЖИМЫ ---
  const startCampaign1 = () => {
    setGameMode('campaign1');
    setShowTargetModal(false);
    setIsPaused(false);
    setFlashError(false);
    const config = getCampaign1LevelConfig(selectedLevel1 || 1, campaignPace);
    setGameState({
      timeLeft: config.timeLimit,
      currentEq: generateCampaign1Equation(
        config.mode,
        config.ranges,
        config.terms
      ),
      correct: 0,
      incorrect: 0,
      mistakes: [],
      target: config.target,
      targetAlerted: false,
      justRankedUp: false,
      earnedPoints: 0,
      earnedCoins: 0,
    });
    setInputValue('');
    setView('game');
  };
  const startCampaign2 = () => {
    setGameMode('campaign2');
    setShowTargetModal(false);
    setIsPaused(false);
    setFlashError(false);
    const config = getCampaign2LevelConfig(selectedLevel2 || 1, campaignPace);
    setGameState({
      timeLeft: config.timeLimit,
      currentEq: generateCampaign2Equation(selectedLevel2 || 1),
      correct: 0,
      incorrect: 0,
      mistakes: [],
      target: config.target,
      targetAlerted: false,
      justRankedUp: false,
      earnedPoints: 0,
      earnedCoins: 0,
    });
    setInputValue('');
    setView('game');
  };
  const startFreeplay = () => {
    setGameMode('freeplay');
    setShowTargetModal(false);
    setIsPaused(false);
    setFlashError(false);
    setGameState({
      timeLeft: freeplaySettings?.timeLimit || 120,
      currentEq: generateCampaign1Equation(
        freeplaySettings?.mode || 'addsub',
        freeplaySettings?.ranges || { addSub: 20, mulDiv: 10 },
        freeplaySettings?.terms || 2
      ),
      correct: 0,
      incorrect: 0,
      mistakes: [],
      target: null,
      targetAlerted: false,
      justRankedUp: false,
      earnedPoints: 0,
      earnedCoins: 0,
    });
    setInputValue('');
    setView('game');
  };

  useEffect(() => {
    if (view === 'game' && !isPaused) {
      timerRef.current = setInterval(() => {
        setGameState((prev) => {
          if (prev.timeLeft <= 0) {
            clearInterval(timerRef.current);
            return prev;
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [view, isPaused]);

  useEffect(() => {
    if (view === 'game' && (gameState?.timeLeft || 0) <= 0) endGame(gameState);
  }, [gameState.timeLeft, view]);

  const endGame = (finalState) => {
    const isC1 = gameMode === 'campaign1';
    const isC2 = gameMode === 'campaign2';
    const isCampaign = isC1 || isC2;
    const cLabel = isC1 ? 'Путь Киборга' : isC2 ? 'Высшая Школа' : 'Свой';
    const sLevel = isC1 ? selectedLevel1 : isC2 ? selectedLevel2 : 0;
    const timeLimit = isCampaign ? 120 : freeplaySettings?.timeLimit || 120;

    let earnedPoints = 0;
    let earnedCoinsLocal = finalState?.correct || 0;
    const paceMultiplier = (Number(campaignPace) || 10) / 5;
    if (isCampaign) {
      earnedPoints =
        (finalState?.correct || 0) * 2 * paceMultiplier * (isC2 ? 2 : 1);
      if ((finalState?.correct || 0) >= (finalState?.target || 0)) {
        earnedPoints += 50 * paceMultiplier;
        earnedCoinsLocal += 20;
      }
    } else {
      earnedPoints = (finalState?.correct || 0) * 1;
    }

    const newScore = (score || 0) + earnedPoints;
    const newCoins = (coins || 0) + earnedCoinsLocal;
    setScore(newScore);
    setCoins(newCoins);
    let finalLevelLabel = cLabel;
    if (!isCampaign) {
      finalLevelLabel =
        freeplaySettings?.level === 'custom'
          ? 'Свой'
          : LEVELS[freeplaySettings?.level]?.label || 'Тренировка';
    }

    const sessionResult = {
      id: Date.now(),
      date: new Date().toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      mode: isCampaign
        ? `Уровень ${sLevel}`
        : freeplaySettings?.mode || 'freeplay',
      levelLabel: finalLevelLabel,
      timeLimit: timeLimit,
      correct: finalState?.correct || 0,
      incorrect: finalState?.incorrect || 0,
      target: finalState?.target || 0,
      isCampaign: isCampaign,
    };
    const safeHistory = Array.isArray(history) ? history : [];
    const newHistory = [sessionResult, ...safeHistory].slice(0, 100);
    setHistory(newHistory);

    let rankedUp = false;
    let nextLevel1 = unlockedLevel1 || 1;
    let nextLevel2 = unlockedLevel2 || 1;
    if (isCampaign && (finalState?.correct || 0) >= (finalState?.target || 0)) {
      if (isC1) {
        const calculatedNext = Math.min(1001, (selectedLevel1 || 1) + 1);
        if (calculatedNext > (unlockedLevel1 || 1)) {
          if (
            getRank(unlockedLevel1 || 1).title !== getRank(calculatedNext).title
          )
            rankedUp = true;
          if (
            getLeague(unlockedLevel1 || 1).name !==
            getLeague(calculatedNext).name
          )
            rankedUp = true;
          nextLevel1 = calculatedNext;
          setUnlockedLevel1(nextLevel1);
        }
      } else if (isC2) {
        const calculatedNext = Math.min(501, (selectedLevel2 || 1) + 1);
        if (calculatedNext > (unlockedLevel2 || 1)) {
          nextLevel2 = calculatedNext;
          setUnlockedLevel2(nextLevel2);
        }
      }
    }

    safeSave({
      history: JSON.stringify(newHistory),
      score: newScore,
      coins: newCoins,
      ...(nextLevel1 !== unlockedLevel1 && { unlockedLevel1: nextLevel1 }),
      ...(nextLevel2 !== unlockedLevel2 && { unlockedLevel2: nextLevel2 }),
    });
    updatePublicProfile(
      nextLevel1,
      nextLevel2,
      campaignPace,
      newScore,
      newCoins,
      gems,
      equippedAvatar
    );
    setGameState((prev) => ({
      ...(prev || {}),
      justRankedUp: rankedUp,
      earnedPoints: earnedPoints,
      earnedCoins: earnedCoinsLocal,
    }));
    setView('results');
  };

  const handleKeypadPress = (key) => {
    if (view !== 'game' || isPaused) return;
    let val = inputValue || '';
    if (key === 'backspace') {
      val = val.slice(0, -1);
    } else if (key === 'minus') {
      if (val.startsWith('-')) val = val.slice(1);
      else val = '-' + val;
    } else {
      if (val.length < 8) val = val + key;
    }
    setInputValue(val);
    if (val === '' || val === '-') return;
    const numValue = parseInt(val, 10);
    if (isNaN(numValue)) return;
    const correctAnswer = gameState?.currentEq?.answer;
    if (numValue === correctAnswer) {
      setGameState((prev) => {
        let nextEq;
        if (gameMode === 'campaign1') {
          const config = getCampaign1LevelConfig(
            selectedLevel1 || 1,
            campaignPace
          );
          nextEq = generateCampaign1Equation(
            config.mode,
            config.ranges,
            config.terms
          );
        } else if (gameMode === 'campaign2') {
          nextEq = generateCampaign2Equation(selectedLevel2 || 1);
        } else {
          nextEq = generateCampaign1Equation(
            freeplaySettings?.mode || 'addsub',
            freeplaySettings?.ranges || { addSub: 20, mulDiv: 10 },
            freeplaySettings?.terms || 2
          );
        }
        const newCorrect = (prev?.correct || 0) + 1;
        let newAlerted = prev?.targetAlerted || false;
        if (
          (gameMode === 'campaign1' || gameMode === 'campaign2') &&
          newCorrect === (prev?.target || 0) &&
          !newAlerted
        ) {
          newAlerted = true;
          setShowTargetModal(true);
          setIsPaused(true);
        }
        return {
          ...(prev || {}),
          correct: newCorrect,
          currentEq: nextEq,
          targetAlerted: newAlerted,
        };
      });
      setInputValue('');
    } else if (
      val.length >= (correctAnswer?.toString()?.length || 1) &&
      numValue !== correctAnswer
    ) {
      if (
        val.startsWith('-') &&
        val.length < (correctAnswer?.toString()?.length || 1) + 1 &&
        correctAnswer >= 0
      )
        return;
      triggerErrorEffect();
      setGameState((prev) => ({
        ...(prev || {}),
        incorrect: (prev?.incorrect || 0) + 1,
        mistakes: [
          ...(prev?.mistakes || []),
          ...(prev?.currentEq?.opsUsed || []),
        ],
      }));
      setInputValue('');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (view === 'game' && !isPaused) {
        if (e.key >= '0' && e.key <= '9') {
          handleKeypadPress(e.key);
        } else if (e.key === 'Backspace') {
          handleKeypadPress('backspace');
        } else if (e.key === '-' || e.key === '_') {
          handleKeypadPress('minus');
        }
      } else if (view === 'raidGame') {
        if (e.key >= '0' && e.key <= '9') {
          handleRaidKeypadPress(e.key);
        } else if (e.key === 'Backspace') {
          handleRaidKeypadPress('backspace');
        } else if (e.key === '-' || e.key === '_') {
          handleRaidKeypadPress('minus');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    view,
    isPaused,
    inputValue,
    raidInput,
    gameState,
    raidEq,
    activeRaidData,
    cyborgLevel,
    ownedImplants,
    campaignPace,
  ]);

  const handleSkip = (e) => {
    if (e) e.preventDefault();
    triggerErrorEffect();
    setGameState((prev) => {
      let nextEq;
      if (gameMode === 'campaign1') {
        const config = getCampaign1LevelConfig(
          selectedLevel1 || 1,
          campaignPace
        );
        nextEq = generateCampaign1Equation(
          config.mode,
          config.ranges,
          config.terms
        );
      } else if (gameMode === 'campaign2') {
        nextEq = generateCampaign2Equation(selectedLevel2 || 1);
      } else {
        nextEq = generateCampaign1Equation(
          freeplaySettings?.mode || 'addsub',
          freeplaySettings?.ranges || { addSub: 20, mulDiv: 10 },
          freeplaySettings?.terms || 2
        );
      }
      return {
        ...(prev || {}),
        incorrect: (prev?.incorrect || 0) + 1,
        mistakes: [
          ...(prev?.mistakes || []),
          ...(prev?.currentEq?.opsUsed || []),
        ],
        currentEq: nextEq,
      };
    });
    setInputValue('');
  };

  const handleLevelSelect = (k) =>
    setFreeplaySettings((p) => ({
      ...p,
      level: k,
      ranges: { addSub: LEVELS[k].addSub, mulDiv: LEVELS[k].mulDiv },
    }));
  const handleRangeChange = (t, v) => {
    const n = v.replace(/\D/g, '');
    if (n === '')
      return setFreeplaySettings((p) => ({
        ...p,
        level: 'custom',
        ranges: { ...p.ranges, [t]: '' },
      }));
    const num = parseInt(n, 10);
    if (!isNaN(num))
      setFreeplaySettings((p) => ({
        ...p,
        level: 'custom',
        ranges: { ...p.ranges, [t]: num },
      }));
  };
  const adjustRange = (t, d) =>
    setFreeplaySettings((p) => {
      let c = parseInt(p.ranges[t], 10) || 2;
      let s = c >= 100 ? 50 : c >= 20 ? 10 : 5;
      let nx = d === 'up' ? c + s : c - s;
      if (d === 'up' && nx % s !== 0) nx = Math.ceil(nx / s) * s;
      if (d === 'down' && nx % s !== 0) nx = Math.floor(nx / s) * s;
      return {
        ...p,
        level: 'custom',
        ranges: { ...p.ranges, [t]: Math.max(2, Math.min(nx, 9999)) },
      };
    });

  if (!authChecked)
    return (
      <div className="min-h-[100dvh] bg-black text-yellow-400 flex items-center justify-center font-bold text-2xl animate-pulse">
        ЗАГРУЗКА...
      </div>
    );

  // --- ФУНКЦИИ ОТРИСОВКИ ---

  const renderAuth = () => (
    <div className="min-h-[100dvh] bg-black text-yellow-400 p-6 flex flex-col items-center justify-center font-sans relative">
      <div className="absolute top-8 text-center w-full max-w-md">
        <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-2">
          <span className="text-yellow-400">Н</span>
          <span className="text-white">и</span>
          <span className="text-yellow-400">М</span>
        </h1>
      </div>
      <div className="w-full max-w-md bg-neutral-900 p-8 rounded-[2rem] border-2 border-yellow-500/20 shadow-2xl z-10 mt-16">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-yellow-400 text-black rounded-full flex items-center justify-center mb-4">
            <UserCircle size={32} />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">
            ПРОФИЛЬ
          </h2>
          <p className="text-sm text-neutral-400 leading-tight">
            Придумайте логин и пароль
          </p>
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <input
            type="text"
            placeholder="Логин (без пробелов)"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            className="w-full bg-black border-2 border-neutral-800 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-yellow-400 font-bold text-lg"
          />
          <input
            type="password"
            placeholder="Пароль (от 6 символов)"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full bg-black border-2 border-neutral-800 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-yellow-400 font-bold text-lg"
          />
          <label className="flex items-center gap-3 text-neutral-400 mt-4 cursor-pointer p-2 rounded-xl hover:bg-neutral-800 transition-colors">
            <input
              type="checkbox"
              checked={isTeacherCheckbox}
              onChange={(e) => setIsTeacherCheckbox(e.target.checked)}
              className="w-5 h-5 accent-yellow-400"
            />
            <span className="text-sm font-bold">
              Я Учитель (создать кабинет)
            </span>
          </label>
          {authError && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm font-bold text-center animate-pop-in">
              {authError}
            </div>
          )}
          <div className="pt-4 space-y-3">
            <button
              onClick={handleLogin}
              className="w-full py-4 bg-yellow-400 text-black rounded-2xl font-black text-xl hover:bg-yellow-300 active:scale-95"
            >
              Войти
            </button>
            <button
              onClick={handleRegister}
              className="w-full py-4 bg-transparent text-yellow-500 border-2 border-yellow-500/30 rounded-2xl font-bold text-lg hover:bg-neutral-800 active:scale-95"
            >
              Регистрация
            </button>
          </div>
        </form>
      </div>
      <div className="mt-8 text-center text-neutral-600 font-bold uppercase tracking-widest text-xs">
        Создатель: <span className="text-neutral-400">Никита и математика</span>
      </div>
    </div>
  );

  const renderHome = () => {
    const currentRank = getRank(unlockedLevel1 || 1);
    const currentLeague = getLeague(unlockedLevel1 || 1);
    const isC2Unlocked = (unlockedLevel1 || 1) >= 300;
    const safeCyborgLvl = cyborgLevel || 1;
    const currentCyborg = CYBORG_STAGES[safeCyborgLvl - 1] || CYBORG_STAGES[0];
    const nextCyborg = CYBORG_STAGES[safeCyborgLvl];
    const canUpgradeCyborg =
      nextCyborg &&
      (unlockedLevel1 || 1) >= nextCyborg.reqLevel &&
      (coins || 0) >= nextCyborg.cost;

    return (
      <div className="min-h-[100dvh] bg-black text-yellow-400 p-4 sm:p-6 flex flex-col items-center justify-center font-sans relative">
        <div className="absolute top-4 left-4 flex flex-col items-center bg-neutral-900 border border-neutral-800 rounded-2xl py-2 px-3 shadow-lg">
          <span className="text-3xl">
            {getAvatarIcon(equippedAvatar || 'default')}
          </span>
        </div>
        {user && (
          <div className="absolute top-4 right-4 flex flex-col items-end bg-neutral-900 border border-neutral-800 rounded-2xl py-2 px-4 shadow-lg">
            <span className="text-yellow-500 text-sm font-bold mb-1 flex items-center gap-2">
              <UserCircle size={16} /> {user?.email?.split('@')[0] || 'Игрок'}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-neutral-500 hover:text-white underline decoration-neutral-700"
            >
              Выйти
            </button>
          </div>
        )}
        <div className="w-full max-w-md space-y-6 mt-16 pb-8">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none flex items-center justify-center mb-6">
              <span className="text-yellow-400">Н</span>
              <span className="text-white">и</span>
              <span className="text-yellow-400">М</span>
            </h1>
            {role !== 'teacher' && (
              <div className="space-y-3">
                <div
                  className={`bg-neutral-900 border ${currentLeague.border} rounded-2xl p-4 flex items-center justify-between shadow-lg mx-auto w-full max-w-[320px] relative overflow-hidden`}
                >
                  <div
                    className={`absolute inset-0 opacity-50 ${currentLeague.bg}`}
                  ></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="text-4xl">{currentRank.icon}</div>
                    <div className="text-left">
                      <div className="text-xl font-black text-white leading-none">
                        {currentRank.title}
                      </div>
                      <div
                        className={`text-xs uppercase font-bold tracking-wider mt-1 ${currentLeague.color}`}
                      >
                        {currentLeague.name}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mx-auto w-full max-w-[320px]">
                  <div className="bg-neutral-900 border border-blue-500/30 rounded-xl p-2 flex flex-col items-center justify-center shadow-lg">
                    <div className="text-blue-400 mb-1">
                      <Star size={20} />
                    </div>
                    <div className="text-sm font-black text-blue-400 leading-none">
                      {(score || 0).toLocaleString('ru-RU')}
                    </div>
                  </div>
                  <div className="bg-neutral-900 border border-yellow-500/30 rounded-xl p-2 flex flex-col items-center justify-center shadow-lg">
                    <div className="text-yellow-400 mb-1">
                      <CoinsIcon size={20} />
                    </div>
                    <div className="text-sm font-black text-yellow-400 leading-none">
                      {(coins || 0).toLocaleString('ru-RU')}
                    </div>
                  </div>
                  <div className="bg-neutral-900 border border-purple-500/30 rounded-xl p-2 flex flex-col items-center justify-center shadow-lg">
                    <div className="mb-1">
                      <GemIcon size={20} />
                    </div>
                    <div className="text-sm font-black text-purple-400 leading-none">
                      {(gems || 0).toLocaleString('ru-RU')}
                    </div>
                  </div>
                </div>
                <div className="bg-neutral-900 border-2 border-cyan-500/30 rounded-3xl p-4 mx-auto w-full max-w-[320px] relative mt-4 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-cyan-400 font-bold text-xs uppercase tracking-widest">
                      Эволюция Киборга
                    </div>
                    <div className="bg-cyan-500/20 text-cyan-400 text-[10px] font-black px-2 py-1 rounded-lg">
                      Ур. {safeCyborgLvl} / 20
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={currentCyborg.icon}
                      alt={currentCyborg.name}
                      className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:scale-110 transition-transform"
                    />
                    <div className="text-left flex-1">
                      <div className="text-white font-black text-lg leading-tight">
                        {currentCyborg.name}
                      </div>
                      <div className="text-green-400 text-xs font-bold mt-1">
                        +{currentCyborg.dmg} Урона по Боссу
                      </div>
                    </div>
                  </div>
                  {nextCyborg ? (
                    <button
                      onClick={handleUpgradeCyborg}
                      disabled={!canUpgradeCyborg}
                      className={`w-full py-2 rounded-xl text-sm font-bold transition-all flex flex-col items-center justify-center ${
                        canUpgradeCyborg
                          ? 'bg-cyan-500 text-black hover:bg-cyan-400 active:scale-95 shadow-lg shadow-cyan-500/30'
                          : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        Улучшить (Цена: {nextCyborg.cost}{' '}
                        <CoinsIcon size={14} />)
                      </span>
                      {(unlockedLevel1 || 1) < nextCyborg.reqLevel && (
                        <span className="text-[10px] text-red-400 mt-0.5">
                          Нужен {nextCyborg.reqLevel} уровень Киборга
                        </span>
                      )}
                    </button>
                  ) : (
                    <div className="w-full py-2 bg-neutral-800 text-cyan-400 text-center rounded-xl text-sm font-black border border-cyan-500/30 uppercase tracking-widest">
                      Максимальный Уровень!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 pb-6">
            {role === 'teacher' && (
              <button
                onClick={() => {
                  setView('teacherCabinet');
                  setActiveClassId(null);
                  setTeacherMessage({ text: '', type: '' });
                }}
                className="w-full py-4 bg-green-500 text-white rounded-3xl font-black text-xl flex items-center justify-center gap-3 hover:bg-green-400 transition-transform active:scale-95 shadow-xl shadow-green-500/20 mb-6"
              >
                <Users size={28} /> Кабинет Учителя
              </button>
            )}

            <button
              onClick={() => {
                if (isRaidActive) setView('raidBossSelect');
              }}
              className={`w-full py-4 rounded-3xl font-black text-xl flex flex-col items-center justify-center gap-1 transition-transform shadow-xl border-2 ${
                isRaidActive
                  ? 'bg-red-600 text-white border-red-500 hover:bg-red-500 shadow-red-500/30 animate-pulse'
                  : 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed'
              }`}
            >
              <span className="flex items-center gap-2">
                <Swords size={24} /> БОССЫ ЛИГИ
              </span>
              {isRaidActive ? (
                <span className="text-[10px] font-bold opacity-90 uppercase mt-1">
                  Врата открыты! Вперед!
                </span>
              ) : (
                <span className="text-[10px] font-bold text-neutral-500 uppercase mt-1">
                  ⏳ Откроется с 18:00 до 21:00
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setSelectedLevel1(Math.min(1000, unlockedLevel1 || 1));
                setView('campaign1');
              }}
              className="w-full py-4 bg-yellow-400 text-black rounded-3xl font-black text-xl flex flex-col items-center justify-center gap-1 hover:bg-yellow-300 transition-transform active:scale-95 shadow-xl shadow-yellow-500/20"
            >
              <span className="flex items-center gap-2">
                <Star size={20} /> Путь Киборга
              </span>
              <span className="text-[10px] font-bold opacity-70 uppercase">
                База (Уровень {unlockedLevel1 || 1}/1000)
              </span>
            </button>

            <button
              onClick={() => {
                if (isC2Unlocked) {
                  setSelectedLevel2(Math.min(500, unlockedLevel2 || 1));
                  setView('campaign2');
                }
              }}
              className={`w-full py-4 rounded-3xl font-black text-xl flex flex-col items-center justify-center gap-1 transition-transform active:scale-95 shadow-xl border-2 ${
                isC2Unlocked
                  ? 'bg-purple-600 text-white border-purple-500 hover:bg-purple-500 shadow-purple-500/20'
                  : 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed'
              }`}
            >
              <span className="flex items-center gap-2">
                {isC2Unlocked ? <Zap size={20} /> : <Lock size={20} />} Высшая
                Школа
              </span>
              {isC2Unlocked ? (
                <span className="text-[10px] font-bold opacity-70 uppercase">
                  Степени и корни (Уровень {unlockedLevel2 || 1}/500)
                </span>
              ) : (
                <span className="text-[10px] font-bold text-neutral-500 uppercase mt-1">
                  🔒 Откроется на 300 ур. Киборга
                </span>
              )}
            </button>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setView('shop')}
                className="w-full py-3 bg-neutral-900 text-white border border-neutral-800 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-neutral-800 transition-transform active:scale-95 shadow-lg"
              >
                <GiftIcon className="text-green-400" size={20} />{' '}
                <span className="text-xs">Магазин</span>
              </button>
              <button
                onClick={loadGlobalLeaderboard}
                className="w-full py-3 bg-neutral-900 text-white border border-neutral-800 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-neutral-800 transition-transform active:scale-95 shadow-lg"
              >
                <Globe className="text-blue-400" size={20} />{' '}
                <span className="text-xs">Рейтинг</span>
              </button>
            </div>

            <button
              onClick={() => setView('freeplay')}
              className="w-full mt-2 py-3 bg-transparent text-neutral-500 border border-neutral-800/50 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:text-yellow-500 hover:border-yellow-500 transition-all active:scale-95"
            >
              <Zap size={16} /> Свободная игра
            </button>
            <button
              onClick={() => setView('history')}
              className="w-full py-3 bg-transparent text-neutral-500 border border-neutral-800/50 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:text-yellow-500 hover:border-yellow-500 transition-all active:scale-95"
            >
              <HistoryIcon size={16} /> Архив результатов
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderShop = () => {
    const canOpenDaily =
      Date.now() - (lastDailyChest || 0) > 24 * 60 * 60 * 1000;
    return (
      <div className="min-h-[100dvh] bg-black text-white p-4 sm:p-6 flex flex-col items-center">
        <div className="w-full max-w-4xl space-y-8 pb-10">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setView('home')}
              className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
            >
              <ArrowLeft size={24} /> В меню
            </button>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 font-bold text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-xl border border-yellow-500/30 text-sm">
                {(coins || 0).toLocaleString('ru-RU')} <CoinsIcon size={16} />
              </div>
              <div className="flex items-center gap-2 font-bold text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/30 text-sm">
                {(gems || 0).toLocaleString('ru-RU')} <GemIcon size={16} />
              </div>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white flex items-center justify-center gap-3">
              <ShoppingBag className="text-green-400" size={40} /> Магазин
            </h2>
            <p className="text-neutral-400 font-medium mt-2">
              Твоя база снабжения! Открывай сундуки и покупай улучшения.
            </p>
          </div>

          <div className="bg-neutral-900 rounded-[2rem] p-6 border border-neutral-800">
            <h3 className="text-2xl font-black mb-4 flex items-center gap-2 text-yellow-400">
              <GiftIcon size={24} /> Лутбоксы
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black border-2 border-neutral-700 rounded-2xl p-4 flex flex-col items-center text-center">
                <div className="text-6xl mb-2">🎁</div>
                <h4 className="font-black text-white mb-1">Подарок</h4>
                <p className="text-xs text-neutral-500 mb-4">
                  Доступен раз в 24 часа. Монеты и шанс на Кристаллы!
                </p>
                <button
                  onClick={() => openChest('daily')}
                  disabled={!canOpenDaily}
                  className={`mt-auto w-full py-3 rounded-xl font-bold transition-all ${
                    canOpenDaily
                      ? 'bg-green-500 text-white hover:bg-green-400 active:scale-95'
                      : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                  }`}
                >
                  {canOpenDaily ? 'Открыть бесплатно' : 'Жди завтра'}
                </button>
              </div>
              <div className="bg-black border-2 border-yellow-500/30 rounded-2xl p-4 flex flex-col items-center text-center">
                <div className="text-6xl mb-2">📦</div>
                <h4 className="font-black text-white mb-1">Обычный Сундук</h4>
                <p className="text-xs text-neutral-500 mb-4">
                  Монеты, шанс на Кристаллы и скины Аватаров.
                </p>
                <button
                  onClick={() => openChest('normal')}
                  disabled={(coins || 0) < 100}
                  className={`mt-auto w-full py-3 rounded-xl font-bold flex items-center justify-center gap-1 transition-all ${
                    (coins || 0) >= 100
                      ? 'bg-yellow-400 text-black hover:bg-yellow-300 active:scale-95'
                      : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                  }`}
                >
                  100 <CoinsIcon size={16} />
                </button>
              </div>
              <div className="bg-black border-2 border-purple-500/50 rounded-2xl p-4 flex flex-col items-center text-center shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <div className="text-6xl mb-2">✨</div>
                <h4 className="font-black text-purple-400 mb-1">
                  Эпический Сундук
                </h4>
                <p className="text-xs text-neutral-500 mb-4">
                  Горы монет и высокий шанс на Легендарный лут!
                </p>
                <button
                  onClick={() => openChest('epic')}
                  disabled={(gems || 0) < 10}
                  className={`mt-auto w-full py-3 rounded-xl font-bold flex items-center justify-center gap-1 transition-all ${
                    (gems || 0) >= 10
                      ? 'bg-purple-500 text-white hover:bg-purple-400 active:scale-95'
                      : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                  }`}
                >
                  10 <GemIcon size={16} fill="white" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 rounded-[2rem] p-6 border border-neutral-800 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
            <h3 className="text-2xl font-black mb-4 flex items-center gap-2 text-purple-400">
              <CpuIcon size={24} /> Супер-Импланты
            </h3>
            <p className="text-sm text-neutral-400 mb-6">
              Эти модули навсегда увеличат твой урон в боях с Боссами.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {SUPER_IMPLANTS.map((imp) => {
                const isOwned = (ownedImplants || []).includes(imp.id);
                const canAfford = (gems || 0) >= imp.price;
                return (
                  <div
                    key={imp.id}
                    className={`bg-black rounded-2xl p-4 border-2 flex flex-col items-center text-center transition-all ${
                      isOwned ? 'border-green-500/50' : 'border-purple-500/30'
                    }`}
                  >
                    <div className="text-5xl mb-2">{imp.icon}</div>
                    <div className="font-bold text-sm text-white mb-1 leading-tight">
                      {imp.name}
                    </div>
                    <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest mb-3">
                      {imp.desc}
                    </div>
                    {isOwned ? (
                      <div className="mt-auto w-full">
                        <div className="w-full py-2 text-xs bg-green-500/20 text-green-400 font-bold rounded-lg border border-green-500/50">
                          Установлено
                        </div>
                      </div>
                    ) : (
                      <div className="mt-auto w-full">
                        <button
                          onClick={() => handleBuyImplant(imp)}
                          disabled={!canAfford}
                          className={`w-full py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95 ${
                            canAfford
                              ? 'bg-purple-500 text-white hover:bg-purple-400'
                              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                          }`}
                        >
                          Купить за {imp.price}{' '}
                          <GemIcon size={12} fill="white" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-neutral-900 rounded-[2rem] p-6 border border-neutral-800">
            <h3 className="text-2xl font-black mb-4 flex items-center gap-2 text-white">
              <UserCircle size={24} /> Скины Аватара
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {AVATARS.map((avatar) => {
                const isOwned = (inventory || []).includes(avatar.id);
                const isEquipped = equippedAvatar === avatar.id;
                const isGems = avatar.currency === 'gems';
                const canAfford = isGems
                  ? (gems || 0) >= avatar.price
                  : (coins || 0) >= avatar.price;
                return (
                  <div
                    key={avatar.id}
                    className={`bg-black rounded-2xl p-4 border-2 flex flex-col items-center text-center transition-all ${
                      isEquipped
                        ? 'border-green-500 shadow-lg shadow-green-500/20'
                        : isOwned
                        ? 'border-neutral-700'
                        : 'border-neutral-800'
                    }`}
                  >
                    <div className="text-5xl mb-2">{avatar.icon}</div>
                    <div className="font-bold text-sm text-white mb-2">
                      {avatar.name}
                    </div>
                    {isOwned ? (
                      isEquipped ? (
                        <div className="mt-auto w-full">
                          <button
                            disabled
                            className="w-full py-1.5 text-xs bg-green-500/20 text-green-400 font-bold rounded-lg border border-green-500/50"
                          >
                            Надето
                          </button>
                        </div>
                      ) : (
                        <div className="mt-auto w-full">
                          <button
                            onClick={() => handleEquipAvatar(avatar.id)}
                            className="w-full py-1.5 text-xs bg-neutral-700 text-white font-bold rounded-lg hover:bg-neutral-600 active:scale-95 transition-all"
                          >
                            Надеть
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="mt-auto w-full">
                        <button
                          onClick={() => handleBuyAvatar(avatar)}
                          disabled={!canAfford}
                          className={`w-full py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95 ${
                            canAfford
                              ? isGems
                                ? 'bg-purple-500 text-white hover:bg-purple-400'
                                : 'bg-yellow-400 text-black hover:bg-yellow-300'
                              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                          }`}
                        >
                          {avatar.price}{' '}
                          {isGems ? (
                            <GemIcon size={12} fill="white" />
                          ) : (
                            <CoinsIcon size={12} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRaidBossSelect = () => (
    <div className="min-h-[100dvh] bg-black text-white p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-6 pb-10">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
          >
            <ArrowLeft size={24} /> На Базу
          </button>
        </div>
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🔥</div>
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
            Боссы Лиги
          </h2>
          <p className="text-neutral-400 font-medium mt-2">
            Выбери противника. Ты можешь помогать новичкам или бить своих!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RAID_BOSSES.map((boss) => {
            const isUnlocked = (unlockedLevel1 || 1) >= boss.recLvl;
            return (
              <button
                key={boss.id}
                disabled={!isUnlocked}
                onClick={() => selectRaidBoss(boss)}
                className={`text-left rounded-3xl p-5 border-2 flex items-center gap-4 transition-all ${
                  isUnlocked
                    ? `${boss.bg} ${boss.border} hover:scale-[1.02] hover:bg-opacity-50`
                    : 'bg-neutral-900 border-neutral-800 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="text-6xl">{isUnlocked ? boss.icon : '🔒'}</div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    {boss.league}
                  </div>
                  <div className="text-xl font-black text-white">
                    {boss.name}
                  </div>
                  <div className="text-sm font-bold text-red-400 mt-1">
                    {boss.hp.toLocaleString('ru-RU')} HP
                  </div>
                  {!isUnlocked && (
                    <div className="text-xs text-red-500 mt-2">
                      Нужен {boss.recLvl} уровень
                    </div>
                  )}
                </div>
                {isUnlocked && (
                  <ArrowLeft
                    size={24}
                    className="transform rotate-180 text-neutral-500"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderRaidSquadSelect = () => {
    if (!selectedBoss) return null;
    return (
      <div className="min-h-[100dvh] bg-black text-white p-4 sm:p-6 flex flex-col items-center">
        <div className="w-full max-w-4xl space-y-6 pb-10">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setView('raidBossSelect')}
              className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
            >
              <ArrowLeft size={24} /> К Боссам
            </button>
          </div>
          <div className="text-center mb-8">
            <div className="text-5xl mb-2">{selectedBoss.icon}</div>
            <h2 className="text-3xl md:text-4xl font-black text-red-500 uppercase tracking-tighter">
              Цель: {selectedBoss.name}
            </h2>
            <p className="text-neutral-400 font-medium mt-2">
              Присоединись к отряду или создай свой клановый с ПИН-кодом.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 space-y-4 shrink-0">
              <div className="bg-neutral-900 border border-neutral-800 rounded-[2rem] p-6 shadow-xl">
                <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                  <Shield className="text-yellow-500" size={24} /> Новый Отряд
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder={`Отряд ${
                      user?.email?.split('@')[0] || 'Героев'
                    }`}
                    value={newSquadName}
                    onChange={(e) => setNewSquadName(e.target.value)}
                    className="w-full bg-black border border-neutral-700 text-white px-4 py-3 rounded-xl focus:border-yellow-400 font-bold text-sm"
                  />
                  <label className="flex items-center gap-3 text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSquadPrivate}
                      onChange={(e) => setIsSquadPrivate(e.target.checked)}
                      className="w-4 h-4 accent-yellow-400"
                    />
                    <span className="text-sm font-bold">
                      Закрытый (по ПИН-коду)
                    </span>
                  </label>
                  {isSquadPrivate && (
                    <input
                      type="text"
                      maxLength="4"
                      placeholder="ПИН (4 цифры)"
                      value={newSquadPin}
                      onChange={(e) =>
                        setNewSquadPin(e.target.value.replace(/\D/g, ''))
                      }
                      className="w-full bg-black border border-neutral-700 text-yellow-400 px-4 py-3 rounded-xl focus:border-yellow-400 font-black text-center tracking-widest"
                    />
                  )}
                  {/* УБРАНА БЛОКИРОВКА КНОПКИ ПРИ ПУСТОМ ИМЕНИ */}
                  <button
                    onClick={createSquad}
                    disabled={isSquadPrivate && newSquadPin.length < 4}
                    className="w-full py-3 bg-yellow-400 text-black rounded-xl font-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-300 active:scale-95 transition-all"
                  >
                    Создать и Войти
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-xl font-black text-white flex items-center gap-2 border-b border-neutral-800 pb-2">
                Активные Отряды (Сегодня)
              </h3>
              {(raidRooms || []).length === 0 ? (
                <div className="text-center py-10 text-neutral-500 font-bold bg-neutral-900 border border-neutral-800 rounded-[2rem]">
                  Пока никто не атакует этого босса сегодня. Создай отряд
                  первым!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(raidRooms || []).map((room) => {
                    const hpPercent = room
                      ? Math.max(
                          0,
                          Math.min(
                            100,
                            ((room.bossHp || 0) / (room.bossMaxHp || 5000)) *
                              100
                          )
                        )
                      : 0;
                    const isDefeated = (room?.bossHp || 0) <= 0;
                    const playersCount = Object.keys(
                      room?.participants || {}
                    ).length;
                    const todayStr = getTodayString();
                    const claimId = `${room?.id}_${todayStr}`;
                    const isClaimed = (claimedRaids || []).includes(claimId);
                    const isFull = playersCount >= 50;
                    return (
                      <div
                        key={room.id}
                        className={`bg-neutral-900 rounded-3xl p-5 border flex flex-col relative ${
                          isDefeated
                            ? 'border-green-500/30 opacity-70'
                            : 'border-neutral-700'
                        }`}
                      >
                        {room.isPrivate && (
                          <div className="absolute top-4 right-4 text-neutral-500">
                            <Lock size={16} />
                          </div>
                        )}
                        <h4 className="text-lg font-black text-white mb-1 pr-6 truncate">
                          {room.name}
                        </h4>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase mb-3 flex items-center gap-1">
                          <Users size={12} /> {playersCount}/50 Бойцов
                        </p>
                        <div className="w-full bg-black h-2 rounded-full overflow-hidden mb-1">
                          <div
                            className={`h-full ${
                              isDefeated ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${hpPercent}%` }}
                          ></div>
                        </div>
                        <div className="text-[10px] font-bold text-neutral-500 mb-4">
                          {isDefeated
                            ? 'ПОВЕРЖЕН'
                            : `${Math.floor(room.bossHp || 0)} HP`}
                        </div>
                        {isClaimed ? (
                          <button
                            disabled
                            className="mt-auto w-full py-2 rounded-xl font-bold text-sm bg-neutral-800 text-neutral-500 cursor-not-allowed"
                          >
                            Награда получена
                          </button>
                        ) : isFull && !isDefeated ? (
                          <button
                            disabled
                            className="mt-auto w-full py-2 rounded-xl font-bold text-sm bg-neutral-800 text-neutral-500 cursor-not-allowed"
                          >
                            Мест нет
                          </button>
                        ) : (
                          <button
                            onClick={() => attemptJoinSquad(room)}
                            className={`mt-auto w-full py-2 rounded-xl font-bold text-sm transition-transform active:scale-95 ${
                              isDefeated
                                ? 'bg-green-600/20 text-green-400 hover:bg-green-600/40'
                                : 'bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-500/20'
                            }`}
                          >
                            {isDefeated ? 'Собрать лут' : 'Вступить'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        {joiningSquadId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-700 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl animate-pop-in">
              <Lock size={40} className="text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-white mb-2">
                Закрытый отряд
              </h3>
              <p className="text-sm text-neutral-400 mb-6">
                Введите 4-значный ПИН-код для входа.
              </p>
              <input
                type="text"
                maxLength="4"
                placeholder="••••"
                value={joinPinInput}
                onChange={(e) =>
                  setJoinPinInput(e.target.value.replace(/\D/g, ''))
                }
                className="w-full bg-black border border-neutral-700 text-yellow-400 px-4 py-4 rounded-xl focus:border-yellow-400 font-black text-center text-2xl tracking-[1em] mb-6"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setJoiningSquadId(null)}
                  className="flex-1 py-3 bg-transparent text-neutral-400 font-bold rounded-xl hover:bg-neutral-800"
                >
                  Отмена
                </button>
                <button
                  onClick={confirmJoinPrivateSquad}
                  disabled={joinPinInput.length < 4}
                  className="flex-1 py-3 bg-yellow-400 text-black font-black rounded-xl hover:bg-yellow-300 disabled:opacity-50"
                >
                  Войти
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRaidGame = () => {
    if (!activeRaidData || !selectedBoss)
      return (
        <div className="min-h-[100dvh] bg-black text-red-500 flex items-center justify-center font-bold text-2xl animate-pulse">
          Загрузка Арены...
        </div>
      );

    const hpPercent = Math.max(
      0,
      Math.min(
        100,
        ((activeRaidData.bossHp || 0) / (activeRaidData.bossMaxHp || 1)) * 100
      )
    );
    const isDefeated = (activeRaidData.bossHp || 0) <= 0;

    const participantsList = Object.entries(activeRaidData.participants || {})
      .map(([name, dmg]) => ({ name, damage: dmg }))
      .sort((a, b) => b.damage - a.damage)
      .slice(0, 5);

    const myUsername = user?.email?.split('@')[0] || 'guest';
    const myDamage = activeRaidData.participants?.[myUsername] || 0;
    const sortedAll = Object.entries(activeRaidData.participants || {}).sort(
      (a, b) => b[1] - a[1]
    );
    const myRank = sortedAll.findIndex((p) => p[0] === myUsername) + 1;

    const isGoblin = selectedBoss.id === 'boss_1';
    const isOrc = selectedBoss.id === 'boss_2';
    const isDragon = selectedBoss.id === 'boss_3';
    const isDestroyer = selectedBoss.id === 'boss_4';
    let coinBase = isGoblin
      ? 100
      : isOrc
      ? 300
      : isDragon
      ? 1000
      : isDestroyer
      ? 3000
      : 10000;
    let gemBase = isGoblin
      ? 1
      : isOrc
      ? 2
      : isDragon
      ? 5
      : isDestroyer
      ? 15
      : 50;

    let myExpectedReward = 'Нет урона = нет лута';
    if (myDamage > 0) {
      if (myRank === 1)
        myExpectedReward = `Топ-1: 💎${gemBase * 3} + 🪙${coinBase * 5}`;
      else if (myRank <= 3)
        myExpectedReward = `Топ-3: 💎${Math.ceil(gemBase * 1.5)} + 🪙${
          coinBase * 3
        }`;
      else if (myRank <= 5)
        myExpectedReward = `Топ-5: 💎${gemBase} + 🪙${Math.ceil(
          coinBase * 1.5
        )}`;
      else myExpectedReward = `Участник: 💎${gemBase} + 🪙${coinBase}`;
    }

    return (
      <div className="min-h-[100dvh] bg-black text-white flex flex-col relative overflow-hidden">
        <div
          className={`absolute inset-0 pointer-events-none transition-colors duration-1000 ${
            isDefeated ? 'bg-green-900/10' : 'bg-red-900/20'
          }`}
        ></div>
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col relative z-10 pt-8">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setView('raidSquadSelect')}
              className="flex items-center gap-2 text-neutral-400 hover:text-red-500 font-bold transition-colors"
            >
              <ArrowLeft size={24} /> Отступить
            </button>
            <div className="text-red-500 font-black uppercase tracking-widest text-xs sm:text-sm">
              {activeRaidData.name} {activeRaidData.isPrivate ? '🔒' : ''}
            </div>
          </div>

          <div className="bg-neutral-900 border-2 border-red-500/30 p-4 sm:p-6 rounded-3xl shadow-2xl relative overflow-hidden">
            {!isDefeated && (
              <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>
            )}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div
                className={`text-7xl sm:text-8xl transition-transform ${
                  isDefeated ? 'opacity-50 grayscale' : 'animate-bounce'
                }`}
              >
                {selectedBoss.icon}
              </div>
              <div className="flex-1 w-full text-center sm:text-left">
                <h2
                  className={`text-2xl sm:text-3xl font-black mb-2 ${
                    isDefeated ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {isDefeated ? 'БОСС ПОВЕРЖЕН!' : selectedBoss.name}
                </h2>
                <div className="w-full bg-black h-8 rounded-full overflow-hidden border-2 border-neutral-800 relative">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      isDefeated ? 'bg-green-500' : 'bg-red-600 relative'
                    }`}
                    style={{ width: `${hpPercent}%` }}
                  >
                    {!isDefeated && (
                      <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 animate-pulse"></div>
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-white mix-blend-difference">
                    {Math.floor(
                      Math.max(0, activeRaidData.bossHp || 0)
                    ).toLocaleString('ru-RU')}{' '}
                    / {(activeRaidData.bossMaxHp || 1).toLocaleString('ru-RU')}{' '}
                    HP
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col md:flex-row gap-6 relative z-10 pb-10">
          <div className="flex-1 flex flex-col">
            {isDefeated ? (
              <div className="bg-neutral-900 border-2 border-green-500/50 p-8 rounded-[3rem] text-center shadow-2xl flex flex-col items-center justify-center flex-1 animate-pop-in">
                <div className="text-8xl mb-6">🎉</div>
                <h3 className="text-4xl font-black text-white mb-2">ПОБЕДА!</h3>
                <p className="text-neutral-400 mb-8 text-lg">
                  Команда отлично поработала.
                </p>
                {myDamage > 0 ? (
                  <div className="w-full space-y-4">
                    <div className="bg-black border border-neutral-800 p-4 rounded-2xl text-sm text-neutral-300">
                      Ожидаемая награда:{' '}
                      <strong className="text-green-400 block mt-1">
                        {myExpectedReward}
                      </strong>
                    </div>
                    <button
                      onClick={claimRaidReward}
                      className="w-full py-5 bg-yellow-400 text-black rounded-2xl font-black text-xl hover:bg-yellow-300 active:scale-95 shadow-xl shadow-yellow-500/20 flex justify-center items-center gap-2"
                    >
                      Забрать Награду
                    </button>
                  </div>
                ) : (
                  <div className="text-neutral-500 font-bold p-4 bg-black rounded-xl border border-neutral-800 w-full">
                    Ты не успел нанести урон. Приходи на следующий рейд!
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`w-full rounded-[3rem] p-6 sm:p-8 shadow-2xl flex flex-col items-center border-4 relative transition-colors flex-1 ${
                  raidFlashError
                    ? 'bg-pink-100 border-pink-500 error-shake'
                    : 'bg-red-50 border-red-500 duration-300'
                }`}
              >
                <div className="text-sm font-bold text-red-500 uppercase tracking-widest mb-4">
                  Решай, чтобы атаковать!
                </div>
                <div className="text-4xl sm:text-5xl md:text-6xl font-black text-black mb-6 text-center break-words w-full tracking-tighter leading-none">
                  {raidEq?.display || '?'}{' '}
                  <span className="text-red-500">=</span>
                </div>
                <div className="w-full sm:w-2/3 relative flex justify-center mb-8">
                  <div
                    className={`w-full bg-white border-4 text-black text-4xl sm:text-5xl font-black text-center py-3 rounded-2xl md:rounded-3xl shadow-inner flex items-center justify-center min-h-[72px] sm:min-h-[80px] transition-colors ${
                      raidFlashError ? 'border-pink-500' : 'border-neutral-200'
                    }`}
                  >
                    {raidInput || <span className="text-neutral-300">?</span>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-sm mt-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <KeyButton
                      key={num}
                      onClick={() => handleRaidKeypadPress(num)}
                    >
                      {num}
                    </KeyButton>
                  ))}
                  <KeyButton
                    onClick={() => handleRaidKeypadPress('minus')}
                    className="text-neutral-500 bg-neutral-100"
                  >
                    ±
                  </KeyButton>
                  <KeyButton onClick={() => handleRaidKeypadPress('0')}>
                    0
                  </KeyButton>
                  <KeyButton
                    onClick={() => handleRaidKeypadPress('backspace')}
                    className="text-red-500 bg-red-50"
                  >
                    <DeleteIcon size={32} />
                  </KeyButton>
                </div>
              </div>
            )}
          </div>

          <div className="w-full md:w-1/3 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col shrink-0">
            <h4 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap size={16} /> Топ Урона
            </h4>
            <div className="flex-1 flex flex-col gap-3">
              {participantsList.length === 0 ? (
                <div className="text-xs text-neutral-600 font-bold text-center mt-10">
                  Пока никто не атаковал
                </div>
              ) : (
                participantsList.map((p, idx) => (
                  <div
                    key={p.name}
                    className={`flex justify-between items-center p-3 rounded-xl border ${
                      p.name === myUsername
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-black border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500 font-black text-xs">
                        {idx + 1}.
                      </span>
                      <span
                        className={`font-bold text-sm truncate max-w-[100px] ${
                          p.name === myUsername
                            ? 'text-white'
                            : 'text-neutral-300'
                        }`}
                      >
                        {p.name}
                      </span>
                    </div>
                    <div className="font-black text-red-400 text-sm">
                      {p.damage}
                    </div>
                  </div>
                ))
              )}
            </div>
            {myDamage > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2">
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-bold text-neutral-500">
                    Твой урон:
                  </span>
                  <span className="text-sm font-black text-red-400">
                    {myDamage}
                  </span>
                </div>
                <div className="bg-black border border-neutral-800 p-2 rounded-lg text-[10px] text-neutral-400 text-center">
                  Ранг: {myRank} | Лут:{' '}
                  <strong className="text-green-400">
                    {myExpectedReward.split(':')[0]}
                  </strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTeacherCabinet = () => {
    const effectiveClassId =
      activeClassId || (classes.length > 0 ? classes[0].id : 'create');
    const currentClass = classes.find((c) => c.id === effectiveClassId);
    let classStudentProfiles = [];
    let sortedStudents = [];
    let avgLevel = 0;
    let avgPace = 0;

    if (currentClass) {
      classStudentProfiles = (currentClass.students || []).map(
        (sLogin) =>
          classProfiles[sLogin] || {
            username: sLogin,
            unlockedLevel: 0,
            campaignPace: 0,
            score: 0,
            isLoading: true,
          }
      );
      sortedStudents = classStudentProfiles.sort((a, b) => {
        const scoreA =
          a.score !== undefined
            ? a.score
            : (a.unlockedLevel || 1) * 10 * ((a.campaignPace || 10) / 5);
        const scoreB =
          b.score !== undefined
            ? b.score
            : (b.unlockedLevel || 1) * 10 * ((b.campaignPace || 10) / 5);
        return scoreB - scoreA;
      });
      const loaded = classStudentProfiles.filter((p) => !p.isLoading);
      if (loaded.length > 0) {
        avgLevel = Math.round(
          loaded.reduce((sum, p) => sum + (p.unlockedLevel || 0), 0) /
            loaded.length
        );
        avgPace = Math.round(
          loaded.reduce((sum, p) => sum + (p.campaignPace || 0), 0) /
            loaded.length
        );
      }
    }

    const onAddStudentToCurrentClass = async () => {
      if (!newStudentLogin || !effectiveClassId) return;
      const normalized = newStudentLogin
        .toLowerCase()
        .trim()
        .replace(/\s/g, '');
      if (currentClass && (currentClass.students || []).includes(normalized)) {
        setTeacherMessage({
          text: 'Этот ученик уже есть в классе!',
          type: 'error',
        });
        return;
      }
      try {
        const docRef = await db
          .collection('artifacts')
          .doc(APP_ID)
          .collection('public')
          .doc('data')
          .collection('profiles')
          .doc(normalized)
          .get();
        if (docRef.exists) {
          const updatedClasses = classes.map((c) => {
            if (c.id === effectiveClassId) {
              return { ...c, students: [...(c.students || []), normalized] };
            }
            return c;
          });
          setClasses(updatedClasses);
          safeSave({ classes: updatedClasses });
          await db
            .collection('artifacts')
            .doc(APP_ID)
            .collection('public')
            .doc('data')
            .collection('profiles')
            .doc(normalized)
            .set(
              {
                className: currentClass?.name || '',
                teacherName: user?.email.split('@')[0] || '',
              },
              { merge: true }
            );
          setTeacherMessage({
            text: 'Ученик успешно добавлен!',
            type: 'success',
          });
          setNewStudentLogin('');
        } else {
          setTeacherMessage({ text: 'Ученик не найден!', type: 'error' });
        }
      } catch (e) {
        setTeacherMessage({ text: 'Ошибка поиска.', type: 'error' });
      }
    };

    const onRemoveStudentFromCurrentClass = (studentToRemove) => {
      const updatedClasses = classes.map((c) => {
        if (c.id === effectiveClassId) {
          return {
            ...c,
            students: (c.students || []).filter((s) => s !== studentToRemove),
          };
        }
        return c;
      });
      setClasses(updatedClasses);
      safeSave({ classes: updatedClasses });
      if (isCloudEnabled) {
        db.collection('artifacts')
          .doc(APP_ID)
          .collection('public')
          .doc('data')
          .collection('profiles')
          .doc(studentToRemove)
          .set(
            {
              className: firebase.firestore.FieldValue.delete(),
              teacherName: firebase.firestore.FieldValue.delete(),
            },
            { merge: true }
          )
          .catch((e) => console.error(e));
      }
    };

    return (
      <div className="min-h-[100dvh] bg-black text-white p-4 sm:p-6 flex flex-col items-center">
        <div className="w-full max-w-5xl space-y-6 pb-10">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setView('home')}
              className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
            >
              <ArrowLeft size={24} /> В меню
            </button>
            <div className="flex items-center gap-2 text-neutral-400 text-sm font-bold">
              <UserCircle size={16} /> {user?.email?.split('@')[0] || 'Учитель'}
            </div>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-4xl font-black text-white flex items-center justify-center gap-3">
              <Users className="text-yellow-500" size={32} /> Управление
            </h2>
          </div>
          <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar border-b border-neutral-800">
            {classes.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setActiveClassId(c.id);
                  setTeacherMessage({ text: '', type: '' });
                }}
                className={`px-6 py-3 rounded-t-2xl font-black whitespace-nowrap transition-colors ${
                  effectiveClassId === c.id
                    ? 'bg-yellow-400 text-black'
                    : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                {c.name}
              </button>
            ))}
            <button
              onClick={() => {
                setActiveClassId('create');
                setTeacherMessage({ text: '', type: '' });
              }}
              className={`px-6 py-3 rounded-t-2xl font-bold whitespace-nowrap transition-colors border-2 border-b-0 border-dashed ${
                effectiveClassId === 'create'
                  ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10'
                  : 'border-neutral-700 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              ➕ Создать класс
            </button>
          </div>
          {effectiveClassId === 'create' ? (
            <div className="bg-neutral-900 rounded-b-[2rem] rounded-tr-[2rem] p-6 sm:p-10 border border-neutral-800 shadow-xl text-center">
              <Folder size={64} className="text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-white mb-6">
                Создать новый класс
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Название (например: 5 А)"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="flex-1 bg-black border-2 border-neutral-800 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-yellow-400 font-bold"
                />
                <button
                  onClick={() => {
                    if (newClassName.trim()) {
                      const newClass = {
                        id: `class_${Date.now()}`,
                        name: newClassName.trim(),
                        students: [],
                      };
                      const newClasses = [...classes, newClass];
                      setClasses(newClasses);
                      safeSave({ classes: newClasses });
                      setActiveClassId(newClass.id);
                      setNewClassName('');
                    }
                  }}
                  className="py-4 px-8 bg-yellow-400 text-black rounded-2xl font-black text-lg hover:bg-yellow-300 active:scale-95 shadow-lg shadow-yellow-500/20"
                >
                  Создать
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                <div className="bg-neutral-900 p-4 rounded-3xl border border-neutral-800 text-center">
                  <div className="text-[10px] md:text-xs text-neutral-500 font-bold uppercase mb-1">
                    Учеников
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-white">
                    {(currentClass?.students || []).length}
                  </div>
                </div>
                <div className="bg-neutral-900 p-4 rounded-3xl border border-neutral-800 text-center">
                  <div className="text-[10px] md:text-xs text-neutral-500 font-bold uppercase mb-1">
                    Ср. Уровень
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-yellow-400">
                    {avgLevel}
                  </div>
                </div>
                <div className="bg-neutral-900 p-4 rounded-3xl border border-neutral-800 text-center">
                  <div className="text-[10px] md:text-xs text-neutral-500 font-bold uppercase mb-1">
                    Ср. Темп
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-green-400">
                    {avgPace}
                  </div>
                </div>
              </div>
              <div className="bg-neutral-900 rounded-[2rem] p-6 border border-neutral-800 shadow-xl">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <UserPlus size={24} className="text-yellow-500" /> Добавить
                    ученика
                  </h3>
                  <button
                    onClick={() => {
                      const updatedClasses = classes.filter(
                        (c) => c.id !== effectiveClassId
                      );
                      setClasses(updatedClasses);
                      safeSave({ classes: updatedClasses });
                      setActiveClassId(null);
                    }}
                    className="text-neutral-600 hover:text-red-500 transition-colors"
                    title="Удалить класс"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Логин (например: ivan2015)"
                    value={newStudentLogin}
                    onChange={(e) => setNewStudentLogin(e.target.value)}
                    className="flex-1 bg-black border-2 border-neutral-800 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-yellow-400 font-bold"
                  />
                  <button
                    onClick={onAddStudentToCurrentClass}
                    className="py-4 px-8 bg-yellow-400 text-black rounded-2xl font-black text-lg hover:bg-yellow-300 active:scale-95 shrink-0 shadow-lg shadow-yellow-500/20"
                  >
                    Добавить
                  </button>
                </div>
                {teacherMessage.text && (
                  <div
                    className={`mt-3 p-3 rounded-xl text-sm font-bold text-center animate-pop-in ${
                      teacherMessage.type === 'error'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'bg-green-500/10 text-green-400 border border-green-500/30'
                    }`}
                  >
                    {teacherMessage.text}
                  </div>
                )}
              </div>
              <div className="bg-neutral-900 rounded-[2rem] p-6 border border-neutral-800 shadow-xl overflow-hidden">
                <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                  <BarChart size={24} className="text-yellow-500" /> Турнирная
                  таблица
                </h3>
                {!currentClass || (currentClass.students || []).length === 0 ? (
                  <div className="text-center py-10 text-neutral-500 font-medium">
                    В этом классе пока нет учеников. Добавьте их по логину выше!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b-2 border-neutral-800 text-neutral-500 text-sm uppercase tracking-wider">
                          <th className="p-3 font-bold w-12 text-center">#</th>
                          <th className="p-3 font-bold">Ученик (Логин)</th>
                          <th className="p-3 font-bold text-center">
                            Очки (XP)
                          </th>
                          <th className="p-3 font-bold text-center">Уровень</th>
                          <th className="p-3 font-bold text-right">
                            Управление
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedStudents.map((student, idx) => {
                          if (student.isLoading) {
                            return (
                              <tr
                                key={student.username}
                                className="border-b border-neutral-800/50 opacity-50"
                              >
                                <td className="p-3 text-center">-</td>
                                <td className="p-3 font-bold text-neutral-500">
                                  {student.username}
                                </td>
                                <td
                                  colSpan="2"
                                  className="p-3 text-center text-xs"
                                >
                                  Загрузка...
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() =>
                                      onRemoveStudentFromCurrentClass(
                                        student.username
                                      )
                                    }
                                    className="text-xs font-bold bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg"
                                  >
                                    Исключить
                                  </button>
                                </td>
                              </tr>
                            );
                          }
                          const sRank = getRank(student.unlockedLevel || 1);
                          const displayScore =
                            student.score !== undefined
                              ? student.score
                              : (student.unlockedLevel || 1) *
                                10 *
                                ((student.campaignPace || 10) / 5);
                          return (
                            <tr
                              key={student.username}
                              className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors"
                            >
                              <td className="p-3 text-center font-black text-neutral-400 text-xl">
                                {idx === 0
                                  ? '🥇'
                                  : idx === 1
                                  ? '🥈'
                                  : idx === 2
                                  ? '🥉'
                                  : idx + 1}
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-yellow-400 text-lg flex items-center gap-2">
                                  <span className="text-2xl">{sRank.icon}</span>{' '}
                                  {student.username}
                                </div>
                                <div className="text-xs font-bold text-neutral-500 mt-1 uppercase tracking-wide ml-9">
                                  {sRank.title}
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <div className="inline-flex items-center justify-center bg-blue-500/10 border border-blue-500/30 text-blue-400 font-black px-4 py-1.5 rounded-full text-lg shadow-sm">
                                  {displayScore.toLocaleString('ru-RU')}
                                </div>
                              </td>
                              <td className="p-3 text-center font-bold text-neutral-300">
                                {student.unlockedLevel}
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() =>
                                    onRemoveStudentFromCurrentClass(
                                      student.username
                                    )
                                  }
                                  className="text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  Исключить
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCampaignMenu = (campaignNum) => {
    const isC1 = campaignNum === 1;
    const activeLvl = isC1 ? selectedLevel1 : selectedLevel2;
    const maxLvl = isC1 ? 1000 : 500;
    const startIdx = Math.max(1, (activeLvl || 1) - 15);
    const endIdx = Math.min(maxLvl, startIdx + 30);
    const visibleLevels = Array.from(
      { length: endIdx - startIdx + 1 },
      (_, i) => startIdx + i
    );
    const conf = isC1
      ? getCampaign1LevelConfig(activeLvl || 1, campaignPace)
      : getCampaign2LevelConfig(activeLvl || 1, campaignPace);

    return (
      <div className="min-h-[100dvh] bg-black text-white p-4 sm:p-6 flex flex-col items-center">
        <div className="w-full max-w-4xl flex flex-col flex-1 pb-10">
          <button
            onClick={() => setView('home')}
            className="self-start flex items-center gap-2 text-yellow-500 mb-6 hover:text-yellow-400 font-bold"
          >
            <ArrowLeft size={24} /> Назад
          </button>
          <div className="text-center mb-8">
            <h2
              className={`text-3xl md:text-4xl font-black uppercase tracking-widest flex items-center justify-center gap-3 ${
                isC1 ? 'text-yellow-400' : 'text-purple-500'
              }`}
            >
              {isC1 ? <Star /> : <Zap />}{' '}
              {isC1 ? 'Путь Киборга' : 'Высшая Школа'}
            </h2>
          </div>
          <div className="flex flex-col md:flex-row gap-6 lg:gap-10 items-stretch flex-1">
            <div
              className={`flex-1 bg-neutral-900 rounded-3xl border-2 p-6 md:p-8 flex flex-col items-center justify-center shadow-xl ${
                isC1
                  ? 'border-yellow-500/30 shadow-yellow-500/10'
                  : 'border-purple-500/30 shadow-purple-500/10'
              }`}
            >
              {conf.isBoss ? (
                <div className="w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">👹</span>
                </div>
              ) : (
                <div
                  className={`w-20 h-20 text-black rounded-full flex items-center justify-center mb-4 ${
                    isC1 ? 'bg-yellow-500' : 'bg-purple-500'
                  }`}
                >
                  <Play size={40} />
                </div>
              )}
              <h3 className="text-4xl font-black mb-2 text-center">
                Уровень {activeLvl}
                {conf.isBoss && (
                  <span className="block text-2xl text-red-500 mt-2">БОСС</span>
                )}
              </h3>
              <div className="w-full h-px bg-neutral-800 my-4"></div>
              <div className="w-full space-y-3 text-center md:text-lg">
                <div className="flex justify-between items-center bg-black p-4 rounded-xl">
                  <span className="text-neutral-400 text-sm md:text-base">
                    Темы:
                  </span>
                  <span
                    className={`font-bold text-sm md:text-base ${
                      isC1 ? 'text-yellow-400' : 'text-purple-400'
                    }`}
                  >
                    {isC1 ? MODES[conf.mode] : 'Степени, Уравнения, Корни'}
                  </span>
                </div>
                <div
                  className={`flex justify-between items-center bg-black p-4 rounded-xl border ${
                    isC1 ? 'border-yellow-500/50' : 'border-purple-500/50'
                  }`}
                >
                  <span className="text-neutral-400 font-bold">ЦЕЛЬ:</span>
                  <div className="text-right">
                    <div className="font-black text-xl text-green-400">
                      {conf.targetSpeed} / мин
                    </div>
                    <div className="text-xs text-neutral-500">
                      ({conf.target} за 2 мин)
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full space-y-2 mt-6">
                <label className="text-xs font-bold uppercase text-neutral-500 tracking-wider">
                  Множитель Баллов
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePaceChange(p)}
                      className={`py-2 rounded-xl text-xs md:text-sm font-bold border ${
                        campaignPace === p
                          ? isC1
                            ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                            : 'bg-purple-500/20 border-purple-500 text-purple-400'
                          : 'border-neutral-800 text-neutral-500 hover:bg-neutral-800'
                      }`}
                    >
                      {p === 5
                        ? 'x1 (5/м)'
                        : p === 10
                        ? 'x2 (10/м)'
                        : 'x3 (15/м)'}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={isC1 ? startCampaign1 : startCampaign2}
                className={`mt-6 w-full py-5 text-white rounded-2xl font-black text-xl transition-all active:scale-95 shadow-lg ${
                  isC1
                    ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-yellow-500/20'
                    : 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20'
                }`}
              >
                В БОЙ!
              </button>
            </div>
            <div className="md:w-1/3 bg-neutral-900 rounded-3xl p-4 flex flex-col border border-neutral-800 h-96 md:h-auto overflow-hidden">
              <h4 className="text-center font-bold text-neutral-400 mb-4 uppercase text-sm">
                Карта
              </h4>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-4 sm:grid-cols-5 md:grid-cols-3 gap-2 content-start">
                {visibleLevels.map((lvl) => {
                  const isUnlocked = isC1
                    ? lvl <= (unlockedLevel1 || 1)
                    : lvl <= (unlockedLevel2 || 1);
                  const isSelected = activeLvl === lvl;
                  const isBossLvl = lvl % 50 === 0;
                  return (
                    <button
                      key={lvl}
                      disabled={!isUnlocked}
                      onClick={() =>
                        isC1 ? setSelectedLevel1(lvl) : setSelectedLevel2(lvl)
                      }
                      className={`aspect-square rounded-xl font-black text-sm md:text-base flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? isC1
                            ? 'bg-yellow-400 text-black scale-105'
                            : 'bg-purple-500 text-white scale-105'
                          : isUnlocked
                          ? 'bg-neutral-800 text-white'
                          : 'bg-black text-neutral-600 opacity-50'
                      } ${
                        isBossLvl && isUnlocked && !isSelected
                          ? 'border border-red-500/50 text-red-400'
                          : ''
                      }`}
                    >
                      {isBossLvl && <span className="text-xs mb-1">👹</span>}
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFreeplay = () => (
    <div className="min-h-[100dvh] bg-black text-white p-4 sm:p-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md md:max-w-4xl space-y-6 md:space-y-8 py-4 pb-10">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => setView('home')}
            className="text-neutral-500 hover:text-white"
          >
            <ArrowLeft size={32} />
          </button>
          <h1 className="text-3xl md:text-5xl font-black text-white">
            СВОБОДНАЯ ИГРА
          </h1>
        </div>
        <div className="bg-neutral-900 rounded-[2rem] p-5 sm:p-8 shadow-2xl border border-yellow-500/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase text-yellow-500">
                  Действия
                </label>
                <div className="flex flex-col gap-2">
                  {Object.entries(MODES).map(([k, l]) => (
                    <button
                      key={k}
                      onClick={() =>
                        setFreeplaySettings({ ...freeplaySettings, mode: k })
                      }
                      className={`py-3 md:py-4 px-4 rounded-2xl font-bold text-left ${
                        freeplaySettings?.mode === k
                          ? 'bg-yellow-400 text-black shadow-md shadow-yellow-500/20'
                          : 'bg-black text-yellow-600 border border-neutral-800'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase text-yellow-500">
                  Пресет сложности
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(LEVELS).map(([k, d]) => (
                    <button
                      key={k}
                      onClick={() => handleLevelSelect(k)}
                      className={`py-3 px-1 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 border border-neutral-800 ${
                        freeplaySettings?.level === k
                          ? 'bg-yellow-400 text-black border-transparent'
                          : 'bg-black text-yellow-600 hover:bg-neutral-800'
                      }`}
                    >
                      <span className="text-2xl">{d.icon}</span>
                      <span className="text-[10px] sm:text-xs uppercase">
                        {d.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-black p-4 rounded-2xl border border-yellow-500/10 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-yellow-600 flex-1">
                    Счет (+ и -) до:
                  </span>
                  <div className="flex items-center bg-neutral-800 rounded-xl overflow-hidden shrink-0">
                    <button
                      onClick={() => adjustRange('addSub', 'down')}
                      className="w-10 h-10 text-yellow-500 font-black"
                    >
                      -
                    </button>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={freeplaySettings?.ranges?.addSub || 20}
                      onChange={(e) =>
                        handleRangeChange('addSub', e.target.value)
                      }
                      className="w-16 bg-transparent text-yellow-400 text-center font-bold focus:outline-none"
                    />
                    <button
                      onClick={() => adjustRange('addSub', 'up')}
                      className="w-10 h-10 text-yellow-500 font-black"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-yellow-600 flex-1">
                    Счет (× и ÷) до:
                  </span>
                  <div className="flex items-center bg-neutral-800 rounded-xl overflow-hidden shrink-0">
                    <button
                      onClick={() => adjustRange('mulDiv', 'down')}
                      className="w-10 h-10 text-yellow-500 font-black"
                    >
                      -
                    </button>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={freeplaySettings?.ranges?.mulDiv || 10}
                      onChange={(e) =>
                        handleRangeChange('mulDiv', e.target.value)
                      }
                      className="w-16 bg-transparent text-yellow-400 text-center font-bold focus:outline-none"
                    />
                    <button
                      onClick={() => adjustRange('mulDiv', 'up')}
                      className="w-10 h-10 text-yellow-500 font-black"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-yellow-500">
                    Чисел
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[2, 3].map((t) => (
                      <button
                        key={t}
                        onClick={() =>
                          setFreeplaySettings({ ...freeplaySettings, terms: t })
                        }
                        className={`py-3 rounded-2xl font-bold ${
                          freeplaySettings?.terms === t
                            ? 'bg-yellow-400 text-black'
                            : 'bg-black text-yellow-600'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-yellow-500">
                    Мин
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[60, 120, 180].map((t) => (
                      <button
                        key={t}
                        onClick={() =>
                          setFreeplaySettings({
                            ...freeplaySettings,
                            timeLimit: t,
                          })
                        }
                        className={`py-3 rounded-2xl font-bold ${
                          freeplaySettings?.timeLimit === t
                            ? 'bg-yellow-400 text-black'
                            : 'bg-black text-yellow-600'
                        }`}
                      >
                        {t / 60}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={startFreeplay}
          className="w-full py-5 bg-yellow-400 text-black rounded-2xl font-black text-2xl flex items-center justify-center gap-3 hover:bg-yellow-300 transition-colors active:scale-95"
        >
          <Play fill="currentColor" /> Старт
        </button>
      </div>
    </div>
  );

  const KeyButton = ({ onClick, children, className = '' }) => {
    const [isPressed, setIsPressed] = useState(false);
    return (
      <button
        onPointerDown={(e) => {
          e.preventDefault();
          setIsPressed(true);
          onClick();
        }}
        onPointerUp={() => setIsPressed(false)}
        onPointerLeave={() => setIsPressed(false)}
        onPointerCancel={() => setIsPressed(false)}
        className={`text-3xl sm:text-4xl font-black rounded-2xl flex items-center justify-center select-none touch-none border-2 border-neutral-200 transition-none ${
          isPressed
            ? 'translate-y-1 shadow-none bg-neutral-100'
            : 'bg-white text-black shadow-[0_4px_0_0_rgba(200,200,200,0.5)]'
        } h-16 sm:h-20 ${className}`}
      >
        {children}
      </button>
    );
  };

  const renderGame = () => {
    const isC1 = gameMode === 'campaign1';
    const isC2 = gameMode === 'campaign2';
    const isCampaign = isC1 || isC2;
    const activeLevel = isC1 ? selectedLevel1 : selectedLevel2;
    const isBoss = isCampaign && activeLevel % 50 === 0;

    const themeColor = isC2 ? 'purple-500' : 'yellow-400';
    const themeBg = isC2 ? 'bg-purple-50' : 'bg-[#FEF9E7]';
    const themeBorder = isC2 ? 'border-purple-500' : 'border-yellow-400';

    return (
      <div className="min-h-[100dvh] bg-black text-white p-4 sm:p-6 flex flex-col relative">
        <div className="w-full max-w-md md:max-w-3xl mx-auto flex flex-col flex-1">
          <div className="flex justify-start mb-2">
            <button
              onClick={() => {
                setIsPaused(true);
                setView('home');
              }}
              className="flex items-center gap-2 text-neutral-500 hover:text-red-500 font-bold transition-colors"
            >
              <ArrowLeft size={20} /> Сдаться и выйти
            </button>
          </div>

          <div className="flex justify-between items-center mb-4 p-4 bg-neutral-900 rounded-3xl border border-neutral-800">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full font-black text-xl transition-colors ${
                  (gameState?.timeLeft || 0) <= 10
                    ? 'bg-red-500 text-white animate-pulse'
                    : `bg-${themeColor} text-black`
                }`}
              >
                {Math.floor((gameState?.timeLeft || 0) / 60)}:
                {((gameState?.timeLeft || 0) % 60).toString().padStart(2, '0')}
              </div>
            </div>
            {isCampaign && (
              <div className="flex-1 mx-4 flex flex-col items-center">
                <span className="text-xs uppercase font-bold text-neutral-500 mb-1">
                  Цель
                </span>
                <div className="w-full bg-black h-4 rounded-full overflow-hidden border border-neutral-700">
                  <div
                    className={`h-full transition-all duration-300 ${
                      (gameState?.correct || 0) >= (gameState?.target || 0)
                        ? 'bg-green-400'
                        : `bg-${themeColor}`
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        ((gameState?.correct || 0) /
                          Math.max(1, gameState?.target || 1)) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="text-sm font-bold mt-1">
                  <span
                    className={
                      (gameState?.correct || 0) >= (gameState?.target || 0)
                        ? 'text-green-400'
                        : 'text-white'
                    }
                  >
                    {gameState?.correct || 0}
                  </span>{' '}
                  <span className="text-neutral-500">
                    {' '}
                    / {gameState?.target || 0}
                  </span>
                </div>
              </div>
            )}
            <div className="flex gap-3 sm:gap-4 font-bold text-lg">
              <span className="text-green-400 flex items-center gap-1">
                <CheckCircle size={20} /> {gameState?.correct || 0}
              </span>
              <span className="text-red-400 flex items-center gap-1">
                <XCircle size={20} /> {gameState?.incorrect || 0}
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-start w-full">
            <button
              onPointerDown={handleSkip}
              className="mb-4 w-full md:w-auto flex items-center justify-center gap-2 bg-neutral-900 text-neutral-400 py-3 px-6 rounded-2xl font-bold hover:bg-neutral-800 hover:text-white border border-neutral-800 active:scale-95 transition-transform"
            >
              <SkipForward size={20} /> Пропустить пример
            </button>
            <div
              className={`w-full rounded-3xl md:rounded-[3rem] p-4 sm:p-8 shadow-2xl flex flex-col items-center border-4 relative overflow-hidden transition-colors ${
                flashError
                  ? 'bg-pink-100 border-pink-500 error-shake'
                  : `${themeBg} ${themeBorder} duration-300`
              }`}
            >
              {isBoss && (
                <div className="absolute top-0 left-0 w-full h-full bg-red-500/10 pointer-events-none"></div>
              )}
              <div className="text-4xl sm:text-5xl md:text-6xl font-black text-black mb-4 text-center break-words w-full tracking-tighter leading-none relative z-10">
                {gameState?.currentEq?.display || 'Загрузка...'}{' '}
                <span className={`text-${themeColor}`}>=</span>
              </div>
              <div className="w-full sm:w-2/3 md:w-1/2 relative z-10 flex justify-center mb-6">
                <div
                  className={`w-full bg-white border-4 text-black text-4xl sm:text-5xl font-black text-center py-3 rounded-2xl md:rounded-3xl shadow-inner flex items-center justify-center min-h-[72px] sm:min-h-[80px] transition-colors ${
                    flashError ? 'border-pink-500' : 'border-neutral-200'
                  }`}
                >
                  {inputValue || <span className="text-neutral-300">?</span>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-sm relative z-10">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <KeyButton key={num} onClick={() => handleKeypadPress(num)}>
                    {num}
                  </KeyButton>
                ))}
                <KeyButton
                  onClick={() => handleKeypadPress('minus')}
                  className="text-neutral-500 bg-neutral-100"
                >
                  ±
                </KeyButton>
                <KeyButton onClick={() => handleKeypadPress('0')}>0</KeyButton>
                <KeyButton
                  onClick={() => handleKeypadPress('backspace')}
                  className="text-red-500 bg-red-50"
                >
                  <DeleteIcon size={32} />
                </KeyButton>
              </div>
            </div>
          </div>
        </div>

        {showTargetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-neutral-900 border-2 border-green-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl animate-pop-in">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 text-white rounded-full mb-6">
                <Crown size={40} />
              </div>
              <h2 className="text-3xl font-black text-white mb-2 uppercase">
                Цель достигнута!
              </h2>
              <p className="text-neutral-400 mb-8 font-medium">
                Уровень пройден. Забрать победу сейчас или доиграть время и
                побить рекорд?
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowTargetModal(false);
                    setIsPaused(false);
                    endGame(gameState);
                  }}
                  className="w-full py-4 bg-green-500 text-white rounded-2xl font-black text-xl hover:bg-green-400"
                >
                  Завершить уровень
                </button>
                <button
                  onClick={() => {
                    setShowTargetModal(false);
                    setIsPaused(false);
                  }}
                  className="w-full py-4 bg-transparent text-neutral-300 border border-neutral-700 rounded-2xl font-bold text-lg hover:bg-neutral-800 hover:text-white"
                >
                  Доиграть ({Math.floor((gameState?.timeLeft || 0) / 60)}:
                  {((gameState?.timeLeft || 0) % 60)
                    .toString()
                    .padStart(2, '0')}
                  )
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderResults = () => {
    const isC1 = gameMode === 'campaign1';
    const isC2 = gameMode === 'campaign2';
    const isCampaign = isC1 || isC2;
    const passed = isCampaign
      ? (gameState?.correct || 0) >= (gameState?.target || 0)
      : true;
    const timeLimit = isCampaign ? 120 : freeplaySettings?.timeLimit || 120;
    const minutes = timeLimit / 60;
    const safeCorrect = gameState?.correct || 0;
    const safeIncorrect = gameState?.incorrect || 0;
    const speed = minutes > 0 ? Math.round(safeCorrect / minutes) : safeCorrect;
    const accuracy =
      safeCorrect + safeIncorrect > 0
        ? Math.round((safeCorrect / (safeCorrect + safeIncorrect)) * 100)
        : 0;

    const getAnalysisText = () => {
      if (safeCorrect === 0 && safeIncorrect === 0)
        return 'Ты не решил ни одного примера. Попробуй действовать быстрее!';
      if (safeCorrect === 0)
        return 'Одни ошибки... Ничего страшного, математика требует тренировки!';
      if (safeIncorrect === 0)
        return 'Идеальная работа! Ни одной ошибки, ты настоящая машина.';
      return 'Неплохо, но ошибки отнимают драгоценное время. Будь внимательнее!';
    };

    return (
      <div className="min-h-[100dvh] bg-black text-white p-6 flex flex-col items-center py-12 pb-20">
        <div className="max-w-md md:max-w-2xl w-full space-y-8 animate-in fade-in duration-500">
          {gameState?.justRankedUp && (
            <div
              className={`bg-neutral-900 border ${
                getLeague(unlockedLevel1 || 1).border
              } p-6 rounded-3xl text-center rank-up-glow animate-pop-in relative overflow-hidden`}
            >
              <div
                className={`absolute inset-0 opacity-30 ${
                  getLeague(unlockedLevel1 || 1).bg
                }`}
              ></div>
              <div className="relative z-10">
                <div className="text-6xl mb-4">
                  {getRank(unlockedLevel1 || 1).icon}
                </div>
                <div
                  className={`${
                    getLeague(unlockedLevel1 || 1).color
                  } font-black text-xl uppercase tracking-widest mb-1`}
                >
                  Повышение!
                </div>
                <div className="text-white text-3xl font-black">
                  {getRank(unlockedLevel1 || 1).title}
                </div>
                <div className="text-neutral-400 text-sm font-bold mt-2">
                  {getLeague(unlockedLevel1 || 1).name}
                </div>
              </div>
            </div>
          )}
          <div className="text-center space-y-4">
            {isCampaign ? (
              passed ? (
                <>
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 text-white rounded-full mb-2 shadow-xl shadow-green-500/40">
                    <Crown size={48} />
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-green-400">
                    УРОВЕНЬ ПРОЙДЕН!
                  </h2>
                  <p className="text-neutral-300 text-lg">
                    Ты решил {safeCorrect} из {gameState?.target || 0}.
                  </p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500 text-white rounded-full mb-2 shadow-xl shadow-red-500/40">
                    <XCircle size={48} />
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-red-500">
                    ЭХ, ЧУТЬ-ЧУТЬ!
                  </h2>
                  <p className="text-neutral-300 text-lg">
                    Нужно {gameState?.target || 0}, а ты решил {safeCorrect}.
                  </p>
                </>
              )
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-400 text-black rounded-full mb-2 shadow-xl shadow-yellow-500/30">
                  <Trophy size={48} />
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-yellow-400">
                  ВРЕМЯ ВЫШЛО!
                </h2>
                <p className="text-neutral-300 text-lg">Хорошая тренировка.</p>
              </>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-500/20 border border-blue-400 p-4 rounded-3xl text-center animate-pop-in">
              <div className="text-xs text-blue-300 font-bold uppercase tracking-widest mb-1">
                Получено опыта
              </div>
              <div className="text-3xl md:text-4xl font-black text-blue-400">
                +{gameState?.earnedPoints || 0} XP
              </div>
            </div>
            <div className="bg-yellow-500/20 border border-yellow-400 p-4 rounded-3xl text-center animate-pop-in">
              <div className="text-xs text-yellow-600 font-bold uppercase tracking-widest mb-1">
                Получено монет
              </div>
              <div className="text-3xl md:text-4xl font-black text-yellow-400 flex items-center justify-center gap-2">
                +{gameState?.earnedCoins || 0} <CoinsIcon size={24} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-neutral-900 p-4 rounded-3xl border border-neutral-800 text-center">
              <div className="text-4xl font-black text-white mb-1">
                {safeCorrect}
              </div>
              <div className="text-xs text-neutral-500 font-bold uppercase">
                Правильных
              </div>
            </div>
            <div className="bg-neutral-900 p-4 rounded-3xl border border-neutral-800 text-center">
              <div className="text-4xl font-black text-white mb-1">
                {safeIncorrect}
              </div>
              <div className="text-xs text-neutral-500 font-bold uppercase">
                Ошибок
              </div>
            </div>
            <div className="bg-neutral-900 p-4 rounded-3xl border border-neutral-800 text-center">
              <div className="text-4xl font-black text-white mb-1">
                {speed} <span className="text-lg text-neutral-500">/м</span>
              </div>
              <div className="text-xs text-neutral-500 font-bold uppercase">
                Скорость
              </div>
            </div>
            <div className="bg-neutral-900 p-4 rounded-3xl border border-neutral-800 text-center">
              <div className="text-4xl font-black text-white mb-1">
                {accuracy}%
              </div>
              <div className="text-xs text-neutral-500 font-bold uppercase">
                Точность
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl">
            <h3 className="font-bold text-yellow-400 mb-2 flex items-center gap-2">
              <AlertTriangle size={18} /> Анализ:
            </h3>
            <p className="text-neutral-300">{getAnalysisText()}</p>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            {isCampaign ? (
              passed ? (
                <button
                  onClick={() => {
                    isC1
                      ? setSelectedLevel1(
                          Math.min(1000, (selectedLevel1 || 1) + 1)
                        )
                      : setSelectedLevel2(
                          Math.min(500, (selectedLevel2 || 1) + 1)
                        );
                    setView(isC1 ? 'campaign1' : 'campaign2');
                  }}
                  className={`w-full py-5 bg-green-500 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/30`}
                >
                  Следующий уровень <SkipForward fill="currentColor" />
                </button>
              ) : (
                <button
                  onClick={isC1 ? startCampaign1 : startCampaign2}
                  className={`w-full py-5 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-2 ${
                    isC1 ? 'bg-yellow-500 text-black' : 'bg-purple-600'
                  }`}
                >
                  <Zap fill="currentColor" /> Попробовать снова
                </button>
              )
            ) : (
              <button
                onClick={startFreeplay}
                className="w-full py-5 bg-yellow-400 text-black rounded-2xl font-black text-xl flex items-center justify-center gap-2"
              >
                <Zap fill="currentColor" /> Играть снова
              </button>
            )}
            <button
              onClick={() => setView('home')}
              className="w-full py-5 bg-transparent text-neutral-400 border border-neutral-800 rounded-2xl font-bold text-lg hover:bg-neutral-900"
            >
              В меню
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderGlobalLeaderboard = () => (
    <div className="min-h-[100dvh] bg-black text-white p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-6 pb-10">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
          >
            <ArrowLeft size={24} /> В меню
          </button>
        </div>
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-black text-white flex items-center justify-center gap-3">
            <Globe className="text-blue-400" size={40} /> Общий Рейтинг
          </h2>
          <p className="text-blue-400/80 font-medium mt-2">
            Лучшие умы со всей платформы
          </p>
        </div>
        <div className="bg-neutral-900 rounded-[2rem] p-4 sm:p-6 border border-neutral-800 shadow-xl overflow-hidden">
          {isLoadingLeaderboard ? (
            <div className="text-center py-20 text-yellow-400 font-bold animate-pulse">
              Загрузка данных Вселенной...
            </div>
          ) : globalProfiles.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 font-medium">
              Никто еще не начал свой путь. Стань первым!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-neutral-800 text-neutral-500 text-xs sm:text-sm uppercase tracking-wider">
                    <th className="p-3 font-bold w-12 text-center">#</th>
                    <th className="p-3 font-bold">Игрок</th>
                    <th className="p-3 font-bold text-center">Уровень</th>
                    <th className="p-3 font-bold text-center">Очки (XP)</th>
                    <th className="p-3 font-bold text-right">Класс</th>
                  </tr>
                </thead>
                <tbody>
                  {globalProfiles.map((student, idx) => {
                    const sRank = getRank(student.unlockedLevel || 1);
                    const sLeague = getLeague(student.unlockedLevel || 1);
                    const isMe =
                      user && student.username === user.email.split('@')[0];
                    const displayScore =
                      student.score !== undefined
                        ? student.score
                        : (student.unlockedLevel || 1) *
                          10 *
                          ((student.campaignPace || 10) / 5);
                    return (
                      <tr
                        key={student.username}
                        className={`border-b border-neutral-800/50 transition-colors ${
                          isMe ? 'bg-yellow-500/10' : 'hover:bg-neutral-800/30'
                        }`}
                      >
                        <td className="p-3 text-center font-black text-neutral-400 text-xl">
                          {idx === 0
                            ? '🥇'
                            : idx === 1
                            ? '🥈'
                            : idx === 2
                            ? '🥉'
                            : idx + 1}
                        </td>
                        <td className="p-3">
                          <div
                            className={`font-bold text-lg flex items-center gap-2 ${
                              isMe ? 'text-white' : 'text-yellow-400'
                            }`}
                          >
                            <span className="text-3xl mr-1">
                              {getAvatarIcon(student.avatar)}
                            </span>
                            <span className="text-xl hidden sm:inline">
                              {sRank.icon}
                            </span>{' '}
                            {student.username}{' '}
                            {isMe && (
                              <span className="text-[10px] bg-yellow-500 text-black px-2 py-1 rounded-full uppercase ml-2">
                                Ты
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-[10px] sm:text-xs font-bold mt-1 uppercase tracking-wide ml-12 sm:ml-16 ${sLeague.color}`}
                          >
                            {sLeague.name}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-neutral-300 font-bold">
                            {student.unlockedLevel}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center justify-center bg-blue-500/10 border border-blue-500/30 text-blue-400 font-black px-3 sm:px-4 py-1.5 rounded-full text-base sm:text-lg shadow-sm">
                            {displayScore.toLocaleString('ru-RU')}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          {student.className ? (
                            <span className="text-xs font-bold bg-neutral-800 text-neutral-300 px-3 py-1.5 rounded-lg whitespace-nowrap">
                              {student.className}
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-600">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="min-h-[100dvh] bg-black text-white p-6 flex flex-col font-sans">
      <div className="max-w-md md:max-w-3xl w-full mx-auto py-4 md:py-8 pb-10">
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-2 text-yellow-500 mb-6 font-bold"
        >
          <ArrowLeft size={24} /> Назад
        </button>
        <h2 className="text-3xl md:text-5xl font-black mb-8 text-white flex items-center gap-3">
          <HistoryIcon className="text-yellow-500" size={40} /> Архив
        </h2>
        {(history || []).length === 0 ? (
          <div className="text-center py-20 text-neutral-600 bg-neutral-900 rounded-[2rem] border border-neutral-800">
            <p className="text-lg font-medium">Тут пока пусто.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(history || []).map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-3xl border border-neutral-800 flex items-center justify-between ${
                  item.levelLabel === 'Высшая Школа'
                    ? 'bg-purple-900/10'
                    : 'bg-neutral-900'
                }`}
              >
                <div className="flex-1">
                  <div className="font-bold text-lg text-white mb-1">
                    {item.isCampaign && item.correct >= item.target
                      ? '✅ '
                      : item.isCampaign
                      ? '❌ '
                      : ''}
                    {item.mode}
                  </div>
                  <div
                    className={`text-xs font-bold mb-1 ${
                      item.levelLabel === 'Высшая Школа'
                        ? 'text-purple-400'
                        : 'text-yellow-500'
                    }`}
                  >
                    {item.levelLabel}
                  </div>
                  <div className="text-xs text-neutral-500">{item.date}</div>
                </div>
                <div className="text-right flex gap-6 ml-4">
                  <div className="text-center">
                    <div className="text-green-400 font-black text-2xl">
                      {item.correct}
                    </div>
                    <div className="text-[10px] text-neutral-500 uppercase font-bold">
                      Прав
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-400 font-black text-2xl">
                      {item.incorrect}
                    </div>
                    <div className="text-[10px] text-neutral-500 uppercase font-bold">
                      Ошиб
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-black min-h-[100dvh] text-white font-sans selection:bg-yellow-500/30 relative">
      {view === 'auth' && renderAuth()}
      {view === 'teacherCabinet' && renderTeacherCabinet()}
      {view === 'home' && renderHome()}
      {view === 'shop' && renderShop()}
      {view === 'raidBossSelect' && renderRaidBossSelect()}
      {view === 'raidSquadSelect' && renderRaidSquadSelect()}
      {view === 'raidGame' && renderRaidGame()}
      {view === 'globalLeaderboard' && renderGlobalLeaderboard()}
      {view === 'campaign1' && renderCampaignMenu(1)}
      {view === 'campaign2' && renderCampaignMenu(2)}
      {view === 'freeplay' && renderFreeplay()}
      {view === 'game' && renderGame()}
      {view === 'results' && renderResults()}
      {view === 'history' && renderHistory()}

      {rewardModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <div className="bg-neutral-900 border-2 border-yellow-500/50 rounded-[3rem] p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(234,179,8,0.2)] animate-pop-in">
            <div className="text-8xl mb-6 animate-bounce">
              {rewardModal.icon}
            </div>
            <h2 className="text-2xl font-bold text-neutral-400 mb-2 uppercase tracking-widest">
              {rewardModal.title}
            </h2>
            <div className="text-4xl font-black text-yellow-400 mb-8 leading-tight whitespace-pre-line">
              {rewardModal.reward}
            </div>
            <button
              onClick={() => setRewardModal(null)}
              className="w-full py-5 bg-yellow-400 text-black rounded-2xl font-black text-xl hover:bg-yellow-300 active:scale-95 shadow-xl shadow-yellow-500/20"
            >
              Супер!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- 5. ERROR BOUNDARY (ПРЕДОХРАНИТЕЛЬ ОТ БЕЛОГО ЭКРАНА) ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, errorInfo: error.message };
  }
  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary поймал ошибку:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] bg-black text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="text-6xl mb-4 animate-bounce">⚠️</div>
          <h2 className="text-4xl font-black mb-4 uppercase tracking-widest text-red-500">
            Сбой Матрицы
          </h2>
          <p className="text-neutral-400 mb-8 max-w-md">
            Произошла ошибка при расчетах.
            <br />
            Мы поймали её, чтобы игра не зависла.
            <br />
            <br />
            <span className="text-red-400 font-mono text-xs">
              {this.state.errorInfo}
            </span>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-xl shadow-lg shadow-red-500/20 hover:bg-red-500 active:scale-95 transition-all"
          >
            Перезагрузить систему
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AppWithBoundary() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
