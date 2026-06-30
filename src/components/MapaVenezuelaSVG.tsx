'use client'

import { motion } from 'framer-motion'

// Bounding box: x=0..1000, y=0..600
// Projected from public/data/venezuela.geojson:
// minLng=-73.5, maxLng=-62.0, minLat=8.0, maxLat=13.0
const VENEZUELA_PATHS = [
  "M720.7 251.2L716 253.9L707.4 251.2L703.1 247.5L705.8 243.1L712.8 243.1L719.4 248.4L720.7 251.2Z",
  "M839.2 224.3L842 240L841.1 242.9L833.2 253.5L826.6 254.3L821.3 253.9L817.3 251.8L812.1 244.9L807 247L794.6 244.6L791.1 242.2L795.8 233.8L804.4 230.4L807.5 229.7L810 234.8L816.3 239.3L823.6 239.8L825.5 231.8L835.4 219.9L839.2 224.3Z",
  "M325 158.9L329.4 172.3L336.4 182.4L341.8 181.7L345.6 180.1L371.1 177.8L386.6 184.7L406.3 188.2L424.7 202.9L443.6 220.7L448.4 233.7L450 246.1L454.6 254.4L450 263L452.5 277.3L457.9 291.7L466.1 300.9L489.4 303.4L514.7 297.2L553.6 291.6L566.2 286.7L630.7 284.1L643 291L644.2 297.9L644.3 303.2L665.1 329.1L682.1 332.6L696.6 340.9L711.5 345.3L727.9 351.6L737.1 350.8L744 348.6L752.1 348.2L809.7 305.1L840.5 306.2L845.3 303.4L849.4 299.6L838 293L812.4 290.5L804.6 294.9L800.2 283.8L808.5 284.1L837.1 280.3L869.8 282.8L896.5 274.9L910 273.6L917.7 275.2L938.9 270L978.9 276.1L1010.5 271.1L1006.8 278.2L996.5 282.6L979.7 283.9L967 294.4L939.7 292.4L920.6 296.2L926.7 299.1L926.7 309.8L929.3 312L932.1 312.1L938.6 320L940.4 325.2L942.5 336.2L939.6 348L935.6 353.3L943.4 351.5L947.8 346L947.1 340.4L947.8 333.9L952.1 335.9L955.2 338.9L965.1 369.8L972.1 386L973.9 385.4L975.6 384.8L977.7 381.7L980.8 374.1L983.4 378.9L985 380.8L986.7 381.4L985.2 374.5L987.2 365.6L986.5 362.5L989.6 361.8L993.3 363L998.6 365.4L1007.9 375.6L1014.2 386.2L1014.7 392L1016.9 395.3L1021 398.8L1023 404.3L1023.3 395.7L1020.9 389.5L1020.4 382.3L1032.6 382L1035.8 372.7L1042.4 378.3L1060.1 404L1066.6 408.3L1085.8 413.2L1097.9 425.6L1105 436.7L1100.8 448.4L1089.5 454.2L1084.9 461.4L1082.3 468.6L1082.3 475.8L1078.9 484.1L1078.4 487L1076.3 498.8L1071.7 513L1065.5 528L1033.2 528.3L1041.1 534.5L1048.5 539L1060.5 550.8L1070.1 541.5L1083.8 540.8L1098.7 530.5L1104.3 528.9L1132 534.3L1138.7 526.8L1144.3 524.5L1159.3 526L1172.4 534.1L1188.6 563.3L1188.8 566.5L1187 570.2L1177 577L1174.7 580.6L1171.1 593.6L1158.4 600.7L1149.7 609.7L1143.8 617.5L1140.8 620.7L1129.3 622.4L1125.5 627.4L1120.9 642.2L1117.4 648.4L1111.4 655.7L1111.4 660.2L1119.7 676.4L1121.2 681.5L1118.6 689.2L1118.8 694.7L1123.2 701.3L1128.4 702.8L1133.5 700L1139.8 700.3L1143.9 702L1145.6 703.9L1145.9 709L1143.3 719.7L1139.6 726.6L1122.9 737.2L1115.6 743.3L1111.5 747.8L1102.5 745.4L1098 745.6L1094.5 749.1L1092.3 752.1L1086.3 752.8L1077.8 754.6L1074.3 756.7L1071.5 761.9L1069.3 769.4L1071.2 778.4L1073.8 786.4L1073.7 793.8L1075.8 814.3L1073.1 819.1L1067.4 824.5L1060.6 834.1L1053 847.3L1054.2 851.2L1072.4 879.1L1091 907.5L1109.4 935.8L1112 937L1115.5 940.3L1118.7 950.2L1121.3 960.7L1121.4 966.1L1119.3 972.9L1114.9 980.7L1109.4 987.1L1101.4 992.5L1095.1 997.6L1089.9 1011L1086.7 1015.8L1083.8 1017.7L1078 1019.4L1068.7 1019L1062.6 1018L1055 1028L1045.3 1031.7L1038.8 1045.5L1015.6 1056.4L992.9 1064.8L986.7 1068.2L964.3 1061.2L958.9 1063.4L952.7 1069.9L947 1074.9L942.1 1075.2L938.1 1077.8L935.7 1087.2L933.5 1119.2L925.5 1128.8L915.8 1128.7L909.1 1117.6L901.2 1109.2L887.4 1089.3L883.6 1086.7L880 1086.9L867.2 1092.8L861.2 1090.2L856.3 1087.1L848.1 1088.1L833.5 1088.3L824.2 1088.5L819.7 1083.1L815.5 1072L812.7 1068L809.3 1064.8L803.9 1063.2L780.4 1063.2L776 1063.2L772.7 1061.1L768.2 1051.5L763.3 1047.1L757.5 1046.9L755 1052.1L765 1069.3L767.9 1078.6L776.7 1092L802.1 1120.5L806.9 1129.5L806.3 1141.1L806.2 1158.7L807.1 1175.4L813.6 1199.4L822.8 1223.8L825.3 1239.4L823.6 1250.9L821.8 1257L822 1259.7L823.9 1262.2L832.7 1265.7L851.1 1267.9L862.2 1267.9L879.2 1270.6L880.4 1279.1L878.8 1293.3L875.4 1301.3L872.7 1303.7L863.5 1305.5L853.7 1314.2L839.6 1322.8L831.6 1324L828.2 1325.6L825.3 1328.2L823 1331.5L820.3 1347.5L816.1 1365.7L808.3 1376.5L799.6 1385.4L799.6 1385.4Z"
]

