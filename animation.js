// シーンの設定
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// カメラの設定
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// レンダラーの設定
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// テクスチャローダーの作成
const textureLoader = new THREE.TextureLoader();

// 楕円形のテクスチャを作成（モーションブラー効果用）
function createBlurTexture(color, aspectRatio = 1.0, size = 1.0) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // キャンバスサイズを設定（大きいほどブラーの質が向上）
    canvas.width = 256;
    canvas.height = 256;
    
    // グラデーションの作成
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radiusX = size * 64 * aspectRatio; // 横方向の半径
    const radiusY = size * 64; // 縦方向の半径
    
    // 背景をクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 楕円形のグラデーションを描画
    ctx.save();
    ctx.beginPath();
    ctx.translate(centerX, centerY);
    ctx.scale(aspectRatio, 1);
    ctx.arc(0, 0, radiusY, 0, Math.PI * 2, false);
    ctx.restore();
    
    // グラデーションを設定
    const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radiusY * (aspectRatio > 1 ? 1 : aspectRatio)
    );
    
    // 透明のグラデーションを設定
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.3, color.replace('1.0)', '0.7)'));
    gradient.addColorStop(0.7, color.replace('1.0)', '0.3)'));
    gradient.addColorStop(1, color.replace('1.0)', '0.0)'));
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // テクスチャを作成
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// 炎のテクスチャ
const fireTexture = createBlurTexture('rgba(255, 180, 50, 1.0)', 1.0, 1.5);
// 水のテクスチャ - 縦長の楕円でモーションブラーを表現
const waterTexture = createBlurTexture('rgba(50, 150, 255, 1.0)', 0.6, 2.0);
// 煙のテクスチャ - より大きなブラー
const smokeTexture = createBlurTexture('rgba(200, 200, 200, 1.0)', 1.0, 2.5);

// 光源の設定
const ambientLight = new THREE.AmbientLight(0x202020);
scene.add(ambientLight);

const fireLight = new THREE.PointLight(0xff7700, 1.5, 10, 1.5);
fireLight.position.set(0, 0, 2);
scene.add(fireLight);

// 炎のパーティクルシステム - 大幅に増加
const particleCount = 800;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);
const rotations = new Float32Array(particleCount);
const velocities = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    // 初期位置 - より広範囲に
    positions[i * 3] = (Math.random() - 0.5) * 2.5;
    positions[i * 3 + 1] = Math.random() * 2.5 - 1.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
    
    // 炎の色（赤から黄色）
    colors[i * 3] = Math.random() * 0.3 + 0.7; // 赤
    colors[i * 3 + 1] = Math.random() * 0.5; // 緑
    colors[i * 3 + 2] = Math.random() * 0.1; // 青
    
    // パーティクルのサイズ（大きめに設定）
    sizes[i] = Math.random() * 0.8 + 0.4;
    
    // 回転角度（ランダム）
    rotations[i] = Math.random() * Math.PI * 2;
    
    // 移動速度（上向き中心）
    velocities[i * 3] = (Math.random() - 0.5) * 0.05;
    velocities[i * 3 + 1] = Math.random() * 0.1 + 0.02;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

// パーティクルマテリアル（テクスチャを使用）
const particleMaterial = new THREE.PointsMaterial({
    size: 0.8,
    map: fireTexture,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    sizeAttenuation: true
});

// パーティクルシステムの作成
const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// 煙のパーティクルシステム
const smokeCount = 600;
const smokeParticles = new THREE.BufferGeometry();
const smokePositions = new Float32Array(smokeCount * 3);
const smokeColors = new Float32Array(smokeCount * 3);
const smokeSizes = new Float32Array(smokeCount);
const smokeVelocities = new Float32Array(smokeCount * 3);

for (let i = 0; i < smokeCount; i++) {
    smokePositions[i * 3] = (Math.random() - 0.5) * 4;
    smokePositions[i * 3 + 1] = Math.random() * 3 + 1;
    smokePositions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    
    // 煙の色（灰色）
    smokeColors[i * 3] = 0.6; // 赤
    smokeColors[i * 3 + 1] = 0.6; // 緑
    smokeColors[i * 3 + 2] = 0.6; // 青
    
    smokeSizes[i] = Math.random() * 1.2 + 0.6;
    
    // 移動速度（上向き中心）
    smokeVelocities[i * 3] = (Math.random() - 0.5) * 0.03;
    smokeVelocities[i * 3 + 1] = Math.random() * 0.05 + 0.01;
    smokeVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
}

