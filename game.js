/**
 * CHIẾN TƯỚNG – ANCIENT CHINESE CHESS BATTLE
 * CORE ENGINE - Quản lý Luật cờ, AI, Âm thanh và Vòng lặp Game
 */

// ==========================================
// 1. ÂM THANH TỔNG HỢP (WEB AUDIO API)
// ==========================================
class SoundFX {
  constructor() { this.ctx = null; this.enabled = true; }
  init() {
    if (!this.ctx) { const A = window.AudioContext || window.webkitAudioContext; if (A) this.ctx = new A(); }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }
  playMove() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime); gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.09);
  }
  playSelect() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(540, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime); gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.06);
  }
  playSlash() {
    if (!this.enabled || !this.ctx) return;
    const n = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(800, n); osc.frequency.exponentialRampToValueAtTime(140, n + 0.18);
    gain.gain.setValueAtTime(0.4, n); gain.gain.linearRampToValueAtTime(0.01, n + 0.2);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(n + 0.2);
  }
  playExplosion() {
    if (!this.enabled || !this.ctx) return;
    const n = this.ctx.currentTime, bS = this.ctx.sampleRate * 0.35, b = this.ctx.createBuffer(1, bS, this.ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < bS; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bS * 0.25));
    const noise = this.ctx.createBufferSource(), filter = this.ctx.createBiquadFilter(), gain = this.ctx.createGain();
    noise.buffer = b; filter.type = 'lowpass'; filter.frequency.setValueAtTime(450, n); filter.frequency.linearRampToValueAtTime(60, n + 0.35);
    gain.gain.setValueAtTime(0.6, n); gain.gain.linearRampToValueAtTime(0.01, n + 0.35);
    noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
    noise.start();
  }
  playCheckAlert() {
    if (!this.enabled || !this.ctx) return;
    const n = this.ctx.currentTime;
    [440, 554, 659].forEach((fq, i) => {
      const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = 'triangle'; osc.frequency.setValueAtTime(fq, n + i * 0.08);
      gain.gain.setValueAtTime(0.3, n + i * 0.08); gain.gain.linearRampToValueAtTime(0.01, n + i * 0.08 + 0.25);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(n + i * 0.08); osc.stop(n + i * 0.08 + 0.26);
    });
  }
  playVictory() {
    if (!this.enabled || !this.ctx) return;
    const notes = [523, 659, 784, 1046], n = this.ctx.currentTime;
    notes.forEach((fq, i) => {
      const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(fq, n + i * 0.15);
      gain.gain.setValueAtTime(0.35, n + i * 0.15); gain.gain.linearRampToValueAtTime(0.01, n + i * 0.15 + 0.4);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(n + i * 0.15); osc.stop(n + i * 0.15 + 0.45);
    });
  }
}

