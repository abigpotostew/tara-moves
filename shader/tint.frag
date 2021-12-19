precision mediump float;

// ranges from 0..1
varying vec2 vTexCoord;

// Your texture uniform must use this name
uniform sampler2D uSampler;

uniform vec3 replaceRed;
uniform vec3 replaceBlue;


void main() {
    vec4 tex = texture2D(uSampler, vTexCoord);
//    if(tex.b > 0 && tex.r > 0){
//        vec4 blue = vec4(replaceBlue,tex.b);
//        vec4 red = vec4(replaceRed,tex.r);
//        vec4 blue = mix(blue,red, .5);
//    }
    vec3 col = mix(replaceRed, replaceBlue, tex.b );

    // just invert the texture color to demonstrate the fragement shader is running
    gl_FragColor = vec4(col, tex.a);
}
