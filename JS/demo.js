var scene, camera, renderer, mesh;
var keyboard = {};
var player = { height: 0.5, speed: 0.2, turnSpeed: Math.PI * 0.02 };
var crate, crateTexture, crateNormalMap, crateBumpMap;
var meshFloor;
var USE_WIREFRAME = false;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer();
  document.body.appendChild(renderer.domElement);
  meshFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 10, 10),
    new THREE.MeshPhongMaterial({ color: "white", wireframe: USE_WIREFRAME })
  );
  meshFloor.rotation.x -= Math.PI / 2;
  meshFloor.receiveShadow = true;
  scene.add(meshFloor);
  mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshPhongMaterial({ color: "orange", wireframe: USE_WIREFRAME })
  );

  mesh.position.y += 1;
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  scene.add(mesh);

  ambienLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambienLight);

  light = new THREE.PointLight(0xffffff, 1, 40);
  light.position.set(-3, 6, -3);
  light.castShadow = true;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 25;
  scene.add(light);

  var textureLoader = new THREE.TextureLoader();
  crateTexture = new textureLoader.load("crate0/crate0_diffuse.png");
  crateBumpMap = new textureLoader.load("crate0/crate0_bump.png");
  crateNormalMap = new textureLoader.load("crate0/crate0_normal.png");

  crate = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshPhongMaterial({
      color: 0xffffff,
      map: crateTexture,
      bumpMap: crateBumpMap,
      normalMap: crateNormalMap
    })
  );
  scene.add(crate);
  crate.position.set(2.5, 3 / 2, 2.5);

  crate.receiveShadow = true;
  crate.castShadow = true;

  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.load("models/Tent_Poles_01.mtl", function(material) {
    material.preload();
    var objLoaderer = new THREE.OBJLoader();
    objLoaderer.setMaterials(material);
    objLoaderer.load("models/Tent_Poles_01.obj", function(mesh) {
      mesh.traverse(function(node) {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
      scene.add(mesh);
      mesh.position.set(-5, 0, 4);
      mesh.rotation.y = -Math.PI / 4;
    });
  });

  camera.position.set(0, player.height, -5);
  camera.lookAt(new THREE.Vector3(0, player.height, 0));

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  animate();
}
function animate() {
  requestAnimationFrame(animate);

  mesh.rotation.x += 0.02;
  mesh.rotation.y += 0.01;
  crate.rotation.y += 0.01;
  if (keyboard[87]) {
    //key = W
    camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
    camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
  }
  if (keyboard[83]) {
    //key = S
    camera.position.x += Math.sin(camera.rotation.y) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
  }
  if (keyboard[65]) {
    //key = A
    camera.position.x +=
      Math.sin(camera.rotation.y + Math.PI / 2) * player.speed;
    camera.position.z +=
      -Math.cos(camera.rotation.y + Math.PI / 2) * player.speed;
  }

  if (keyboard[68]) {
    //key = D
    camera.position.x +=
      Math.sin(camera.rotation.y - Math.PI / 2) * player.speed;
    camera.position.z +=
      -Math.cos(camera.rotation.y - Math.PI / 2) * player.speed;
  }

  if (keyboard[37]) {
    camera.rotation.y -= player.turnSpeed;
  }
  if (keyboard[39]) {
    camera.rotation.y += player.turnSpeed;
  }

  renderer.render(scene, camera);
}

function keyDown(event) {
  keyboard[event.keyCode] = true;
}

function keyUp(event) {
  keyboard[event.keyCode] = false;
}
window.addEventListener("keydown", keyDown);
window.addEventListener("keyup", keyUp);

window.onload = init;
