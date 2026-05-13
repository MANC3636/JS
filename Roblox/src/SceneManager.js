import * as THREE from 'three';

export class SceneManager {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
    }

    addObject(object) {
        this.scene.add(object);
        this.objects.push(object);
        return object;
    }

    removeObject(object) {
        this.scene.remove(object);
        const index = this.objects.indexOf(object);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    }

    clearScene() {
        this.objects.forEach(obj => this.scene.remove(obj));
        this.objects = [];
    }

    getObjectCount() {
        return this.objects.length;
    }
}
