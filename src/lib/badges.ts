import { ProductBadge, ProductBadgeItem } from "@/types/page"

/**
 * 기존 badges / badge + badgeTargets 조합을 단일 배열 형태로 정규화
 * - badges 가 존재하면 그대로 사용 (id 없으면 자동 부여)
 * - 없으면 legacy badge + badgeTargets 를 기반으로 1개짜리 배열 생성
 */
export function normalizeBadges(
  badges?: ProductBadgeItem[] | null,
  badge?: ProductBadge | null,
  badgeTargets?: string[] | null
): ProductBadgeItem[] {
  if (badges && badges.length > 0) {
    return badges.map((b, index) => ({
      id: b.id || `badge-${index + 1}`,
      ...b
    }))
  }

  if (badge && badge.text) {
    const item: ProductBadgeItem = {
      id: "legacy-badge",
      text: badge.text,
      backgroundColor: badge.backgroundColor,
      textColor: badge.textColor,
      borderColor: badge.borderColor,
      targets: badgeTargets ?? undefined
    }
    return [item]
  }

  return []
}

/**
 * 특정 상품에 노출되어야 할 배지 필터링
 * - text 가 없는 배지는 제외
 * - targets 가 없거나 빈 배열이면 전체 상품에 노출
 * - 그 외에는 productId 가 targets 에 포함될 때만 노출
 */
export function getBadgesForProduct(
  productId: string | undefined,
  badges: ProductBadgeItem[] | undefined | null
): ProductBadgeItem[] {
  if (!badges || badges.length === 0) return []

  const pid = productId || ""

  return badges.filter((b) => {
    if (!b.text) return false
    if (!b.targets || b.targets.length === 0) return true
    return b.targets.includes(pid)
  })
}
