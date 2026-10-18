/**
 * BATTLEFIELD RENDERER - CHIẾN TRƯỜNG NGŨ HÀNH
 * Thiết kế giao diện bàn cờ biến hóa theo 5 nguyên tố: Kim - Mộc - Thủy - Hỏa - Thổ
 */
class BattlefieldRenderer {
  // Cấu hình bảng màu và phong cách mỹ thuật cho từng hệ Ngũ Hành
  static themes = {
    // 1. KIM (Bạch Kim Kiếm Các): Kim loại sáng bóng, viền thép mạ vàng, phong thái sắc bén
    metal: {
      name: 'Bạch Kim',
      bgGrad: ['#cfd8dc', '#b0bec5', '#90a4ae'],
      outerBorder: '#37474f',
      innerBorder: '#ffd700',
      lines: '#263238',
      palaceLines: '#c62828',
      riverText: '#263238',
      riverGlow: '#fff9c4',
      riverBg: 'rgba(255, 255, 255, 0.25)',
      cornerDeco: '#ffd700',
      boardShadow: 'rgba(55, 71, 79, 0.4)'
    },

    // 2. MỘC (U Minh Cổ Mộc): Xanh ngọc lục bảo, rừng già cổ kính, linh khí êm dịu
    wood: {
      name: 'Cổ Mộc',
      bgGrad: ['#4e6e58', '#3b5846', '#2b4435'],
      outerBorder: '#1b2e23',
      innerBorder: '#81c784',
      lines: '#a5d6a7',
      palaceLines: '#ffe082',
      riverText: '#c8e6c9',
      riverGlow: '#4caf50',
      riverBg: 'rgba(43, 84, 57, 0.35)',
      cornerDeco: '#a5d6a7',
      boardShadow: 'rgba(27, 46, 35, 0.45)'
    },

    // 3. THỦY (Bắc Hải Hàn Băng): Ngọc lam băng tuyết, sóng nước sâu thẳm, tĩnh mịch
    water: {
      name: 'Hàn Băng',
      bgGrad: ['#295a73', '#1b4054', '#102d3c'],
      outerBorder: '#0b1d28',
      innerBorder: '#4dd0e1',
      lines: '#80deea',
      palaceLines: '#ff8a80',
      riverText: '#e0f7fa',
      riverGlow: '#00e5ff',
      riverBg: 'rgba(0, 188, 212, 0.2)',
      cornerDeco: '#00e5ff',
      boardShadow: 'rgba(11, 29, 40, 0.5)'
    },

    // 4. HỎA (Xích Diễm Hỏa Sơn): Nham thạch núi lửa nung đỏ, rực lửa cuồng nhiệt
    fire: {
      name: 'Xích Diễm',
      bgGrad: ['#542323', '#3d1616', '#270c0c'],
      outerBorder: '#1a0505',
      innerBorder: '#ff5722',
      lines: '#ff8a65',
      palaceLines: '#ffd54f',
      riverText: '#ffccbc',
      riverGlow: '#ff3d00',
      riverBg: 'rgba(255, 87, 34, 0.22)',
      cornerDeco: '#ffab40',
      boardShadow: 'rgba(39, 12, 12, 0.6)'
    },

    // 5. THỔ (Hoàng Thổ Sa Thạch): Sa thạch hoàng thành uy nghiêm, phong cách cổ điển nâng cấp
    earth: {
      name: 'Hoàng Thổ',
      bgGrad: ['#cca573', '#ba905e', '#a67d4a'],
      outerBorder: '#5c3e21',
      innerBorder: '#ffd54f',
      lines: '#5a3d1f',
      palaceLines: '#8d2b1b',
      riverText: '#5c3e21',
      riverGlow: '#ffe082',
      riverBg: 'rgba(139, 90, 43, 0.15)',
      cornerDeco: '#8d6e63',
      boardShadow: 'rgba(60, 35, 15, 0.45)'
    }
  };

