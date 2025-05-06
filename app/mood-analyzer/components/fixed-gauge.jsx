"use client"

import { useEffect, useRef } from "react"
import styles from "../styles.module.css"

export default function FixedGauge({ score = 3, theme = "light" }) {
  const needleRef = useRef(null)

  // Calculate needle rotation based on score (1-5)
  // This maps score 1-5 to angles from -90 to 90 degrees
  const calculatePosition = (scoreValue) => {
    return ((scoreValue - 1) / 4) * 100
  }

  useEffect(() => {
    // Force update the indicator position when score changes
    if (needleRef.current) {
      const position = calculatePosition(score)
      console.log(`FixedGauge: Setting indicator position to ${position}% for score ${score}`)

      // Directly set the left position style
      needleRef.current.style.left = `${position}%`
    }
  }, [score])

  return (
    <div className={styles.gaugeContainer}>
      <div className={styles.gaugeBackground}>
        <div className={styles.gaugeMarkers}>
          <span className={styles.gaugeMarker}>1</span>
          <span className={styles.gaugeMarker}>2</span>
          <span className={styles.gaugeMarker}>3</span>
          <span className={styles.gaugeMarker}>4</span>
          <span className={styles.gaugeMarker}>5</span>
        </div>

        {/* Gauge Needle */}
        <div
          ref={needleRef}
          className={`${styles.gaugeIndicator} ${theme === "dark" ? styles.darkGaugeIndicator : ""}`}
          style={{
            left: `${((score - 1) / 4) * 100}%`,
            transition: "left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div
            className={`${styles.gaugeIndicatorRipple} ${theme === "dark" ? styles.darkGaugeIndicatorRipple : ""}`}
          ></div>
          <div className={`${styles.gaugeIndicatorValue} ${theme === "dark" ? styles.darkGaugeIndicatorValue : ""}`}>
            {score}
          </div>
        </div>
      </div>
    </div>
  )
}
