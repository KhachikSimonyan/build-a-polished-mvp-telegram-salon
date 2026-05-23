const loginPanel = document.querySelector("#adminLogin");
const dashboard = document.querySelector("#adminDashboard");
const passwordInput = document.querySelector("#adminPassword");
const loginButton = document.querySelector("#loginButton");
const loginError = document.querySelector("#loginError");
const bookingList = document.querySelector("#bookingList");
const statsGrid = document.querySelector("#statsGrid");
const filters = document.querySelector("#adminFilters");
const staffSchedules = document.querySelector("#staffSchedules");
const createSpecialistForm = document.querySelector("#createSpecialistForm");
const newSpecialistService = document.querySelector("#newSpecialistService");
const newSpecialistName = document.querySelector("#newSpecialistName");
const newSpecialistRole = document.querySelector("#newSpecialistRole");
const newSpecialistStart = document.querySelector("#newSpecialistStart");
const newSpecialistEnd = document.querySelector("#newSpecialistEnd");
const createServiceForm = document.querySelector("#createServiceForm");
const serviceAdminList = document.querySelector("#serviceAdminList");
const newServiceName = document.querySelector("#newServiceName");
const newServiceDuration = document.querySelector("#newServiceDuration");
const newServiceIcon = document.querySelector("#newServiceIcon");
const newServiceImageUrl = document.querySelector("#newServiceImageUrl");
const newServiceImageUpload = document.querySelector("#newServiceImageUpload");
const specialistModal = document.querySelector("#specialistModal");
const removeSpecialistModal = document.querySelector("#removeSpecialistModal");
const removeSpecialistForm = document.querySelector("#removeSpecialistForm");
const removeSpecialistSelect = document.querySelector("#removeSpecialistSelect");
const adminToast = document.querySelector("#adminToast");
const settingsForm = document.querySelector("#settingsForm");
const analyticsGrid = document.querySelector("#analyticsGrid");
const refreshAnalyticsButton = document.querySelector("#refreshAnalytics");
const calendarDate = document.querySelector("#calendarDate");
const calendarBoard = document.querySelector("#calendarBoard");
const manualBookingForm = document.querySelector("#manualBookingForm");
const manualClientName = document.querySelector("#manualClientName");
const manualPhone = document.querySelector("#manualPhone");
const manualService = document.querySelector("#manualService");
const manualSpecialist = document.querySelector("#manualSpecialist");
const manualDate = document.querySelector("#manualDate");
const manualTime = document.querySelector("#manualTime");
const exceptionForm = document.querySelector("#exceptionForm");
const exceptionSpecialist = document.querySelector("#exceptionSpecialist");
const exceptionDate = document.querySelector("#exceptionDate");
const exceptionDayOff = document.querySelector("#exceptionDayOff");
const exceptionStart = document.querySelector("#exceptionStart");
const exceptionEnd = document.querySelector("#exceptionEnd");
const exceptionNote = document.querySelector("#exceptionNote");
const exceptionList = document.querySelector("#exceptionList");
const noteForm = document.querySelector("#noteForm");
const noteClientName = document.querySelector("#noteClientName");
const notePhone = document.querySelector("#notePhone");
const noteText = document.querySelector("#noteText");
const noteList = document.querySelector("#noteList");
const loadRemindersButton = document.querySelector("#loadReminders");
const reminderList = document.querySelector("#reminderList");
const adminLanguageSwitch = document.querySelector("#adminLanguageSwitch");
const syncGoogleSheetButton = document.querySelector("#syncGoogleSheet");
const googleSheetStatus = document.querySelector("#googleSheetStatus");
const googleSheetTitle = document.querySelector("#googleSheetTitle");
const googleSheetHelp = document.querySelector("#googleSheetHelp");
const heroImageUpload = document.querySelector("#heroImageUpload");

let adminPassword = sessionStorage.getItem("maisonRoseAdminPassword") || "";
let adminLanguage = localStorage.getItem("maisonRoseAdminLanguage") || "en";
let bookings = [];
let services = [];
let specialists = [];
let exceptions = [];
let notes = [];
let settings = {};
let googleSheetState = null;
let activeFilter = "all";
let toastTimer;
const adminSectionStateKey = "maisonRoseAdminSections";

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayLabelsByLanguage = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  hy: ["Կիր", "Երկ", "Երք", "Չրք", "Հնգ", "Ուրբ", "Շբթ"]
};

