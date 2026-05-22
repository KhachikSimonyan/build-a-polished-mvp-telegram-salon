const telegram = window.Telegram?.WebApp;

const translations = {
  en: {
    privateAppointments: "Private salon appointments",
    heroTitle: "Book your laser hair removal visit.",
    heroText:
      "A premium Heln booking experience for personal laser hair removal, consultations, and training.",
    todayMood: "Today's mood",
    moodValue: "Elena Arayi Studio",
    begin: "Begin booking",
    back: "Go back",
    stepService: "Step 1 of 3",
    stepSpecialist: "Step 2 of 3",
    stepTime: "Step 3 of 3",
    chooseService: "Choose a service",
    chooseSpecialist: "Choose your specialist",
    selectTime: "Select date and time",
    service: "Service",
    specialist: "Specialist",
    date: "Date",
    availableTimes: "Available times",
    name: "Your name",
    phone: "Phone",
    confirm: "Confirm appointment",
    reserving: "Reserving...",
    checking: "Checking available times...",
    booked: "booked",
    noSlots: "No available times for this specialist and service.",
    completeEveryDetail: "Please complete every detail before confirming.",
    alreadyBooked: "This time is already booked. Please choose another time.",
    error: "Something went wrong. Please try again from Telegram.",
    successEyebrow: "Appointment confirmed",
    successTitle: "Your beauty ritual is reserved.",
    sent: "A Telegram confirmation has been sent.",
    close: "Close"
  },
  hy: {
    privateAppointments: "Անձնական սրահի ամրագրումներ",
    heroTitle: "Ամրագրիր քո գեղեցկության ժամը։",
    heroText:
      "Գեղեցիկ և պրեմիում ամրագրման հոսք ժամանակակից գեղեցկության սրահների համար՝ հենց Telegram-ի ներսում։",
    todayMood: "Այսօրվա տրամադրությունը",
    moodValue: "նուրբ rose փայլ",
    begin: "Սկսել ամրագրումը",
    back: "Վերադառնալ",
    stepService: "Քայլ 1 / 3",
    stepSpecialist: "Քայլ 2 / 3",
    stepTime: "Քայլ 3 / 3",
    chooseService: "Ընտրիր ծառայությունը",
    chooseSpecialist: "Ընտրիր մասնագետին",
    selectTime: "Ընտրիր օրն ու ժամը",
    service: "Ծառայություն",
    specialist: "Մասնագետ",
    date: "Ամսաթիվ",
    availableTimes: "Ազատ ժամեր",
    name: "Անուն",
    phone: "Հեռախոս",
    confirm: "Հաստատել այցը",
    reserving: "Ամրագրում...",
    checking: "Ստուգում ենք ազատ ժամերը...",
    booked: "զբաղված",
    noSlots: "Այս մասնագետի համար ազատ ժամեր չկան։",
    completeEveryDetail: "Լրացրու բոլոր տվյալները ամրագրելու համար։",
    alreadyBooked: "Այս ժամը արդեն զբաղված է։ Ընտրիր ուրիշ ժամ։",
    error: "Ինչ-որ բան սխալ գնաց։ Փորձիր նորից Telegram-ից։",
    successEyebrow: "Այցը հաստատված է",
    successTitle: "Քո գեղեցկության ժամը ամրագրված է։",
    sent: "Telegram confirmation-ը ուղարկված է։",
    close: "Փակել"
  },
  ru: {
    privateAppointments: "Персональная запись в салон",
    heroTitle: "Забронируйте свой beauty-ритуал.",
    heroText:
      "Премиальный Telegram Mini App для салонов красоты: быстро, красиво и удобно для клиента.",
    todayMood: "Настроение дня",
    moodValue: "soft rose finish",
    begin: "Начать запись",
    back: "Назад",
    stepService: "Шаг 1 из 3",
    stepSpecialist: "Шаг 2 из 3",
    stepTime: "Шаг 3 из 3",
    chooseService: "Выберите услугу",
    chooseSpecialist: "Выберите специалиста",
    selectTime: "Выберите дату и время",
    service: "Услуга",
    specialist: "Специалист",
    date: "Дата",
    availableTimes: "Свободное время",
    name: "Ваше имя",
    phone: "Телефон",
    confirm: "Подтвердить запись",
    reserving: "Бронируем...",
    checking: "Проверяем свободное время...",
    booked: "занято",
    noSlots: "Нет свободного времени для этой услуги.",
    completeEveryDetail: "Заполните все данные перед подтверждением.",
    alreadyBooked: "Это время уже занято. Выберите другое.",
    error: "Что-то пошло не так. Попробуйте снова из Telegram.",
    successEyebrow: "Запись подтверждена",
    successTitle: "Ваш визит забронирован.",
    sent: "Подтверждение отправлено в Telegram.",
    close: "Закрыть"
  }
};

