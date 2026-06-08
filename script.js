const coloresFondo = [

    "#f4bdbf", // rosa pálido
    "#c2e3e8", // azul pálido
    "#efd978", // beige
    "#8c2041"  // carmín

];

function cambiarColorFondo(indice){

    document.body.style.backgroundColor =
        coloresFondo[indice];

}

const shape = document.getElementById("shape");

const formas = [

/* 1 - Rectángulo largo */

[
    [10,40],
    [90,40],
    [90,40],
    [90,40],

    [90,60],
    [10,60],
    [10,60],
    [10,60]
],

/* 2 - Rectángulo */

[
    [30,25],
    [60,25],
    [60,25],
    [60,25],

    [60,75],
    [30,75],
    [30,75],
    [30,75]
],

/* 3 - Polígono con punta */

[
    [30,25],
    [60,25],
    [60,75],
    [50,90],

    [50,90],
    [40,90],
    [30,75],
    [30,25]
],

/* 4 - Hexágono */

[
    [30,15],
    [70,15],
    [90,50],
    [70,85],

    [30,85],
    [10,50],
    [10,50],
    [30,15]
]

];

let formaActual = 0;

function actualizarSVG(puntos){

    const texto = puntos
        .map(p => `${p[0]},${p[1]}`)
        .join(" ");

    shape.setAttribute(
        "points",
        texto
    );

    const pointsLayer =
        document.getElementById("points");

    pointsLayer.innerHTML = "";

    /*
    true  = mostrar vértices
    false = ocultar vértices
    */

    const mostrarVertices = false;

    if(!mostrarVertices){
        return;
    }

    puntos.forEach((p,index)=>{

        const circle =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
            );

        circle.setAttribute(
            "cx",
            p[0]
        );

        circle.setAttribute(
            "cy",
            p[1]
        );

        circle.setAttribute(
            "r",
            2
        );

        circle.setAttribute(
            "fill",
            "lime"
        );

        circle.setAttribute(
            "stroke",
            "black"
        );

        circle.setAttribute(
            "stroke-width",
            "0.3"
        );

        pointsLayer.appendChild(
            circle
        );

        const label =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
            );

        label.setAttribute(
            "x",
            p[0] + 2
        );

        label.setAttribute(
            "y",
            p[1] - 2
        );

        label.setAttribute(
            "font-size",
            "3"
        );

        label.setAttribute(
            "fill",
            "blue"
        );

        label.textContent =
            index + 1;

        pointsLayer.appendChild(
            label
        );

    });

}

actualizarSVG(
    formas[0]
);

function interpolar(a,b,t){

    return a + (b-a)*t;

}

function morph(indiceDestino){

    const inicio =
        formas[formaActual];

    const destino =
        formas[indiceDestino];

    const duracion = 900;

    let inicioTiempo = null;

    function frame(tiempo){

        if(!inicioTiempo){
            inicioTiempo = tiempo;
        }

        let progreso =
            (tiempo - inicioTiempo)
            / duracion;

        progreso =
            Math.min(
                progreso,
                1
            );

        const eased =
            0.5 -
            Math.cos(
                progreso * Math.PI
            ) / 2;

        const puntos = [];

        for(
            let i = 0;
            i < inicio.length;
            i++
        ){

            puntos.push([

                interpolar(
                    inicio[i][0],
                    destino[i][0],
                    eased
                ),

                interpolar(
                    inicio[i][1],
                    destino[i][1],
                    eased
                )

            ]);

        }

        actualizarSVG(
            puntos
        );

        if(progreso < 1){

            requestAnimationFrame(
                frame
            );

        }

    }

    requestAnimationFrame(
        frame
    );

    formaActual =
        indiceDestino;

}

document
.getElementById("container")
.addEventListener(
    "click",
    () => {

        let siguiente =
            formaActual + 1;

        if(
            siguiente >= formas.length
        ){
            siguiente = 0;
        }

        morph(
            siguiente
        );

        cambiarColorFondo(
            siguiente
        );

    }
);