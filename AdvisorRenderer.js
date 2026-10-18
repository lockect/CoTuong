/**
 * ADVISOR RENDERER - SĨ (HỘ VỆ HOÀNG GIA)
 * Thiết kế: Thanh lịch, giáp nhẹ, áo choàng mỏng, cầm Song Kiếm và có Khiên năng lượng bảo vệ.
 */
class AdvisorRenderer {

  static calcBones(state, time, progress) {
    let b = { head: 0, torsoY: 0, lArm: 0, rArm: 0, lLeg: 0, rLeg: 0, shieldRot: time * 0.002 };
    const t = time * 0.01;

    if (state === 'idle') {
      // Sĩ nhún chân cơ động, sẵn sàng bảo vệ Tướng
      b.torsoY = Math.sin(t * 0.8) * 1.2; 
      b.lArm = 0.2 + Math.sin(t * 0.8) * 0.1;
      b.rArm = -0.2 - Math.sin(t * 0.8) * 0.1;
    } 
    else if (state === 'walk') {
      // Lướt êm ái
      const spd = t * 2.0; 
      b.torsoY = Math.abs(Math.sin(spd)) * -1.5;
      b.lLeg = Math.sin(spd) * 0.5;
      b.rLeg = -Math.sin(spd) * 0.5;
      b.lArm = -b.lLeg * 0.6; 
      b.rArm = -b.rLeg * 0.6;
    } 
    else if (state === 'attack') {
      // Tung đòn Song kiếm chéo (Cross Slash)
      if (progress < 0.25) {
        let p = progress / 0.25;
        b.lArm = 0.2 - p * 2.0; b.rArm = -0.2 - p * 2.0; // Dang hai tay ra sau
        b.torsoY = p * 1.5;
        b.head = -0.1;
      } else if (progress < 0.45) {
        let p = (progress - 0.25) / 0.2;
        b.lArm = -1.8 + p * 3.8; b.rArm = -2.2 + p * 4.2; // Chém chéo tới trước
        b.torsoY = 1.5 - p * 2.5;
        b.head = 0.2;
      } else if (progress < 0.75) {
        b.lArm = 2.0; b.rArm = 2.0; // Giữ đòn
        b.torsoY = -1.0;
        b.head = 0.2;
      } else {
        let p = (progress - 0.75) / 0.25;
        b.lArm = 2.0 * (1 - p); b.rArm = 2.0 * (1 - p);
        b.torsoY = -1.0 * (1 - p);
        b.head = 0.2 * (1 - p);
      }
      b.lLeg = -0.3; b.rLeg = 0.4;
      b.shieldRot += progress * 0.5; // Khiên xoay nhanh khi đánh
    }
    else if (state === 'hurt') {
      b.torsoY = Math.sin(t * 3) * -1.5;
      b.head = -0.3;
      b.lArm = -1.5; b.rArm = -1.5; // Vung tay đỡ đòn
    }
    else if (state === 'die') {
      // Sĩ khuỵu gối, khiên vỡ vụn
      let p = Math.min(1, progress * 1.5); 
      b.torsoY = p * 8; 
      b.head = p * 0.5; // Cúi đầu gục xuống
      b.lArm = -p * 1.2; b.rArm = -p * 1.2; 
      b.lLeg = p * 1.0; b.rLeg = p * 0.8; // Quỳ gối
    }
    return b;
  }

