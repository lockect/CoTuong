/**
 * HORSE RENDERER - THẦN MÃ CHIẾN TƯỚNG (MÃ / 馬)
 * Thiết kế: Kỵ sĩ cưỡi chiến mã oai phong, yên cương rõ nét, 
 * bờm đuôi bồng bềnh, hoạt ảnh phi nước kiệu và đâm thương xé gió.
 */
class HorseRenderer {

  /**
   * Tính toán góc xoay khớp xương và chuyển động cơ học
   */
  static calcBones(state, time, progress) {
    let b = {
      torsoY: 0,
      horseHeadRot: 0,
      riderRot: 0,
      frontLegRot: 0,
      backLegRot: 0,
      spearRot: 0,
      tailWave: 0,
      jumpOffset: 0
    };
    const t = time * 0.01;

    // Đuôi ngựa và bờm luôn đung đưa tự nhiên
    b.tailWave = Math.sin(t * 1.5) * 0.15;

    if (state === 'idle') {
      // Ngựa nhún chân gõ móng kiêu hãnh, kỵ sĩ thở theo nhịp ngựa
      b.torsoY = Math.sin(t * 0.8) * 1.2;
      b.horseHeadRot = Math.sin(t * 0.8) * 0.04;
      b.riderRot = -b.horseHeadRot * 0.5;
      b.frontLegRot = Math.sin(t * 0.8) * 0.08;
      b.backLegRot = -Math.sin(t * 0.8) * 0.05;
      b.spearRot = Math.sin(t * 0.8) * 0.03;
    } 
    else if (state === 'walk') {
      // Phi nước kiệu nhịp nhàng (Trot gallop)
      const spd = t * 3.0;
      b.torsoY = Math.abs(Math.sin(spd)) * -2.5;
      b.horseHeadRot = Math.sin(spd) * 0.12;
      b.riderRot = Math.sin(spd) * 0.08;
      b.frontLegRot = Math.sin(spd) * 0.5;
      b.backLegRot = -Math.sin(spd) * 0.5;
      b.spearRot = -Math.sin(spd) * 0.15;
    } 
    else if (state === 'attack') {
      // Cú nhảy chữ L:
      // 0.0 -> 0.4: Nhún mình phi thân vút lên cao
      // 0.4 -> 0.7: Ngựa chồm hai vó trước (Rearing), kỵ sĩ phóng thương xuyên thấu
      // 0.7 -> 1.0: Tiếp đất oai hùng
      if (progress < 0.4) {
        let p = progress / 0.4;
        b.jumpOffset = -p * 15;
        b.horseHeadRot = -p * 0.25;
        b.riderRot = -p * 0.2;
        b.frontLegRot = -p * 0.6;
        b.backLegRot = p * 0.4;
        b.spearRot = -p * 0.4; // Kéo thương ra sau lấy đà
      } else if (progress < 0.7) {
        let p = (progress - 0.4) / 0.3;
        b.jumpOffset = -15 + p * 12;
        b.horseHeadRot = 0.35;
        b.riderRot = 0.3;
        b.frontLegRot = 0.8; // Tung hai chân trước lên cao
        b.backLegRot = -0.3;
        b.spearRot = 1.9; // Đâm thẳng thương về phía trước
      } else {
        let p = (progress - 0.7) / 0.3;
        b.jumpOffset = -3 * (1 - p);
        b.horseHeadRot = 0.35 * (1 - p);
        b.riderRot = 0.3 * (1 - p);
        b.frontLegRot = 0.8 * (1 - p);
        b.backLegRot = -0.3 * (1 - p);
        b.spearRot = 1.9 * (1 - p);
      }
    }
    else if (state === 'hurt') {
      b.torsoY = Math.sin(t * 3) * -1.8;
      b.horseHeadRot = -0.3;
      b.riderRot = -0.35;
      b.frontLegRot = -0.3;
    }
    else if (state === 'die') {
      // Ngựa chững lại dừng bước, cả hai hóa thành làn sương khói
      let p = Math.min(1, progress * 1.4);
      b.torsoY = p * 8;
      b.horseHeadRot = p * 0.2;
      b.riderRot = p * 0.25;
      b.spearRot = -p * 0.5;
    }
    return b;
  }

