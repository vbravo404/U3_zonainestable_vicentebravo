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

function crearPiezaMatter(){

    const formaIndice =
        Math.floor(
            Math.random() * 4
        );

    const color =
        coloresPiezas[
            Math.floor(
                Math.random() *
                coloresPiezas.length
            )
        ];

    let vertices;

    switch(formaIndice){

        case 0:

            vertices = [
                {x:-96,y:-24},
                {x:96,y:-24},
                {x:96,y:24},
                {x:-96,y:24}
            ];

        break;

        case 1:

            vertices = [
                {x:-36,y:-90},
                {x:36,y:-90},
                {x:36,y:90},
                {x:-36,y:90}
            ];

        break;

        case 2:

            vertices = [
                {x:-40,y:-70},
                {x:40,y:-70},
                {x:40,y:20},
                {x:0,y:90},
                {x:-40,y:20}
            ];

        break;

        default:

            vertices = [
                {x:-60,y:-45},
                {x:0,y:-90},
                {x:60,y:-45},
                {x:60,y:45},
                {x:0,y:90},
                {x:-60,y:45}
            ];

    }

    let pieza =
        Bodies.fromVertices(

            Math.random() *
            window.innerWidth,

            Math.random() *
            window.innerHeight,

            [vertices],

            {

                restitution:1,

                friction:0,

                frictionAir:0,

                render:{
                    fillStyle:color
                }

            },

            true

        );

    if(
        Array.isArray(pieza)
    ){
        pieza = pieza[0];
    }

    Composite.add(
        physicsWorld,
        pieza
    );

    Body.setVelocity(
        pieza,
        {

            x:
                (Math.random()-0.5)
                * 12,

            y:
                (Math.random()-0.5)
                * 12

        }
    );

    return pieza;
}

// =====================
// MATTER
// =====================

const Engine = Matter.Engine;
const Render = Matter.Render;
const Runner = Matter.Runner;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Composite = Matter.Composite;
const Mouse = Matter.Mouse;
const MouseConstraint = Matter.MouseConstraint;
const Events = Matter.Events;

let engine = null;
let physicsWorld = null;

function iniciarMatter(){

    engine =
        Engine.create();

    engine.gravity.y = 0;

    physicsWorld =
        engine.world;

    const render =
        Render.create({

            element: world,

            engine,

            options:{

                width:
                    window.innerWidth,

                height:
                    window.innerHeight,

                wireframes:false,

                background:"transparent"

            }

        });

    Render.run(render);

    const runner =
        Runner.create();

    Runner.run(
        runner,
        engine
    );

    Composite.add(
        physicsWorld,
        [

            Bodies.rectangle(
                window.innerWidth/2,
                -30,
                window.innerWidth,
                60,
                {isStatic:true}
            ),

            Bodies.rectangle(
                window.innerWidth/2,
                window.innerHeight+30,
                window.innerWidth,
                60,
                {isStatic:true}
            ),

            Bodies.rectangle(
                -30,
                window.innerHeight/2,
                60,
                window.innerHeight,
                {isStatic:true}
            ),

            Bodies.rectangle(
                window.innerWidth+30,
                window.innerHeight/2,
                60,
                window.innerHeight,
                {isStatic:true}
            )

        ]
    );

    const mouse =
        Mouse.create(
            render.canvas
        );

    const mouseConstraint =
        MouseConstraint.create(
            engine,
            {
                mouse
            }
        );

    Composite.add(
        physicsWorld,
        mouseConstraint
    );

    let ultimoSpawn = 0;

    Events.on(
    engine,
    "collisionStart",
    ()=>{

        const ahora =
            Date.now();

        if(
            ahora -
            ultimoSpawn <
            400
        ){
            return;
        }

        ultimoSpawn =
            ahora;

        const cuerpos =
            Composite.allBodies(
                physicsWorld
            );

        if(
            cuerpos.length < 30
        ){
            crearPiezaMatter();
        }

    }
);
}

function activarModoFinal(){

    modoFinal = true;

    document.body.style.backgroundColor =
        "#ffffff";

    container.style.display =
        "none";

    iniciarMatter();

    crearPiezaMatter();

    crearPiezaMatter();
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

