"use strict";

/*
    INFINITE WEBSITE
    ----------------

    Everything is deterministic.

    A seed produces a mathematical sequence.

    seed
      ↓
    hash
      ↓
    pseudo-random values
      ↓
    page generation
      ↓
    next seed
      ↓
    another page
*/

const STORAGE_KEY = "infiniteWebsite_v1";

const MAX_SEED = 999999;

/* --------------------------------------------------
   BASIC MATH
-------------------------------------------------- */

/*
    Convert anything into a predictable integer.

    The exact same input always produces
    the exact same output.
*/

function hashString(text) {

    let hash = 2166136261;

    for (let i = 0; i < text.length; i++) {

        hash ^= text.charCodeAt(i);

        hash = Math.imul(
            hash,
            16777619
        );
    }

    return hash >>> 0;
}


/*
    Deterministic pseudo-random generator.

    This is NOT Math.random().

    That means:

        random(12345)

    will always generate the same sequence.
*/

function createRandom(seed) {

    let state = seed >>> 0;

    return function () {

        state += 0x6D2B79F5;

        let t = state;

        t = Math.imul(
            t ^ (t >>> 15),
            t | 1
        );

        t ^= t + Math.imul(
            t ^ (t >>> 7),
            t | 61
        );

        return (
            (t ^ (t >>> 14)) >>> 0
        ) / 4294967296;
    };
}


/*
    Integer between min and max.
*/

function randomInt(random, min, max) {

    return Math.floor(
        random() * (max - min + 1)
    ) + min;
}


/*
    Pick something from an array.
*/

function choose(random, array) {

    return array[
        randomInt(
            random,
            0,
            array.length - 1
        )
    ];
}


/* --------------------------------------------------
   URL / SEED
-------------------------------------------------- */

function getSeedFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const value =
        Number(params.get("seed"));

    if (
        Number.isInteger(value) &&
        value >= 0 &&
        value <= MAX_SEED
    ) {
        return value;
    }

    return 847291;
}


/*
    This is the important part.

    The next page is NOT simply:

        seed + 1

    Instead we mathematically transform
    the current seed.
*/

function calculateNextSeed(seed) {

    let value =
        Math.imul(
            seed ^ 0x45d9f3b,
            0x45d9f3b
        );

    value ^= value >>> 16;

    value =
        Math.imul(
            value,
            0x45d9f3b
        );

    value ^= value >>> 16;

    value =
        Math.abs(value);

    return value % 1000000;
}


/*
    Another mathematical transformation.

    Used for generating the displayed ID.
*/

function calculatePageID(seed) {

    const a =
        Math.imul(
            seed,
            2654435761
        ) >>> 0;

    const b =
        (a ^ (a >>> 13)) >>> 0;

    const c =
        Math.imul(
            b,
            2246822519
        ) >>> 0;

    return c
        .toString(36)
        .toUpperCase()
        .padStart(7, "0")
        .slice(0, 7);
}


/* --------------------------------------------------
   PAGE DEPTH
-------------------------------------------------- */

/*
    We don't need to store depth in the URL.

    The current page's depth is stored locally.
*/

function loadState() {

    try {

        const raw =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!raw) {
            return {
                depth: 0,
                visited: [],
                discoveries: []
            };
        }

        const state =
            JSON.parse(raw);

        return {
            depth: Number(state.depth) || 0,
            visited: Array.isArray(state.visited)
                ? state.visited
                : [],
            discoveries: Array.isArray(state.discoveries)
                ? state.discoveries
                : []
        };

    } catch {

        return {
            depth: 0,
            visited: [],
            discoveries: []
        };
    }
}


function saveState(state) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );
}


/* --------------------------------------------------
   CONTENT GENERATION
-------------------------------------------------- */

