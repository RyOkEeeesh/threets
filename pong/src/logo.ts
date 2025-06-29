import { App, txtMesh, TC } from './module'
import Stats from "stats.js";

// スタッツを作成
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const app = new App({
  backgroundColor: 0x38393c,
  cameraPosition: { z: 2 },
  controls: true,
  composer: true
});


const txt = new txtMesh(['./font/mplus.json']);

const text = await txt.loadMultilineText(
  '加地',
  {
    fontURL: './font/mplus.json',
    geometryOption: {
      depth: 0.1
    },
    materialOption: {
      color: 0x7fba00,
      emissive: 0xa6a6a7,
      emissiveIntensity: 1, // 自発光の強さ
      metalness: 0, // 金属っぽさ 0 : プラスチック　1 : 金属
      roughness: 0 // 表面の粗さ 0: つるつる　1 : ざらざら
    }
  }
);

app.addScene(text);

TC.centerObject(text);

app.onBeforeRender(() => stats.begin());
app.onAfterRender(() => stats.end());

app.start();

// txt.updateText(
//   text,
//   'KAJI',
//   {
//     geometryOption: {
//       depth: 0.1
//     },
//     materialOption: {
//       color: 0x7fba00,
//       emissive: 0xa6a6a7,
//       emissiveIntensity: 1, // 自発光の強さ
//       metalness: 0, // 金属っぽさ 0 : プラスチック　1 : 金属
//       roughness: 0 // 表面の粗さ 0: つるつる　1 : ざらざら
//     }
//   }
// );