Object.assign(translations.hy, {
  privateAppointments: "Անձնական սրահի ամրագրումներ",
  heroTitle: "Ամրագրիր քո գեղեցկության ժամը։",
  heroText: "Գեղեցիկ և պրեմիում ամրագրման հոսք ժամանակակից գեղեցկության սրահների համար՝ հենց Telegram-ի ներսում։",
  todayMood: "Այսօրվա տրամադրությունը",
  moodValue: "նուրբ rose փայլ",
  begin: "Սկսել ամրագրումը",
  back: "Վերադառնալ",
  stepService: "Քայլ 1 / 3",
  stepSpecialist: "Քայլ 2 / 3",
  stepTime: "Քայլ 3 / 3",
  chooseService: "Ընտրիր ծառայությունը",
  chooseSpecialist: "Ընտրիր մասնագետին",
  selectTime: "Ընտրիր օրն ու ժամը",
  service: "Ծառայություն",
  specialist: "Մասնագետ",
  date: "Ամսաթիվ",
  availableTimes: "Ազատ ժամեր",
  name: "Անուն",
  phone: "Հեռախոս",
  confirm: "Հաստատել այցը",
  reserving: "Ամրագրում...",
  checking: "Ստուգում ենք ազատ ժամերը...",
  booked: "զբաղված",
  noSlots: "Այս մասնագետի համար ազատ ժամեր չկան։",
  completeEveryDetail: "Լրացրու բոլոր տվյալները ամրագրելու համար։",
  alreadyBooked: "Այս ժամը արդեն զբաղված է։ Ընտրիր ուրիշ ժամ։",
  error: "Ինչ-որ բան սխալ գնաց։ Փորձիր նորից Telegram-ից։",
  successEyebrow: "Այցը հաստատված է",
  successTitle: "Քո գեղեցկության ժամը ամրագրված է։",
  sent: "Telegram confirmation-ը ուղարկված է։",
  close: "Փակել"
});

Object.assign(translations.ru, {
  privateAppointments: "Персональная запись в салон",
  heroTitle: "Забронируйте свой beauty-ритуал.",
  heroText: "Премиальный Telegram Mini App для салонов красоты: быстро, красиво и удобно для клиента.",
  todayMood: "Настроение дня",
  begin: "Начать запись",
  back: "Назад",
  stepService: "Шаг 1 из 3",
  stepSpecialist: "Шаг 2 из 3",
  stepTime: "Шаг 3 из 3",
  chooseService: "Выберите услугу",
  chooseSpecialist: "Выберите специалиста",
  selectTime: "Выберите дату и время",
  service: "Услуга",
  specialist: "Специалист",
  date: "Дата",
  availableTimes: "Свободное время",
  name: "Ваше имя",
  phone: "Телефон",
  confirm: "Подтвердить запись",
  reserving: "Бронируем...",
  checking: "Проверяем свободное время...",
  booked: "занято",
  noSlots: "Нет свободного времени для этой услуги.",
  completeEveryDetail: "Заполните все данные перед подтверждением.",
  alreadyBooked: "Это время уже занято. Выберите другое.",
  error: "Что-то пошло не так. Попробуйте снова из Telegram.",
  successEyebrow: "Запись подтверждена",
  successTitle: "Ваш визит забронирован.",
  sent: "Подтверждение отправлено в Telegram.",
  close: "Закрыть"
});