// ==========================================
// 2. LUẬT CỜ TƯỚNG (XIANGQI RULES ENGINE)
// ==========================================
const RED = 'r', BLACK = 'b';
class ChessRules {
  static createInitialBoard() {
    const board = Array(10).fill(null).map(() => Array(9).fill(null));
    board[0] = ['bR','bH','bE','bA','bK','bA','bE','bH','bR']; board[2][1] = 'bC'; board[2][7] = 'bC';
    board[3][0] = 'bP'; board[3][2] = 'bP'; board[3][4] = 'bP'; board[3][6] = 'bP'; board[3][8] = 'bP';
    board[9] = ['rR','rH','rE','rA','rK','rA','rE','rH','rR']; board[7][1] = 'rC'; board[7][7] = 'rC';
    board[6][0] = 'rP'; board[6][2] = 'rP'; board[6][4] = 'rP'; board[6][6] = 'rP'; board[6][8] = 'rP';
    return board;
  }
  static cloneBoard(b) { return b.map(r => [...r]); }
  static getColor(p) { return p ? p[0] : null; }
  static getType(p) { return p ? p[1] : null; }
  static inBounds(r, c) { return r >= 0 && r < 10 && c >= 0 && c < 9; }
  static getPseudoMoves(b, r, c) {
    const p = b[r][c]; if (!p) return [];
    const color = this.getColor(p), type = this.getType(p), m = [];
    const add = (tr, tc) => { if (!this.inBounds(tr, tc)) return false; const tgt = b[tr][tc]; if (!tgt) { m.push({ from: { r, c }, to: { r: tr, c: tc }, capture: null }); return true; } if (this.getColor(tgt) !== color) m.push({ from: { r, c }, to: { r: tr, c: tc }, capture: tgt }); return false; };
    switch (type) {
      case 'K': [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc])=>{ const nr=r+dr,nc=c+dc; if(nr>=(color===RED?7:0)&&nr<=(color===RED?9:2)&&nc>=3&&nc<=5) add(nr,nc); }); break;
      case 'A': [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,dc])=>{ const nr=r+dr,nc=c+dc; if(nr>=(color===RED?7:0)&&nr<=(color===RED?9:2)&&nc>=3&&nc<=5) add(nr,nc); }); break;
      case 'E': [{dr:-2,dc:-2,er:-1,ec:-1},{dr:-2,dc:2,er:-1,ec:1},{dr:2,dc:-2,er:1,ec:-1},{dr:2,dc:2,er:1,ec:1}].forEach(d=>{ const nr=r+d.dr,nc=c+d.dc; if((color===RED&&nr<5)||(!color===RED&&nr>4))return; if(this.inBounds(nr,nc)&&!b[r+d.er][c+d.ec]) add(nr,nc); }); break;
      case 'H': [{dr:-2,dc:-1,br:-1,bc:0},{dr:-2,dc:1,br:-1,bc:0},{dr:2,dc:-1,br:1,bc:0},{dr:2,dc:1,br:1,bc:0},{dr:-1,dc:-2,br:0,bc:-1},{dr:1,dc:-2,br:0,bc:-1},{dr:-1,dc:2,br:0,bc:1},{dr:1,dc:2,br:0,bc:1}].forEach(j=>{ if(this.inBounds(r+j.dr,c+j.dc)&&!b[r+j.br][c+j.bc]) add(r+j.dr,c+j.dc); }); break;
      case 'R': [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc])=>{ let s=1; while(true){ if(!add(r+dr*s,c+dc*s))break; s++; } }); break;
      case 'C': [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc])=>{ let s=1,scr=false; while(true){ const nr=r+dr*s,nc=c+dc*s; if(!this.inBounds(nr,nc))break; const tgt=b[nr][nc]; if(!scr){ if(!tgt)m.push({from:{r,c},to:{r:nr,c:nc},capture:null});else scr=true; }else if(tgt){ if(this.getColor(tgt)!==color)m.push({from:{r,c},to:{r:nr,c:nc},capture:tgt}); break; } s++; } }); break;
      case 'P': const fw=color===RED?-1:1; if(this.inBounds(r+fw,c))add(r+fw,c); if(color===RED?r<=4:r>=5){ if(this.inBounds(r,c-1))add(r,c-1); if(this.inBounds(r,c+1))add(r,c+1); } break;
    } return m;
  }
  static findKing(b, col) { for(let r=0;r<10;r++)for(let c=3;c<=5;c++)if(b[r][c]===col+'K')return{r,c}; return null; }
  static isKingInCheck(b, col) {
    const k=this.findKing(b,col); if(!k)return true;
    const rK=this.findKing(b,RED),bK=this.findKing(b,BLACK); let fly=false;
    if(rK&&bK&&rK.c===bK.c){ fly=true; for(let r=bK.r+1;r<rK.r;r++)if(b[r][rK.c])fly=false; } if(fly)return true;
    const opp=col===RED?BLACK:RED; for(let r=0;r<10;r++)for(let c=0;c<9;c++)if(b[r][c]&&this.getColor(b[r][c])===opp)if(this.getPseudoMoves(b,r,c).some(m=>m.to.r===k.r&&m.to.c===k.c))return true; return false;
  }
  static getValidMoves(b, col) {
    const v=[]; for(let r=0;r<10;r++)for(let c=0;c<9;c++)if(b[r][c]&&this.getColor(b[r][c])===col)this.getPseudoMoves(b,r,c).forEach(m=>{ const nb=this.cloneBoard(b); nb[m.to.r][m.to.c]=nb[m.from.r][m.from.c]; nb[m.from.r][m.from.c]=null; if(!this.isKingInCheck(nb,col))v.push(m); }); return v;
  }
  static isCheckmate(b, col) { return this.isKingInCheck(b,col)&&this.getValidMoves(b,col).length===0; }
  static isStalemate(b, col) { return !this.isKingInCheck(b,col)&&this.getValidMoves(b,col).length===0; }
}

// ==========================================
// 3. AI ENGINE – BỘ NÃO CHIẾN THUẬT QUÂN SỰ
// ==========================================
class ChessAI {
  // 1. Điểm số cơ bản của từng quân cờ
  static BASE_VAL = { 'K': 15000, 'R': 1000, 'C': 480, 'H': 420, 'E': 220, 'A': 220, 'P': 100 };

