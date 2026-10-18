/**
 * ELEPHANT RENDERER - CHIẾN TƯỢNG (TƯỢNG / 象)
 * Thiết kế: Voi chiến bọc giáp đồ sộ, ngà dài, dậm đất tạo chấn động xung kích.
 */
class ElephantRenderer {

  static calcBones(state, time, progress) {
    let b = { head: 0, torsoY: 0, lArm: 0, rArm: 0, lLeg: 0, rLeg: 0, stomp: 0 };
    const t = time * 0.01;

    if (state === 'idle') {
      // Nhịp thở cực kỳ nặng nề, thể hiện trọng lượng lớn
      b.torsoY = Math.sin(t * 0.3) * 0.8; 
    } 
    else if (state === 'walk') {
      const spd = t * 1.2; 
      b.torsoY = Math.abs(Math.sin(spd)) * -1.2;
    } 
    else if (state === 'attack') {
      // 0.0 -> 0.3: Voi chồm hai chân trước lên cao
      // 0.3 -> 0.5: Dậm mạnh cực mạnh xuống đất
      // 0.5 -> 1.0: Thu thế và lan tỏa sóng chấn động
      if (progress < 0.3) {
        let p = progress / 0.3;
        b.torsoY = -p * 4; // Chồm lên
        b.head = -0.2;
      } else if (progress < 0.5) {
        let p = (progress - 0.3) / 0.2;
        b.torsoY = -4 + p * 6; // Dậm sập xuống
        b.stomp = 1; // Kích hoạt chấn động
        b.head = 0.2;
      } else {
        let p = (progress - 0.5) / 0.5;
        b.torsoY = 2 * (1 - p);
        b.head = 0.2 * (1 - p);
      }
    }
    else if (state === 'hurt') {
      b.torsoY = Math.sin(t * 2) * -1;
      b.head = -0.2;
    }
    else if (state === 'die') {
      // Voi chiến khụy ngã, giáp nứt vỡ
      let p = Math.min(1, progress * 1.5); 
      b.torsoY = p * 12; // Lún sập xuống
      b.head = p * 0.5; 
    }
    return b;
  }

  static drawCharacter(ctx, isRed, x, y, r, time, state, progress, isChecked) {
    const b = this.calcBones(state, time, progress);
    
    const scaleMod = 1.8; // Tượng là linh thú to lớn nhất bàn cờ
    const u = r * scaleMod * 0.05; 

    // Bảng màu Chiến Tượng (Nâu đất / Xám thép chiến giáp)
    const cPrimary = isRed ? '#8d6e63' : '#455a64'; 
    const cArmor   = isRed ? '#b71c1c' : '#263238'; 
    const cTrim    = isRed ? '#ffd54f' : '#90a4ae'; 
    
    ctx.save();
    ctx.translate(x, y + r * 0.6); // Neo sát mặt đất

    // Sóng chấn động lan tỏa khi dậm đất (Attack)
    if (state === 'attack' && progress >= 0.3 && progress <= 0.8) {
       const waveP = (progress - 0.3) / 0.5;
       ctx.strokeStyle = isRed ? 'rgba(255, 193, 7, 0.8)' : 'rgba(0, 229, 255, 0.8)';
       ctx.lineWidth = u * 1.5;
       ctx.beginPath();
       ctx.ellipse(0, u * 2, r * waveP * 1.5, r * waveP * 0.6, 0, 0, Math.PI * 2);
       ctx.stroke();
    }

    // Bóng đổ đồ sộ
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.ellipse(0, 0, r*1.1, r*0.35, 0, 0, Math.PI*2); ctx.fill();

    // Hiệu ứng Tan biến khi chết
    if (state === 'die') {
      ctx.globalAlpha = Math.max(0, 1 - progress);
      ctx.translate(0, progress * u * 4); 
    }

    ctx.translate(0, b.torsoY * u); 
    const shoulderY = -u * 11, neckY = -u * 12;

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