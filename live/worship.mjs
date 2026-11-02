// Chánh Điện — "Lên bái": người xem bình luận đúng từ khóa hoặc tặng quà đủ ngưỡng thì đứng dậy,
// đi lên trước chánh điện quỳ lạy, xong quay về chỗ. Trước chánh điện có vài chỗ lạy; đông người thì xếp hàng,
// người lạy xong đi xuống là người kế tiếp lên ngay. File này không phụ thuộc server để test riêng.

const NFC = s => String(s || '').normalize('NFC').toLowerCase();
const strip = s => NFC(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
const words = s => ' ' + s.replace(/[^\p{L}\p{N}]+/gu, ' ').trim() + ' ';
const hasMarks = s => strip(s) !== NFC(s);

// "lạy, bái, lễ Phật, được" → ['lạy','bái','lễ phật','được']
export const parseKeywords = s => String(s || '').split(/[,;\n]/).map(x => NFC(x).trim()).filter(Boolean).slice(0, 30);

// Bình luận CHỨA một từ khóa (theo nguyên từ). Từ khóa có dấu thì so có dấu, để "lạy" không khớp nhầm "lấy";
// admin gõ từ khóa không dấu ("lay") thì so không dấu.
export function matchKeyword(text, keywords){
  const withMarks = words(NFC(text)), noMarks = words(strip(text));
  for (const k of keywords){
    if (!k) continue;
    if (hasMarks(k) ? withMarks.includes(words(k)) : noMarks.includes(words(strip(k)))) return k;
  }
  return null;
}

// Hàng đợi lên bái. Server gọi tick(now) đều đặn để biết ai bắt đầu lạy, ai lạy xong.
export class WorshipQueue {
  constructor({ slots = 3, maxQueue = 10, cooldownSec = 0, durationMs = 13000 } = {}){
    this.slots = Array(slots).fill(null);          // mỗi chỗ: { id, name, text, until } hoặc null
    this.queue = []; this.maxQueue = maxQueue; this.cooldownSec = cooldownSec; this.durationMs = durationMs;
    this.lastDone = new Map();
  }
  busy(id){ return this.slots.some(s => s?.id === id) || this.queue.some(q => q.id === id); }
  // trả 'queued' | 'dup' (đang lạy hoặc đang chờ) | 'cooldown' | 'full'
  request(entry, now = Date.now()){
    if (this.busy(entry.id)) return 'dup';
    // chỉ tính thời gian chờ với người đã lạy xong ít nhất một lần
    if (this.cooldownSec > 0 && this.lastDone.has(entry.id) && now - this.lastDone.get(entry.id) < this.cooldownSec * 1000) return 'cooldown';
    if (this.queue.length >= this.maxQueue) return 'full';
    this.queue.push({ id: entry.id, name: entry.name || '', text: String(entry.text || '').slice(0, 120), sub: String(entry.sub || '').slice(0, 80) });
    return 'queued';
  }
  // người rời phòng thì bỏ khỏi hàng / chỗ lạy
  remove(id){ this.queue = this.queue.filter(q => q.id !== id); const i = this.slots.findIndex(s => s?.id === id); if (i >= 0) this.slots[i] = null; }
  tick(now = Date.now()){
    const ended = [], started = [];
    this.slots.forEach((s, i) => { if (s && now >= s.until){ ended.push({ id: s.id, slot: i }); this.lastDone.set(s.id, now); this.slots[i] = null; } });
    // chỗ trống thì người đầu hàng lên ngay; ưu tiên chỗ giữa
    for (const i of this.order()) if (!this.slots[i] && this.queue.length){
      const q = this.queue.shift(); this.slots[i] = { ...q, until: now + this.durationMs }; started.push({ ...q, slot: i });
    }
    return { started, ended };
  }
  order(){ const n = this.slots.length, mid = (n - 1) / 2; return [...Array(n).keys()].sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid)); }
  resize(n){ n = Math.max(1, Math.min(5, n | 0)); if (n === this.slots.length) return;
    const keep = this.slots.filter(Boolean); this.slots = Array(n).fill(null); keep.slice(0, n).forEach((s, i) => { this.slots[i] = s; }); }
  snapshot(){ return { slots: this.slots.map(s => s && { id: s.id, text: s.text }), waiting: this.queue.length }; }
}
