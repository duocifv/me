
// --- helper maps ---
export const REASON_SCORE_MAP: Record<string, number> = {
  'có thông tin liên hệ': 30,
  'có ngày lưu trú': 20,
  'có thông tin số khách': 10,
  'hỏi về giá': 10,
  'có câu xác nhận đặt phòng': 25,
  'có dấu hiệu khẩn cấp': 10,
  'có hỏi lặp lại': 8,
  'tín hiệu không quan tâm': -15,
};

export const ALLOWED_ACTIONS = new Set<string>([
  'gọi điện trong 30 phút',
  'gửi SMS ngay',
  'gửi email xác nhận/ưu đãi',
  'chuyển nhân viên xử lý',
  'nhắc lại sau 24 giờ',
  'thêm vào chiến dịch chăm sóc',
  'gọi ngay lập tức',
  'gọi lại trong 30 phút',
  'gửi email chào giá',
  'đưa vào danh sách chăm sóc dài hạn',
]);

export function normalizeTextForCompare(s: any): string {
  return String(s ?? '')
    .trim()
    .toLowerCase();
}

export function mapToCanonicalReason(raw: any): string | null {
  const r = normalizeTextForCompare(raw);
  if (!r) return null;

  for (const k of Object.keys(REASON_SCORE_MAP)) {
    if (r === k) return k;
  }

  if (
    r.includes('sđt') ||
    r.includes('số điện thoại') ||
    r.includes('phone') ||
    r.includes('liên hệ')
  )
    return 'có thông tin liên hệ';
  if (
    r.includes('ngày') ||
    r.includes('nhận') ||
    r.includes('trả') ||
    r.includes('checkin') ||
    r.includes('checkout')
  )
    return 'có ngày lưu trú';
  if (r.includes('đêm') || r.includes('số đêm') || r.includes('khách'))
    return 'có thông tin số khách';
  if (
    r.includes('giá') ||
    r.includes('ưu đãi') ||
    r.includes('khuyến mãi') ||
    r.includes('km')
  )
    return 'hỏi về giá';
  if (
    r.includes('đặt') ||
    r.includes('xác nhận') ||
    r.includes('confirm') ||
    r.includes('book')
  )
    return 'có câu xác nhận đặt phòng';
  if (r.includes('khẩn') || r.includes('gấp') || r.includes('ngay'))
    return 'có dấu hiệu khẩn cấp';
  if (r.includes('lặp') || r.includes('nhiều lần')) return 'có hỏi lặp lại';
  if (
    r.includes('không quan tâm') ||
    r.includes('chưa quyết định') ||
    r.includes('tham khảo')
  )
    return 'tín hiệu không quan tâm';

  return null;
}

export function computeScoreFromReasonsList(reasons: any[]): number {
  if (!Array.isArray(reasons)) return 0;
  let score = 0;
  const seen = new Set<string>();
  for (const raw of reasons) {
    const canon = mapToCanonicalReason(raw);
    if (!canon) continue;
    if (seen.has(canon)) continue;
    seen.add(canon);
    score += REASON_SCORE_MAP[canon] ?? 0;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function mapScoreToCategory(score: number): BookingIntent['category'] {
  if (score >= 85) return 'Rất cao';
  if (score >= 75) return 'Cao';
  if (score >= 50) return 'Trung bình';
  return 'Thấp';
}

export function chooseRecommendedAction(
  aiAction: any,
  category: BookingIntent['category'],
): string {
  if (typeof aiAction === 'string' && aiAction.trim() !== '') {
    const a = normalizeTextForCompare(aiAction);
    for (const allowed of ALLOWED_ACTIONS) {
      const na = normalizeTextForCompare(allowed);
      if (na === a || a.includes(na) || na.includes(a)) return allowed;
    }
  }
  if (category === 'Rất cao' || category === 'Cao')
    return 'gọi điện trong 30 phút';
  if (category === 'Trung bình') return 'gửi email xác nhận/ưu đãi';
  return 'nhắc lại sau 24 giờ';
}

export function processBookingIntent(
  bookingIntentFromAI: any,
  message: string,
  chatHistory: ChatHistoryItem[],
  booking: BookingDto,
  fallbackEvaluator: (
    msg: string,
    history: ChatHistoryItem[],
    b: BookingDto,
  ) => BookingIntent,
): BookingIntent {
  if (!bookingIntentFromAI || !Array.isArray(bookingIntentFromAI.reasons)) {
    return fallbackEvaluator(message, chatHistory, booking);
  }

  const rawReasons: any[] = bookingIntentFromAI.reasons;
  const canonical: string[] = [];
  for (const r of rawReasons) {
    const c = mapToCanonicalReason(r);
    if (c && !canonical.includes(c)) canonical.push(c);
  }

  if (canonical.length === 0) {
    return fallbackEvaluator(message, chatHistory, booking);
  }

  const score = computeScoreFromReasonsList(canonical);
  const category = mapScoreToCategory(score);
  const recommendedAction = chooseRecommendedAction(
    bookingIntentFromAI.recommendedAction,
    category,
  );

  return { score, category, reasons: canonical, recommendedAction };
}

export function sanitizeAndEnforceMessage(
  rawMessage: string,
  parsedRaw: any,
  booking: BookingDto,
): string {
  let reply = typeof rawMessage === 'string' ? rawMessage.trim() : '';

  if (!reply) {
    return 'Dạ em nhận được ạ. Anh/chị cho em biết thêm ngày và số khách để em tư vấn chính xác hơn nhé.';
  }

  reply = reply.replace(/```/g, '').trim();

  const asksPhoneExact = reply.includes(
    'Anh/chị cho em xin số điện thoại hợp lệ',
  );
  const nameMissing = booking.name === null;
  if (asksPhoneExact && nameMissing) {
    booking.status = booking.status
      ? `${booking.status};enforced_name_first`
      : 'enforced_name_first';
    return 'Anh/chị cho em xin họ và tên đầy đủ để em hoàn tất giữ phòng nhé.';
  }

  const parts = reply.split(/(?<=[.?!…])\s+/u).filter(Boolean);
  if (parts.length <= 3) return parts.join(' ').trim();
  return parts.slice(0, 3).join(' ').trim();
}
