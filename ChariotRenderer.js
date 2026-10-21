/**
 * CHARIOT RENDERER - CHIẾN XA CÀN QUÉT (XE / 車)
 * Thiết kế: Chiến binh giáp hộp.
 * Khi tấn công: Biến hình thành BẢO THÁP CHIẾN XA GAI KHỔNG LỒ càn quét đối thủ rồi trở về dạng ban đầu!
 */
class ChariotRenderer {

  static calcBones(state, time, progress) {
    let b = {
      head: 0, torsoY: 0, lArm: 0, rArm: 0, lLeg: 0, rLeg: 0,
      wheelRot: time * 0.02,
      growScale: 1,
      spikesOut: 0,
      ramOffset: 0
    };
    const t = time * 0.01;

    if (state === 'idle') {
      b.torsoY = Math.sin(t * 0.9) * 0.8;
      b.lArm = Math.sin(t * 0.9) * 0.05;
      b.rArm = -Math.sin(t * 0.9) * 0.05;
    } 
    else if (state === 'walk') {
      const spd = t * 3.0; 
      b.torsoY = Math.abs(Math.sin(spd)) * -1.5;
      b.wheelRot += 0.5;
    } 
    else if (state === 'attack') {
      // PHASE 1 (0.0 -> 0.35): BIẾN HÌNH THÀNH XE THIẾT GIÁP GAI KHỔNG LỒ!
      // PHÓNG TO 3.0X, BUNG CÁC LƯỠI GAI SẮT NHỌN BỌC XUNG QUANH
      // PHASE 2 (0.35 -> 0.70): BÁNH XE GAI CÀN QUÉT VỚI TỐC ĐỘ CAO DẬM ĐÈ BẸP ĐỐI THỦ!
      // PHASE 3 (0.70 -> 1.0): THU CÁC CƠ CẤU GAI VỀ DẠNG BAN ĐẦU
      if (progress < 0.35) {
        let p = progress / 0.35;
        b.growScale = 1 + p * 2.0; // Phóng to gấp 3.0 lần
        b.spikesOut = p; // Bung đinh gai
        b.wheelRot += p * 2.5;
        b.ramOffset = p * 10;
      } else if (progress < 0.7) {
        let p = (progress - 0.35) / 0.35;
        b.growScale = 3.0; // Giữ dạng Xe Gai Khổng Lồ
        b.spikesOut = 1.0;
        b.wheelRot += 5.0; // Bánh xe gai quay xé gió
        b.ramOffset = 10 + Math.sin(p * Math.PI) * 14;
      } else {
        let p = (progress - 0.7) / 0.3;
        b.growScale = 3.0 - p * 2.0; // Biến trở lại dạng ban đầu
        b.spikesOut = 1.0 - p;
        b.ramOffset = 10 * (1 - p);
      }
    }
    else if (state === 'hurt') {
      b.torsoY = Math.sin(t * 3) * -1.5;
      b.head = -0.3;
      b.lArm = -0.8; b.rArm = -0.8; 
    }
    else if (state === 'die') {
      let p = Math.min(1, progress * 1.5);
      b.torsoY = p * 10; 
      b.head = -p * 1.2; 
      b.lArm = -p * 2.0; b.rArm = -p * 2.0; 
    }
    return b;
  }

