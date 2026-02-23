import { supabase } from './supabase-config.js';

// -------------------
// รับ room id จาก URL
// -------------------
const params = new URLSearchParams(window.location.search);
const roomId = params.get('id');

const roomDisplay = document.getElementById('roomNameDisplay');
const tableHeader = document.getElementById('tableHeader');
const tableBody = document.getElementById('tableBody');
const btnSubmit = document.getElementById("btnSubmit");

// -------------------
// เริ่มต้นหน้า
// -------------------
initVotingPage();

async function initVotingPage() {

  if (!roomId) {
    alert("ไม่พบรหัสห้องประชุม");
    return;
  }

  const { data: meeting, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', roomId)
    .single();

  if (error || !meeting) {
    roomDisplay.innerText = "ไม่พบข้อมูลห้องประชุม";
    return;
  }

  roomDisplay.innerText =
    `คุณกำลังอยู่ในห้อง: ${meeting.title}`;

  const startDate = new Date(meeting.dates.start);
  const endDate = new Date(meeting.dates.end);

  const dateList = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dateList.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  renderGrid(dateList);
}

// -------------------
// วาดตาราง
// -------------------
function renderGrid(dateList) {

  tableHeader.innerHTML = '';
  tableBody.innerHTML = '';

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00",
    "17:00", "18:00"
  ];

  let headerHTML = '<th>เวลา</th>';

  dateList.forEach(date => {
    const dStr = date.toLocaleDateString('th-TH', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    });

    headerHTML += `<th>${dStr}</th>`;
  });

  tableHeader.innerHTML = headerHTML;

  let bodyHTML = '';

  timeSlots.forEach(time => {
    bodyHTML += `<tr><td class="time-label">${time}</td>`;

    dateList.forEach(date => {
      const dateISO = date.toISOString().split('T')[0];

      bodyHTML += `
        <td class="vote-cell state-0"
            data-state="0"
            data-time="${time}"
            data-date="${dateISO}">
        </td>
      `;
    });

    bodyHTML += '</tr>';
  });

  tableBody.innerHTML = bodyHTML;

  attachVotingLogic();
}

// -------------------
// Logic คลิกเปลี่ยนสี
// -------------------
function attachVotingLogic() {

  const cells = document.querySelectorAll('.vote-cell');

  cells.forEach(cell => {
    cell.addEventListener('click', () => {

      let currentState =
        parseInt(cell.getAttribute('data-state'));

      let nextState;

      if (currentState === 0) {
        nextState = 2;   // FIRST CLICK → เขียวเข้ม (2 คะแนน)
      } else if (currentState === 2) {
        nextState = 1;   // SECOND CLICK → เขียวอ่อน (1 คะแนน)
      } else {
        nextState = 0;   // THIRD CLICK → ขาว (0 คะแนน)
      }

      cell.setAttribute('data-state', nextState);
      cell.className = `vote-cell state-${nextState}`;
    });
  });
}

// -------------------
// Submit Vote
// -------------------
async function submitAvailability() {

  const nameInput = document.getElementById("nickname");
  const userName = nameInput.value.trim();

  if (!userName) {
    alert("กรุณากรอกชื่อของคุณก่อนบันทึก");
    return;
  }

  const voteData = {};
  const cells = document.querySelectorAll(".vote-cell");

  cells.forEach(cell => {

    const time = cell.getAttribute("data-time");
    const date = cell.getAttribute("data-date");
    const state = parseInt(cell.getAttribute("data-state"));

    if (!voteData[date]) {
      voteData[date] = {};
    }

    voteData[date][time] = state;
  });

  try {

    const { error } = await supabase
      .from("votes")
      .insert([
        {
          meeting_id: roomId,
          user_name: userName,
          vote_data: voteData
        }
      ]);

    if (error) throw error;

    alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
    window.location.href = `results.html?id=${roomId}`;

  } catch (err) {
    console.error("Error submitting vote:", err.message);
    alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
  }
}

// ผูกปุ่ม Submit
if (btnSubmit) {
  btnSubmit.onclick = submitAvailability;
}