Object.assign(translations.hy, {
  privateAppointments: "Անձնական սրահի ամրագրումներ",
  heroTitle: "Ամրագրիր քո գեղեցկության ժամը։",
  heroText:
    "Պրեմիում Telegram Mini App գեղեցկության սրահների համար՝ արագ, նուրբ և հարմար ամրագրման փորձով։",
  todayMood: "Այսօրվա տրամադրությունը",
  moodValue: "նուրբ վարդագույն փայլ",
  begin: "Սկսել ամրագրումը",
  back: "Վերադառնալ",
  stepService: "Քայլ 1 / 3",
  stepSpecialist: "Քայլ 2 / 3",
  stepTime: "Քայլ 3 / 3",
  chooseService: "Ընտրիր ծառայությունը",
  chooseSpecialist: "Ընտրիր մասնագետին",
  selectTime: "Ընտրիր օրը և ժամը",
  service: "Ծառայություն",
  specialist: "Մասնագետ",
  date: "Ամսաթիվ",
  availableTimes: "Ազատ ժամեր",
  name: "Քո անունը",
  phone: "Հեռախոս",
  confirm: "Հաստատել այցը",
  reserving: "Ամրագրում ենք...",
  checking: "Ստուգում ենք ազատ ժամերը...",
  booked: "զբաղված",
  noSlots: "Այս մասնագետի համար այդ օրը ազատ ժամեր չկան։",
  completeEveryDetail: "Լրացրու բոլոր տվյալները՝ ամրագրումը հաստատելու համար։",
  alreadyBooked: "Այս ժամը արդեն զբաղված է։ Ընտրիր ուրիշ ժամ։",
  error: "Ինչ-որ բան սխալ գնաց։ Փորձիր նորից Telegram-ից։",
  successEyebrow: "Այցը հաստատված է",
  successTitle: "Քո գեղեցկության ժամը ամրագրված է։",
  sent: "Telegram հաստատումը ուղարկվել է։",
  close: "Փակել"
});

Object.assign(translations.ru, {
  privateAppointments: "Персональная запись в салон",
  heroTitle: "Забронируйте свой beauty-ритуал.",
  heroText:
    "Премиальный Telegram Mini App для салонов красоты: быстро, красиво и удобно для клиента.",
  todayMood: "Настроение дня",
  moodValue: "нежный розовый блеск",
  begin: "Начать запись",
  back: "Назад",
  stepService: "Шаг 1 из 3",
  stepSpecialist: "Шаг 2 из 3",
  stepTime: "Шаг 3 из 3",
  chooseService: "Выберите услугу",
  chooseSpecialist: "Выберите специалиста",
  selectTime: "Выберите дату и время",
  service: "Услуга",
  specialist: "Специалист",
  date: "Дата",
  availableTimes: "Свободное время",
  name: "Ваше имя",
  phone: "Телефон",
  confirm: "Подтвердить запись",
  reserving: "Бронируем...",
  checking: "Проверяем свободное время...",
  booked: "занято",
  noSlots: "На этот день нет свободного времени.",
  completeEveryDetail: "Заполните все данные перед подтверждением.",
  alreadyBooked: "Это время уже занято. Выберите другое.",
  error: "Что-то пошло не так. Попробуйте снова из Telegram.",
  successEyebrow: "Запись подтверждена",
  successTitle: "Ваш визит забронирован.",
  sent: "Подтверждение отправлено в Telegram.",
  close: "Закрыть"
});

Object.assign(translations.hy, {
  privateAppointments: "Անձնական սրահի ամրագրումներ",
  heroTitle: "Ամրագրիր քո գեղեցկության ժամը։",
  heroText:
    "Պրեմիում Telegram Mini App գեղեցկության սրահների համար՝ արագ, նուրբ և հարմար ամրագրման փորձով։",
  todayMood: "Այսօրվա տրամադրությունը",
  moodValue: "նուրբ վարդագույն փայլ",
  begin: "Սկսել ամրագրումը",
  back: "Վերադառնալ",
  stepService: "Քայլ 1 / 3",
  stepSpecialist: "Քայլ 2 / 3",
  stepTime: "Քայլ 3 / 3",
  chooseService: "Ընտրիր ծառայությունը",
  chooseSpecialist: "Ընտրիր մասնագետին",
  selectTime: "Ընտրիր օրը և ժամը",
  service: "Ծառայություն",
  specialist: "Մասնագետ",
  date: "Ամսաթիվ",
  availableTimes: "Ազատ ժամեր",
  name: "Քո անունը",
  phone: "Հեռախոս",
  confirm: "Հաստատել այցը",
  reserving: "Ամրագրում ենք...",
  checking: "Ստուգում ենք ազատ ժամերը...",
  booked: "զբաղված",
  noSlots: "Այս մասնագետի համար այդ օրը ազատ ժամեր չկան։",
  completeEveryDetail: "Լրացրու բոլոր տվյալները՝ ամրագրումը հաստատելու համար։",
  alreadyBooked: "Այս ժամը արդեն զբաղված է։ Ընտրիր ուրիշ ժամ։",
  error: "Ինչ-որ բան սխալ գնաց։ Փորձիր նորից Telegram-ից։",
  successEyebrow: "Այցը հաստատված է",
  successTitle: "Քո գեղեցկության ժամը ամրագրված է։",
  sent: "Telegram հաստատումը ուղարկվել է։",
  close: "Փակել"
});

