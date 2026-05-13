import * as CANNON from 'cannon-es';

export class PhysicsEngine {
    constructor() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);
        this.world.defaultContactMaterial.friction = 0.3;
        this.bodies = [];
        this.meshes = [];
    }

    addRigidBody(mesh, mass = 1) {
        const shape = this.getShapeFromMesh(mesh);
        const body = new CANNON.Body({
            mass: mass,
            shape: shape,
            friction: 0.3,
            restitution: 0.3
        });

        body.position.set(mesh.position.x, mesh.position.y, mesh.position.z);

        this.world.addBody(body);
        this.bodies.push(body);
        this.meshes.push(mesh);

        // Store reference
        mesh.userData.physicsBody = body;

        return body;
    }

    getShapeFromMesh(mesh) {
        if (mesh.geometry.boundingBox === null) {
            mesh.geometry.computeBoundingBox();
        }

        const bbox = mesh.geometry.boundingBox;
        const sizeX = bbox.max.x - bbox.min.x;
        const sizeY = bbox.max.y - bbox.min.y;
        const sizeZ = bbox.max.z - bbox.min.z;

        return new CANNON.Box(
            new CANNON.Vec3(sizeX / 2, sizeY / 2, sizeZ / 2)
        );
    }

    removeBody(mesh) {
        const body = mesh.userData.physicsBody;
        if (body) {
            this.world.removeBody(body);
            const index = this.bodies.indexOf(body);
            if (index > -1) {
                this.bodies.splice(index, 1);
                this.meshes.splice(index, 1);
            }
        }
    }

    update(deltaTime) {
        this.world.step(1 / 60, deltaTime, 3);

        // Update mesh positions from physics bodies
        for (let i = 0; i < this.bodies.length; i++) {
            const body = this.bodies[i];
            const mesh = this.meshes[i];

            mesh.position.copy(body.position);
            mesh.quaternion.copy(body.quaternion);
        }
    }

    raycast(origin, direction, maxDistance = 1000) {
        const from = new CANNON.Vec3(origin.x, origin.y, origin.z);
        const to = new CANNON.Vec3(
            origin.x + direction.x * maxDistance,
            origin.y + direction.y * maxDistance,
            origin.z + direction.z * maxDistance
        );

        const result = new CANNON.RaycastResult();
        this.world.raycastClosest(from, to, {}, result);

        if (result.body) {
            return {
                point: new CANNON.Vec3(result.hitPointWorld.x, result.hitPointWorld.y, result.hitPointWorld.z),
                body: result.body,
                distance: result.distance
            };
        }

        return null;
    }
}
