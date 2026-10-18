/**
 * CANNON RENDERER - PHÁP SƯ PHÁO THỦ (PHÁO / 砲)
 * Thiết kế: Pháp sư đội mũ trùm, vác cỗ pháo ma thuật khổng lồ, hiệu ứng đạn pháo tầm xa.
 */
class CannonRenderer {

  static calcBones(state, time, progress) {
    let b = { head: 0, torsoY: 0, lArm: 0, rArm: 0, lLeg: 0, rLeg: 0, recoil: 0 };
    const t = time * 0.01;

    if (state === 'idle') {
      // Pháo thủ nhịp nhàng tích tụ linh lực
      b.torsoY = Math.sin(t * 0.6) * 1.0; 
      b.lArm = Math.sin(t * 0.6) * 0.1;
      b.rArm = -Math.sin(t * 0.6) * 0.1;
    } 
    else if (state === 'walk') {
      const spd = t * 2.2; 
      b.torsoY = Math.abs(Math.sin(spd)) * -2;
      b.lLeg = Math.sin(spd) * 0.7;
      b.rLeg = -Math.sin(spd) * 0.7;
      b.lArm = -b.lLeg * 0.7; 
      b.rArm = -b.rLeg * 0.7;
    } 
    else if (state === 'attack') {
      // 0.0 -> 0.3: Ngóc nòng pháo, gồng lực
      // 0.3 -> 0.4: Khạc đạn (giật lùi - recoil mạnh)
      // 0.4 -> 0.8: Giữ tư thế xả khói
      // 0.8 -> 1.0: Thu thế
      if (progress < 0.3) {
        let p = progress / 0.3;
        b.rArm = -p * 0.5;
        b.torsoY = p * 1.5;
        b.head = -0.1;
      } else if (progress < 0.4) {
        // Cú giật lùi khi khai hỏa
        b.recoil = -6; 
        b.torsoY = -2;
        b.head = 0.2;
      } else if (progress < 0.8) {
        let p = (progress - 0.4) / 0.4;
        b.recoil = -6 * (1 - p); // Hồi phục dần độ giật
        b.torsoY = -2 * (1 - p);
      } else {
        b.recoil = 0;
      }
      b.lLeg = -0.3; b.rLeg = 0.3;
    }
    else if (state === 'hurt') {
      b.torsoY = Math.sin(t * 3) * -1.5;
      b.head = -0.3;
      b.lArm = -1.0; b.rArm = -1.0; 
    }
    else if (state === 'die') {
      // Cỗ pháo quá tải nổ tung, pháo thủ gục ngã
      let p = Math.min(1, progress * 1.5); 
      b.torsoY = p * 10; 
      b.head = -p * 1.0; 
      b.lArm = -p * 2.0; b.rArm = -p * 2.0; 
      b.lLeg = -p * 1.5; b.rLeg = p * 1.0; 
    }
    return b;
  }