export function MapaVenezuelaSVG() {
  return (
    <div className="relative w-full aspect-[10/6] rounded border border-rule dark:border-rule-dark overflow-hidden bg-[#e0eaf5] dark:bg-[#0a0f1d] transition-colors duration-300">
      {/* El mapa SVG principal */}
      <svg
        viewBox="0 0 1000 600"
        className="w-full h-full select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Marcadores de flechas */}
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" className="fill-ink dark:fill-white transition-colors" />
          </marker>
          <marker
            id="red-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#dc2626" />
          </marker>

          {/* Gradiente para la zona de sacudida (terremoto) */}
          <radialGradient id="shaking-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#ef4444" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>

          {/* Gradiente para la zona afectada en el mar (tsunami/costera) */}
          <radialGradient id="sea-grad" cx="55%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#6366f1" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Sombreado azul/púrpura sobre el mar (zona de costa afectada / tsunami) */}
        <path
          d="M 330 200 C 450 60, 680 90, 800 230 L 800 290 L 730 330 L 630 284 L 566 286 L 514 297 L 450 246 Z"
          fill="url(#sea-grad)"
        />

        {/* 2. Sombreado rojo translúcido (zona de sacudida de los terremotos) */}
        <circle cx="446" cy="321" r="160" fill="url(#shaking-grad)" />

        {/* 3. Dibujo de la tierra (Venezuela) */}
        <g className="fill-stone-100 stroke-stone-300 dark:fill-[#1b2234] dark:stroke-slate-700 transition-colors duration-300">
          {VENEZUELA_PATHS.map((path, idx) => (
            <path key={idx} d={path} strokeWidth="1.2" strokeLinejoin="round" />
          ))}
        </g>

        {/* 4. Isla de Curazao (Curaçao) - Dibujada de manera estilizada */}
        <g className="transition-opacity duration-300">
          <rect
            x="485"
            y="95"
            width="32"
            height="10"
            rx="5"
            transform="rotate(-20 501 100)"
            className="fill-stone-300 stroke-stone-400 dark:fill-slate-700 dark:stroke-slate-600"
          />
          <text
            x="501"
            y="85"
            textAnchor="middle"
            className="font-mono text-[9px] font-bold tracking-widest fill-stone-500 dark:fill-slate-400 uppercase"
          >
            Curazao
          </text>
        </g>

        {/* 5. Ciudades principales (puntos negros de referencia) */}
        {/* Maracaibo */}
        <g>
          <circle cx="161.7" cy="284.4" r="4.5" className="fill-ink dark:fill-white" />
          <text
            x="150"
            y="288"
            textAnchor="end"
            className="font-mono text-[10px] font-semibold fill-ink-muted dark:fill-ink-muted-dark"
          >
            Maracaibo
          </text>
        </g>

        {/* Caracas */}
        <g>
          <circle cx="573.7" cy="302.4" r="4.5" className="fill-ink dark:fill-white" />
          <text
            x="585"
            y="306"
            textAnchor="start"
            className="font-mono text-[10px] font-semibold fill-ink-muted dark:fill-ink-muted-dark"
          >
            Caracas
          </text>
        </g>

        {/* La Guaira (ciudad más afectada, punto rojo y cartelera) */}
        <g>
          <circle cx="571.1" cy="287.6" r="5" fill="#dc2626" />
          {/* Cartelera indicativa de La Guaira */}
          <text
            x="640"
            y="170"
            textAnchor="middle"
            className="font-mono text-[10px] font-bold fill-crisis-red uppercase tracking-wide"
          >
            La Guaira
          </text>
          <text
            x="640"
            y="185"
            textAnchor="middle"
            className="font-mono text-[9px] fill-ink-muted dark:fill-ink-muted-dark"
          >
            (ciudad más afectada)
          </text>
          {/* Flecha indicativa curva hacia el punto de La Guaira */}
          <path
            d="M 640 195 Q 610 220 578 280"
            fill="none"
            stroke="#dc2626"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            markerEnd="url(#red-arrow)"
          />
        </g>

        {/* 6. Epicentros con ondas sísmicas animadas */}
        {/* Epicentro 1: San Felipe Yaracuy (M7.2) */}
        <g>
          <circle cx="413.5" cy="303.8" r="6" fill="#dc2626" />
          {/* Anillos de expansión */}
          <circle cx="413.5" cy="303.8" r="6" fill="none" stroke="#dc2626" strokeWidth="2">
            <animate attributeName="r" values="6;35" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="413.5" cy="303.8" r="6" fill="none" stroke="#dc2626" strokeWidth="1.5">
            <animate attributeName="r" values="6;55" dur="2.4s" begin="0.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur="2.4s" begin="0.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="413.5" cy="303.8" r="6" fill="none" stroke="#dc2626" strokeWidth="1">
            <animate attributeName="r" values="6;75" dur="2.4s" begin="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur="2.4s" begin="1.6s" repeatCount="indefinite" />
          </circle>
          <text
            x="413.5"
            y="325"
            textAnchor="middle"
            className="font-mono text-[9px] font-bold fill-ink dark:fill-white tracking-wide bg-black"
          >
            San Felipe
          </text>
          <text
            x="413.5"
            y="336"
            textAnchor="middle"
            className="font-mono text-[8px] fill-ink-muted dark:fill-ink-muted-dark"
          >
            Yaracuy
          </text>
        </g>

        {/* Epicentro 2: Valencia (M7.5) */}
        <g>
          <circle cx="478.3" cy="338.0" r="6" fill="#dc2626" />
          {/* Anillos de expansión */}
          <circle cx="478.3" cy="338.0" r="6" fill="none" stroke="#dc2626" strokeWidth="2">
            <animate attributeName="r" values="6;35" dur="2.4s" begin="0.3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur="2.4s" begin="0.3s" repeatCount="indefinite" />
          </circle>
          <circle cx="478.3" cy="338.0" r="6" fill="none" stroke="#dc2626" strokeWidth="1.5">
            <animate attributeName="r" values="6;55" dur="2.4s" begin="1.1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur="2.4s" begin="1.1s" repeatCount="indefinite" />
          </circle>
          <circle cx="478.3" cy="338.0" r="6" fill="none" stroke="#dc2626" strokeWidth="1">
            <animate attributeName="r" values="6;75" dur="2.4s" begin="1.9s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur="2.4s" begin="1.9s" repeatCount="indefinite" />
          </circle>
          <text
            x="478.3"
            y="358"
            textAnchor="middle"
            className="font-mono text-[9px] font-bold fill-ink dark:fill-white tracking-wide"
          >
            Valencia
          </text>
        </g>

        {/* 7. Cuadros de leyenda/callout tipo infografía */}
        {/* Callout Primer Terremoto */}
        <g className="cursor-pointer group">
          {/* Fondo del cartel */}
          <rect
            x="200"
            y="310"
            width="135"
            height="50"
            rx="4"
            className="fill-ink stroke-rule dark:fill-[#121214] dark:stroke-rule-dark transition-colors"
          />
          <text
            x="267.5"
            y="328"
            textAnchor="middle"
            className="font-mono text-[9px] fill-white dark:fill-zinc-300 font-bold uppercase tracking-wider"
          >
            Primer terremoto
          </text>
          <text
            x="267.5"
            y="348"
            textAnchor="middle"
            className="font-sans text-sm fill-crisis-red font-extrabold tracking-wide"
          >
            7,2
          </text>
          {/* Flecha indicativa curva */}
          <path
            d="M 335 335 Q 375 335 398 315"
            fill="none"
            className="stroke-ink dark:stroke-zinc-500"
            strokeWidth="1.2"
            markerEnd="url(#arrow)"
          />
        </g>

        {/* Callout Segundo Terremoto */}
        <g className="cursor-pointer group">
          {/* Fondo del cartel */}
          <rect
            x="540"
            y="390"
            width="135"
            height="50"
            rx="4"
            className="fill-ink stroke-rule dark:fill-[#121214] dark:stroke-rule-dark transition-colors"
          />
          <text
            x="607.5"
            y="408"
            textAnchor="middle"
            className="font-mono text-[9px] fill-white dark:fill-zinc-300 font-bold uppercase tracking-wider"
          >
            Segundo terremoto
          </text>
          <text
            x="607.5"
            y="428"
            textAnchor="middle"
            className="font-sans text-sm fill-crisis-red font-extrabold tracking-wide"
          >
            7,5
          </text>
          {/* Flecha indicativa curva */}
          <path
            d="M 540 415 Q 500 415 488 360"
            fill="none"
            className="stroke-ink dark:stroke-zinc-500"
            strokeWidth="1.2"
            markerEnd="url(#arrow)"
          />
        </g>
      </svg>
      {/* Leyenda flotante para explicar los colores en la esquina inferior izquierda */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 p-2 rounded bg-white/85 dark:bg-black/85 border border-rule dark:border-rule-dark backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ef4444]/40 border border-[#ef4444]" />
          <span className="font-mono text-[9px] uppercase tracking-wide text-ink dark:text-ink-dark">
            Zona de Sacudida
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#6366f1]/40 border border-[#6366f1]" />
          <span className="font-mono text-[9px] uppercase tracking-wide text-ink dark:text-ink-dark">
            Costa Afectada
          </span>
        </div>
      </div>
    </div>
  )
}
