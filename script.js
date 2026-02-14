// --- ส่วนของหน้า index.html ---
const btnCreate = document.getElementById('btnCreate');
if (btnCreate) {
btnCreate.onclick = function() {
const mockId = "ROOM123";
window.location.href = "vote.html?id=" + mockId;
};
}

// --- ส่วนของหน้า vote.html ---
const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const roomDisplay = document.getElementById('roomName');

if (id && roomDisplay) {
roomDisplay.innerText = id;
}

// ส่วนที่ทำให้ไฟล์ลงคอม
const btnDownload = document.getElementById('btnDownload');
if (btnDownload) {
    btnDownload.onclick = function() {
        try {
            var cal = ics();
            cal.addEvent("นัดทำโปรเจกต์", "มาเจอกันนะ", "ตึกคอม", "2026-02-10 10:00", "2026-02-10 12:00");
            cal.download("my-plan");
            alert("กำลังดาวน์โหลดไฟล์...");
        } catch (error) {
            console.error(error);
            alert("เกิดข้อผิดพลาด: " + e.message);
        }
    };
}

// 1.จัดการชื่อผู้ใช้
//ดึงชื่อมาโชว์เมื่อเปิดเว็บ
window.addEventListener('load', () => {
    const savedName = localStorage.getItem('userNickname');
    const nameInput = document.getElementById('nickname'); // ไอดีช่องกรอกชื่อจาก UI

    if (savedName && nameInput) {
        nameInput.value = savedName;
        console.log("ดึงชื่อเล่นเดิม: " + savedName);
    }
});

//บันทึกชื่อ (เรียกใช้ผ่าน event oninput ใน HTML)
function saveNickname(value) {
    localStorage.setItem('userNickname', value);
}

// 2. CELL TOGGLE LOGIC (ระบบคลิกเปลี่ยนสถานะ)
const voteTable = document.getElementById('voteTable'); // ต้องตรงกับ ID ตารางที่ UI ทำ

if (voteTable) {
    voteTable.addEventListener('click', (e) => {
        const cell = e.target;

        // ตรวจสอบว่าต้องเป็นช่องตารางที่มีคลาส vote-cell เท่านั้น
        if (cell.tagName === 'TD' && cell.classList.contains('vote-cell')) {

        // อ่านค่าสถานะปัจจุบัน (ไม่มี= 0)
            let currentState = parseInt(cell.getAttribute('data-state')) || 0;

        // คำนวณสถานะถัดไป (0 -> 1 -> 2 -> 0)
        // 0 = ว่าง (ขาว), 1 = สะดวกมาก (เขียวเข้ม), 2 = พอได้ (เขียวอ่อน)
            let nextState = (currentState + 1) % 3;

        // อัปเดตข้อมูลกลับไปที่ Element
            cell.setAttribute('data-state', nextState);

        // เปลี่ยน Class เพื่อให้ CSS แสดงสี (state-0, state-1, state-2)
            cell.className = `vote-cell state-${nextState}`;

            console.log(`ช่อง ${cell.id} เปลี่ยนเป็นสถานะ ${nextState} `);
        }
    });
}

// 3.Weight calculation ข้อมูลส่งต่อให้ DB
//รวมข้อมูลทั้งหมดในตารางแปลงเป็น JSON
function getVotingResults() {
    const nickname = localStorage.getItem('userNickname');

    //ถ้าเพื่อนยังไม่ใส่ชื่อ
    if (!nickname || nickname.trim() === "") {
        alert("กรุณาใส่ชื่อเล่นก่อนบันทึกนะ!");
        return null;
    }

    const cells = document.querySelectorAll('.vote-cell');
    let votes = {};

    cells.forEach(cell => {
        const state = parseInt(cell.getAttribute('data-state')) || 0;
        let weight = 0;

        // แปลงสถานะเป็นคะแนน (Weight)
        if (state === 1) weight = 2; // เขียวเข้ม = 2 คะแนน
        else if (state === 2) weight = 1; // เขียวอ่อน = 1 คะแนน
        // ถ้าเป็น 0 คะแนนจะเป็น 0 อยู่แล้ว

        // เก็บข้อมูลโดยใช้ ID ช่องเป็น Key (เช่น "2026-02-14_0900": 2)
        votes[cell.id] = weight;
    });

    const finalData = {
        user: nickname,
        votes: votes
    };

    console.log("สรุปข้อมูลเตรียมส่งให้คนที่ Data base:", finalData);
    return finalData;
}
// สร้างปุ่มจำลองสำหรับทดสอบส่งข้อมูล ปุ่มดสอบเฉยๆ
const testBtn = document.createElement('button');
testBtn.innerText = "กดเพื่อเช็คคะแนนสรุป";
testBtn.style.marginTop = "20px";
testBtn.onclick = () => getVotingResults();
document.body.appendChild(testBtn);
