// Import the 'util' module for utility functions
var util = require('./util')  
 
// Function to add two 64-bit values in 'v' array
function BlakeADD64AA (v, i, j) {
  var o0 = v[i] + v[j]
  var o1 = v[i + 1] + v[j + 1]
  if (o0 >= 0x100000000) {
    o1++
  }
  v[i] = o0
  v[i + 1] = o1
}

// Function to add a 64-bit value to 'v' at index 'i'
function BlakeADD64AC (v, i, j0, j1) {
  var o0 = v[i] + j0
  if (j0 < 0) {
    o0 += 0x100000000
  }
  var o1 = v[i + 1] + j1
  if (o0 >= 0x100000000) {
    o1++
  }
  v[i] = o0
  v[i + 1] = o1
}

// Function to extract a 32-bit value from an array 'arr' at index 'a'
function BlakeB2B_GET32 (arr, a) {
  return (arr[a] ^
  (arr[a + 1] << 8) ^
  (arr[a + 2] << 16) ^
  (arr[a + 3] << 24))
}


// Function to perform the Blake2B G operation
function BlakeB2B_G (a, b, c, d, ix, iy) {
  var x0 = m[ix]
  var x1 = m[ix + 1]
  var y0 = m[iy]
  var y1 = m[iy + 1]

  // Perform a series of operations on the 'v' array
  BlakeADD64AA(v, a, b) 
  BlakeADD64AC(v, a, x0, x1) 

  // XOR 'v' values
  var xor0 = v[d] ^ v[a]
  var xor1 = v[d + 1] ^ v[a + 1]
  v[d] = xor1
  v[d + 1] = xor0

  BlakeADD64AA(v, c, d)

  
  xor0 = v[b] ^ v[c]
  xor1 = v[b + 1] ^ v[c + 1]
  v[b] = (xor0 >>> 24) ^ (xor1 << 8)
  v[b + 1] = (xor1 >>> 24) ^ (xor0 << 8)

  BlakeADD64AA(v, a, b)
  BlakeADD64AC(v, a, y0, y1)

  
  xor0 = v[d] ^ v[a]
  xor1 = v[d + 1] ^ v[a + 1]
  v[d] = (xor0 >>> 16) ^ (xor1 << 16)
  v[d + 1] = (xor1 >>> 16) ^ (xor0 << 16)

  BlakeADD64AA(v, c, d)

  
  xor0 = v[b] ^ v[c]
  xor1 = v[b + 1] ^ v[c + 1]
  v[b] = (xor1 >>> 31) ^ (xor0 << 1)
  v[b + 1] = (xor0 >>> 31) ^ (xor1 << 1)
}

// Initialize constants for the Blake2B algorithm
var Blake2BMain_IV32 = new Uint32Array([
  0xF3BCC908, 0x6A09E667, 0x84CAA73B, 0xBB67AE85,
  0xFE94F82B, 0x3C6EF372, 0x5F1D36F1, 0xA54FF53A,
  0xADE682D1, 0x510E527F, 0x2B3E6C1F, 0x9B05688C,
  0xFB41BD6B, 0x1F83D9AB, 0x137E2179, 0x5BE0CD19
])

// Define a constant array of Blake2B SIGMA values
var BlakeSIGMA8 = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3,
  11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4,
  7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8,
  9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13,
  2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9,
  12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11,
  13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10,
  6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5,
  10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0,
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3
]

// Create a 64-element array by doubling the values in BlakeSIGMA8
var BlakeSIGMA82 = new Uint8Array(BlakeSIGMA8.map(function (x) { return x * 2 }))

// Create arrays to store intermediate values
var v = new Uint32Array(32)
var m = new Uint32Array(32)