  static drawCharacter(ctx, isRed, x, y, r, time, state, progress, isChecked) {
    const b = this.calcBones(state, time, progress);
    
    let scaleMod = 1.6 * (b.growScale || 1);
    const u = r * scaleMod * 0.05; 

    const cPrimary = isRed ? '#8e0000' : '#212121';
    const cArmor   = isRed ? '#b71c1c' : '#37474f'; 
    const cTrim    = isRed ? '#ffca28' : '#90a4ae'; 
    const cMetal   = '#cfd8dc';
    const cSpike   = isRed ? '#ff1744' : '#00e5ff';

    ctx.save();
    ctx.translate(x, y + r * 0.55); // Neo sát mặt đất

    // Tỏ năng lượng rực cháy/điện phong khi hóa Xe Gai Khổng Lồ
    if (state === 'attack' && b.growScale > 1.3) {
      ctx.save();
      ctx.shadowColor = isRed ? '#ff3d00' : '#00e5ff';
      ctx.shadowBlur = u * 12;
      ctx.fillStyle = isRed ? 'rgba(255, 23, 68, 0.3)' : 'rgba(0, 229, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(0, -u * 10, u * 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // --- VẼ CƠ CẤU XE GAI KHỔNG LỒ (SPIKED WAR FORTRESS) KHI TẤN CÔNG ---
    if (state === 'attack' && b.spikesOut > 0.1) {
      const sp = b.spikesOut;

      // 1. KHUNG XE THIẾT GIÁP BỌC THÉP HỘP DẦY
      ctx.save();
      ctx.translate(0, -u * 6 + b.torsoY * u);

      // Thân xe thép hộp đồ sộ
      ctx.fillStyle = cPrimary;
      ctx.beginPath();
      ctx.roundRect(-u * 10, -u * 10, u * 20, u * 14, u * 2);
      ctx.fill();
      ctx.strokeStyle = cTrim;
      ctx.lineWidth = u * 1.5;
      ctx.stroke();

      // Mũi Bumper Càn Quét Gai Sắt Phía Trước (Spiked Ram Bumper)
      ctx.fillStyle = cArmor;
      ctx.beginPath();
      ctx.moveTo(-u * 11, u * 4);
      ctx.lineTo(0, u * 10 * sp);
      ctx.lineTo(u * 11, u * 4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = cSpike;
      ctx.lineWidth = u * 1.2;
      ctx.stroke();

      // Gai sắt sắc bén chĩa ra phía trước
      ctx.fillStyle = cMetal;
      for (let i = -4; i <= 4; i++) {
        const sx = i * u * 2.2;
        ctx.beginPath();
        ctx.moveTo(sx - u * 0.8, u * 4);
        ctx.lineTo(sx, u * (4 + 6 * sp));
        ctx.lineTo(sx + u * 0.8, u * 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = cSpike;
        ctx.lineWidth = u * 0.4;
        ctx.stroke();
      }

      // Gai sắt đâm ngang hai bên thân xe
      [-1, 1].forEach(side => {
        for (let j = 0; j < 3; j++) {
          const sy = -u * 8 + j * u * 4;
          ctx.fillStyle = cSpike;
          ctx.beginPath();
          ctx.moveTo(side * u * 10, sy - u * 0.8);
          ctx.lineTo(side * u * (10 + 5 * sp), sy);
          ctx.lineTo(side * u * 10, sy + u * 0.8);
          ctx.closePath();
          ctx.fill();
        }
      });

      // Chữ Hán rực lửa trên nắp Xe Gai
      ctx.font = `bold ${u * 6}px "KaiTi", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = cTrim;
      ctx.shadowColor = cSpike;
      ctx.shadowBlur = u * 4;
      ctx.fillText(isRed ? '俥' : '車', 0, -u * 3);
      ctx.shadowBlur = 0;

      ctx.restore();

      // 2. KHỔNG LỒ BÁNH XE GAI XOAY TRÒN HAI BÊN
      [-1, 1].forEach(side => {
        ctx.save();
        ctx.translate(side * u * 10, -u * 2);
        ctx.rotate(side * b.wheelRot);

        // Vành bánh xe gai
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(0, 0, u * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = cTrim;
        ctx.lineWidth = u * 1.5;
        ctx.stroke();

        // 8 Lưỡi Gai Dài Sắc Bổn Xoay Tròn Trên Bánh Xe
        for (let i = 0; i < 8; i++) {
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = cMetal;
          ctx.beginPath();
          ctx.moveTo(-u * 0.8, -u * 6);
          ctx.lineTo(0, -u * (6 + 5 * sp));
          ctx.lineTo(u * 0.8, -u * 6);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = cSpike;
          ctx.lineWidth = u * 0.5;
          ctx.stroke();
        }
        ctx.restore();
      });

      ctx.restore();
      return; // Vẽ xong dạng Xe Gai Khổng Lồ
    }

    // --- BÌNH THƯỜNG: VẼ DẠNG CHIẾN BINH XE GIÁP HỘP ---

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

    // --- THÂN MÌNH & GIÁP HỘP ---
    ctx.save();
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

    // Mũ giáp hộp che kín đầu
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
    
    ctx.translate(0, u*7);
    ctx.save();
    ctx.rotate(-Math.PI * 0.2); 
    
    // Cán đao dài
    ctx.fillStyle = '#3e2723'; ctx.fillRect(-u*1.2, -u*12, u*2.4, u*26);
    // Lưỡi Thanh Long Đại Đao
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