const adminTranslations = {
  en: {
    refresh: "Refresh",
    logout: "Log out",
    opening: "Opening...",
    refreshing: "Refreshing...",
    loading: "Loading...",
    saving: "Saving...",
    adding: "Adding...",
    creating: "Creating...",
    removing: "Removing...",
    deleting: "Deleting...",
    dashboardRefreshed: "Dashboard refreshed.",
    loggedOut: "Logged out.",
    headerTitle: "Salon daybook",
    headerText: "A calm owner view for today's appointments, client details, and quick booking status updates.",
    ownerAccess: "Owner access",
    adminPassword: "Admin password",
    enterPassword: "Enter password",
    openDashboard: "Open dashboard",
    salonProfile: "Salon profile",
    salonProfileNote: "Change the client demo name, colors, cover image, deposit and reminder settings.",
    salonName: "Salon name",
    branch: "Branch",
    phone: "Phone",
    address: "Address",
    instagram: "Instagram",
    brandColor: "Brand color",
    accentColor: "Accent color",
    heroTitle: "Hero title",
    heroText: "Hero text",
    heroImageUrl: "Hero image URL",
    imageUrl: "Image URL",
    uploadHeroImage: "Upload hero image from device",
    uploadServiceImage: "Upload service image from device",
    chooseImage: "Choose image",
    noImageChosen: "No image selected",
    requireDeposit: "Require deposit",
    depositAmount: "Deposit amount",
    reminderMessages: "Reminder messages",
    reminderHoursBefore: "Reminder hours before",
    saveSalonProfile: "Save salon profile",
    analytics: "Analytics",
    refreshAnalytics: "Refresh analytics",
    calendarView: "Calendar view",
    day: "Day",
    manualBooking: "Manual booking",
    manualBookingNote: "Use this for phone or Instagram bookings.",
    clientName: "Client name",
    service: "Service",
    specialist: "Specialist",
    date: "Date",
    time: "Time",
    addManualBooking: "Add manual booking",
    availabilityExceptions: "Availability exceptions",
    availabilityExceptionsNote: "Special vacation days or one-day custom hours.",
    dayOff: "Day off",
    start: "Start",
    end: "End",
    note: "Note",
    addException: "Add exception",
    clientNotes: "Client notes",
    clientNotesNote: "Private owner notes for repeat clients.",
    addNote: "Add note",
    reminderPreview: "Reminder preview",
    loadReminderCandidates: "Load reminder candidates",
    serviceCategories: "Service categories",
    serviceCategoriesNote: "Manage service names and durations used in the booking flow.",
    serviceName: "Service name",
    durationMinutes: "Duration minutes",
    addService: "Add service",
    staffSchedules: "Staff schedules",
    addSpecialist: "Add specialist",
    removeSpecialist: "Remove specialist",
    staffNote: "Each service category has its own specialists. Change hours inside the category card.",
    bookings: "Bookings",
    all: "All",
    today: "Today",
    tomorrow: "Tomorrow",
    upcoming: "Upcoming",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    noShow: "No-show",
    category: "Category",
    appointment: "appointment",
    noActiveSpecialists: "No active specialists in this category yet.",
    active: "active",
    name: "Name",
    role: "Role",
    saveChanges: "Save changes",
    save: "Save",
    hide: "Hide",
    restore: "Restore",
    delete: "Delete",
    complete: "Complete",
    cancel: "Cancel",
    reschedule: "Reschedule",
    noBookings: "No bookings in this view yet.",
    freeDay: "Free day",
    noData: "No data yet.",
    topServices: "Top services",
    topSpecialists: "Top specialists",
    total: "Total",
    activeBookings: "Active",
    completed: "Completed",
    noUpcomingExceptions: "No upcoming exceptions.",
    noClientNotes: "No client notes yet.",
    noReminders: "No reminders are due in the configured window.",
    chooseSpecialistFirst: "Choose a specialist first.",
    specialistRemoved: "Specialist removed from client booking.",
    specialistUpdated: "Specialist updated.",
    serviceAdded: "Service category added.",
    serviceSaved: "Service saved.",
    serviceRestored: "Service restored.",
    serviceHidden: "Service hidden from clients.",
    specialistAdded: "Specialist added.",
    salonProfileSaved: "Salon profile saved.",
    manualBookingAdded: "Manual booking added.",
    exceptionAdded: "Availability exception added.",
    exceptionDeleted: "Exception deleted.",
    clientNoteSaved: "Client note saved.",
    bookingMarked: "Booking marked",
    bookingRescheduled: "Booking rescheduled.",
    newDate: "New date (YYYY-MM-DD)",
    newTime: "New time (HH:MM)",
    addSpecialistTitle: "Add specialist",
    removeSpecialistTitle: "Remove specialist",
    team: "Team",
    serviceCategory: "Service category",
    specialistName: "Specialist name",
    createSpecialist: "Create specialist",
    chooseSpecialist: "Choose specialist",
    removeKeepsHistory: "This hides the specialist from clients but keeps old booking history.",
    removeFromBooking: "Remove from booking flow",
    browPlaceholder: "Brow Lamination",
    vacationPlaceholder: "Vacation / short day"
  },
  hy: {
    refresh: "Թարմացնել",
    logout: "Դուրս գալ",
    opening: "Բացում ենք...",
    refreshing: "Թարմացնում ենք...",
    loading: "Բեռնվում է...",
    saving: "Պահպանվում է...",
    adding: "Ավելացվում է...",
    creating: "Ստեղծվում է...",
    removing: "Հեռացվում է...",
    deleting: "Ջնջվում է...",
    dashboardRefreshed: "Վահանակը թարմացվեց։",
    loggedOut: "Դուրս եկար admin-ից։",
    headerTitle: "Սրահի օրացույց",
    headerText: "Հարմար owner վահանակ՝ այցերի, հաճախորդների տվյալների և կարգավիճակների արագ կառավարման համար։",
    ownerAccess: "Owner մուտք",
    adminPassword: "Admin գաղտնաբառ",
    enterPassword: "Մուտքագրիր գաղտնաբառը",
    openDashboard: "Բացել վահանակը",
    salonProfile: "Սրահի պրոֆիլ",
    salonProfileNote: "Բրենդ, մասնաճյուղ, կանխավճար և հիշեցումների կարգավորումներ։",
    salonName: "Սրահի անուն",
    branch: "Մասնաճյուղ",
    phone: "Հեռախոս",
    address: "Հասցե",
    instagram: "Instagram",
    brandColor: "Բրենդի գույն",
    requireDeposit: "Պահանջել կանխավճար",
    depositAmount: "Կանխավճարի չափ",
    reminderMessages: "Հիշեցման հաղորդագրություններ",
    reminderHoursBefore: "Հիշեցում այցից քանի ժամ առաջ",
    saveSalonProfile: "Պահպանել սրահի պրոֆիլը",
    analytics: "Վերլուծություն",
    refreshAnalytics: "Թարմացնել վերլուծությունը",
    calendarView: "Օրացույց",
    day: "Օր",
    manualBooking: "Ձեռքով ամրագրում",
    manualBookingNote: "Օգտագործիր հեռախոսով կամ Instagram-ով ստացած ամրագրումների համար։",
    clientName: "Հաճախորդի անուն",
    service: "Ծառայություն",
    specialist: "Մասնագետ",
    date: "Ամսաթիվ",
    time: "Ժամ",
    addManualBooking: "Ավելացնել ձեռքով ամրագրում",
    availabilityExceptions: "Աշխատաժամերի բացառություններ",
    availabilityExceptionsNote: "Արձակուրդային օրեր կամ մեկ օրվա հատուկ ժամեր։",
    dayOff: "Ոչ աշխատանքային օր",
    start: "Սկիզբ",
    end: "Ավարտ",
    note: "Նշում",
    addException: "Ավելացնել բացառություն",
    clientNotes: "Հաճախորդների նշումներ",
    clientNotesNote: "Մասնավոր owner նշումներ կրկնվող հաճախորդների համար։",
    addNote: "Ավելացնել նշում",
    reminderPreview: "Հիշեցումների նախադիտում",
    loadReminderCandidates: "Բեռնել հիշեցումները",
    serviceCategories: "Ծառայությունների բաժիններ",
    serviceCategoriesNote: "Կառավարիր booking flow-ում երևացող ծառայությունները և տևողությունները։",
    serviceName: "Ծառայության անուն",
    durationMinutes: "Տևողություն րոպեներով",
    addService: "Ավելացնել ծառայություն",
    staffSchedules: "Մասնագետների գրաֆիկ",
    addSpecialist: "Ավելացնել մասնագետ",
    removeSpecialist: "Հեռացնել մասնագետ",
    staffNote: "Ամեն ծառայության բաժնի ներսում երևում են իր մասնագետները։ Ժամերը փոխիր քարտի ներսում։",
    bookings: "Ամրագրումներ",
    all: "Բոլորը",
    today: "Այսօր",
    tomorrow: "Վաղը",
    upcoming: "Առաջիկա",
    confirmed: "Հաստատված",
    cancelled: "Չեղարկված",
    noShow: "Չի եկել",
    category: "Բաժին",
    appointment: "այց",
    noActiveSpecialists: "Այս բաժնում ակտիվ մասնագետ դեռ չկա։",
    active: "ակտիվ",
    name: "Անուն",
    role: "Դեր",
    saveChanges: "Պահպանել",
    save: "Պահպանել",
    hide: "Թաքցնել",
    restore: "Վերականգնել",
    delete: "Ջնջել",
    complete: "Ավարտել",
    cancel: "Չեղարկել",
    reschedule: "Փոխել ժամը",
    noBookings: "Այս տեսքում ամրագրումներ դեռ չկան։",
    freeDay: "Ազատ օր",
    noData: "Տվյալներ դեռ չկան։",
    topServices: "Ամենաշատ ընտրված ծառայություններ",
    topSpecialists: "Ամենաշատ ամրագրված մասնագետներ",
    total: "Ընդամենը",
    activeBookings: "Ակտիվ",
    completed: "Ավարտված",
    noUpcomingExceptions: "Առաջիկա բացառություններ չկան։",
    noClientNotes: "Հաճախորդների նշումներ դեռ չկան։",
    noReminders: "Այս պահին հիշեցման ենթակա այցեր չկան։",
    chooseSpecialistFirst: "Նախ ընտրիր մասնագետին։",
    specialistRemoved: "Մասնագետը հեռացվեց client booking-ից։",
    specialistUpdated: "Մասնագետը թարմացվեց։",
    serviceAdded: "Ծառայության բաժինը ավելացվեց։",
    serviceSaved: "Ծառայությունը պահպանվեց։",
    serviceRestored: "Ծառայությունը վերականգնվեց։",
    serviceHidden: "Ծառայությունը թաքցվեց հաճախորդներից։",
    specialistAdded: "Մասնագետը ավելացվեց։",
    salonProfileSaved: "Սրահի պրոֆիլը պահպանվեց։",
    manualBookingAdded: "Ձեռքով ամրագրումը ավելացվեց։",
    exceptionAdded: "Աշխատաժամի բացառությունը ավելացվեց։",
    exceptionDeleted: "Բացառությունը ջնջվեց։",
    clientNoteSaved: "Հաճախորդի նշումը պահպանվեց։",
    bookingMarked: "Ամրագրումը նշվեց որպես",
    bookingRescheduled: "Ամրագրումը տեղափոխվեց։",
    newDate: "Նոր ամսաթիվ (YYYY-MM-DD)",
    newTime: "Նոր ժամ (HH:MM)",
    addSpecialistTitle: "Ավելացնել մասնագետ",
    removeSpecialistTitle: "Հեռացնել մասնագետ",
    team: "Թիմ",
    serviceCategory: "Ծառայության բաժին",
    specialistName: "Մասնագետի անուն",
    createSpecialist: "Ստեղծել մասնագետ",
    chooseSpecialist: "Ընտրիր մասնագետին",
    removeKeepsHistory: "Սա թաքցնում է մասնագետին հաճախորդներից, բայց հին այցերի պատմությունը պահում է։",
    removeFromBooking: "Հեռացնել booking flow-ից",
    browPlaceholder: "Հոնքերի լամինացիա",
    vacationPlaceholder: "Արձակուրդ / կարճ օր"
  }
};

