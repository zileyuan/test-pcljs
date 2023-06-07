import * as PCL from "pcl.js";
import PointCloudViewer from "pcl.js/PointCloudViewer";

import pkg from "./package.json";

const PCL_VERSION = pkg.dependencies["pcl.js"].replace("^", "");
let cloud;
let cloudFiltered;
let viewer;

main();

async function main() {
  const cloudBuffer = await fetch("./ch1_backgroud.ot.bin.pcd").then((res) =>
    res.arrayBuffer()
  );

  await PCL.init({
    url: `https://cdn.jsdelivr.net/npm/pcl.js@${PCL_VERSION}/dist/pcl-core.wasm`
  });

  cloud = PCL.loadPCDData(cloudBuffer, PCL.PointXYZ);

  const start = Date.now();
  const sor = new PCL.StatisticalOutlierRemoval();
  sor.setInputCloud(cloud);
  sor.setMeanK(40);
  sor.setStddevMulThresh(1.0);
  cloudFiltered = sor.filter();

  console.log((Date.now() - start) / 1000);

  document.getElementById("progress").style.display = "none";
  document.getElementById("container").style.display = "block";

  showPointCloud();
  bindEvent();
}

function showPointCloud() {
  viewer = new PointCloudViewer(
    document.getElementById("canvas"),
    window.innerWidth,
    window.innerHeight
  );

  viewer.addPointCloud(cloud);
  viewer.setPointCloudProperties({ color: "#F00" });
  viewer.setAxesHelper({ visible: true, size: 1 });
  viewer.setCameraParameters({ position: { x: 0, y: 0, z: 1.5 } });
  window.addEventListener("resize", () => {
    viewer.setSize(window.innerWidth, window.innerHeight);
  });
}

function bindEvent() {
  const radioOriginal = document.getElementById("original");
  const radioFiltered = document.getElementById("filtered");

  [radioOriginal, radioFiltered].forEach((el) => {
    el.addEventListener("change", (e) => {
      const mode = e.target.id;
      switch (mode) {
        case "original":
          viewer.addPointCloud(cloud);
          viewer.setPointCloudProperties({ color: "#F00" });
          break;
        case "filtered":
          viewer.addPointCloud(cloudFiltered);
          viewer.setPointCloudProperties({ color: "#0F0" });
          break;
      }
    });
  });
}
