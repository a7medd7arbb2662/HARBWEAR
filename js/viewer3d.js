/* ═══════════════════════════════════════════════════════════
   HARBWEAR™ — 3D product viewer (Three.js)
   Stylized procedural models per category · orbit · zoom
   ═══════════════════════════════════════════════════════════ */
window.HBViewer3D = (function () {
  'use strict';

  var renderer = null, scene = null, camera = null, controls = null;
  var group = null, modelGroup = null, currentCat = null, currentColor = 0x1a1a1a;
  var light1, light2;
  var rafId = null;

  function init(canvas, color) {
    if (!window.THREE) return false;
    if (renderer) { dispose(); }
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (e) {
      renderer = null;
      return false;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
    camera.position.set(0, .7, 4.2);

    light1 = new THREE.DirectionalLight(0xffffff, 1.5);
    light1.position.set(3, 5, 4);
    scene.add(light1);
    light2 = new THREE.DirectionalLight(0xffffff, .5);
    light2.position.set(-4, 2, -3);
    scene.add(light2);
    var amb = new THREE.AmbientLight(0xffffff, .35);
    scene.add(amb);

    /* ground shadow disc */
    var disc = new THREE.Mesh(
      new THREE.CircleGeometry(1.7, 48),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .08, roughness: 1 })
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = -.95;
    scene.add(disc);

    if (window.THREE.OrbitControls) {
      controls = new THREE.OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = .08;
      controls.minDistance = 2.2;
      controls.maxDistance = 8;
      controls.maxPolarAngle = Math.PI * .85;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 2.4;
    }

    modelGroup = new THREE.Group();
    scene.add(modelGroup);

    var loop = function () {
      rafId = requestAnimationFrame(loop);
      if (controls) controls.update();
      renderer.render(scene, camera);
    };
    loop();
    resize();
    return true;
  }

  function dispose() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (modelGroup) { while (modelGroup.children.length) modelGroup.remove(modelGroup.children[0]); }
    if (renderer) {
      try { renderer.dispose(); } catch (e) {}
      renderer = null;
    }
    scene = null; camera = null; controls = null; group = null; modelGroup = null;
  }

  function resize() {
    if (!renderer) return;
    var canvas = renderer.domElement;
    var w = canvas.clientWidth || 320, h = canvas.clientHeight || 360;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  /* ── procedural models ── */
  function mat(color) {
    return new THREE.MeshStandardMaterial({ color: color, roughness: .62, metalness: .06 });
  }

  function buildTee(color) {
    var g = new THREE.Group();
    var body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.55, .42), mat(color));
    body.position.y = .1;
    g.add(body);
    var sleeveL = new THREE.Mesh(new THREE.BoxGeometry(.55, .5, .42), mat(color));
    sleeveL.position.set(-.98, .28, 0);
    sleeveL.rotation.z = .12;
    g.add(sleeveL);
    var sleeveR = sleeveL.clone();
    sleeveR.position.x = .98;
    sleeveR.rotation.z = -.12;
    g.add(sleeveR);
    var neck = new THREE.Mesh(new THREE.TorusGeometry(.19, .07, 12, 24), mat(color));
    neck.rotation.x = Math.PI / 2;
    neck.position.y = .72;
    g.add(neck);
    if (currentCat === 'hoodies' || currentCat === 'sweatshirts') {
      var hood = new THREE.Mesh(new THREE.TorusGeometry(.24, .09, 12, 24), mat(color));
      hood.rotation.x = Math.PI / 2;
      hood.position.y = .8;
      g.add(hood);
    }
    var pocket = new THREE.Mesh(new THREE.BoxGeometry(.4, .3, .06), mat(color));
    pocket.position.set(0, -.5, .25);
    g.add(pocket);
    g.position.y = -.1;
    return g;
  }

  function buildSneaker(color) {
    var g = new THREE.Group();
    var sole = new THREE.Mesh(new THREE.BoxGeometry(.85, .22, 1.7), mat(0x111111));
    sole.position.y = -.18;
    g.add(sole);
    var upper = new THREE.Mesh(new THREE.BoxGeometry(.72, .42, 1.4), mat(color));
    upper.position.y = .14;
    g.add(upper);
    var toe = new THREE.Mesh(new THREE.SphereGeometry(.36, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(color));
    toe.scale.set(1, .5, 1.1);
    toe.position.set(0, .02, .68);
    g.add(toe);
    var cuff = new THREE.Mesh(new THREE.TorusGeometry(.34, .07, 10, 20), mat(0x222222));
    cuff.rotation.x = Math.PI / 2;
    cuff.position.set(0, .34, -.52);
    g.add(cuff);
    var stripe = new THREE.Mesh(new THREE.BoxGeometry(.1, .09, 1.1), mat(0xf2f2f2));
    stripe.position.set(0, .3, .05);
    g.add(stripe);
    g.rotation.x = .25;
    return g;
  }

  function buildCap(color) {
    var g = new THREE.Group();
    var dome = new THREE.Mesh(new THREE.SphereGeometry(.72, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.35), mat(color));
    g.add(dome);
    var brim = new THREE.Mesh(new THREE.BoxGeometry(.8, .05, .72), mat(color));
    brim.position.set(0, -.34, .62);
    g.add(brim);
    var band = new THREE.Mesh(new THREE.CylinderGeometry(.7, .74, .14, 32, 1, true), mat(0x111111));
    band.position.y = -.32;
    g.add(band);
    g.rotation.x = -.08;
    return g;
  }

  function buildBag(color) {
    var g = new THREE.Group();
    var body = new THREE.Mesh(new THREE.BoxGeometry(1.1, .85, .42), mat(color));
    body.position.y = .05;
    g.add(body);
    var handle = new THREE.Mesh(new THREE.TorusGeometry(.28, .05, 10, 24), mat(color));
    handle.position.y = .62;
    handle.rotation.x = Math.PI / 2;
    g.add(handle);
    var flap = new THREE.Mesh(new THREE.BoxGeometry(1.12, .22, .46), mat(0x111111));
    flap.position.y = .42;
    g.add(flap);
    return g;
  }

  function buildPants(color) {
    var g = new THREE.Group();
    var waist = new THREE.Mesh(new THREE.BoxGeometry(.9, .3, .45), mat(color));
    waist.position.y = .62;
    g.add(waist);
    var legL = new THREE.Mesh(new THREE.BoxGeometry(.4, 1.2, .42), mat(color));
    legL.position.set(-.24, -.22, 0);
    g.add(legL);
    var legR = legL.clone();
    legR.position.x = .24;
    g.add(legR);
    g.position.y = -.1;
    return g;
  }

  function buildSocks(color) {
    var g = new THREE.Group();
    var s1 = new THREE.Mesh(new THREE.CylinderGeometry(.22, .26, .5, 20), mat(color));
    s1.position.set(-.22, -.1, 0);
    s1.rotation.z = .3;
    g.add(s1);
    var s2 = s1.clone();
    s2.position.x = .22;
    s2.rotation.z = -.3;
    g.add(s2);
    var band = new THREE.Mesh(new THREE.TorusGeometry(.24, .045, 8, 20), mat(0x222222));
    band.rotation.x = Math.PI / 2;
    band.position.set(-.22, .16, 0);
    g.add(band);
    var band2 = band.clone();
    band2.position.x = .22;
    g.add(band2);
    return g;
  }

  function buildModel(cat, color) {
    if (cat === 'sneakers') return buildSneaker(color);
    if (cat === 'caps') return buildCap(color);
    if (cat === 'bags') return buildBag(color);
    if (cat === 'jeans' || cat === 'cargo' || cat === 'shorts') return buildPants(color);
    if (cat === 'socks') return buildSocks(color);
    return buildTee(color);
  }

  function setProduct(cat, color) {
    if (!modelGroup || !window.THREE) return;
    while (modelGroup.children.length) modelGroup.remove(modelGroup.children[0]);
    currentCat = cat;
    currentColor = color;
    modelGroup.add(buildModel(cat, color));
  }

  window.addEventListener('resize', function () { resize(); });

  return {
    init: init,
    dispose: dispose,
    resize: resize,
    setProduct: setProduct
  };
})();
