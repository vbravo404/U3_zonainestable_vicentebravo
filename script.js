const coloresFondo = [

    "#f4bdbf",
    "#c2e3e8",
    "#efd978",
    "#8c2041"

];

const coloresPiezas = [

    "#8c2041",
    "#c2e3e8",
    "#efd978",
    "#f4bdbf"

];

function cambiarColorFondo(indice){

    document.body.style.backgroundColor =
        coloresFondo[indice];

}

const shape =
    document.getElementById("shape");

const container =
    document.getElementById("container");

const world =
    document.getElementById("world");

const formas = [

[
 [10,40],[90,40],[90,40],[90,40],
 [90,60],[10,60],[10,60],[10,60]
],

[
 [30,25],[60,25],[60,25],[60,25],
 [60,75],[30,75],[30,75],[30,75]
],

[
 [30,25],[60,25],[60,75],[50,90],
 [50,90],[40,90],[30,75],[30,25]
],

[
 [30,15],[70,15],[90,50],[70,85],
 [30,85],[10,50],[10,50],[30,15]
]

];

let formaActual = 0;
let modoFinal = false;

function actualizarSVG(puntos){

    const texto =
        puntos
        .map(
            p => `${p[0]},${p[1]}`
        )
        .join(" ");

    shape.setAttribute(
        "points",
        texto
    );

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
                progreso*Math.PI
            )/2;

        const puntos = [];

        for(
            let i=0;
            i<inicio.length;
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

        if(
            progreso < 1
        ){

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

function crearPieza(){

    const div =
        document.createElement(
            "div"
        );

    div.className =
        "pieza";

    let formaIndice =
        Math.floor(
            Math.random()*formas.length
        );

    let color =
        coloresPiezas[
            Math.floor(
                Math.random()*
                coloresPiezas.length
            )
        ];

    const puntos =
        formas[formaIndice]
        .map(
            p =>
            `${p[0]},${p[1]}`
        )
        .join(" ");

    div.innerHTML = `

        <svg viewBox="0 0 100 100">

            <polygon
                points="${puntos}"
                fill="${color}">
            </polygon>

        </svg>

    `;

    world.appendChild(
        div
    );

    let x =
        Math.random() *
        (window.innerWidth-200);

    let y =
        Math.random() *
        (window.innerHeight-200);

    let vx =
        (Math.random()-0.5)
        *1.2;

    let vy =
        (Math.random()-0.5)
        *1.2;

    let dragging =
        false;

    div.style.left =
        x + "px";

    div.style.top =
        y + "px";

    div.addEventListener(
        "pointerdown",
        ()=>{

            dragging = true;

        }
    );

    window.addEventListener(
        "pointerup",
        ()=>{

            dragging = false;

        }
    );

    let ultimoMouseX = 0;
let ultimoMouseY = 0;

window.addEventListener(
    "pointermove",
    e=>{

        if(
            dragging
        ){

            const nuevoX =
                e.clientX - 90;

            const nuevoY =
                e.clientY - 90;

            // VELOCIDAD GENERADA
            // POR EL MOVIMIENTO DEL MOUSE

            vx =
                nuevoX - x;

            vy =
                nuevoY - y;

            x =
                nuevoX;

            y =
                nuevoY;

            div.style.left =
                x + "px";

            div.style.top =
                y + "px";

            ultimoMouseX =
                e.clientX;

            ultimoMouseY =
                e.clientY;

        }

    }
);

    function mover(){

        if(
            !dragging
        ){

            x += vx;
            y += vy;

        }

        if(
            x <= 0 ||
            x >=
            window.innerWidth
            -180
        ){

            vx *= -1;

        }

        if(
            y <= 0 ||
            y >=
            window.innerHeight
            -180
        ){

            vy *= -1;

        }

        div.style.left =
            x + "px";

        div.style.top =
            y + "px";

        requestAnimationFrame(
            mover
        );

    }

    mover();

    return {

        element:div,

        getX:()=>x,

        getY:()=>y,

        setVX:v=>vx=v,

        setVY:v=>vy=v,

        getVX:()=>vx,

        getVY:()=>vy

    };

}

const piezas = [];

function activarModoFinal(){

    modoFinal = true;

    document.body.style.backgroundColor =
        "#ffffff";

    container.style.display =
        "none";

    piezas.push(
        crearPieza()
    );

    piezas.push(
        crearPieza()
    );

    setInterval(()=>{

        if(
            piezas.length < 2
        ){
            return;
        }

        const a =
            piezas[0];

        const b =
            piezas[1];

        const dx =
            a.getX()
            - b.getX();

        const dy =
            a.getY()
            - b.getY();

        const distancia =
            Math.sqrt(
                dx*dx +
                dy*dy
            );

        if(
            distancia < 80
        ){

            const avx =
                a.getVX();

            const avy =
                a.getVY();

            a.setVX(
                b.getVX()
            );

            a.setVY(
                b.getVY()
            );

            b.setVX(
                avx
            );

            b.setVY(
                avy
            );

        }

    },8);

}

container.addEventListener(
    "click",
    ()=>{

        if(
            modoFinal
        ){
            return;
        }

        let siguiente =
            formaActual + 1;

        if(
            siguiente >= formas.length
        ){

            activarModoFinal();

            return;

        }

        morph(
            siguiente
        );

        cambiarColorFondo(
            siguiente
        );

    }
);