  // 2. Bảng điểm vị trí chiến thuật (Piece-Square Tables 10x9)
  // Góc nhìn tính cho phe tấn công từ hàng 0 -> 9
  static PST = {
    // TỐT / BINH: Càng qua sông và áp sát cung đối phương uy lực càng khủng khiếp
    P: [
      [  0,   3,   6,   9,  12,   9,   6,   3,   0],
      [ 20,  40,  70, 110, 130, 110,  70,  40,  20], // Hàng áp đỉnh (cực kỳ nguy hiểm)
      [ 15,  35,  60,  95, 115,  95,  60,  35,  15], // Cận kề cung tướng
      [ 12,  25,  40,  60,  75,  60,  40,  25,  12], // Qua sông sâu
      [ 10,  18,  28,  40,  50,  40,  28,  18,  10], // Vừa qua sông
      [  0,   0,   0,   0,   0,   0,   0,   0,   0], // Sông nhà
      [ -2,   0,   5,   0,  10,   0,   5,   0,  -2],
      [  0,   0,   0,   0,   0,   0,   0,   0,   0],
      [  0,   0,   0,   0,   0,   0,   0,   0,   0],
      [  0,   0,   0,   0,   0,   0,   0,   0,   0]
    ],
    // MÃ: Tránh mép biên ("Mã biên nan thấu"), ưu tiên nhảy trung tâm và thọc ngọa tào
    H: [
      [  4,   8,  16,  12,   4,  12,  16,   8,   4],
      [  8,  18,  32,  26,  18,  26,  32,  18,   8], // Vị trí ngọa tào sát cục
      [ 12,  26,  40,  35,  22,  35,  40,  26,  12],
      [  8,  22,  30,  32,  26,  32,  30,  22,   8], // Hàng tuần hà
      [  4,  16,  22,  26,  22,  26,  22,  16,   4],
      [  2,  10,  16,  18,  14,  18,  16,  10,   2],
      [  0,   4,  10,  12,  10,  12,  10,   4,   0],
      [ -4,   2,   4,   6,   4,   6,   4,   2,  -4],
      [ -6,  -2,   0,   2,   0,   2,   0,  -2,  -6],
      [-10,  -6,  -4,   0,  -4,   0,  -4,  -6, -10]
    ],
    // XE: Chiếm các lộ thông (sườn 1, 3, 5, 7), trung lộ, tuần hà và áp đỉnh
    R: [
      [ 14,  18,  20,  26,  28,  26,  20,  18,  14], // Đáy cung
      [ 18,  26,  24,  32,  35,  32,  24,  26,  18], // Áp đỉnh đối phương
      [ 12,  20,  18,  24,  26,  24,  18,  20,  12],
      [ 16,  22,  20,  26,  28,  26,  20,  22,  16], // Xe tuần hà
      [ 14,  18,  16,  22,  24,  22,  16,  18,  14],
      [ 10,  14,  12,  18,  20,  18,  12,  14,  10],
      [  6,  10,   8,  14,  16,  14,   8,  10,   6],
      [  2,   6,   4,  10,  12,  10,   4,   6,   2],
      [  0,   4,   2,   8,  10,   8,   2,   4,   0],
      [ -6,   8,   6,  14,  10,  14,   6,   8,  -6]  // Xuất xe sớm
    ],
    // PHÁO: Uy lực vượt trội ở trung lộ (Pháo đầu) và lộ sườn
    C: [
      [  6,   8,   4,   0,  -2,   0,   4,   8,   6],
      [  4,   8,   6,   2,   0,   2,   6,   8,   4],
      [  2,   6,  10,  12,  15,  12,  10,   6,   2],
      [  0,   4,   6,  16,  22,  16,   6,   4,   0],
      [  0,   4,   6,  18,  28,  18,   6,   4,   0], // Trung pháo tuần hà
      [ -2,   0,   2,  14,  20,  14,   2,   0,  -2],
      [ -2,   0,   2,  10,  16,  10,   2,   0,  -2],
      [  0,   2,   4,   8,  12,   8,   4,   2,   0],
      [  0,   0,   0,   2,   4,   2,   0,   0,   0],
      [ -2,   0,   0,   0,   0,   0,   0,   0,  -2]
    ],
    // TƯỢNG, SĨ, TƯỚNG: Giữ thế trận cung cấm kiên cố
    E: [
      [0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0],
      [0, 0, 4, 0, 0, 0, 4, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [2, 0, 0, 0, 10, 0, 0, 0, 2], // Tượng giữa liên hoàn
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 0, 0, 0, 2, 0, 0]
    ],
    A: [
      [0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0],
      [0, 0, 0, 6, 0, 6, 0, 0, 0],
      [0, 0, 0, 0, 10, 0, 0, 0, 0],
      [0, 0, 0, 2, 0, 2, 0, 0, 0]
    ],
    K: [
      [0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0],
      [0, 0, 0, -6, -8, -6, 0, 0, 0],
      [0, 0, 0, -4, -6, -4, 0, 0, 0],
      [0, 0, 0,  2,  8,  2, 0, 0, 0]
    ]
  };

  static getPosBonus(type, r, c, isRed) {
    const table = this.PST[type];
    if (!table) return 0;
    const row = isRed ? (9 - r) : r;
    return table[row] ? (table[row][c] || 0) : 0;
  }

  static getPieceValue(type, r, c, isRed) {
    const base = this.BASE_VAL[type] || 0;
    return base + this.getPosBonus(type, r, c, isRed);
  }

