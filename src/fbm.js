
const fbm = (p5, vec, octaves) => {
    // Initial values
    let value = 0.0;
    let amplitude = 2.0;
    octaves = octaves || 6;
    const frequency = 0;
    //
    // Loop of octaves
    for (let i = 0; i < octaves; i++) {
        value += amplitude * p5.noise(vec.x, vec.y);
        vec.mult(2);
        amplitude *= 0.5;
    }
    return value;
};
