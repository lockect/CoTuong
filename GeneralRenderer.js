/**
 * GENERAL RENDERER - TƯỚNG (HOÀNG ĐẾ CHIẾN TRƯỜNG)
 * Thiết kế: Trọng giáp đồ sộ, áo choàng vương quyền, đội vương miện và cầm Đại Kiếm.
 */
class GeneralRenderer {

  static calcBones(state, time, progress) {
    let b = { head: 0, torsoY: 0, lArm: 0, rArm: 0, lLeg: 0, rLeg: 0, weaponY: 0 };
    const t = time * 0.01;

    if (state === 'idle') {
      // Tướng thở chậm, uy nghi và đĩnh đạc
      b.torsoY = Math.sin(t * 0.4) * 1.5; 
      b.lArm = Math.sin(t * 0.4) * 0.05;
      b.rArm = -Math.sin(t * 0.4) * 0.05;
    } 
    else if (state === 'walk') {
      // Bước đi chậm rãi, bệ vệ
      const spd = t * 1.5; 
      b.torsoY = Math.abs(Math.sin(spd)) * -2;
      b.lLeg = Math.sin(spd) * 0.6;
      b.rLeg = -Math.sin(spd) * 0.6;
      b.lArm = -b.lLeg * 0.5; 
      b.rArm = -b.rLeg * 0.5;
    } 
    else if (state === 'attack') {
      // Vung đại kiếm chém mạnh (Heavy Slash)
      if (progress < 0.3) {
        let p = progress / 0.3;
        b.rArm = p * -1.8; // Giương kiếm ra sau
        b.torsoY = p * 2;
        b.head = -0.2;
      } else if (progress < 0.5) {
        let p = (progress - 0.3) / 0.2;
        b.rArm = -1.8 + p * 3.5; // Chém mạnh xuống
        b.torsoY = 2 - p * 4;
        b.head = 0.3;
      } else if (progress < 0.8) {
        b.rArm = 1.7; // Dừng kiếm
        b.torsoY = -2;
        b.head = 0.3;
      } else {
        let p = (progress - 0.8) / 0.2;
        b.rArm = 1.7 * (1 - p);
        b.torsoY = -2 * (1 - p);
        b.head = 0.3 * (1 - p);
      }
      b.lLeg = -0.3; b.rLeg = 0.3; 
    }
    else if (state === 'hurt') {
      b.torsoY = Math.sin(t * 2) * -2;
      b.head = -0.3;
      b.lArm = -0.8; b.rArm = -0.5; 
    }
    else if (state === 'die') {
      // Tướng gục ngã từ từ, ngửa ra sau, kiếm cắm xuống
      let p = Math.min(1, progress * 1.2); 
      b.torsoY = p * 10; 
      b.head = -p * 0.8; 
      b.lArm = -p * 1.5; b.rArm = p * 0.5; 
      b.lLeg = -p * 0.5; b.rLeg = -p * 0.2; 
    }
    return b;
  }

