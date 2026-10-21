/**
 * CHIẾN TƯỚNG – ANCIENT CHINESE CHESS BATTLE
 * CORE ENGINE & 3D / 2.5D HYBRID CONTROLLER
 * Tích hợp: Luật cờ, AI Minimax, Hoạt ảnh 2.5D Canvas, Pháo bắn đạn tầm xa, Đồ họa 3D Action Cam
 */

// ==========================================
// 1. ÂM THANH TỔNG HỢP (WEB AUDIO API)
// ==========================================
class SoundFX {
  constructor() { 
    this.ctx = null; 
    this.enabled = true; 
  }

  init() {
    if (!this.ctx) { 
      const AudioContextClass = window.AudioContext || window.webkitAudioContext; 
      if (AudioContextClass) this.ctx = new AudioContextClass(); 
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playMove() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'triangle'; 
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime); 
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.09);
  }

  playSelect() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'sine'; 
    osc.frequency.setValueAtTime(540, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime); 
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.06);
  }

  playSlash() {
    if (!this.enabled || !this.ctx) return;
    const n = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'sawtooth'; 
    osc.frequency.setValueAtTime(800, n); 
    osc.frequency.exponentialRampToValueAtTime(140, n + 0.18);
    gain.gain.setValueAtTime(0.4, n); 
    gain.gain.linearRampToValueAtTime(0.01, n + 0.2);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(n + 0.2);
  }

          playTripleStab() {
    if (!this.enabled || !this.ctx) return;
    const n = this.ctx.currentTime;
    [0, 0.1, 0.22].forEach((delay, idx) => {
      const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1100 - idx * 120, n + delay);
      osc.frequency.exponentialRampToValueAtTime(160, n + delay + 0.12);
      gain.gain.setValueAtTime(0.65, n + delay);
      gain.gain.linearRampToValueAtTime(0.01, n + delay + 0.14);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(n + delay); osc.stop(n + delay + 0.14);
    });
  }

  playChariotRam() {
    if (!this.enabled || !this.ctx) return;
    const n = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator(), gain1 = this.ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(140, n);
    osc1.frequency.exponentialRampToValueAtTime(420, n + 0.22);
    gain1.gain.setValueAtTime(0.7, n);
    gain1.gain.linearRampToValueAtTime(0.01, n + 0.25);
    osc1.connect(gain1); gain1.connect(this.ctx.destination);
    osc1.start(n); osc1.stop(n + 0.25);

    setTimeout(() => {
      if (!this.ctx) return;
      const cn = this.ctx.currentTime;
      const bS = Math.floor(this.ctx.sampleRate * 0.45);
      const b = this.ctx.createBuffer(1, bS, this.ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < bS; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bS * 0.2));
      const noise = this.ctx.createBufferSource(), filter = this.ctx.createBiquadFilter(), gain = this.ctx.createGain();
      noise.buffer = b;
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, cn);
      filter.frequency.linearRampToValueAtTime(40, cn + 0.45);
      gain.gain.setValueAtTime(0.95, cn);
      gain.gain.linearRampToValueAtTime(0.01, cn + 0.45);
      noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
      noise.start(cn);
    }, 220);
  }

  playPierceThrow() {
    if (!this.enabled || !this.ctx) return;
    const n = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator(), gain1 = this.ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(950, n);
    osc1.frequency.exponentialRampToValueAtTime(120, n + 0.18);
    gain1.gain.setValueAtTime(0.65, n);
    gain1.gain.linearRampToValueAtTime(0.01, n + 0.22);
    osc1.connect(gain1); gain1.connect(this.ctx.destination);
    osc1.start(n); osc1.stop(n + 0.22);

    const osc2 = this.ctx.createOscillator(), gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(220, n + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(850, n + 0.45);
    gain2.gain.setValueAtTime(0.55, n + 0.12);
    gain2.gain.linearRampToValueAtTime(0.01, n + 0.5);
    osc2.connect(gain2); gain2.connect(this.ctx.destination);
    osc2.start(n + 0.12); osc2.stop(n + 0.5);

    setTimeout(() => {
      if (!this.ctx) return;
      const cn = this.ctx.currentTime;
      const bS = Math.floor(this.ctx.sampleRate * 0.35);
      const b = this.ctx.createBuffer(1, bS, this.ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < bS; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bS * 0.18));
      const noise = this.ctx.createBufferSource(), filter = this.ctx.createBiquadFilter(), gain = this.ctx.createGain();
      noise.buffer = b;
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, cn);
      filter.frequency.linearRampToValueAtTime(50, cn + 0.35);
      gain.gain.setValueAtTime(0.85, cn);
      gain.gain.linearRampToValueAtTime(0.01, cn + 0.35);
      noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
      noise.start(cn);
    }, 450);
  }

  playStomp() {
    if (!this.enabled || !this.ctx) return;
    const n = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, n);
    osc.frequency.exponentialRampToValueAtTime(25, n + 0.45);
    gain.gain.setValueAtTime(0.85, n);
    gain.gain.linearRampToValueAtTime(0.01, n + 0.48);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(n); osc.stop(n + 0.48);

    const bS = Math.floor(this.ctx.sampleRate * 0.45);
    const b = this.ctx.createBuffer(1, bS, this.ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < bS; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bS * 0.22));
    const noise = this.ctx.createBufferSource(), filter = this.ctx.createBiquadFilter(), nGain = this.ctx.createGain();
    noise.buffer = b;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, n);
    filter.frequency.linearRampToValueAtTime(35, n + 0.48);
    nGain.gain.setValueAtTime(0.95, n);
    nGain.gain.linearRampToValueAtTime(0.01, n + 0.48);
    noise.connect(filter); filter.connect(nGain); nGain.connect(this.ctx.destination);
    noise.start(n);
  }

  playExplosion() {
    if (!this.enabled || !this.ctx) return;
    const n = this.ctx.currentTime, bS = Math.floor(this.ctx.sampleRate * 0.35);
    const b = this.ctx.createBuffer(1, bS, this.ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < bS; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bS * 0.25));
    const noise = this.ctx.createBufferSource(), filter = this.ctx.createBiquadFilter(), gain = this.ctx.createGain();
    noise.buffer = b; 
    filter.type = 'lowpass'; 
    filter.frequency.setValueAtTime(450, n); 
    filter.frequency.linearRampToValueAtTime(60, n + 0.35);
    gain.gain.setValueAtTime(0.65, n); 
    gain.gain.linearRampToValueAtTime(0.01, n + 0.35);
    noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
    noise.start();
  }

  playCheckAlert() {
    if (!this.enabled || !this.ctx) return;
    const n = this.ctx.currentTime;
    [440, 554, 659].forEach((fq, i) => {
      const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = 'triangle'; 
      osc.frequency.setValueAtTime(fq, n + i * 0.08);
      gain.gain.setValueAtTime(0.3, n + i * 0.08); 
      gain.gain.linearRampToValueAtTime(0.01, n + i * 0.08 + 0.25);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(n + i * 0.08); osc.stop(n + i * 0.08 + 0.26);
    });
  }

  playVictory() {
    if (!this.enabled || !this.ctx) return;
    const notes = [523, 659, 784, 1046], n = this.ctx.currentTime;
    notes.forEach((fq, i) => {
      const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = 'sine'; 
      osc.frequency.setValueAtTime(fq, n + i * 0.15);
      gain.gain.setValueAtTime(0.35, n + i * 0.15); 
      gain.gain.linearRampToValueAtTime(0.01, n + i * 0.15 + 0.4);
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
    board[0] = ['bR','bH','bE','bA','bK','bA','bE','bH','bR']; 
    board[2][1] = 'bC'; board[2][7] = 'bC';
    board[3][0] = 'bP'; board[3][2] = 'bP'; board[3][4] = 'bP'; board[3][6] = 'bP'; board[3][8] = 'bP';
    board[9] = ['rR','rH','rE','rA','rK','rA','rE','rH','rR']; 
    board[7][1] = 'rC'; board[7][7] = 'rC';
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
    const add = (tr, tc) => { 
      if (!this.inBounds(tr, tc)) return false; 
      const tgt = b[tr][tc]; 
      if (!tgt) { 
        m.push({ from: { r, c }, to: { r: tr, c: tc }, capture: null }); 
        return true; 
      } 
      if (this.getColor(tgt) !== color) {
        m.push({ from: { r, c }, to: { r: tr, c: tc }, capture: tgt }); 
      }
      return false; 
    };

    switch (type) {
      case 'K': 
        [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc])=>{ 
          const nr=r+dr,nc=c+dc; 
          if(nr>=(color===RED?7:0)&&nr<=(color===RED?9:2)&&nc>=3&&nc<=5) add(nr,nc); 
        }); 
        break;
      case 'A': 
        [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,dc])=>{ 
          const nr=r+dr,nc=c+dc; 
          if(nr>=(color===RED?7:0)&&nr<=(color===RED?9:2)&&nc>=3&&nc<=5) add(nr,nc); 
        }); 
        break;
      case 'E': 
        [{dr:-2,dc:-2,er:-1,ec:-1},{dr:-2,dc:2,er:-1,ec:1},{dr:2,dc:-2,er:1,ec:-1},{dr:2,dc:2,er:1,ec:1}].forEach(d=>{ 
          const nr=r+d.dr,nc=c+d.dc; 
          if((color===RED&&nr<5)||(color===BLACK&&nr>4)) return; 
          if(this.inBounds(nr,nc)&&!b[r+d.er][c+d.ec]) add(nr,nc); 
        }); 
        break;
      case 'H': 
        [{dr:-2,dc:-1,br:-1,bc:0},{dr:-2,dc:1,br:-1,bc:0},{dr:2,dc:-1,br:1,bc:0},{dr:2,dc:1,br:1,bc:0},{dr:-1,dc:-2,br:0,bc:-1},{dr:1,dc:-2,br:0,bc:-1},{dr:-1,dc:2,br:0,bc:1},{dr:1,dc:2,br:0,bc:1}].forEach(j=>{ 
          if(this.inBounds(r+j.dr,c+j.dc)&&!b[r+j.br][c+j.bc]) add(r+j.dr,c+j.dc); 
        }); 
        break;
      case 'R': 
        [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc])=>{ 
          let s=1; while(true){ if(!add(r+dr*s,c+dc*s)) break; s++; } 
        }); 
        break;
      case 'C': 
        [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc])=>{ 
          let s=1, scr=false; 
          while(true){ 
            const nr=r+dr*s,nc=c+dc*s; 
            if(!this.inBounds(nr,nc)) break; 
            const tgt=b[nr][nc]; 
            if(!scr){ 
              if(!tgt) m.push({from:{r,c},to:{r:nr,c:nc},capture:null}); else scr=true; 
            } else if(tgt){ 
              if(this.getColor(tgt)!==color) m.push({from:{r,c},to:{r:nr,c:nc},capture:tgt}); 
              break; 
            } 
            s++; 
          } 
        }); 
        break;
      case 'P': 
        const fw=color===RED?-1:1; 
        if(this.inBounds(r+fw,c)) add(r+fw,c); 
        if(color===RED?r<=4:r>=5){ 
          if(this.inBounds(r,c-1)) add(r,c-1); 
          if(this.inBounds(r,c+1)) add(r,c+1); 
        } 
        break;
    } 
    return m;
  }

  static findKing(b, col) { 
    for(let r=0;r<10;r++)for(let c=3;c<=5;c++)if(b[r][c]===col+'K')return{r,c}; 
    return null; 
  }

  static isKingInCheck(b, col) {
    const k=this.findKing(b,col); if(!k) return true;
    const rK=this.findKing(b,RED), bK=this.findKing(b,BLACK); 
    let fly=false;
    if(rK && bK && rK.c===bK.c){ 
      fly=true; 
      for(let r=bK.r+1;r<rK.r;r++) if(b[r][rK.c]) fly=false; 
    } 
    if(fly) return true;

    const opp=col===RED?BLACK:RED; 
    for(let r=0;r<10;r++){
      for(let c=0;c<9;c++){
        if(b[r][c] && this.getColor(b[r][c])===opp){
          if(this.getPseudoMoves(b,r,c).some(m=>m.to.r===k.r&&m.to.c===k.c)) return true;
        }
      }
    }
    return false;
  }

  static getValidMoves(b, col) {
    const v=[]; 
    for(let r=0;r<10;r++){
      for(let c=0;c<9;c++){
        if(b[r][c] && this.getColor(b[r][c])===col){
          this.getPseudoMoves(b,r,c).forEach(m=>{ 
            const nb=this.cloneBoard(b); 
            nb[m.to.r][m.to.c]=nb[m.from.r][m.from.c]; 
            nb[m.from.r][m.from.c]=null; 
            if(!this.isKingInCheck(nb,col)) v.push(m); 
          });
        }
      }
    } 
    return v;
  }

  static isCheckmate(b, col) { return this.isKingInCheck(b,col) && this.getValidMoves(b,col).length===0; }
  static isStalemate(b, col) { return !this.isKingInCheck(b,col) && this.getValidMoves(b,col).length===0; }
}