  /**
   * Dựng hình toàn bộ bàn cờ chiến trường
   */
  static draw(ctx, w, h, startX, startY, gridSize, themeKey = 'earth', time = 0) {
    const t = this.themes[themeKey] || this.themes.earth;

    // 1. Nền bàn cờ với dải Gradient đặc trưng từng nguyên tố
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, t.bgGrad[0]);
    bgGrad.addColorStop(0.5, t.bgGrad[1]);
    bgGrad.addColorStop(1, t.bgGrad[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Viền ngoài dày & viền mạ trong
    ctx.strokeStyle = t.outerBorder;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, w - 10, h - 10);

    ctx.strokeStyle = t.innerBorder;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(11, 11, w - 22, h - 22);

    // 3. Hoa văn 4 góc bàn cờ (Tăng chất chiến trận cổ phong)
    this.drawCornerAccents(ctx, 16, 16, w - 32, h - 32, t.cornerDeco);

    // 4. Kẻ các đường ngang (10 hàng)
    ctx.strokeStyle = t.lines;
    ctx.lineWidth = 1.8;
    for (let r = 0; r < 10; r++) {
      const y = startY + r * gridSize;
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + 8 * gridSize, y);
      ctx.stroke();
    }

    // 5. Kẻ các đường dọc (9 cột - đứt đoạn ở sông Sở Hà - Hán Giới)
    for (let c = 0; c < 9; c++) {
      const x = startX + c * gridSize;
      // Nửa trên (Phe Đen)
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY + 4 * gridSize);
      ctx.stroke();

      // Nửa dưới (Phe Đỏ)
      ctx.beginPath();
      ctx.moveTo(x, startY + 5 * gridSize);
      ctx.lineTo(x, startY + 9 * gridSize);
      ctx.stroke();

      // 2 mép biên chạy thẳng nối liền qua sông
      if (c === 0 || c === 8) {
        ctx.beginPath();
        ctx.moveTo(x, startY + 4 * gridSize);
        ctx.lineTo(x, startY + 5 * gridSize);
        ctx.stroke();
      }
    }

    // 6. Vẽ Cung Tướng (Cửu Cung - Đường chéo chữ X)
    const drawPalace = (topRow) => {
      const x1 = startX + 3 * gridSize;
      const x2 = startX + 5 * gridSize;
      const y1 = startY + topRow * gridSize;
      const y2 = startY + (topRow + 2) * gridSize;
      ctx.save();
      ctx.strokeStyle = t.palaceLines;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.moveTo(x2, y1); ctx.lineTo(x1, y2);
      ctx.stroke();
      ctx.restore();
    };
    drawPalace(0); // Cung Đen
    drawPalace(7); // Cung Đỏ

    // 7. Khu vực Sông (Sở Hà - Hán Giới)
    const riverY1 = startY + 4 * gridSize;
    const riverHeight = gridSize;
    ctx.save();
    // Tô nền mờ dải sông
    ctx.fillStyle = t.riverBg;
    ctx.fillRect(startX, riverY1, 8 * gridSize, riverHeight);

    // Chữ thư pháp Sở Hà - Hán Giới có vầng hào quang nhẹ
    const centerY = riverY1 + riverHeight * 0.5;
    ctx.font = `bold ${gridSize * 0.44}px "KaiTi", "SimSun", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = t.riverGlow;
    ctx.shadowBlur = 6;
    ctx.fillStyle = t.riverText;
    ctx.fillText('楚  河', startX + 2 * gridSize, centerY);
    ctx.fillText('漢  界', startX + 6 * gridSize, centerY);
    ctx.restore();
  }

  /**
   * Vẽ góc trang trí bát quái / đinh tán kim loại
   */
  static drawCornerAccents(ctx, x, y, w, h, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    const s = 14; // Chiều dài góc
    const corners = [
      [x, y, s, 0, 0, s],             // Góc trên trái
      [x + w, y, -s, 0, 0, s],        // Góc trên phải
      [x, y + h, s, 0, 0, -s],        // Góc dưới trái
      [x + w, y + h, -s, 0, 0, -s]    // Góc dưới phải
    ];
    corners.forEach(([cx, cy, dx, dy, ex, ey]) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy + ey);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + dx, cy);
      ctx.stroke();
    });
    ctx.restore();
  }
}