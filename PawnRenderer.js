/**
 * PAWN RENDERER - TIỀN PHONG XUNG KÍCH (TỐT / BINH)
 * Thiết kế chuẩn xác theo ảnh mẫu: Giáp bộ binh, mũ có vành bảo vệ má, đâm trường giáo.
 */
class PawnRenderer {

  /**
   * Tính toán góc xoay các khớp xương theo trạng thái (State Machine)
   */
  static calcBones(state, time, progress) {
    let b = { head: 0, torsoY: 0, lArm: 0, rArm: 0, lLeg: 0, rLeg: 0, weaponY: 0 };
    const t = time * 0.01;

    if (state === 'idle') {
      // Đứng thủ thế, nhún nhẹ linh hoạt
      b.torsoY = Math.sin(t * 0.7) * 1.5; 
      b.lArm = Math.sin(t * 0.7) * 0.15;
      b.rArm = -Math.sin(t * 0.7) * 0.15;
      b.head = 0.1; 
    } 
    else if (state === 'walk') {
      // Bước chạy xung kích
      const spd = t * 2.8; 
      b.torsoY = Math.abs(Math.sin(spd)) * -2.5 - 1;
      b.lLeg = Math.sin(spd) * 0.8;
      b.rArm = Math.sin(spd) * 0.8; 
      b.rLeg = -Math.sin(spd) * 0.8;
      b.lArm = -Math.sin(spd) * 0.8;
      b.head = 0.25; 
    } 
    else if (state === 'attack') {
      // Tung đòn đâm giáo thẳng dứt khoát
      if (progress < 0.25) {
        let p = progress / 0.25;
        b.rArm = p * -1.5; // Kéo tay cầm giáo ra sau lấy đà
        b.torsoY = p * 1.5;
        b.head = -0.15;
      } else if (progress < 0.45) {
        let p = (progress - 0.25) / 0.2;
        b.rArm = -1.5 + p * 3.2; // Đâm mạnh tới trước
        b.torsoY = 1.5 - p * 3;
        b.head = 0.35;
      } else if (progress < 0.75) {
        b.rArm = 1.7; // Giữ nguyên mũi giáo xuyên thấu
        b.torsoY = -1.5;
        b.head = 0.35;
      } else {
        let p = (progress - 0.75) / 0.25;
        b.rArm = 1.7 * (1 - p);
        b.torsoY = -1.5 * (1 - p);
        b.head = 0.35 * (1 - p);
      }
      b.lLeg = -0.4; b.rLeg = 0.5; // Chân đứng tấn chữ đinh
    }
    else if (state === 'hurt') {
      // Bị trúng đòn
      b.torsoY = Math.sin(t * 3) * -2;
      b.head = -0.4;
      b.lArm = -1.0; b.rArm = -0.8; 
    }
    else if (state === 'die') {
      // Ngã ngửa ra sau (Hoạt hình)
      let p = Math.min(1, progress * 1.5); 
      b.torsoY = p * 12; 
      b.head = -p * 1.2; 
      b.lArm = -p * 2.5; b.rArm = -p * 2.5; 
      b.lLeg = -p * 1.8; b.rLeg = -p * 1.5; 
    }
    return b;
  }

