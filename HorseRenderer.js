/**
 * HORSE RENDERER - THẦN MÃ CHIẾN TƯỚNG (MÃ / 馬)
 * Thiết kế: Kỵ sĩ cưỡi chiến mã oai phong.
 * Khi tấn công: Đâm liên hoàn 3 phát thần tốc xé gió kèm vô số ánh sao rực rỡ!
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
      jumpOffset: 0,
      thrustDist: 0,
      hitCount: 0
    };
    const t = time * 0.01;

    b.tailWave = Math.sin(t * 1.5) * 0.15;

    if (state === 'idle') {
      b.torsoY = Math.sin(t * 0.8) * 1.2;
      b.horseHeadRot = Math.sin(t * 0.8) * 0.04;
      b.riderRot = -b.horseHeadRot * 0.5;
      b.frontLegRot = Math.sin(t * 0.8) * 0.08;
      b.backLegRot = -Math.sin(t * 0.8) * 0.05;
      b.spearRot = Math.sin(t * 0.8) * 0.03;
    }
    else if (state === 'walk') {
      const spd = t * 3.0;
      b.torsoY = Math.abs(Math.sin(spd)) * -2.5;
      b.horseHeadRot = Math.sin(spd) * 0.12;
      b.riderRot = Math.sin(spd) * 0.08;
      b.frontLegRot = Math.sin(spd) * 0.5;
      b.backLegRot = -Math.sin(spd) * 0.5;
      b.spearRot = -Math.sin(spd) * 0.15;
    }
    else if (state === 'attack') {
      // ĐÂM LIÊN HOÀN 3 PHÁT THẦN TỐC (TRIPLE THRUST FLURRY):
      // Phát 1 (0.0 -> 0.3): Đâm thụt thương tốc độ cao phát 1
      // Phát 2 (0.3 -> 0.6): Đâm thụt thương tốc độ cao phát 2
      // Phát 3 (0.6 -> 0.85): Đâm dồn lực phát 3 bùng nổ ánh sao!
      // Thu thế (0.85 -> 1.0): Rút thương về tư thế chuẩn
      b.jumpOffset = -Math.sin(progress * Math.PI) * 10;
      b.frontLegRot = 0.6;
      b.backLegRot = -0.3;

      if (progress < 0.3) {
        let p = progress / 0.3;
        b.thrustDist = Math.sin(p * Math.PI) * 18; // Biên độ đâm phát 1
        b.spearRot = 2.4;
        b.hitCount = 1;
      } else if (progress < 0.6) {
        let p = (progress - 0.3) / 0.3;
        b.thrustDist = Math.sin(p * Math.PI) * 22; // Biên độ đâm phát 2
        b.spearRot = 2.2;
        b.hitCount = 2;
      } else if (progress < 0.85) {
        let p = (progress - 0.6) / 0.25;
        b.thrustDist = Math.sin(p * Math.PI) * 26; // Biên độ đâm bùng nổ phát 3
        b.spearRot = 2.5;
        b.hitCount = 3;
      } else {
        let p = (progress - 0.85) / 0.15;
        b.thrustDist = 26 * (1 - p);
        b.spearRot = 2.5 * (1 - p);
      }
    }
    else if (state === 'hurt') {
      b.torsoY = Math.sin(t * 3) * -1.8;
      b.horseHeadRot = -0.3;
      b.riderRot = -0.35;
      b.frontLegRot = -0.3;
    }
    else if (state === 'die') {
      let p = Math.min(1, progress * 1.4);
      b.torsoY = p * 8;
      b.horseHeadRot = p * 0.2;
      b.riderRot = p * 0.25;
      b.spearRot = -p * 0.5;
    }
    return b;
  }

  /**
   * Vẽ ngôi sao 4 cánh lấp lánh (Starlight Effect)
   */
  static drawStar(ctx, cx, cy, r, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = r * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.quadraticCurveTo(cx, cy, cx + r, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy + r);
    ctx.quadraticCurveTo(cx, cy, cx - r, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy - r);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * Kết xuất đồ họa Kỵ Sĩ cưỡi Chiến Mã 2.5D
   */
  static drawCharacter(ctx, isRed, x, y, r, time, state, progress, isChecked) {
    const b = this.calcBones(state, time, progress);

    const scaleMod = 1.65;
    const u = r * scaleMod * 0.05;

    const cPrimary     = isRed ? '#c62828' : '#1565c0';
    const cPrimaryDark = isRed ? '#8e0000' : '#0d47a1';
    const cTrim        = isRed ? '#ffd54f' : '#81d4fa';
    const cTrimHighlight = isRed ? '#fff9c4' : '#e1f5fe';
    const cArmorMetal  = isRed ? '#b71c1c' : '#263238';

    const horseColorBase = isRed ? '#f5f5f5' : '#455a64';
    const horseColorDark = isRed ? '#cfd8dc' : '#263238';
    const maneColor      = isRed ? '#ffb300' : '#29b6f6';

    ctx.save();
    ctx.translate(x, y + r * 0.55 + b.jumpOffset * u);

    // BÓNG ĐỔ DƯỚI ĐẤT
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

    // 2. CHÂN NGỰA BÊN TRÁI
    const drawBackLeg = (legX, legY, rot) => {
      ctx.save();
      ctx.translate(legX, legY);
      ctx.rotate(rot);
      ctx.fillStyle = horseColorDark;
      ctx.beginPath();
      ctx.moveTo(-u * 1.5, 0);
      ctx.quadraticCurveTo(-u * 2, u * 4, -u * 1, u * 8);
      ctx.lineTo(u * 1, u * 8);
      ctx.quadraticCurveTo(u * 2, u * 4, u * 1.5, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#212121';
      ctx.fillRect(-u * 1.2, u * 7.5, u * 2.4, u * 1.8);
      ctx.restore();
    };
    drawBackLeg(-u * 5.5, u * 1.5, b.backLegRot - 0.2);
    drawBackLeg(u * 3.5, u * 1.5, b.frontLegRot - 0.3);

    // 3. ĐUÔI NGỰA
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

    // 4. THÂN CHIẾN MÃ
    ctx.save();
    const horseGrad = ctx.createLinearGradient(-u * 7, -u * 8, u * 6, u * 4);
    horseGrad.addColorStop(0, horseColorBase);
    horseGrad.addColorStop(0.6, horseColorBase);
    horseGrad.addColorStop(1, horseColorDark);
    ctx.fillStyle = horseGrad;

    ctx.beginPath();
    ctx.moveTo(-u * 7, -u * 1);
    ctx.bezierCurveTo(-u * 7.5, -u * 5, -u * 4.5, -u * 7, -u * 1, -u * 6.5);
    ctx.bezierCurveTo(u * 2, -u * 6, u * 4.5, -u * 4, u * 5.5, -u * 1);
    ctx.bezierCurveTo(u * 6, u * 3, u * 3.5, u * 4, u * 1, u * 3.5);
    ctx.bezierCurveTo(-u * 3, u * 3.5, -u * 6, u * 3, -u * 7, -u * 1);
    ctx.closePath();
    ctx.fill();

    // Giáp ức
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

    // Chữ Hán
    ctx.font = `bold ${u * 3.2}px "KaiTi", "SimSun", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = cPrimary;
    ctx.shadowColor = cTrim;
    ctx.shadowBlur = 4;
    ctx.fillText(isRed ? '傌' : '馬', -u * 3.5, -u * 1.5);
    ctx.shadowBlur = 0;
    ctx.restore();

    // 5. YÊN CƯƠNG
    ctx.save();
    ctx.fillStyle = cPrimaryDark;
    ctx.beginPath();
    ctx.roundRect(-u * 3.5, -u * 7, u * 6, u * 4.5, u);
    ctx.fill();
    ctx.strokeStyle = cTrim;
    ctx.lineWidth = u * 0.5;
    ctx.stroke();

    ctx.fillStyle = '#4e342e';
    ctx.beginPath();
    ctx.ellipse(-u * 0.5, -u * 6.5, u * 2.5, u * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 6. KỴ SĨ CHIẾN TƯỚNG
    ctx.save();
    ctx.translate(-u * 0.5, -u * 7);
    ctx.rotate(b.riderRot);

    // Áo choàng
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

    // Chân kỵ sĩ
    ctx.save();
    ctx.fillStyle = cArmorMetal;
    ctx.beginPath();
    ctx.roundRect(-u * 1.2, -u * 0.5, u * 2.8, u * 4, u * 0.8);
    ctx.fill();
    ctx.strokeStyle = cTrim;
    ctx.lineWidth = u * 0.4;
    ctx.stroke();

    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.roundRect(-u * 0.6, u * 3, u * 2.2, u * 3.8, u * 0.6);
    ctx.fill();
    ctx.fillStyle = cTrim;
    ctx.fillRect(-u * 1, u * 6.2, u * 3, u * 0.8);
    ctx.restore();

    // Thân mình kỵ sĩ
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

    ctx.fillStyle = cTrim;
    ctx.fillRect(-u * 2.2, -u * 1.5, u * 4.4, u * 1.2);
    ctx.fillStyle = isRed ? '#ff1744' : '#00e5ff';
    ctx.beginPath();
    ctx.arc(0, -u * 0.9, u * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Đầu kỵ sĩ
    ctx.save();
    ctx.translate(0, -u * 7.5);
    ctx.fillStyle = '#ffe0b2';
    ctx.beginPath();
    ctx.arc(0, -u * 2, u * 2.6, 0, Math.PI * 2);
    ctx.fill();

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

    ctx.fillStyle = cArmorMetal;
    ctx.beginPath();
    ctx.arc(0, -u * 2.5, u * 2.8, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = cTrim;
    ctx.lineWidth = u * 0.6;
    ctx.stroke();

    ctx.fillStyle = cPrimary;
    ctx.fillRect(-u * 2.8, -u * 2.5, u * 0.9, u * 2.5);
    ctx.fillRect(u * 1.9, -u * 2.5, u * 0.9, u * 2.5);

    const plumeWiggle = Math.sin(time * 0.01) * u * 1.2;
    ctx.fillStyle = isRed ? '#ff1744' : '#00e5ff';
    ctx.beginPath();
    ctx.moveTo(0, -u * 5.3);
    ctx.quadraticCurveTo(-u * 3 + plumeWiggle, -u * 8, -u * 4 + plumeWiggle, -u * 10);
    ctx.quadraticCurveTo(-u * 1, -u * 7.5, 0, -u * 5.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Tay trái
    ctx.save();
    ctx.translate(u * 1.2, -u * 4.5);
    ctx.fillStyle = cPrimary;
    ctx.beginPath();
    ctx.roundRect(0, 0, u * 2.2, u * 3.5, u * 0.8);
    ctx.fill();
    ctx.fillStyle = '#ffcc80';
    ctx.beginPath();
    ctx.arc(u * 1.8, u * 3.5, u * 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Tay phải & Trường Thương Đâm Liên Hoàn 3 Phát
    ctx.save();
    ctx.translate(-u * 1.8 + b.thrustDist * u * 0.8, -u * 5); // Tụ đâm nhún tới theo thrustDist
    ctx.rotate(b.spearRot);

    ctx.fillStyle = cTrim;
    ctx.beginPath();
    ctx.arc(0, 0, u * 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = cPrimary;
    ctx.beginPath();
    ctx.roundRect(-u * 1, 0, u * 2.2, u * 4.5, u * 0.8);
    ctx.fill();
    ctx.fillStyle = '#ffcc80';
    ctx.beginPath();
    ctx.arc(0, u * 4.5, u * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Tinh Vân Ánh Sao Tỏa Ra Từ Mũi Thương (Starlight Burst) khi Tấn Công
    if (state === 'attack' && b.thrustDist > 5) {
      const starColor = isRed ? '#ffd54f' : '#00e5ff';
      const tipX = u * 5 + b.thrustDist * u;
      const tipY = -u * 35;

      // Vẽ vệt thương lao vun vút (Thrust Streak)
      ctx.save();
      const beamGrad = ctx.createLinearGradient(0, -u * 35, tipX + u * 15, -u * 35);
      beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      beamGrad.addColorStop(0.6, starColor);
      beamGrad.addColorStop(1, '#ffffff');

      ctx.strokeStyle = beamGrad;
      ctx.lineWidth = u * 3.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -u * 35);
      ctx.lineTo(tipX + u * 15, -u * 35);
      ctx.stroke();
      ctx.restore();

      // Vẽ các Ngôi Sao Ánh Sao Tỏa Ra Từ Mũi Thương
      this.drawStar(ctx, tipX + u * 12, tipY, u * 4.5, '#ffffff');
      this.drawStar(ctx, tipX + u * 18, tipY - u * 3, u * 3.5, starColor);
      this.drawStar(ctx, tipX + u * 15, tipY + u * 4, u * 3.0, isRed ? '#ff1744' : '#80d8ff');
    }

    // Cán thương
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(-u * 0.7, -u * 24, u * 1.4, u * 36);

    ctx.fillStyle = cTrim;
    ctx.beginPath();
    ctx.ellipse(0, -u * 5, u * 2.2, u * 1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tua rua lụa
    ctx.fillStyle = isRed ? '#ff1744' : '#00e5ff';
    ctx.beginPath();
    ctx.moveTo(-u * 1.5, -u * 23.5);
    ctx.lineTo(u * 2.5, -u * 21);
    ctx.lineTo(-u * 0.5, -u * 25.5);
    ctx.closePath();
    ctx.fill();

    // Mũi trường thương
    const spearHeadGrad = ctx.createLinearGradient(0, -u * 24, 0, -u * 34);
    spearHeadGrad.addColorStop(0, '#90a4ae');
    spearHeadGrad.addColorStop(0.5, '#ffffff');
    spearHeadGrad.addColorStop(1, cTrimHighlight);

    ctx.fillStyle = spearHeadGrad;
    ctx.beginPath();
    ctx.moveTo(0, -u * 35);
    ctx.lineTo(u * 2.2, -u * 24);
    ctx.lineTo(0, -u * 25.5);
    ctx.lineTo(-u * 2.2, -u * 24);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = u * 0.4;
    ctx.stroke();

    ctx.restore();
    ctx.restore();

    // 7. CỔ VÀ ĐẦU CHIẾN MÃ
    ctx.save();
    ctx.translate(u * 4.5, -u * 4.5);
    ctx.rotate(b.horseHeadRot);

    ctx.fillStyle = horseColorBase;
    ctx.beginPath();
    ctx.moveTo(-u * 3.5, u * 2.5);
    ctx.quadraticCurveTo(-u * 1, -u * 4, u * 1.5, -u * 5.5);
    ctx.lineTo(u * 4.5, -u * 2.5);
    ctx.quadraticCurveTo(u * 3, u * 2, 0, u * 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = maneColor;
    for (let i = 0; i < 4; i++) {
      const maneWave = Math.sin(time * 0.01 + i * 0.8) * u * 0.8;
      ctx.beginPath();
      ctx.moveTo(-u * 2 + i * u * 1.2, -u * 2 - i * u * 1.1);
      ctx.quadraticCurveTo(-u * 4.5 + maneWave, -u * 1 - i * u * 1.1, -u * 3, u * 0.5 - i * u * 1.1);
      ctx.closePath();
      ctx.fill();
    }

    ctx.save();
    ctx.translate(u * 2.5, -u * 5);

    ctx.fillStyle = horseColorBase;
    ctx.beginPath();
    ctx.ellipse(0, 0, u * 2.2, u * 3.8, 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = horseColorDark;
    ctx.beginPath();
    ctx.ellipse(u * 2, u * 2.2, u * 1.2, u * 1.5, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(u * 2.4, u * 2.1, u * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.ellipse(-u * 0.2, -u * 0.8, u * 0.7, u * 1.1, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isRed ? '#ffd54f' : '#00e5ff';
    ctx.beginPath();
    ctx.arc(-u * 0.2, -u * 0.9, u * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = horseColorBase;
    ctx.beginPath();
    ctx.moveTo(-u * 1.2, -u * 3);
    ctx.lineTo(-u * 0.8, -u * 5.8);
    ctx.lineTo(u * 0.2, -u * 3.2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = cArmorMetal;
    ctx.beginPath();
    ctx.roundRect(-u * 1, -u * 2.5, u * 1.8, u * 3.5, u * 0.6);
    ctx.fill();
    ctx.strokeStyle = cTrim;
    ctx.lineWidth = u * 0.5;
    ctx.stroke();

    ctx.fillStyle = isRed ? '#ff1744' : '#00e5ff';
    ctx.beginPath();
    ctx.arc(-u * 0.1, -u * 0.8, u * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = u * 0.5;
    ctx.beginPath();
    ctx.moveTo(u * 1.5, u * 1.8);
    ctx.quadraticCurveTo(-u * 2, u * 4, -u * 4.5, u * 7);
    ctx.stroke();

    ctx.restore();
    ctx.restore();

    // 8. CHÂN NGỰA BÊN PHẢI
    const drawFrontLeg = (legX, legY, rot) => {
      ctx.save();
      ctx.translate(legX, legY);
      ctx.rotate(rot);
      ctx.fillStyle = horseColorBase;
      ctx.beginPath();
      ctx.roundRect(-u * 1.5, 0, u * 3, u * 8, u);
      ctx.fill();
      ctx.fillStyle = '#212121';
      ctx.fillRect(-u * 1.4, u * 6.5, u * 2.8, u * 2);
      ctx.fillStyle = cTrim;
      ctx.fillRect(-u * 1.4, u * 6.5, u * 2.8, u * 0.6);
      ctx.restore();
    };
    drawFrontLeg(-u * 4.5, u * 2, b.backLegRot);
    drawFrontLeg(u * 4.5, u * 2, b.frontLegRot);

    ctx.restore();
  }
}