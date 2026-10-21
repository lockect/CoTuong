/**
 * DANCER RENDERER - MỸ NHÂN VŨ NỮ (DANCER / 舞姬)
 * Thiết kế: Vũ nữ gợi cảm nóng bỏng, làn da trắng hồng, áo croptop cúp ngực,
 * váy lụa xẻ tà, hai tay vung dải lụa múa uyển chuyển.
 * Kích thước TO GẤP ĐÔI, xuất hiện ở CHÍNH GIỮA BÀN CỜ khi Tướng tấn công!
 */
class Dancer {

  /**
   * Vẽ ngôi sao 4 cánh tỏa sáng (Starlight Effect)
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
   * Kết xuất Vũ Nữ Nóng Bỏng Khổng Lồ ở chính giữa bàn cờ
   * @param {CanvasRenderingContext2D} ctx
   * @param {boolean} isRed - Phe Đỏ hay Phe Đen
   * @param {number} x - Tọa độ X tâm điểm (Giữa bàn cờ)
   * @param {number} y - Tọa độ Y tâm điểm (Giữa bàn cờ)
   * @param {number} r - Bán kính đơn vị kích thước
   * @param {number} time - Thời gian animation
   * @param {number} progress - Tiến trình tấn công (0.0 -> 1.0)
   */
  static draw(ctx, isRed, x, y, r, time, progress) {
    ctx.save();
    ctx.translate(x, y);

    // Fade in / out mượt mà khi xuất hiện
    let alpha = 1;
    if (progress < 0.15) alpha = progress / 0.15;
    else if (progress > 0.85) alpha = (1 - progress) / 0.15;
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    // KÍCH THƯỚC TO GẤP ĐÔI (3.2x) để thấy RÕ RÀNG 100% ở giữa bàn cờ
    const scaleMod = 3.2;
    const u = r * scaleMod * 0.05;

    const t = time * 0.005; /** 0.012;*/
    const danceY = Math.sin(t * 2) * u * 1.5;
    const hipSway = Math.sin(t * 2.5) * u * 2.2;
    const armAngle = Math.cos(t * 2) * 0.7;

    ctx.translate(hipSway, danceY);

    // 1. Tỏa Hào Quang Lấp Lánh & Tim Ánh Sao Rực Rỡ
    ctx.save();
    ctx.shadowColor = isRed ? '#ff4081' : '#00e5ff';
    ctx.shadowBlur = u * 12;
    ctx.fillStyle = isRed ? 'rgba(255, 64, 129, 0.35)' : 'rgba(0, 229, 255, 0.35)';
    ctx.beginPath();
    ctx.arc(0, -u * 8, u * 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Các ngôi sao lấp lánh xung quanh
    const starColor = isRed ? '#ffd54f' : '#00e5ff';
    this.drawStar(ctx, -u * 8 + Math.sin(t) * u * 2, -u * 18, u * 3.0, starColor);
    this.drawStar(ctx, u * 8 + Math.cos(t) * u * 2, -u * 15, u * 2.5, '#ffffff');

    // Bảng màu trang phục Vũ Nữ nóng bỏng
    const cDress = isRed ? '#ff1744' : '#00e5ff';
    const cSilk  = isRed ? '#ff80ab' : '#80d8ff';
    const cTrim  = isRed ? '#ffd54f' : '#ffffff';
    const cSkin  = '#ffdfd3'; // Làn da trắng hồng mượt mà

    // 2. DẢI LỤA MÚA MỀM MẠI (Silk Ribbon)
    ctx.save();
    ctx.strokeStyle = cSilk;
    ctx.lineWidth = u * 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const ribWiggle = Math.sin(t * 3) * u * 5;
    ctx.moveTo(-u * 5, -u * 14);
    ctx.quadraticCurveTo(-u * 9 + ribWiggle, -u * 19, -u * 2, -u * 23);
    ctx.quadraticCurveTo(u * 9 - ribWiggle, -u * 19, u * 6, -u * 12);
    ctx.stroke();
    ctx.restore();

    // 3. ĐÔI CHÂN THON & ĐÙI GỢI CẢM (Sexy Legs)
    ctx.fillStyle = cSkin;
    ctx.beginPath();
    ctx.roundRect(-u * 1.8, -u * 5, u * 1.6, u * 8, u * 0.8);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(u * 0.2, -u * 5, u * 1.6, u * 8, u * 0.8);
    ctx.fill();

    // Váy lụa xẻ tà kiêu sa (Silk Slit Skirt)
    ctx.fillStyle = cDress;
    ctx.beginPath();
    ctx.moveTo(-u * 2.5, -u * 7);
    ctx.quadraticCurveTo(-u * 4.2, -u * 1, -u * 3, u * 2);
    ctx.lineTo(u * 1, -u * 2);
    ctx.quadraticCurveTo(u * 3.5, -u * 5, u * 2.5, -u * 7);
    ctx.closePath();
    ctx.fill();

    // 4. VÒNG EO THON & ÁO CROPTOP CÚP NGỰC NÓNG BỎNG (Slim Waist & Bustier)
    ctx.fillStyle = cSkin;
    ctx.beginPath();
    ctx.roundRect(-u * 1.4, -u * 10, u * 2.8, u * 3.5, u * 0.6);
    ctx.fill();

    // Áo cúp ngực ôm sát đường cong quyến rũ
    ctx.fillStyle = cDress;
    ctx.beginPath();
    ctx.ellipse(-u * 0.9, -u * 11, u * 1.3, u * 1.5, 0.2, 0, Math.PI * 2);
    ctx.ellipse(u * 0.9, -u * 11, u * 1.3, u * 1.5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = cTrim;
    ctx.lineWidth = u * 0.4;
    ctx.stroke();

    // 5. CỔ & KHUÔN MẶT XINH ĐẸP (Neck & Face)
    ctx.fillStyle = cSkin;
    ctx.fillRect(-u * 0.6, -u * 13.5, u * 1.2, u * 2);

    ctx.beginPath();
    ctx.ellipse(0, -u * 15, u * 1.6, u * 2.0, 0, 0, Math.PI * 2);
    ctx.fill();

    // Môi son đỏ & Đôi mắt quyến rũ
    ctx.fillStyle = '#ff1744';
    ctx.beginPath();
    ctx.arc(0, -u * 14.3, u * 0.4, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.ellipse(-u * 0.7, -u * 15.3, u * 0.3, u * 0.5, 0, 0, Math.PI * 2);
    ctx.ellipse(u * 0.7, -u * 15.3, u * 0.3, u * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6. MÁI TÓC ĐEN DÀI BỒNG BỀNH (Long Flowing Hair)
    ctx.fillStyle = '#1a1a1a';
    const hairSway = Math.sin(t * 2) * u * 1.5;
    ctx.beginPath();
    ctx.arc(0, -u * 15.5, u * 2.2, Math.PI, 0);
    ctx.quadraticCurveTo(-u * 3.8 + hairSway, -u * 12, -u * 3.2, -u * 6);
    ctx.lineTo(-u * 1.8, -u * 14);
    ctx.quadraticCurveTo(u * 3.8 - hairSway, -u * 12, u * 3.2, -u * 6);
    ctx.closePath();
    ctx.fill();

    // Trâm cài tóc
    ctx.fillStyle = cTrim;
    ctx.fillRect(-u * 2, -u * 17, u * 4, u * 0.6);
    ctx.fillStyle = isRed ? '#ff1744' : '#00e5ff';
    ctx.beginPath();
    ctx.arc(u * 2, -u * 17, u * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // 7. TAY MÚA UỐN LƯỢN UYỂN CHUYỂN (Dancing Arms)
    ctx.save();
    ctx.translate(-u * 1.5, -u * 11.5);
    ctx.rotate(-armAngle - 0.5);
    ctx.fillStyle = cSkin;
    ctx.beginPath();
    ctx.roundRect(-u * 0.6, -u * 5, u * 1.2, u * 5.5, u * 0.6);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(u * 1.5, -u * 11.5);
    ctx.rotate(armAngle + 0.6);
    ctx.fillStyle = cSkin;
    ctx.beginPath();
    ctx.roundRect(-u * 0.6, 0, u * 1.2, u * 5.5, u * 0.6);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }
}