  /**
   * Kết xuất đồ họa Quân Tốt theo thiết kế ảnh mẫu
   */
  static drawCharacter(ctx, isRed, x, y, r, time, state, progress, isChecked) {
    const b = this.calcBones(state, time, progress);
    
    const scaleMod = 1.4; // Chỉnh kích thước to rõ, phá vỡ khung cờ
    const u = r * scaleMod * 0.05; 

    // Bảng màu bám sát ảnh mẫu: Đỏ thẫm vs Xanh Navy
    const cPrimary = isRed ? '#b71c1c' : '#0d47a1'; 
    const cSecondary = isRed ? '#d32f2f' : '#1565c0'; 
    const cTrim    = '#ffd54f'; // Vàng đồng chung cho 2 bên
    const cDark    = '#1a1a1a'; // Đen nhám cho quần áo lót
    
    ctx.save();
    // Đặt điểm neo ở chân
    ctx.translate(x, y + r * 0.5);

    // Vẽ đế/bóng đổ Elip
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.ellipse(0, 0, r*0.7, r*0.25, 0, 0, Math.PI*2); ctx.fill();

    // Hiệu ứng Tan biến (Defeat)
    if (state === 'die') {
      ctx.globalAlpha = Math.max(0, 1 - progress);
      ctx.translate(0, -progress * u * 15); 
      ctx.rotate(progress * Math.PI * 0.35); 
    }

    ctx.translate(0, b.torsoY * u); 

    const hipY = -u * 3;
    const shoulderY = -u * 12;
    const neckY = -u * 13;

    // --- CHÂN TRÁI (Nằm sau) ---
    ctx.save(); ctx.translate(-u*3, hipY); ctx.rotate(b.lLeg);
    ctx.fillStyle = cDark; 
    ctx.beginPath(); ctx.roundRect(-u*1.5, 0, u*3, u*7, u); ctx.fill();
    // Giáp ống chân/Giày boot viền vàng
    ctx.fillStyle = '#3e2723'; ctx.fillRect(-u*2, u*3, u*4, u*5); 
    ctx.fillStyle = cTrim; ctx.fillRect(-u*2, u*3, u*4, u);
    ctx.restore();

    // --- CHÂN PHẢI (Nằm sau) ---
    ctx.save(); ctx.translate(u*3, hipY); ctx.rotate(b.rLeg);
    ctx.fillStyle = cDark; 
    ctx.beginPath(); ctx.roundRect(-u*1.5, 0, u*3, u*7, u); ctx.fill();
    ctx.fillStyle = '#3e2723'; ctx.fillRect(-u*2, u*3, u*4, u*5); 
    ctx.fillStyle = cTrim; ctx.fillRect(-u*2, u*3, u*4, u);
    ctx.restore();

    // --- TAY TRÁI (Nằm sau) ---
    ctx.save(); ctx.translate(-u*5, shoulderY); ctx.rotate(b.lArm);
    ctx.fillStyle = cPrimary; ctx.beginPath(); ctx.arc(0, 0, u*2, Math.PI, 0); ctx.fill();
    ctx.fillStyle = cDark; ctx.beginPath(); ctx.roundRect(-u*1.5, 0, u*3, u*6, u); ctx.fill(); 
    // Giáp cẳng tay (Vambrace)
    ctx.fillStyle = cPrimary; ctx.fillRect(-u*1.8, u*3, u*3.6, u*3);
    ctx.fillStyle = '#ffcc80'; ctx.beginPath(); ctx.arc(0, u*6.5, u*1.5, 0, Math.PI*2); ctx.fill(); 
    ctx.restore();

    // --- THÂN MÌNH & GIÁP (Torso) ---
    ctx.save();
    // Vạt giáp váy (Tassets) viền vàng xòe ra
    ctx.fillStyle = cSecondary;
    ctx.beginPath(); ctx.moveTo(-u*4, hipY - u*2); ctx.lineTo(-u*6, hipY + u*5); 
    ctx.lineTo(-u*1, hipY + u*4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(u*4, hipY - u*2); ctx.lineTo(u*6, hipY + u*5); 
    ctx.lineTo(u*1, hipY + u*4); ctx.fill();
    ctx.strokeStyle = cTrim; ctx.lineWidth = u*0.8; ctx.stroke();
    
    // Giáp ngực chữ V
    ctx.fillStyle = cDark;
    ctx.beginPath(); ctx.roundRect(-u*4.5, shoulderY, u*9, u*9, u); ctx.fill();
    ctx.fillStyle = cPrimary;
    ctx.beginPath(); ctx.moveTo(-u*4.5, shoulderY); ctx.lineTo(u*4.5, shoulderY);
    ctx.lineTo(0, shoulderY + u*6); ctx.fill();
    
    // Đai ngực viền vàng chéo
    ctx.strokeStyle = cTrim; ctx.lineWidth = u*1.2;
    ctx.beginPath(); ctx.moveTo(-u*4.5, shoulderY); ctx.lineTo(0, shoulderY + u*6);
    ctx.lineTo(u*4.5, shoulderY); ctx.stroke();

    // Đai lưng to bản
    ctx.fillStyle = '#212121'; ctx.fillRect(-u*4.2, hipY - u*3, u*8.4, u*2.5);
    ctx.fillStyle = cTrim; ctx.fillRect(-u*1.5, hipY - u*3.5, u*3, u*3.5); // Khóa thắt lưng

    // Chữ Hán nhỏ giữa ngực
    ctx.font = `bold ${u*3.5}px "KaiTi", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; 
    ctx.fillStyle = '#ffffff'; ctx.fillText(isRed ? '兵' : '卒', 0, shoulderY + u*3.5);
    ctx.restore();

    // --- ĐẦU & MŨ BỘ BINH (Helmet) ---
    ctx.save(); ctx.translate(0, neckY); ctx.rotate(b.head);
    // Khuôn mặt
    ctx.fillStyle = '#ffe0b2'; ctx.beginPath(); ctx.arc(0, -u*3, u*4.5, 0, Math.PI*2); ctx.fill();
    
    // Mắt sắc bén
    if (state === 'hurt' || state === 'die') {
      ctx.strokeStyle = '#3e2723'; ctx.lineWidth = u*0.6;
      ctx.beginPath(); ctx.moveTo(-u*2.5, -u*4); ctx.lineTo(-u*1.2, -u*3); ctx.lineTo(-u*2.5, -u*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(u*2.5, -u*4); ctx.lineTo(u*1.2, -u*3); ctx.lineTo(u*2.5, -u*2); ctx.stroke();
    } else {
      // Chân mày xếch oai phong
      ctx.strokeStyle = '#212121'; ctx.lineWidth = u*0.8;
      ctx.beginPath(); ctx.moveTo(-u*3.5, -u*5); ctx.lineTo(-u*0.5, -u*4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(u*3.5, -u*5); ctx.lineTo(u*0.5, -u*4); ctx.stroke();
      // Tròng mắt
      ctx.fillStyle = '#212121'; 
      ctx.beginPath(); ctx.ellipse(-u*1.8, -u*3.2, u*0.8, u*1.2, 0, 0, Math.PI*2); 
      ctx.ellipse(u*1.8, -u*3.2, u*0.8, u*1.2, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff'; 
      ctx.beginPath(); ctx.arc(-u*2.0, -u*3.5, u*0.3, 0, Math.PI*2); ctx.arc(u*1.6, -u*3.5, u*0.3, 0, Math.PI*2); ctx.fill();
    }

    // Mũ bảo hiểm ôm sát (Che hai bên má)
    ctx.fillStyle = cPrimary;
    ctx.beginPath(); ctx.arc(0, -u*3.5, u*5, Math.PI, 0); 
    ctx.lineTo(u*5, u); ctx.lineTo(u*3, -u*2); // Vạt má phải
    ctx.lineTo(-u*3, -u*2); ctx.lineTo(-u*5, u); // Vạt má trái
    ctx.closePath(); ctx.fill();
    
    // Viền vàng quanh nón
    ctx.strokeStyle = cTrim; ctx.lineWidth = u; ctx.stroke();
    // Chóp trang trí trên đỉnh nón (Ngọn lửa vàng / Lông vũ)
    ctx.fillStyle = cTrim;
    ctx.beginPath(); ctx.moveTo(-u*1.5, -u*8.5); ctx.lineTo(0, -u*12); ctx.lineTo(u*1.5, -u*8.5); ctx.fill();
    ctx.fillStyle = isRed ? '#ff1744' : '#00e5ff';
    ctx.beginPath(); ctx.moveTo(-u*0.5, -u*12); ctx.quadraticCurveTo(u*3, -u*15, u + Math.sin(time*0.015)*u*2, -u*16); ctx.stroke();
    ctx.restore();

    // --- TAY PHẢI & TRƯỜNG GIÁO ---
    ctx.save(); ctx.translate(u*5, shoulderY); ctx.rotate(b.rArm);
    ctx.fillStyle = cPrimary; ctx.beginPath(); ctx.arc(0, 0, u*2.5, Math.PI, 0); ctx.fill(); // Giáp vai lồi
    ctx.strokeStyle = cTrim; ctx.lineWidth = u*0.8; ctx.stroke();
    ctx.fillStyle = cDark; ctx.beginPath(); ctx.roundRect(-u*1.5, 0, u*3, u*6, u); ctx.fill(); 
    // Giáp cẳng tay phải
    ctx.fillStyle = cPrimary; ctx.fillRect(-u*1.8, u*3, u*3.6, u*3);
    
    // Cầm vũ khí
    ctx.translate(0, u*5.5); 
    ctx.save();
    ctx.rotate(-Math.PI*0.35); // Chĩa mũi giáo chéo lên
    
    // Vệt sáng đâm thẳng khi Attack
    if (state === 'attack' && progress > 0.25 && progress < 0.6) {
       ctx.strokeStyle = isRed ? 'rgba(255, 235, 59, 0.9)' : 'rgba(0, 229, 255, 0.9)';
       ctx.lineWidth = u*2.5; ctx.lineCap = 'round';
       ctx.beginPath(); ctx.moveTo(0, -u*12); ctx.lineTo(0, -u*36); ctx.stroke();
       ctx.shadowColor = isRed ? '#ffeb3b' : '#00e5ff'; ctx.shadowBlur = u*5;
    }

    // Cán giáo
    ctx.fillStyle = '#3e2723'; ctx.fillRect(-u*0.8, -u*12, u*1.6, u*24);
    // Cổ giáo bọc vàng
    ctx.fillStyle = cTrim; ctx.fillRect(-u*1.2, -u*10.5, u*2.4, u*2);
    // Tua rua dưới mũi giáo
    ctx.fillStyle = isRed ? '#d50000' : '#0288d1';
    ctx.beginPath(); ctx.moveTo(-u*2, -u*10.5); ctx.lineTo(0, -u*6); ctx.lineTo(u*2, -u*10.5); ctx.fill();
    
    // Lưỡi giáo bản rộng, nhọn, có gân giữa
    ctx.fillStyle = '#eceff1'; 
    ctx.beginPath(); ctx.moveTo(0, -u*22); ctx.lineTo(u*2.5, -u*12); ctx.lineTo(-u*2.5, -u*12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#b0bec5'; // Tạo khối nửa bên
    ctx.beginPath(); ctx.moveTo(0, -u*22); ctx.lineTo(u*2.5, -u*12); ctx.lineTo(0, -u*12); ctx.closePath(); ctx.fill();
    ctx.restore();

    // Bàn tay găng cầm giáo
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffcc80'; ctx.beginPath(); ctx.arc(0, 0, u*1.8, 0, Math.PI*2); ctx.fill(); 
    ctx.restore();

    ctx.restore();
  }
}