// --- หน้า dashboard.html (My Meetings) ---
/*async function loadMyMeetings() {
    try {
        const { data: rooms, error } = await supabase
            .from('rooms')
            .select('*');

        if (error) throw error;

        const container = document.getElementById('meetingsContainer');
        if (rooms.length === 0) {
            // แสดงสถานะ No meetings yet
            container.innerHTML = `<p>No meetings yet. Create one to get started!</p>`;
        } else {
            // วนลูปสร้าง Card ตามข้อมูลจริง (Realistic Data)
            container.innerHTML = rooms.map(room => `
                <div class="meeting-card">
                    <h3>${room.meeting_name} <span class="badge">Active</span></h3>
                    <p>${room.start_date} - ${room.end_date}</p>
                    <button onclick="location.href='results.html?id=${room.id}'">View Results</button>
                    <button onclick="location.href='vote.html?id=${room.id}'">Add Availability</button>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error("Error loading meetings:", err.message);
    }
}*/
import { supabase } from './supabase-config.js';

async function checkAuth() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
        window.location.href = "login.html";
    }
}

async function loadMyMeetings() {

    const { data: userData } = await supabase.auth.getUser();

    const { data: meetings, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('user_id', userData.user.id);   // ✅ filter ตาม owner

    const container = document.getElementById('meetingsContainer');

    if (!meetings || meetings.length === 0) {
        container.innerHTML = `<p>No meetings yet.</p>`;
        return;
    }

    container.innerHTML = meetings.map(meeting => `
        <div class="meeting-card">
            <h3>${meeting.title}</h3>
            <p>${meeting.dates.start} - ${meeting.dates.end}</p>
            <button onclick="location.href='results.html?id=${meeting.id}'">
                View Results
            </button>
            <button onclick="location.href='vote.html?id=${meeting.id}'">
                Add Availability
            </button>
        </div>
    `).join('');
}

async function logout() {
    await supabase.auth.signOut();
    window.location.href = "login.html";
}

window.logout = logout;

checkAuth().then(loadMyMeetings);