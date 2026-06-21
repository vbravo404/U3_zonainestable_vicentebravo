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
    document.body.style.backgroundColor = coloresFondo[indice];
}

const shape = document.getElementById("shape");
const container = document.getElementById("container");
const world = document.getElementById("world");

const formas = [
    /* Forma 1 - Rectángulo horizontal */
    [
        [10,40],[90,40],[90,40],[90,40],
        [90,60],[10,60],[10,60],[10,60]
    ],
    /* Forma 2 - Rectángulo vertical */
    [
        [30,25],[60,25],[60,25],[60,25],
        [60,75],[30,75],[30,75],[30,75]
    ],
    /* Forma 3 - Punta */
    [
        [30,25],[60,25],[60,75],[50,90],
        [50,90],[40,90],[30,75],[30,25]
    ],
    /* Forma 4 - Hexágono */
    [
        [30,15],[70,15],[90,50],[70,85],
        [30,85],[10,50],[10,50],[30,15]
    ]
];

let formaActual = 0;
let modoFinal = false;
let reiniciando = false;

// Para saber si venimos del círculo final y debemos reiniciar el loop
let postReinicio = false; 

// --- SOLUCIÓN 2: Nueva variable para controlar que estamos en la segunda pasada (loop) ---
let esLoop = false; 

function actualizarSVG(puntos){
    const texto = puntos.map(p => `${p[0]},${p[1]}`).join(" ");
    shape.setAttribute("points", texto);
}

actualizarSVG(formas[0]);

function interpolar(a,b,t){
    return a + (b-a)*t;
}

function morph(indiceDestino){
    const inicio = formas[formaActual];
    const destino = formas[indiceDestino];
    const duracion = 900;
    let inicioTiempo = null;

    function frame(tiempo){
        if(!inicioTiempo){
            inicioTiempo = tiempo;
        }

        let progreso = (tiempo - inicioTiempo) / duracion;
        progreso = Math.min(progreso, 1);

        const eased = 0.5 - Math.cos(progreso*Math.PI)/2;
        const puntos = [];

        for(let i=0; i<inicio.length; i++){
            puntos.push([
                interpolar(inicio[i][0], destino[i][0], eased),
                interpolar(inicio[i][1], destino[i][1], eased)
            ]);
        }

        actualizarSVG(puntos);

        if(progreso < 1){
            requestAnimationFrame(frame);
        }
    }

    requestAnimationFrame(frame);
    formaActual = indiceDestino;
}

