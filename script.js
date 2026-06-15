const pieza =
    document.querySelector(".pieza");

window.addEventListener(
    "scroll",
    ()=>{

        if(!pieza){
            return;
        }

        const scroll =
            window.scrollY;

        pieza.style.transform =
            `translateY(${scroll * 0.15}px)`;

    }
);

window.addEventListener(
    "scroll",
    controlarLogo
);

window.addEventListener(
    "load",
    controlarLogo
);

// =====================
// NAVEGACIÓN ACTIVA
// =====================

const sections =
    document.querySelectorAll("section");

const navLinks =
    document.querySelectorAll("nav a");

window.addEventListener(
    "scroll",
    ()=>{

        let current = "";

        sections.forEach(section=>{

            const top =
                section.offsetTop - 150;

            const height =
                section.offsetHeight;

            if(
                window.scrollY >= top &&
                window.scrollY < top + height
            ){

                current =
                    section.id;

            }

        });

        navLinks.forEach(link=>{

            link.classList.remove(
                "active"
            );

            const href =
                link.getAttribute(
                    "href"
                );

            if(
                href ===
                "#" + current
            ){

                link.classList.add(
                    "active"
                );

            }

        });

    }
);

// =====================
// PIEZAS DE FONDO
// =====================

const fondo =
    document.getElementById(
        "background-pieces"
    );

if(!fondo){

    console.warn(
        "No existe #background-pieces"
    );

}else{

    const formas = [

        // Hexágono

        "polygon(25% 15%,75% 15%,100% 50%,75% 85%,25% 85%,0% 50%)",

        // Horizontal

        "polygon(0% 25%,100% 25%,100% 25%,100% 75%,0% 75%,0% 75%)",

        // Especial

        "polygon(40% 0%,60% 0%,75% 25%,75% 100%,25% 100%,25% 25%)",

        // Vertical

        "polygon(25% 0%,75% 0%,75% 0%,75% 100%,25% 100%,25% 100%)"

    ];

    const colores = [

        "#fdbec2",
        "#8a0b31",
        "#80c3ce"

    ];

    const piezas = [];

    for(let i=0;i<60;i++){

        const pieza =
            document.createElement("div");

        pieza.classList.add(
            "bg-piece"
        );

        const size =
            120 +
            Math.random()*120;

        pieza.style.width =
            size + "px";

        pieza.style.height =
            size + "px";

        pieza.style.left =
            (Math.random()*90) + "%";

        pieza.style.top =
            (Math.random()*200) + "%";

        const formaInicial =
            Math.floor(
                Math.random() *
                formas.length
            );

        pieza.style.clipPath =
            formas[formaInicial];

        pieza.style.background =

            colores[
                Math.floor(
                    Math.random() *
                    colores.length
                )
            ];

        pieza.style.transition =
            "clip-path 2.5s ease";

        fondo.appendChild(
            pieza
        );

        const piezaData = {

            el:pieza,

            baseX:
                parseFloat(
                    pieza.style.left
                ),

            baseY:
                parseFloat(
                    pieza.style.top
                ),

            speed:
                0.2 +
                Math.random()*0.6,

            rotation:
                Math.random()*360,

            formaActual:
                formaInicial

        };

        piezas.push(
            piezaData
        );

        // Morph independiente

        setInterval(()=>{

            let nuevaForma =
                Math.floor(
                    Math.random() *
                    formas.length
                );

            while(
                nuevaForma ===
                piezaData.formaActual
            ){

                nuevaForma =
                    Math.floor(
                        Math.random() *
                        formas.length
                    );

            }

            piezaData.formaActual =
                nuevaForma;

            piezaData.el.style.clipPath =
                formas[nuevaForma];

        },
        4000 +
        Math.random()*8000);

    }

    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener(
        "mousemove",
        e=>{

            mouseX =
                (
                    e.clientX /
                    window.innerWidth
                ) - 0.5;

            mouseY =
                (
                    e.clientY /
                    window.innerHeight
                ) - 0.5;

        }
    );

    function animarFondo(){

        const scroll =
            window.scrollY;

        piezas.forEach(p=>{

            p.rotation +=
                0.02 *
                p.speed;

            p.el.style.transform =

                `translate(
                    ${mouseX * 100 * p.speed}px,
                    ${mouseY * 100 * p.speed}px
                )

                translateY(
                    ${scroll * p.speed * 0.25}px
                )

                rotate(
                    ${p.rotation}deg
                )`;

        });

        requestAnimationFrame(
            animarFondo
        );

    }

    animarFondo();

}

const logo =
    document.querySelector(
        ".logo"
    );

const hero =
    document.getElementById(
        "hero"
    );

function controlarLogo(){

    const limite =
        hero.offsetHeight * 0.8;

    const header =
        document.querySelector(
            "header"
        );

    if(
        window.scrollY > limite
    ){

        header.classList.add(
            "visible"
        );

    }else{

        header.classList.remove(
            "visible"
        );

    }

}