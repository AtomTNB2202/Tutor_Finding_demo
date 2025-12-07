// ==== FAKE DATABASE FOR DEMO ====

window.fakeDB = {
    currentUser: {
        id: "s001",
        role: "student",
        fullName: "Nguyen Minh Khoi",
        email: "khoi@hcmut.edu.vn",
        major: "Computer Engineering",
        gpa: 3.57,
        credits: 85,
        avatar: "https://i.pravatar.cc/120?img=55"
    },

    tutors: [
        {
            id: "t01",
            name: "Tran Ngoc Thoai",
            email: "tutor.thoai@hcmut.edu.vn",
            subject: "OOP",
            availability: [
                { id: "slot_01", date: "2025-01-20", time: "14:00 - 16:00", mode: "Online" },
                { id: "slot_02", date: "2025-01-23", time: "09:00 - 11:00", mode: "In Person" }
            ]
        },
        {
            id: "t02",
            name: "Le Gia Huy",
            email: "tutor.huy@hcmut.edu.vn",
            subject: "DSA",
            availability: [
                { id: "slot_03", date: "2025-01-21", time: "08:00 - 10:00", mode: "Online" }
            ]
        }
    ],

    sessions: [
        {
            id: "sess01",
            date: "2025-01-19",
            time: "13:00 - 14:00",
            tutorId: "t01",
            subject: "OOP",
            mode: "Online",
            status: "Scheduled"
        }
    ],

    resources: [
        {
            id: "res01",
            title: "DSA Full Slides",
            type: "PDF",
            thumbnail: "https://picsum.photos/400?1",
            link: "https://example.com/dsa.pdf"
        },
        {
            id: "res02",
            title: "Graph Theory Article",
            type: "Article",
            thumbnail: "https://picsum.photos/400?2",
            link: "#"
        }
    ],

    feedback: []
};

// === Helper functions ===
window.db = {
    getUser() {
        return fakeDB.currentUser;
    },

    getSessions() {
        return fakeDB.sessions;
    },

    getTutors() {
        return fakeDB.tutors;
    },

    getResources() {
        return fakeDB.resources;
    },

    cancelSession(id) {
        const s = fakeDB.sessions.find(x => x.id === id);
        if (s) s.status = "Canceled";
    },

    addFeedback(entry) {
        fakeDB.feedback.push(entry);
    }
};