Object.assign(adminTranslations.hy, {
  headerTitle: "Ադմին վահանակ",
  headerText: "Պարզ վահանակ՝ այցերը, հաճախորդներին, ծառայությունները և աշխատանքային ժամերը կառավարելու համար։",
  ownerAccess: "Մուտք ադմին",
  salonProfile: "Սրահի տվյալներ",
  salonProfileNote: "Փոխիր անունը, գույները, նկարները և հիշեցումները։",
  googleSheetSync: "Google Sheet",
  analytics: "Վիճակագրություն",
  calendarView: "Օրացույց",
  manualBooking: "Ձեռքով ամրագրում",
  manualBookingNote: "Օգտագործիր հեռախոսով կամ Instagram-ով ստացած այցերի համար։",
  availabilityExceptions: "Հատուկ օրեր",
  availabilityExceptionsNote: "Նշիր հանգստյան օր կամ այդ օրվա այլ ժամեր։",
  clientNotes: "Հաճախորդի նշումներ",
  clientNotesNote: "Ներքին նշումներ կրկնվող հաճախորդների համար։",
  reminderPreview: "Հիշեցումներ",
  serviceCategories: "Ծառայություններ",
  serviceCategoriesNote: "Ավելացրու կամ փոխիր ծառայության անունը, տևողությունը և նկարը։",
  staffSchedules: "Մասնագետներ և ժամեր",
  staffNote: "Ընտրիր բաժինը, հետո փոխիր մասնագետի ժամերը քարտի մեջ։",
  bookings: "Այցեր",
  imageUrl: "Նկարի հղում",
  uploadHeroImage: "Ընտրել գլխավոր նկարը սարքից",
  uploadServiceImage: "Ընտրել ծառայության նկարը սարքից",
  chooseImage: "Ընտրել նկար",
  noImageChosen: "Նկար ընտրված չէ"
});

Object.assign(adminTranslations.en, {
  headerTitle: "Admin panel",
  headerText: "Simple controls for appointments, clients, services, staff hours, and salon settings.",
  ownerAccess: "Admin login",
  salonProfile: "Salon details",
  salonProfileNote: "Change the name, colors, images, deposit, and reminders.",
  googleSheetSync: "Google Sheet",
  calendarView: "Calendar",
  manualBookingNote: "Add visits received by phone or Instagram.",
  availabilityExceptions: "Special days",
  availabilityExceptionsNote: "Mark a day off or set custom hours for one day.",
  clientNotesNote: "Internal notes for repeat clients.",
  reminderPreview: "Reminders",
  serviceCategories: "Services",
  serviceCategoriesNote: "Add or edit service names, duration, and images.",
  staffSchedules: "Staff and hours",
  staffNote: "Open a service, then edit specialist hours inside the card.",
  bookings: "Appointments"
});

const accessPassword = new URLSearchParams(window.location.search).get("access");
if (accessPassword) {
  adminPassword = accessPassword;
  sessionStorage.setItem("maisonRoseAdminPassword", adminPassword);
  window.history.replaceState({}, document.title, window.location.pathname);
}

calendarDate.value = toDateValue(new Date());
manualDate.value = toDateValue(new Date());
exceptionDate.value = toDateValue(new Date());
renderAdminLanguage();
setupAdminSections();
applyAdminLanguage();

adminLanguageSwitch.addEventListener("click", (event) => {
  const button = event.target.closest("[data-admin-language]");
  if (!button) return;
  adminLanguage = button.dataset.adminLanguage;
  localStorage.setItem("maisonRoseAdminLanguage", adminLanguage);
  renderAdminLanguage();
  applyAdminLanguage();
  rerenderDashboard();
});

loginButton.addEventListener("click", async () => {
  adminPassword = passwordInput.value.trim();
  sessionStorage.setItem("maisonRoseAdminPassword", adminPassword);
  await withButtonState(loginButton, tr("opening"), loadBookings);
});

document.querySelector("#refreshBookings").addEventListener("click", async (event) => {
  await withButtonState(event.currentTarget, tr("refreshing"), async () => {
    await loadBookings();
    showToast(tr("dashboardRefreshed"));
  });
});

document.querySelector("#logoutAdmin").addEventListener("click", () => {
  sessionStorage.removeItem("maisonRoseAdminPassword");
  adminPassword = "";
  bookings = [];
  dashboard.classList.add("hidden");
  loginPanel.classList.remove("hidden");
  showToast(tr("loggedOut"));
});

document.querySelector("#openAddSpecialist").addEventListener("click", () => {
  populateServiceSelect();
  openModal(specialistModal);
});

document.querySelector("#openRemoveSpecialist").addEventListener("click", () => {
  populateRemoveSelect();
  openModal(removeSpecialistModal);
});

document.querySelectorAll("[data-close-modal]").forEach((item) => {
  item.addEventListener("click", () => closeModal(specialistModal));
});

document.querySelectorAll("[data-close-remove-modal]").forEach((item) => {
  item.addEventListener("click", () => closeModal(removeSpecialistModal));
});

createSpecialistForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await withButtonState(createSpecialistForm.querySelector("button[type='submit']"), tr("creating"), createSpecialist);
});

removeSpecialistForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = removeSpecialistSelect.value;
  if (!id) {
    showToast(tr("chooseSpecialistFirst"), "error");
    return;
  }

  await withButtonState(removeSpecialistForm.querySelector("button[type='submit']"), tr("removing"), async () => {
    await setSpecialistActive(id, false);
    closeModal(removeSpecialistModal);
    showToast(tr("specialistRemoved"));
  });
});

createServiceForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await withButtonState(createServiceForm.querySelector("button[type='submit']"), tr("adding"), createService);
});

settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await withButtonState(settingsForm.querySelector("button[type='submit']"), tr("saving"), saveSettings);
});

refreshAnalyticsButton.addEventListener("click", async (event) => {
  await withButtonState(event.currentTarget, tr("loading"), loadAnalytics);
});

calendarDate.addEventListener("change", renderCalendar);

manualBookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await withButtonState(manualBookingForm.querySelector("button[type='submit']"), tr("adding"), createManualBooking);
});

manualService.addEventListener("change", () => {
  populateManualSpecialists();
  loadManualAvailability();
});
manualSpecialist.addEventListener("change", loadManualAvailability);
manualDate.addEventListener("change", loadManualAvailability);

exceptionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await withButtonState(exceptionForm.querySelector("button[type='submit']"), tr("adding"), createException);
});

noteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await withButtonState(noteForm.querySelector("button[type='submit']"), tr("saving"), createNote);
});

loadRemindersButton.addEventListener("click", async (event) => {
  await withButtonState(event.currentTarget, tr("loading"), loadReminders);
});

syncGoogleSheetButton.addEventListener("click", async (event) => {
  await withButtonState(event.currentTarget, adminLanguage === "hy" ? "Սինք..." : "Syncing...", syncGoogleSheet);
});

heroImageUpload.addEventListener("change", async () => {
  await uploadImageIntoInput(heroImageUpload, document.querySelector("#heroImageUrl"));
});

newServiceImageUpload.addEventListener("change", async () => {
  await uploadImageIntoInput(newServiceImageUpload, newServiceImageUrl);
});

filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) {
    return;
  }

  activeFilter = button.dataset.filter;
  filters.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.filter === activeFilter);
  });
  renderBookings();
});

if (adminPassword) {
  loadBookings();
}

function tr(key) {
  return adminTranslations[adminLanguage]?.[key] || adminTranslations.en[key] || key;
}

function renderAdminLanguage() {
  document.documentElement.lang = adminLanguage === "hy" ? "hy" : "en";
  document.body.dataset.adminLanguage = adminLanguage;
  adminLanguageSwitch.innerHTML = ["en", "hy"]
    .map(
      (language) => `
        <button class="language-chip ${adminLanguage === language ? "active" : ""}" data-admin-language="${language}">
          ${language.toUpperCase()}
        </button>
      `
    )
    .join("");
}

function setupAdminSections() {
  if (dashboard.dataset.sectionsReady === "true") {
    return;
  }

  const savedState = readAdminSectionState();
  const toolbars = Array.from(dashboard.children).filter((child) => child.classList.contains("admin-toolbar"));

  toolbars.forEach((toolbar) => {
    const title = toolbar.querySelector(".admin-section-title");
    if (!title) {
      return;
    }

    const sectionKey = sectionKeyFromTitle(title.textContent);
    const section = document.createElement("article");
    section.className = "admin-fold-section";
    section.dataset.adminSection = sectionKey;

    const header = document.createElement("button");
    header.type = "button";
    header.className = "admin-fold-header";
    header.setAttribute("aria-expanded", "false");

    const titleWrap = document.createElement("span");
    titleWrap.className = "admin-fold-title";
    titleWrap.append(title);

    const chevron = document.createElement("span");
    chevron.className = "admin-fold-chevron";
    chevron.setAttribute("aria-hidden", "true");
    chevron.textContent = "⌄";

    const content = document.createElement("div");
    content.className = "admin-fold-content";

    header.append(titleWrap, chevron);
    section.append(header, content);
    dashboard.insertBefore(section, toolbar);

    toolbar.classList.add("admin-section-controls");
    content.append(toolbar);

    let next = section.nextElementSibling;
    while (next && !next.classList.contains("admin-toolbar") && !next.classList.contains("admin-fold-section")) {
      const current = next;
      next = next.nextElementSibling;
      content.append(current);
    }

    const defaultOpen = sectionKey === "bookings";
    const isOpen = savedState[sectionKey] ?? defaultOpen;
    setAdminSectionOpen(section, isOpen);

    header.addEventListener("click", () => {
      const open = !section.classList.contains("is-open");
      setAdminSectionOpen(section, open);
      saveAdminSectionState();
    });
  });

  dashboard.dataset.sectionsReady = "true";
}