Object.assign(translations.ru, {
  privateAppointments: "Персональная запись в салон",
  heroTitle: "Забронируйте свой beauty-ритуал.",
  heroText:
    "Премиальный Telegram Mini App для салонов красоты: быстро, красиво и удобно для клиента.",
  todayMood: "Настроение дня",
  moodValue: "нежный розовый блеск",
  begin: "Начать запись",
  back: "Назад",
  stepService: "Шаг 1 из 3",
  stepSpecialist: "Шаг 2 из 3",
  stepTime: "Шаг 3 из 3",
  chooseService: "Выберите услугу",
  chooseSpecialist: "Выберите специалиста",
  selectTime: "Выберите дату и время",
  service: "Услуга",
  specialist: "Специалист",
  date: "Дата",
  availableTimes: "Свободное время",
  name: "Ваше имя",
  phone: "Телефон",
  confirm: "Подтвердить запись",
  reserving: "Бронируем...",
  checking: "Проверяем свободное время...",
  booked: "занято",
  noSlots: "На этот день нет свободного времени.",
  completeEveryDetail: "Заполните все данные перед подтверждением.",
  alreadyBooked: "Это время уже занято. Выберите другое.",
  error: "Что-то пошло не так. Попробуйте снова из Telegram.",
  successEyebrow: "Запись подтверждена",
  successTitle: "Ваш визит забронирован.",
  sent: "Подтверждение отправлено в Telegram.",
  close: "Закрыть"
});

let services = [
  {
    id: "haircut-styling",
    name: "Haircut & Styling",
    description: "Shape, movement, and a refined finish for everyday polish.",
    durationMinutes: 60,
    icon: "HS"
  },
  {
    id: "manicure",
    name: "Manicure",
    description: "Detailed nail care with a glossy Maison Rose finish.",
    durationMinutes: 45,
    icon: "MN"
  },
  {
    id: "facial-treatment",
    name: "Facial Treatment",
    description: "A calm skin reset with glow-focused care.",
    durationMinutes: 75,
    icon: "FT"
  },
  {
    id: "hair-coloring",
    name: "Hair Coloring",
    description: "Dimensional color, soft shine, and tailored tone work.",
    durationMinutes: 120,
    icon: "HC"
  }
];

let specialists = [
  {
    id: "emily-rose",
    name: "Emily Rose",
    role: "Senior Stylist",
    note: "Precision cuts, soft waves, and signature blowouts.",
    icon: "ER"
  },
  {
    id: "sophia-martin",
    name: "Sophia Martin",
    role: "Nail Artist",
    note: "Minimal, clean, high-gloss manicures.",
    icon: "SM"
  },
  {
    id: "lily-anderson",
    name: "Lily Anderson",
    role: "Skincare Expert",
    note: "Hydration rituals and luminous skin treatments. Monday is her reset day.",
    icon: "LA"
  },
  {
    id: "ava-bennett",
    name: "Ava Bennett",
    role: "Color Specialist",
    note: "Soft brunettes, rose tones, and champagne blondes.",
    icon: "AB"
  }
];

const state = {
  step: 0,
  language: localStorage.getItem("maisonRoseLanguage") || "en",
  service: null,
  specialist: null,
  date: "",
  time: "",
  slots: [],
  availabilityLoading: false,
  settings: {
    salonName: "Heln",
    branchName: "Elena Arayi Studio",
    brandColor: "#064127",
    accentColor: "#d7b84f",
    heroTitle: "Ամրագրիր քո լազերային մազահեռացման այցը",
    heroText: "Պրեմիում, անհատական եւ անվտանգ մոտեցում՝ Heln գեղեցկության ստուդիայում։",
    heroImageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=85"
  }
};

