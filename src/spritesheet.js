export const loadMultipack = (p5, sheetNames, url) => {
    const baseUrl = url + '/'
    const jsonSheets = [];
    for (let sheetName of sheetNames) {
        p5.loadJSON(baseUrl + sheetName + '.json', (sheet) => {
            jsonSheets.push(sheet);
            sheet.image = p5.loadImage(baseUrl + sheet.meta.image)
        })
    }
    // p5.loadJSON(baseUrl+rootSheetName+'.json', (rootSheet)=>{
    //     jsonSheets.push(rootSheet);
    //     if(rootSheet.meta.related_multi_packs){
    //         for (const relatedMultiPack of rootSheet.meta.related_multi_packs) {
    //             jsonSheets.push(p5.loadJSON(baseUrl+relatedMultiPack))
    //         }
    //     }
    //
    //     for (let jsonSheet of jsonSheets) {
    //         jsonSheet.image = p5.loadImage(baseUrl + jsonSheet.meta.image)
    //     }
    //
    // })
    return jsonSheets

}

export const splitMultipackSheet = (p5, images, jsonSheets, shader, colorsFunc ) => {
    const allframes = []
    const buffer = p5.createGraphics(100, 100, p5.WEBGL);
    buffer.noStroke();

    for (let jsonSheet of jsonSheets) {
        for (let frame of jsonSheet.frames) {
            const xOffset = frame.frame.x;
            const yOffset = frame.frame.y;
            const w = frame.frame.w;
            const h = frame.frame.h;

            // // copy subsection into an image
            // const imgframe = p5.createImage(w, h);
            // imgframe.copy(jsonSheet.image, xOffset, yOffset, w, h, 0, 0, w, h);
            //
            //
            // // paint image with shader in buffer
            // buffer.resizeCanvas(w, h);
            // buffer.shader(shader);
            //
            // shader.setUniform("replaceRed", [0, 1, 0]);
            // shader.setUniform("replaceBlue", [1, 0, 0]);
            // shader.setUniform("texture", imgframe);
            // buffer.rect(0, 0, w, h);
            //
            // const imgframefinal = p5.createImage(w, h);
            // imgframefinal.copy(buffer,-w/2,-h/2, w, h, 0, 0, w, h);
            // frame.image = imgframefinal; //jsonSheet.image
            // buffer.resetShader()
            // // imgframe.remove()

            frame.image = jsonSheet.image
            allframes.push(frame)
        }
    }
    buffer.remove()
    allframes.sort((a, b) => {
        return a.filename.localeCompare(b.filename)
    })

    for (let frame of allframes) {
        for (let image of images) {
            if (frame.filename.startsWith(image.name)) {
                const frameArray = image.frames || []
                frameArray.push(frame)
                image.frames = frameArray
            }
        }
    }

}
