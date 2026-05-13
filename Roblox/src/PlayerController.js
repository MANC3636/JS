import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class PlayerController {
    constructor(camera, scene, physicsEngine) {
        this.camera = camera;
        this.scene = scene;
        this.physicsEngine = physicsEngine;

        // Player movement
        this.velocity = new THREE.Vector3();
        this.acceleration = 10;
        this.maxSpeed = 20;
        this.jumpForce = 8;
        this.isJumping = false;
        this.isGrounded = false;

        // Mouse look
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.pi2 = Math.PI / 2;
        this.mouseSensitivity = 0.005;

        // Keys pressed
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            space: false
        };

        // Physics body
        this.createPlayerBody();

        // Pointer lock
        this.setupPointerLock();
    }

    createPlayerBody() {
        const shape = new CANNON.Sphere(0.5);
        this.playerBody = new CANNON.Body({
            mass: 1,
            shape: shape,
            linearDamping: 0.5,
            angularDamping: 1
        });

        this.playerBody.position.set(
            this.camera.position.x,
            this.camera.position.y,
            this.camera.position.z
        );

        this.physicsEngine.world.addBody(this.playerBody);
    }

    setupPointerLock() {
        document.addEventListener('click', () => {
            document.body.requestPointerLock = document.body.requestPointerLock;
            document.body.requestPointerLock();
        });
    }

    onKeyDown(e) {
        const key = e.key.toLowerCase();
        if (key === 'w') this.keys.w = true;
        if (key === 'a') this.keys.a = true;
        if (key === 's') this.keys.s = true;
        if (key === 'd') this.keys.d = true;
        if (key === ' ') {
            e.preventDefault();
            this.keys.space = true;
        }
    }

    onKeyUp(e) {
        const key = e.key.toLowerCase();
        if (key === 'w') this.keys.w = false;
        if (key === 'a') this.keys.a = false;
        if (key === 's') this.keys.s = false;
        if (key === 'd') this.keys.d = false;
        if (key === ' ') this.keys.space = false;
    }

    onMouseMove(e) {
        if (document.pointerLockElement) {
            this.euler.setFromQuaternion(this.camera.quaternion);
            this.euler.rotateY(-e.movementX * this.mouseSensitivity);
            this.euler.rotateX(-e.movementY * this.mouseSensitivity);

            // Clamp pitch
            this.euler.x = Math.max(-this.pi2, Math.min(this.pi2, this.euler.x));

            this.camera.quaternion.setFromEuler(this.euler);
        }
    }

    update(deltaTime, buildMode) {
        // Calculate movement direction
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();

        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        // Apply input forces
        const moveVector = new THREE.Vector3();

        if (this.keys.w) moveVector.add(forward);
        if (this.keys.s) moveVector.sub(forward);
        if (this.keys.d) moveVector.add(right);
        if (this.keys.a) moveVector.sub(right);

        if (moveVector.length() > 0) {
            moveVector.normalize();
            moveVector.multiplyScalar(this.maxSpeed);
            this.playerBody.velocity.x = moveVector.x;
            this.playerBody.velocity.z = moveVector.z;
        } else {
            this.playerBody.velocity.x *= 0.8;
            this.playerBody.velocity.z *= 0.8;
        }

        // Jump
        if (this.keys.space && this.isGrounded) {
            this.playerBody.velocity.y = this.jumpForce;
            this.isGrounded = false;
        }

        // Check if grounded (simple raycast down)
        const raycaster = new THREE.Raycaster(
            this.playerBody.position,
            new THREE.Vector3(0, -1, 0),
            0,
            1
        );

        this.isGrounded = false;
        for (let i = 0; i < this.physicsEngine.meshes.length; i++) {
            const intersects = raycaster.intersectObject(this.physicsEngine.meshes[i]);
            if (intersects.length > 0) {
                this.isGrounded = true;
                break;
            }
        }

        // In build mode, slow down movement
        if (buildMode) {
            this.playerBody.velocity.x *= 0.7;
            this.playerBody.velocity.z *= 0.7;
        }

        // Update camera position with slight offset
        const offset = new THREE.Vector3(0, 1.6, 0);
        this.camera.position.copy(this.playerBody.position).add(offset);
    }
}