function crearPiezaMatter(x, y){
    const formaIndice = Math.floor(Math.random() * 4);
    const color = coloresPiezas[Math.floor(Math.random() * coloresPiezas.length)];
    let vertices;

    switch(formaIndice){
        case 0: //pieza 1 - HEXÁGONO
            vertices = [ 
                {x:-120,y:0}, {x:-60,y:-105}, {x:60,y:-105}, 
                {x:120,y:0}, {x:60,y:105}, {x:-60,y:105}
            ];
            break;
        case 1: //pieza 2 - NORMAL (RECTÁNGULO)
            vertices = [ 
                {x:-45,y:-90}, {x:45,y:-90}, {x:45,y:90}, {x:-45,y:90}
            ];
            break;
        case 2: //pieza 3 - ESPECIAL (RECTÁNGULO CON PUNTA)
            vertices = [
                {x:-45,y:-40}, {x:-18,y:-90}, {x:18,y:-90}, 
                {x:45,y:-40}, {x:45,y:90}, {x:-45,y:90}
            ];
            break;
        default: //pieza 4 - PILAR
            vertices = [ 
                {x:-35,y:-140}, {x:35,y:-140}, {x:35,y:140}, {x:-35,y:140}
            ];
    }

    let pieza = Bodies.fromVertices(
        x, y, [vertices],
        {
            restitution:0.95,
            friction:0,
            frictionAir:0.002,
            render:{ fillStyle:color }
        },
        true
    );

    if(Array.isArray(pieza)){
        pieza = pieza[0];
    }

    Composite.add(physicsWorld, pieza);

    Body.setVelocity(pieza, {
        x: (Math.random()-0.5) * 12,
        y: (Math.random()-0.5) * 12
    });

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
let matterRunner = null; 
let matterRender = null; 
let bolaCreada = false;
let bola3D = null;

const piezasDestruyendose = new Set();
let faseSiguienteIniciada = false; 

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

window.addEventListener("mousemove", (e)=>{
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function iniciarMatter(){
    engine = Engine.create();
    engine.gravity.y = 0;
    physicsWorld = engine.world;

    matterRender = Render.create({
        element: world,
        engine,
        options:{
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes:false,
            background:"transparent"
        }
    });

    Render.run(matterRender);

    matterRunner = Runner.create();
    Runner.run(matterRunner, engine);

    Events.on(engine, "beforeUpdate", ()=>{
        if(!bola3D){ return; }

        Body.setVelocity(bola3D, {
            x: (mouseX - bola3D.position.x) * 0.3,
            y: (mouseY - bola3D.position.y) * 0.3
        });
    });

    Events.on(engine, "afterUpdate", ()=>{
        // Sincroniza el modelo 3D con la bola física
        if(bola3D){
            const escena = document.getElementById("escena3d");
            if(escena) {
                escena.style.left = bola3D.position.x + "px";
                escena.style.top = bola3D.position.y + "px";
            }
        }

        const margen = 300;

        const piezasActivas = Composite.allBodies(physicsWorld).filter(body =>
            !body.isStatic &&
            body !== bola3D &&
            !piezasDestruyendose.has(body.id)
        );

        Composite.allBodies(physicsWorld).forEach(body=>{
            if(body.isStatic || body === bola3D){ return; }

            // PROTECCIÓN FINAL (evita que se escapen las últimas 2 piezas)
            if(piezasActivas.length <= 2){
                const margenPantalla = 50;
                const x = Math.max(margenPantalla, Math.min(window.innerWidth - margenPantalla, body.position.x));
                const y = Math.max(margenPantalla, Math.min(window.innerHeight - margenPantalla, body.position.y));

                if(x !== body.position.x || y !== body.position.y){
                    Body.setPosition(body, {x,y});
                    Body.setVelocity(body, {
                        x: -body.velocity.x * 0.8,
                        y: -body.velocity.y * 0.8
                    });
                }
                return;
            }

            // COMPORTAMIENTO NORMAL
            if(
                body.position.x < -margen ||
                body.position.x > window.innerWidth + margen ||
                body.position.y < -margen ||
                body.position.y > window.innerHeight + margen
            ){
                Composite.remove(physicsWorld, body);
                piezasDestruyendose.delete(body.id);
            }
        });

        revisarFinDeFase();
    });

    Composite.add(physicsWorld, [
        Bodies.rectangle(window.innerWidth/2, -30, window.innerWidth, 60, {isStatic:true}),
        Bodies.rectangle(window.innerWidth/2, window.innerHeight+30, window.innerWidth, 60, {isStatic:true}),
        Bodies.rectangle(-30, window.innerHeight/2, 60, window.innerHeight, {isStatic:true}),
        Bodies.rectangle(window.innerWidth+30, window.innerHeight/2, 60, window.innerHeight, {isStatic:true})
    ]);

    const mouse = Mouse.create(matterRender.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint:{ stiffness:0.2, render:{ visible:false } }
    });

    Composite.add(physicsWorld, mouseConstraint);

    let ultimoSpawn = 0;
    const intervaloSpawn = 100;

    Events.on(engine, "collisionStart", (event)=>{
        const ahora = Date.now();

        event.pairs.forEach(pair=>{
            if(bola3D && (pair.bodyA === bola3D || pair.bodyB === bola3D)){
                const pieza = pair.bodyA === bola3D ? pair.bodyB : pair.bodyA;
                
                if(pieza !== bola3D && !pieza.isStatic && !piezasDestruyendose.has(pieza.id)){
                    destruirPiezaSuavemente(pieza);
                }
                return;
            }

            const a = pair.bodyA;
            const b = pair.bodyB;

            if(a === bola3D || b === bola3D) return;
            if(a.isStatic || b.isStatic) return;
            if(ahora - ultimoSpawn < intervaloSpawn) return;

            const puntoColision = {
                x: pair.collision.supports[0].x,
                y: pair.collision.supports[0].y
            };

            const cuerposDinamicos = Composite.allBodies(physicsWorld).filter(body =>
                !body.isStatic && body !== bola3D
            );

            if(cuerposDinamicos.length < 100 && !bolaCreada){
                ultimoSpawn = ahora;
                crearPiezaMatter(
                    puntoColision.x + (Math.random()-0.5) * 40,
                    puntoColision.y + (Math.random()-0.5) * 40
                );
            } else if(!bolaCreada){
                bolaCreada = true;
                transicionAparicionBola();
            }
        });
    });
}

function fadeOverlay(color, duracion = 150){
    return new Promise(resolve=>{
        const overlay = document.getElementById("flashOverlay");
        if(!overlay) { resolve(); return; } // Chequeo por seguridad
        
        overlay.style.transition = "none";
        overlay.style.background = color;
        overlay.style.opacity = "1";

        requestAnimationFrame(()=>{
            overlay.style.transition = `opacity ${duracion}ms ease`;
            overlay.style.opacity = "0.5";
            setTimeout(()=>{
                overlay.style.opacity = "0";
                setTimeout(resolve, duracion);
            },duracion);
        });
    });
}

async function transicionAparicionBola(){
    await new Promise(resolve => setTimeout(resolve, 4000));
    await fadeOverlay("#000000", 180);
    await fadeOverlay("#ffffff", 180);
    mostrarBola3D();
}

function mostrarBola3D(){
    bolaCreada = true;
    const escena = document.getElementById("escena3d");
    if(escena) {
        // --- SOLUCIÓN 3 (Preventiva): Nos aseguramos de que entre sin scale gigante ---
        escena.style.transition = "none";
        escena.style.transform = "translate(-50%,-50%) scale(1)";
        escena.style.display = "block";
    }

    const radioBola = 120;
    bola3D = Bodies.circle(
        window.innerWidth/2,
        window.innerHeight/2,
        radioBola,
        {
            restitution:0.4,
            friction:0,
            frictionAir:0.005,
            density:0.1,
            render:{ visible:false }
        }
    );

    Composite.add(physicsWorld, bola3D);
    Body.setMass(bola3D, 5000);
    Body.setInertia(bola3D, Infinity);
}

function destruirPiezaSuavemente(pieza){
    if(piezasDestruyendose.has(pieza.id)){ return; }

    piezasDestruyendose.add(pieza.id);
    Body.setVelocity(pieza, {x:0, y:0});
    Body.setAngularVelocity(pieza, 0);
    Body.setStatic(pieza, true);

    pieza.render.sprite = { xScale: 1, yScale: 1 };
    let pasos = 8;

    const animacion = setInterval(()=>{
        pasos--;
        const progreso = 1 - (pasos / 8);
        pieza.render.opacity = pasos / 8;
        pieza.render.sprite.xScale = 1 + (progreso * 0.25);
        pieza.render.sprite.yScale = 1 + (progreso * 0.25);

        if(pasos <= 0){
            clearInterval(animacion);
            Composite.remove(physicsWorld, pieza);
            piezasDestruyendose.delete(pieza.id);
            revisarFinDeFase();
        }
    },15);
}

function revisarFinDeFase(){
    if(faseSiguienteIniciada){ return; }

    if(!bolaCreada || !bola3D){ return; }

    const piezasRestantes = Composite.allBodies(physicsWorld).filter(body =>
        body !== bola3D &&
        !body.isStatic &&
        !piezasDestruyendose.has(body.id)
    );

    if(piezasRestantes.length === 0 && piezasDestruyendose.size === 0){
        faseSiguienteIniciada = true;
        iniciarReinicio();
    }
}

function iniciarReinicio(){
    if(reiniciando){ return; }
    reiniciando = true;

    const escena = document.getElementById("escena3d");
    document.body.style.transition = "background-color 1.8s ease";
    document.body.style.backgroundColor = "#000";

    if(escena) {
        escena.style.transition = "transform 1.8s ease";
        escena.style.transform = "translate(-50%,-50%) scale(12)";
    }

    setTimeout(()=>{
        if(escena) escena.style.display = "none";
        container.style.display = "none";
        crearCirculoFinal();
    },1800);
}

function crearCirculoFinal() {
    // 1. Contenedor padre
    const overlay = document.createElement("div");
    overlay.id = "overlay-reinicio";

    // 2. Contenedor del texto y botón
    const uiContenedor = document.createElement("div");
    uiContenedor.className = "ui-contenedor";

    const texto = document.createElement("p");
    texto.className = "texto-reinicio";
    texto.innerText = "PRESIONA EL CÍRCULO PARA REPETIR LA EXPERIENCIA \n";

    const boton = document.createElement("a");
    boton.className = "btn-volver";
    boton.innerText = "O VUELVE AL INICIO";
    boton.href = "../index.html"; 

    uiContenedor.appendChild(texto);
    uiContenedor.appendChild(boton);

    // 3. Círculo
    const circulo = document.createElement("div");
    circulo.id = "circulo-reinicio";

    // 4. Armar estructura
    overlay.appendChild(uiContenedor);
    overlay.appendChild(circulo);
    document.body.appendChild(overlay);

    // 5. Animación escalonada
    requestAnimationFrame(() => {
        // Aparece el círculo inmediatamente
        circulo.style.opacity = "1";

        // Esperamos 2000ms (2 segundos) para mostrar el texto
        setTimeout(() => {
            uiContenedor.style.opacity = "1";
        }, 700);
    });

    // Lógica del Círculo
    circulo.addEventListener("click", () => {
        // Al clickear, desaparecemos ambos suavemente
        uiContenedor.style.opacity = "0";
        circulo.style.opacity = "0";
        
        mostrarHexagonoInicial();
        
        setTimeout(() => {
            overlay.remove();
        }, 600);
    }, {once: true});
}

function mostrarHexagonoInicial(){
    // DETENER MATTER.JS POR COMPLETO
    if(matterRunner){ Runner.stop(matterRunner); }
    if(matterRender){ Render.stop(matterRender); }
    if(engine){ Events.off(engine); Engine.clear(engine); }
    if(physicsWorld){ Composite.clear(physicsWorld, false); }

    world.innerHTML = "";
    bola3D = null;
    bolaCreada = false;
    faseSiguienteIniciada = false;
    reiniciando = false;
    modoFinal = false;
    piezasDestruyendose.clear();
    
    // Activa la bandera para reiniciar el loop de polígonos
    postReinicio = true;
    
    // --- SOLUCIÓN 2: Marcamos que estamos en un loop para no repetir hexágonos ---
    esLoop = true; 

    // --- SOLUCIÓN 3: Reseteamos la escala gigante de la bola 3D de inmediato ---
    const escena = document.getElementById("escena3d");
    if(escena) {
        escena.style.transition = "none";
        escena.style.transform = "translate(-50%,-50%) scale(1)";
    }

    document.body.style.backgroundColor = coloresFondo[3];
    container.style.display = "block";
    container.style.pointerEvents = "auto";
    container.style.opacity = "0";
    container.style.transition = "opacity 1200ms ease";

    actualizarSVG(formas[3]);
    shape.style.fill = "#ffffff";
    formaActual = 3;

    requestAnimationFrame(()=>{
        container.style.opacity = "1";
    });
}

function reiniciarExperiencia(circulo){
    if(physicsWorld) Composite.clear(physicsWorld, false);
    if(engine) Engine.clear(engine);

    world.innerHTML = "";
    bola3D = null;
    bolaCreada = false;
    faseSiguienteIniciada = false;
    reiniciando = false;
    modoFinal = false;
    piezasDestruyendose.clear();
    formaActual = 0;
    
    esLoop = false; // Reset de la bandera del loop

    actualizarSVG(formas[0]);
    cambiarColorFondo(0);
    document.body.style.background = coloresFondo[0];
    document.body.style.transition = "background-color 1.2s ease";
    container.style.display = "block";
    
    const escena = document.getElementById("escena3d");
    if(escena) {
        escena.style.display = "none";
        escena.style.transition = "none"; 
        escena.style.transform = "translate(-50%,-50%) scale(1)";
    }
    
    if(circulo) circulo.remove();
}

function activarModoFinal(){
    modoFinal = true;
    document.body.style.backgroundColor = "#ffffff";
    container.style.display = "none";

    iniciarMatter();
    
    // --- NUEVA LÍNEA AQUÍ ---
    mostrarInstruccion();

    crearPiezaMatter(window.innerWidth * 0.4, window.innerHeight * 0.5);
    crearPiezaMatter(window.innerWidth * 0.6, window.innerHeight * 0.5);
}

function mostrarInstruccion() {
    const div = document.createElement("div");
    div.id = "instrucciones";
    div.innerText = "¡HAZ CHOCAR LAS PIEZAS!";
    document.body.appendChild(div);

    // Fade-in
    setTimeout(() => div.style.opacity = "1", 100);

    // Función para eliminarlo al primer click
    const remover = () => {
        div.style.opacity = "0";
        setTimeout(() => div.remove(), 800);
        window.removeEventListener("mousedown", remover);
    };

    // Escuchamos el primer click en cualquier parte de la ventana
    window.addEventListener("mousedown", remover, {once: true});
}

container.addEventListener("click", ()=>{
    if(modoFinal){ return; }

    // Si venimos del círculo final, el primer click reiniciará al Polígono #1
    if(postReinicio){
        postReinicio = false;
        morph(0);
        cambiarColorFondo(0);
        return;
    }

    // --- SOLUCIÓN 2: Si estamos en el loop, evitamos que llegue a la forma 3 de nuevo ---
    if (esLoop && formaActual === 2) {
        activarModoFinal();
        return;
    }

    // Comportamiento normal (0 -> 1 -> 2 -> 3 -> Matter)
    let siguiente = formaActual + 1;

    if(siguiente >= formas.length){
        activarModoFinal();
        return;
    }

    morph(siguiente);
    cambiarColorFondo(Math.min(siguiente, coloresFondo.length - 1));
});