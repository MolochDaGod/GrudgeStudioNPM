import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class AnimationLibrary {
  constructor() {
    this.loader = new GLTFLoader();
    this.animations = new Map();
    this.manifest = null;
    this.basePath = '/models/animations/';
  }

  async loadManifest() {
    if (this.manifest) return this.manifest;
    
    try {
      const response = await fetch(this.basePath + 'manifest.json');
      this.manifest = await response.json();
      console.log('[AnimationLibrary] Loaded manifest with', Object.keys(this.manifest.animations).length, 'animations');
      return this.manifest;
    } catch (error) {
      console.error('[AnimationLibrary] Failed to load manifest:', error);
      return null;
    }
  }

  async loadAnimation(name) {
    if (this.animations.has(name)) {
      return this.animations.get(name);
    }

    await this.loadManifest();
    
    if (!this.manifest?.animations[name]) {
      console.warn('[AnimationLibrary] Animation not found:', name);
      return null;
    }

    const animData = this.manifest.animations[name];
    const filePath = this.basePath + animData.file;

    return new Promise((resolve, reject) => {
      this.loader.load(
        filePath,
        (gltf) => {
          if (gltf.animations.length > 0) {
            const clip = gltf.animations[0];
            clip.name = name;
            
            const result = {
              clip,
              loop: animData.loop,
              duration: animData.duration,
              skeleton: this.extractSkeleton(gltf.scene)
            };
            
            this.animations.set(name, result);
            console.log('[AnimationLibrary] Loaded animation:', name);
            resolve(result);
          } else {
            console.warn('[AnimationLibrary] No animations in file:', filePath);
            resolve(null);
          }
        },
        undefined,
        (error) => {
          console.error('[AnimationLibrary] Failed to load:', name, error);
          reject(error);
        }
      );
    });
  }

  async loadAllAnimations() {
    await this.loadManifest();
    
    if (!this.manifest) return [];

    const names = Object.keys(this.manifest.animations);
    const promises = names.map(name => this.loadAnimation(name));
    
    await Promise.all(promises);
    console.log('[AnimationLibrary] Loaded all', this.animations.size, 'animations');
    
    return Array.from(this.animations.values());
  }

  async loadAnimationSet(names) {
    const promises = names.map(name => this.loadAnimation(name));
    return Promise.all(promises);
  }

  extractSkeleton(scene) {
    let skeleton = null;
    scene.traverse((child) => {
      if (child.isSkinnedMesh && child.skeleton) {
        skeleton = child.skeleton;
      }
    });
    return skeleton;
  }

  getAnimation(name) {
    return this.animations.get(name);
  }

  getClip(name) {
    const anim = this.animations.get(name);
    return anim ? anim.clip : null;
  }

  getAllClips() {
    return Array.from(this.animations.values()).map(a => a.clip);
  }

  applyToMixer(mixer, animationName, options = {}) {
    const anim = this.animations.get(animationName);
    if (!anim) {
      console.warn('[AnimationLibrary] Animation not loaded:', animationName);
      return null;
    }

    const action = mixer.clipAction(anim.clip);
    
    if (anim.loop) {
      action.setLoop(THREE.LoopRepeat);
    } else {
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
    }

    if (options.fadeIn) {
      action.fadeIn(options.fadeIn);
    }

    if (options.timeScale) {
      action.timeScale = options.timeScale;
    }

    return action;
  }

  retargetAnimation(sourceClip, targetSkeleton, sourcePrefix = 'mixamorig:', targetPrefix = '') {
    const tracks = [];
    
    for (const track of sourceClip.tracks) {
      let newName = track.name;
      
      if (sourcePrefix && targetPrefix !== sourcePrefix) {
        newName = track.name.replace(sourcePrefix, targetPrefix);
      }
      
      const newTrack = track.clone();
      newTrack.name = newName;
      tracks.push(newTrack);
    }

    return new THREE.AnimationClip(sourceClip.name + '_retargeted', sourceClip.duration, tracks);
  }
}

export const animationLibrary = new AnimationLibrary();
export default animationLibrary;
