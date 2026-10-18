/**
 * CHARIOT RENDERER - CHIẾN XA CÀN QUÉT (XE / 車)
 * Thiết kế: Chiến binh bọc giáp hộp đồ sộ, bánh xe chiến xa hai bên, cầm Thanh Long Đại Đao.
 */
class ChariotRenderer {

  static calcBones(state, time, progress) {
    let b = { head: 0, torsoY: 0, lArm: 0, rArm: 0, lLeg: 0, rLeg: 0, wheelRot: time * 0.01 };
    const t = time * 0.01;

    if (state === 'idle') {
      // Động cơ rung bần bật, chiến xa sẵn sàng càn quét
      b.torsoY = Math.sin(t * 0.9) * 0.8; 
      b.lArm = Math.sin(t * 0.9) * 0.05;
      b.rArm = -Math.sin(t * 0.9) * 0.05;
    } 
    else if (state === 'walk') {
      const spd = t * 3.0; 
      b.torsoY = Math.abs(Math.sin(spd)) * -1.5;
      b.wheelRot += 0.5; // Bánh xe quay nhanh khi di chuyển
    } 
    else if (state === 'attack') {
      // 0.0 -> 0.3: Lấy đà kéo đại đao ra sau
      // 0.3 -> 0.6: Quét đại đao góc rộng cực mạnh
      // 0.6 -> 1.0: Thu thế
      if (progress < 0.3) {
        let p = progress / 0.3;
        b.rArm = p * -2.0; 
        b.torsoY = p * 1.5;
        b.head = -0.2;
      } else if (progress < 0.6) {
        let p = (progress - 0.3) / 0.3;
        b.rArm = -2.0 + p * 4.5; // Quét đao chớp nhoáng
        b.torsoY = 1.5 - p * 3;
        b.head = 0.3;
      } else {
        let p = (progress - 0.6) / 0.4;
        b.rArm = 2.5 * (1 - p);
        b.torsoY = -1.5 * (1 - p);
      }
    }
    else if (state === 'hurt') {
      b.torsoY = Math.sin(t * 3) * -1.5;
      b.head = -0.3;
      b.lArm = -0.8; b.rArm = -0.8; 
    }
    else if (state === 'die') {
      // Giáp hộp phát nổ văng ra các hướng, xe gục ngã
      let p = Math.min(1, progress * 1.5); 
      b.torsoY = p * 10; 
      b.head = -p * 1.2; 
      b.lArm = -p * 2.0; b.rArm = -p * 2.0; 
    }
    return b;
  }