  // Đánh giá tổng điểm thế trận
  static evaluateBoard(board) {
    let score = 0;
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const piece = board[r][c];
        if (piece) {
          const isRed = ChessRules.getColor(piece) === RED;
          const type = ChessRules.getType(piece);
          const val = this.getPieceValue(type, r, c, isRed);
          score += isRed ? val : -val;
        }
      }
    }
    return score;
  }

  // Sắp xếp thứ tự nước đi (Move Ordering) bằng MVV-LVA để cắt tỉa Alpha-Beta tối đa
  static scoreMove(m, board) {
    let score = 0;
    if (m.capture) {
      const victimVal = this.BASE_VAL[ChessRules.getType(m.capture)] || 0;
      const attackerVal = this.BASE_VAL[ChessRules.getType(board[m.from.r][m.from.c])] || 0;
      // Ăn quân to bằng quân nhỏ được ưu tiên cao nhất
      score += 10000 + victimVal * 10 - attackerVal;
    } else {
      const type = ChessRules.getType(board[m.from.r][m.from.c]);
      const isRed = ChessRules.getColor(board[m.from.r][m.from.c]) === RED;
      score += (this.getPosBonus(type, m.to.r, m.to.c, isRed) - this.getPosBonus(type, m.from.r, m.from.c, isRed));
    }
    return score;
  }

  // Tìm kiếm tĩnh (Quiescence Search): giải quyết triệt để các pha ăn đổi quân ở nút lá
  static quiescence(b, a, bt, isM, qDepth = 2) {
    const standPat = this.evaluateBoard(b);
    if (qDepth === 0) return standPat;

    if (isM) {
      if (standPat >= bt) return bt;
      if (standPat > a) a = standPat;
    } else {
      if (standPat <= a) return a;
      if (standPat < bt) bt = standPat;
    }

    const color = isM ? RED : BLACK;
    const caps = ChessRules.getValidMoves(b, color).filter(m => m.capture !== null);
    if (!caps.length) return standPat;

    caps.sort((x, y) => this.scoreMove(y, b) - this.scoreMove(x, b));

    for (const m of caps) {
      const nb = ChessRules.cloneBoard(b);
      nb[m.to.r][m.to.c] = nb[m.from.r][m.from.c];
      nb[m.from.r][m.from.c] = null;

      const score = this.quiescence(nb, a, bt, !isM, qDepth - 1);
      if (isM) {
        if (score >= bt) return bt;
        if (score > a) a = score;
      } else {
        if (score <= a) return a;
        if (score < bt) bt = score;
      }
    }
    return isM ? a : bt;
  }

  // Thuật toán Minimax + Alpha-Beta Pruning kết hợp Quiescence Search
  static minimax(b, d, a, bt, isM) {
    if (d === 0) {
      return this.quiescence(b, a, bt, isM, 2);
    }

    const color = isM ? RED : BLACK;
    const ms = ChessRules.getValidMoves(b, color);

    if (!ms.length) {
      return ChessRules.isKingInCheck(b, color) ? (isM ? -99999 : 99999) : 0;
    }

    ms.sort((x, y) => this.scoreMove(y, b) - this.scoreMove(x, b));

    let ev = isM ? -Infinity : Infinity;
    for (const m of ms) {
      const nb = ChessRules.cloneBoard(b);
      nb[m.to.r][m.to.c] = nb[m.from.r][m.from.c];
      nb[m.from.r][m.from.c] = null;

      const e = this.minimax(nb, d - 1, a, bt, !isM);
      if (isM) {
        ev = Math.max(ev, e);
        a = Math.max(a, e);
      } else {
        ev = Math.min(ev, e);
        bt = Math.min(bt, e);
      }
      if (bt <= a) break;
    }
    return ev;
  }

  // Chọn nước đi tốt nhất theo từng độ khó
  static findBestMove(board, color, difficulty = 'medium') {
    const vM = ChessRules.getValidMoves(board, color);
    if (!vM.length) return null;

    const isM = color === RED;

    // 1. MỨC DỄ: Tính 1 nước, thỉnh thoảng chọn nước thứ 2 hoặc 3 (thích hợp cho người mới)
    if (difficulty === 'easy') {
      const scored = vM.map(m => {
        const nb = ChessRules.cloneBoard(board);
        nb[m.to.r][m.to.c] = nb[m.from.r][m.from.c];
        nb[m.from.r][m.from.c] = null;
        return { move: m, score: this.evaluateBoard(nb) };
      });
      scored.sort((x, y) => isM ? y.score - x.score : x.score - y.score);
      const pool = scored.slice(0, Math.min(3, scored.length));
      return pool[Math.floor(Math.random() * pool.length)].move;
    }

    // Sắp xếp nước đi gốc theo độ ưu tiên
    vM.sort((x, y) => this.scoreMove(y, board) - this.scoreMove(x, board));

    // 2. MỨC VỪA: Độ sâu 2 + Quiescence Search (tính 2-4 nước cờ liên hoàn)
    // 3. MỨC KHÓ: Độ sâu 3 + Quiescence Search (tính 3-5 nước cờ liên hoàn, giăng bẫy bắt quân)
    const searchDepth = (difficulty === 'hard') ? 3 : 2;

    let bM = vM[0];
    let bV = isM ? -Infinity : Infinity;

    for (const m of vM) {
      const nb = ChessRules.cloneBoard(board);
      nb[m.to.r][m.to.c] = nb[m.from.r][m.from.c];
      nb[m.from.r][m.from.c] = null;

      const ev = this.minimax(nb, searchDepth - 1, -Infinity, Infinity, !isM);
      if (isM ? ev > bV : ev < bV) {
        bV = ev;
        bM = m;
      }
    }
    return bM;
  }
}

