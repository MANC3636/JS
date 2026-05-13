import * as THREE from 'three';

export class BuildingSystem {
    constructor(scene, physicsEngine, camera) {
        this.scene = scene;
        this.physicsEngine = physicsEngine;
        this.camera = camera;
        this.parts = [];
        this.previewPart = null;
        this.partSize = 2;
        this.partColor = 0xff0000;
        this.gridSize = 1;

        // Setup UI listeners
        this.setupUIListeners();
    }

    setupUIListeners() {
        const colorInput = document.getElementById('colorInput');
        const sizeSlider = document.getElementById('sizeSlider');

        colorInput.addEventListener('change', (e) => {
            this.partColor = parseInt(e.target.value.replace('#', ''), 16);
        });

        sizeSlider.addEventListener('input', (e) => {
            this.partSize = parseFloat(e.target.value);
        });

        // Prevent right-click context menu
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    placePart(camera, playerController) {
        // Raycast from camera
        const raycaster = new THREE.Raycaster();
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(camera.quaternion);

        const rayResult = this.physicsEngine.raycast(camera.position, direction, 100);

        if (rayResult) {
            // Calculate placement position (snap to grid)
            const hitPoint = rayResult.point;
            const snappedPos = new THREE.Vector3(
                Math.round(hitPoint.x / this.gridSize) * this.gridSize,
                Math.round(hitPoint.y / this.gridSize) * this.gridSize + this.partSize / 2,
                Math.round(hitPoint.z / this.gridSize) * this.gridSize
            );

            // Create part
            const geometry = new THREE.BoxGeometry(this.partSize, this.partSize, this.partSize);
            const material = new THREE.MeshStandardMaterial({
                color: this.partColor,
                roughness: 0.4,
                metalness: 0.6
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(snappedPos);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            this.scene.add(mesh);
            this.parts.push(mesh);

            // Add physics
            this.physicsEngine.addRigidBody(mesh, 0); // Static
        }
    }

    deletePart(camera) {
        // Raycast from camera
        const raycaster = new THREE.Raycaster();
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(camera.quaternion);

        const rayResult = this.physicsEngine.raycast(camera.position, direction, 100);

        if (rayResult) {
            // Find which mesh corresponds to this body
            for (let i = 0; i < this.physicsEngine.meshes.length; i++) {
                if (this.physicsEngine.meshes[i].userData.physicsBody === rayResult.body) {
                    const mesh = this.physicsEngine.meshes[i];

                    // Skip deletion of base platform
                    if (mesh.geometry.parameters.width === 100) return;

                    this.scene.remove(mesh);
                    this.physicsEngine.removeBody(mesh);

                    const partIndex = this.parts.indexOf(mesh);
                    if (partIndex > -1) {
                        this.parts.splice(partIndex, 1);
                    }
                    break;
                }
            }
        }
    }

    update(camera, buildMode) {
        if (buildMode) {
            // Update preview part
            if (!this.previewPart) {
                this.createPreview();
            }

            // Raycast for preview position
            const direction = new THREE.Vector3(0, 0, -1);
            direction.applyQuaternion(camera.quaternion);

            const rayResult = this.physicsEngine.raycast(camera.position, direction, 100);

            if (rayResult) {
                const hitPoint = rayResult.point;
                const snappedPos = new THREE.Vector3(
                    Math.round(hitPoint.x / this.gridSize) * this.gridSize,
                    Math.round(hitPoint.y / this.gridSize) * this.gridSize + this.partSize / 2,
                    Math.round(hitPoint.z / this.gridSize) * this.gridSize
                );

                this.previewPart.position.copy(snappedPos);
                this.previewPart.scale.set(this.partSize, this.partSize, this.partSize);
                this.previewPart.visible = true;
            } else {
                this.previewPart.visible = false;
            }
        } else {
            if (this.previewPart) {
                this.previewPart.visible = false;
            }
        }
    }

    createPreview() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: this.partColor,
            opacity: 0.5,
            transparent: true
        });
        this.previewPart = new THREE.Mesh(geometry, material);
        this.previewPart.visible = false;
        this.scene.add(this.previewPart);
    }
}
