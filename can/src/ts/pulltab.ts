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






const makeCan = (segments = 64 /* 2進数 */) => {

    const radius = 33;
    const height = 122;

    let x = 0;
    let y = 0;

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
    const material = new THREE.MeshStandardMaterial({wireframe: false});
    // const material = new THREE.MeshPhysicalMaterial({
    //   color: 0xb0b0b0, // アルミっぽいグレー
    //   metalness: 1.0, // 金属感を最大に
    //   roughness: 0.3, // 少しザラつきのある表面
    //   reflectivity: 0.8, // 高い反射率
    //   clearcoat: 0.1, // 表面のコーティング感
    //   clearcoatRoughness: 0.05
    // });


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
          vec2(x / 2, y += 0.5),
          vec2(0, y)
        )
      ];

      const shape = new THREE.Shape();

      const pullTabWidth: number = 9;
      const pullTabHeight: number = 22;

      shape.moveTo(x = 0, y = pullTabHeight / 2);
      shape.bezierCurveTo(x, y, -pullTabWidth / 2, y, x -= pullTabWidth / 2, y = 5);
      shape.lineTo(x, y = 0);
      shape.bezierCurveTo(x, y, x - 3, y -= pullTabHeight / 2, x = 0, y);
      const p: THREE.Vector2[] = shape.getPoints().map(p => new THREE.Vector2(p.x, p.y));
      for (let i: number = 0; i < p.length; i++) shape.lineTo(-p[p.length - 1 - i].x, p[p.length - 1 - i].y)

      const extrudeSettings = {
        depth: 0.85,
        bevelEnabled: false
      };

      const pullGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

      // 頂点を操作して逆台形に変形
      const position = pullGeometry.attributes.position;
      const vertex = new THREE.Vector3();

      for (let i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(position, i);

        const scale = 1 - (vertex.z / extrudeSettings.depth) * 0.15;
        vertex.x *= scale;
        vertex.y *= scale;

        position.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }

      pullGeometry.computeVertexNormals();

      const pMesh = new THREE.Mesh(pullGeometry, material);
      pMesh.updateMatrixWorld();


      const geometry = new THREE.LatheGeometry(points.map(mapVec2), segments);
      const mesh = new THREE.Mesh(geometry, material);

      
      // ワールド座標に変換
      mesh.updateMatrixWorld(true);
      pMesh.updateMatrixWorld(true);

      // ジオメトリをワールド座標に適用
      const meshClone = mesh.clone();
      meshClone.geometry = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
      meshClone.position.set(0, 0, 0);
      meshClone.rotation.set(0, 0, 0);
      meshClone.scale.set(1, 1, 1);

      const pMeshClone = pMesh.clone();
      pMeshClone.geometry = pMesh.geometry.clone().applyMatrix4(pMesh.matrixWorld);
      pMeshClone.position.set(0, height - 2.9, 0);
      pMeshClone.rotation.set(Math.PI / 2, 0, 0);
      pMeshClone.scale.set(2.4, 2.4, 1)
      pMeshClone.updateMatrixWorld(true);

      // group.add(pMeshClone);


      // CSG演算
      const resultMesh = CSG.subtract(meshClone, pMeshClone);
      console.log(resultMesh.geometry.attributes.position.count);


      // マテリアルを再適用（必要に応じて）
      resultMesh.material = material;

      // グループに追加
      group.add(resultMesh);
      // group.add(meshClone);
      // group.add(pMeshClone);


    }

    group.position.set(0, -height / 2, 0);

    return group;
  }









// const offsetShapePoints = (points: THREE.Vector2[], offsetDistance: number) => {
//   const offsetPoints = [];

//   for (let i = 0; i < points.length; i++) {
//     const prev = points[(i - 1 + points.length) % points.length];
//     const curr = points[i];
//     const next = points[(i + 1) % points.length];

//     // 前後のエッジベクトル
//     const v1 = new THREE.Vector2().subVectors(curr, prev).normalize();
//     const v2 = new THREE.Vector2().subVectors(next, curr).normalize();

//     // 法線ベクトル（左手系）
//     const n1 = new THREE.Vector2(-v1.y, v1.x);
//     const n2 = new THREE.Vector2(-v2.y, v2.x);

//     // 平均法線
//     const normal = new THREE.Vector2().addVectors(n1, n2).normalize();

//     // オフセット
//     const offsetPoint = new THREE.Vector2().addVectors(curr, normal.multiplyScalar(-offsetDistance));
//     offsetPoints.push(offsetPoint);
//   }

//   return offsetPoints;
// }

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