import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { PhysicsEngine } from './PhysicsEngine.js';
import { PlayerController } from './PlayerController.js';
import { BuildingSystem } from './BuildingSystem.js';
import { ScriptingEngine } from './ScriptingEngine.js';

export class GameEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.sceneManager = null;
        this.physicsEngine = null;
        this.playerController = null;
        this.buildingSystem = null;
        this.scriptingEngine = null;
        this.clock = new THREE.Clock();
        this.deltaTime = 0;
        this.buildMode = false;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.fps = 60;
    }

    init() {
        // Setup Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 1000, 10000);

        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        this.camera.position.set(0, 5, 10);

        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        document.body.appendChild(this.renderer.domElement);

        // Initialize managers
        this.sceneManager = new SceneManager(this.scene);
        this.physicsEngine = new PhysicsEngine();
        this.playerController = new PlayerController(this.camera, this.scene, this.physicsEngine);
        this.buildingSystem = new BuildingSystem(this.scene, this.physicsEngine, this.camera);
        this.scriptingEngine = new ScriptingEngine();

        // Setup lighting
        this.setupLighting();

        // Setup event listeners
        this.setupEventListeners();

        // Create default terrain
        this.createDefaultTerrain();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 100);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -500;
        directionalLight.shadow.camera.right = 500;
        directionalLight.shadow.camera.top = 500;
        directionalLight.shadow.camera.bottom = -500;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 1000;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }

    createDefaultTerrain() {
        // Create base platform
        const geometry = new THREE.BoxGeometry(100, 1, 100);
        const material = new THREE.MeshStandardMaterial({ color: 0x2d5016 });
        const platform = new THREE.Mesh(geometry, material);
        platform.position.y = -2;
        platform.castShadow = true;
        platform.receiveShadow = true;
        this.scene.add(platform);

        // Add physics body for platform
        this.physicsEngine.addRigidBody(platform, 0); // 0 mass = static body
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        document.addEventListener('mousemove', (e) => this.playerController.onMouseMove(e));
    }

    onKeyDown(e) {
        const key = e.key.toLowerCase();

        // Toggle build mode
        if (key === 'b') {
            this.buildMode = !this.buildMode;
            const modeText = this.buildMode ? 'Build' : 'Play';
            const modeColor = this.buildMode ? '#ffff00' : '#ffffff';
            document.getElementById('buildMode').innerHTML = `<strong style="color: ${modeColor};">Mode:</strong> ${modeText}`;
        }

        // Reset view
        if (key === 'h') {
            this.resetCamera();
        }

        this.playerController.onKeyDown(e);
    }

    onKeyUp(e) {
        this.playerController.onKeyUp(e);
    }

    onMouseDown(e) {
        if (this.buildMode) {
            if (e.button === 0) {
                // Left click - place part
                this.buildingSystem.placePart(this.camera, this.playerController);
            } else if (e.button === 2) {
                // Right click - delete part
                this.buildingSystem.deletePart(this.camera);
            }
        }
    }

    onMouseUp(e) {
        // Handle mouse up events
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    resetCamera() {
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
        this.playerController.euler.order = 'YXZ';
        this.playerController.euler.setFromQuaternion(this.camera.quaternion);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.deltaTime = this.clock.getDelta();

        // Update FPS
        this.frameCount++;
        if (Date.now() - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = Date.now();
            document.getElementById('fps').textContent = this.fps;
            document.getElementById('partCount').textContent = this.buildingSystem.parts.length;
        }

        // Update game systems
        this.playerController.update(this.deltaTime, this.buildMode);
        this.physicsEngine.update(this.deltaTime);
        this.buildingSystem.update(this.camera, this.buildMode);

        // Render
        this.renderer.render(this.scene, this.camera);
    }
}