// ==========================================
// 4. PARTICLE SYSTEM (HIỆU ỨNG HẠT)
// ==========================================
class ParticleSystem {
  constructor() { this.pt = []; }
  emit(x, y, color, count=12, speed=4, size=5) { for(let i=0;i<count;i++){ const a=Math.random()*Math.PI*2, spd=(Math.random()*0.7+0.3)*speed; this.pt.push({x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,life:1,decay:Math.random()*0.03+0.02,color,size:Math.random()*size+2}); } }
  emitShockwave(x, y, color='#fff') { this.pt.push({x,y,vx:0,vy:0,life:1,decay:0.04,isWave:true,r:6,mr:45,color}); }
  update() { for(let i=this.pt.length-1;i>=0;i--){ const p=this.pt[i]; p.life-=p.decay; if(p.life<=0){this.pt.splice(i,1);continue;} if(p.isWave)p.r+=(p.mr-p.r)*0.15;else{p.x+=p.vx;p.y+=p.vy;p.vy+=0.08;} } }
  draw(ctx) {
    ctx.save();
    for (const p of this.pt) {
      ctx.globalAlpha = Math.max(0, p.life);
      if (p.isWave) { ctx.strokeStyle = p.color; ctx.lineWidth = 3 * p.life; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.stroke(); } 
      else { ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill(); }
    } ctx.restore();
  }
}
// ==========================================
// 5. BỘ ĐỊNH TUYẾN KẾT XUẤT ĐỒ HỌA (ROUTER & FALLBACK)
// ==========================================

/**
 * Lớp vẽ dự phòng (Fallback) cho các quân cờ chưa có file riêng.
 * Tránh lỗi game crash trong lúc bạn đang tiếp tục code các quân còn lại.
 */