function sectionKeyFromTitle(title) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "section";
}

function setAdminSectionOpen(section, open) {
  const header = section.querySelector(".admin-fold-header");
  const content = section.querySelector(".admin-fold-content");
  section.classList.toggle("is-open", open);
  header?.setAttribute("aria-expanded", String(open));
  if (content) {
    content.hidden = !open;
  }
}

function readAdminSectionState() {
  try {
    return JSON.parse(localStorage.getItem(adminSectionStateKey) || "{}");
  } catch {
    return {};
  }
}

function saveAdminSectionState() {
  const state = {};
  dashboard.querySelectorAll("[data-admin-section]").forEach((section) => {
    state[section.dataset.adminSection] = section.classList.contains("is-open");
  });
  localStorage.setItem(adminSectionStateKey, JSON.stringify(state));
}

function setText(selector, key) {
  const element = document.querySelector(selector);
  if (element) element.textContent = tr(key);
}

function setPlaceholder(selector, key) {
  const element = document.querySelector(selector);
  if (element) element.placeholder = tr(key);
}

function applyAdminLanguage() {
  setText(".admin-header h1", "headerTitle");
  setText(".admin-header p", "headerText");
  setText("#refreshBookings", "refresh");
  setText("#logoutAdmin", "logout");
  setText("#adminLogin h2", "ownerAccess");
  setText("#adminLogin .field span", "adminPassword");
  setPlaceholder("#adminPassword", "enterPassword");
  setText("#loginButton", "openDashboard");

  setText("#settingsForm button[type='submit']", "saveSalonProfile");
  setText("#refreshAnalytics", "refreshAnalytics");
  setText("#manualBookingForm button[type='submit']", "addManualBooking");
  setText("#exceptionForm button[type='submit']", "addException");
  setText("#noteForm button[type='submit']", "addNote");
  setText("#loadReminders", "loadReminderCandidates");
  setText("#createServiceForm button[type='submit']", "addService");
  setText("#openAddSpecialist", "addSpecialist");
  setText("#openRemoveSpecialist", "removeSpecialist");
  renderGoogleSheetStatus();

  const sections = [
    ["Salon profile", "salonProfile"],
    ["Salon details", "salonProfile"],
    ["Google Sheet sync", "googleSheetSync"],
    ["Analytics", "analytics"],
    ["Calendar view", "calendarView"],
    ["Manual booking", "manualBooking"],
    ["Availability exceptions", "availabilityExceptions"],
    ["Client notes", "clientNotes"],
    ["Reminder preview", "reminderPreview"],
    ["Service categories", "serviceCategories"],
    ["Staff schedules", "staffSchedules"],
    ["Bookings", "bookings"]
  ];
  document.querySelectorAll(".admin-section-title").forEach((title) => {
    const match = sections.find(([english]) => title.textContent.trim() === english || title.dataset.i18nKey === english);
    if (match) {
      title.dataset.i18nKey = match[0];
      title.textContent = tr(match[1]);
    }
  });

  setMutedText("Brand, branch, deposit and reminder settings.", "salonProfileNote");
  setMutedText("Change the client demo name, colors, cover image, deposit and reminder settings.", "salonProfileNote");
  setMutedText("Change the name, colors, images, deposit, and reminders.", "salonProfileNote");
  setMutedText("Use Google Sheet for services, specialists, weekly hours, exceptions, and manual bookings.", "googleSheetHelp");
  setMutedText("Use this for phone or Instagram bookings.", "manualBookingNote");
  setMutedText("Special vacation days or one-day custom hours.", "availabilityExceptionsNote");
  setMutedText("Private owner notes for repeat clients.", "clientNotesNote");
  setMutedText("Manage service names and durations used in the booking flow.", "serviceCategoriesNote");
  setText(".section-note", "staffNote");

  translateLabels();
  translateFilters();
  translateModals();
  renderGoogleSheetStatus();
}

function setMutedText(englishText, key) {
  document.querySelectorAll(".admin-muted").forEach((element) => {
    if (element.textContent.trim() === englishText || element.dataset.i18nKey === englishText) {
      element.dataset.i18nKey = englishText;
      element.textContent = tr(key);
    }
  });
}

function translateLabels() {
  const labels = {
    "Salon name": "salonName",
    Branch: "branch",
    Phone: "phone",
    Address: "address",
    Instagram: "instagram",
    "Brand color": "brandColor",
    "Accent color": "accentColor",
    "Hero title": "heroTitle",
    "Hero text": "heroText",
    "Hero image URL": "heroImageUrl",
    "Image URL": "imageUrl",
    "Upload hero image from device": "uploadHeroImage",
    "Upload service image from device": "uploadServiceImage",
    "Deposit amount": "depositAmount",
    "Reminder hours before": "reminderHoursBefore",
    Day: "day",
    "Client name": "clientName",
    Service: "service",
    Specialist: "specialist",
    Date: "date",
    Time: "time",
    Start: "start",
    End: "end",
    Note: "note",
    "Service name": "serviceName",
    "Duration minutes": "durationMinutes",
    "Service category": "serviceCategory",
    "Specialist name": "specialistName",
    Role: "role",
    "Choose specialist": "chooseSpecialist"
  };
  document.querySelectorAll(".field span, .upload-field > span:first-child").forEach((label) => {
    const key = label.dataset.i18nKey || label.textContent.trim();
    if (labels[key]) {
      label.dataset.i18nKey = key;
      label.textContent = tr(labels[key]);
    }
  });

  document.querySelectorAll(".upload-button").forEach((item) => {
    item.textContent = tr("chooseImage");
  });
  document.querySelectorAll(".upload-name").forEach((item) => {
    if (!item.dataset.hasFile) {
      item.textContent = tr("noImageChosen");
    }
  });

  translateToggle("#depositRequired", "requireDeposit");
  translateToggle("#remindersEnabled", "reminderMessages");
  translateToggle("#exceptionDayOff", "dayOff");
  setPlaceholder("#newServiceName", "browPlaceholder");
  setPlaceholder("#exceptionNote", "vacationPlaceholder");
}

function translateToggle(inputSelector, key) {
  const label = document.querySelector(inputSelector)?.closest(".toggle-line")?.querySelector("span");
  if (label) label.textContent = tr(key);
}

function translateFilters() {
  const filtersMap = {
    all: "all",
    today: "today",
    tomorrow: "tomorrow",
    confirmed: "confirmed",
    cancelled: "cancelled",
    no_show: "noShow"
  };
  filters.querySelectorAll("[data-filter]").forEach((button) => {
    button.textContent = tr(filtersMap[button.dataset.filter]);
  });
}

function translateModals() {
  document.querySelector("#specialistModal .eyebrow").textContent = tr("team");
  document.querySelector("#specialistModal h2").textContent = tr("addSpecialistTitle");
  document.querySelector("#createSpecialistForm button[type='submit']").textContent = tr("createSpecialist");
  document.querySelector("#removeSpecialistModal .eyebrow").textContent = tr("team");
  document.querySelector("#removeSpecialistModal h2").textContent = tr("removeSpecialistTitle");
  document.querySelector("#removeSpecialistModal .admin-muted").textContent = tr("removeKeepsHistory");
  document.querySelector("#removeSpecialistForm button[type='submit']").textContent = tr("removeFromBooking");
}

function rerenderDashboard() {
  renderStats(buildVisibleStats());
  renderBookings();
  renderServices();
  renderSpecialists();
  renderCalendar();
  renderExceptions();
  renderNotes();
}

