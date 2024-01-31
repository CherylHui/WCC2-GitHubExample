import * as THREE from 'three';

const uniforms = {

    'fogDensity': { value: 0.45 },
    'fogColor': { value: new THREE.Vector3( 0, 0, 0 ) },
    'time': { value: 1.0 },
    'uvScale': { value: new THREE.Vector2( 3.0, 1.0 ) },
    'texture1': { value: "" },
    'texture2': { value: "" }

};


const vertexShader = `

    uniform float time;

    uniform vec2 uvScale;
    varying vec2 vUv;

    void main()
    {

        vUv = uvScale * uv;

        // Displace vertices using sine waves
        vec3 displacedPosition = position;
        displacedPosition.x += sin(position.y * 5.0 + time) * 0.1;
        displacedPosition.y += sin(position.x * 5.0 + time) * 0.1;

        vec4 mvPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
        gl_Position = projectionMatrix * mvPosition;

    }

`;

const fragmentShader = `

    uniform float time;

    uniform float fogDensity;
    uniform vec3 fogColor;

    uniform sampler2D texture1;
    uniform sampler2D texture2;

    varying vec2 vUv;

    void main( void ) {

        vec2 position = - 1.0 + 2.0 * vUv;//ndc space maps uv space to -1 to 1

        //using the second texture to add some noisy effect, not actual noise
        vec4 noise = texture2D( texture1, vUv );
        vec2 T2 = vUv + time * 0.01;

        T2.x -= noise.y * 0.2;
        T2.y += noise.z * 0.2;

        //try remove T2 and instead pass in vUv to see the standard uv coords used
        vec4 color = texture2D( texture2, T2);//give the "noisy" uv coords to the second texture

        gl_FragColor = color;

        //adds the fade into the distance effect
        float depth = gl_FragCoord.z / gl_FragCoord.w;
        const float LOG2 = 1.442695;
        float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
        fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );

        gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );

    }

`;

export const tiledMaterial= new THREE.ShaderMaterial( {
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
} );