import * as BABYLON from 'babylonjs';

const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil:true});


const createScene =function(){

    const scene =new BABYLON.Scene(engine);

    scene.createDefaultCameraOrLight(true, false, true);
    const box = new BABYLON.Meshbuilder.CreateBox();
    return scene;
}

const scene=createScene();

engine.runRenderLoop(function(){
    scene.render();


});