function buildVisibleStats() {
  const today = toDateValue(new Date());
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = toDateValue(tomorrowDate);
  return {
    today: bookings.filter((booking) => booking.date === today && booking.status === "confirmed").length,
    tomorrow: bookings.filter((booking) => booking.date === tomorrow && booking.status === "confirmed").length,
    upcoming: bookings.filter((booking) => booking.date >= today && booking.status === "confirmed").length,
    cancelled: bookings.filter((booking) => booking.status === "cancelled").length,
    noShow: bookings.filter((booking) => booking.status === "no_show").length
  };
}

async function loadBookings() {
  loginError.textContent = "";

  try {
    const data = await adminFetch("/api/admin/bookings");
    bookings = data.bookings || [];
    loginPanel.classList.add("hidden");
    dashboard.classList.remove("hidden");
    renderStats(data.stats || {});
    renderBookings();
    await loadSpecialists();
    await Promise.all([loadSettings(), loadGoogleSheetStatus(), loadAnalytics(), loadExceptions(), loadNotes(), loadReminders()]);
  } catch (error) {
    dashboard.classList.add("hidden");
    loginPanel.classList.remove("hidden");
    loginError.textContent = error.message;
    showToast(error.message, "error");
  }
}

async function loadGoogleSheetStatus() {
  try {
    googleSheetState = await adminFetch("/api/admin/google-sheets/status");
  } catch (error) {
    googleSheetState = { ok: false, error: error.message };
  }
  renderGoogleSheetStatus();
}

async function syncGoogleSheet() {
  const data = await adminFetch("/api/admin/google-sheets/sync", { method: "POST" });
  googleSheetState = {
    ok: true,
    enabled: true,
    configured: true,
    lastSync: data.sync
  };
  await loadBookings();
  renderGoogleSheetStatus();
  const errors = data.sync?.errors || [];
  showToast(errors.length ? `${errors.length} Sheet warning(s).` : (adminLanguage === "hy" ? "Google Sheet-ը թարմացվեց։" : "Google Sheet synced."));
}

function renderGoogleSheetStatus() {
  if (!googleSheetStatus) return;

  googleSheetTitle.textContent = adminLanguage === "hy" ? "Google Sheet սինք" : "Google Sheet sync";
  googleSheetHelp.textContent =
    adminLanguage === "hy"
      ? "Google Sheet-ով կարող ես կառավարել ծառայությունները, մասնագետներին, աշխատանքային ժամերը, բացառությունները և ձեռքով ամրագրումները։"
      : "Use Google Sheet for services, specialists, weekly hours, exceptions, and manual bookings.";
  syncGoogleSheetButton.textContent = adminLanguage === "hy" ? "Սինք անել հիմա" : "Sync now";

  if (!googleSheetState) {
    googleSheetStatus.innerHTML = `<div class="compact-item">${adminLanguage === "hy" ? "Ստուգվում է..." : "Checking..."}</div>`;
    return;
  }

  if (!googleSheetState.configured) {
    googleSheetStatus.innerHTML = `
      <div class="compact-item warning">
        <strong>${adminLanguage === "hy" ? "Միացված չէ" : "Not connected"}</strong>
        <span>${adminLanguage === "hy" ? "Լրացրու GOOGLE_SHEET_ID և GOOGLE_SERVICE_ACCOUNT_FILE .env ֆայլում։" : "Add GOOGLE_SHEET_ID and GOOGLE_SERVICE_ACCOUNT_FILE in .env."}</span>
      </div>
    `;
    return;
  }

  const sync = googleSheetState.lastSync;
  if (!sync) {
    googleSheetStatus.innerHTML = `
      <div class="compact-item">
        <strong>${adminLanguage === "hy" ? "Պատրաստ է" : "Ready"}</strong>
        <span>${adminLanguage === "hy" ? "Ավտոմատ սինք" : "Auto sync"}: ${googleSheetState.enabled ? "ON" : "OFF"} · ${googleSheetState.intervalSeconds || 60}s</span>
      </div>
    `;
    return;
  }

  googleSheetStatus.innerHTML = `
    <div class="compact-item">
      <strong>${adminLanguage === "hy" ? "Վերջին սինք" : "Last sync"}</strong>
      <span>
        ${adminLanguage === "hy" ? "Ծառայություններ" : "Services"}: ${sync.importedServices},
        ${adminLanguage === "hy" ? "մասնագետներ" : "specialists"}: ${sync.importedSpecialists},
        ${adminLanguage === "hy" ? "գրաֆիկ" : "hours"}: ${sync.importedWeeklyHours},
        ${adminLanguage === "hy" ? "ամրագրումներ" : "bookings"}: ${sync.importedBookings}/${sync.exportedBookings}
      </span>
    </div>
    ${
      sync.errors?.length
        ? `<div class="compact-item warning"><strong>${adminLanguage === "hy" ? "Զգուշացումներ" : "Warnings"}</strong><span>${sync.errors.slice(0, 3).join("<br>")}</span></div>`
        : ""
    }
  `;
}

async function loadSpecialists() {
  const data = await adminFetch("/api/admin/specialists");

  services = data.services || [];
  specialists = data.specialists || [];
  renderServices();
  renderSpecialists();
  populateServiceSelect();
  populateRemoveSelect();
  populateManualServices();
  populateExceptionSpecialists();
  renderCalendar();
}

function renderServices() {
  serviceAdminList.innerHTML = services
    .map(
      (service) => `
        <article class="service-admin-card ${service.active ? "" : "is-muted"}" data-service-id="${escapeHtml(service.id)}">
          <label class="field compact-field">
            <span>${tr("name")}</span>
            <input type="text" value="${escapeHtml(service.name)}" data-service-name />
          </label>
          <label class="field compact-field">
            <span>${tr("durationMinutes")}</span>
            <input type="number" min="15" step="15" value="${service.durationMinutes}" data-service-duration />
          </label>
          <label class="field compact-field">
            <span>Icon</span>
            <input type="text" maxlength="8" value="${escapeHtml(service.icon || "")}" data-service-icon />
          </label>
          <label class="field compact-field wide-field">
            <span>${tr("imageUrl")}</span>
            <input type="text" value="${escapeHtml(service.imageUrl || "")}" data-service-image-url />
          </label>
          <label class="upload-field wide-field">
            <span>${tr("uploadServiceImage")}</span>
            <input type="file" accept="image/*" data-service-image-upload />
            <span class="upload-control">
              <span class="upload-button">${tr("chooseImage")}</span>
              <span class="upload-name">${tr("noImageChosen")}</span>
            </span>
          </label>
          <div class="admin-actions">
            <button class="admin-button primary" data-save-service>${tr("save")}</button>
            <button class="admin-button" data-toggle-service>${service.active ? tr("hide") : tr("restore")}</button>
          </div>
        </article>
      `
    )
    .join("");

  serviceAdminList.querySelectorAll("[data-save-service]").forEach((button) => {
    button.addEventListener("click", async () => {
      const card = button.closest("[data-service-id]");
      await withButtonState(button, tr("saving"), async () => saveService(card.dataset.serviceId, card));
    });
  });

  serviceAdminList.querySelectorAll("[data-toggle-service]").forEach((button) => {
    button.addEventListener("click", async () => {
      const card = button.closest("[data-service-id]");
      const service = services.find((item) => item.id === card.dataset.serviceId);
      await withButtonState(button, service.active ? tr("removing") : tr("saving"), async () => {
        await setServiceActive(card.dataset.serviceId, !service.active);
      });
    });
  });

  serviceAdminList.querySelectorAll("[data-service-image-upload]").forEach((input) => {
    input.addEventListener("change", async () => {
      const card = input.closest("[data-service-id]");
      await uploadImageIntoInput(input, card.querySelector("[data-service-image-url]"));
    });
  });
}

function renderSpecialists() {
  const activeServices = services.filter((service) => service.active);

  if (!activeServices.length) {
    staffSchedules.innerHTML = `<p class="admin-empty">${tr("noActiveSpecialists")}</p>`;
    return;
  }

  staffSchedules.innerHTML = activeServices
    .map((service) => renderServiceSection(service))
    .join("");

  staffSchedules.querySelectorAll("[data-save-specialist]").forEach((button) => {
    button.addEventListener("click", async () => {
      const card = button.closest("[data-specialist-id]");
      await withButtonState(button, tr("saving"), async () => saveSpecialist(card.dataset.specialistId, card));
    });
  });
}

