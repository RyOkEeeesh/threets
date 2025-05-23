import * as THREE from 'three';
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
  import Stats from "stats.js";

  // スタッツを作成
  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);

  const width = window.innerWidth;
  const height = window.innerHeight;

  // WebGPURenderer を使用したとき、不具合が出る場合があるので


  const renderer = new THREE.WebGLRenderer({antialias: true});
  const canvas = renderer.domElement;
  document.body.appendChild(canvas);

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000);
  // renderer.shadowMap.enabled = true; // 影を有効にする

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
  camera.position.z = 200;

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.2;

  const light1 = new THREE.DirectionalLight(0xffffff, 0.5);
  light1.position.set(200, 0, 0);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
  light2.position.set(0, 200, 0);
  scene.add(light2);

  const light3 = new THREE.DirectionalLight(0xffffff, 0.5);
  light3.position.set(0, -200, 0);
  scene.add(light3);



  const makeCan = (segments = 64 /* 2進数 */) => {

    const radius = 33;
    const height = 122;

    let x = 0;
    let y = 0;

    // const p: THREE.Vector2 = new THREE.Vector2();
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

    const group = new THREE.Group();
    // const material = new THREE.MeshBasicMaterial({wireframe: true});
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xb0b0b0, // アルミっぽいグレー
      metalness: 1.0, // 金属感を最大に
      roughness: 0.3, // 少しザラつきのある表面
      reflectivity: 0.8, // 高い反射率
      clearcoat: 0.1, // 表面のコーティング感
      clearcoatRoughness: 0.05
    });


    // 上面設定
    const topRadius = 27; // 上面半径調整用
    const edgsHeight = 1.8;// 飲み口高さ
    const edgsDepth = 5;


    // 底面設定
    const topBottomDifference = 5;
    const legLen = 5;
    const legWeight = 1.5;
    const bottomRadius = topRadius - topBottomDifference;
    const control = 0.5;


    /* 底面 */ {

      const bottomHeight = 11;
      y = bottomHeight;

      const points: THREE.Vector2[] = [
      ...curve(
        vec2(x, y),
        vec2((bottomRadius - control) / 2 + x, y),
        vec2(x = (bottomRadius - control), y = legLen + control),
      ), 
      vec2(x += control, y = legLen),
      vec2(x = Math.floor(x + 1), y = 0.5),
      ...curve(
        vec2(x, y),
        vec2(x + legWeight / 2, -y),
        vec2(x += legWeight, y),
      ),
      ...curve(
        vec2(x, y),
        vec2(x, y + legLen / 2),
        vec2(x = radius - 1, y = legLen + 2)
      )];

      
      const geometry = new THREE.LatheGeometry(points.map(mapVec2), segments);

      geometry.translate(0, 0, 0);
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);

    } /* 側面 */ {

      const topDentSegments = Math.floor(Math.sqrt(segments)); // default 8
      const topDent = 16 - edgsHeight; // へこみ高さ調整用
      const getCosNormalized = (deg: number) => (Math.cos(deg * (Math.PI / 180)) + 1) / 2;
      const points: THREE.Vector2[] = [
      ...curve(
        vec2(x, y),
        vec2(radius - control / 3, y + control / 3),
        vec2(++x, ++y),
        getSegments(2)
      ),
      vec2(x = radius, y),
      vec2(x, y = height - topDent - edgsHeight)
      ];

      const segStep = topDent / topDentSegments;
      let deg = 180;
      const degStep = deg / topDentSegments;
      let tmpX = 0;

      for (let seg = 1; seg <= topDentSegments; seg++) points.push(vec2(
        tmpX = x - getCosNormalized(deg + degStep * seg) * (radius - topRadius),
        y += segStep
      ));
      x = tmpX;

      points.push(vec2(topRadius, height));

      const geometry = new THREE.LatheGeometry(points.map(mapVec2), segments);
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);

    } /* 上面 */ {

      const points: THREE.Vector2[] = [
        vec2(x, y),
        ...curve(
          vec2(x, y),
          vec2(x + control / 2, y - 0.2),
          vec2(x += control, y),
          getSegments(2)
        ), ...curve(
          vec2(x, y),
          vec2(x + 0.2, y + (height - y) / 2),
          vec2(x,  y = height),
          getSegments(2)
        ), ...curve(
          vec2(x, y),
          vec2(x - (x - topRadius) / 2, y + 0.2),
          vec2(x = topRadius, y),
          getSegments(2)
        ),
        vec2(x -= control, y = height - edgsDepth + control),
        ...curve(
          vec2(x, y),
          vec2(x - control / 6, y - 1),
          vec2(x -= control / 2, y -= 0.3),
        ), ...curve(
          vec2(x, y),
          vec2(x, y + 1),
          vec2(x -= 0.3, ++y),
        ), ...curve(
          vec2(x, y),
          vec2(x / 2, y += 1.5),
          vec2(0, y)
        )
      ];

      const geometry = new THREE.LatheGeometry(points.map(mapVec2), segments);
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);

    }

    group.position.set(0, -height / 2, 0);

    return group;
  }

  scene.add(makeCan(128));

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