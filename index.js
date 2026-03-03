import { supabase } from './supabase-config.js';

const { data } = await supabase.auth.getSession();

if (!data.session) {
    window.location.href = "login.html";
}

// 1. โลจิคเลือกประเภทการประชุม (Toggle Active State)
const typeButtons = document.querySelectorAll('.type-btn');
let selectedType = "Group Work";

typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // ลบ class active จากปุ่มอื่น
        typeButtons.forEach(b => b.classList.remove('active'));
        // เพิ่ม class active ให้ปุ่มที่คลิก
        btn.classList.add('active');
        selectedType = btn.innerText;
    });
});

// 2. โลจิคส่งข้อมูลไป Database เมื่อกด Continue
const btnContinue = document.getElementById('btnContinue');

btnContinue.addEventListener('click', async () => {

    const name = document.getElementById('meetingName').value;
    const start = document.getElementById('startDate').value;
    const end = document.getElementById('endDate').value;

    if (!name || !start || !end) {
        alert("Please fill in all fields!");
        return;
    }

    // ✅ ดึง user ที่ login อยู่
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    const meetingData = {
        title: name,
        type: selectedType,
        dates: { start: start, end: end },
        user_id: userData.user.id   // 👈 เพิ่มบรรทัดนี้
    };

    const { data, error } = await supabase
        .from('meetings')
        .insert([meetingData])
        .select();

    try{
        // เมื่อบันทึกสำเร็จ ให้ย้ายไปหน้า Dashboard พร้อมรหัสห้อง
        if (data && data.length > 0) {
        window.location.href = `vote.html?id=${data[0].id}`;
        }
    } catch (err) {
        console.error("Error creating meeting:", err.message);
        alert("Failed to create meeting. Please try again.");
    }
});

const today = new Date();

// แปลงให้อยู่ในรูปแบบ YYYY-MM-DD
const formattedDate = today.toISOString().split("T")[0];

document.getElementById("startDate").value = formattedDate;
document.getElementById("endDate").value = formattedDate;