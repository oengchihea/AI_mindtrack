"use client"

import { useEffect, useRef } from "react"
import styles from "../styles.module.css"

export default function SimpleGauge({ score = 3, theme = "light" }) {
  const needleRef = useRef(null)

  // Calculate needle rotation based on score (1-5)
  const rotation = ((score - 1) / 4) * 180 - 90

  useEffect(() => {
    // Force update the needle position when score changes
    if (needleRef.current) {
      needleRef.current.style.transition = "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)"
      needleRef.current.style.transform = `translateX(-50%) rotate(${rotation}deg)`
    }

    // For debugging
    console.log("SimpleGauge: Score updated to", score, "Rotation:", rotation)
  }, [score, rotation])

  return (
    <div className={styles.gaugeContainer}>
      {/* Gauge Background */}
      <div className={styles.gaugeBackground}>
        {/* Gauge Markers */}
        <div className={styles.gaugeMarkers}>
          <span className={styles.gaugeMarker}>1</span>
          <span className={styles.gaugeMarker}>2</span>
          <span className={styles.gaugeMarker}>3</span>
          <span className={styles.gaugeMarker}>4</span>
          <span className={styles.gaugeMarker}>5</span>
        </div>
      </div>

      {/* Gauge Needle */}
      <div
        ref={needleRef}
        className={`${styles.gaugeNeedle} ${theme === "dark" ? styles.darkGaugeNeedle : ""}`}
        style={{
          transform: `translateX(-50%) rotate(${rotation}deg)`,
          transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <div className={`${styles.gaugeNeedleDot} ${theme === "dark" ? styles.darkGaugeNeedleDot : ""}`}></div>
      </div>
    </div>
  )
}
