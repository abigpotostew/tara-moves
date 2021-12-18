precision mediump float;

// ranges from 0..1
varying vec2 vTexCoord;
uniform sampler2D texture;
//uniform vec2 u_resolution;

void main() {
//    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec2 uv = vTexCoord;
    uv = 1.0 - uv;
    vec4 tex = texture2D(texture, uv);
//    if(tex.a<0.5) discard;
    gl_FragColor = vec4(1.0-tex.rgb, tex.a);
}
