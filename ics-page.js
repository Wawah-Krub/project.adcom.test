
const supabaseUrl = 'https://rrcvjagvsixepvyopuuy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyY3ZqYWd2c2l4ZXB2eW9wdXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDM4MTksImV4cCI6MjA4ODM3OTgxOX0.A96E4dXZI2b_EX4CAbW84RI2mkotlqKHAN6FnST5wus';

// สร้างตัวเชื่อมต่อและส่งออกไปให้ไฟล์อื่นใช้
export const supabase = createClient(supabaseUrl, supabaseKey)

async function loadICS() {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get("id");

    if (!roomId) {
        document.getElementById('status').innerText = "❌ ไม่พบ ID ในลิงก์";
        return;
    }

    // ดึงข้อมูลจากตาราง (ลองเช็คว่าชื่อ 'rooms' หรือ 'meetings')
    const { data: meeting, error } = await supabase
        .from("rooms") 
        .select("*")
        .eq("id", roomId)
        .single();

    if (error || !meeting) {
        document.getElementById('status').innerText = "❌ ไม่พบข้อมูลการนัดหมาย";
        return;
    }

    const title = meeting.meeting_name || meeting.title || "GroupSync Meeting";
    const timeValue = meeting.selected_time;

    if (!timeValue) {
        document.getElementById('status').innerText = "⚠️ ยังไม่ได้สรุปเวลานัดหมาย";
        return;
    }

    try {
        const cal = ics();
        const start = new Date(timeValue.replace(" ", "T"));
        const end = new Date(start.getTime() + 60 * 60 * 1000);

        cal.addEvent(title, "Scheduled via GroupSync", "Online", start, end);
        cal.download(title);

        document.getElementById('status').innerText = "✅ ดาวน์โหลดสำเร็จ!";
    } catch (e) {
        document.getElementById('status').innerText = "❌ เกิดข้อผิดพลาดในการสร้างไฟล์";
    }
}

loadICS();