function renderServiceSection(service) {
  const assigned = specialists.filter((specialist) => {
    return specialist.active && (specialist.serviceIds || []).includes(service.id);
  });

  return `
    <section class="service-section" data-service-section="${escapeHtml(service.id)}">
      <div class="service-section-head">
        <div>
          <p class="eyebrow">${tr("category")}</p>
          <h3>${escapeHtml(service.name)}</h3>
          <span>${service.durationMinutes} min ${tr("appointment")}</span>
        </div>
        <strong>${assigned.length}</strong>
      </div>
      <div class="service-specialists">
        ${
          assigned.length
            ? assigned.map((specialist) => renderSpecialistCard(specialist, service.id)).join("")
            : `<p class="admin-empty">${tr("noActiveSpecialists")}</p>`
        }
      </div>
    </section>
  `;
}

function renderSpecialistCard(specialist, currentServiceId) {
  return `
    <article class="staff-card" data-specialist-id="${escapeHtml(specialist.id)}">
      <div class="staff-card-head">
        <div>
          <h3>${escapeHtml(specialist.name)}</h3>
          <p>${escapeHtml(specialist.role)}</p>
        </div>
        <span class="status-badge status-confirmed">${tr("active")}</span>
      </div>
      <div class="schedule-row">
        <label class="field compact-field">
          <span>${tr("name")}</span>
          <input type="text" value="${escapeHtml(specialist.name)}" data-specialist-name />
        </label>
        <label class="field compact-field">
          <span>${tr("role")}</span>
          <input type="text" value="${escapeHtml(specialist.role)}" data-specialist-role />
        </label>
      </div>
      <div class="service-checks" data-service-checks>
        ${renderServiceCheckboxes(`service-${specialist.id}`, specialist.serviceIds || [], currentServiceId)}
      </div>
      <div class="schedule-row">
        <label class="field compact-field">
          <span>${tr("start")}</span>
          <input type="time" value="${escapeHtml(specialist.schedule.start)}" data-schedule-start />
        </label>
        <label class="field compact-field">
          <span>${tr("end")}</span>
          <input type="time" value="${escapeHtml(specialist.schedule.end)}" data-schedule-end />
        </label>
      </div>
      <div class="day-grid">
        ${dayLabels
          .map(
            (label, index) => `
              <label class="day-chip">
                <input type="checkbox" value="${index}" ${specialist.schedule.daysOff.includes(index) ? "checked" : ""} />
                <span>${dayLabelsByLanguage[adminLanguage][index]}</span>
              </label>
            `
          )
          .join("")}
      </div>
      <div class="admin-actions">
        <button class="admin-button primary" data-save-specialist>${tr("saveChanges")}</button>
      </div>
    </article>
  `;
}

function renderServiceCheckboxes(namePrefix, selectedIds, currentServiceId) {
  return services
    .filter((service) => service.active)
    .map(
      (service) => `
        <label class="service-chip ${service.id === currentServiceId ? "is-current" : ""}">
          <input type="checkbox" name="${namePrefix}" value="${escapeHtml(service.id)}" ${
            selectedIds.includes(service.id) ? "checked" : ""
          } />
          <span>${escapeHtml(service.name)}</span>
        </label>
      `
    )
    .join("");
}

function populateServiceSelect() {
  const activeServices = services.filter((service) => service.active);
  newSpecialistService.innerHTML = activeServices
    .map((service) => `<option value="${escapeHtml(service.id)}">${escapeHtml(service.name)}</option>`)
    .join("");
}

function populateRemoveSelect() {
  const activeSpecialists = specialists.filter((specialist) => specialist.active);
  removeSpecialistSelect.innerHTML = activeSpecialists
    .map((specialist) => {
      const categoryNames = services
        .filter((service) => (specialist.serviceIds || []).includes(service.id))
        .map((service) => service.name)
        .join(", ");
      return `<option value="${escapeHtml(specialist.id)}">${escapeHtml(specialist.name)} - ${escapeHtml(categoryNames || specialist.role)}</option>`;
    })
    .join("");
}

async function saveSpecialist(id, card) {
  const profile = {
    name: card.querySelector("[data-specialist-name]").value.trim(),
    role: card.querySelector("[data-specialist-role]").value.trim()
  };
  const schedule = {
    start: card.querySelector("[data-schedule-start]").value,
    end: card.querySelector("[data-schedule-end]").value,
    daysOff: Array.from(card.querySelectorAll(".day-chip input:checked")).map((input) => Number(input.value))
  };
  const serviceIds = Array.from(card.querySelectorAll("[data-service-checks] input:checked")).map((input) => input.value);

  const profileData = await adminFetch(`/api/admin/specialists/${id}/profile`, {
    method: "PATCH",
    body: JSON.stringify(profile)
  });

  await adminFetch(`/api/admin/specialists/${id}/schedule`, {
    method: "PATCH",
    body: JSON.stringify({ schedule })
  });

  const servicesData = await adminFetch(`/api/admin/specialists/${id}/services`, {
    method: "PATCH",
    body: JSON.stringify({ serviceIds })
  });

  specialists = specialists.map((specialist) => {
    if (specialist.id !== id) return specialist;
    return {
      ...profileData.specialist,
      ...servicesData.specialist
    };
  });

  pulse(card);
  renderSpecialists();
  showToast(tr("specialistUpdated"));
}

async function createService() {
  const data = await adminFetch("/api/admin/services", {
    method: "POST",
    body: JSON.stringify({
      name: newServiceName.value.trim(),
      durationMinutes: Number(newServiceDuration.value),
      icon: newServiceIcon.value.trim(),
      imageUrl: newServiceImageUrl.value.trim()
    })
  });

  newServiceName.value = "";
  newServiceDuration.value = "";
  newServiceIcon.value = "";
  newServiceImageUrl.value = "";
  services = [...services, data.service];
  await loadSpecialists();
  showToast(tr("serviceAdded"));
}