  /**
   * Kết xuất đồ họa Kỵ Sĩ cưỡi Chiến Mã 2.5D
   */
  static drawCharacter(ctx, isRed, x, y, r, time, state, progress, isChecked) {
    const b = this.calcBones(state, time, progress);
    
    // Tỷ lệ cơ thể cân đối và nổi bật trên ô cờ
    const scaleMod = 1.65;
    const u = r * scaleMod * 0.05;

    // Bảng màu gradient mượt mà:
    // Phe Đỏ: Bạch mã thuần khiết, kỵ sĩ giáp đỏ hoàng gia nẹp viền vàng kim
    // Phe Đen: Thiết mã huyền bí, kỵ sĩ giáp xanh thép uy nghiêm nẹp viền bạc lơ
    const cPrimary     = isRed ? '#c62828' : '#1565c0';
    const cPrimaryDark = isRed ? '#8e0000' : '#0d47a1';
    const cTrim        = isRed ? '#ffd54f' : '#81d4fa';
    const cTrimHighlight = isRed ? '#fff9c4' : '#e1f5fe';
    const cArmorMetal  = isRed ? '#b71c1c' : '#263238';

    // Màu lông ngựa có đổ bóng khối
    const horseColorBase = isRed ? '#f5f5f5' : '#455a64';
    const horseColorDark = isRed ? '#cfd8dc' : '#263238';
    const maneColor      = isRed ? '#ffb300' : '#29b6f6';

    ctx.save();
    // Neo bàn chân và độ nảy nhảy cao
    ctx.translate(x, y + r * 0.55 + b.jumpOffset * u);

    // 1. BÓNG ĐỔ DƯỚI ĐẤT (Co giãn theo độ cao nhảy)
    const shadowScale = Math.max(0.3, 1 - Math.abs(b.jumpOffset) * 0.04);
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, -b.jumpOffset * u, r * 0.85 * shadowScale, r * 0.28 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Hiệu ứng Tan biến (Defeat)
    if (state === 'die') {
      ctx.globalAlpha = Math.max(0, 1 - progress);
      ctx.translate(0, progress * u * 6);
    }

    ctx.translate(0, b.torsoY * u);

    // ==========================================
    // 2. CHÂN NGỰA BÊN TRÁI (LỚP SAU CÙNG)
    // ==========================================
    const drawBackLeg = (legX, legY, rot) => {
      ctx.save();
      ctx.translate(legX, legY);
      ctx.rotate(rot);
      ctx.fillStyle = horseColorDark;
      // Đùi sau & cẳng chân
      ctx.beginPath();
      ctx.moveTo(-u * 1.5, 0);
      ctx.quadraticCurveTo(-u * 2, u * 4, -u * 1, u * 8);
      ctx.lineTo(u * 1, u * 8);
      ctx.quadraticCurveTo(u * 2, u * 4, u * 1.5, 0);
      ctx.closePath();
      ctx.fill();
      // Móng ngựa sắt
      ctx.fillStyle = '#212121';
      ctx.fillRect(-u * 1.2, u * 7.5, u * 2.4, u * 1.8);
      ctx.restore();
    };
    drawBackLeg(-u * 5.5, u * 1.5, b.backLegRot - 0.2); // Chân sau bên kia
    drawBackLeg(u * 3.5, u * 1.5, b.frontLegRot - 0.3); // Chân trước bên kia

    // ==========================================
    // 3. ĐUÔI NGỰA (MỀM MẠI, ĐUNG ĐƯA THEO GIÓ)
    // ==========================================
    ctx.save();
    ctx.translate(-u * 7, -u * 1);
    ctx.rotate(b.tailWave - 0.3);
    const tailGrad = ctx.createLinearGradient(0, 0, -u * 5, u * 8);
    tailGrad.addColorStop(0, maneColor);
    tailGrad.addColorStop(1, horseColorDark);
    ctx.fillStyle = tailGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-u * 4, u * 2, -u * 5, u * 7);
    ctx.quadraticCurveTo(-u * 2, u * 8, 0, u * 5);
    ctx.quadraticCurveTo(-u * 1, u * 2, u * 0.5, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // ==========================================
    // 4. THÂN CHIẾN MÃ (BODY & CƠ BẮP NỞ NANG)
    // ==========================================
    ctx.save();
    const horseGrad = ctx.createLinearGradient(-u * 7, -u * 8, u * 6, u * 4);
    horseGrad.addColorStop(0, horseColorBase);
    horseGrad.addColorStop(0.6, horseColorBase);
    horseGrad.addColorStop(1, horseColorDark);
    ctx.fillStyle = horseGrad;

    // Đường cong thân ngựa: Mông tròn, lưng lõm đặt yên, ức ngực nở
    ctx.beginPath();
    ctx.moveTo(-u * 7, -u * 1); // Đỉnh mông
    ctx.bezierCurveTo(-u * 7.5, -u * 5, -u * 4.5, -u * 7, -u * 1, -u * 6.5); // Lưng
    ctx.bezierCurveTo(u * 2, -u * 6, u * 4.5, -u * 4, u * 5.5, -u * 1);       // Ức ngực
    ctx.bezierCurveTo(u * 6, u * 3, u * 3.5, u * 4, u * 1, u * 3.5);            // Bụng dưới
    ctx.bezierCurveTo(-u * 3, u * 3.5, -u * 6, u * 3, -u * 7, -u * 1);          // Đùi sau
    ctx.closePath();
    ctx.fill();

    // Giáp ức bảo vệ ngực ngựa (Peytral Plate)
    ctx.fillStyle = cArmorMetal;
    ctx.beginPath();
    ctx.moveTo(u * 1.5, -u * 5);
    ctx.quadraticCurveTo(u * 6, -u * 3.5, u * 5.2, u * 2);
    ctx.lineTo(u * 3.5, u * 2.5);
    ctx.quadraticCurveTo(u * 4, -u * 2, u * 0.5, -u * 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = cTrim;
    ctx.lineWidth = u * 0.6;
    ctx.stroke();

    // Chữ Hán (傌 / 馬) khắc nổi hào quang bên mông ngựa
    ctx.font = `bold ${u * 3.2}px "KaiTi", "SimSun", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = cPrimary;
    ctx.shadowColor = cTrim;
    ctx.shadowBlur = 4;
    ctx.fillText(isRed ? '傌' : '馬', -u * 3.5, -u * 1.5);
    ctx.shadowBlur = 0;
    ctx.restore();

    // ==========================================
    // 5. YÊN CƯƠNG (SADDLE & BÀN ĐẠP CHÂN)
    // ==========================================
    ctx.save();
    // Tấm lót yên bọc nhung
    ctx.fillStyle = cPrimaryDark;
    ctx.beginPath();
    ctx.roundRect(-u * 3.5, -u * 7, u * 6, u * 4.5, u);
    ctx.fill();
    ctx.strokeStyle = cTrim;
    ctx.lineWidth = u * 0.5;
    ctx.stroke();

    // Đệm yên da nâu
    ctx.fillStyle = '#4e342e';
    ctx.beginPath();
    ctx.ellipse(-u * 0.5, -u * 6.5, u * 2.5, u * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ==========================================
    // 6. KỴ SĨ CHIẾN TƯỚNG (RIDER - CƯỠI NGỰA RÕ RÀNG)
    // ==========================================
    ctx.save();
    ctx.translate(-u * 0.5, -u * 7); // Tọa độ hông kỵ sĩ đặt vừa khít trên yên
    ctx.rotate(b.riderRot);

    // --- 6.1. Áo choàng nhẹ sau lưng ---
    ctx.save();
    ctx.fillStyle = isRed ? '#8e0000' : '#0d47a1';
    const capeSway = Math.sin(time * 0.006) * u * 1.5;
    ctx.beginPath();
    ctx.moveTo(-u * 2, -u * 6);
    ctx.quadraticCurveTo(-u * 5 - capeSway, -u * 2, -u * 6.5, u * 3);
    ctx.lineTo(-u * 2.5, u * 2);
    ctx.quadraticCurveTo(-u * 1.5, -u * 2, 0, -u * 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // --- 6.2. Chân kỵ sĩ áp sát hông ngựa & Giáp ủng đạp bàn đạp ---
    ctx.save();
    ctx.fillStyle = cArmorMetal;
    // Đùi kỵ sĩ hướng chếch về trước
    ctx.beginPath();
    ctx.roundRect(-u * 1.2, -u * 0.5, u * 2.8, u * 4, u * 0.8);
    ctx.fill();
    ctx.strokeStyle = cTrim;
    ctx.lineWidth = u * 0.4;
    ctx.stroke();

    // Bắp chân & Ủng da buông thẳng xuống bàn đạp
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.roundRect(-u * 0.6, u * 3, u * 2.2, u * 3.8, u * 0.6);
    ctx.fill();
    // Bàn đạp kim loại bọc ngoài
    ctx.fillStyle = cTrim;
    ctx.fillRect(-u * 1, u * 6.2, u * 3, u * 0.8);
    ctx.restore();

    // --- 6.3. Thân mình & Thiết giáp ngực ---
    ctx.save();
    const riderArmorGrad = ctx.createLinearGradient(-u * 2.5, -u * 6, u * 2.5, 0);
    riderArmorGrad.addColorStop(0, cPrimary);
    riderArmorGrad.addColorStop(0.5, cPrimaryDark);
    riderArmorGrad.addColorStop(1, cArmorMetal);
    ctx.fillStyle = riderArmorGrad;

    ctx.beginPath();
    ctx.roundRect(-u * 2.2, -u * 6.5, u * 4.4, u * 6.5, u * 1.2);
    ctx.fill();
    ctx.strokeStyle = cTrim;
    ctx.lineWidth = u * 0.6;
    ctx.stroke();

    // Họa tiết hoa văn giáp ngực & Thắt lưng ngọc
    ctx.fillStyle = cTrim;
    ctx.fillRect(-u * 2.2, -u * 1.5, u * 4.4, u * 1.2);
    ctx.fillStyle = isRed ? '#ff1744' : '#00e5ff';
    ctx.beginPath();
    ctx.arc(0, -u * 0.9, u * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- 6.4. Đầu kỵ sĩ & Mũ chiến binh ngọc vũ ---
    ctx.save();
    ctx.translate(0, -u * 7.5);
    // Khuôn mặt
    ctx.fillStyle = '#ffe0b2';
    ctx.beginPath();
    ctx.arc(0, -u * 2, u * 2.6, 0, Math.PI * 2);
    ctx.fill();

    // Ánh mắt chiến binh sắc bén
    if (state === 'hurt' || state === 'die') {
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = u * 0.5;
      ctx.beginPath();
      ctx.moveTo(-u * 1.5, -u * 2.5); ctx.lineTo(-u * 0.5, -u * 1.8);
      ctx.moveTo(u * 0.5, -u * 1.8); ctx.lineTo(u * 1.5, -u * 2.5);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.ellipse(-u * 1, -u * 2.2, u * 0.5, u * 0.8, 0.1, 0, Math.PI * 2);
      ctx.ellipse(u * 1, -u * 2.2, u * 0.5, u * 0.8, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-u * 1.1, -u * 2.4, u * 0.25, 0, Math.PI * 2);
      ctx.arc(u * 0.9, -u * 2.4, u * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mũ trụ kỵ binh bọc kim loại
    ctx.fillStyle = cArmorMetal;
    ctx.beginPath();
    ctx.arc(0, -u * 2.5, u * 2.8, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = cTrim;
    ctx.lineWidth = u * 0.6;
    ctx.stroke();

    // Vành mũ bảo vệ hai bên má
    ctx.fillStyle = cPrimary;
    ctx.fillRect(-u * 2.8, -u * 2.5, u * 0.9, u * 2.5);
    ctx.fillRect(u * 1.9, -u * 2.5, u * 0.9, u * 2.5);

    // Chùm lông vũ phất phới trên đỉnh mũ
    const plumeWiggle = Math.sin(time * 0.01) * u * 1.2;
    ctx.fillStyle = isRed ? '#ff1744' : '#00e5ff';
    ctx.beginPath();
    ctx.moveTo(0, -u * 5.3);
    ctx.quadraticCurveTo(-u * 3 + plumeWiggle, -u * 8, -u * 4 + plumeWiggle, -u * 10);
    ctx.quadraticCurveTo(-u * 1, -u * 7.5, 0, -u * 5.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // --- 6.5. Tay trái kỵ sĩ ghì dây cương ---
    ctx.save();
    ctx.translate(u * 1.2, -u * 4.5);
    ctx.fillStyle = cPrimary;
    ctx.beginPath();
    ctx.roundRect(0, 0, u * 2.2, u * 3.5, u * 0.8);
    ctx.fill();
    ctx.fillStyle = '#ffcc80'; // Bàn tay
    ctx.beginPath();
    ctx.arc(u * 1.8, u * 3.5, u * 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- 6.6. Tay phải & Trường Thương Kỵ Binh (Lance) ---
    ctx.save();
    ctx.translate(-u * 1.8, -u * 5);
    ctx.rotate(b.spearRot);

    // Giáp vai kỵ binh mạ vàng
    ctx.fillStyle = cTrim;
    ctx.beginPath();
    ctx.arc(0, 0, u * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Cánh tay cầm thương
    ctx.fillStyle = cPrimary;
    ctx.beginPath();
    ctx.roundRect(-u * 1, 0, u * 2.2, u * 4.5, u * 0.8);
    ctx.fill();
    ctx.fillStyle = '#ffcc80';
    ctx.beginPath();
    ctx.arc(0, u * 4.5, u * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Vệt hào quang xé gió khi Tấn công (Piercing Beam)
    if (state === 'attack' && progress > 0.35 && progress < 0.75) {
      ctx.save();
      const beamGrad = ctx.createLinearGradient(0, -u * 15, u * 38, -u * 15);
      beamGrad.addColorStop(0, '#ffffff');
      beamGrad.addColorStop(0.4, isRed ? '#ffeb3b' : '#00e5ff');
      beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.strokeStyle = beamGrad;
      ctx.lineWidth = u * 2.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(u * 5, -u * 15);
      ctx.lineTo(u * 42, -u * 15);
      ctx.stroke();

      ctx.shadowColor = isRed ? '#ffd54f' : '#00e5ff';
      ctx.shadowBlur = u * 8;
      ctx.restore();
    }

    // Cán thương gỗ cứng bọc da
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(-u * 0.7, -u * 24, u * 1.4, u * 36);

    // Đai chắn tay cầm thương mạ vàng
    ctx.fillStyle = cTrim;
    ctx.beginPath();
    ctx.ellipse(0, -u * 5, u * 2.2, u * 1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tua rua lụa đỏ/xanh phất phới dưới mũi thương
    ctx.fillStyle = isRed ? '#ff1744' : '#00e5ff';
    ctx.beginPath();
    ctx.moveTo(-u * 1.5, -u * 23.5);
    ctx.lineTo(u * 2.5, -u * 21);
    ctx.lineTo(-u * 0.5, -u * 25.5);
    ctx.closePath();
    ctx.fill();

    // Mũi trường thương thép sắc bén phản quang
    const spearHeadGrad = ctx.createLinearGradient(0, -u * 24, 0, -u * 34);
    spearHeadGrad.addColorStop(0, '#90a4ae');
    spearHeadGrad.addColorStop(0.5, '#ffffff');
    spearHeadGrad.addColorStop(1, cTrimHighlight);

    ctx.fillStyle = spearHeadGrad;
    ctx.beginPath();
    ctx.moveTo(0, -u * 35); // Đỉnh nhọn mũi thương
    ctx.lineTo(u * 2.2, -u * 24);
    ctx.lineTo(0, -u * 25.5);
    ctx.lineTo(-u * 2.2, -u * 24);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = u * 0.4;
    ctx.stroke();

    ctx.restore();
    ctx.restore(); // Kết thúc nhóm kỵ sĩ

    // ==========================================
    // 7. CỔ VÀ ĐẦU CHIẾN MÃ (LỚP TRÊN CÙNG)
    // ==========================================
    ctx.save();
    ctx.translate(u * 4.5, -u * 4.5);
    ctx.rotate(b.horseHeadRot);

    // Cổ ngựa vươn kiêu hãnh
    ctx.fillStyle = horseColorBase;
    ctx.beginPath();
    ctx.moveTo(-u * 3.5, u * 2.5);
    ctx.quadraticCurveTo(-u * 1, -u * 4, u * 1.5, -u * 5.5);
    ctx.lineTo(u * 4.5, -u * 2.5);
    ctx.quadraticCurveTo(u * 3, u * 2, 0, u * 4);
    ctx.closePath();
    ctx.fill();

    // Bờm ngựa lượn sóng mềm mại
    ctx.fillStyle = maneColor;
    for (let i = 0; i < 4; i++) {
      const maneWave = Math.sin(time * 0.01 + i * 0.8) * u * 0.8;
      ctx.beginPath();
      ctx.moveTo(-u * 2 + i * u * 1.2, -u * 2 - i * u * 1.1);
      ctx.quadraticCurveTo(-u * 4.5 + maneWave, -u * 1 - i * u * 1.1, -u * 3, u * 0.5 - i * u * 1.1);
      ctx.closePath();
      ctx.fill();
    }

    // Đầu và mõm ngựa
    ctx.save();
    ctx.translate(u * 2.5, -u * 5);

    // Khuôn đầu ngựa
    ctx.fillStyle = horseColorBase;
    ctx.beginPath();
    ctx.ellipse(0, 0, u * 2.2, u * 3.8, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Mõm và lỗ mũi ngựa thở
    ctx.fillStyle = horseColorDark;
    ctx.beginPath();
    ctx.ellipse(u * 2, u * 2.2, u * 1.2, u * 1.5, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(u * 2.4, u * 2.1, u * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Mắt ngựa to sáng, dũng mãnh
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.ellipse(-u * 0.2, -u * 0.8, u * 0.7, u * 1.1, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isRed ? '#ffd54f' : '#00e5ff';
    ctx.beginPath();
    ctx.arc(-u * 0.2, -u * 0.9, u * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Đôi tai ngựa vểnh lên
    ctx.fillStyle = horseColorBase;
    ctx.beginPath();
    ctx.moveTo(-u * 1.2, -u * 3);
    ctx.lineTo(-u * 0.8, -u * 5.8);
    ctx.lineTo(u * 0.2, -u * 3.2);
    ctx.closePath();
    ctx.fill();

    // Giáp bảo vệ trán ngựa (Chamfron)
    ctx.fillStyle = cArmorMetal;
    ctx.beginPath();
    ctx.roundRect(-u * 1, -u * 2.5, u * 1.8, u * 3.5, u * 0.6);
    ctx.fill();
    ctx.strokeStyle = cTrim;
    ctx.lineWidth = u * 0.5;
    ctx.stroke();

    // Ngọc tâm trán ngựa
    ctx.fillStyle = isRed ? '#ff1744' : '#00e5ff';
    ctx.beginPath();
    ctx.arc(-u * 0.1, -u * 0.8, u * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Dây cương da nối từ miệng ngựa về tay kỵ sĩ
    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = u * 0.5;
    ctx.beginPath();
    ctx.moveTo(u * 1.5, u * 1.8);
    ctx.quadraticCurveTo(-u * 2, u * 4, -u * 4.5, u * 7);
    ctx.stroke();

    ctx.restore(); // Hết đầu ngựa
    ctx.restore(); // Hết cổ ngựa

    // ==========================================
    // 8. CHÂN NGỰA BÊN PHẢI (LỚP TRƯỚC)
    // ==========================================
    const drawFrontLeg = (legX, legY, rot) => {
      ctx.save();
      ctx.translate(legX, legY);
      ctx.rotate(rot);
      // Đùi trước cơ bắp
      ctx.fillStyle = horseColorBase;
      ctx.beginPath();
      ctx.roundRect(-u * 1.5, 0, u * 3, u * 8, u);
      ctx.fill();
      // Khớp chân & Móng ngựa sắt mạ vàng
      ctx.fillStyle = '#212121';
      ctx.fillRect(-u * 1.4, u * 6.5, u * 2.8, u * 2);
      ctx.fillStyle = cTrim;
      ctx.fillRect(-u * 1.4, u * 6.5, u * 2.8, u * 0.6);
      ctx.restore();
    };
    drawFrontLeg(-u * 4.5, u * 2, b.backLegRot);  // Chân sau bên này
    drawFrontLeg(u * 4.5, u * 2, b.frontLegRot);   // Chân trước bên này

    ctx.restore();
  }
}
