const pieza =
    document.querySelector(".pieza");

window.addEventListener(
    "scroll",
    ()=>{

        const scroll =
            window.scrollY;

        pieza.style.transform =
            `translateY(${scroll * 0.15}px)`;

    }
);

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
                scrollY >= top &&
                scrollY < top + height
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