async function saveService(id, card) {
  const data = await adminFetch(`/api/admin/services/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: card.querySelector("[data-service-name]").value.trim(),
      durationMinutes: Number(card.querySelector("[data-service-duration]").value),
      icon: card.querySelector("[data-service-icon]").value.trim(),
      imageUrl: card.querySelector("[data-service-image-url]").value.trim()
    })
  });

  services = services.map((service) => (service.id === id ? data.service : service));
  pulse(card);
  renderServices();
  renderSpecialists();
  populateServiceSelect();
  populateRemoveSelect();
  showToast(tr("serviceSaved"));
}

async function setServiceActive(id, active) {
  const data = await adminFetch(`/api/admin/services/${id}/active`, {
    method: "PATCH",
    body: JSON.stringify({ active })
  });

  services = services.map((service) => (service.id === id ? data.service : service));
  renderServices();
  renderSpecialists();
  populateServiceSelect();
  populateRemoveSelect();
  showToast(active ? tr("serviceRestored") : tr("serviceHidden"));
}

async function createSpecialist() {
  const serviceId = newSpecialistService.value;
  const data = await adminFetch("/api/admin/specialists", {
    method: "POST",
    body: JSON.stringify({
      name: newSpecialistName.value.trim(),
      role: newSpecialistRole.value.trim(),
      serviceIds: [serviceId],
      schedule: {
        start: newSpecialistStart.value,
        end: newSpecialistEnd.value,
        daysOff: []
      }
    })
  });

  newSpecialistName.value = "";
  newSpecialistRole.value = "";
  newSpecialistStart.value = "10:00";
  newSpecialistEnd.value = "18:00";
  specialists = [...specialists, data.specialist];
  closeModal(specialistModal);
  await loadSpecialists();
  showToast(tr("specialistAdded"));
}

async function setSpecialistActive(id, active) {
  const data = await adminFetch(`/api/admin/specialists/${id}/active`, {
    method: "PATCH",
    body: JSON.stringify({ active })
  });

  specialists = specialists.map((specialist) => (specialist.id === id ? data.specialist : specialist));
  renderSpecialists();
  populateRemoveSelect();
}

async function loadSettings() {
  const data = await adminFetch("/api/admin/settings");
  settings = data.settings || {};
  document.querySelector("#salonName").value = settings.salonName || "";
  document.querySelector("#branchName").value = settings.branchName || "";
  document.querySelector("#salonPhone").value = settings.phone || "";
  document.querySelector("#salonAddress").value = settings.address || "";
  document.querySelector("#salonInstagram").value = settings.instagram || "";
  document.querySelector("#brandColor").value = settings.brandColor || "#b76e79";
  document.querySelector("#accentColor").value = settings.accentColor || "#dcc08c";
  document.querySelector("#heroTitle").value = settings.heroTitle || "";
  document.querySelector("#heroText").value = settings.heroText || "";
  document.querySelector("#heroImageUrl").value = settings.heroImageUrl || "";
  document.querySelector("#depositRequired").checked = Boolean(settings.depositRequired);
  document.querySelector("#depositAmount").value = settings.depositAmount || 0;
  document.querySelector("#remindersEnabled").checked = Boolean(settings.remindersEnabled);
  document.querySelector("#reminderHours").value = settings.reminderHours || 24;
  applyAdminBrandTheme();
}

async function saveSettings() {
  const data = await adminFetch("/api/admin/settings", {
    method: "PATCH",
    body: JSON.stringify({
      salonName: document.querySelector("#salonName").value.trim(),
      branchName: document.querySelector("#branchName").value.trim(),
      phone: document.querySelector("#salonPhone").value.trim(),
      address: document.querySelector("#salonAddress").value.trim(),
      instagram: document.querySelector("#salonInstagram").value.trim(),
      brandColor: document.querySelector("#brandColor").value,
      accentColor: document.querySelector("#accentColor").value,
      heroTitle: document.querySelector("#heroTitle").value.trim(),
      heroText: document.querySelector("#heroText").value.trim(),
      heroImageUrl: document.querySelector("#heroImageUrl").value.trim(),
      depositRequired: document.querySelector("#depositRequired").checked,
      depositAmount: Number(document.querySelector("#depositAmount").value),
      remindersEnabled: document.querySelector("#remindersEnabled").checked,
      reminderHours: Number(document.querySelector("#reminderHours").value)
    })
  });
  settings = data.settings;
  applyAdminBrandTheme();
  showToast(tr("salonProfileSaved"));
}

function applyAdminBrandTheme() {
  const salonName = settings.salonName || "Maison Rose";
  const branchName = settings.branchName || "Admin";
  const brandColor = normalizeHexColor(settings.brandColor, "#b76e79");
  const accentColor = normalizeHexColor(settings.accentColor, "#dcc08c");

  document.title = `${salonName} Admin`;
  document.documentElement.style.setProperty("--rose-500", brandColor);
  document.documentElement.style.setProperty("--rose-700", shadeColor(brandColor, -24));
  document.documentElement.style.setProperty("--rose-900", shadeColor(brandColor, -55));
  document.documentElement.style.setProperty("--rose-300", shadeColor(brandColor, 42));
  document.documentElement.style.setProperty("--rose-100", shadeColor(brandColor, 82));
  document.documentElement.style.setProperty("--page-start", shadeColor(brandColor, 90));
  document.documentElement.style.setProperty("--page-mid", shadeColor(brandColor, 84));
  document.documentElement.style.setProperty("--page-end", shadeColor(accentColor, 62));
  document.documentElement.style.setProperty("--champagne", accentColor);
  document.documentElement.style.setProperty("--hero-image", `url("${sanitizeCssUrl(settings.heroImageUrl)}")`);

  document.querySelectorAll(".brand-row").forEach((row) => {
    const mark = row.querySelector(".brand-mark");
    const label = row.querySelector("span:not(.brand-mark)");
    if (mark) mark.textContent = getBrandInitials(salonName);
    if (label) label.textContent = `${salonName} ${branchName}`;
  });
}

function getBrandInitials(name) {
  return String(name || "")
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
  if (!url || (!/^https?:\/\//i.test(url) && !url.startsWith("/uploads/"))) return fallback;
  return url.replaceAll('"', "%22");
}

async function loadAnalytics() {
  const data = await adminFetch("/api/admin/analytics");
  const analytics = data.analytics || {};
  const topServices = analytics.topServices || [];
  const topSpecialists = analytics.topSpecialists || [];
  analyticsGrid.innerHTML = `
    <article class="stat-card"><span>${tr("total")}</span><strong>${analytics.totalBookings || 0}</strong></article>
    <article class="stat-card"><span>${tr("activeBookings")}</span><strong>${analytics.activeBookings || 0}</strong></article>
    <article class="stat-card"><span>${tr("completed")}</span><strong>${analytics.completed || 0}</strong></article>
    <article class="stat-card"><span>${tr("noShow")}</span><strong>${analytics.noShow || 0}</strong></article>
    <article class="insight-card">
      <h3>${tr("topServices")}</h3>
      ${renderTopList(topServices)}
    </article>
    <article class="insight-card">
      <h3>${tr("topSpecialists")}</h3>
      ${renderTopList(topSpecialists)}
    </article>
  `;
}

function renderTopList(items) {
  if (!items.length) return `<p class="admin-empty">${tr("noData")}</p>`;
  return items.map((item) => `<p><strong>${escapeHtml(item.name)}</strong><span>${item.count}</span></p>`).join("");
}

function renderCalendar() {
  const day = calendarDate.value || toDateValue(new Date());
  const dayBookings = bookings
    .filter((booking) => booking.date === day)
    .sort((a, b) => a.time.localeCompare(b.time));

  calendarBoard.innerHTML = specialists
    .filter((specialist) => specialist.active)
    .map((specialist) => {
      const items = dayBookings.filter((booking) => booking.specialistId === specialist.id);
      return `
        <article class="calendar-column">
          <h3>${escapeHtml(specialist.name)}</h3>
          ${
            items.length
              ? items
                  .map(
                    (booking) => `
                    <div class="calendar-item status-${escapeHtml(booking.status)}">
                      <strong>${escapeHtml(booking.time)}-${escapeHtml(booking.endTime)}</strong>
                      <span>${escapeHtml(booking.clientName)}</span>
                      <small>${escapeHtml(booking.serviceName)} · ${escapeHtml(booking.status)}</small>
                    </div>
                  `
                  )
                  .join("")
              : `<p class="admin-empty">${tr("freeDay")}</p>`
          }
        </article>
      `;
    })
    .join("");
}

function populateManualServices() {
  manualService.innerHTML = services
    .filter((service) => service.active)
    .map((service) => `<option value="${escapeHtml(service.id)}">${escapeHtml(service.name)}</option>`)
    .join("");
  populateManualSpecialists();
}

function populateManualSpecialists() {
  const serviceId = manualService.value;
  manualSpecialist.innerHTML = specialists
    .filter((specialist) => specialist.active && (specialist.serviceIds || []).includes(serviceId))
    .map((specialist) => `<option value="${escapeHtml(specialist.id)}">${escapeHtml(specialist.name)}</option>`)
    .join("");
}

async function loadManualAvailability() {
  if (!manualService.value || !manualSpecialist.value || !manualDate.value) return;
  try {
    const params = new URLSearchParams({
      serviceId: manualService.value,
      specialistId: manualSpecialist.value,
      date: manualDate.value
    });
    const data = await publicFetch(`/api/availability?${params.toString()}`);
    manualTime.innerHTML = (data.slots || [])
      .filter((slot) => slot.available)
      .map((slot) => `<option value="${escapeHtml(slot.time)}">${escapeHtml(slot.time)}-${escapeHtml(slot.endTime)}</option>`)
      .join("");
  } catch (error) {
    manualTime.innerHTML = "";
    showToast(error.message, "error");
  }
}

async function createManualBooking() {
  const data = await adminFetch("/api/admin/bookings", {
    method: "POST",
    body: JSON.stringify({
      clientName: manualClientName.value.trim(),
      phone: manualPhone.value.trim(),
      serviceId: manualService.value,
      specialistId: manualSpecialist.value,
      date: manualDate.value,
      time: manualTime.value
    })
  });
  bookings = [data.booking, ...bookings];
  manualClientName.value = "";
  manualPhone.value = "";
  renderBookings();
  renderCalendar();
  await loadAnalytics();
  showToast(tr("manualBookingAdded"));
}

function populateExceptionSpecialists() {
  exceptionSpecialist.innerHTML = specialists
    .filter((specialist) => specialist.active)
    .map((specialist) => `<option value="${escapeHtml(specialist.id)}">${escapeHtml(specialist.name)}</option>`)
    .join("");
}

async function loadExceptions() {
  const data = await adminFetch("/api/admin/exceptions");
  exceptions = data.exceptions || [];
  renderExceptions();
}

function renderExceptions() {
  exceptionList.innerHTML = exceptions.length
    ? exceptions
        .map((item) => {
          const specialist = specialists.find((person) => person.id === item.specialistId);
          const timeLabel = item.isDayOff ? tr("dayOff") : `${item.start}-${item.end}`;
          return `
            <article class="compact-item">
              <div>
                <strong>${escapeHtml(specialist?.name || item.specialistId)}</strong>
                <span>${escapeHtml(item.date)} · ${escapeHtml(timeLabel)} ${item.note ? `· ${escapeHtml(item.note)}` : ""}</span>
              </div>
              <button class="admin-button danger" data-delete-exception="${escapeHtml(item.id)}">${tr("delete")}</button>
            </article>
          `;
        })
        .join("")
    : `<p class="admin-empty">${tr("noUpcomingExceptions")}</p>`;

  exceptionList.querySelectorAll("[data-delete-exception]").forEach((button) => {
    button.addEventListener("click", async () => {
      await withButtonState(button, tr("deleting"), async () => {
        await adminFetch(`/api/admin/exceptions/${button.dataset.deleteException}`, { method: "DELETE" });
        exceptions = exceptions.filter((item) => item.id !== button.dataset.deleteException);
        renderExceptions();
        showToast(tr("exceptionDeleted"));
      });
    });
  });
}

async function createException() {
  const data = await adminFetch("/api/admin/exceptions", {
    method: "POST",
    body: JSON.stringify({
      specialistId: exceptionSpecialist.value,
      date: exceptionDate.value,
      isDayOff: exceptionDayOff.checked,
      start: exceptionStart.value,
      end: exceptionEnd.value,
      note: exceptionNote.value.trim()
    })
  });
  exceptions = [data.exception, ...exceptions];
  exceptionNote.value = "";
  renderExceptions();
  await loadManualAvailability();
  showToast(tr("exceptionAdded"));
}

async function loadNotes() {
  const data = await adminFetch("/api/admin/notes");
  notes = data.notes || [];
  renderNotes();
}

function renderNotes() {
  noteList.innerHTML = notes.length
    ? notes
        .map(
          (note) => `
          <article class="compact-item">
            <div>
              <strong>${escapeHtml(note.clientName || note.phone)}</strong>
              <span>${escapeHtml(note.phone)} · ${escapeHtml(note.note)}</span>
            </div>
          </article>
        `
        )
        .join("")
    : `<p class="admin-empty">${tr("noClientNotes")}</p>`;
}

async function createNote() {
  const data = await adminFetch("/api/admin/notes", {
    method: "POST",
    body: JSON.stringify({
      clientName: noteClientName.value.trim(),
      phone: notePhone.value.trim(),
      note: noteText.value.trim()
    })
  });
  notes = [data.note, ...notes];
  noteText.value = "";
  renderNotes();
  showToast(tr("clientNoteSaved"));
}

async function loadReminders() {
  const data = await adminFetch("/api/admin/reminders");
  const candidates = data.candidates || [];
  reminderList.innerHTML = candidates.length
    ? candidates
        .map(
          (booking) => `
          <article class="compact-item">
            <div>
              <strong>${escapeHtml(booking.clientName)}</strong>
              <span>${escapeHtml(booking.date)} ${escapeHtml(booking.time)} · ${escapeHtml(booking.serviceName)}</span>
            </div>
          </article>
        `
        )
        .join("")
    : `<p class="admin-empty">${tr("noReminders")}</p>`;
}

function renderStats(stats) {
  const items = [
    [tr("today"), stats.today || 0],
    [tr("tomorrow"), stats.tomorrow || 0],
    [tr("upcoming"), stats.upcoming || 0],
    [tr("cancelled"), stats.cancelled || 0],
    [tr("noShow"), stats.noShow || 0]
  ];

  statsGrid.innerHTML = items
    .map(
      ([label, value]) => `
        <article class="stat-card">
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `
    )
    .join("");
}

function renderBookings() {
  const today = toDateValue(new Date());
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = toDateValue(tomorrowDate);

  const visibleBookings = bookings.filter((booking) => {
    if (activeFilter === "today") return booking.date === today;
    if (activeFilter === "tomorrow") return booking.date === tomorrow;
    if (activeFilter === "confirmed") return booking.status === "confirmed";
    if (activeFilter === "cancelled") return booking.status === "cancelled";
    if (activeFilter === "no_show") return booking.status === "no_show";
    return true;
  });

  if (!visibleBookings.length) {
    bookingList.innerHTML = `<p class="admin-empty">${tr("noBookings")}</p>`;
    return;
  }

  bookingList.innerHTML = visibleBookings
    .map(
      (booking) => `
        <article class="booking-card">
          <div>
            <span class="status-badge status-${escapeHtml(booking.status)}">${escapeHtml(booking.status)}</span>
            <h3>${escapeHtml(booking.clientName)} - ${escapeHtml(booking.serviceName)}</h3>
            <p>
              ${formatDate(booking.date)} · ${escapeHtml(booking.time)}${booking.endTime ? `-${escapeHtml(booking.endTime)}` : ""}
              · ${escapeHtml(booking.specialistName)}
            </p>
            <p>${escapeHtml(booking.phone)} ${booking.username ? `@${escapeHtml(booking.username)}` : ""}</p>
          </div>
          <div class="admin-actions">
            <button class="admin-button primary" data-status="completed" data-id="${escapeHtml(booking.id)}">${tr("complete")}</button>
            <button class="admin-button" data-status="cancelled" data-id="${escapeHtml(booking.id)}">${tr("cancel")}</button>
            <button class="admin-button" data-status="confirmed" data-id="${escapeHtml(booking.id)}">${tr("restore")}</button>
            <button class="admin-button" data-status="no_show" data-id="${escapeHtml(booking.id)}">${tr("noShow")}</button>
            <button class="admin-button" data-reschedule="${escapeHtml(booking.id)}">${tr("reschedule")}</button>
          </div>
        </article>
      `
    )
    .join("");

  bookingList.querySelectorAll("[data-status]").forEach((button) => {
    button.addEventListener("click", async () => {
      await withButtonState(button, tr("saving"), async () => updateStatus(button.dataset.id, button.dataset.status));
    });
  });

  bookingList.querySelectorAll("[data-reschedule]").forEach((button) => {
    button.addEventListener("click", async () => {
      const booking = bookings.find((item) => item.id === button.dataset.reschedule);
      const date = window.prompt(tr("newDate"), booking?.date || "");
      if (!date) return;
      const time = window.prompt(tr("newTime"), booking?.time || "");
      if (!time) return;
      await withButtonState(button, tr("saving"), async () => rescheduleBooking(button.dataset.reschedule, date, time));
    });
  });
}

async function updateStatus(id, status) {
  const data = await adminFetch(`/api/admin/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });

  bookings = bookings.map((booking) => (booking.id === id ? data.booking : booking));
  renderBookings();
  await loadBookings();
  showToast(`${tr("bookingMarked")} ${status}.`);
}