  static drawCharacter(ctx, isRed, x, y, r, time, state, progress, isChecked) {
    const b = this.calcBones(state, time, progress);
    
    const scaleMod = 1.6; // Vóc dáng chiến xa ngoại cỡ, đồ sộ
    const u = r * scaleMod * 0.05; 

    // Bảng màu Juggernaut (Đỏ cờ / Xanh thép quân sự)
    const cPrimary = isRed ? '#8e0000' : '#212121'; 
    const cArmor   = isRed ? '#b71c1c' : '#37474f'; 
    const cTrim    = isRed ? '#ffca28' : '#90a4ae'; 
    const cMetal   = '#cfd8dc';
    
    ctx.save();
    ctx.translate(x, y + r * 0.55); // Neo sát mặt đất

    // Bánh xe chiến xa đính gai ở hai bên hông
    ctx.save();
    [-1, 1].forEach(side => {
      ctx.save();
      ctx.translate(side * u * 6, u * 2);
      ctx.rotate(side * b.wheelRot);
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(0, 0, u * 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = cTrim; ctx.lineWidth = u * 0.8; ctx.stroke();
      // Gai bánh xe
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = cMetal;
        ctx.fillRect(-u * 0.5, -u * 4.5, u, u * 1.5);
      }
      ctx.restore();
    });
    ctx.restore();

    // Bóng đổ
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.ellipse(0, 0, r*0.9, r*0.3, 0, 0, Math.PI*2); ctx.fill();

    // Hiệu ứng Tan biến / Nổ giáp khi chết
    if (state === 'die') {
      ctx.globalAlpha = Math.max(0, 1 - progress);
      ctx.translate(0, progress * u * 5); 
    }

    ctx.translate(0, b.torsoY * u); 
    const shoulderY = -u * 12, neckY = -u * 13;

    // --- THÂN MÌNH & GIÁP HỘP (Juggernaut Torso) ---
    ctx.save();
    // Giáp hộp bề thế, dày đặc
    ctx.fillStyle = cArmor;
    ctx.beginPath(); ctx.roundRect(-u*6, shoulderY, u*12, u*10, u*1.5); ctx.fill();
    ctx.strokeStyle = cTrim; ctx.lineWidth = u * 1.2; ctx.stroke();
    
    // Đinh tán thép trên giáp
    ctx.fillStyle = cMetal;
    [-u*4.5, 0, u*4.5].forEach(dx => {
      ctx.beginPath(); ctx.arc(dx, shoulderY + u*2, u*0.8, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(dx, shoulderY + u*8, u*0.8, 0, Math.PI*2); ctx.fill();
    });

    // Chữ Hán
    ctx.font = `bold ${u*4}px "KaiTi", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; 
    ctx.fillStyle = '#ffffff'; ctx.fillText(isRed ? '俥' : '車', 0, shoulderY + u*5);
    ctx.restore();

    // --- ĐẦU & MŨ GIÁP HỘP ---
    ctx.save(); ctx.translate(0, neckY); ctx.rotate(b.head);
    ctx.fillStyle = '#ffe0b2'; ctx.beginPath(); ctx.arc(0, -u*3, u*4.2, 0, Math.PI*2); ctx.fill();
    
    if (state === 'hurt' || state === 'die') {
      ctx.strokeStyle = '#3e2723'; ctx.lineWidth = u*0.6;
      ctx.beginPath(); ctx.moveTo(-u*2.5, -u*4); ctx.lineTo(-u*1.2, -u*3); ctx.lineTo(-u*2.5, -u*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(u*2.5, -u*4); ctx.lineTo(u*1.2, -u*3); ctx.lineTo(u*2.5, -u*2); ctx.stroke();
    } else {
      ctx.fillStyle = '#212121'; 
      ctx.beginPath(); ctx.ellipse(-u*1.5, -u*3.2, u*0.8, u*1.2, 0, 0, Math.PI*2); 
      ctx.ellipse(u*1.5, -u*3.2, u*0.8, u*1.2, 0, 0, Math.PI*2); ctx.fill();
    }

    // Mũ giáp hộp che kín đầu (Box Helm)
    ctx.fillStyle = cPrimary;
    ctx.fillRect(-u*4.5, -u*8, u*9, u*6);
    ctx.strokeStyle = cTrim; ctx.lineWidth = u; ctx.strokeRect(-u*4.5, -u*8, u*9, u*6);
    // Khe hở mắt phát quang
    ctx.fillStyle = isRed ? '#ff1744' : '#00e5ff';
    ctx.fillRect(-u*3, -u*5.5, u*6, u*1);
    ctx.restore();

    // --- TAY PHẢI & THANH LONG ĐẠI ĐAO ---
    ctx.save(); ctx.translate(u*6, shoulderY + u*2); ctx.rotate(b.rArm);
    ctx.fillStyle = cArmor; ctx.beginPath(); ctx.roundRect(-u*2, 0, u*4, u*8, u); ctx.fill(); 
    
    // Gắn Thanh Long Đại Đao khổng lồ
    ctx.translate(0, u*7); 
    ctx.save();
    ctx.rotate(-Math.PI * 0.2); 
    
    // Vệt chém bán nguyệt (Crescent Slash) khi Attack
    if (state === 'attack' && progress > 0.3 && progress < 0.6) {
       ctx.strokeStyle = isRed ? 'rgba(255, 235, 59, 0.9)' : 'rgba(0, 229, 255, 0.9)';
       ctx.lineWidth = u*3.5; ctx.lineCap = 'round';
       ctx.beginPath(); ctx.arc(0, 0, u*24, -Math.PI * 0.8, 0); ctx.stroke();
       ctx.shadowColor = isRed ? '#ffeb3b' : '#00e5ff'; ctx.shadowBlur = u*8;
    }

    // Cán đao dài, chắc nịch
    ctx.fillStyle = '#3e2723'; ctx.fillRect(-u*1.2, -u*12, u*2.4, u*26);
    // Lưỡi Thanh Long Đại Đao cong vút sắc bén
    ctx.fillStyle = cMetal; 
    ctx.beginPath(); ctx.moveTo(0, -u*12); 
    ctx.bezierCurveTo(u*8, -u*10, u*8, -u*24, 0, -u*28); 
    ctx.lineTo(0, -u*12); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = u*0.5; ctx.stroke();
    ctx.restore();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffcc80'; ctx.beginPath(); ctx.arc(0, 0, u*2, 0, Math.PI*2); ctx.fill(); 
    ctx.restore();

    ctx.restore();
  }
}