  static drawCharacter(ctx, isRed, x, y, r, time, state, progress, isChecked) {
    const b = this.calcBones(state, time, progress);
    
    const scaleMod = 1.45; 
    const u = r * scaleMod * 0.05; 

    // Bảng màu Pháp sư Pháo thủ (Đỏ cam / Tím huyền bí)
    const cPrimary = isRed ? '#c62828' : '#4a148c'; 
    const cSecondary = isRed ? '#ff5722' : '#7c4dff'; 
    const cTrim    = isRed ? '#ffd54f' : '#b388ff'; 
    const cEnergy  = isRed ? '#ff3d00' : '#00e5ff'; // Năng lượng pháo
    
    ctx.save();
    ctx.translate(x, y + r * 0.55); // Neo bàn chân sát đất

    // Trận pháp ma thuật dưới chân (Magic Circle)
    ctx.save();
    ctx.rotate(time * 0.003);
    ctx.strokeStyle = cEnergy; ctx.lineWidth = u * 0.6;
    ctx.globalAlpha = 0.6 + Math.sin(time * 0.01) * 0.2;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2); ctx.stroke();
    // Vẽ dấu sao lục giác bên trong trận pháp
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const angle = i * Math.PI / 1.5;
      ctx.moveTo(Math.cos(angle) * r * 0.7, Math.sin(angle) * r * 0.7);
      ctx.lineTo(Math.cos(angle + Math.PI) * r * 0.7, Math.sin(angle + Math.PI) * r * 0.7);
    }
    ctx.stroke();
    ctx.restore();

    // Bóng đổ
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(0, 0, r*0.7, r*0.25, 0, 0, Math.PI*2); ctx.fill();

    // Hiệu ứng Tan biến
    if (state === 'die') {
      ctx.globalAlpha = Math.max(0, 1 - progress);
      ctx.translate(0, -progress * u * 10); 
    }

    ctx.translate(0, b.torsoY * u); 
    const hipY = -u * 4, shoulderY = -u * 12, neckY = -u * 13;

    // --- CHÂN (Nằm sau) ---
    const drawLeg = (side, rot) => {
      ctx.save(); ctx.translate(side * u * 2.5, hipY); ctx.rotate(rot);
      ctx.fillStyle = '#212121'; ctx.beginPath(); ctx.roundRect(-u*1.5, 0, u*3, u*7, u); ctx.fill();
      ctx.fillStyle = '#37474f'; ctx.fillRect(-u*2, u*3, u*4, u*4); 
      ctx.restore();
    };
    drawLeg(-1, b.lLeg); drawLeg(1, b.rLeg);

    // --- TAY TRÁI (Nằm sau) ---
    ctx.save(); ctx.translate(-u*4.5, shoulderY); ctx.rotate(b.lArm);
    ctx.fillStyle = cPrimary; ctx.beginPath(); ctx.roundRect(-u*1.5, 0, u*3, u*7, u); ctx.fill(); 
    ctx.fillStyle = '#ffcc80'; ctx.beginPath(); ctx.arc(0, u*7, u*1.5, 0, Math.PI*2); ctx.fill(); 
    ctx.restore();

    // --- THÂN MÌNH & ÁO CHOÀNG PHÁP SƯ ---
    ctx.save();
    // Áo trùm dài
    ctx.fillStyle = cPrimary;
    ctx.beginPath(); ctx.moveTo(-u*4, hipY - u); ctx.lineTo(-u*6, hipY + u*5); 
    ctx.lineTo(u*6, hipY + u*5); ctx.lineTo(u*4, hipY - u); ctx.fill();
    ctx.strokeStyle = cTrim; ctx.lineWidth = u; ctx.stroke();
    
    // Giáp ngực pháp sư
    ctx.fillStyle = cSecondary;
    ctx.beginPath(); ctx.roundRect(-u*4.5, shoulderY, u*9, u*9, u); ctx.fill();
    ctx.strokeStyle = cTrim; ctx.lineWidth = u; ctx.stroke();
    
    // Biểu tượng linh lực giữa ngực
    ctx.fillStyle = cEnergy; ctx.beginPath(); ctx.arc(0, shoulderY + u*4.5, u*1.8, 0, Math.PI*2); ctx.fill();

    // Chữ Hán
    ctx.font = `bold ${u*3.5}px "KaiTi", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; 
    ctx.fillStyle = '#ffffff'; ctx.fillText(isRed ? '炮' : '砲', 0, shoulderY + u*4.5);
    ctx.restore();

    // --- ĐẦU & MŨ TRÙM (Hood) ---
    ctx.save(); ctx.translate(0, neckY); ctx.rotate(b.head);
    ctx.fillStyle = '#ffe0b2'; ctx.beginPath(); ctx.arc(0, -u*3, u*4.2, 0, Math.PI*2); ctx.fill();
    
    if (state === 'hurt' || state === 'die') {
      ctx.strokeStyle = '#3e2723'; ctx.lineWidth = u*0.6;
      ctx.beginPath(); ctx.moveTo(-u*2.5, -u*4); ctx.lineTo(-u*1.2, -u*3); ctx.lineTo(-u*2.5, -u*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(u*2.5, -u*4); ctx.lineTo(u*1.2, -u*3); ctx.lineTo(u*2.5, -u*2); ctx.stroke();
    } else {
      ctx.fillStyle = '#212121'; // Mắt rực sáng tính toán
      ctx.beginPath(); ctx.ellipse(-u*1.5, -u*3.2, u*0.8, u*1.2, 0, 0, Math.PI*2); 
      ctx.ellipse(u*1.5, -u*3.2, u*0.8, u*1.2, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = cEnergy; ctx.beginPath(); ctx.arc(-u*1.5, -u*3.2, u*0.4, 0, Math.PI*2); ctx.arc(u*1.5, -u*3.2, u*0.4, 0, Math.PI*2); ctx.fill();
    }

    // Mũ trùm đầu pháp sư (Hood) che khuất nửa trên
    ctx.fillStyle = cPrimary;
    ctx.beginPath(); ctx.arc(0, -u*3.5, u*5, Math.PI, 0); 
    ctx.lineTo(u*4.5, -u*1); ctx.lineTo(-u*4.5, -u*1); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = cTrim; ctx.lineWidth = u; ctx.stroke();
    ctx.restore();

    // --- TAY PHẢI & CỖ PHÁO MA THUẬT KHỔNG LỒ ---
    ctx.save(); ctx.translate(u*4.5 + b.recoil * u * 0.2, shoulderY); ctx.rotate(b.rArm);
    ctx.fillStyle = cPrimary; ctx.beginPath(); ctx.roundRect(-u*1.5, 0, u*3, u*7, u); ctx.fill(); 
    
    // Gắn cỗ pháo vào tay
    ctx.translate(0, u*6); 
    ctx.save();
    ctx.rotate(-Math.PI * 0.25); // Vác pháo chếch lên
    
    // Hiệu ứng khạc đạn năng lượng (Attack)
    if (state === 'attack' && progress > 0.3 && progress < 0.7) {
       ctx.fillStyle = cEnergy;
       ctx.beginPath(); ctx.arc(0, -u*18, u*4 * (1 + progress), 0, Math.PI*2); ctx.fill();
       ctx.shadowColor = cEnergy; ctx.shadowBlur = u*8;
    }

    // Thân cỗ pháo (Nòng pháo ma thuật)
    ctx.fillStyle = '#263238'; ctx.beginPath(); ctx.roundRect(-u*3.5, -u*14, u*7, u*18, u*1.5); ctx.fill();
    ctx.strokeStyle = cTrim; ctx.lineWidth = u; ctx.stroke();
    // Các vòng đai năng lượng phát sáng trên nòng pháo
    ctx.fillStyle = cEnergy; ctx.fillRect(-u*3.6, -u*10, u*7.2, u*1.5); ctx.fillRect(-u*3.6, -u*4, u*7.2, u*1.5);
    // Miệng pháo loe to
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(0, -u*14, u*3.8, u*1.8, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = cTrim; ctx.stroke();

    ctx.restore();

    // Bàn tay phải cầm pháo
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffcc80'; ctx.beginPath(); ctx.arc(0, 0, u*1.8, 0, Math.PI*2); ctx.fill(); 
    ctx.restore();

    ctx.restore();
  }
}