let availabilityRequestId = 0;

const hero = document.querySelector('[data-step="0"]');
const bookingPanel = document.querySelector('[data-step="1"]');
const successPanel = document.querySelector("#successPanel");
const stepTitle = document.querySelector("#stepTitle");
const stepKicker = document.querySelector("#stepKicker");
const serviceStep = document.querySelector("#serviceStep");
const specialistStep = document.querySelector("#specialistStep");
const timeStep = document.querySelector("#timeStep");
const serviceCards = document.querySelector("#serviceCards");
const specialistCards = document.querySelector("#specialistCards");
const timeSlotContainer = document.querySelector("#timeSlots");
const bookingSummary = document.querySelector("#bookingSummary");
const dateInput = document.querySelector("#dateInput");
const clientNameInput = document.querySelector("#clientName");
const phoneInput = document.querySelector("#phone");
const errorMessage = document.querySelector("#errorMessage");
const submitButton = document.querySelector("#submitBooking");
const progressDots = document.querySelectorAll(".progress-dot");

telegram?.ready();
telegram?.expand();
telegram?.setHeaderColor("#fff2f3");
telegram?.setBackgroundColor("#fff8f4");

document.querySelector("#startBooking").addEventListener("click", () => {
  state.step = 1;
  renderStep();
});

document.querySelector("#backButton").addEventListener("click", () => {
  state.step = state.step <= 1 ? 0 : state.step - 1;
  renderStep();
});

document.querySelector("#closeApp").addEventListener("click", () => {
  if (telegram) {
    telegram.close();
    return;
  }

  state.step = 0;
  successPanel.classList.add("hidden");
  hero.classList.remove("hidden");
});

dateInput.addEventListener("change", (event) => {
  state.date = event.target.value;
  state.time = "";
  loadAvailability();
});

submitButton.addEventListener("click", submitBooking);
dateInput.addEventListener("input", enforceWorkingDate);

function t(key) {
  return translations[state.language][key] || translations.en[key] || key;
}

function renderLanguageSwitch() {
  document.querySelectorAll("[data-language-switch]").forEach((container) => {
    container.innerHTML = ["en", "hy", "ru"]
      .map(
        (language) => `
          <button class="language-chip ${state.language === language ? "active" : ""}" data-language="${language}">
            ${language.toUpperCase()}
          </button>
        `
      )
      .join("");

    container.querySelectorAll("[data-language]").forEach((button) => {
      button.addEventListener("click", () => {
        state.language = button.dataset.language;
        localStorage.setItem("maisonRoseLanguage", state.language);
        renderStep();
      });
    });
  });
}

function renderStaticText() {
  const salonName = state.settings.salonName || "Maison Rose";
  const branchName = state.settings.branchName || t("moodValue");
  document.documentElement.lang = state.language === "hy" ? "hy" : state.language;
  document.body.dataset.language = state.language;
  document.title = `${salonName} Booking`;
  document.querySelectorAll(".brand-row").forEach((row) => {
    const mark = row.querySelector(".brand-mark");
    const label = row.querySelector("span:not(.brand-mark)");
    if (mark) mark.textContent = getBrandInitials(salonName);
    if (label) label.textContent = salonName;
  });
  document.querySelector("[data-i18n='privateAppointments']").textContent = t("privateAppointments");
  document.querySelector("[data-i18n='heroTitle']").textContent = state.settings.heroTitle || t("heroTitle");
  document.querySelector("[data-i18n='heroText']").textContent = state.settings.heroText || t("heroText");
  document.querySelector("[data-i18n='todayMood']").textContent = t("todayMood");
  document.querySelector("[data-i18n='moodValue']").textContent = branchName;
  document.querySelector("#startBooking").textContent = t("begin");
  document.querySelector("#backButton").setAttribute("aria-label", t("back"));
  document.querySelector("[data-i18n='date']").textContent = t("date");
  document.querySelector("[data-i18n='availableTimes']").textContent = t("availableTimes");
  document.querySelector("[data-i18n='clientName']").textContent = t("name");
  document.querySelector("[data-i18n='phone']").textContent = t("phone");
  document.querySelector("[data-i18n='successEyebrow']").textContent = t("successEyebrow");
  document.querySelector("[data-i18n='successTitle']").textContent = t("successTitle");
  document.querySelector("#closeApp").textContent = t("close");
  submitButton.textContent = t("confirm");
  applyBrandTheme();
}

