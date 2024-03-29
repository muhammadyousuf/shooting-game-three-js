var scene, camera, renderer, mesh, clock;
var keyboard = {};
var player = { height: 0.5, speed: 0.2, turnSpeed: Math.PI * 0.02, canShot: 0 };
var crate, crateTexture, crateNormalMap, crateBumpMap;
var meshFloor;
var USE_WIREFRAME = false;

var loadingScreen = {
  scene: new THREE.Scene(),
  camera: new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  ),
  box: new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshBasicMaterial({ color: 0x4444ff })
  )
};

var RESOURCES_LOAD = false;
var LOADIND_MANAGER = null;

var models = {
  tent: {
    obj: "models/Tent_Poles_01.obj",
    mtl: "models/Tent_Poles_01.mtl",
    mesh: null
  },
  campfire: {
    obj: "models/Campfire_01.obj",
    mtl: "models/Campfire_01.mtl",
    mesh: null
  },
  pirateship: {
    obj: "models/Pirateship.obj",
    mtl: "models/Pirateship.mtl",
    mesh: null
  },
  uzi: {
    obj: "models/uziGold.obj",
    mtl: "models/uziGold.mtl",
    mesh: null,
    castShadow: false
  }
};
var meshes = {};
var bullets = [];
function init() {
  clock = new THREE.Clock();
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  loadingScreen.box.position.set(0, 0, 5);
  loadingScreen.camera.lookAt(loadingScreen.box.position);
  loadingScreen.scene.add(loadingScreen.box);
  console.log("Int");
  loadingManager = new THREE.LoadingManager();
  loadingManager.onProgress = function(item, loaded, total) {
    console.log(item, loaded, total);
  };
  loadingManager.onLoad = function() {
    console.log("Loaded all resources");
    RESOURCES_LOAD = true;
    onResoureceLoaded();
  };

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

  var textureLoader = new THREE.TextureLoader(loadingManager);
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
  crate.position.set(2.5, 3 / 2.75, 2.5);

  crate.receiveShadow = true;
  crate.castShadow = true;

  for (var _key in models) {
    function modelLoad(key) {
      console.log("mesh", _key);
      var mtlLoader = new THREE.MTLLoader(loadingManager);

      mtlLoader.load(models[key].mtl, function(material) {
        material.preload();
        var objLoaderer = new THREE.OBJLoader(loadingManager);
        objLoaderer.setMaterials(material);
        objLoaderer.load(models[key].obj, function(mesh) {
          mesh.traverse(function(node) {
            if (node instanceof THREE.Mesh) {
              if ("castShadow" in models[key])
                node.castShadow = models[key].castShadow;
              else node.castShadow = true;
              if ("receiveShadow" in models[key]) node.receiveShadow = models;
              else node.receiveShadow = true;
            }
          });
          models[key].mesh = mesh;
        });
      });
    }
    modelLoad(_key);
  }
  camera.position.set(0, player.height, -5);
  camera.lookAt(new THREE.Vector3(0, player.height, 0));

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  animate();
}

function onResoureceLoaded() {
  console.log("models", models.tent);
  meshes["tent1"] = models.tent.mesh.clone();
  meshes["tent2"] = models.tent.mesh.clone();
  meshes["campfire1"] = models.campfire.mesh.clone();
  meshes["campfire2"] = models.campfire.mesh.clone();
  meshes["pirateship"] = models.pirateship.mesh.clone();

  meshes["tent1"].position.set(-4, 0, 4);
  scene.add(meshes["tent1"]);
  meshes["tent2"].position.set(-7, 0, 4);
  scene.add(meshes["tent2"]);

  meshes["campfire1"].position.set(-4, 0, 1);
  scene.add(meshes["campfire1"]);
  meshes["campfire2"].position.set(-7, 0, 1);
  scene.add(meshes["campfire2"]);

  meshes["pirateship"].position.set(-11, -1, -3);
  meshes["pirateship"].rotation.set(0, Math.PI, 0);
  scene.add(meshes["pirateship"]);

  meshes["playerweapon"] = models.uzi.mesh.clone();
  meshes["playerweapon"].position.set(0, 2, 0);
  meshes["playerweapon"].scale.set(5, 5, 5);
  scene.add(meshes["playerweapon"]);
}

function animate() {
  if (RESOURCES_LOAD === false) {
    requestAnimationFrame(animate);
    loadingScreen.box.position.x -= 0.05;
    if (loadingScreen.box.position.x < -10) loadingScreen.box.position.x = 10;
    loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);
    renderer.render(loadingScreen.scene, loadingScreen.camera);
    return;
  }
  requestAnimationFrame(animate);

  var time = Date.now() * 0.0005;
  var delta = clock.getDelta();

  mesh.rotation.x += 0.02;
  mesh.rotation.y += 0.01;
  crate.rotation.y += 0.01;

  for (var index = 0; index < bullets.length; index += 1) {
    if (bullets[index] === undefined) continue;
    if (bullets[index].alive === false) {
      bullets.splice(index, 1);
      continue;
    }
    bullets[index].position.add(bullets[index].velocity);
  }

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

  if (keyboard[32] && player.canShot <= 0) {
    var listener = new THREE.AudioListener();
    camera.add(listener);

    // create a global audio source
    var sound = new THREE.Audio(listener);

    // load a sound and set it as the Audio object's buffer
    var audioLoader = new THREE.AudioLoader();

    audioLoader.load("sound/gunShot.wav", function(buffer) {
      sound.setBuffer(buffer);
      //sound.setLoop(true);
      sound.setVolume(0.5);
      sound.play();
    });
    setTimeout(function() {
      if (
        meshes["playerweapon"].position.x <= 0.42049919629121146 &&
        meshes["playerweapon"].position.x <= 0.40062154556811885
      ) {
        var man = new THREE.Audio(listener);
        console.log(meshes["playerweapon"].position.y);
        // load a sound and set it as the Audio object's buffer
        var audioLoader1 = new THREE.AudioLoader();
        audioLoader1.load("sound/man.wav", function(buffer) {
          man.setBuffer(buffer);
          //sound.setLoop(true);
          man.setVolume(0.5);
          man.play();
        });
      }
    }, 1000);

    var bullet = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xd4af37 })
    );

    bullet.position.set(
      meshes["playerweapon"].position.x,
      meshes["playerweapon"].position.y + 0.15,
      meshes["playerweapon"].position.z
    );

    bullet.velocity = new THREE.Vector3(
      -Math.sin(camera.rotation.y),
      0,
      Math.cos(camera.rotation.y)
    );
    bullet.alive = true;
    setTimeout(function() {
      bullet.alive = false;
      scene.remove(bullet);
    }, 1000);
    bullets.push(bullet);
    scene.add(bullet);
    player.canShot = 10;
  }
  if (player.canShot > 0) player.canShot -= 1;

  meshes["playerweapon"].position.set(
    camera.position.x - Math.sin(camera.rotation.y + Math.PI / 6) * 0.75,
    camera.position.y -
      0.1 +
      Math.sin(time * 2 + camera.position.x + camera.position.z) * 0.03,
    camera.position.z + Math.cos(camera.rotation.y + Math.PI / 6) * 0.75
  );

  meshes["playerweapon"].rotation.set(
    camera.rotation.x,
    camera.rotation.y - Math.PI,
    camera.rotation.z
  );
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
