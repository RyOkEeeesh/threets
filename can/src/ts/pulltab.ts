import * as THREE from 'three';
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
  import Stats from "stats.js";

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


  const makeCan = (segments = 64 /* 2進数 */) => {

    const round = (n: number) => Math.round(n * 1000) / 1000;
    const vec2 = (x: number, y: number) => new THREE.Vector2(x, y);
    const mapVec2 = (v: THREE.Vector2) =>  vec2(round(v.x), round(v.y));
    const getSegments = (split: number = 1, max: number = 4) => Math.max(Math.floor(Math.sqrt(segments)) / split, max);

    const curve = (start: THREE.Vector2, point: THREE.Vector2, end: THREE.Vector2, seg = getSegments()) => 
      new THREE.QuadraticBezierCurve(
        start,
        point,
        end
      ).getPoints(seg);

    // 1. Shape（輪郭）を定義
    const shape = new THREE.Shape();

    let [x, y] = [0, 0]

    shape.moveTo(x, y);
    shape.lineTo(x += 1, y =  12);
    shape.bezierCurveTo(x, y, x + 1, y += 4, x += 5, y)
    shape.bezierCurveTo(x, y, x + 4, y, x += 5, y -= 4)
    shape.lineTo(x += 1, y = 0);
    shape.lineTo(5, 0);
    shape.lineTo(0, 0); // 閉じる

    // 2. ShapeGeometryで中身を埋める
    const geometry = new THREE.ShapeGeometry(shape);

    const material = new THREE.MeshBasicMaterial({wireframe: true});

    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
  }

  scene.add(makeCan());

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