function applyBrandTheme() {
  const brandColor = normalizeHexColor(state.settings.brandColor, "#b76e79");
  const accentColor = normalizeHexColor(state.settings.accentColor, "#dcc08c");
  document.documentElement.style.setProperty("--rose-500", brandColor);
  document.documentElement.style.setProperty("--rose-700", shadeColor(brandColor, -24));
  document.documentElement.style.setProperty("--rose-900", shadeColor(brandColor, -55));
  document.documentElement.style.setProperty("--rose-300", shadeColor(brandColor, 42));
  document.documentElement.style.setProperty("--rose-100", shadeColor(brandColor, 82));
  document.documentElement.style.setProperty("--page-start", shadeColor(brandColor, 90));
  document.documentElement.style.setProperty("--page-mid", shadeColor(brandColor, 84));
  document.documentElement.style.setProperty("--page-end", shadeColor(accentColor, 62));
  document.documentElement.style.setProperty("--champagne", accentColor);
  document.documentElement.style.setProperty("--hero-image", `url("${sanitizeCssUrl(state.settings.heroImageUrl)}")`);
  telegram?.setHeaderColor?.(shadeColor(brandColor, 82));
  telegram?.setBackgroundColor?.(shadeColor(brandColor, 88));
}

function getBrandInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "MR";
}

function normalizeHexColor(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(value || "") ? value : fallback;
}

function shadeColor(hex, percent) {
  const normalized = normalizeHexColor(hex, "#b76e79").slice(1);
  const number = parseInt(normalized, 16);
  const amount = Math.round(2.55 * percent);
  const red = Math.max(0, Math.min(255, (number >> 16) + amount));
  const green = Math.max(0, Math.min(255, ((number >> 8) & 0x00ff) + amount));
  const blue = Math.max(0, Math.min(255, (number & 0x0000ff) + amount));
  return `#${(0x1000000 + red * 0x10000 + green * 0x100 + blue).toString(16).slice(1)}`;
}

