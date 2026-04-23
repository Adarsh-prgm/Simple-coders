// DOM Elements
const loginScreen = document.getElementById('login-screen');
const welcomeScreen = document.getElementById('welcome-screen');
const mainApp = document.getElementById('main-app');
const continueBtn = document.getElementById('continue-btn');
const nameInput = document.getElementById('name-input');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const usernameDisplay = document.getElementById('username');

// Welcome Animation Elements
const welcomeTitle = document.getElementById('welcome-title');
const welcomeSubtitle = document.getElementById('welcome-subtitle');

// Form Elements
const searchForm = document.getElementById('search-form');
const destinationSelect = document.getElementById('destination');
const travelTimeInput = document.getElementById('travel-time');
const resultsArea = document.getElementById('results-area');

// Modal Elements
const modal = document.getElementById('schedule-modal');
const modalContent = document.getElementById('schedule-modal-content');
const closeModalBtn = document.getElementById('close-modal');
const scheduleList = document.getElementById('schedule-list');
const modalTitle = document.getElementById('modal-title');

// Initialize Bus Data from window (loaded via bus-data.js)
const busData = window.busData;

// --- Authentication Flow --- //

// Check LocalStorage on load
const storedName = localStorage.getItem('quickbus_user');
if (storedName) {
    handleSuccessfulLogin(storedName, true); // true = skip animation if desired, but user said "When user refreshes -> If name exists -> Skip login screen -> Directly open main app". Let's skip login screen and show app immediately.
} else {
    // Show login screen
    mainApp.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    loginScreen.style.opacity = '1';
}

// Login Button Click
continueBtn.addEventListener('click', () => {
    loginError.classList.add('hidden');
    loginError.innerText = '';
    
    const name = nameInput.value.trim();
    if (!name) {
        loginError.innerText = 'Please enter your name.';
        loginError.classList.remove('hidden');
        return;
    }

    // Save to local storage
    localStorage.setItem('quickbus_user', name);
    handleSuccessfulLogin(name, false);
});

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('quickbus_user');
    window.location.reload();
});

// Play Welcome Animation & Transition to Main App
function handleSuccessfulLogin(name, isReturningUser) {
    usernameDisplay.innerText = "Welcome, " + name;
    
    // 1. Hide Login Screen
    loginScreen.style.opacity = '0';
    setTimeout(() => {
        loginScreen.classList.add('hidden');
        
        if (isReturningUser) {
            // Directly show main app
            mainApp.classList.remove('hidden');
            mainApp.classList.remove('opacity-0');
            mainApp.style.opacity = '1';
        } else {
            // 2. Show Welcome Animation Screen
            welcomeScreen.classList.remove('hidden');
            void welcomeScreen.offsetWidth; // Reflow
            welcomeScreen.classList.remove('opacity-0');
            welcomeScreen.style.opacity = '1';

            // Animate elements in
            setTimeout(() => {
                welcomeTitle.classList.remove('translate-y-10', 'opacity-0');
                welcomeTitle.classList.add('translate-y-0', 'opacity-100');
                
                welcomeSubtitle.classList.remove('translate-y-5', 'opacity-0');
                welcomeSubtitle.classList.add('translate-y-0', 'opacity-100');
            }, 100);

            // 3. Keep for 2 seconds, then transition to Main App
            setTimeout(() => {
                welcomeScreen.style.opacity = '0';
                setTimeout(() => {
                    welcomeScreen.classList.add('hidden');
                    welcomeTitle.classList.remove('translate-y-0', 'opacity-100');
                    welcomeSubtitle.classList.remove('translate-y-0', 'opacity-100');
                    welcomeTitle.classList.add('translate-y-10', 'opacity-0');
                    welcomeSubtitle.classList.add('translate-y-5', 'opacity-0');
                    
                    // Show Main App
                    mainApp.classList.remove('hidden');
                    void mainApp.offsetWidth; // Reflow
                    mainApp.style.opacity = '1';
                    mainApp.classList.remove('opacity-0');

                }, 1000); // Wait for fade out
            }, 2000); // Showing duration
        }
    }, 500);
}
// --- Bus Timing Logic --- //

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const destination = destinationSelect.value;
    const timeStr = travelTimeInput.value;

    if (!destination || !timeStr) return;

    findBusTimings(destination, timeStr);
});

function parseTimeToMinutes(timeStr) {
    // Expected format: "14:30" (24hr from input form)
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function parseAmPmToMinutes(amPmStr) {
    // Expected format: "05:30 AM"
    const [time, modifier] = amPmStr.split(' ');
    let [hours, minutes] = time.split(':');
    
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);
    
    if (hours === 12) {
      hours = modifier === 'AM' ? 0 : 12;
    } else if (modifier === 'PM') {
      hours += 12;
    }
    
    return hours * 60 + minutes;
}

