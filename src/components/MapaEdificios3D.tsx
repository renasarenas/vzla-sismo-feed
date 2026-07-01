'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

// ArcGIS webscene hosted on arcgis.com. We embed the public viewer via iframe
// rather than pulling in @arcgis/core — the SDK is hundreds of KB and we only
// need to display the scene, not drive it programmatically.
const WEBSCENE_ID = 'c01ef4b6b74b4d25a39f7a1e4865be58'
const VIEWER_URL = `https://www.arcgis.com/home/webscene/viewer.html?webscene=${WEBSCENE_ID}`

// Approximate height of the ArcGIS Scene Viewer top bar, in px. The iframe is shifted
// up by this amount so that bar is clipped off the top of the container.
const HEADER_OFFSET = 56

// Presentational 3D view. Embeds the cross-origin ArcGIS scene; the parent decides
// when to mount it.
export function MapaEdificios3DView() {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Map Iframe Column */}
      <div className="flex-1 relative min-h-[50vh] lg:min-h-[72vh] h-[65vh] lg:h-[72vh] border border-rule dark:border-rule-dark bg-panel dark:bg-panel-dark overflow-hidden rounded-sm">
        {/* Shimmer loading skeleton */}
        {!loaded && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 bg-paper dark:bg-paper-dark z-10">
            <div className="w-full flex items-center justify-between">
              <div className="h-5 w-32 skeleton rounded-sm" />
              <div className="h-5 w-24 skeleton rounded-sm" />
            </div>
            <div className="flex-1 flex flex-col justify-center items-center gap-4">
              <div className="h-8 w-8 border-2 border-crisis-red border-t-transparent rounded-full animate-spin" />
              <p className="text-small font-semibold text-ink-muted dark:text-ink-muted-dark animate-pulse">
                Inicializando motor cartográfico 3D...
              </p>
            </div>
            <div className="h-8 w-full skeleton rounded-sm animate-pulse" />
          </div>
        )}

        {/* The iframe is grown by HEADER_OFFSET and pulled up so the ArcGIS Scene Viewer
            top bar is clipped outside the overflow-hidden container. The viewer chrome is
            cross-origin, so this visual crop is the only way to hide it without the SDK. */}
        <iframe
          src={VIEWER_URL}
          title="Edificios afectados en Catia La Mar"
          className="absolute left-0 w-full border-0"
          style={{ top: `-${HEADER_OFFSET}px`, height: `calc(100% + ${HEADER_OFFSET}px)` }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoaded(true)}
        />
      </div>

      {/* Sidebar Info Column */}
      <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
        <div className="bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark p-5 rounded-sm shadow-soft flex flex-col gap-5">
          <header className="border-b border-rule dark:border-rule-dark pb-3">
            <h2 className="font-serif text-headline text-ink dark:text-ink-dark">Modelo 3D La Guaira</h2>
            <p className="text-caption text-ink-muted dark:text-ink-muted-dark mt-1">
              Catastro tridimensional y análisis de vulnerabilidad en Catia La Mar.
            </p>
          </header>

          {/* Technical Info */}
          <div>
            <span className="block text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark mb-2">
              Especificaciones
            </span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-small bg-paper dark:bg-paper-dark p-3 border border-rule dark:border-rule-dark rounded-sm">
              <div>
                <span className="block text-[10px] text-ink-muted dark:text-ink-muted-dark uppercase tracking-wider">Motor</span>
                <span className="font-bold text-ink dark:text-ink-dark">ArcGIS WebScene</span>
              </div>
              <div>
                <span className="block text-[10px] text-ink-muted dark:text-ink-muted-dark uppercase tracking-wider">Objetivo</span>
                <span className="font-bold text-ink dark:text-ink-dark">Censo Estructural</span>
              </div>
              <div className="col-span-2 border-t border-rule dark:border-rule-dark pt-2 mt-1">
                <span className="block text-[10px] text-ink-muted dark:text-ink-muted-dark uppercase tracking-wider">Zona de Cobertura</span>
                <span className="font-bold text-ink dark:text-ink-dark text-xs">Franja urbana costera (Catia La Mar)</span>
              </div>
            </div>
          </div>

          {/* Navigation Guide */}
          <div>
            <span className="block text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark mb-3">
              Guía de Navegación
            </span>
            <ul className="flex flex-col gap-3 text-small text-ink dark:text-ink-dark">
              <li className="flex items-start gap-2.5">
                <span className="px-2 py-1 bg-paper dark:bg-paper-dark border border-rule dark:border-rule-dark rounded-sm shrink-0 text-[10px] font-bold font-mono">
                  Clic + Arrastrar
                </span>
                <span className="text-xs text-ink-muted dark:text-ink-muted-dark self-center">Rotar cámara</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="px-2 py-1 bg-paper dark:bg-paper-dark border border-rule dark:border-rule-dark rounded-sm shrink-0 text-[10px] font-bold font-mono">
                  Clic der. + Arrastrar
                </span>
                <span className="text-xs text-ink-muted dark:text-ink-muted-dark self-center">Desplazar vista (Pan)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="px-2 py-1 bg-paper dark:bg-paper-dark border border-rule dark:border-rule-dark rounded-sm shrink-0 text-[10px] font-bold font-mono">
                  Rueda de mouse
                </span>
                <span className="text-xs text-ink-muted dark:text-ink-muted-dark self-center">Zoom acercar/alejar</span>
              </li>
            </ul>
          </div>

          {/* Contextual notes */}
          <div className="border-t border-rule dark:border-rule-dark pt-4">
            <h4 className="text-xs font-bold text-ink dark:text-ink-dark mb-1">Censo de Edificios</h4>
            <p className="text-caption text-ink-muted dark:text-ink-muted-dark leading-relaxed">
              El modelado digital permite a las brigadas de rescate e ingenieros civiles consultar datos específicos de cada estructura. Haga clic sobre cualquier edificio extruido en el visor 3D para desplegar su ficha catastral y nivel de vulnerabilidad sísmica estimado.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