// ==========================================
// 3. AI ENGINE – BỘ NÃO CHIẾN THUẬT QUÂN SỰ
// ==========================================
class ChessAI {
  static BASE_VAL = { 'K': 15000, 'R': 1000, 'C': 480, 'H': 420, 'E': 220, 'A': 220, 'P': 100 };

  static PST = {
    P: [
      [  0,   3,   6,   9,  12,   9,   6,   3,   0],
      [ 20,  40,  70, 110, 130, 110,  70,  40,  20],
      [ 15,  35,  60,  95, 115,  95,  60,  35,  15],
      [ 12,  25,  40,  60,  75,  60,  40,  25,  12],
      [ 10,  18,  28,  40,  50,  40,  28,  18,  10],
      [  0,   0,   0,   0,   0,   0,   0,   0,   0],
      [ -2,   0,   5,   0,  10,   0,   5,   0,  -2],
      [  0,   0,   0,   0,   0,   0,   0,   0,   0],
      [  0,   0,   0,   0,   0,   0,   0,   0,   0],
      [  0,   0,   0,   0,   0,   0,   0,   0,   0]
    ],
    H: [
      [  4,   8,  16,  12,   4,  12,  16,   8,   4],
      [  8,  18,  32,  26,  18,  26,  32,  18,   8],
      [ 12,  26,  40,  35,  22,  35,  40,  26,  12],
      [  8,  22,  30,  32,  26,  32,  30,  22,   8],
      [  4,  16,  22,  26,  22,  26,  22,  16,   4],
      [  2,  10,  16,  18,  14,  18,  16,  10,   2],
      [  0,   4,  10,  12,  10,  12,  10,   4,   0],
      [ -4,   2,   4,   6,   4,   6,   4,   2,  -4],
      [ -6,  -2,   0,   2,   0,   2,   0,  -2,  -6],
      [-10,  -6,  -4,   0,  -4,   0,  -4,  -6, -10]
    ],
    R: [
      [ 14,  18,  20,  26,  28,  26,  20,  18,  14],
      [ 18,  26,  24,  32,  35,  32,  24,  26,  18],
      [ 12,  20,  18,  24,  26,  24,  18,  20,  12],
      [ 16,  22,  20,  26,  28,  26,  20,  22,  16],
      [ 14,  18,  16,  22,  24,  22,  16,  18,  14],
      [ 10,  14,  12,  18,  20,  18,  12,  14,  10],
      [  6,  10,   8,  14,  16,  14,   8,  10,   6],
      [  2,   6,   4,  10,  12,  10,   4,   6,   2],
      [  0,   4,   2,   8,  10,   8,   2,   4,   0],
      [ -6,   8,   6,  14,  10,  14,   6,   8,  -6]
    ],
    C: [
      [  6,   8,   4,   0,  -2,   0,   4,   8,   6],
      [  4,   8,   6,   2,   0,   2,   6,   8,   4],
      [  2,   6,  10,  12,  15,  12,  10,   6,   2],
      [  0,   4,   6,  16,  22,  16,   6,   4,   0],
      [  0,   4,   6,  18,  28,  18,   6,   4,   0],
      [ -2,   0,   2,  14,  20,  14,   2,   0,  -2],
      [ -2,   0,   2,  10,  16,  10,   2,   0,  -2],
      [  0,   2,   4,   8,  12,   8,   4,   2,   0],
      [  0,   0,   0,   2,   4,   2,   0,   0,   0],
      [ -2,   0,   0,   0,   0,   0,   0,   0,  -2]
    ],
    E: [
      [0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0],
      [0, 0, 4, 0, 0, 0, 4, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [2, 0, 0, 0, 10, 0, 0, 0, 2],
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

  static scoreMove(m, board) {
    let score = 0;
    if (m.capture) {
      const victimVal = this.BASE_VAL[ChessRules.getType(m.capture)] || 0;
      const attackerVal = this.BASE_VAL[ChessRules.getType(board[m.from.r][m.from.c])] || 0;
      score += 10000 + victimVal * 10 - attackerVal;
    } else {
      const type = ChessRules.getType(board[m.from.r][m.from.c]);
      const isRed = ChessRules.getColor(board[m.from.r][m.from.c]) === RED;
      score += (this.getPosBonus(type, m.to.r, m.to.c, isRed) - this.getPosBonus(type, m.from.r, m.from.c, isRed));
    }
    return score;
  }

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

  static findBestMove(board, color, difficulty = 'medium') {
    const vM = ChessRules.getValidMoves(board, color);
    if (!vM.length) return null;

    const isM = color === RED;

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

    vM.sort((x, y) => this.scoreMove(y, board) - this.scoreMove(x, board));
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
// 4. PARTICLE SYSTEM (HIỆU ỨNG HẠT 2D CANVAS)
// ==========================================
class ParticleSystem {
  constructor() { this.pt = []; }
  emit(x, y, color, count=12, speed=4, size=5) { 
    for(let i=0;i<count;i++){ 
      const a=Math.random()*Math.PI*2, spd=(Math.random()*0.7+0.3)*speed; 
      this.pt.push({x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,life:1,decay:Math.random()*0.03+0.02,color,size:Math.random()*size+2}); 
    } 
  }
    emitStarlight(x, y, color, count = 15) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, spd = (Math.random() * 0.8 + 0.3) * 6;
      this.pt.push({
        x, y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life: 1,
        decay: Math.random() * 0.04 + 0.02,
        color,
        size: Math.random() * 6 + 3,
        isStar: true,
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.2
      });
    }
  }

  emitShockwave(x, y, color='#fff') { 
    this.pt.push({x,y,vx:0,vy:0,life:1,decay:0.04,isWave:true,r:6,mr:45,color}); 
  }
  update() { 
    for(let i=this.pt.length-1;i>=0;i--){ 
      const p=this.pt[i]; 
      p.life-=p.decay; 
      if(p.life<=0){ this.pt.splice(i,1); continue; } 
      if(p.isWave) p.r+=(p.mr-p.r)*0.15; 
      else { p.x+=p.vx; p.y+=p.vy; p.vy+=0.08; } 
    } 
  }
  draw(ctx) {
    ctx.save();
    for (const p of this.pt) {
      ctx.globalAlpha = Math.max(0, p.life);
      if (p.isStar) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot || 0);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 2;
        const sz = p.size * p.life;
        ctx.beginPath();
        ctx.moveTo(0, -sz);
        ctx.quadraticCurveTo(0, 0, sz, 0);
        ctx.quadraticCurveTo(0, 0, 0, sz);
        ctx.quadraticCurveTo(0, 0, -sz, 0);
        ctx.quadraticCurveTo(0, 0, 0, -sz);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (p.isWave) { 
        ctx.strokeStyle = p.color; ctx.lineWidth = 3 * p.life; 
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.stroke(); 
      } else { 
        ctx.fillStyle = p.color; 
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill(); 
      }
    } 
    ctx.restore();
  }
}

// ==========================================
// 5. BỘ ĐỊNH TUYẾN KẾT XUẤT ĐỒ HỌA 2.5D (MINIMAP & FULL 2.5D)
// ==========================================
class SkeletalFallback {
  static drawCharacter(ctx, type, isRed, x, y, r, time, state, progress, isChecked) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; 
    ctx.beginPath(); ctx.ellipse(0, r*0.4, r*0.7, r*0.2, 0, 0, Math.PI*2); ctx.fill();
    ctx.translate(0, Math.sin(time*0.005)*r*0.05);
    ctx.fillStyle = isRed ? '#d32f2f' : '#1976d2'; 
    ctx.beginPath(); ctx.roundRect(-r*0.4, -r*0.6, r*0.8, r*0.9, r*0.1); ctx.fill();
    ctx.font = `bold ${r*0.5}px sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#fff';
    const charMap = {'rA':'仕','bA':'士','rE':'相','bE':'象','rH':'傌','bH':'馬','rR':'俥','bR':'車','rC':'炮','bC':'砲'};
    ctx.fillText(charMap[isRed?'r'+type:'b'+type] || type, 0, -r*0.1);
    ctx.restore();
  }
}

class CharacterRenderer {
  static drawPiece(ctx, piece, x, y, rad, time, state, progress, isChecked) {
    if (!piece) return;
    const type = ChessRules.getType(piece);
    const isRed = ChessRules.getColor(piece) === RED;
    
    if (type === 'P' && typeof PawnRenderer !== 'undefined') {
      PawnRenderer.drawCharacter(ctx, isRed, x, y, rad, time, state, progress, isChecked);
    } else if (type === 'K' && typeof GeneralRenderer !== 'undefined') {
      GeneralRenderer.drawCharacter(ctx, isRed, x, y, rad, time, state, progress, isChecked);
    } else if (type === 'A' && typeof AdvisorRenderer !== 'undefined' && AdvisorRenderer.drawCharacter) {
      AdvisorRenderer.drawCharacter(ctx, isRed, x, y, rad, time, state, progress, isChecked);
    } else if (type === 'E' && typeof ElephantRenderer !== 'undefined' && ElephantRenderer.drawCharacter) {
      ElephantRenderer.drawCharacter(ctx, isRed, x, y, rad, time, state, progress, isChecked);
    } else if (type === 'R' && typeof ChariotRenderer !== 'undefined' && ChariotRenderer.drawCharacter) {
      ChariotRenderer.drawCharacter(ctx, isRed, x, y, rad, time, state, progress, isChecked);
    } else if (type === 'H' && typeof HorseRenderer !== 'undefined' && HorseRenderer.drawCharacter) {
      HorseRenderer.drawCharacter(ctx, isRed, x, y, rad, time, state, progress, isChecked);
    } else if (type === 'C' && typeof CannonRenderer !== 'undefined' && CannonRenderer.drawCharacter) {
      CannonRenderer.drawCharacter(ctx, isRed, x, y, rad, time, state, progress, isChecked);
    } else {
      SkeletalFallback.drawCharacter(ctx, type, isRed, x, y, rad, time, state, progress, isChecked);
    }
  }
}

// ==========================================
// 6. RENDERER BÀN CỜ 2D (CHESS RENDERER)
// ==========================================
class ChessRenderer {
  constructor(canvas) { 
    this.canvas = canvas; 
    this.ctx = canvas.getContext('2d'); 
    this.gridSize = 0; 
    this.startX = 0; 
    this.startY = 0; 
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const aspect = 9 / 10.8; 
    let w = rect.width, h = rect.height;
    if (w <= 0 || h <= 0) return;
    
    if (w / h > aspect) w = h * aspect; else h = w / aspect;
    this.canvas.width = Math.floor(w * dpr); 
    this.canvas.height = Math.floor(h * dpr);
    this.canvas.style.width = `${Math.floor(w)}px`; 
    this.canvas.style.height = `${Math.floor(h)}px`;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    const padX = w * 0.08, padY = h * 0.07;
    this.gridSize = (w - padX * 2) / 8; 
    this.startX = padX; 
    this.startY = padY;
  }

  getBoardCoords(r, c) { return { x: this.startX + c * this.gridSize, y: this.startY + r * this.gridSize }; }

  getCellFromPos(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect(), x = clientX - rect.left, y = clientY - rect.top;
    const c = Math.round((x - this.startX) / this.gridSize), r = Math.round((y - this.startY) / this.gridSize);
    if (r >= 0 && r < 10 && c >= 0 && c < 9 && Math.hypot(x - this.getBoardCoords(r,c).x, y - this.getBoardCoords(r,c).y) < this.gridSize * 0.48) return { r, c };
    return null;
  }

  drawBoard(theme = 'earth', time = 0) {
    const ctx = this.ctx, w = parseFloat(this.canvas.style.width) || this.canvas.width, h = parseFloat(this.canvas.style.height) || this.canvas.height;
    if (typeof BattlefieldRenderer !== 'undefined' && BattlefieldRenderer.draw) {
      BattlefieldRenderer.draw(ctx, w, h, this.startX, this.startY, this.gridSize, theme, time);
      return;
    }
    const woodGrad = ctx.createLinearGradient(0, 0, w, h); 
    woodGrad.addColorStop(0, '#cca573'); woodGrad.addColorStop(0.5, '#ba905e'); woodGrad.addColorStop(1, '#a67d4a');
    ctx.fillStyle = woodGrad; ctx.fillRect(0, 0, w, h);
  }

  drawHighlights(selectedPos, validMoves) {
    const ctx = this.ctx;
    if (selectedPos) { 
      const p = this.getBoardCoords(selectedPos.r, selectedPos.c); 
      ctx.save(); ctx.strokeStyle = '#ffeb3b'; ctx.lineWidth = 3.5; 
      ctx.beginPath(); ctx.arc(p.x, p.y, this.gridSize * 0.46, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); 
    }
    validMoves.forEach(m => {
      const p = this.getBoardCoords(m.to.r, m.to.c); ctx.save();
      if (m.capture) { 
        ctx.strokeStyle = '#f44336'; ctx.lineWidth = 3; 
        ctx.beginPath(); ctx.arc(p.x, p.y, this.gridSize * 0.45, 0, Math.PI * 2); ctx.stroke(); 
      } else { 
        ctx.fillStyle = 'rgba(76, 175, 80, 0.75)'; 
        ctx.beginPath(); ctx.arc(p.x, p.y, this.gridSize * 0.16, 0, Math.PI * 2); ctx.fill(); 
      }
      ctx.restore();
    });
  }
}

// ==========================================
// 7. BỘ KẾT XUẤT 3D CHIẾN TƯỚNG (THREE.JS RENDERER)
// ==========================================
class ThreeChessRenderer {
  constructor(canvas, onCellClickCallback) {
    this.canvas = canvas;
    this.onCellClick = onCellClickCallback;
    this.cellSize = 2.0; 
    this.pieces3D = Array(10).fill(null).map(() => Array(9).fill(null));
    this.highlightMeshes = [];
    this.selectedRing = null;

    this.initScene();
    this.initLights();
    this.createBoardMesh();
    this.initRaycaster();
    this.bindEvents();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a120b);

    const parent = this.canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.defaultCamPos = { x: 0, y: 19, z: 18 };
    this.camera.position.set(this.defaultCamPos.x, this.defaultCamPos.y, this.defaultCamPos.z);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2.15;
      this.controls.minDistance = 6;
      this.controls.maxDistance = 35;
      this.controls.target.set(0, 0, 0);
    }
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight(0xfff3e0, 0.75);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffecd2, 1.0);
    dirLight.position.set(12, 28, 16);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 60;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 15;
    dirLight.shadow.camera.bottom = -15;
    this.scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xff9800, 0.5, 30);
    pointLight.position.set(0, 10, 0);
    this.scene.add(pointLight);
  }

  gridToWorld(r, c) {
    return {
      x: (c - 4) * this.cellSize,
      y: 0.25,
      z: (r - 4.5) * this.cellSize
    };
  }

  createBoardMesh() {
    const boardWidth = 9 * this.cellSize + 1.6;
    const boardHeight = 10 * this.cellSize + 1.6;
    const boardGeo = new THREE.BoxGeometry(boardWidth, 0.5, boardHeight);
    const boardMat = new THREE.MeshStandardMaterial({
      color: 0xba905e,
      roughness: 0.45,
      metalness: 0.1
    });
    this.boardMesh = new THREE.Mesh(boardGeo, boardMat);
    this.boardMesh.position.y = 0;
    this.boardMesh.receiveShadow = true;
    this.scene.add(this.boardMesh);

    const lineMat = new THREE.LineBasicMaterial({ color: 0x3e2723 });
    const lineGroup = new THREE.Group();

    for (let r = 0; r < 10; r++) {
      const p1 = this.gridToWorld(r, 0), p2 = this.gridToWorld(r, 8);
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(p1.x, 0.26, p1.z),
        new THREE.Vector3(p2.x, 0.26, p2.z)
      ]);
      lineGroup.add(new THREE.Line(geo, lineMat));
    }

    for (let c = 0; c < 9; c++) {
      const pT1 = this.gridToWorld(0, c), pT2 = this.gridToWorld(4, c);
      lineGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(pT1.x, 0.26, pT1.z), new THREE.Vector3(pT2.x, 0.26, pT2.z)
      ]), lineMat));

      const pB1 = this.gridToWorld(5, c), pB2 = this.gridToWorld(9, c);
      lineGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(pB1.x, 0.26, pB1.z), new THREE.Vector3(pB2.x, 0.26, pB2.z)
      ]), lineMat));

      if (c === 0 || c === 8) {
        const pM1 = this.gridToWorld(4, c), pM2 = this.gridToWorld(5, c);
        lineGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(pM1.x, 0.26, pM1.z), new THREE.Vector3(pM2.x, 0.26, pM2.z)
        ]), lineMat));
      }
    }

    const addCross = (topR) => {
      const p1 = this.gridToWorld(topR, 3), p2 = this.gridToWorld(topR + 2, 5);
      const p3 = this.gridToWorld(topR, 5), p4 = this.gridToWorld(topR + 2, 3);
      lineGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(p1.x, 0.26, p1.z), new THREE.Vector3(p2.x, 0.26, p2.z)
      ]), lineMat));
      lineGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(p3.x, 0.26, p3.z), new THREE.Vector3(p4.x, 0.26, p4.z)
      ]), lineMat));
    };
    addCross(0);
    addCross(7);

    this.scene.add(lineGroup);

    const ringGeo = new THREE.RingGeometry(0.85, 0.95, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b, side: THREE.DoubleSide });
    this.selectedRing = new THREE.Mesh(ringGeo, ringMat);
    this.selectedRing.rotation.x = -Math.PI / 2;
    this.selectedRing.position.y = 0.27;
    this.selectedRing.visible = false;
    this.scene.add(this.selectedRing);
  }

  createPieceTexture(text, isRed) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f7eed8';
    ctx.beginPath(); ctx.arc(128, 128, 122, 0, Math.PI * 2); ctx.fill();

    ctx.lineWidth = 10;
    ctx.strokeStyle = isRed ? '#d32f2f' : '#1565c0';
    ctx.stroke();

    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(128, 128, 106, 0, Math.PI * 2); ctx.stroke();

    ctx.font = 'bold 112px "KaiTi", "SimSun", serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = isRed ? '#b71c1c' : '#0d47a1';
    ctx.fillText(text, 128, 134);

    return new THREE.CanvasTexture(canvas);
  }

  createPieceMesh(pieceStr) {
    const isRed = pieceStr[0] === 'r';
    const type = pieceStr[1];
    const charMap = {
      'rK':'帥','bK':'將','rA':'仕','bA':'士','rE':'相','bE':'象',
      'rH':'傌','bH':'馬','rR':'俥','bR':'車','rC':'炮','bC':'砲','rP':'兵','bP':'卒'
    };
    const label = charMap[pieceStr] || type;

    const group = new THREE.Group();
    const geo = new THREE.CylinderGeometry(0.76, 0.8, 0.38, 32);
    const topTex = this.createPieceTexture(label, isRed);

    const materials = [
      new THREE.MeshStandardMaterial({ color: isRed ? 0x8b1e0f : 0x1a237e, roughness: 0.45 }),
      new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.35 }),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    ];

    const mesh = new THREE.Mesh(geo, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.y = 0.22;
    group.add(mesh);

    group.userData = { pieceStr, label, isRed, type };
    return group;
  }

  syncBoard(boardState) {
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const pieceStr = boardState[r][c];
        const cur = this.pieces3D[r][c];
        if (cur) {
          this.scene.remove(cur);
          this.pieces3D[r][c] = null;
        }
        if (pieceStr) {
          const mesh = this.createPieceMesh(pieceStr);
          const pos = this.gridToWorld(r, c);
          mesh.position.set(pos.x, pos.y, pos.z);
          this.scene.add(mesh);
          this.pieces3D[r][c] = mesh;
        }
      }
    }
  }

  setSelection(selectedPos, validMoves) {
    if (selectedPos) {
      const p = this.gridToWorld(selectedPos.r, selectedPos.c);
      this.selectedRing.position.set(p.x, 0.27, p.z);
      this.selectedRing.visible = true;
    } else {
      this.selectedRing.visible = false;
    }

    this.highlightMeshes.forEach(m => this.scene.remove(m));
    this.highlightMeshes = [];

    validMoves.forEach(m => {
      const p = this.gridToWorld(m.to.r, m.to.c);
      const isCap = m.capture !== null;
      const geo = isCap ? new THREE.RingGeometry(0.75, 0.88, 24) : new THREE.CircleGeometry(0.3, 16);
      const mat = new THREE.MeshBasicMaterial({
        color: isCap ? 0xf44336 : 0x4caf50,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(p.x, 0.27, p.z);
      this.scene.add(mesh);
      this.highlightMeshes.push(mesh);
    });
  }

  movePiece(from, to, duration = 400, isElephant = false, isHorse = false, isChariot = false) {
    return new Promise((resolve) => {
      const piece = this.pieces3D[from.r][from.c];
      if (!piece) return resolve();

      const targetPos = this.gridToWorld(to.r, to.c);

      // Xóa triệt để model quân phòng thủ (nếu có) để tránh hiện tượng bóng ma
      const defenderPiece = this.pieces3D[to.r][to.c];
      if (defenderPiece) {
        this.scene.remove(defenderPiece);
      }

      this.pieces3D[to.r][to.c] = piece;
      this.pieces3D[from.r][from.c] = null;

      if (typeof TWEEN !== 'undefined') {
        new TWEEN.Tween(piece.position)
          .to({ x: targetPos.x, z: targetPos.z }, duration)
          .easing(TWEEN.Easing.Quadratic.Out)
          .onComplete(resolve)
          .start();
      } else {
        piece.position.set(targetPos.x, targetPos.y, targetPos.z);
        resolve();
      }
    });
  }

  triggerActionCam(attackerName, defenderName, targetPos, duration = 1200) {
    return new Promise((resolve) => {
      const vsCard = document.getElementById('versus-card');
      if (vsCard) {
        const elA = document.getElementById('vs-attacker');
        const elD = document.getElementById('vs-defender');
        if (elA) elA.textContent = attackerName;
        if (elD) elD.textContent = defenderName;
        vsCard.style.display = 'flex';
      }

      if (typeof TWEEN === 'undefined') {
        setTimeout(() => {
          if (vsCard) vsCard.style.display = 'none';
          resolve();
        }, duration);
        return;
      }

      const startCam = { x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z };
      const startTarget = { x: this.controls.target.x, y: this.controls.target.y, z: this.controls.target.z };

      const zoomPos = {
        x: targetPos.x + 3.2,
        y: targetPos.y + 3.2,
        z: targetPos.z + 4.2
      };

      new TWEEN.Tween(this.camera.position)
        .to(zoomPos, 350)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();

      new TWEEN.Tween(this.controls.target)
        .to({ x: targetPos.x, y: targetPos.y, z: targetPos.z }, 350)
        .easing(TWEEN.Easing.Cubic.Out)
        .onComplete(() => {
          setTimeout(() => {
            new TWEEN.Tween(this.camera.position)
              .to(startCam, 450)
              .easing(TWEEN.Easing.Cubic.InOut)
              .start();

            new TWEEN.Tween(this.controls.target)
              .to(startTarget, 450)
              .easing(TWEEN.Easing.Cubic.InOut)
              .onComplete(() => {
                if (vsCard) vsCard.style.display = 'none';
                resolve();
              })
              .start();
          }, duration * 0.55);
        })
        .start();
    });
  }

  initRaycaster() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.25);
  }

  bindEvents() {
    const modalSettings = document.getElementById('modal-settings');
    const btnSettings = document.getElementById('btn-settings');
    if (btnSettings && modalSettings) {
      btnSettings.addEventListener('click', () => {
        this.sound.init();
        modalSettings.classList.remove('hidden');
      });
    }

    const btnCloseSettings = document.getElementById('btn-close-settings');
    if (btnCloseSettings && modalSettings) {
      btnCloseSettings.addEventListener('click', () => {
        modalSettings.classList.add('hidden');
      });
    }

    const btnApplySettings = document.getElementById('btn-apply-settings');
    if (btnApplySettings && modalSettings) {
      btnApplySettings.addEventListener('click', () => {
        modalSettings.classList.add('hidden');
      });
    }
    window.addEventListener('resize', () => {
      const parent = this.canvas.parentElement;
      const rect = parent ? parent.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
      const width = rect.width || window.innerWidth;
      const height = rect.height || window.innerHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });

    let pointerDownPos = { x: 0, y: 0 };
    this.canvas.addEventListener('pointerdown', (e) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    });

    this.canvas.addEventListener('pointerup', (e) => {
      if (Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y) > 8) return;

      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersectPoint = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(this.plane, intersectPoint)) {
        const c = Math.round(intersectPoint.x / this.cellSize + 4);
        const r = Math.round(intersectPoint.z / this.cellSize + 4.5);
        if (r >= 0 && r < 10 && c >= 0 && c < 9) {
          if (this.onCellClick) this.onCellClick(r, c);
        }
      }
    });
  }

  render() {
    if (typeof TWEEN !== 'undefined') TWEEN.update();
    if (this.controls) this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// ==========================================
// 8. BỘ ĐIỀU KHIỂN CHÍNH (GAME CONTROLLER)
// ==========================================
class GameController {
  constructor() {
    this.currentTheme = 'earth';
    this.viewMode = '2.5d';
    this.canvas2D = document.getElementById('gameCanvas'); 
    this.canvas3D = document.getElementById('threeCanvas');

    this.sound = new SoundFX();
    this.renderer2D = new ChessRenderer(this.canvas2D);
    this.particles = new ParticleSystem();

    this.board = ChessRules.createInitialBoard();
    this.turn = RED;
    this.selectedCell = null;
    this.validMoves = [];
    this.history = [];

    this.mode = 'pve';
    this.difficulty = 'medium';
    this.animSpeedMod = 1.5;

    this.combat = null;
    this.isInputLocked = false;
    this.screenShake = 0;

    this.renderer3D = null;
    if (this.canvas3D && typeof THREE !== 'undefined') {
      this.renderer3D = new ThreeChessRenderer(this.canvas3D, (r, c) => {
        if (!this.isInputLocked) this.onCellClicked(r, c);
      });
      this.renderer3D.syncBoard(this.board);
    }

    this.bindEvents();
    this.initUI();
    this.renderer2D.resize();
    this.setViewMode(this.viewMode);
    
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  initUI() {
    this.elTurn = document.getElementById('turn-indicator');
    this.elTurnText = document.getElementById('turn-text');
    this.elAlert = document.getElementById('alert-banner');
    this.modalStart = document.getElementById('modal-start');
    this.modalGameOver = document.getElementById('modal-gameover');
    this.elGameOverTitle = document.getElementById('gameover-title');
    this.elGameOverDesc = document.getElementById('gameover-desc');
  }

  setViewMode(mode) {
    this.viewMode = mode;
    const container = document.getElementById('game-container');
    if (!container) return;

    if (mode === '2.5d') {
      container.classList.remove('view-3d');
      container.classList.add('view-2d');
    } else {
      container.classList.remove('view-2d');
      container.classList.add('view-3d');
    }

    setTimeout(() => {
      this.renderer2D.resize();
      if (this.renderer3D) {
        const parent = this.canvas3D.parentElement;
        const rect = parent ? parent.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
        const width = rect.width || window.innerWidth;
        const height = rect.height || window.innerHeight;
        this.renderer3D.camera.aspect = width / height;
        this.renderer3D.camera.updateProjectionMatrix();
        this.renderer3D.renderer.setSize(width, height);
      }
    }, 60);
  }

  bindEvents() {
    const elViewMode = document.getElementById('view-mode-select');
    if (elViewMode) {
      elViewMode.addEventListener('change', (e) => {
        this.setViewMode(e.target.value);
      });
    }

    const elTheme = document.getElementById('theme-select');
    if (elTheme) {
      elTheme.addEventListener('change', (e) => {
        this.currentTheme = e.target.value;
      });
    }

    window.addEventListener('resize', () => {
      this.renderer2D.resize();
    });

    const handlePointer2D = (e) => {
      if (this.isInputLocked) return;
      this.sound.init();
      const cX = e.touches ? e.touches[0].clientX : e.clientX;
      const cY = e.touches ? e.touches[0].clientY : e.clientY;
      const cell = this.renderer2D.getCellFromPos(cX, cY);
      if (cell) this.onCellClicked(cell.r, cell.c);
    };

    this.canvas2D.addEventListener('mousedown', handlePointer2D);
    this.canvas2D.addEventListener('touchstart', (e) => { 
      e.preventDefault(); 
      handlePointer2D(e); 
    }, { passive: false });

    document.getElementById('btn-new-game').addEventListener('click', () => this.resetGame());
    document.getElementById('btn-undo').addEventListener('click', () => this.undoMove());
    document.getElementById('btn-sound').addEventListener('click', () => {
      this.sound.init();
      this.sound.enabled = !this.sound.enabled;
      document.getElementById('icon-sound-on').classList.toggle('hidden', !this.sound.enabled);
      document.getElementById('icon-sound-off').classList.toggle('hidden', this.sound.enabled);
    });

    document.getElementById('mode-select').addEventListener('change', (e) => {
      this.mode = e.target.value;
      const diffGroup = document.getElementById('difficulty-group');
      if (diffGroup) diffGroup.style.display = this.mode === 'pve' ? 'flex' : 'none';
      this.resetGame();
    });

    document.getElementById('ai-difficulty').addEventListener('change', (e) => this.difficulty = e.target.value);
    document.getElementById('anim-speed').addEventListener('change', (e) => this.animSpeedMod = parseFloat(e.target.value));

    const btnStart = document.getElementById('btn-start-game');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        this.sound.init();
        if (this.modalStart) this.modalStart.classList.add('hidden');
      });
    }

    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        if (this.modalGameOver) this.modalGameOver.classList.add('hidden');
        this.resetGame();
      });
    }
  }

  resetGame() {
    this.board = ChessRules.createInitialBoard();
    this.turn = RED;
    this.selectedCell = null;
    this.validMoves = [];
    this.history = [];
    this.combat = null;
    this.isInputLocked = false;
    this.screenShake = 0;
    this.updateUI();

    if (this.renderer3D) {
      this.renderer3D.syncBoard(this.board);
      this.renderer3D.setSelection(null, []);
    }
  }

  updateUI() {
    const isRed = this.turn === RED;
    if (this.elTurn) this.elTurn.className = isRed ? 'turn-red' : 'turn-black';
    if (this.elTurnText) this.elTurnText.textContent = isRed ? 'LƯỢT ĐỎ' : 'LƯỢT ĐEN';

    if (ChessRules.isKingInCheck(this.board, this.turn)) {
      if (this.elAlert) {
        this.elAlert.textContent = isRed ? 'ĐỎ ĐANG BỊ CHIẾU!' : 'ĐEN ĐANG BỊ CHIẾU!';
        this.elAlert.classList.remove('hidden');
      }
      this.sound.playCheckAlert();
    } else {
      if (this.elAlert) this.elAlert.classList.add('hidden');
    }
  }

  onCellClicked(r, c) {
    const piece = this.board[r][c];
    const isMine = piece && ChessRules.getColor(piece) === this.turn;

    if (isMine) {
      this.selectedCell = { r, c };
      this.validMoves = ChessRules.getValidMoves(this.board, this.turn).filter(m => m.from.r === r && m.from.c === c);
      this.sound.playSelect();
      if (this.renderer3D) this.renderer3D.setSelection(this.selectedCell, this.validMoves);
      return;
    }

    if (this.selectedCell) {
      const move = this.validMoves.find(m => m.to.r === r && m.to.c === c);
      if (move) {
        this.executeMove(move);
      } else {
        this.selectedCell = null;
        this.validMoves = [];
        if (this.renderer3D) this.renderer3D.setSelection(null, []);
      }
    }
  }

  async executeMove(move) {
    this.isInputLocked = true;
    this.history.push({ board: ChessRules.cloneBoard(this.board), turn: this.turn });

    const isCapture = move.capture !== null;
    const sPos = this.renderer2D.getBoardCoords(move.from.r, move.from.c);
    const ePos = this.renderer2D.getBoardCoords(move.to.r, move.to.c);
    const pieceType = ChessRules.getType(this.board[move.from.r][move.from.c]);
    const isCannon = pieceType === 'C';

    if (isCapture) {
      if (isCannon) {
        // PHÁO TẤN CÔNG TẦM XA: Bắn đạn nổ tung đối thủ trước, sau đó mới di chuyển tới ô đó
        this.combat = { 
          m: move, sP: sPos, eP: ePos, 
          a: this.board[move.from.r][move.from.c], 
          d: move.capture, 
          p: 0, ph: 'cannon_shoot', hit: false,
          isCannon: true
        };
      } else {
        // CÁC QUÂN CẬN CHIẾN KHÁC: Di chuyển lại gần rồi chém/đâm
        this.combat = { 
          m: move, sP: sPos, eP: ePos, 
          a: this.board[move.from.r][move.from.c], 
          d: move.capture, 
          p: 0, ph: 'move', hit: false,
          isCannon: false
        };
      }

      if (this.renderer3D && this.viewMode === '3d') {
        const attackerMesh = this.renderer3D.pieces3D[move.from.r][move.from.c];
        const defenderMesh = this.renderer3D.pieces3D[move.to.r][move.to.c];
        const aLabel = attackerMesh ? attackerMesh.userData.label : 'Pháo';
        const dLabel = defenderMesh ? defenderMesh.userData.label : 'Quân cờ';
        const targetWorldPos = this.renderer3D.gridToWorld(move.to.r, move.to.c);

        this.renderer3D.triggerActionCam(aLabel, dLabel, targetWorldPos, 1200 / this.animSpeedMod);
        if (isCannon) {
          // 3D: Pháo đứng ngắm bắn rồi mới lướt tới
          setTimeout(() => {
            this.renderer3D.movePiece(move.from, move.to, 450 / this.animSpeedMod, isElephant, isHorse, isChariot);
          }, 700 / this.animSpeedMod);
        } else {
          this.renderer3D.movePiece(move.from, move.to, 350 / this.animSpeedMod);
        }
      }
    } else {
      this.combat = { 
        m: move, sP: sPos, eP: ePos, 
        a: this.board[move.from.r][move.from.c], 
        d: null, 
        p: 0, ph: 'move_only',
        isCannon: false
      };
      this.sound.playMove();

      if (this.renderer3D) {
        this.renderer3D.movePiece(move.from, move.to, 350 / this.animSpeedMod);
      }
    }

    this.selectedCell = null;
    this.validMoves = [];
    if (this.renderer3D) this.renderer3D.setSelection(null, []);
  }

  finalizeMove() {
    const m = this.combat.m;
    this.board[m.to.r][m.to.c] = this.board[m.from.r][m.from.c];
    this.board[m.from.r][m.from.c] = null;
    this.combat = null;

    if (this.renderer3D) {
      this.renderer3D.syncBoard(this.board);
    }

    this.turn = this.turn === RED ? BLACK : RED;
    this.updateUI();

    if (ChessRules.isCheckmate(this.board, this.turn)) {
      this.showGameOver(`CHIẾU BÍ! QUÂN ${this.turn === RED ? 'ĐEN' : 'ĐỎ'} THẮNG!`);
      this.sound.playVictory();
      return;
    } else if (ChessRules.isStalemate(this.board, this.turn)) {
      this.showGameOver('HÒA CỜ! HẾT NƯỚC ĐI.');
      return;
    }

    this.isInputLocked = false;
    if (this.mode === 'pve' && this.turn === BLACK) {
      this.isInputLocked = true;
      setTimeout(() => this.triggerAIMove(), 300);
    }
  }

  triggerAIMove() {
    const move = ChessAI.findBestMove(this.board, BLACK, this.difficulty);
    if (move) this.executeMove(move);
    else this.isInputLocked = false;
  }

  undoMove() {
    if (this.isInputLocked || !this.history.length) return;
    const steps = (this.mode === 'pve' && this.history.length >= 2) ? 2 : 1;
    for (let i = 0; i < steps; i++) {
      if (this.history.length) {
        const last = this.history.pop();
        this.board = last.board;
        this.turn = last.turn;
      }
    }
    this.selectedCell = null;
    this.validMoves = [];
    this.updateUI();
    if (this.renderer3D) {
      this.renderer3D.syncBoard(this.board);
      this.renderer3D.setSelection(null, []);
    }
  }

  showGameOver(msg) {
    if (this.elGameOverTitle) this.elGameOverTitle.textContent = 'TRẬN ĐẤU KẾT THÚC';
    if (this.elGameOverDesc) this.elGameOverDesc.textContent = msg;
    if (this.modalGameOver) this.modalGameOver.classList.remove('hidden');
  }

  loop(time) {
    const dt = (time - this.lastTime) * 0.001 * this.animSpeedMod;
    this.lastTime = time;

    this.particles.update();
    if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 30);

    if (this.combat) {
      const c = this.combat;
      if (c.ph === 'move_only') {
        c.p += dt * 3.5;
        if (c.p >= 1) this.finalizeMove();
      } 
      // === QUÂN CẬN CHIẾN ===
      else if (c.ph === 'move') {
        c.p += dt * 3.0;
        if (c.p >= 1) { c.ph = 'attack'; c.p = 0; }
      } else if (c.ph === 'attack') {
        c.p += dt * 2.5;
        if (c.p > 0.4 && !c.hit) {
          c.hit = true;
          this.screenShake = 12;
          this.sound.playSlash();
          this.particles.emitShockwave(c.eP.x, c.eP.y, '#fff');
        }
        if (c.p >= 1) { c.ph = 'defeat'; c.p = 0; }
      } else if (c.ph === 'defeat') {
        c.p += dt * 2.0;
        if (c.p >= 1) {
          if (c.isCannon) {
            // Đối thủ nổ xong, Pháo mới bắt đầu di chuyển tới vị trí đó
            c.ph = 'cannon_move';
            c.p = 0;
            this.sound.playMove();
          } else {
            this.finalizeMove();
          }
        }
      }
      // === QUÂN PHÁO BẮN TẦM XA ===
      else if (c.ph === 'cannon_shoot') {
        c.p += dt * 2.0; 
        if (c.p >= 0.85 && !c.hit) {
          c.hit = true;
          this.screenShake = 16;
          this.sound.playExplosion();
          const isRed = ChessRules.getColor(c.a) === RED;
          const energyColor = isRed ? '#ff3d00' : '#00e5ff';
          this.particles.emitShockwave(c.eP.x, c.eP.y, energyColor);
          this.particles.emit(c.eP.x, c.eP.y, energyColor, 20, 5, 7);
          this.particles.emit(c.eP.x, c.eP.y, '#ffd700', 12, 4, 5);
        }
        if (c.p >= 1) {
          c.ph = 'defeat';
          c.p = 0;
        }
      }
      else if (c.ph === 'cannon_move') {
        c.p += dt * 3.5;
        if (c.p >= 1) this.finalizeMove();
      }
    }

    this.render2D(time);

    if (this.renderer3D && this.viewMode === '3d') {
      this.renderer3D.render();
    }

    requestAnimationFrame(this.loop.bind(this));
  }

  render2D(time) {
    const ctx = this.renderer2D.ctx;
    ctx.save();
    if (this.screenShake > 0) {
      ctx.translate((Math.random() - 0.5) * this.screenShake, (Math.random() - 0.5) * this.screenShake);
    }

    this.renderer2D.drawBoard(this.currentTheme, time);
    this.renderer2D.drawHighlights(this.selectedCell, this.validMoves);
    const size = this.renderer2D.gridSize, rad = (size / 2) * 0.88;

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.combat && ((r === this.combat.m.from.r && c === this.combat.m.from.c) || (r === this.combat.m.to.r && c === this.combat.m.to.c && this.combat.d))) continue;
        const p = this.board[r][c];
        if (p) {
          CharacterRenderer.drawPiece(
            ctx, p, 
            this.renderer2D.getBoardCoords(r, c).x, 
            this.renderer2D.getBoardCoords(r, c).y, 
            rad, time, 'idle', 0, 
            ChessRules.getType(p) === 'K' && ChessRules.isKingInCheck(this.board, ChessRules.getColor(p))
          );
        }
      }
    }

    if (this.combat) {
      const c = this.combat;
      
      // Vẽ Defender (Quân bị tấn công)
      if (c.d) {
        if (c.ph === 'move' || c.ph === 'attack') {
          let state = 'idle';
          if (c.ph === 'attack' && c.p > 0.4) state = 'hurt';
          CharacterRenderer.drawPiece(ctx, c.d, c.eP.x + (state === 'hurt' ? (Math.random() - 0.5) * 5 : 0), c.eP.y, rad, time, state, 0, false);
        } else if (c.ph === 'cannon_shoot') {
          let state = 'idle';
          if (c.p > 0.85) state = 'hurt'; 
          CharacterRenderer.drawPiece(ctx, c.d, c.eP.x + (state === 'hurt' ? (Math.random() - 0.5) * 6 : 0), c.eP.y, rad, time, state, 0, false);
        } else if (c.ph === 'defeat') {
          CharacterRenderer.drawPiece(ctx, c.d, c.eP.x, c.eP.y, rad, time, 'die', c.p, false);
        }
      }

      // Vẽ Attacker (Quân tấn công)
      if (c.isCannon) {
        if (c.ph === 'cannon_shoot') {
          // Pháo đứng nguyên tại sP ngắm bắn
          CharacterRenderer.drawPiece(ctx, c.a, c.sP.x, c.sP.y, rad, time, 'attack', c.p, false);

          // Vẽ đạn pháo ma thuật bay cầu vồng từ sP đến eP
          if (c.p >= 0.25) {
            const bulletP = Math.min(1, (c.p - 0.25) / 0.65);
            const bx = c.sP.x + (c.eP.x - c.sP.x) * bulletP;
            const by = c.sP.y + (c.eP.y - c.sP.y) * bulletP;
            const arcY = by + Math.sin(bulletP * Math.PI) * -35;

            const isRed = ChessRules.getColor(c.a) === RED;
            const energyColor = isRed ? '#ff3d00' : '#00e5ff';
            const trailColor = isRed ? '#ff9100' : '#80d8ff';

            this.particles.emit(bx, arcY, trailColor, 2, 1.5, 3);

            ctx.save();
            ctx.shadowColor = energyColor;
            ctx.shadowBlur = 16;
            ctx.fillStyle = energyColor;
            ctx.beginPath();
            ctx.arc(bx, arcY, rad * 0.35, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(bx, arcY, rad * 0.18, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        } else if (c.ph === 'defeat') {
          // Đối thủ đang nổ, Pháo đứng yên tại sP
          CharacterRenderer.drawPiece(ctx, c.a, c.sP.x, c.sP.y, rad, time, 'idle', 0, false);
        } else if (c.ph === 'cannon_move') {
          // Đối thủ nổ xong, Pháo mới lướt từ sP sang eP
          const x = c.sP.x + (c.eP.x - c.sP.x) * c.p;
          const y = c.sP.y + (c.eP.y - c.sP.y) * c.p;
          CharacterRenderer.drawPiece(ctx, c.a, x, y, rad, time, 'walk', c.p, false);
        }
      } else {
        // CÁC QUÂN CẬN CHIẾN KHÁC
        if (c.ph === 'move_only') {
          const x = c.sP.x + (c.eP.x - c.sP.x) * c.p;
          const y = c.sP.y + (c.eP.y - c.sP.y) * c.p;
          CharacterRenderer.drawPiece(ctx, c.a, x, y, rad, time, 'walk', c.p, false);
        } else if (c.ph === 'move') {
          const dx = c.eP.x - c.sP.x, dy = c.eP.y - c.sP.y;
          const dist = Math.hypot(dx, dy);
          const stopRatio = Math.max(0, (dist - rad * 1.5) / dist);
          const x = c.sP.x + dx * stopRatio * c.p;
          const y = c.sP.y + dy * stopRatio * c.p;
          CharacterRenderer.drawPiece(ctx, c.a, x, y, rad, time, 'walk', c.p, false);
        } else if (c.ph === 'attack' || c.ph === 'defeat') {
          const dx = c.eP.x - c.sP.x, dy = c.eP.y - c.sP.y;
          const dist = Math.hypot(dx, dy);
          const stopRatio = Math.max(0, (dist - rad * 1.5) / dist);
          const x = c.sP.x + dx * stopRatio;
          const y = c.sP.y + dy * stopRatio;
          CharacterRenderer.drawPiece(ctx, c.a, x, y, rad, time, c.ph === 'attack' ? 'attack' : 'idle', c.ph === 'attack' ? c.p : 0, false);
        }
      }
    }

    this.particles.draw(ctx);
    ctx.restore();
  }
}

// Khởi chạy game khi DOM đã sẵn sàng
window.addEventListener('DOMContentLoaded', () => {
  window.gameInstance = new GameController();
});
