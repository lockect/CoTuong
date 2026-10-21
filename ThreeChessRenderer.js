/**
 * THREE CHESS RENDERER - BỘ KẾT XUẤT 3D CHIẾN TƯỚNG
 */
class ThreeChessRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.cellSize = 2.0; // Khoảng cách giữa 2 giao điểm
    this.pieces3D = Array(10).fill(null).map(() => Array(9).fill(null));

    this.initScene();
    this.initLights();
    this.createBoardMesh();
    this.bindEvents();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#121212');

    // Camera phối cảnh
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.defaultCamPos = { x: 0, y: 22, z: 20 };
    this.camera.position.set(this.defaultCamPos.x, this.defaultCamPos.y, this.defaultCamPos.z);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Bộ điều khiển cảm ứng xoay / zoom bằng ngón tay
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.15; // Không cho camera chìm dưới mặt bàn
    this.controls.minDistance = 8;
    this.controls.maxDistance = 35;
    this.controls.target.set(0, 0, 0);
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 0.9);
    dirLight.position.set(10, 25, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    this.scene.add(dirLight);
  }

  // Chuyển đổi hàng/cột (0-9, 0-8) sang tọa độ thế giới 3D
  gridToWorld(r, c) {
    return {
      x: (c - 4) * this.cellSize,
      y: 0.25, // Độ cao mặt bàn cờ
      z: (r - 4.5) * this.cellSize
    };
  }

  // Dựng mặt bàn cờ 3D và kẻ các đường giao điểm
  createBoardMesh() {
    // 1. Khối đế bàn cờ gỗ
    const boardWidth = 9 * this.cellSize + 1.5;
    const boardHeight = 10 * this.cellSize + 1.5;
    const boardGeo = new THREE.BoxGeometry(boardWidth, 0.5, boardHeight);
    const boardMat = new THREE.MeshStandardMaterial({
      color: 0xba905e,
      roughness: 0.4,
      metalness: 0.1
    });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.y = 0;
    board.receiveShadow = true;
    this.scene.add(board);

    // 2. Kẻ 90 giao điểm bằng đường line
    const lineMat = new THREE.LineBasicMaterial({ color: 0x3e2723, linewidth: 2 });
    const lineGroup = new THREE.Group();

    // 10 đường ngang
    for (let r = 0; r < 10; r++) {
      const p1 = this.gridToWorld(r, 0);
      const p2 = this.gridToWorld(r, 8);
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(p1.x, 0.26, p1.z),
        new THREE.Vector3(p2.x, 0.26, p2.z)
      ]);
      lineGroup.add(new THREE.Line(geo, lineMat));
    }

    // 9 đường dọc (đứt ở sông)
    for (let c = 0; c < 9; c++) {
      // Nửa trên (Đen)
      let pTop1 = this.gridToWorld(0, c), pTop2 = this.gridToWorld(4, c);
      lineGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(pTop1.x, 0.26, pTop1.z), new THREE.Vector3(pTop2.x, 0.26, pTop2.z)
      ]), lineMat));

      // Nửa dưới (Đỏ)
      let pBot1 = this.gridToWorld(5, c), pBot2 = this.gridToWorld(9, c);
      lineGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(pBot1.x, 0.26, pBot1.z), new THREE.Vector3(pBot2.x, 0.26, pBot2.z)
      ]), lineMat));

      // Viền biên nối liền qua sông
      if (c === 0 || c === 8) {
        let pM1 = this.gridToWorld(4, c), pM2 = this.gridToWorld(5, c);
        lineGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(pM1.x, 0.26, pM1.z), new THREE.Vector3(pM2.x, 0.26, pM2.z)
        ]), lineMat));
      }
    }
    this.scene.add(lineGroup);
  }

  // Tạo texture chữ Hán cho mặt quân cờ 3D
  createPieceTexture(text, isRed) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Viền tròn
    ctx.fillStyle = '#f5eedc';
    ctx.beginPath(); ctx.arc(128, 128, 120, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = isRed ? '#d32f2f' : '#1565c0';
    ctx.stroke();

    // Viền phụ
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(128, 128, 105, 0, Math.PI * 2); ctx.stroke();

    // Chữ Hán
    ctx.font = 'bold 110px "KaiTi", "SimSun", serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = isRed ? '#c62828' : '#0d47a1';
    ctx.fillText(text, 128, 132);

    return new THREE.CanvasTexture(canvas);
  }

  // Khởi tạo một quân cờ 3D dạng khối gỗ chạm ngọc
  createPieceMesh(pieceStr) {
    const isRed = pieceStr[0] === 'r';
    const type = pieceStr[1];
    const charMap = {
      'rK':'帥','bK':'將','rA':'仕','bA':'士','rE':'相','bE':'象',
      'rH':'傌','bH':'馬','rR':'俥','bR':'車','rC':'炮','bC':'砲','rP':'兵','bP':'卒'
    };
    const label = charMap[pieceStr] || type;

    const group = new THREE.Group();
    const geo = new THREE.CylinderGeometry(0.75, 0.8, 0.35, 32);
    const topTex = this.createPieceTexture(label, isRed);

    const materials = [
      new THREE.MeshStandardMaterial({ color: isRed ? 0x8b1e0f : 0x1a237e, roughness: 0.4 }), // Cạnh thân
      new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.3 }), // Mặt trên có chữ
      new THREE.MeshStandardMaterial({ color: 0x333333 }) // Mặt đáy
    ];

    const mesh = new THREE.Mesh(geo, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.y = 0.2;
    group.add(mesh);

    group.userData = { pieceStr, label, isRed };
    return group;
  }

  // Đồng bộ toàn bộ bàn cờ 3D từ ma trận logic board[10][9]
  syncBoard(boardState) {
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const pieceStr = boardState[r][c];
        const current3D = this.pieces3D[r][c];

        if (current3D) {
          this.scene.remove(current3D);
          this.pieces3D[r][c] = null;
        }

        if (pieceStr) {
          const meshGroup = this.createPieceMesh(pieceStr);
          const pos = this.gridToWorld(r, c);
          meshGroup.position.set(pos.x, pos.y, pos.z);
          this.scene.add(meshGroup);
          this.pieces3D[r][c] = meshGroup;
        }
      }
    }
  }

  // Nước đi bình thường: Lướt quân 3D mượt mà
  movePiece(from, to, duration = 400) {
    return new Promise((resolve) => {
      const piece = this.pieces3D[from.r][from.c];
      if (!piece) return resolve();

      const targetPos = this.gridToWorld(to.r, to.c);

      // Cập nhật mảng tham chiếu
      this.pieces3D[to.r][to.c] = piece;
      this.pieces3D[from.r][from.c] = null;

      new TWEEN.Tween(piece.position)
        .to({ x: targetPos.x, z: targetPos.z }, duration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(resolve)
        .start();
    });
  }

  // ACTION CAM: Cú zoom điện ảnh khi có nước ăn quân giống Xóm Cờ Vua
  triggerActionCam(attackerName, defenderName, targetPos, duration = 1200) {
    return new Promise((resolve) => {
      // 1. Hiện UI Versus
      const vsCard = document.getElementById('versus-card');
      if (vsCard) {
        document.getElementById('vs-attacker').textContent = attackerName;
        document.getElementById('vs-defender').textContent = defenderName;
        vsCard.style.display = 'flex';
      }

      // 2. Lưu vị trí camera hiện tại và vị trí nhìn
      const startCam = { x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z };
      const startTarget = { x: this.controls.target.x, y: this.controls.target.y, z: this.controls.target.z };

      // Đích đến của camera zoom sát vào điểm va chạm
      const zoomCamPos = {
        x: targetPos.x + 3.5,
        y: targetPos.y + 3.0,
        z: targetPos.z + 4.5
      };

      // Tween phóng tới
      new TWEEN.Tween(this.camera.position)
        .to(zoomCamPos, 350)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();

      new TWEEN.Tween(this.controls.target)
        .to({ x: targetPos.x, y: targetPos.y, z: targetPos.z }, 350)
        .easing(TWEEN.Easing.Cubic.Out)
        .onComplete(() => {
          // Dừng lại xem giao chiến
          setTimeout(() => {
            // Lùi camera về góc nhìn toàn cảnh ban đầu
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
          }, duration * 0.6);
        })
        .start();
    });
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  render() {
    TWEEN.update();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}