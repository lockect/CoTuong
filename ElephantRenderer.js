/**
 * ELEPHANT RENDERER - CHIẾN TƯỢNG (TƯỢNG / 象)
 * Thiết kế: Voi chiến bọc giáp đồ sộ. Khi tấn công biến hình thành Voi Khổng Lồ dậm nát đối thủ!
 */
class ElephantRenderer {

  static calcBones(state, time, progress) {
    let b = { head: 0, torsoY: 0, lArm: 0, rArm: 0, lLeg: 0, rLeg: 0, stomp: 0, growScale: 1, frontLegsUp: 0 };
    const t = time * 0.01;

    if (state === 'idle') {
      // Nhịp thở cực kỳ nặng nề
      b.torsoY = Math.sin(t * 0.3) * 0.8; 
    } 
    else if (state === 'walk') {
      const spd = t * 1.2; 
      b.torsoY = Math.abs(Math.sin(spd)) * -1.2;
    } 
    else if (state === 'attack') {
      // PHASE 1 (0.0 -> 0.35): Hóa thành Voi Khổng Lồ, chồm hai chân trước lên cao ngút trời
      // PHASE 2 (0.35 -> 0.55): Dậm cực mạnh 2 chân trước sập xuống đè bẹp đối thủ!
      // PHASE 3 (0.55 -> 1.0): Sóng chấn động rực lửa bùng nổ, voi dần thu nhỏ lại
      if (progress < 0.35) {
        let p = progress / 0.35;
        b.growScale = 1 + p * 2.2; // Phóng to gấp 3.2 lần!
        b.torsoY = -p * 14; // Chồm cao lên không trung
        b.frontLegsUp = p; // Chân trước nâng cao giương vuốt
        b.head = -0.35;
      } else if (progress < 0.55) {
        let p = (progress - 0.35) / 0.2;
        b.growScale = 3.2; // Giữ kích thước khổng lồ đỉnh điểm
        b.torsoY = -14 + p * 18; // Giẫm đạp cực mạnh xuống đất
        b.frontLegsUp = 1 - p; // Đạp sập chân trước xuống đất
        b.stomp = 1; // Kích hoạt sóng chấn động
        b.head = 0.45;
      } else {
        let p = (progress - 0.55) / 0.45;
        b.growScale = 3.2 - p * 2.2; // Thu nhỏ lại về bình thường
        b.torsoY = 4 * (1 - p);
        b.head = 0.45 * (1 - p);
      }
    }
    else if (state === 'hurt') {
      b.torsoY = Math.sin(t * 2) * -1;
      b.head = -0.2;
    }
    else if (state === 'die') {
      let p = Math.min(1, progress * 1.5);
      b.torsoY = p * 12;
      b.head = p * 0.5; 
    }
    return b;
  }

