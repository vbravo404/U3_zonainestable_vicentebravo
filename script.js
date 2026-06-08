const shape = document.getElementById("shape");

/*
=========================================
AGREGA AQUÍ TODAS TUS FIGURAS SVG
=========================================
*/

const figuras = [

    "assets/figurassvg/figurasvg1.svg",
    "assets/figurassvg/figurasvg2.svg",
    "assets/figurassvg/figurasvg3.svg",
    "assets/figurassvg/figurasvg4.svg",

];

/*
=========================================
FIN DE LA LISTA
=========================================
*/

let indiceActual = 0;

shape.addEventListener("click", () => {

    shape.classList.add("changing");

    setTimeout(() => {

        indiceActual++;

        if(indiceActual >= figuras.length){
            indiceActual = 0;
        }

        shape.src = figuras[indiceActual];

    }, 200);

    setTimeout(() => {

        shape.classList.remove("changing");

    }, 400);

});