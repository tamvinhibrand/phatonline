// Test tính năng "Lên bái". Chạy: npm test (không cần mạng)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseKeywords, matchKeyword, WorshipQueue } from '../worship.mjs';

const KW = parseKeywords('lạy, bái, lễ Phật, được');

test('parseKeywords: tách dấu phẩy, bỏ ô trống, chữ thường', () => {
  assert.deepEqual(KW, ['lạy', 'bái', 'lễ phật', 'được']);
  assert.deepEqual(parseKeywords(' ,; \n'), []);
});

test('matchKeyword: chứa từ khóa theo nguyên từ, có dấu', () => {
  assert.equal(matchKeyword('Con xin lạy Phật', KW), 'lạy');
  assert.equal(matchKeyword('LỄ PHẬT cầu bình an', KW), 'lễ phật');
  assert.equal(matchKeyword('được', KW), 'được');
  assert.equal(matchKeyword('Bái!', KW), 'bái');
});

test('matchKeyword: không khớp nhầm', () => {
  assert.equal(matchKeyword('lấy giúp mình cái này', KW), null);        // "lấy" khác "lạy"
  assert.equal(matchKeyword('bài hát hay quá', KW), null);              // "bài" khác "bái"
  assert.equal(matchKeyword('Nam mô A Di Đà Phật', KW), null);
  assert.equal(matchKeyword('', KW), null);
});

test('matchKeyword: từ khóa không dấu thì so không dấu', () => {
  const k = parseKeywords('lay');
  assert.equal(matchKeyword('con lạy Phật', k), 'lay');
  assert.equal(matchKeyword('con lay Phat', k), 'lay');
});

test('WorshipQueue: 3 chỗ, chỗ giữa trước, xếp hàng, người xuống người lên', () => {
  const q = new WorshipQueue({ slots: 3, durationMs: 1000 });
  for (const id of ['a', 'b', 'c', 'd']) assert.equal(q.request({ id, name: id.toUpperCase(), text: 'lạy' }), 'queued');
  let r = q.tick(0);
  assert.deepEqual(r.started.map(s => `${s.id}@${s.slot}`), ['a@1', 'b@0', 'c@2']);
  assert.equal(q.snapshot().waiting, 1);
  r = q.tick(500); assert.equal(r.started.length + r.ended.length, 0);
  r = q.tick(1000);
  assert.deepEqual(r.ended.map(e => e.id), ['b', 'a', 'c']);
  assert.deepEqual(r.started.map(s => `${s.id}@${s.slot}`), ['d@1']);   // d lên ngay khi người trước xuống
});

test('WorshipQueue: không xếp hàng hai lần, hàng đầy, thời gian chờ, rời phòng', () => {
  const q = new WorshipQueue({ slots: 1, maxQueue: 2, cooldownSec: 60, durationMs: 1000 });
  assert.equal(q.request({ id: 'a' }, 0), 'queued'); assert.equal(q.request({ id: 'a' }, 0), 'dup');
  q.tick(0); assert.equal(q.request({ id: 'a' }, 10), 'dup');            // đang lạy
  q.request({ id: 'b' }, 0); q.request({ id: 'c' }, 0); assert.equal(q.request({ id: 'd' }, 0), 'full');
  q.tick(1000); assert.equal(q.request({ id: 'a' }, 2000), 'cooldown');
  q.remove('c'); assert.equal(q.snapshot().waiting, 0);
  q.remove('b'); assert.deepEqual(q.snapshot().slots, [null]);
});

test('WorshipQueue: đổi số chỗ', () => {
  const q = new WorshipQueue({ slots: 3 }); q.request({ id: 'a' }); q.tick(0);
  q.resize(1); assert.equal(q.slots.length, 1); assert.equal(q.slots[0].id, 'a');
  q.resize(9); assert.equal(q.slots.length, 5);
});