const titles = [

    "THE NEXT POINT",
    "UNDEFINED SPACE",
    "CONTINUATION",
    "THE OTHER SIDE",
    "NO END FOUND",
    "RECURSION",
    "THE EMPTY ROOM",
    "SIGNAL RECEIVED",
    "ANOTHER INSTANCE",
    "THE DISTANCE",
    "UNKNOWN STRUCTURE",
    "BEYOND THE INDEX",
    "THE LOOP",
    "UNREGISTERED",
    "CONTINUE",
    "THE SYSTEM",
    "THE LAST PAGE",
    "NOT THE LAST PAGE"
];


const symbols = [
    "∞",
    "∅",
    "∴",
    "∑",
    "∆",
    "⊙",
    "◇",
    "□",
    "○",
    "△",
    "λ",
    "π",
    "Ψ",
    "Ω",
    "?"
];


const descriptions = [

    "The system generated another location. Nothing indicates that this is the final one.",

    "This location exists because another location pointed toward it.",

    "There is no record of this page existing before it was generated.",

    "The numbers are consistent. The result is not.",

    "Something calculated this page. Nobody knows what initiated the calculation.",

    "The structure continues beyond the boundary of the original document.",

    "This page contains exactly what the previous page mathematically requested.",

    "The system has produced another valid state.",

    "Nothing appears unusual about this location. That may be the unusual part.",

    "You have reached another point in the sequence.",

    "The seed has been transformed. The page has followed.",

    "There is another page after this one."
];


/* --------------------------------------------------
   SPECIAL EVENTS
-------------------------------------------------- */

function generateEvent(random, seed, depth) {

    /*
        Rare events become possible as the player
        gets deeper.
    */

    const roll =
        randomInt(random, 1, 1000);

    if (depth >= 25 && roll <= 4) {

        return {
            title: "THE SYSTEM NOTICED",
            description:
                `This page is ${depth} generations deep. ` +
                `The generator has detected repeated traversal.`,
            symbol: "!",
            special: true
        };
    }

    if (depth >= 50 && roll <= 8) {

        return {
            title: "THIS SHOULD NOT EXIST",
            description:
                "The sequence has continued farther than the original system was designed to observe.",
            symbol: "∅",
            special: true
        };
    }

    if (depth >= 100 && roll <= 15) {

        return {
            title: "GENERATION LIMIT: UNKNOWN",
            description:
                "The website has passed one hundred generated locations.",
            symbol: "∞",
            special: true
        };
    }

    return null;
}


/* --------------------------------------------------
   GENERATE PAGE
-------------------------------------------------- */

function generatePage(seed, state) {

    const random =
        createRandom(seed);

    const depth =
        state.depth;

    const event =
        generateEvent(
            random,
            seed,
            depth
        );

    const title =
        event
            ? event.title
            : choose(random, titles);

    const symbol =
        event
            ? event.symbol
            : choose(random, symbols);

    const description =
        event
            ? event.description
            : choose(
                random,
                descriptions
            );


    /*
        Generate some completely
        seed-dependent numbers.
    */

    const multiplier =
        randomInt(
            random,
            2,
            999
        );

    const offset =
        randomInt(
            random,
            1,
            99999
        );

    const exponent =
        randomInt(
            random,
            2,
            7
        );


    /*
        This doesn't merely DISPLAY the math.

        These values are actually produced
        from the seed.
    */

    const equation =
        `f(${seed}) = (((${seed} × ${multiplier}) + ${offset}) mod 1,000,000)`;

    return {

        seed,

        id: calculatePageID(seed),

        title,

        symbol,

        description,

        equation,

        multiplier,

        offset,

        exponent,

        special: !!event
    };
}


/* --------------------------------------------------
   NEXT PAGE
-------------------------------------------------- */

function goToNextPage() {

    const seed =
        getSeedFromURL();

    const nextSeed =
        calculateNextSeed(seed);

    window.location.href =
        `?seed=${nextSeed}`;
}


/*
    Go to a mathematically related seed,
    rather than simply the next page.

    This creates branching paths.
*/