// Function to perform the main Blake2B compression
function Blake2BMainCompress (ctx, last) {
  var i = 0

    // Initialize 'v' array with context and Blake2BMain_IV32 values
  for (i = 0; i < 16; i++) {
    v[i] = ctx.h[i]
    v[i + 16] = Blake2BMain_IV32[i]
  }

    // Adjust 'v' values based on the context
  v[24] = v[24] ^ ctx.t
  v[25] = v[25] ^ (ctx.t / 0x100000000)
  
  if (last) {
    v[28] = ~v[28]
    v[29] = ~v[29]
  }

// Load message block values into 'm' array
  for (i = 0; i < 32; i++) {
    m[i] = BlakeB2B_GET32(ctx.b, 4 * i)
  }

  // Perform the Blake2B G operation
  for (i = 0; i < 12; i++) {
    BlakeB2B_G(0, 8, 16, 24, BlakeSIGMA82[i * 16 + 0], BlakeSIGMA82[i * 16 + 1])
    BlakeB2B_G(2, 10, 18, 26, BlakeSIGMA82[i * 16 + 2], BlakeSIGMA82[i * 16 + 3])
    BlakeB2B_G(4, 12, 20, 28, BlakeSIGMA82[i * 16 + 4], BlakeSIGMA82[i * 16 + 5])
    BlakeB2B_G(6, 14, 22, 30, BlakeSIGMA82[i * 16 + 6], BlakeSIGMA82[i * 16 + 7])
    BlakeB2B_G(0, 10, 20, 30, BlakeSIGMA82[i * 16 + 8], BlakeSIGMA82[i * 16 + 9])
    BlakeB2B_G(2, 12, 22, 24, BlakeSIGMA82[i * 16 + 10], BlakeSIGMA82[i * 16 + 11])
    BlakeB2B_G(4, 14, 16, 26, BlakeSIGMA82[i * 16 + 12], BlakeSIGMA82[i * 16 + 13])
    BlakeB2B_G(6, 8, 18, 28, BlakeSIGMA82[i * 16 + 14], BlakeSIGMA82[i * 16 + 15])
  }
  
  // Update the hash context with the 'v' array
  for (i = 0; i < 16; i++) {
    ctx.h[i] = ctx.h[i] ^ v[i] ^ v[i + 16]
  }
  
}

// Function to initialize the Blake2B hash context
function Blake2BMainInit (outlen, key) {
  if (outlen === 0 || outlen > 64) {
    throw new Error('Invalid output length, it is expected to get 0 < length <= 64')
  }
  if (key && key.length > 64) {
    throw new Error('Invalid key, it is expected Uint8Array with 0 < length <= 64')
  }
  
// Create a context
  var ctx = {
    b: new Uint8Array(128),
    h: new Uint32Array(16),
    t: 0, 
    c: 0, 
    outlen: outlen
  }

  for (var i = 0; i < 16; i++) {
    ctx.h[i] = Blake2BMain_IV32[i]
  }
  var keylen = key ? key.length : 0
  ctx.h[0] ^= 0x01010000 ^ (keylen << 8) ^ outlen

  if (key) {
    Blake2BMainUpdate(ctx, key)
    ctx.c = 128
  }

  return ctx
}

function Blake2BMainUpdate (ctx, input) {
  for (var i = 0; i < input.length; i++) {
    if (ctx.c === 128) { 
      ctx.t += ctx.c 
      Blake2BMainCompress(ctx, false) 
      ctx.c = 0 
    }
    ctx.b[ctx.c++] = input[i]
  }
}

function Blake2BMainFinal (ctx) {
  ctx.t += ctx.c 

  while (ctx.c < 128) { 
    ctx.b[ctx.c++] = 0
  }
  Blake2BMainCompress(ctx, true) 
  var out = new Uint8Array(ctx.outlen)
  for (var i = 0; i < ctx.outlen; i++) {
    out[i] = ctx.h[i >> 2] >> (8 * (i & 3))
  }
  return out
}

function Blake2BMain (input, key) {
  var outlen = 64
  input = util.normalizeInput(input)

  var ctx = Blake2BMainInit(outlen, key)
  Blake2BMainUpdate(ctx, input)
  return Blake2BMainFinal(ctx)
}

function Blake2BMainHex (input, key, outlen) {
  var output = Blake2BMain(input, key, outlen)
  return util.toHex(output)
}

module.exports = {
  Blake2BMain: Blake2BMain,
  Blake2BMainHex: Blake2BMainHex,
  Blake2BMainInit: Blake2BMainInit,
  Blake2BMainUpdate: Blake2BMainUpdate,
  Blake2BMainFinal: Blake2BMainFinal
}
