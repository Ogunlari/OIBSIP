export const PizzaArt = () => (
    <svg viewBox="0 0 560 560" className="pizza-art" role="img" aria-label="A freshly baked pizza with cheese and toppings">
        <defs>
            <radialGradient id="pizzaGlow" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#FFF7E8" />
                <stop offset="100%" stopColor="#F0D7B2" />
            </radialGradient>
            <linearGradient id="pizzaCrust" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E7B05F" />
                <stop offset="100%" stopColor="#C97A2B" />
            </linearGradient>
            <linearGradient id="pizzaCheese" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFE29A" />
                <stop offset="100%" stopColor="#F3BF4F" />
            </linearGradient>
            <filter id="pizzaShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#5A3214" floodOpacity="0.22" />
            </filter>
        </defs>
        <circle cx="280" cy="280" r="255" fill="url(#pizzaGlow)" />
        <g filter="url(#pizzaShadow)">
            <circle cx="280" cy="280" r="225" fill="url(#pizzaCrust)" />
            <circle cx="280" cy="280" r="196" fill="#B65B24" />
            <circle cx="280" cy="280" r="184" fill="url(#pizzaCheese)" />
            <circle cx="280" cy="280" r="172" fill="#F6CA61" />
            <path d="M280 108a172 172 0 0 1 0 344a172 172 0 0 1 0-344Z" fill="#F8D67A" opacity="0.55" />
            <circle cx="220" cy="205" r="26" fill="#D9381E" />
            <circle cx="220" cy="205" r="19" fill="#C22F18" />
            <circle cx="342" cy="186" r="23" fill="#D9381E" />
            <circle cx="342" cy="186" r="17" fill="#C22F18" />
            <circle cx="362" cy="292" r="27" fill="#D9381E" />
            <circle cx="362" cy="292" r="20" fill="#C22F18" />
            <circle cx="254" cy="336" r="24" fill="#D9381E" />
            <circle cx="254" cy="336" r="18" fill="#C22F18" />
            <circle cx="177" cy="301" r="21" fill="#D9381E" />
            <circle cx="177" cy="301" r="15" fill="#C22F18" />
            <circle cx="291" cy="237" r="18" fill="#D9381E" />
            <circle cx="291" cy="237" r="13" fill="#C22F18" />
            <g fill="#3F7D4E">
                <path d="M200 241c13-20 32-23 44-10-9 17-27 23-44 10Z" />
                <path d="M301 168c18-6 32 4 33 20-18 7-32-3-33-20Z" />
                <path d="M320 337c17-11 33-5 38 10-16 11-33 5-38-10Z" />
                <path d="M204 360c13-15 30-14 40 1-12 15-29 14-40-1Z" />
            </g>
            <g fill="#FFF1C2" opacity="0.85">
                <ellipse cx="249" cy="181" rx="11" ry="6" transform="rotate(-28 249 181)" />
                <ellipse cx="376" cy="237" rx="10" ry="5" transform="rotate(35 376 237)" />
                <ellipse cx="211" cy="283" rx="12" ry="6" transform="rotate(20 211 283)" />
                <ellipse cx="305" cy="303" rx="10" ry="5" transform="rotate(-18 305 303)" />
                <ellipse cx="282" cy="388" rx="10" ry="5" transform="rotate(8 282 388)" />
            </g>
            <g fill="#B92E16" opacity="0.8">
                <circle cx="151" cy="235" r="4" />
                <circle cx="395" cy="340" r="4" />
                <circle cx="236" cy="394" r="4" />
                <circle cx="345" cy="134" r="4" />
            </g>
        </g>
        <g fill="#FFF7E8" opacity="0.9">
            <circle cx="96" cy="120" r="8" />
            <circle cx="474" cy="158" r="6" />
            <circle cx="451" cy="430" r="9" />
            <circle cx="112" cy="433" r="5" />
        </g>
    </svg>
);