  static drawCharacter(ctx, isRed, x, y, r, time, state, progress, isChecked) {
    const b = this.calcBones(state, time, progress);
    
    let scaleMod = 1.8 * (b.growScale || 1); // Tỉ lệ phóng to khổng lồ khi tấn công
    const u = r * scaleMod * 0.05; 

    // Bảng màu Chiến Tượng
    const cPrimary = isRed ? '#8d6e63' : '#455a64'; 
    const cArmor   = isRed ? '#b71c1c' : '#263238'; 
    const cTrim    = isRed ? '#ffd54f' : '#90a4ae'; 
    
    ctx.save();
    ctx.translate(x, y + r * 0.6); // Neo sát mặt đất

    // Tỏa hào quang thần thú linh thần khi hóa Voi Khổng Lồ tấn công
    if (state === 'attack' && b.growScale > 1.2) {
      ctx.save();
      ctx.shadowColor = isRed ? '#ff3d00' : '#00e5ff';
      ctx.shadowBlur = u * 10;
      ctx.fillStyle = isRed ? 'rgba(255, 61, 0, 0.35)' : 'rgba(0, 229, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(0, -u * 10, u * 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Sóng chấn động lan tỏa khi dậm đất (Attack)
    if (state === 'attack' && progress >= 0.35 && progress <= 0.85) {
       const waveP = (progress - 0.35) / 0.5;
       ctx.save();
       ctx.strokeStyle = isRed ? 'rgba(255, 215, 0, 0.95)' : 'rgba(0, 229, 255, 0.95)';
       ctx.lineWidth = u * 3.0;
       ctx.beginPath();
       ctx.ellipse(0, u * 2, r * waveP * 3.2, r * waveP * 1.2, 0, 0, Math.PI * 2);
       ctx.stroke();

       // Sóng chấn động vòng 2 rực lửa
       ctx.strokeStyle = isRed ? 'rgba(255, 61, 0, 0.8)' : 'rgba(30, 136, 229, 0.8)';
       ctx.lineWidth = u * 2.0;
       ctx.beginPath();
       ctx.ellipse(0, u * 2, r * waveP * 2.2, r * waveP * 0.8, 0, 0, Math.PI * 2);
       ctx.stroke();
       ctx.restore();
    }

    // Bóng đổ đồ sộ
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.1 * (b.growScale || 1), r * 0.35 * (b.growScale || 1), 0, 0, Math.PI * 2);
    ctx.fill();

    // Hiệu ứng Tan biến khi chết
    if (state === 'die') {
      ctx.globalAlpha = Math.max(0, 1 - progress);
      ctx.translate(0, progress * u * 4); 
    }

    ctx.translate(0, b.torsoY * u); 
    const shoulderY = -u * 11, neckY = -u * 12;

    // --- CHÂN VOI KHỔNG LỒ (CHÂN TRƯỚC DẬM SẬP ĐIỆN PHONG) ---
    if (state === 'attack') {
      ctx.save();
      ctx.fillStyle = cPrimary;
      ctx.strokeStyle = cArmor;
      ctx.lineWidth = u * 0.8;

      const legY = shoulderY + u * 6;
      const legLift = (b.frontLegsUp || 0) * u * 9;

      // Chân trước trái
      ctx.beginPath();
      ctx.roundRect(-u * 6.5, legY - legLift, u * 4, u * 8 + legLift, u * 1.2);
      ctx.fill(); ctx.stroke();

      // Chân trước phải
      ctx.beginPath();
      ctx.roundRect(u * 2.5, legY - legLift, u * 4, u * 8 + legLift, u * 1.2);
      ctx.fill(); ctx.stroke();

      // Móng voi mạ vàng/thép sáng rực
      ctx.fillStyle = cTrim;
      ctx.fillRect(-u * 6.5, legY + u * 6, u * 4, u * 2);
      ctx.fillRect(u * 2.5, legY + u * 6, u * 4, u * 2);
      ctx.restore();
    }

    // --- THÂN VOI & GIÁP NẶNG ---
    ctx.save();
    // Thân voi đồ sộ
    ctx.fillStyle = cPrimary;
    ctx.beginPath(); ctx.roundRect(-u*7, shoulderY, u*14, u*10, u*3); ctx.fill();
    // Giáp trán và giáp lưng
    ctx.fillStyle = cArmor;
    ctx.beginPath(); ctx.roundRect(-u*5, shoulderY, u*10, u*6, u*2); ctx.fill();
    ctx.strokeStyle = cTrim; ctx.lineWidth = u; ctx.stroke();

    // Chữ Hán
    ctx.font = `bold ${u*4}px "KaiTi", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; 
    ctx.fillStyle = cTrim; ctx.fillText(isRed ? '相' : '象', 0, shoulderY + u*3);
    ctx.restore();

    // --- ĐẦU VOI, NGÀ & GIÁP TRÁN ---
    ctx.save(); ctx.translate(0, neckY); ctx.rotate(b.head);
    
    // Tai voi to bản vẫy nhẹ
    ctx.fillStyle = cPrimary;
    ctx.beginPath(); ctx.ellipse(-u*5, -u*3, u*2.5, u*4, -0.2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(u*5, -u*3, u*2.5, u*4, 0.2, 0, Math.PI*2); ctx.fill();

    // Đầu voi
    ctx.fillStyle = cPrimary; ctx.beginPath(); ctx.arc(0, -u*3, u*4.5, 0, Math.PI*2); ctx.fill();
    
    // Giáp trán đính ngọc
    ctx.fillStyle = cArmor; ctx.fillRect(-u*3.5, -u*6, u*7, u*3);
    ctx.fillStyle = isRed ? '#ff1744' : '#00e5ff'; ctx.beginPath(); ctx.arc(0, -u*4.5, u*1.2, 0, Math.PI*2); ctx.fill();

    // Ngà voi trắng sắc bén uốn cong
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(-u*2.5, -u*1); ctx.quadraticCurveTo(-u*6, u*2, -u*7, -u*1); ctx.fill();
    ctx.beginPath(); ctx.moveTo(u*2.5, -u*1); ctx.quadraticCurveTo(u*6, u*2, u*7, -u*1); ctx.fill();

    // Vòi voi cuộn phía trước
    ctx.fillStyle = cPrimary;
    ctx.beginPath(); ctx.moveTo(-u*1.5, -u*1); ctx.bezierCurveTo(-u*3, u*3, u*3, u*3, u*1.5, -u*1); ctx.fill();

    ctx.restore();

    ctx.restore();
  }
}