  static drawCharacter(ctx, isRed, x, y, r, time, state, progress, isChecked) {
    const b = this.calcBones(state, time, progress);
    
    // Tỷ lệ Sĩ (Nhỏ hơn Tướng 1 chút, thon gọn hơn)
    const scaleMod = 1.45; 
    const u = r * scaleMod * 0.05; 

    // Bảng màu Thanh Lịch
    const cPrimary = isRed ? '#d32f2f' : '#1565c0'; // Đỏ tươi / Xanh Hoàng gia
    const cArmor   = '#ffffff'; // Giáp ngực mạ bạc/trắng thanh thoát
    const cTrim    = isRed ? '#ffd54f' : '#81d4fa'; // Vàng đồng / Xanh lơ sáng
    const cShield  = isRed ? 'rgba(255, 193, 7, 0.4)' : 'rgba(0, 229, 255, 0.4)';
    const cShieldGlow = isRed ? '#ffb300' : '#00e5ff';
    
    ctx.save();
    ctx.translate(x, y + r * 0.55); // Neo bàn chân sát đất

    // Bóng đổ cơ bản
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(0, 0, r*0.7, r*0.25, 0, 0, Math.PI*2); ctx.fill();

    // Hiệu ứng Tan biến
    if (state === 'die') {
      ctx.globalAlpha = Math.max(0, 1 - progress);
      ctx.translate(0, -progress * u * 5); 
    }

    // --- KHIÊN NĂNG LƯỢNG LỤC GIÁC (Lớp sau) ---
    if (state !== 'die' || progress < 0.3) {
      ctx.save();
      ctx.translate(0, -u*10); // Trung tâm khiên ở giữa người
      ctx.rotate(b.shieldRot);
      ctx.strokeStyle = cShieldGlow; ctx.lineWidth = u*0.5;
      ctx.fillStyle = cShield;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        const hx = Math.cos(angle) * r * 1.2;
        const hy = Math.sin(angle) * r * 1.2;
        if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
      }
      ctx.closePath(); 
      ctx.fill(); ctx.stroke();
      ctx.restore();
    } else if (state === 'die' && progress >= 0.3) {
      // Hiệu ứng Khiên vỡ vụn thành pha lê
      ctx.save();
      ctx.translate(0, -u*10);
      const shatterP = (progress - 0.3) / 0.7; // 0 -> 1
      ctx.fillStyle = cShieldGlow;
      for (let i = 0; i < 8; i++) {
        const angle = i * Math.PI / 4;
        const dist = shatterP * r * 2.5;
        ctx.save();
        ctx.translate(Math.cos(angle) * dist, Math.sin(angle) * dist);
        ctx.rotate(shatterP * 10 + i);
        ctx.globalAlpha = 1 - shatterP;
        ctx.beginPath(); ctx.moveTo(0, -u*3); ctx.lineTo(u*2, u*2); ctx.lineTo(-u*2, u*2); ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    ctx.translate(0, b.torsoY * u); 
    const hipY = -u * 4, shoulderY = -u * 12, neckY = -u * 13;

    // --- CHÂN (Nằm sau) ---
    const drawLeg = (side, rot) => {
      ctx.save(); ctx.translate(side * u * 2.5, hipY); ctx.rotate(rot);
      ctx.fillStyle = '#212121'; ctx.beginPath(); ctx.roundRect(-u*1.5, 0, u*3, u*8, u); ctx.fill();
      ctx.fillStyle = '#102027'; ctx.fillRect(-u*2, u*4, u*4, u*4.5); // Ủng da gọn gàng
      ctx.fillStyle = cTrim; ctx.fillRect(-u*2, u*4, u*4, u*0.8);
      ctx.restore();
    };
    drawLeg(-1, b.lLeg); drawLeg(1, b.rLeg);

    // --- ÁO CHOÀNG NHẸ (Nằm sau) ---
    ctx.save();
    ctx.fillStyle = isRed ? '#9a0007' : '#003c8f';
    const capeSway = Math.sin(time * 0.005) * u * 1.5;
    ctx.beginPath(); ctx.moveTo(-u*3, shoulderY);
    ctx.quadraticCurveTo(-u*8 - capeSway, -u*2, -u*6, u*6); ctx.lineTo(u*6, u*6);
    ctx.quadraticCurveTo(u*8 + capeSway, -u*2, u*3, shoulderY); ctx.fill();
    ctx.restore();

    // --- TAY TRÁI & KIẾM TRÁI ---
    const drawArmAndSword = (side, rot) => {
      ctx.save(); ctx.translate(side * u * 5, shoulderY + u*1.5); ctx.rotate(rot);
      // Bắp tay áo lụa
      ctx.fillStyle = cPrimary; ctx.beginPath(); ctx.roundRect(-u*1.5, 0, u*3, u*7, u); ctx.fill(); 
      // Giáp cẳng tay bạc
      ctx.fillStyle = cArmor; ctx.fillRect(-u*1.8, u*3, u*3.6, u*3); 
      
      // Bàn tay & Kiếm
      ctx.translate(0, u*6);
      ctx.save();
      ctx.rotate(side * -Math.PI * 0.2); // Kiếm chĩa ra hai bên
      
      // Vệt sáng chém chéo (Attack)
      if (state === 'attack' && progress > 0.25 && progress < 0.6) {
         ctx.strokeStyle = cShieldGlow; ctx.lineWidth = u*1.5; ctx.lineCap = 'round';
         ctx.beginPath(); ctx.moveTo(0, -u*8); ctx.lineTo(0, -u*28); ctx.stroke();
         ctx.shadowColor = cShieldGlow; ctx.shadowBlur = u*4;
      }

      ctx.fillStyle = '#4e342e'; ctx.fillRect(-u, -u*4, u*2, u*6); // Chuôi
      ctx.fillStyle = cTrim; ctx.fillRect(-u*2.5, -u*4, u*5, u); // Đốc kiếm
      ctx.fillStyle = '#eceff1'; ctx.beginPath(); ctx.moveTo(-u*1.2, -u*4); ctx.lineTo(u*1.2, -u*4); ctx.lineTo(0, -u*22); ctx.closePath(); ctx.fill(); // Lưỡi kiếm mảnh, nhọn
      ctx.restore();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffcc80'; ctx.beginPath(); ctx.arc(0, 0, u*1.5, 0, Math.PI*2); ctx.fill(); 
      ctx.restore();
    };
    drawArmAndSword(-1, b.lArm); // Tay trái

    // --- THÂN MÌNH & GIÁP (Torso) ---
    ctx.save();
    // Vạt áo lụa xẻ tà hai bên
    ctx.fillStyle = cPrimary;
    ctx.beginPath(); ctx.moveTo(-u*3.5, hipY); ctx.lineTo(-u*5, hipY + u*7); 
    ctx.lineTo(u*5, hipY + u*7); ctx.lineTo(u*3.5, hipY); ctx.fill();
    ctx.strokeStyle = cTrim; ctx.lineWidth = u; ctx.stroke();
    
    // Giáp ngực mạ bạc
    ctx.fillStyle = cArmor;
    ctx.beginPath(); ctx.roundRect(-u*4.5, shoulderY, u*9, u*9, u*2); ctx.fill();
    ctx.strokeStyle = cTrim; ctx.lineWidth = u; ctx.stroke();
    
    // Đai lưng ngọc
    ctx.fillStyle = '#212121'; ctx.fillRect(-u*4.5, hipY - u*2.5, u*9, u*2.5);
    ctx.fillStyle = cTrim; ctx.beginPath(); ctx.arc(0, hipY - u*1.2, u*1.8, 0, Math.PI*2); ctx.fill(); 
    ctx.fillStyle = isRed ? '#ff1744' : '#00e5ff'; ctx.beginPath(); ctx.arc(0, hipY - u*1.2, u, 0, Math.PI*2); ctx.fill(); // Ngọc tâm đai

    // Chữ Hán
    ctx.font = `bold ${u*3.5}px "KaiTi", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; 
    ctx.fillStyle = '#212121'; ctx.fillText(isRed ? '仕' : '士', 0, shoulderY + u*4.5);
    ctx.restore();

    // --- ĐẦU & NÓN NGỰ LÂM ---
    ctx.save(); ctx.translate(0, neckY); ctx.rotate(b.head);
    // Khuôn mặt thanh tú
    ctx.fillStyle = '#ffe0b2'; ctx.beginPath(); ctx.arc(0, -u*3.5, u*4.2, 0, Math.PI*2); ctx.fill();
    
    if (state === 'hurt' || state === 'die') {
      ctx.strokeStyle = '#3e2723'; ctx.lineWidth = u*0.6;
      ctx.beginPath(); ctx.moveTo(-u*2.5, -u*4); ctx.lineTo(-u*1.2, -u*3); ctx.lineTo(-u*2.5, -u*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(u*2.5, -u*4); ctx.lineTo(u*1.2, -u*3); ctx.lineTo(u*2.5, -u*2); ctx.stroke();
    } else {
      ctx.fillStyle = '#212121'; // Mắt điềm tĩnh
      ctx.beginPath(); ctx.ellipse(-u*1.6, -u*3.5, u*0.8, u*1.2, 0, 0, Math.PI*2); ctx.ellipse(u*1.6, -u*3.5, u*0.8, u*1.2, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-u*1.8, -u*3.8, u*0.3, 0, Math.PI*2); ctx.arc(u*1.4, -u*3.8, u*0.3, 0, Math.PI*2); ctx.fill();
    }

    // Nón ngự lâm (Guardian Helmet)
    ctx.fillStyle = cPrimary; ctx.beginPath(); ctx.arc(0, -u*3.5, u*4.4, Math.PI, 0); ctx.fill();
    ctx.fillStyle = cTrim; ctx.beginPath(); ctx.ellipse(0, -u*3.5, u*5.5, u*1.2, 0, 0, Math.PI*2); ctx.fill();
    // Ngọc/Lông vũ trên nón
    ctx.fillStyle = cShieldGlow; ctx.beginPath(); ctx.moveTo(-u*1.5, -u*7.5); ctx.lineTo(0, -u*12); ctx.lineTo(u*1.5, -u*7.5); ctx.fill();
    ctx.restore();

    // --- TAY PHẢI & KIẾM PHẢI ---
    drawArmAndSword(1, b.rArm);

    // --- KHIÊN NĂNG LƯỢNG (Lớp viền ngoài chớp sáng) ---
    if (state !== 'die' || progress < 0.3) {
      ctx.save(); ctx.translate(0, -u*10); ctx.rotate(b.shieldRot);
      ctx.strokeStyle = cShieldGlow; ctx.lineWidth = u*0.8;
      ctx.globalAlpha = 0.5 + Math.sin(time * 0.01) * 0.3; // Nhấp nháy
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        const hx = Math.cos(angle) * r * 1.2;
        const hy = Math.sin(angle) * r * 1.2;
        if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
      }
      ctx.closePath(); ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}