function goToCalculatedPage(type) {

    const seed =
        getSeedFromURL();

    let newSeed;

    switch (type) {

        case "square":

            newSeed =
                (seed * seed) % 1000000;

            break;

        case "reverse":

            newSeed =
                Number(
                    String(seed)
                        .padStart(6, "0")
                        .split("")
                        .reverse()
                        .join("")
                );

            break;

        case "xor":

            newSeed =
                (seed ^ 734287) % 1000000;

            if (newSeed < 0) {
                newSeed += 1000000;
            }

            break;

        case "hash":

            newSeed =
                hashString(
                    String(seed)
                ) % 1000000;

            break;

        default:

            newSeed =
                calculateNextSeed(seed);
    }

    window.location.href =
        `?seed=${newSeed}`;
}


/* --------------------------------------------------
   RENDER
-------------------------------------------------- */

function renderPage() {

    const seed =
        getSeedFromURL();

    const state =
        loadState();

    /*
        If this seed hasn't been visited,
        increase depth.
    */

    const alreadyVisited =
        state.visited.includes(seed);

    if (!alreadyVisited) {

        state.visited.push(seed);

        state.depth++;

        /*
            Prevent localStorage from becoming
            ridiculously large.
        */

        if (state.visited.length > 1000) {

            state.visited =
                state.visited.slice(-1000);
        }
    }

    const page =
        generatePage(
            seed,
            state
        );

    saveState(state);


    /*
        HTML
    */

    document.title =
        `${page.id} — Infinite`;


    document.getElementById(
        "pageTitle"
    ).textContent =
        page.title;


    document.getElementById(
        "seedDisplay"
    ).textContent =
        String(seed).padStart(6, "0");


    document.getElementById(
        "depthDisplay"
    ).textContent =
        state.depth;


    document.getElementById(
        "idDisplay"
    ).textContent =
        page.id;


    document.getElementById(
        "visitedDisplay"
    ).textContent =
        state.visited.length;


    document.getElementById(
        "symbol"
    ).textContent =
        page.symbol;


    document.getElementById(
        "mainHeading"
    ).textContent =
        page.title;


    document.getElementById(
        "description"
    ).textContent =
        page.description;


    document.getElementById(
        "equation"
    ).textContent =
        page.equation;


    /*
        Buttons
    */

    const actions =
        document.getElementById(
            "actions"
        );

    actions.innerHTML = "";


    addButton(
        actions,
        "GENERATE NEXT",
        goToNextPage
    );


    addButton(
        actions,
        "SQUARE SEED",
        () => goToCalculatedPage("square")
    );


    addButton(
        actions,
        "REVERSE SEED",
        () => goToCalculatedPage("reverse")
    );


    addButton(
        actions,
        "XOR SEED",
        () => goToCalculatedPage("xor")
    );


    addButton(
        actions,
        "HASH SEED",
        () => goToCalculatedPage("hash")
    );


    renderHistory(state);
}


/* --------------------------------------------------
   BUTTON
-------------------------------------------------- */

function addButton(
    container,
    text,
    callback
) {

    const button =
        document.createElement(
            "button"
        );

    button.className =
        "actionButton";

    button.textContent =
        text;

    button.addEventListener(
        "click",
        callback
    );

    container.appendChild(
        button
    );
}


/* --------------------------------------------------
   HISTORY
-------------------------------------------------- */

function renderHistory(state) {

    const history =
        document.getElementById(
            "history"
        );

    history.innerHTML = "";


    const recent =
        state.visited
            .slice(-25)
            .reverse();


    for (
        const seed of recent
    ) {

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "historyItem";


        const id =
            calculatePageID(seed);


        item.innerHTML = `
            <span>SEED ${String(seed).padStart(6, "0")}</span>
            <span>${id}</span>
        `;


        item.style.cursor =
            "pointer";


        item.addEventListener(
            "click",
            () => {

                window.location.href =
                    `?seed=${seed}`;

            }
        );


        history.appendChild(
            item
        );
    }
}


/* --------------------------------------------------
   CLEAR DATA
-------------------------------------------------- */

document
    .getElementById(
        "clearHistory"
    )
    .addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                STORAGE_KEY
            );

            window.location.href =
                "?seed=847291";
        }
    );


/* --------------------------------------------------
   START
-------------------------------------------------- */

renderPage();