function sanitizeCssUrl(value) {
  const fallback = "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80";
  const url = String(value || "").trim();
  if (!url || !/^https?:\/\//i.test(url)) return fallback;
  return url.replaceAll('"', "%22");
}

function renderCards() {
  const availableSpecialists = specialists.filter(
    (specialist) => specialist.active !== false && specialist.serviceIds?.includes(state.service?.id)
  );

  serviceCards.innerHTML = services
    .map(
      (service) => `
        <button class="select-card ${state.service?.id === service.id ? "selected" : ""}" data-service-id="${service.id}">
          <span class="card-icon ${service.imageUrl ? "has-image" : ""}" ${
            service.imageUrl ? `style="background-image:url('${service.imageUrl.replaceAll("'", "%27")}')"` : ""
          }>${service.imageUrl ? "" : service.icon}</span>
          <span>
            <h3>${service.name}</h3>
            <p>${service.description} ${service.durationMinutes} min.</p>
          </span>
          <span class="card-arrow">&rsaquo;</span>
        </button>
      `
    )
    .join("");

  specialistCards.innerHTML = availableSpecialists.length
    ? availableSpecialists
        .map(
          (specialist) => `
        <button class="select-card ${state.specialist?.id === specialist.id ? "selected" : ""}" data-specialist-id="${specialist.id}">
          <span class="card-icon">${specialist.icon}</span>
          <span>
            <h3>${specialist.name} - ${specialist.role}</h3>
            <p>${specialist.note}</p>
          </span>
          <span class="card-arrow">&rsaquo;</span>
        </button>
      `
        )
        .join("")
    : `<p class="availability-note">No active specialist is assigned to this service yet.</p>`;

  serviceCards.querySelectorAll("[data-service-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.service = services.find((service) => service.id === button.dataset.serviceId);
      state.specialist = null;
      state.time = "";
      state.slots = [];
      state.step = 2;
      renderStep();
    });
  });

  specialistCards.querySelectorAll("[data-specialist-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.specialist = specialists.find((specialist) => specialist.id === button.dataset.specialistId);
      state.time = "";
      state.slots = [];
      state.step = 3;
      applyDateRules();
      renderStep();
    });
  });
}

function renderTimeSlots() {
  if (state.availabilityLoading) {
    timeSlotContainer.innerHTML = `<p class="availability-note">${t("checking")}</p>`;
    return;
  }

  if (!state.slots.length) {
    timeSlotContainer.innerHTML = `<p class="availability-note">${t("noSlots")}</p>`;
    return;
  }

  timeSlotContainer.innerHTML = state.slots
    .map((slot) => {
      const label = slot.available ? `${slot.time}-${slot.endTime}` : `${slot.time} ${t("booked")}`;

      return `
        <button class="time-chip ${state.time === slot.time ? "selected" : ""} ${slot.available ? "" : "booked"}" data-time="${slot.time}" ${slot.available ? "" : "disabled"}>
          ${label}
        </button>
      `;
    })
    .join("");

  timeSlotContainer.querySelectorAll("[data-time]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) {
        return;
      }

      state.time = button.dataset.time;
      renderTimeSlots();
    });
  });
}

function renderStep() {
  renderLanguageSwitch();
  renderStaticText();

  hero.classList.toggle("hidden", state.step !== 0);
  bookingPanel.classList.toggle("hidden", state.step === 0);
  successPanel.classList.add("hidden");
  errorMessage.textContent = "";

  serviceStep.classList.toggle("hidden", state.step !== 1);
  specialistStep.classList.toggle("hidden", state.step !== 2);
  timeStep.classList.toggle("hidden", state.step !== 3);

  progressDots.forEach((dot, index) => {
    dot.classList.toggle("active", index < state.step);
  });

  if (state.step === 1) {
    stepKicker.textContent = t("stepService");
    stepTitle.textContent = t("chooseService");
  }

  if (state.step === 2) {
    stepKicker.textContent = t("stepSpecialist");
    stepTitle.textContent = t("chooseSpecialist");
  }

  if (state.step === 3) {
    stepKicker.textContent = t("stepTime");
    stepTitle.textContent = t("selectTime");
    bookingSummary.innerHTML = `
      <div>
        <small>${t("service")}</small>
        <strong>${state.service.name}</strong>
      </div>
      <div>
        <small>${t("specialist")}</small>
        <strong>${state.specialist.name}</strong>
      </div>
    `;
    renderTimeSlots();
    loadAvailability();
  }

  renderCards();
}

async function loadAvailability() {
  if (!state.service?.id || !state.specialist?.id || !state.date) {
    return;
  }

  const requestId = availabilityRequestId + 1;
  availabilityRequestId = requestId;
  state.availabilityLoading = true;
  renderTimeSlots();

  try {
    const params = new URLSearchParams({
      serviceId: state.service.id,
      specialistId: state.specialist.id,
      date: state.date
    });
    const response = await fetch(`/api/availability?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.detail || "Could not load availability.");
    }

    if (requestId !== availabilityRequestId) {
      return;
    }

    state.slots = data.slots || [];

    const selectedSlot = state.slots.find((slot) => slot.time === state.time);
    if (!selectedSlot?.available) {
      state.time = "";
    }
  } catch (error) {
    if (requestId !== availabilityRequestId) {
      return;
    }

    errorMessage.textContent = error.message || t("error");
  } finally {
    if (requestId === availabilityRequestId) {
      state.availabilityLoading = false;
      renderTimeSlots();
    }
  }
}

async function loadCatalog() {
  try {
    const response = await fetch("/api/catalog");
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.detail || "Could not load catalog.");
    }

    services = (data.services || [])
      .filter((service) => service.active !== false)
      .map((service) => ({
        ...service,
        description: getServiceDescription(service.id),
        icon: service.icon || getServiceIcon(service.id),
        imageUrl: service.imageUrl || ""
      }));
    specialists = (data.specialists || []).map((specialist) => ({
      ...specialist,
      note: getSpecialistNote(specialist.id),
      icon: getSpecialistIcon(specialist.name)
    }));
    state.settings = {
      ...state.settings,
      ...(data.settings || {})
    };
    renderStep();
  } catch (error) {
    errorMessage.textContent = error.message || t("error");
  }
}

