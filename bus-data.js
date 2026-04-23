const busRoutes = {
    "Udupi": [
        "05:30 AM", "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", 
        "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", 
        "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"
    ],
    "Bantwal": [
        "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:30 AM", "09:30 AM", "10:30 AM", 
        "11:30 AM", "12:30 PM", "01:30 PM", "02:30 PM", "03:30 PM", "04:30 PM", "05:30 PM", 
        "06:30 PM", "07:30 PM"
    ],
    "Puttur": [
        "05:45 AM", "06:30 AM", "07:30 AM", "08:30 AM", "10:00 AM", "11:30 AM", "01:00 PM", 
        "02:30 PM", "04:00 PM", "05:30 PM", "06:30 PM"
    ],
    "Moodbidri": [
        "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", "09:30 AM", 
        "10:30 AM", "11:30 AM", "12:30 PM", "01:30 PM", "02:30 PM", "03:30 PM", "04:30 PM", 
        "05:30 PM", "06:30 PM", "07:30 PM"
    ],
    "Belthangady": [
        "06:30 AM", "08:00 AM", "10:30 AM", "12:30 PM", "02:30 PM", "04:30 PM", "05:30 PM"
    ],
    "Sullia": [
        "06:00 AM", "08:30 AM", "11:00 AM", "02:00 PM", "04:30 PM", "06:00 PM"
    ],
    "Hassan": [
        "05:15 AM", "06:30 AM", "08:00 AM", "09:30 AM", "11:00 AM", "01:00 PM", "03:00 PM", 
        "05:00 PM", "07:00 PM"
    ]
};

// Expose to window for the module script to use without Vite packing everything
window.busData = busRoutes;