function findBusTimings(destination, userTimeStr) {
    const timings = busData[destination];
    if (!timings) return;

    const userTimeMins = parseTimeToMinutes(userTimeStr);
    
    // Sort array by minute values just in case
    const parsedTimings = timings.map(t => ({
        original: t,
        mins: parseAmPmToMinutes(t)
    })).sort((a, b) => a.mins - b.mins);

    let nextBus = null;
    let nextBusIndex = -1;

    for (let i = 0; i < parsedTimings.length; i++) {
        if (parsedTimings[i].mins >= userTimeMins) {
            nextBus = parsedTimings[i];
            nextBusIndex = i;
            break;
        }
    }

    let previousBus = null;
    let alternativeBus = null;

    if (nextBus) {
        if (nextBusIndex > 0) {
            previousBus = parsedTimings[nextBusIndex - 1];
        }
        if (nextBusIndex < parsedTimings.length - 1) {
            alternativeBus = parsedTimings[nextBusIndex + 1];
        }
    } else {
        // If user time is after the last bus, standard behavior is no next bus today
        previousBus = parsedTimings[parsedTimings.length - 1];
    }

    displayResults(destination, userTimeMins, nextBus, previousBus, alternativeBus, timings);
}

function formatWaitTime(diffMins) {
    if (diffMins === 0) return "Departs Now";
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    if (h > 0) return `${h}h ${m}m away`;
    return `${m}m away`;
}

function format12Hour(minutes) {
    let h = Math.floor(minutes / 60);
    let m = minutes % 60;
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function displayResults(destination, userMins, nextBus, prevBus, altBus, fullSchedule) {
    resultsArea.innerHTML = '';
    resultsArea.classList.remove('hidden');

    // Title Result
    let html = `<h4 class="text-xl font-bold mb-4">Results for Mangalore to ${destination}</h4>`;

    if (!nextBus) {
        html += `
            <div class="glass-card p-5 rounded-2xl border-l-4 border-red-500 mb-4 slide-up">
                <div class="text-gray-300 text-sm mb-1">Status</div>
                <div class="text-xl font-semibold text-white">No more buses today.</div>
                ${prevBus ? `<div class="text-sm text-gray-400 mt-2">Last bus was at <span class="font-bold text-white">${prevBus.original}</span></div>` : ''}
            </div>
        `;
    } else {
        const waitMins = nextBus.mins - userMins;
        const waitText = formatWaitTime(waitMins);
        
        let statusColor = waitMins <= 15 ? 'text-green-400' : 'text-blue-400';

        html += `
            <div class="glass-card highlighted p-5 rounded-2xl mb-4 slide-up">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="text-sm text-blue-200 mb-1 tracking-wide uppercase font-semibold">Next Available Bus</div>
                        <div class="text-4xl font-extrabold text-white mb-2 drop-shadow-md">${nextBus.original}</div>
                    </div>
                    <div class="text-right">
                        <div class="bg-white/10 px-3 py-1 rounded-full border border-white/20 text-xs text-white backdrop-blur shadow-sm inline-block">Wait Time</div>
                        <div class="text-xl font-bold ${statusColor} mt-1">${waitText}</div>
                    </div>
                </div>
            </div>
        `;

        if (altBus) {
            html += `
                <div class="glass-card p-4 rounded-xl flex justify-between items-center slide-up" style="animation-delay: 0.1s">
                    <span class="text-gray-300">Following Bus</span>
                    <span class="font-bold text-white">${altBus.original}</span>
                </div>
            `;
        }
    }

    // Add "Read More" Full Schedule Button
    html += `
        <button id="view-schedule-btn" class="w-full mt-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition-colors duration-300 slide-up" style="animation-delay: 0.2s">
            View Full Schedule (${fullSchedule.length} Buses)
        </button>
    `;

    resultsArea.innerHTML = html;

    // Attach Modal Logic
    document.getElementById('view-schedule-btn').addEventListener('click', () => {
        openModal(destination, fullSchedule);
    });
}

// --- Modal Logic --- //

function openModal(destination, schedule) {
    modalTitle.textContent = `${destination} Schedule`;
    scheduleList.innerHTML = '';
    
    schedule.forEach((time, index) => {
        const li = document.createElement('li');
        li.className = "flex justify-between items-center p-3 glass-card rounded-lg border border-white/5";
        li.innerHTML = `
            <span class="text-gray-400 text-sm">Bus #${index + 1}</span>
            <span class="font-bold text-white">${time}</span>
        `;
        scheduleList.appendChild(li);
    });

    modal.classList.add('show-modal');
    setTimeout(() => {
        modalContent.classList.add('show-modal-content');
    }, 10); // slightly delay for transform transition
}

closeModalBtn.addEventListener('click', () => {
    modalContent.classList.remove('show-modal-content');
    setTimeout(() => {
        modal.classList.remove('show-modal');
    }, 300);
});

// Close modal on outside click
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModalBtn.click();
    }
});