  static drawCharacter(ctx, isRed, x, y, r, time, state, progress, isChecked) {
    const b = this.calcBones(state, time, progress);
    
    // Tướng có vóc dáng to lớn nhất trên bàn cờ
    const scaleMod = 1.7; 
    const u = r * scaleMod * 0.05; 

    // Bảng màu Hoàng Gia
    const cPrimary = isRed ? '#8e0000' : '#051b36'; // Đỏ sẫm / Xanh đen
    const cArmor   = isRed ? '#b71c1c' : '#0d47a1'; 
    const cTrim    = isRed ? '#ffd700' : '#b0bec5'; // Vàng rực / Bạc
    
    ctx.save();
    ctx.translate(x, y + r * 0.6); // Điểm neo sát mặt đất

    // Bóng đổ
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.ellipse(0, 0, r*0.8, r*0.3, 0, 0, Math.PI*2); ctx.fill();

    // Hiệu ứng cảnh báo chiếu tướng (Aura xoay dưới chân)
    if (isChecked) {
      ctx.save();
      ctx.rotate(time * 0.002);
      const pulse = 1 + Math.sin(time * 0.015) * 0.15;
      ctx.beginPath(); ctx.arc(0, 0, r * 1.2 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = isRed ? 'rgba(255, 23, 68, 0.3)' : 'rgba(0, 229, 255, 0.3)'; ctx.fill();
      ctx.strokeStyle = isRed ? '#ff1744' : '#00e5ff'; ctx.lineWidth = u;
      ctx.setLineDash([u*4, u*4]); ctx.stroke();
      ctx.restore();
    }

    if (state === 'die') {
      ctx.globalAlpha = Math.max(0, 1 - progress);
      ctx.translate(0, -progress * u * 8); 
      ctx.rotate(progress * Math.PI * 0.2); 
    }

    ctx.translate(0, b.torsoY * u); 

    const hipY = -u * 4;
    const shoulderY = -u * 14;
    const neckY = -u * 15;

    // --- ÁO CHOÀNG (Cape) Nằm sau cùng ---
    ctx.save();
    ctx.fillStyle = cPrimary;
    ctx.strokeStyle = cTrim; ctx.lineWidth = u*1.2;
    const capeSway = Math.sin(time * 0.003) * u * 2;
    ctx.beginPath(); 
    ctx.moveTo(-u*5, shoulderY);
    ctx.quadraticCurveTo(-u*14 - capeSway, -u*2, -u*9, u*4); 
    ctx.lineTo(u*9, u*4);
    ctx.quadraticCurveTo(u*14 + capeSway, -u*2, u*5, shoulderY); 
    ctx.fill(); ctx.stroke();
    ctx.restore();

    // --- CHÂN (Nằm sau) ---
    const drawLeg = (side, rot) => {
      ctx.save(); ctx.translate(side * u * 3.5, hipY); ctx.rotate(rot);
      ctx.fillStyle = '#212121'; ctx.beginPath(); ctx.roundRect(-u*2, 0, u*4, u*8, u); ctx.fill();
      ctx.fillStyle = '#37474f'; ctx.fillRect(-u*2.5, u*5, u*5, u*4); // Thiết giáp ủng
      ctx.fillStyle = cTrim; ctx.fillRect(-u*2.5, u*5, u*5, u);
      ctx.restore();
    };
    drawLeg(-1, b.lLeg);
    drawLeg(1, b.rLeg);

    // --- TAY TRÁI (Nằm sau) ---
    ctx.save(); ctx.translate(-u*6, shoulderY + u*2); ctx.rotate(b.lArm);
    ctx.fillStyle = cArmor; ctx.beginPath(); ctx.roundRect(-u*2, 0, u*4, u*8, u); ctx.fill(); 
    ctx.fillStyle = cTrim; ctx.fillRect(-u*2.2, u*5, u*4.4, u*3); 
    ctx.fillStyle = '#ffcc80'; ctx.beginPath(); ctx.arc(0, u*8.5, u*1.8, 0, Math.PI*2); ctx.fill(); 
    ctx.restore();

    // --- THÂN MÌNH & GIÁP TƯỚNG (Torso) ---
    ctx.save();
    // Giáp váy
    ctx.fillStyle = cArmor;
    ctx.beginPath(); ctx.moveTo(-u*5, hipY); ctx.lineTo(-u*7, hipY + u*7); 
    ctx.lineTo(u*7, hipY + u*7); ctx.lineTo(u*5, hipY); ctx.fill();
    ctx.strokeStyle = cTrim; ctx.lineWidth = u*1.5; ctx.stroke();
    
    // Giáp ngực đồ sộ
    ctx.fillStyle = cArmor;
    ctx.beginPath(); ctx.roundRect(-u*6, shoulderY, u*12, u*10, u*2); ctx.fill();
    ctx.stroke();
    
    // Họa tiết sư tử/rồng vàng trước ngực
    ctx.fillStyle = cTrim;
    ctx.beginPath(); ctx.moveTo(0, shoulderY + u*2); ctx.lineTo(-u*4, shoulderY + u*5); 
    ctx.lineTo(0, shoulderY + u*8); ctx.lineTo(u*4, shoulderY + u*5); ctx.closePath(); ctx.fill();

    // Đai lưng
    ctx.fillStyle = '#212121'; ctx.fillRect(-u*6, hipY - u*2, u*12, u*3);
    ctx.fillStyle = cTrim; ctx.fillRect(-u*2, hipY - u*2.5, u*4, u*4); // Khóa thắt lưng to

    // Chữ Hán
    ctx.font = `bold ${u*4}px "KaiTi", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; 
    ctx.fillStyle = cPrimary; ctx.fillText(isRed ? '帥' : '將', 0, shoulderY + u*5);
    ctx.restore();

    // --- ĐẦU & VƯƠNG MIỆN ---
    ctx.save(); ctx.translate(0, neckY); ctx.rotate(b.head);
    ctx.fillStyle = '#ffe0b2'; ctx.beginPath(); ctx.arc(0, -u*3.5, u*5, 0, Math.PI*2); ctx.fill();
    
    // Râu ria oai phong
    ctx.fillStyle = '#212121'; 
    ctx.beginPath(); ctx.moveTo(-u*3, -u); ctx.quadraticCurveTo(0, u, u*3, -u); 
    ctx.quadraticCurveTo(0, -u*2, -u*3, -u); ctx.fill();

    // Mắt
    if (state === 'hurt' || state === 'die') {
      ctx.strokeStyle = '#3e2723'; ctx.lineWidth = u*0.8;
      ctx.beginPath(); ctx.moveTo(-u*3, -u*4.5); ctx.lineTo(-u*1.5, -u*3.5); ctx.lineTo(-u*3, -u*2.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(u*3, -u*4.5); ctx.lineTo(u*1.5, -u*3.5); ctx.lineTo(u*3, -u*2.5); ctx.stroke();
    } else {
      ctx.strokeStyle = '#212121'; ctx.lineWidth = u; // Chân mày quặp
      ctx.beginPath(); ctx.moveTo(-u*4, -u*5.5); ctx.lineTo(-u, -u*4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(u*4, -u*5.5); ctx.lineTo(u, -u*4); ctx.stroke();
      ctx.fillStyle = '#212121'; ctx.beginPath(); ctx.ellipse(-u*2, -u*3.5, u*0.8, u*1.2, 0, 0, Math.PI*2); ctx.ellipse(u*2, -u*3.5, u*0.8, u*1.2, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-u*2.2, -u*3.8, u*0.3, 0, Math.PI*2); ctx.arc(u*1.8, -u*3.8, u*0.3, 0, Math.PI*2); ctx.fill();
    }

    // Vương miện
    ctx.fillStyle = cTrim; ctx.strokeStyle = '#f57f17'; ctx.lineWidth = u;
    ctx.beginPath(); ctx.moveTo(-u*5, -u*7); ctx.lineTo(-u*3, -u*12); 
    ctx.lineTo(0, -u*9); ctx.lineTo(u*3, -u*12); ctx.lineTo(u*5, -u*7); ctx.closePath(); ctx.fill(); ctx.stroke();
    // Ngọc trên vương miện
    ctx.fillStyle = isRed ? '#ff1744' : '#00e5ff';
    ctx.beginPath(); ctx.arc(0, -u*6, u*1.5, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // --- TAY PHẢI & ĐẠI KIẾM ---
    ctx.save(); ctx.translate(u*6, shoulderY + u*2); ctx.rotate(b.rArm);
    
    // Giáp vai phải (Đồ sộ)
    ctx.fillStyle = cTrim; ctx.beginPath(); ctx.arc(0, 0, u*3.5, Math.PI, 0); ctx.fill(); 
    
    ctx.fillStyle = cArmor; ctx.beginPath(); ctx.roundRect(-u*2, 0, u*4, u*8, u); ctx.fill(); 
    ctx.fillStyle = cTrim; ctx.fillRect(-u*2.2, u*5, u*4.4, u*3);
    
    ctx.translate(0, u*7.5); 
    ctx.save();
    ctx.rotate(Math.PI*0.1); // Cầm kiếm chúc xuống đất
    
    // Vệt kiếm khí bán nguyệt khi Attack
    if (state === 'attack' && progress > 0.3 && progress < 0.6) {
       ctx.strokeStyle = isRed ? 'rgba(255, 235, 59, 0.9)' : 'rgba(0, 229, 255, 0.9)';
       ctx.lineWidth = u*3; ctx.lineCap = 'round';
       ctx.beginPath(); ctx.arc(0, u*10, u*20, -Math.PI*0.8, -Math.PI*0.2); ctx.stroke();
       ctx.shadowColor = isRed ? '#ffeb3b' : '#00e5ff'; ctx.shadowBlur = u*6;
    }

    // Chuôi kiếm
    ctx.fillStyle = cTrim; ctx.fillRect(-u*1.5, -u*8, u*3, u*8);
    // Đốc kiếm chắn ngang
    ctx.fillRect(-u*4, -u*8, u*8, u*2);
    // Lưỡi đại kiếm bản to
    ctx.fillStyle = '#eceff1'; 
    ctx.beginPath(); ctx.moveTo(-u*2.5, -u*8); ctx.lineTo(u*2.5, -u*8); 
    ctx.lineTo(u*1.5, -u*30); ctx.lineTo(0, -u*34); ctx.lineTo(-u*1.5, -u*30); ctx.closePath(); ctx.fill();
    // Đường rãnh giữa kiếm
    ctx.strokeStyle = '#b0bec5'; ctx.lineWidth = u*0.8; 
    ctx.beginPath(); ctx.moveTo(0, -u*8); ctx.lineTo(0, -u*32); ctx.stroke();
    ctx.restore();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffcc80'; ctx.beginPath(); ctx.arc(0, 0, u*2, 0, Math.PI*2); ctx.fill(); 
    ctx.restore();

    ctx.restore();
  }
}