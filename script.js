// 1. นำเข้าตัวเชื่อมต่อฐานข้อมูล (ต้องมีไฟล์ supabase-config.js อยู่ด้วย)
import { supabase } from './supabase-config.js';

// ดึง ID ห้องจาก URL (เช่น vote.html?id=xxxx)
const params = new URLSearchParams(window.location.search);
const roomId = params.get('id');
const roomDisplay = document.getElementById('roomName');

// แสดง ID ห้องบนหน้าจอ
if (roomId && roomDisplay) {
    roomDisplay.innerText = roomId;
}

// ---------------------------------------------------------
// 2. CELL TOGGLE LOGIC (ระบบคลิกเปลี่ยนสถานะ 3 จังหวะ)
// ---------------------------------------------------------
const voteTable = document.getElementById('voteTable');

if (voteTable) {
    voteTable.addEventListener('click', (e) => {
        const cell = e.target;

        // ตรวจสอบว่าคลิกที่ช่องตารางที่มีคลาส vote-cell เท่านั้น
        if (cell.tagName === 'TD' && cell.classList.contains('vote-cell')) {
            let currentState = parseInt(cell.getAttribute('data-state')) || 0;

            // คำนวณสถานะถัดไป (0 -> 1 -> 2 -> 0)
            // 0 = ขาว (0), 1 = เขียวเข้ม (2), 2 = เขียวอ่อน (1)
            let nextState = (currentState + 1) % 3;

            cell.setAttribute('data-state', nextState);
            cell.className = `vote-cell state-${nextState}`;

            // ใส่สีตามสถานะเพื่อให้เห็นภาพชัดเจน
            if (nextState === 1) cell.style.backgroundColor = "#006400"; // เขียวเข้ม
            else if (nextState === 2) cell.style.backgroundColor = "#90EE90"; // เขียวอ่อน
            else cell.style.backgroundColor = "#ffffff"; // ขาว
        }
    });
}   

// ---------------------------------------------------------
// 3. SUBMIT LOGIC (บันทึกข้อมูลลง Database - อาทิตย์ที่ 3)
// ---------------------------------------------------------
async function submitAvailability() {
// ดึงชื่อเล่นจาก Input
    const nicknameInput = document.getElementById('nickname');
    const nickname = nicknameInput ? nicknameInput.value : "";

    if (!nickname || nickname.trim() === "") {
        alert("กรุณาใส่ชื่อเล่นก่อนบันทึกนะ!");
        return;
    }

    // รวบรวมข้อมูลคะแนนจากทุก Cell
    const cells = document.querySelectorAll('.vote-cell');
    let votes = {};

    cells.forEach(cell => {
        const state = parseInt(cell.getAttribute('data-state')) || 0;
        let weight = 0;

        if (state === 1) weight = 2; // เขียวเข้ม = 2 คะแนน
        else if (state === 2) weight = 1; // เขียวอ่อน = 1 คะแนน

        // ใช้ ID ของช่องเป็น Key เช่น "slot-1-9am": 2
        votes[cell.id] = weight;
    });

    const payload = {
        room_id: roomId,
        participant_name: nickname,
        availability_data: votes // ส่งก้อน JSON นี้ไป
    };

    try {
        // ส่งข้อมูลเข้าตาราง votes ใน Supabase
        const { error } = await supabase.from('votes').insert([payload]);

        if (error) throw error;

        alert("บันทึกข้อมูลโหวตสำเร็จ!");
        // ไปหน้าสรุปผลพร้อมส่ง ID ไปด้วย
        window.location.href = `results.html?id=${roomId}`;

    } catch (err) {
        console.error("Error saving to DB:", err.message);
        alert("เกิดข้อผิดพลาดในการบันทึก: " + err.message);
    }
}

// ---------------------------------------------------------
// 4. DOWNLOAD ICS (ฟังก์ชันเดิมจากอาทิตย์ที่ 1-2)
// ---------------------------------------------------------
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
            alert("เกิดข้อผิดพลาดในการโหลดไฟล์");
        }
    };
}

// ผูกฟังก์ชันเข้ากับปุ่ม Submit (ใน HTML ต้องมีปุ่ม id="btnSubmit")
const btnSubmit = document.getElementById('btnSubmit');
if (btnSubmit) {
    btnSubmit.onclick = submitAvailability;
}

// 5. บันทึกชื่อเล่นลง LocalStorage (เพื่อความสะดวกของผู้ใช้)
const nameInput = document.getElementById('nickname');
if (nameInput) {
    // ดึงชื่อเดิมมาใส่ถ้ามี
    nameInput.value = localStorage.getItem('userNickname') || "";

    // บันทึกทุกครั้งที่พิมพ์
    nameInput.oninput = () => {
        localStorage.setItem('userNickname', nameInput.value);
    };
}