class SkeletalFallback {
  static drawCharacter(ctx, type, isRed, x, y, r, time, state, progress, isChecked) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(0, r*0.4, r*0.7, r*0.2, 0, 0, Math.PI*2); ctx.fill();
    ctx.translate(0, Math.sin(time*0.005)*r*0.05); // Nhịp thở
    ctx.fillStyle = isRed ? '#d32f2f' : '#1976d2'; 
    ctx.beginPath(); ctx.roundRect(-r*0.4, -r*0.6, r*0.8, r*0.9, r*0.1); ctx.fill();
    ctx.font = `bold ${r*0.5}px sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#fff';
    const charMap = {'rA':'仕','bA':'士','rE':'相','bE':'象','rH':'傌','bH':'馬','rR':'俥','bR':'車','rC':'炮','bC':'砲'};
    ctx.fillText(charMap[isRed?'r'+type:'b'+type] || type, 0, -r*0.1);
    ctx.restore();
  }
}

/**
 * BỘ ĐỊNH TUYẾN CHÍNH (ROUTER)
 * Tìm và gọi đúng class vẽ của từng quân cờ nếu file đó đã tồn tại.
 */
class CharacterRenderer {
  static drawPiece(ctx, piece, x, y, rad, time, state, progress, isChecked) {
    if (!piece) return;
    const type = ChessRules.getType(piece);
    const isRed = ChessRules.getColor(piece) === RED;
    
    // Kiểm tra xem class vẽ tương ứng đã được nạp từ file lẻ chưa
    if (type === 'P' && typeof PawnRenderer !== 'undefined') {
      PawnRenderer.drawCharacter(ctx, isRed, x, y, rad, time, state, progress, isChecked);
    } 
    else if (type === 'K' && typeof GeneralRenderer !== 'undefined') {
      GeneralRenderer.drawCharacter(ctx, isRed, x, y, rad, time, state, progress, isChecked);
    }
    else if (type === 'A' && typeof AdvisorRenderer !== 'undefined' && AdvisorRenderer.drawCharacter) {
      AdvisorRenderer.drawCharacter(ctx, isRed, x, y, rad, time, state, progress, isChecked);
    }
    else if (type === 'E' && typeof ElephantRenderer !== 'undefined' && ElephantRenderer.drawCharacter) {
      ElephantRenderer.drawCharacter(ctx, isRed, x, y, rad, time, state, progress, isChecked);
    }
    else if (type === 'R' && typeof ChariotRenderer !== 'undefined' && ChariotRenderer.drawCharacter) {
      ChariotRenderer.drawCharacter(ctx, isRed, x, y, rad, time, state, progress, isChecked);
    }
    else if (type === 'H' && typeof HorseRenderer !== 'undefined' && HorseRenderer.drawCharacter) {
      HorseRenderer.drawCharacter(ctx, isRed, x, y, rad, time, state, progress, isChecked);
    }
    else if (type === 'C' && typeof CannonRenderer !== 'undefined' && CannonRenderer.drawCharacter) {
      CannonRenderer.drawCharacter(ctx, isRed, x, y, rad, time, state, progress, isChecked);
    }
    else {
      // Dùng dự phòng nếu chưa có class vẽ tương ứng
      SkeletalFallback.drawCharacter(ctx, type, isRed, x, y, rad, time, state, progress, isChecked);
    }
  }
}

// ==========================================
// 6. RENDERER BÀN CỜ GỖ CỔ (BOARD)
// ==========================================
class ChessRenderer {
  constructor(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.gridSize = 0; this.startX = 0; this.startY = 0; }
  resize() {
    const parent = this.canvas.parentElement, rect = parent.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    const aspect = 9 / 10.8; let w = rect.width, h = rect.height;
    if (w / h > aspect) w = h * aspect; else h = w / aspect;
    this.canvas.width = Math.floor(w * dpr); this.canvas.height = Math.floor(h * dpr);
    this.canvas.style.width = `${Math.floor(w)}px`; this.canvas.style.height = `${Math.floor(h)}px`;
    this.ctx.scale(dpr, dpr);
    const padX = w * 0.08, padY = h * 0.07;
    this.gridSize = (w - padX * 2) / 8; this.startX = padX; this.startY = padY;
  }
  getBoardCoords(r, c) { return { x: this.startX + c * this.gridSize, y: this.startY + r * this.gridSize }; }
  getCellFromPos(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect(), x = clientX - rect.left, y = clientY - rect.top;
    const c = Math.round((x - this.startX) / this.gridSize), r = Math.round((y - this.startY) / this.gridSize);
    if (r >= 0 && r < 10 && c >= 0 && c < 9 && Math.hypot(x - this.getBoardCoords(r,c).x, y - this.getBoardCoords(r,c).y) < this.gridSize * 0.48) return { r, c };
    return null;
  }
  drawBoard(theme = 'earth', time = 0) {
    const ctx = this.ctx, w = parseFloat(this.canvas.style.width), h = parseFloat(this.canvas.style.height);
    // Gọi bộ vẽ chiến trường ngũ hành từ file riêng
    if (typeof BattlefieldRenderer !== 'undefined' && BattlefieldRenderer.draw) {
      BattlefieldRenderer.draw(ctx, w, h, this.startX, this.startY, this.gridSize, theme, time);
      return;
    }
    // Lớp vẽ dự phòng nếu chưa có file
    const woodGrad = ctx.createLinearGradient(0, 0, w, h); woodGrad.addColorStop(0, '#cca573'); woodGrad.addColorStop(0.5, '#ba905e'); woodGrad.addColorStop(1, '#a67d4a');
    ctx.fillStyle = woodGrad; ctx.fillRect(0, 0, w, h);
  }
  drawHighlights(selectedPos, validMoves) {
    const ctx = this.ctx;
    if (selectedPos) { const p = this.getBoardCoords(selectedPos.r, selectedPos.c); ctx.save(); ctx.strokeStyle = '#ffeb3b'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(p.x, p.y, this.gridSize * 0.46, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    validMoves.forEach(m => {
      const p = this.getBoardCoords(m.to.r, m.to.c); ctx.save();
      if (m.capture) { ctx.strokeStyle = '#f44336'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, this.gridSize * 0.45, 0, Math.PI * 2); ctx.stroke(); } 
      else { ctx.fillStyle = 'rgba(76, 175, 80, 0.75)'; ctx.beginPath(); ctx.arc(p.x, p.y, this.gridSize * 0.16, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    });
  }
}

// ==========================================
// 7. BỘ ĐIỀU KHIỂN CHÍNH (GAME CONTROLLER)
// ==========================================
class GameController {
  constructor() {
    this.currentTheme = 'earth';
    this.canvas = document.getElementById('gameCanvas'); this.sound = new SoundFX(); this.renderer = new ChessRenderer(this.canvas); this.particles = new ParticleSystem();
    this.board = ChessRules.createInitialBoard(); this.turn = RED; this.selectedCell = null; this.validMoves = []; this.history = [];
    this.mode = 'pve'; this.difficulty = 'medium'; this.animSpeedMod = 1.5;
    this.combat = null; this.isInputLocked = false; this.screenShake = 0;
    this.bindEvents(); this.initUI(); this.renderer.resize(); this.lastTime = performance.now(); requestAnimationFrame(this.loop.bind(this));
  }
  initUI() {
    this.elTurn = document.getElementById('turn-indicator'); this.elTurnText = document.getElementById('turn-text'); this.elAlert = document.getElementById('alert-banner');
    this.modalStart = document.getElementById('modal-start'); this.modalGameOver = document.getElementById('modal-gameover'); this.elGameOverTitle = document.getElementById('gameover-title'); this.elGameOverDesc = document.getElementById('gameover-desc');
  }
  bindEvents() {
    const elTheme = document.getElementById('theme-select');
    if (elTheme) {
      elTheme.addEventListener('change', (e) => {
        this.currentTheme = e.target.value;
      });
    }
    window.addEventListener('resize', () => this.renderer.resize());
    const handlePointer = (e) => { if (this.isInputLocked) return; this.sound.init(); const cX = e.touches ? e.touches[0].clientX : e.clientX, cY = e.touches ? e.touches[0].clientY : e.clientY; const cell = this.renderer.getCellFromPos(cX, cY); if (cell) this.onCellClicked(cell.r, cell.c); };
    this.canvas.addEventListener('mousedown', handlePointer); this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handlePointer(e); }, { passive: false });
    document.getElementById('btn-new-game').addEventListener('click', () => this.resetGame());
    document.getElementById('btn-undo').addEventListener('click', () => this.undoMove());
    document.getElementById('btn-sound').addEventListener('click', () => { this.sound.init(); this.sound.enabled = !this.sound.enabled; document.getElementById('icon-sound-on').classList.toggle('hidden', !this.sound.enabled); document.getElementById('icon-sound-off').classList.toggle('hidden', this.sound.enabled); });
    document.getElementById('mode-select').addEventListener('change', (e) => { this.mode = e.target.value; document.getElementById('difficulty-group').style.display = this.mode === 'pve' ? 'flex' : 'none'; this.resetGame(); });
    document.getElementById('ai-difficulty').addEventListener('change', (e) => this.difficulty = e.target.value);
    document.getElementById('anim-speed').addEventListener('change', (e) => this.animSpeedMod = parseFloat(e.target.value));
    
    // Gắn đúng ID của nút XUẤT TRẬN như trong giao diện của bạn[cite: 12]
    const btnStart = document.getElementById('btn-start-game');
    if (btnStart) {
      btnStart.addEventListener('click', () => { this.sound.init(); this.modalStart.classList.add('hidden'); });
    }
    
    document.getElementById('btn-restart').addEventListener('click', () => { this.modalGameOver.classList.add('hidden'); this.resetGame(); });
  }
  resetGame() { this.board = ChessRules.createInitialBoard(); this.turn = RED; this.selectedCell = null; this.validMoves = []; this.history = []; this.combat = null; this.isInputLocked = false; this.screenShake = 0; this.updateUI(); }
  updateUI() {
    const isRed = this.turn === RED; this.elTurn.className = isRed ? 'turn-red' : 'turn-black'; this.elTurnText.textContent = isRed ? 'LƯỢT ĐỎ' : 'LƯỢT ĐEN';
    if (ChessRules.isKingInCheck(this.board, this.turn)) { this.elAlert.textContent = isRed ? 'ĐỎ ĐANG BỊ CHIẾU!' : 'ĐEN ĐANG BỊ CHIẾU!'; this.elAlert.classList.remove('hidden'); this.sound.playCheckAlert(); } else { this.elAlert.classList.add('hidden'); }
  }
  onCellClicked(r, c) {
    const piece = this.board[r][c], isMine = piece && ChessRules.getColor(piece) === this.turn;
    if (isMine) { this.selectedCell = { r, c }; this.validMoves = ChessRules.getValidMoves(this.board, this.turn).filter(m => m.from.r === r && m.from.c === c); this.sound.playSelect(); return; }
    if (this.selectedCell) { const move = this.validMoves.find(m => m.to.r === r && m.to.c === c); if (move) this.executeMove(move); else { this.selectedCell = null; this.validMoves = []; } }
  }
  executeMove(move) {
    this.isInputLocked = true; this.history.push({ board: ChessRules.cloneBoard(this.board), turn: this.turn });
    const isCapture = move.capture !== null, sPos = this.renderer.getBoardCoords(move.from.r, move.from.c), ePos = this.renderer.getBoardCoords(move.to.r, move.to.c);
    if (isCapture) { this.combat = { m: move, sP: sPos, eP: ePos, a: this.board[move.from.r][move.from.c], d: move.capture, p: 0, ph: 'move', hit: false }; } 
    else { this.combat = { m: move, sP: sPos, eP: ePos, a: this.board[move.from.r][move.from.c], d: null, p: 0, ph: 'move_only' }; this.sound.playMove(); }
    this.selectedCell = null; this.validMoves = [];
  }
  finalizeMove() {
    const m = this.combat.m;
    this.board[m.to.r][m.to.c] = this.board[m.from.r][m.from.c]; this.board[m.from.r][m.from.c] = null; this.combat = null;
    this.turn = this.turn === RED ? BLACK : RED; this.updateUI();
    if (ChessRules.isCheckmate(this.board, this.turn)) { this.showGameOver(`CHIẾU BÍ! QUÂN ${this.turn === RED ? 'ĐEN' : 'ĐỎ'} THẮNG!`); this.sound.playVictory(); return; } 
    else if (ChessRules.isStalemate(this.board, this.turn)) { this.showGameOver('HÒA CỜ! HẾT NƯỚC ĐI.'); return; }
    this.isInputLocked = false;
    if (this.mode === 'pve' && this.turn === BLACK) { this.isInputLocked = true; setTimeout(() => this.triggerAIMove(), 300); }
  }
  triggerAIMove() { const move = ChessAI.findBestMove(this.board, BLACK, this.difficulty); if (move) this.executeMove(move); else this.isInputLocked = false; }
  undoMove() {
    if (this.isInputLocked || !this.history.length) return;
    const steps = (this.mode === 'pve' && this.history.length >= 2) ? 2 : 1;
    for (let i = 0; i < steps; i++) { if (this.history.length) { const last = this.history.pop(); this.board = last.board; this.turn = last.turn; } }
    this.selectedCell = null; this.validMoves = []; this.updateUI();
  }
  showGameOver(msg) { this.elGameOverTitle.textContent = 'TRẬN ĐẤU KẾT THÚC'; this.elGameOverDesc.textContent = msg; this.modalGameOver.classList.remove('hidden'); }
  loop(time) {
    const dt = (time - this.lastTime) * 0.001 * this.animSpeedMod; this.lastTime = time;
    this.particles.update(); if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 30);
    
    if (this.combat) {
      const c = this.combat;
      if (c.ph === 'move_only') { c.p += dt * 3.5; if (c.p >= 1) this.finalizeMove(); } 
      else if (c.ph === 'move') { c.p += dt * 3; if (c.p >= 1) { c.ph = 'attack'; c.p = 0; } } 
      else if (c.ph === 'attack') {
        c.p += dt * 2.5; 
        if (c.p > 0.4 && !c.hit) {
          c.hit = true; this.screenShake = 12;
          if (ChessRules.getType(c.a) === 'C') { this.sound.playExplosion(); this.particles.emitShockwave(c.eP.x, c.eP.y, '#fff'); } 
          else { this.sound.playSlash(); this.particles.emitShockwave(c.eP.x, c.eP.y, '#fff'); }
        }
        if (c.p >= 1) { c.ph = 'defeat'; c.p = 0; }
      } 
      else if (c.ph === 'defeat') { c.p += dt * 2; if (c.p >= 1) this.finalizeMove(); }
    }
    this.render(time); requestAnimationFrame(this.loop.bind(this));
  }
  render(time) {
    const ctx = this.renderer.ctx; ctx.save();
    if (this.screenShake > 0) ctx.translate((Math.random()-0.5)*this.screenShake, (Math.random()-0.5)*this.screenShake);
    this.renderer.drawBoard(this.currentTheme, time); this.renderer.drawHighlights(this.selectedCell, this.validMoves);
    const size = this.renderer.gridSize, rad = (size/2)*0.88;
    
    for (let r = 0; r < 10; r++) for (let c = 0; c < 9; c++) {
      if (this.combat && ((r === this.combat.m.from.r && c === this.combat.m.from.c) || (r === this.combat.m.to.r && c === this.combat.m.to.c && this.combat.d))) continue;
      const p = this.board[r][c];
      if (p) CharacterRenderer.drawPiece(ctx, p, this.renderer.getBoardCoords(r, c).x, this.renderer.getBoardCoords(r, c).y, rad, time, 'idle', 0, ChessRules.getType(p) === 'K' && ChessRules.isKingInCheck(this.board, ChessRules.getColor(p)));
    }

    if (this.combat) {
      const c = this.combat;
      // Vẽ Defender
      if (c.d) {
        if (c.ph === 'move' || c.ph === 'attack') {
           let state = 'idle'; if (c.ph === 'attack' && c.p > 0.4) state = 'hurt';
           CharacterRenderer.drawPiece(ctx, c.d, c.eP.x + (state==='hurt'?(Math.random()-0.5)*5:0), c.eP.y, rad, time, state, 0, false);
        } else if (c.ph === 'defeat') {
           CharacterRenderer.drawPiece(ctx, c.d, c.eP.x, c.eP.y, rad, time, 'die', c.p, false);
        }
      }

      // Vẽ Attacker
      if (c.ph === 'move_only') {
        const x = c.sP.x + (c.eP.x - c.sP.x)*c.p, y = c.sP.y + (c.eP.y - c.sP.y)*c.p;
        CharacterRenderer.drawPiece(ctx, c.a, x, y, rad, time, 'walk', c.p, false);
      } else if (c.ph === 'move') {
        const dx = c.eP.x - c.sP.x, dy = c.eP.y - c.sP.y;
        const dist = Math.hypot(dx, dy); const stopRatio = Math.max(0, (dist - rad*1.5) / dist);
        const x = c.sP.x + dx * stopRatio * c.p, y = c.sP.y + dy * stopRatio * c.p;
        CharacterRenderer.drawPiece(ctx, c.a, x, y, rad, time, 'walk', c.p, false);
      } else if (c.ph === 'attack' || c.ph === 'defeat') {
        const dx = c.eP.x - c.sP.x, dy = c.eP.y - c.sP.y;
        const dist = Math.hypot(dx, dy); const stopRatio = Math.max(0, (dist - rad*1.5) / dist);
        const x = c.sP.x + dx * stopRatio, y = c.sP.y + dy * stopRatio;
        CharacterRenderer.drawPiece(ctx, c.a, x, y, rad, time, c.ph==='attack'?'attack':'idle', c.ph==='attack'?c.p:0, false);
      }
    }
    this.particles.draw(ctx); ctx.restore();
  }
}

window.addEventListener('DOMContentLoaded', () => new GameController());