smokeParticles.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
smokeParticles.setAttribute('color', new THREE.BufferAttribute(smokeColors, 3));
smokeParticles.setAttribute('size', new THREE.BufferAttribute(smokeSizes, 1));

const smokeMaterial = new THREE.PointsMaterial({
    size: 1.0,
    map: smokeTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    sizeAttenuation: true
});

const smokeSystem = new THREE.Points(smokeParticles, smokeMaterial);
scene.add(smokeSystem);

// 水のパーティクルシステム
const waterCount = 1000;
const waterParticles = new THREE.BufferGeometry();
const waterPositions = new Float32Array(waterCount * 3);
const waterColors = new Float32Array(waterCount * 3);
const waterSizes = new Float32Array(waterCount);
const waterRotations = new Float32Array(waterCount);
const waterVelocities = new Float32Array(waterCount * 3);
const waterAspectRatios = new Float32Array(waterCount);

for (let i = 0; i < waterCount; i++) {
    waterPositions[i * 3] = (Math.random() - 0.5) * 5;
    waterPositions[i * 3 + 1] = Math.random() * 6 + 3;
    waterPositions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    
    // 水の色（青）
    waterColors[i * 3] = 0.1; // 赤
    waterColors[i * 3 + 1] = 0.5 + Math.random() * 0.3; // 緑
    waterColors[i * 3 + 2] = 0.8 + Math.random() * 0.2; // 青
    
    waterSizes[i] = Math.random() * 0.6 + 0.3;
    
    // 回転角度（下向き中心）
    waterRotations[i] = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
    
    // 移動速度（下向き）
    waterVelocities[i * 3] = (Math.random() - 0.5) * 0.05;
    waterVelocities[i * 3 + 1] = -(Math.random() * 0.15 + 0.1);
    waterVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
    
    // テクスチャのアスペクト比（縦長）
    waterAspectRatios[i] = 0.4 + Math.random() * 0.3;
}

waterParticles.setAttribute('position', new THREE.BufferAttribute(waterPositions, 3));
waterParticles.setAttribute('color', new THREE.BufferAttribute(waterColors, 3));
waterParticles.setAttribute('size', new THREE.BufferAttribute(waterSizes, 1));

const waterMaterial = new THREE.PointsMaterial({
    size: 0.8,
    map: waterTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
});

const waterSystem = new THREE.Points(waterParticles, waterMaterial);
scene.add(waterSystem);

// 台座（火元）の作成
const baseGeometry = new THREE.CylinderGeometry(1.2, 1.4, 0.5, 32);
const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
const base = new THREE.Mesh(baseGeometry, baseMaterial);
base.position.y = -1.5;
scene.add(base);

// アニメーションの状態
let state = 'fire'; // fire, water
let transitionTime = 0;
let lastTime = 0;

// イベントリスナー
window.addEventListener('resize', onWindowResize);
document.addEventListener('click', toggleState);
document.addEventListener('touchstart', toggleState);

