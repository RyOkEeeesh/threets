import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "stats.js";
import { CSG } from 'three-csg-ts';


// スタッツを作成
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const width = window.innerWidth;
const height = window.innerHeight;

const renderer = new THREE.WebGLRenderer({antialias: true});
const canvas = renderer.domElement;
document.body.appendChild(canvas);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);
renderer.setClearColor(0x000000);
// renderer.shadowMap.enabled = true; // 影を有効にする

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
camera.position.z = 50;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.2;

const light1 = new THREE.DirectionalLight(0xffffff, 0.5);
light1.position.set(200, 0, 0);
scene.add(light1);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const shape = new THREE.Shape();

const pullTabWidth: number = 9;
const pullTabHeight: number = 22;
let [x, y] = [0, pullTabHeight / 2]

shape.moveTo(x, y);
shape.bezierCurveTo(x, y, -pullTabWidth / 2, y, x -= pullTabWidth / 2, y = 5);
shape.lineTo(x, y = 0);
shape.bezierCurveTo(x, y, x - 3, y -= pullTabHeight / 2, x = 0, y);
const points: THREE.Vector2[] = shape.getPoints().map(p => new THREE.Vector2(p.x, p.y));
for (let i: number = 0; i < points.length; i++) shape.lineTo(-points[points.length - 1 - i].x, points[points.length - 1 - i].y)


const offsetShapePoints = (points: THREE.Vector2[], offsetDistance: number) => {
  const offsetPoints = [];

  for (let i = 0; i < points.length; i++) {
    const prev = points[(i - 1 + points.length) % points.length];
    const curr = points[i];
    const next = points[(i + 1) % points.length];

    // 前後のエッジベクトル
    const v1 = new THREE.Vector2().subVectors(curr, prev).normalize();
    const v2 = new THREE.Vector2().subVectors(next, curr).normalize();

    // 法線ベクトル（左手系）
    const n1 = new THREE.Vector2(-v1.y, v1.x);
    const n2 = new THREE.Vector2(-v2.y, v2.x);

    // 平均法線
    const normal = new THREE.Vector2().addVectors(n1, n2).normalize();

    // オフセット
    const offsetPoint = new THREE.Vector2().addVectors(curr, normal.multiplyScalar(-offsetDistance));
    offsetPoints.push(offsetPoint);
  }

  return offsetPoints;
}


const scale = 0.5;

const originalPoints = shape.getPoints();
const scaledPoints = offsetShapePoints(originalPoints, scale);

const enlargedShape = new THREE.Shape();
enlargedShape.moveTo(scaledPoints[0].x, scaledPoints[0].y);
for (let i = 1; i < scaledPoints.length; i++) enlargedShape.lineTo(scaledPoints[i].x, scaledPoints[i].y);
enlargedShape.holes.push(shape);

const outerGeometry = new THREE.ShapeGeometry(enlargedShape);

const positionAttr = outerGeometry.attributes.position;

positionAttr.needsUpdate = true;

const geometry = new THREE.ShapeGeometry(shape);

// // メッシュを作成
const outerMesh = new THREE.Mesh(outerGeometry, new THREE.MeshBasicMaterial({wireframe: true}));
const innerMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({wireframe: true}));

// const result = CSG.union(innerMesh, outerMesh);

// scene.add(innerMesh);
scene.add(outerMesh);

window.onresize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
};

const draw = () => {
  stats.begin();
  renderer.render(scene, camera);
  stats.end();
  requestAnimationFrame(draw);
};

draw();