function getServiceDescription(id) {
  const descriptions = {
    "haircut-styling": "Լազերային մազահեռացում կանանց համար՝ նուրբ, անվտանգ եւ անհատական։",
    manicure: "Լազերային մազահեռացում տղամարդկանց համար՝ անհատական մոտեցմամբ։",
    "facial-treatment": "Անհատական խորհրդատվություն՝ ճիշտ փաթեթը ընտրելու համար։",
    "hair-coloring": "Մասնագիտական դասընթաց եւ սերտիֆիկացում Heln մոտեցմամբ։"
  };
  return descriptions[id] || "Պրեմիում ծառայություն՝ անհատական մոտեցմամբ։";
}

function getServiceIcon(id) {
  const icons = {
    "haircut-styling": "HS",
    manicure: "MN",
    "facial-treatment": "FT",
    "hair-coloring": "HC"
  };
  return icons[id] || "HL";
}

function getSpecialistNote(id) {
  const notes = {
    "emily-rose": "Բացառիկ անհատական մոտեցում, անվտանգ տեխնոլոգիա եւ նուրբ արդյունք։",
    "sophia-martin": "Minimal, clean, high-gloss manicures.",
    "lily-anderson": "Hydration rituals and luminous skin treatments.",
    "ava-bennett": "Soft brunettes, rose tones, and champagne blondes."
  };
  return notes[id] || "Heln վստահելի մասնագետ։";
}

function getSpecialistIcon(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function applyDateRules() {
  dateInput.min = getTomorrowValue();
  enforceWorkingDate();
}

function enforceWorkingDate() {
  if (!state.specialist?.schedule || !dateInput.value) {
    return;
  }

  const selectedDate = new Date(`${dateInput.value}T12:00:00`);
  const daysOff = new Set(state.specialist.schedule.daysOff || []);
  if (daysOff.has(selectedDate.getDay())) {
    const nextDate = findNextWorkingDate(selectedDate, daysOff);
    dateInput.value = toDateInputValue(nextDate);
  }

  state.date = dateInput.value;
}

function findNextWorkingDate(fromDate, daysOff) {
  const nextDate = new Date(fromDate);
  for (let index = 0; index < 14; index += 1) {
    if (!daysOff.has(nextDate.getDay()) && toDateInputValue(nextDate) >= getTomorrowValue()) {
      return nextDate;
    }
    nextDate.setDate(nextDate.getDate() + 1);
  }
  return fromDate;
}

async function submitBooking() {
  const payload = {
    clientName: clientNameInput.value.trim(),
    phone: phoneInput.value.trim(),
    serviceId: state.service?.id,
    specialistId: state.specialist?.id,
    date: dateInput.value,
    time: state.time
  };

  const missing = Object.entries(payload).find(([, value]) => !value);
  if (missing) {
    errorMessage.textContent = t("completeEveryDetail");
    telegram?.HapticFeedback?.notificationOccurred("error");
    return;
  }

  const selectedSlot = state.slots.find((slot) => slot.time === payload.time);
  if (!selectedSlot?.available) {
    errorMessage.textContent = t("alreadyBooked");
    telegram?.HapticFeedback?.notificationOccurred("error");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = t("reserving");
  errorMessage.textContent = "";

  try {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-telegram-init-data": telegram?.initData || ""
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.detail || "Booking could not be completed.");
    }

    showSuccess(data.booking);
  } catch (error) {
    errorMessage.textContent = error.message || t("error");
    await loadAvailability();
    telegram?.HapticFeedback?.notificationOccurred("error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = t("confirm");
  }
}

function showSuccess(booking) {
  telegram?.HapticFeedback?.notificationOccurred("success");
  hero.classList.add("hidden");
  bookingPanel.classList.add("hidden");
  successPanel.classList.remove("hidden");

  document.querySelector("#successText").textContent =
    `${booking.serviceName} with ${booking.specialistName} on ${formatDate(booking.date)} at ${booking.time}-${booking.endTime}. ${t("sent")}`;
}

function formatDate(value) {
  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(state.language === "hy" ? "hy-AM" : state.language, {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(date);
}

function setDefaultDate() {
  const value = getTomorrowValue();
  dateInput.min = value;
  dateInput.value = value;
  state.date = value;
}

function getTomorrowValue() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toDateInputValue(tomorrow);
}

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

setDefaultDate();
renderStep();
loadCatalog();