function toggleState() {
    if (state === 'fire') {
        state = 'water';
        transitionTime = 0;
    } else {
        state = 'fire';
        transitionTime = 0;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 炎のアニメーション
function animateFire(deltaTime) {
    const positions = particleSystem.geometry.attributes.position.array;
    const colors = particleSystem.geometry.attributes.color.array;
    const sizes = particleSystem.geometry.attributes.size.array;
    
    // 発生地点（火元）の定義
    const originY = -1.0;
    
    for (let i = 0; i < particleCount; i++) {
        // 速度に基づいて位置を更新
        positions[i * 3] += velocities[i * 3] * deltaTime * 60;
        positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime * 60;
        positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime * 60;
        
        // 速度をわずかに変化させる（揺らぎを表現） - 水平方向の揺らぎを減らす
        velocities[i * 3] += (Math.random() - 0.5) * 0.003;
        velocities[i * 3 + 2] += (Math.random() - 0.5) * 0.003;
        
        // 上方向への力を追加（上昇力を強める）
        velocities[i * 3 + 1] += 0.0005;
        
        // 左右にゆらぐ
        positions[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.01 * deltaTime * 60;
        
        // 発生地点からの距離を計算
        const dx = positions[i * 3];
        const dy = positions[i * 3 + 1] - originY;
        const dz = positions[i * 3 + 2];
        const distanceFromOrigin = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        // 距離に基づいてエフェクトを調整
        const distanceFactor = Math.max(0.2, 1.2 - distanceFromOrigin / 4.0);
        
        // 炎の先端ほど明るく（高さと距離の両方を考慮）
        const brightness = Math.min((positions[i * 3 + 1] / 3 + 0.5) * distanceFactor, 1.0);
        colors[i * 3] = brightness; // 赤
        colors[i * 3 + 1] = brightness * 0.7; // 緑
        
        // サイズを距離に応じて調整（発生地点から離れるほど小さく）
        const baseSize = Math.max(0.2, distanceFactor * 0.8) + Math.random() * 0.2 * distanceFactor;
        sizes[i] = baseSize;
        
        // モーションブラーの方向を速度に合わせる
        const speed = Math.sqrt(
            velocities[i * 3] * velocities[i * 3] + 
            velocities[i * 3 + 1] * velocities[i * 3 + 1] + 
            velocities[i * 3 + 2] * velocities[i * 3 + 2]
        );
        
        // 速度に応じてサイズを増加（モーションブラー効果）
        // 発生地点から離れるほどブラー効果を小さく
        const blurIntensity = 1 + speed * 3 * distanceFactor;
        sizes[i] *= blurIntensity;
        
        // 一定の高さを超えたら下に戻す
        if (positions[i * 3 + 1] > 3 || Math.random() > 0.997) {
            positions[i * 3] = (Math.random() - 0.5) * 1.8;
            positions[i * 3 + 1] = Math.random() * 0.5 - 1.5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
            sizes[i] = Math.random() * 0.8 + 0.4;
            
            // 速度をリセット（上向き中心、水平速度を減らす）
            velocities[i * 3] = (Math.random() - 0.5) * 0.03;
            velocities[i * 3 + 1] = Math.random() * 0.15 + 0.05; // 上向きの力を強める
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
        }
    }
    
    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.geometry.attributes.color.needsUpdate = true;
    particleSystem.geometry.attributes.size.needsUpdate = true;
}

// 水のアニメーション
function animateWater(deltaTime) {
    const positions = waterSystem.geometry.attributes.position.array;
    const sizes = waterSystem.geometry.attributes.size.array;
    const colors = waterSystem.geometry.attributes.color.array;
    
    for (let i = 0; i < waterCount; i++) {
        // 速度に基づいて位置を更新（より垂直な動きに）
        positions[i * 3] += waterVelocities[i * 3] * deltaTime * 60;
        positions[i * 3 + 1] += waterVelocities[i * 3 + 1] * deltaTime * 60;
        positions[i * 3 + 2] += waterVelocities[i * 3 + 2] * deltaTime * 60;
        
        // 重力で加速（雨の効果を強める）
        waterVelocities[i * 3 + 1] -= 0.002 * deltaTime * 60;
        
        // 雨粒なのでわずかな横の動きのみ（風の効果）
        waterVelocities[i * 3] = waterVelocities[i * 3] * 0.99 + (Math.random() - 0.5) * 0.001;
        waterVelocities[i * 3 + 2] = waterVelocities[i * 3 + 2] * 0.99 + (Math.random() - 0.5) * 0.001;
        
        // 速度に応じたモーションブラー効果を強化
        const speed = Math.abs(waterVelocities[i * 3 + 1]);
        
        // 速度に応じてサイズを調整（雨滴は細長く）
        sizes[i] = Math.min(1.8, Math.max(0.2, 0.3 + speed * 8));
        
        // 速度が速いほど薄く明るく
        const brightness = Math.min(1.0, 0.6 + speed * 2);
        colors[i * 3] = 0.1 * brightness; // 赤
        colors[i * 3 + 1] = 0.5 * brightness; // 緑
        colors[i * 3 + 2] = 0.9 * brightness; // 青（より青みがかった色に）
        
        // 地面に当たったら新しい雨滴を生成
        if (positions[i * 3 + 1] < -1) {
            // 上部から新しい雨滴を生成
            positions[i * 3 + 1] = Math.random() * 6 + 3;
            positions[i * 3] = (Math.random() - 0.5) * 5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
            
            // 雨滴は細く小さく
            sizes[i] = Math.random() * 0.4 + 0.2;
            
            // 速度をリセット（ほぼ垂直方向に）
            waterVelocities[i * 3] = (Math.random() - 0.5) * 0.03;
            waterVelocities[i * 3 + 1] = -(Math.random() * 0.25 + 0.15); // より速く
            waterVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
        }
    }
    
    waterSystem.geometry.attributes.position.needsUpdate = true;
    waterSystem.geometry.attributes.size.needsUpdate = true;
    waterSystem.geometry.attributes.color.needsUpdate = true;
}

// 煙のアニメーション
function animateSmoke(deltaTime) {
    const positions = smokeSystem.geometry.attributes.position.array;
    const colors = smokeSystem.geometry.attributes.color.array;
    const sizes = smokeSystem.geometry.attributes.size.array;
    
    for (let i = 0; i < smokeCount; i++) {
        // 速度に基づいて位置を更新
        positions[i * 3] += smokeVelocities[i * 3] * deltaTime * 60;
        positions[i * 3 + 1] += smokeVelocities[i * 3 + 1] * deltaTime * 60;
        positions[i * 3 + 2] += smokeVelocities[i * 3 + 2] * deltaTime * 60;
        
        // 左右に拡散
        positions[i * 3] += Math.sin(Date.now() * 0.0005 + i) * 0.01 * deltaTime * 60;
        positions[i * 3 + 2] += Math.cos(Date.now() * 0.0005 + i) * 0.01 * deltaTime * 60;
        
        // 高さに応じて透明に、サイズも大きく
        const alpha = Math.max(0, 1 - (positions[i * 3 + 1] / 6));
        colors[i * 3] = 0.5 * alpha;
        colors[i * 3 + 1] = 0.5 * alpha;
        colors[i * 3 + 2] = 0.5 * alpha;
        
        // 上昇するにつれてサイズを大きく
        sizes[i] = Math.min(2.0, sizes[i] + 0.002 * deltaTime * 60);
        
        // 一定の高さを超えたら下に戻す
        if (positions[i * 3 + 1] > 6 || Math.random() > 0.997) {
            positions[i * 3] = (Math.random() - 0.5) * 4;
            positions[i * 3 + 1] = Math.random() * 2 - 0.5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
            sizes[i] = Math.random() * 1.2 + 0.6;
            
            // 速度をリセット
            smokeVelocities[i * 3] = (Math.random() - 0.5) * 0.03;
            smokeVelocities[i * 3 + 1] = Math.random() * 0.05 + 0.01;
            smokeVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
        }
    }
    
    smokeSystem.geometry.attributes.position.needsUpdate = true;
    smokeSystem.geometry.attributes.color.needsUpdate = true;
    smokeSystem.geometry.attributes.size.needsUpdate = true;
}

// アニメーションループ
function animate(time) {
    requestAnimationFrame(animate);
    
    // デルタタイム計算（フレームレート非依存のアニメーション）
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;
    
    // 極端なデルタタイムを防止（例：ブラウザのタブが非アクティブだった場合）
    const cappedDeltaTime = Math.min(deltaTime, 0.1);
    
    // 炎の揺らぎアニメーション
    if (state === 'fire' || particleMaterial.opacity > 0) {
        animateFire(cappedDeltaTime);
    }
    
    // 水のアニメーション
    if (state === 'water' && waterMaterial.opacity > 0) {
        animateWater(cappedDeltaTime);
    }
    
    // 煙のアニメーション
    if (smokeMaterial.opacity > 0) {
        animateSmoke(cappedDeltaTime);
    }
    
    // 状態遷移のアニメーション
    transitionTime += 0.01 * cappedDeltaTime * 60;
    if (state === 'fire') {
        // 炎の光を明るく
        fireLight.intensity = Math.min(2.0, transitionTime * 2.0);
        
        // 炎を表示
        particleMaterial.opacity = Math.min(1, transitionTime);
        
        // 水を消す
        waterMaterial.opacity = Math.max(0, 1 - transitionTime * 2);
        
        // 煙を徐々に消す
        smokeMaterial.opacity = Math.max(0, 1 - transitionTime);
    } else if (state === 'water') {
        // 水を表示
        waterMaterial.opacity = Math.min(1, transitionTime);
        
        // 炎を消す
        particleMaterial.opacity = Math.max(0, 1 - transitionTime * 2);
        
        // 煙を表示
        smokeMaterial.opacity = Math.min(0.8, transitionTime);
        
        // 炎の光を暗く
        fireLight.intensity = Math.max(0, 2.0 - transitionTime * 2);
    }
    
    // カメラをゆっくり回転
    camera.position.x = Math.sin(time * 0.0003) * 5;
    camera.position.z = Math.cos(time * 0.0003) * 5;
    camera.lookAt(0, 0, 0);
    
    renderer.render(scene, camera);
}

animate(0);