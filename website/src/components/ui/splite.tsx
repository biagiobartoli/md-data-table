'use client'

import { Suspense, lazy } from 'react'
import { SplineBoundary } from '@/components/ui/spline-boundary'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
  /** Rendered if the scene cannot be fetched. Defaults to nothing. */
  fallback?: React.ReactNode
}

export function SplineScene({ scene, className, fallback = null }: SplineSceneProps) {
  return (
    <SplineBoundary fallback={fallback}>
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <span className="loader"></span>
          </div>
        }
      >
        <Spline
          scene={scene}
          className={className}
        />
      </Suspense>
    </SplineBoundary>
  )
}