async function rescheduleBooking(id, date, time) {
  const data = await adminFetch(`/api/admin/bookings/${id}/reschedule`, {
    method: "PATCH",
    body: JSON.stringify({ date, time })
  });
  bookings = bookings.map((booking) => (booking.id === id ? data.booking : booking));
  renderBookings();
  renderCalendar();
  showToast(tr("bookingRescheduled"));
}

async function uploadImageIntoInput(fileInput, targetInput) {
  const file = fileInput.files?.[0];
  if (!file || !targetInput) {
    return;
  }

  updateUploadLabel(fileInput, file.name);
  try {
    const formData = new FormData();
    formData.append("image", file);
    const data = await adminFetch("/api/admin/uploads", {
      method: "POST",
      body: formData
    });
    targetInput.value = data.url;
    showToast(adminLanguage === "hy" ? "Նկարը ավելացվեց։ Սեղմիր պահպանել։" : "Image uploaded. Save changes.");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    fileInput.value = "";
  }
}

function updateUploadLabel(fileInput, name = "") {
  const label = fileInput.closest(".upload-field")?.querySelector(".upload-name");
  if (!label) {
    return;
  }
  label.dataset.hasFile = name ? "true" : "";
  label.textContent = name || tr("noImageChosen");
}

async function adminFetch(url, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(url, {
    ...options,
    headers: {
      "x-admin-password": adminPassword,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {})
    }
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.detail || "Something went wrong.");
  }

  return data;
}

async function publicFetch(url) {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.detail || "Something went wrong.");
  }
  return data;
}

async function withButtonState(button, label, action) {
  const original = button.textContent;
  button.disabled = true;
  button.classList.add("is-loading");
  button.textContent = label;

  try {
    return await action();
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    button.disabled = false;
    button.classList.remove("is-loading");
    button.textContent = original;
  }
}

function showToast(message, type = "success") {
  clearTimeout(toastTimer);
  adminToast.textContent = message;
  adminToast.className = `admin-toast show ${type}`;
  toastTimer = setTimeout(() => {
    adminToast.className = "admin-toast";
  }, 2600);
}

function openModal(modal) {
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(modal) {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function pulse(element) {
  element.classList.remove("just-saved");
  void element.offsetWidth;
  element.classList.add("just-saved");
}

function formatDate(value) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(date);
}

function toDateValue(date) {
  return date.toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
