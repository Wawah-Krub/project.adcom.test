import { supabase } from './supabase-config.js';

const params = new URLSearchParams(window.location.search);
const roomId = params.get("id");

if (!roomId) {
  document.body.innerHTML = "ไม่พบรหัสห้อง";
}

loadICS();

async function loadICS() {
  try {
    const { data: meeting, error } = await supabase
      .from("meetings") // ตรวจสอบชื่อ Table อีกครั้ง
      .select("*")      // ดึงมาทั้งหมดก่อนเพื่อเช็คชื่อ Column
      .eq("id", roomId)
      .single();

    if (error || !meeting) throw new Error("ไม่พบข้อมูลการนัดหมาย");

    // สมมติว่าใช้ Column ชื่อ meeting_name และ selected_time
    const title = meeting.title || meeting.meeting_name || "GroupSync Meeting";
    const timeValue = meeting.selected_time;

    if (!timeValue) {
      document.body.innerHTML = "<h2>⚠️ ยังไม่ได้เลือกเวลานัดหมาย</h2>";
      return;
    }

    // แก้ปัญหาเรื่องฟอร์แมตวันที่ (รองรับทั้งแบบมี T และไม่มี T)
    const normalizedTime = timeValue.replace(" ", "T");
    const start = new Date(normalizedTime);
    
    if (isNaN(start.getTime())) throw new Error("รูปแบบวันที่ไม่ถูกต้อง");

    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const cal = ics();
    cal.addEvent(title, "Scheduled via GroupSync", "Online", start, end);
    cal.download(title);

    document.body.innerHTML = `<h2>✅ ดาวน์โหลดไฟล์ ${title}.ics สำเร็จ</h2>`;
  } catch (err) {
    console.error(err);
    document.body.innerHTML = `<h2>❌ เกิดข้อผิดพลาด: ${err.message}</h2>`;
  }
}