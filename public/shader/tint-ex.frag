precision mediump float;

// lets grab texcoords just for fun
// ranges from 0..1
varying vec2 vTexCoord;

// our texture coming from p5
uniform sampler2D tex0;

// out time variable coming from p5
uniform float time;

uniform sampler2D texture;

void main() {

//    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec2 uv = vTexCoord;
    // the texture is loaded upside down and backwards by default so lets flip it
    uv = 1.0 - uv;

    // get the webcam as a vec4 using texture2D
    vec4 tex = texture2D(texture, gl_FragCoord.xy);

    // convert the texture to hsb using our function from up top
    vec4 col = mix(vec4(0,1,0,1),vec4(0,0,0,0),tex.r);//+mix(vec4(1,0,0,1),vec4(0,0,0,0),tex.b);

    // lets make the hue spin in circles
    // first add the time to our hue value


    // output to screen
    gl_FragColor = 1.0-tex;//vec4(1,0,0,1);

    // try altering the saturation or brightness values!
}
