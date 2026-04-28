import { rectIntersection } from '@dnd-kit/core'

const SNAP_THRESHOLD_PX = 40

function center(rect) {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

function distance(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function magneticCollision(args) {
  const { collisionRect, droppableContainers } = args
  if (!collisionRect) return []

  const dragCenter = center(collisionRect)

  let closest = null
  let closestDist = Infinity

  for (const container of droppableContainers) {
    const id = container.id
    if (typeof id !== 'string' || !id.startsWith('pos-')) continue
    const rect = container.rect.current
    if (!rect) continue
    const d = distance(dragCenter, center(rect))
    if (d < closestDist) {
      closestDist = d
      closest = container
    }
  }

  if (closest && closestDist <= SNAP_THRESHOLD_PX) {
    return [
      {
        id: closest.id,
        data: { droppableContainer: closest, value: closestDist },
      },
    ]
  }

  return rectIntersection(args)
}
