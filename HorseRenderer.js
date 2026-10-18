/**
 * HORSE RENDERER - KỴ BÌNH DŨNG MÃNH (MÃ / 馬)
 * Thiết kế: Kỵ sĩ cưỡi chiến mã bọc giáp đầu, cầm trường thương xé gió.
 */
class HorseRenderer {

  static calcBones(state, time, progress) {
    let b = { head: 0, torsoY: 0, lArm: 0, rArm: 0, lLeg: 0, rLeg: 0, jumpOffset: 0 };
    const t = time * 0.01;

    if (state === 'idle') {
      // Ngựa kiễng chân gõ móng, bờm tung bay nhẹ
      b.torsoY = Math.sin(t * 0.7) * 1.0; 
      b.head = Math.sin(t * 0.7) * 0.05;
    } 
    else if (state === 'walk') {
      const spd = t * 2.5; 
      b.torsoY = Math.abs(Math.sin(spd)) * -2;
    } 
    else if (state === 'attack') {
      // Nhảy chữ L: 0.0 -> 0.4 cất mình bay lên, 0.4 -> 0.7 chồm ngựa đâm thương, 0.7 -> 1.0 tiếp đất
      if (progress < 0.4) {
        let p = progress / 0.4;
        b.jumpOffset = -p * 12; // Nhảy vọt lên cao
        b.head = -0.2;
      } else if (progress < 0.7) {
        let p = (progress - 0.4) / 0.3;
        b.jumpOffset = -12 + p * 12; // Hạ độ cao
        b.rArm = 1.8; // Đâm trường thương thẳng tới trước
        b.head = 0.3;
      } else {
        b.jumpOffset = 0;
        b.rArm = 0;
      }
    }
    else if (state === 'hurt') {
      b.torsoY = Math.sin(t * 3) * -1.5;
      b.head = -0.3;
    }
    else if (state === 'die') {
      // Kỵ sĩ và ngựa mờ dần hóa thành làn sương khói ma thuật
      let p = Math.min(1, progress * 1.5); 
      b.torsoY = p * 8; 
      b.head = -p * 0.5; 
    }
    return b;
  }

  static drawCharacter(ctx, isRed, x, y, r, time, state, progress, isChecked) {
    const b = this.calcBones(state, time, progress);
    
    const scaleMod = 1.7; // Mã chiến có kích thước lớn
    const u = r * scaleMod * 0.05; 

    // Bảng màu Kỵ Binh (Trắng bạch mã / Xanh thép hoặc Đỏ tía)
    const cPrimary = isRed ? '#d32f2f' : '#1565c0'; 
    const cHorse   = isRed ? '#ffffff' : '#546e7a'; 
    const cArmor   = isRed ? '#b71c1c' : '#263238'; 
    const cTrim    = isRed ? '#ffd54f' : '#81d4fa'; 
    
    ctx.save();
    ctx.translate(x, y + r * 0.55 + b.jumpOffset * u); // Hỗ trợ nhấc người khi nhảy chữ L

    // Bóng đổ trên mặt đất (giữ nguyên vị trí gốc khi ngựa nhảy)
    if (b.jumpOffset === 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath(); ctx.ellipse(0, 0, r*0.9, r*0.3, 0, 0, Math.PI*2); ctx.fill();
    }

    // Hiệu ứng Tan biến (Defeat)
    if (state === 'die') {
      ctx.globalAlpha = Math.max(0, 1 - progress);
      ctx.translate(0, progress * u * 8); 
    }

    ctx.translate(0, b.torsoY * u); 
    const shoulderY = -u * 12, neckY = -u * 13;

    // --- CHIẾN MÃ (Horse Body) ---
    ctx.save();
    // Thân ngựa uốn lượn oai phong
    ctx.fillStyle = cHorse;
    ctx.beginPath(); 
    ctx.moveTo(-u*6, u*2); 
    ctx.bezierCurveTo(-u*8, -u*4, -u*4, -u*8, -u*2, -u*9); // Phần mông/lưng
    ctx.lineTo(u*4, -u*7); // Ngực ngựa
    ctx.bezierCurveTo(u*6, -u*4, u*6, u*2, u*5, u*4); // Chân trước
    ctx.lineTo(-u*5, u*4); ctx.closePath(); ctx.fill();

    // Đầu ngựa và bờm
    ctx.save(); ctx.translate(u*3.5, -u*9); ctx.rotate(b.head);
    ctx.fillStyle = cHorse; ctx.beginPath(); ctx.ellipse(0, -u*3, u*2.5, u*4.5, 0.4, 0, Math.PI*2); ctx.fill();
    // Giáp đầu ngựa (Barding)
    ctx.fillStyle = cArmor; ctx.beginPath(); ctx.ellipse(u*0.5, -u*4, u*2, u*3, 0.4, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = cTrim; ctx.lineWidth = u*0.8; ctx.stroke();
    // Bờm ngựa bay phấp phới
    ctx.fillStyle = cTrim; ctx.beginPath(); ctx.moveTo(-u*1.5, -u*4); ctx.quadraticCurveTo(-u*5, -u*2, -u*3, u*1); ctx.fill();
    ctx.restore();

    // Chữ Hán (Mã) trên mình ngựa
    ctx.font = `bold ${u*3.5}px "KaiTi", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; 
    ctx.fillStyle = cPrimary; ctx.fillText(isRed ? '傌' : '馬', 0, -u*3);
    ctx.restore();

    // --- KỴ SĨ (Rider) NGỒI TRÊN LƯNG ---
    ctx.save(); ctx.translate(0, shoulderY + u*2);
    
    // Thân kỵ sĩ
    ctx.fillStyle = cPrimary;
    ctx.beginPath(); ctx.roundRect(-u*3.5, -u*4, u*7, u*7, u); ctx.fill();
    ctx.strokeStyle = cTrim; ctx.lineWidth = u; ctx.stroke();

    // Đầu kỵ sĩ & Mũ giáp kỵ binh
    ctx.fillStyle = '#ffe0b2'; ctx.beginPath(); ctx.arc(0, -u*7, u*3.8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = cArmor; ctx.beginPath(); ctx.arc(0, -u*7.5, u*4, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = cTrim; ctx.lineWidth = u*0.8; ctx.stroke();

    // Tay phải cầm Trường Thương
    ctx.save(); ctx.translate(u*3, -u*2); ctx.rotate(b.rArm);
    
    // Vệt sáng đâm thương (Attack)
    if (state === 'attack' && progress > 0.4 && progress < 0.7) {
       ctx.strokeStyle = isRed ? 'rgba(255, 235, 59, 0.9)' : 'rgba(0, 229, 255, 0.9)';
       ctx.lineWidth = u*2.5; ctx.lineCap = 'round';
       ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(u*38, 0); ctx.stroke();
       ctx.shadowColor = isRed ? '#ffeb3b' : '#00e5ff'; ctx.shadowBlur = u*6;
    }

    // Cán thương dài
    ctx.fillStyle = '#3e2723'; ctx.fillRect(-u, -u*1.5, u*32, u*1.6);
    // Mũi trường thương kim loại
    ctx.fillStyle = '#eceff1'; 
    ctx.beginPath(); ctx.moveTo(u*32, -u*3); ctx.lineTo(u*40, -u*0.7); ctx.lineTo(u*32, u*1.5); ctx.closePath(); ctx.fill();
    ctx.restore();

    ctx.restore();
    ctx.restore();
  }
}