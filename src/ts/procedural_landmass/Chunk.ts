import * as THREE from "three"
import GridMetrics from "./GridMetrics"
import { march } from "./MarchingCubes"
import { indexFromCoord } from "./utils"
import { NoiseDensity } from "./NoiseDensity"

const MAX_TRIANGLES = 5;

class Chunk {
    public readonly geometry = new THREE.BufferGeometry();
    public noiseDensity = new Float32Array(GridMetrics.size);

    public constructor(noiseParams: NoiseDensity.Parameters) {
        const positions = new Float32Array(GridMetrics.size * MAX_TRIANGLES * 3 * 3);
        this.geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(positions), 3)
        );
        this.noiseDensity.set(NoiseDensity.generateDensity(noiseParams));
    }

    public generateMesh() {
        const [posiitons, indices] = march(0, this.noiseDensity);
        this.createMeshFromTriangles(posiitons, indices);
    }

    public drawDebugChunks(scene: THREE.Object3D) {
        const cubeGeometry = new THREE.BoxGeometry();
        for (let x = 0; x < GridMetrics.pointsPerChunk; x++) {
            for (let y = 0; y < GridMetrics.pointsPerChunk; y++) {
                for (let z = 0; z < GridMetrics.pointsPerChunk; z++) {
                    const density = this.noiseDensity[indexFromCoord(x, y, z)];
                    const cubeMaterial = new THREE.MeshBasicMaterial();
                    cubeMaterial.color.set(density);
                    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
                    cube.scale.set(1, 1, 1);
                    cube.scale.multiplyScalar(0.1);
                    cube.position.set(x, y, z);
                    cube.position.subScalar(GridMetrics.pointsPerChunk / 2);
                    scene.add(cube);
                }
            }
        }
    }

    private createMeshFromTriangles(positions: Float32Array, indices: number[]) {
        this.geometry.attributes.position.needsUpdate = true
        for (let i = 0; i < positions.length; i += 3) {
            this.geometry.attributes.position.setXYZ(i / 3, positions[i], positions[i + 1], positions[i + 2]);
        }
        this.geometry.setDrawRange(0, indices.length);
        this.geometry.setIndex(indices);
        this.geometry.computeVertexNormals();
    }
};

export default Chunk;