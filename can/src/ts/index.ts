import * as THREE from 'three';
import Stats from 'stats.js';
import { CSG } from 'three-csg-ts';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Stats.js の初期化
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb
document.body.appendChild(stats.dom);

// Three.js の基本セットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.2;

// CSG用のジオメトリ作成
const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshNormalMaterial());
box.position.set(1, 0, 0); // 任意の位置に移動
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), new THREE.MeshNormalMaterial());
sphere.position.set(1, 0.3, 0.3);

box.updateMatrix();
sphere.updateMatrix();

// CSG演算（減算）
const result = CSG.subtract(box, sphere);
scene.add(result);

camera.position.z = 3;

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  stats.update();
  renderer.render(scene, camera);
}
animate();