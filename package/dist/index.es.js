var fn = Object.defineProperty;
var dn = (r, e, t) => e in r ? fn(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var Ie = (r, e, t) => (dn(r, typeof e != "symbol" ? e + "" : e, t), t);
import wt, { useState as Z, useEffect as vr } from "react";
var pn = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function yn(r) {
  if (r.__esModule)
    return r;
  var e = r.default;
  if (typeof e == "function") {
    var t = function n() {
      return this instanceof n ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    t.prototype = e.prototype;
  } else
    t = {};
  return Object.defineProperty(t, "__esModule", { value: !0 }), Object.keys(r).forEach(function(n) {
    var i = Object.getOwnPropertyDescriptor(r, n);
    Object.defineProperty(t, n, i.get ? i : {
      enumerable: !0,
      get: function() {
        return r[n];
      }
    });
  }), t;
}
var gr = {}, hn = function() {
  if (typeof Symbol != "function" || typeof Object.getOwnPropertySymbols != "function")
    return !1;
  if (typeof Symbol.iterator == "symbol")
    return !0;
  var e = {}, t = Symbol("test"), n = Object(t);
  if (typeof t == "string" || Object.prototype.toString.call(t) !== "[object Symbol]" || Object.prototype.toString.call(n) !== "[object Symbol]")
    return !1;
  var i = 42;
  e[t] = i;
  for (t in e)
    return !1;
  if (typeof Object.keys == "function" && Object.keys(e).length !== 0 || typeof Object.getOwnPropertyNames == "function" && Object.getOwnPropertyNames(e).length !== 0)
    return !1;
  var o = Object.getOwnPropertySymbols(e);
  if (o.length !== 1 || o[0] !== t || !Object.prototype.propertyIsEnumerable.call(e, t))
    return !1;
  if (typeof Object.getOwnPropertyDescriptor == "function") {
    var s = Object.getOwnPropertyDescriptor(e, t);
    if (s.value !== i || s.enumerable !== !0)
      return !1;
  }
  return !0;
}, Qr = typeof Symbol < "u" && Symbol, vn = hn, gn = function() {
  return typeof Qr != "function" || typeof Symbol != "function" || typeof Qr("foo") != "symbol" || typeof Symbol("bar") != "symbol" ? !1 : vn();
}, Hr = {
  foo: {}
}, mn = Object, bn = function() {
  return { __proto__: Hr }.foo === Hr.foo && !({ __proto__: null } instanceof mn);
}, wn = "Function.prototype.bind called on incompatible ", Sn = Object.prototype.toString, xn = Math.max, En = "[object Function]", Yr = function(e, t) {
  for (var n = [], i = 0; i < e.length; i += 1)
    n[i] = e[i];
  for (var o = 0; o < t.length; o += 1)
    n[o + e.length] = t[o];
  return n;
}, On = function(e, t) {
  for (var n = [], i = t || 0, o = 0; i < e.length; i += 1, o += 1)
    n[o] = e[i];
  return n;
}, _n = function(r, e) {
  for (var t = "", n = 0; n < r.length; n += 1)
    t += r[n], n + 1 < r.length && (t += e);
  return t;
}, An = function(e) {
  var t = this;
  if (typeof t != "function" || Sn.apply(t) !== En)
    throw new TypeError(wn + t);
  for (var n = On(arguments, 1), i, o = function() {
    if (this instanceof i) {
      var v = t.apply(
        this,
        Yr(n, arguments)
      );
      return Object(v) === v ? v : this;
    }
    return t.apply(
      e,
      Yr(n, arguments)
    );
  }, s = xn(0, t.length - n.length), u = [], l = 0; l < s; l++)
    u[l] = "$" + l;
  if (i = Function("binder", "return function (" + _n(u, ",") + "){ return binder.apply(this,arguments); }")(o), t.prototype) {
    var f = function() {
    };
    f.prototype = t.prototype, i.prototype = new f(), f.prototype = null;
  }
  return i;
}, Pn = An, mr = Function.prototype.bind || Pn, Rn = Function.prototype.call, Tn = Object.prototype.hasOwnProperty, jn = mr, Nn = jn.call(Rn, Tn), E, ve = SyntaxError, St = Function, he = TypeError, Ke = function(r) {
  try {
    return St('"use strict"; return (' + r + ").constructor;")();
  } catch {
  }
}, oe = Object.getOwnPropertyDescriptor;
if (oe)
  try {
    oe({}, "");
  } catch {
    oe = null;
  }
var Ze = function() {
  throw new he();
}, $n = oe ? function() {
  try {
    return arguments.callee, Ze;
  } catch {
    try {
      return oe(arguments, "callee").get;
    } catch {
      return Ze;
    }
  }
}() : Ze, fe = gn(), Cn = bn(), C = Object.getPrototypeOf || (Cn ? function(r) {
  return r.__proto__;
} : null), pe = {}, In = typeof Uint8Array > "u" || !C ? E : C(Uint8Array), ie = {
  "%AggregateError%": typeof AggregateError > "u" ? E : AggregateError,
  "%Array%": Array,
  "%ArrayBuffer%": typeof ArrayBuffer > "u" ? E : ArrayBuffer,
  "%ArrayIteratorPrototype%": fe && C ? C([][Symbol.iterator]()) : E,
  "%AsyncFromSyncIteratorPrototype%": E,
  "%AsyncFunction%": pe,
  "%AsyncGenerator%": pe,
  "%AsyncGeneratorFunction%": pe,
  "%AsyncIteratorPrototype%": pe,
  "%Atomics%": typeof Atomics > "u" ? E : Atomics,
  "%BigInt%": typeof BigInt > "u" ? E : BigInt,
  "%BigInt64Array%": typeof BigInt64Array > "u" ? E : BigInt64Array,
  "%BigUint64Array%": typeof BigUint64Array > "u" ? E : BigUint64Array,
  "%Boolean%": Boolean,
  "%DataView%": typeof DataView > "u" ? E : DataView,
  "%Date%": Date,
  "%decodeURI%": decodeURI,
  "%decodeURIComponent%": decodeURIComponent,
  "%encodeURI%": encodeURI,
  "%encodeURIComponent%": encodeURIComponent,
  "%Error%": Error,
  "%eval%": eval,
  // eslint-disable-line no-eval
  "%EvalError%": EvalError,
  "%Float32Array%": typeof Float32Array > "u" ? E : Float32Array,
  "%Float64Array%": typeof Float64Array > "u" ? E : Float64Array,
  "%FinalizationRegistry%": typeof FinalizationRegistry > "u" ? E : FinalizationRegistry,
  "%Function%": St,
  "%GeneratorFunction%": pe,
  "%Int8Array%": typeof Int8Array > "u" ? E : Int8Array,
  "%Int16Array%": typeof Int16Array > "u" ? E : Int16Array,
  "%Int32Array%": typeof Int32Array > "u" ? E : Int32Array,
  "%isFinite%": isFinite,
  "%isNaN%": isNaN,
  "%IteratorPrototype%": fe && C ? C(C([][Symbol.iterator]())) : E,
  "%JSON%": typeof JSON == "object" ? JSON : E,
  "%Map%": typeof Map > "u" ? E : Map,
  "%MapIteratorPrototype%": typeof Map > "u" || !fe || !C ? E : C((/* @__PURE__ */ new Map())[Symbol.iterator]()),
  "%Math%": Math,
  "%Number%": Number,
  "%Object%": Object,
  "%parseFloat%": parseFloat,
  "%parseInt%": parseInt,
  "%Promise%": typeof Promise > "u" ? E : Promise,
  "%Proxy%": typeof Proxy > "u" ? E : Proxy,
  "%RangeError%": RangeError,
  "%ReferenceError%": ReferenceError,
  "%Reflect%": typeof Reflect > "u" ? E : Reflect,
  "%RegExp%": RegExp,
  "%Set%": typeof Set > "u" ? E : Set,
  "%SetIteratorPrototype%": typeof Set > "u" || !fe || !C ? E : C((/* @__PURE__ */ new Set())[Symbol.iterator]()),
  "%SharedArrayBuffer%": typeof SharedArrayBuffer > "u" ? E : SharedArrayBuffer,
  "%String%": String,
  "%StringIteratorPrototype%": fe && C ? C(""[Symbol.iterator]()) : E,
  "%Symbol%": fe ? Symbol : E,
  "%SyntaxError%": ve,
  "%ThrowTypeError%": $n,
  "%TypedArray%": In,
  "%TypeError%": he,
  "%Uint8Array%": typeof Uint8Array > "u" ? E : Uint8Array,
  "%Uint8ClampedArray%": typeof Uint8ClampedArray > "u" ? E : Uint8ClampedArray,
  "%Uint16Array%": typeof Uint16Array > "u" ? E : Uint16Array,
  "%Uint32Array%": typeof Uint32Array > "u" ? E : Uint32Array,
  "%URIError%": URIError,
  "%WeakMap%": typeof WeakMap > "u" ? E : WeakMap,
  "%WeakRef%": typeof WeakRef > "u" ? E : WeakRef,
  "%WeakSet%": typeof WeakSet > "u" ? E : WeakSet
};
if (C)
  try {
    null.error;
  } catch (r) {
    var kn = C(C(r));
    ie["%Error.prototype%"] = kn;
  }
var Fn = function r(e) {
  var t;
  if (e === "%AsyncFunction%")
    t = Ke("async function () {}");
  else if (e === "%GeneratorFunction%")
    t = Ke("function* () {}");
  else if (e === "%AsyncGeneratorFunction%")
    t = Ke("async function* () {}");
  else if (e === "%AsyncGenerator%") {
    var n = r("%AsyncGeneratorFunction%");
    n && (t = n.prototype);
  } else if (e === "%AsyncIteratorPrototype%") {
    var i = r("%AsyncGenerator%");
    i && C && (t = C(i.prototype));
  }
  return ie[e] = t, t;
}, Xr = {
  "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
  "%ArrayPrototype%": ["Array", "prototype"],
  "%ArrayProto_entries%": ["Array", "prototype", "entries"],
  "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
  "%ArrayProto_keys%": ["Array", "prototype", "keys"],
  "%ArrayProto_values%": ["Array", "prototype", "values"],
  "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
  "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
  "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
  "%BooleanPrototype%": ["Boolean", "prototype"],
  "%DataViewPrototype%": ["DataView", "prototype"],
  "%DatePrototype%": ["Date", "prototype"],
  "%ErrorPrototype%": ["Error", "prototype"],
  "%EvalErrorPrototype%": ["EvalError", "prototype"],
  "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
  "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
  "%FunctionPrototype%": ["Function", "prototype"],
  "%Generator%": ["GeneratorFunction", "prototype"],
  "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
  "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
  "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
  "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
  "%JSONParse%": ["JSON", "parse"],
  "%JSONStringify%": ["JSON", "stringify"],
  "%MapPrototype%": ["Map", "prototype"],
  "%NumberPrototype%": ["Number", "prototype"],
  "%ObjectPrototype%": ["Object", "prototype"],
  "%ObjProto_toString%": ["Object", "prototype", "toString"],
  "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
  "%PromisePrototype%": ["Promise", "prototype"],
  "%PromiseProto_then%": ["Promise", "prototype", "then"],
  "%Promise_all%": ["Promise", "all"],
  "%Promise_reject%": ["Promise", "reject"],
  "%Promise_resolve%": ["Promise", "resolve"],
  "%RangeErrorPrototype%": ["RangeError", "prototype"],
  "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
  "%RegExpPrototype%": ["RegExp", "prototype"],
  "%SetPrototype%": ["Set", "prototype"],
  "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
  "%StringPrototype%": ["String", "prototype"],
  "%SymbolPrototype%": ["Symbol", "prototype"],
  "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
  "%TypedArrayPrototype%": ["TypedArray", "prototype"],
  "%TypeErrorPrototype%": ["TypeError", "prototype"],
  "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
  "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
  "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
  "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
  "%URIErrorPrototype%": ["URIError", "prototype"],
  "%WeakMapPrototype%": ["WeakMap", "prototype"],
  "%WeakSetPrototype%": ["WeakSet", "prototype"]
}, Re = mr, Me = Nn, Dn = Re.call(Function.call, Array.prototype.concat), Ln = Re.call(Function.apply, Array.prototype.splice), Kr = Re.call(Function.call, String.prototype.replace), Be = Re.call(Function.call, String.prototype.slice), Un = Re.call(Function.call, RegExp.prototype.exec), Mn = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g, Bn = /\\(\\)?/g, Wn = function(e) {
  var t = Be(e, 0, 1), n = Be(e, -1);
  if (t === "%" && n !== "%")
    throw new ve("invalid intrinsic syntax, expected closing `%`");
  if (n === "%" && t !== "%")
    throw new ve("invalid intrinsic syntax, expected opening `%`");
  var i = [];
  return Kr(e, Mn, function(o, s, u, l) {
    i[i.length] = u ? Kr(l, Bn, "$1") : s || o;
  }), i;
}, Gn = function(e, t) {
  var n = e, i;
  if (Me(Xr, n) && (i = Xr[n], n = "%" + i[0] + "%"), Me(ie, n)) {
    var o = ie[n];
    if (o === pe && (o = Fn(n)), typeof o > "u" && !t)
      throw new he("intrinsic " + e + " exists, but is not available. Please file an issue!");
    return {
      alias: i,
      name: n,
      value: o
    };
  }
  throw new ve("intrinsic " + e + " does not exist!");
}, se = function(e, t) {
  if (typeof e != "string" || e.length === 0)
    throw new he("intrinsic name must be a non-empty string");
  if (arguments.length > 1 && typeof t != "boolean")
    throw new he('"allowMissing" argument must be a boolean');
  if (Un(/^%?[^%]*%?$/, e) === null)
    throw new ve("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
  var n = Wn(e), i = n.length > 0 ? n[0] : "", o = Gn("%" + i + "%", t), s = o.name, u = o.value, l = !1, f = o.alias;
  f && (i = f[0], Ln(n, Dn([0, 1], f)));
  for (var v = 1, m = !0; v < n.length; v += 1) {
    var h = n[v], b = Be(h, 0, 1), y = Be(h, -1);
    if ((b === '"' || b === "'" || b === "`" || y === '"' || y === "'" || y === "`") && b !== y)
      throw new ve("property names with quotes must have matching quotes");
    if ((h === "constructor" || !m) && (l = !0), i += "." + h, s = "%" + i + "%", Me(ie, s))
      u = ie[s];
    else if (u != null) {
      if (!(h in u)) {
        if (!t)
          throw new he("base intrinsic for " + e + " exists, but the property is not available.");
        return;
      }
      if (oe && v + 1 >= n.length) {
        var S = oe(u, h);
        m = !!S, m && "get" in S && !("originalValue" in S.get) ? u = S.get : u = u[h];
      } else
        m = Me(u, h), u = u[h];
      m && !l && (ie[s] = u);
    }
  }
  return u;
}, xt = { exports: {} }, zn = se, sr = zn("%Object.defineProperty%", !0), lr = function() {
  if (sr)
    try {
      return sr({}, "a", { value: 1 }), !0;
    } catch {
      return !1;
    }
  return !1;
};
lr.hasArrayLengthDefineBug = function() {
  if (!lr())
    return null;
  try {
    return sr([], "length", { value: 1 }).length !== 1;
  } catch {
    return !0;
  }
};
var Et = lr, qn = se, Le = qn("%Object.getOwnPropertyDescriptor%", !0);
if (Le)
  try {
    Le([], "length");
  } catch {
    Le = null;
  }
var Ot = Le, Vn = Et(), br = se, Oe = Vn && br("%Object.defineProperty%", !0);
if (Oe)
  try {
    Oe({}, "a", { value: 1 });
  } catch {
    Oe = !1;
  }
var Jn = br("%SyntaxError%"), de = br("%TypeError%"), Zr = Ot, Qn = function(e, t, n) {
  if (!e || typeof e != "object" && typeof e != "function")
    throw new de("`obj` must be an object or a function`");
  if (typeof t != "string" && typeof t != "symbol")
    throw new de("`property` must be a string or a symbol`");
  if (arguments.length > 3 && typeof arguments[3] != "boolean" && arguments[3] !== null)
    throw new de("`nonEnumerable`, if provided, must be a boolean or null");
  if (arguments.length > 4 && typeof arguments[4] != "boolean" && arguments[4] !== null)
    throw new de("`nonWritable`, if provided, must be a boolean or null");
  if (arguments.length > 5 && typeof arguments[5] != "boolean" && arguments[5] !== null)
    throw new de("`nonConfigurable`, if provided, must be a boolean or null");
  if (arguments.length > 6 && typeof arguments[6] != "boolean")
    throw new de("`loose`, if provided, must be a boolean");
  var i = arguments.length > 3 ? arguments[3] : null, o = arguments.length > 4 ? arguments[4] : null, s = arguments.length > 5 ? arguments[5] : null, u = arguments.length > 6 ? arguments[6] : !1, l = !!Zr && Zr(e, t);
  if (Oe)
    Oe(e, t, {
      configurable: s === null && l ? l.configurable : !s,
      enumerable: i === null && l ? l.enumerable : !i,
      value: n,
      writable: o === null && l ? l.writable : !o
    });
  else if (u || !i && !o && !s)
    e[t] = n;
  else
    throw new Jn("This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.");
}, _t = se, et = Qn, Hn = Et(), rt = Ot, tt = _t("%TypeError%"), Yn = _t("%Math.floor%"), Xn = function(e, t) {
  if (typeof e != "function")
    throw new tt("`fn` is not a function");
  if (typeof t != "number" || t < 0 || t > 4294967295 || Yn(t) !== t)
    throw new tt("`length` must be a positive 32-bit integer");
  var n = arguments.length > 2 && !!arguments[2], i = !0, o = !0;
  if ("length" in e && rt) {
    var s = rt(e, "length");
    s && !s.configurable && (i = !1), s && !s.writable && (o = !1);
  }
  return (i || o || !n) && (Hn ? et(e, "length", t, !0, !0) : et(e, "length", t)), e;
};
(function(r) {
  var e = mr, t = se, n = Xn, i = t("%TypeError%"), o = t("%Function.prototype.apply%"), s = t("%Function.prototype.call%"), u = t("%Reflect.apply%", !0) || e.call(s, o), l = t("%Object.defineProperty%", !0), f = t("%Math.max%");
  if (l)
    try {
      l({}, "a", { value: 1 });
    } catch {
      l = null;
    }
  r.exports = function(h) {
    if (typeof h != "function")
      throw new i("a function is required");
    var b = u(e, s, arguments);
    return n(
      b,
      1 + f(0, h.length - (arguments.length - 1)),
      !0
    );
  };
  var v = function() {
    return u(e, o, arguments);
  };
  l ? l(r.exports, "apply", { value: v }) : r.exports.apply = v;
})(xt);
var Kn = xt.exports, At = se, Pt = Kn, Zn = Pt(At("String.prototype.indexOf")), ea = function(e, t) {
  var n = At(e, !!t);
  return typeof n == "function" && Zn(e, ".prototype.") > -1 ? Pt(n) : n;
};
const ra = {}, ta = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ra
}, Symbol.toStringTag, { value: "Module" })), na = /* @__PURE__ */ yn(ta);
var wr = typeof Map == "function" && Map.prototype, er = Object.getOwnPropertyDescriptor && wr ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null, We = wr && er && typeof er.get == "function" ? er.get : null, nt = wr && Map.prototype.forEach, Sr = typeof Set == "function" && Set.prototype, rr = Object.getOwnPropertyDescriptor && Sr ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null, Ge = Sr && rr && typeof rr.get == "function" ? rr.get : null, at = Sr && Set.prototype.forEach, aa = typeof WeakMap == "function" && WeakMap.prototype, _e = aa ? WeakMap.prototype.has : null, oa = typeof WeakSet == "function" && WeakSet.prototype, Ae = oa ? WeakSet.prototype.has : null, ia = typeof WeakRef == "function" && WeakRef.prototype, ot = ia ? WeakRef.prototype.deref : null, sa = Boolean.prototype.valueOf, la = Object.prototype.toString, ua = Function.prototype.toString, ca = String.prototype.match, xr = String.prototype.slice, ee = String.prototype.replace, fa = String.prototype.toUpperCase, it = String.prototype.toLowerCase, Rt = RegExp.prototype.test, st = Array.prototype.concat, z = Array.prototype.join, da = Array.prototype.slice, lt = Math.floor, ur = typeof BigInt == "function" ? BigInt.prototype.valueOf : null, tr = Object.getOwnPropertySymbols, cr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? Symbol.prototype.toString : null, ge = typeof Symbol == "function" && typeof Symbol.iterator == "object", k = typeof Symbol == "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === ge || !0) ? Symbol.toStringTag : null, Tt = Object.prototype.propertyIsEnumerable, ut = (typeof Reflect == "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(r) {
  return r.__proto__;
} : null);
function ct(r, e) {
  if (r === 1 / 0 || r === -1 / 0 || r !== r || r && r > -1e3 && r < 1e3 || Rt.call(/e/, e))
    return e;
  var t = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
  if (typeof r == "number") {
    var n = r < 0 ? -lt(-r) : lt(r);
    if (n !== r) {
      var i = String(n), o = xr.call(e, i.length + 1);
      return ee.call(i, t, "$&_") + "." + ee.call(ee.call(o, /([0-9]{3})/g, "$&_"), /_$/, "");
    }
  }
  return ee.call(e, t, "$&_");
}
var fr = na, ft = fr.custom, dt = Nt(ft) ? ft : null, pa = function r(e, t, n, i) {
  var o = t || {};
  if (K(o, "quoteStyle") && o.quoteStyle !== "single" && o.quoteStyle !== "double")
    throw new TypeError('option "quoteStyle" must be "single" or "double"');
  if (K(o, "maxStringLength") && (typeof o.maxStringLength == "number" ? o.maxStringLength < 0 && o.maxStringLength !== 1 / 0 : o.maxStringLength !== null))
    throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
  var s = K(o, "customInspect") ? o.customInspect : !0;
  if (typeof s != "boolean" && s !== "symbol")
    throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
  if (K(o, "indent") && o.indent !== null && o.indent !== "	" && !(parseInt(o.indent, 10) === o.indent && o.indent > 0))
    throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
  if (K(o, "numericSeparator") && typeof o.numericSeparator != "boolean")
    throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
  var u = o.numericSeparator;
  if (typeof e > "u")
    return "undefined";
  if (e === null)
    return "null";
  if (typeof e == "boolean")
    return e ? "true" : "false";
  if (typeof e == "string")
    return Ct(e, o);
  if (typeof e == "number") {
    if (e === 0)
      return 1 / 0 / e > 0 ? "0" : "-0";
    var l = String(e);
    return u ? ct(e, l) : l;
  }
  if (typeof e == "bigint") {
    var f = String(e) + "n";
    return u ? ct(e, f) : f;
  }
  var v = typeof o.depth > "u" ? 5 : o.depth;
  if (typeof n > "u" && (n = 0), n >= v && v > 0 && typeof e == "object")
    return dr(e) ? "[Array]" : "[Object]";
  var m = Na(o, n);
  if (typeof i > "u")
    i = [];
  else if ($t(i, e) >= 0)
    return "[Circular]";
  function h(j, L, W) {
    if (L && (i = da.call(i), i.push(L)), W) {
      var J = {
        depth: o.depth
      };
      return K(o, "quoteStyle") && (J.quoteStyle = o.quoteStyle), r(j, J, n + 1, i);
    }
    return r(j, o, n + 1, i);
  }
  if (typeof e == "function" && !pt(e)) {
    var b = xa(e), y = ke(e, h);
    return "[Function" + (b ? ": " + b : " (anonymous)") + "]" + (y.length > 0 ? " { " + z.call(y, ", ") + " }" : "");
  }
  if (Nt(e)) {
    var S = ge ? ee.call(String(e), /^(Symbol\(.*\))_[^)]*$/, "$1") : cr.call(e);
    return typeof e == "object" && !ge ? Se(S) : S;
  }
  if (Ra(e)) {
    for (var N = "<" + it.call(String(e.nodeName)), w = e.attributes || [], A = 0; A < w.length; A++)
      N += " " + w[A].name + "=" + jt(ya(w[A].value), "double", o);
    return N += ">", e.childNodes && e.childNodes.length && (N += "..."), N += "</" + it.call(String(e.nodeName)) + ">", N;
  }
  if (dr(e)) {
    if (e.length === 0)
      return "[]";
    var U = ke(e, h);
    return m && !ja(U) ? "[" + pr(U, m) + "]" : "[ " + z.call(U, ", ") + " ]";
  }
  if (va(e)) {
    var Y = ke(e, h);
    return !("cause" in Error.prototype) && "cause" in e && !Tt.call(e, "cause") ? "{ [" + String(e) + "] " + z.call(st.call("[cause]: " + h(e.cause), Y), ", ") + " }" : Y.length === 0 ? "[" + String(e) + "]" : "{ [" + String(e) + "] " + z.call(Y, ", ") + " }";
  }
  if (typeof e == "object" && s) {
    if (dt && typeof e[dt] == "function" && fr)
      return fr(e, { depth: v - n });
    if (s !== "symbol" && typeof e.inspect == "function")
      return e.inspect();
  }
  if (Ea(e)) {
    var te = [];
    return nt && nt.call(e, function(j, L) {
      te.push(h(L, e, !0) + " => " + h(j, e));
    }), yt("Map", We.call(e), te, m);
  }
  if (Aa(e)) {
    var le = [];
    return at && at.call(e, function(j) {
      le.push(h(j, e));
    }), yt("Set", Ge.call(e), le, m);
  }
  if (Oa(e))
    return nr("WeakMap");
  if (Pa(e))
    return nr("WeakSet");
  if (_a(e))
    return nr("WeakRef");
  if (ma(e))
    return Se(h(Number(e)));
  if (wa(e))
    return Se(h(ur.call(e)));
  if (ba(e))
    return Se(sa.call(e));
  if (ga(e))
    return Se(h(String(e)));
  if (typeof window < "u" && e === window)
    return "{ [object Window] }";
  if (e === pn)
    return "{ [object globalThis] }";
  if (!ha(e) && !pt(e)) {
    var q = ke(e, h), B = ut ? ut(e) === Object.prototype : e instanceof Object || e.constructor === Object, V = e instanceof Object ? "" : "null prototype", X = !B && k && Object(e) === e && k in e ? xr.call(re(e), 8, -1) : V ? "Object" : "", ne = B || typeof e.constructor != "function" ? "" : e.constructor.name ? e.constructor.name + " " : "", D = ne + (X || V ? "[" + z.call(st.call([], X || [], V || []), ": ") + "] " : "");
    return q.length === 0 ? D + "{}" : m ? D + "{" + pr(q, m) + "}" : D + "{ " + z.call(q, ", ") + " }";
  }
  return String(e);
};
function jt(r, e, t) {
  var n = (t.quoteStyle || e) === "double" ? '"' : "'";
  return n + r + n;
}
function ya(r) {
  return ee.call(String(r), /"/g, "&quot;");
}
function dr(r) {
  return re(r) === "[object Array]" && (!k || !(typeof r == "object" && k in r));
}
function ha(r) {
  return re(r) === "[object Date]" && (!k || !(typeof r == "object" && k in r));
}
function pt(r) {
  return re(r) === "[object RegExp]" && (!k || !(typeof r == "object" && k in r));
}
function va(r) {
  return re(r) === "[object Error]" && (!k || !(typeof r == "object" && k in r));
}
function ga(r) {
  return re(r) === "[object String]" && (!k || !(typeof r == "object" && k in r));
}
function ma(r) {
  return re(r) === "[object Number]" && (!k || !(typeof r == "object" && k in r));
}
function ba(r) {
  return re(r) === "[object Boolean]" && (!k || !(typeof r == "object" && k in r));
}
function Nt(r) {
  if (ge)
    return r && typeof r == "object" && r instanceof Symbol;
  if (typeof r == "symbol")
    return !0;
  if (!r || typeof r != "object" || !cr)
    return !1;
  try {
    return cr.call(r), !0;
  } catch {
  }
  return !1;
}
function wa(r) {
  if (!r || typeof r != "object" || !ur)
    return !1;
  try {
    return ur.call(r), !0;
  } catch {
  }
  return !1;
}
var Sa = Object.prototype.hasOwnProperty || function(r) {
  return r in this;
};
function K(r, e) {
  return Sa.call(r, e);
}
function re(r) {
  return la.call(r);
}
function xa(r) {
  if (r.name)
    return r.name;
  var e = ca.call(ua.call(r), /^function\s*([\w$]+)/);
  return e ? e[1] : null;
}
function $t(r, e) {
  if (r.indexOf)
    return r.indexOf(e);
  for (var t = 0, n = r.length; t < n; t++)
    if (r[t] === e)
      return t;
  return -1;
}
function Ea(r) {
  if (!We || !r || typeof r != "object")
    return !1;
  try {
    We.call(r);
    try {
      Ge.call(r);
    } catch {
      return !0;
    }
    return r instanceof Map;
  } catch {
  }
  return !1;
}
function Oa(r) {
  if (!_e || !r || typeof r != "object")
    return !1;
  try {
    _e.call(r, _e);
    try {
      Ae.call(r, Ae);
    } catch {
      return !0;
    }
    return r instanceof WeakMap;
  } catch {
  }
  return !1;
}
function _a(r) {
  if (!ot || !r || typeof r != "object")
    return !1;
  try {
    return ot.call(r), !0;
  } catch {
  }
  return !1;
}
function Aa(r) {
  if (!Ge || !r || typeof r != "object")
    return !1;
  try {
    Ge.call(r);
    try {
      We.call(r);
    } catch {
      return !0;
    }
    return r instanceof Set;
  } catch {
  }
  return !1;
}
function Pa(r) {
  if (!Ae || !r || typeof r != "object")
    return !1;
  try {
    Ae.call(r, Ae);
    try {
      _e.call(r, _e);
    } catch {
      return !0;
    }
    return r instanceof WeakSet;
  } catch {
  }
  return !1;
}
function Ra(r) {
  return !r || typeof r != "object" ? !1 : typeof HTMLElement < "u" && r instanceof HTMLElement ? !0 : typeof r.nodeName == "string" && typeof r.getAttribute == "function";
}
function Ct(r, e) {
  if (r.length > e.maxStringLength) {
    var t = r.length - e.maxStringLength, n = "... " + t + " more character" + (t > 1 ? "s" : "");
    return Ct(xr.call(r, 0, e.maxStringLength), e) + n;
  }
  var i = ee.call(ee.call(r, /(['\\])/g, "\\$1"), /[\x00-\x1f]/g, Ta);
  return jt(i, "single", e);
}
function Ta(r) {
  var e = r.charCodeAt(0), t = {
    8: "b",
    9: "t",
    10: "n",
    12: "f",
    13: "r"
  }[e];
  return t ? "\\" + t : "\\x" + (e < 16 ? "0" : "") + fa.call(e.toString(16));
}
function Se(r) {
  return "Object(" + r + ")";
}
function nr(r) {
  return r + " { ? }";
}
function yt(r, e, t, n) {
  var i = n ? pr(t, n) : z.call(t, ", ");
  return r + " (" + e + ") {" + i + "}";
}
function ja(r) {
  for (var e = 0; e < r.length; e++)
    if ($t(r[e], `
`) >= 0)
      return !1;
  return !0;
}
function Na(r, e) {
  var t;
  if (r.indent === "	")
    t = "	";
  else if (typeof r.indent == "number" && r.indent > 0)
    t = z.call(Array(r.indent + 1), " ");
  else
    return null;
  return {
    base: t,
    prev: z.call(Array(e + 1), t)
  };
}
function pr(r, e) {
  if (r.length === 0)
    return "";
  var t = `
` + e.prev + e.base;
  return t + z.call(r, "," + t) + `
` + e.prev;
}
function ke(r, e) {
  var t = dr(r), n = [];
  if (t) {
    n.length = r.length;
    for (var i = 0; i < r.length; i++)
      n[i] = K(r, i) ? e(r[i], r) : "";
  }
  var o = typeof tr == "function" ? tr(r) : [], s;
  if (ge) {
    s = {};
    for (var u = 0; u < o.length; u++)
      s["$" + o[u]] = o[u];
  }
  for (var l in r)
    K(r, l) && (t && String(Number(l)) === l && l < r.length || ge && s["$" + l] instanceof Symbol || (Rt.call(/[^\w$]/, l) ? n.push(e(l, r) + ": " + e(r[l], r)) : n.push(l + ": " + e(r[l], r))));
  if (typeof tr == "function")
    for (var f = 0; f < o.length; f++)
      Tt.call(r, o[f]) && n.push("[" + e(o[f]) + "]: " + e(r[o[f]], r));
  return n;
}
var Er = se, be = ea, $a = pa, Ca = Er("%TypeError%"), Fe = Er("%WeakMap%", !0), De = Er("%Map%", !0), Ia = be("WeakMap.prototype.get", !0), ka = be("WeakMap.prototype.set", !0), Fa = be("WeakMap.prototype.has", !0), Da = be("Map.prototype.get", !0), La = be("Map.prototype.set", !0), Ua = be("Map.prototype.has", !0), Or = function(r, e) {
  for (var t = r, n; (n = t.next) !== null; t = n)
    if (n.key === e)
      return t.next = n.next, n.next = r.next, r.next = n, n;
}, Ma = function(r, e) {
  var t = Or(r, e);
  return t && t.value;
}, Ba = function(r, e, t) {
  var n = Or(r, e);
  n ? n.value = t : r.next = {
    // eslint-disable-line no-param-reassign
    key: e,
    next: r.next,
    value: t
  };
}, Wa = function(r, e) {
  return !!Or(r, e);
}, Ga = function() {
  var e, t, n, i = {
    assert: function(o) {
      if (!i.has(o))
        throw new Ca("Side channel does not contain " + $a(o));
    },
    get: function(o) {
      if (Fe && o && (typeof o == "object" || typeof o == "function")) {
        if (e)
          return Ia(e, o);
      } else if (De) {
        if (t)
          return Da(t, o);
      } else if (n)
        return Ma(n, o);
    },
    has: function(o) {
      if (Fe && o && (typeof o == "object" || typeof o == "function")) {
        if (e)
          return Fa(e, o);
      } else if (De) {
        if (t)
          return Ua(t, o);
      } else if (n)
        return Wa(n, o);
      return !1;
    },
    set: function(o, s) {
      Fe && o && (typeof o == "object" || typeof o == "function") ? (e || (e = new Fe()), ka(e, o, s)) : De ? (t || (t = new De()), La(t, o, s)) : (n || (n = { key: {}, next: null }), Ba(n, o, s));
    }
  };
  return i;
}, za = String.prototype.replace, qa = /%20/g, ar = {
  RFC1738: "RFC1738",
  RFC3986: "RFC3986"
}, _r = {
  default: ar.RFC3986,
  formatters: {
    RFC1738: function(r) {
      return za.call(r, qa, "+");
    },
    RFC3986: function(r) {
      return String(r);
    }
  },
  RFC1738: ar.RFC1738,
  RFC3986: ar.RFC3986
}, Va = _r, or = Object.prototype.hasOwnProperty, ae = Array.isArray, G = function() {
  for (var r = [], e = 0; e < 256; ++e)
    r.push("%" + ((e < 16 ? "0" : "") + e.toString(16)).toUpperCase());
  return r;
}(), Ja = function(e) {
  for (; e.length > 1; ) {
    var t = e.pop(), n = t.obj[t.prop];
    if (ae(n)) {
      for (var i = [], o = 0; o < n.length; ++o)
        typeof n[o] < "u" && i.push(n[o]);
      t.obj[t.prop] = i;
    }
  }
}, It = function(e, t) {
  for (var n = t && t.plainObjects ? /* @__PURE__ */ Object.create(null) : {}, i = 0; i < e.length; ++i)
    typeof e[i] < "u" && (n[i] = e[i]);
  return n;
}, Qa = function r(e, t, n) {
  if (!t)
    return e;
  if (typeof t != "object") {
    if (ae(e))
      e.push(t);
    else if (e && typeof e == "object")
      (n && (n.plainObjects || n.allowPrototypes) || !or.call(Object.prototype, t)) && (e[t] = !0);
    else
      return [e, t];
    return e;
  }
  if (!e || typeof e != "object")
    return [e].concat(t);
  var i = e;
  return ae(e) && !ae(t) && (i = It(e, n)), ae(e) && ae(t) ? (t.forEach(function(o, s) {
    if (or.call(e, s)) {
      var u = e[s];
      u && typeof u == "object" && o && typeof o == "object" ? e[s] = r(u, o, n) : e.push(o);
    } else
      e[s] = o;
  }), e) : Object.keys(t).reduce(function(o, s) {
    var u = t[s];
    return or.call(o, s) ? o[s] = r(o[s], u, n) : o[s] = u, o;
  }, i);
}, Ha = function(e, t) {
  return Object.keys(t).reduce(function(n, i) {
    return n[i] = t[i], n;
  }, e);
}, Ya = function(r, e, t) {
  var n = r.replace(/\+/g, " ");
  if (t === "iso-8859-1")
    return n.replace(/%[0-9a-f]{2}/gi, unescape);
  try {
    return decodeURIComponent(n);
  } catch {
    return n;
  }
}, Xa = function(e, t, n, i, o) {
  if (e.length === 0)
    return e;
  var s = e;
  if (typeof e == "symbol" ? s = Symbol.prototype.toString.call(e) : typeof e != "string" && (s = String(e)), n === "iso-8859-1")
    return escape(s).replace(/%u[0-9a-f]{4}/gi, function(v) {
      return "%26%23" + parseInt(v.slice(2), 16) + "%3B";
    });
  for (var u = "", l = 0; l < s.length; ++l) {
    var f = s.charCodeAt(l);
    if (f === 45 || f === 46 || f === 95 || f === 126 || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || o === Va.RFC1738 && (f === 40 || f === 41)) {
      u += s.charAt(l);
      continue;
    }
    if (f < 128) {
      u = u + G[f];
      continue;
    }
    if (f < 2048) {
      u = u + (G[192 | f >> 6] + G[128 | f & 63]);
      continue;
    }
    if (f < 55296 || f >= 57344) {
      u = u + (G[224 | f >> 12] + G[128 | f >> 6 & 63] + G[128 | f & 63]);
      continue;
    }
    l += 1, f = 65536 + ((f & 1023) << 10 | s.charCodeAt(l) & 1023), u += G[240 | f >> 18] + G[128 | f >> 12 & 63] + G[128 | f >> 6 & 63] + G[128 | f & 63];
  }
  return u;
}, Ka = function(e) {
  for (var t = [{ obj: { o: e }, prop: "o" }], n = [], i = 0; i < t.length; ++i)
    for (var o = t[i], s = o.obj[o.prop], u = Object.keys(s), l = 0; l < u.length; ++l) {
      var f = u[l], v = s[f];
      typeof v == "object" && v !== null && n.indexOf(v) === -1 && (t.push({ obj: s, prop: f }), n.push(v));
    }
  return Ja(t), e;
}, Za = function(e) {
  return Object.prototype.toString.call(e) === "[object RegExp]";
}, eo = function(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}, ro = function(e, t) {
  return [].concat(e, t);
}, to = function(e, t) {
  if (ae(e)) {
    for (var n = [], i = 0; i < e.length; i += 1)
      n.push(t(e[i]));
    return n;
  }
  return t(e);
}, kt = {
  arrayToObject: It,
  assign: Ha,
  combine: ro,
  compact: Ka,
  decode: Ya,
  encode: Xa,
  isBuffer: eo,
  isRegExp: Za,
  maybeMap: to,
  merge: Qa
}, Ft = Ga, Ue = kt, Pe = _r, no = Object.prototype.hasOwnProperty, ht = {
  brackets: function(e) {
    return e + "[]";
  },
  comma: "comma",
  indices: function(e, t) {
    return e + "[" + t + "]";
  },
  repeat: function(e) {
    return e;
  }
}, H = Array.isArray, ao = Array.prototype.push, Dt = function(r, e) {
  ao.apply(r, H(e) ? e : [e]);
}, oo = Date.prototype.toISOString, vt = Pe.default, I = {
  addQueryPrefix: !1,
  allowDots: !1,
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encoder: Ue.encode,
  encodeValuesOnly: !1,
  format: vt,
  formatter: Pe.formatters[vt],
  // deprecated
  indices: !1,
  serializeDate: function(e) {
    return oo.call(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
}, io = function(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}, ir = {}, so = function r(e, t, n, i, o, s, u, l, f, v, m, h, b, y, S, N) {
  for (var w = e, A = N, U = 0, Y = !1; (A = A.get(ir)) !== void 0 && !Y; ) {
    var te = A.get(e);
    if (U += 1, typeof te < "u") {
      if (te === U)
        throw new RangeError("Cyclic object value");
      Y = !0;
    }
    typeof A.get(ir) > "u" && (U = 0);
  }
  if (typeof l == "function" ? w = l(t, w) : w instanceof Date ? w = m(w) : n === "comma" && H(w) && (w = Ue.maybeMap(w, function(J) {
    return J instanceof Date ? m(J) : J;
  })), w === null) {
    if (o)
      return u && !y ? u(t, I.encoder, S, "key", h) : t;
    w = "";
  }
  if (io(w) || Ue.isBuffer(w)) {
    if (u) {
      var le = y ? t : u(t, I.encoder, S, "key", h);
      return [b(le) + "=" + b(u(w, I.encoder, S, "value", h))];
    }
    return [b(t) + "=" + b(String(w))];
  }
  var q = [];
  if (typeof w > "u")
    return q;
  var B;
  if (n === "comma" && H(w))
    y && u && (w = Ue.maybeMap(w, u)), B = [{ value: w.length > 0 ? w.join(",") || null : void 0 }];
  else if (H(l))
    B = l;
  else {
    var V = Object.keys(w);
    B = f ? V.sort(f) : V;
  }
  for (var X = i && H(w) && w.length === 1 ? t + "[]" : t, ne = 0; ne < B.length; ++ne) {
    var D = B[ne], j = typeof D == "object" && typeof D.value < "u" ? D.value : w[D];
    if (!(s && j === null)) {
      var L = H(w) ? typeof n == "function" ? n(X, D) : X : X + (v ? "." + D : "[" + D + "]");
      N.set(e, U);
      var W = Ft();
      W.set(ir, N), Dt(q, r(
        j,
        L,
        n,
        i,
        o,
        s,
        n === "comma" && y && H(w) ? null : u,
        l,
        f,
        v,
        m,
        h,
        b,
        y,
        S,
        W
      ));
    }
  }
  return q;
}, lo = function(e) {
  if (!e)
    return I;
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function")
    throw new TypeError("Encoder has to be a function.");
  var t = e.charset || I.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1")
    throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  var n = Pe.default;
  if (typeof e.format < "u") {
    if (!no.call(Pe.formatters, e.format))
      throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  var i = Pe.formatters[n], o = I.filter;
  return (typeof e.filter == "function" || H(e.filter)) && (o = e.filter), {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : I.addQueryPrefix,
    allowDots: typeof e.allowDots > "u" ? I.allowDots : !!e.allowDots,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : I.charsetSentinel,
    delimiter: typeof e.delimiter > "u" ? I.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : I.encode,
    encoder: typeof e.encoder == "function" ? e.encoder : I.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : I.encodeValuesOnly,
    filter: o,
    format: n,
    formatter: i,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : I.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : I.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : I.strictNullHandling
  };
}, uo = function(r, e) {
  var t = r, n = lo(e), i, o;
  typeof n.filter == "function" ? (o = n.filter, t = o("", t)) : H(n.filter) && (o = n.filter, i = o);
  var s = [];
  if (typeof t != "object" || t === null)
    return "";
  var u;
  e && e.arrayFormat in ht ? u = e.arrayFormat : e && "indices" in e ? u = e.indices ? "indices" : "repeat" : u = "indices";
  var l = ht[u];
  if (e && "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean")
    throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  var f = l === "comma" && e && e.commaRoundTrip;
  i || (i = Object.keys(t)), n.sort && i.sort(n.sort);
  for (var v = Ft(), m = 0; m < i.length; ++m) {
    var h = i[m];
    n.skipNulls && t[h] === null || Dt(s, so(
      t[h],
      h,
      l,
      f,
      n.strictNullHandling,
      n.skipNulls,
      n.encode ? n.encoder : null,
      n.filter,
      n.sort,
      n.allowDots,
      n.serializeDate,
      n.format,
      n.formatter,
      n.encodeValuesOnly,
      n.charset,
      v
    ));
  }
  var b = s.join(n.delimiter), y = n.addQueryPrefix === !0 ? "?" : "";
  return n.charsetSentinel && (n.charset === "iso-8859-1" ? y += "utf8=%26%2310003%3B&" : y += "utf8=%E2%9C%93&"), b.length > 0 ? y + b : "";
}, me = kt, yr = Object.prototype.hasOwnProperty, co = Array.isArray, $ = {
  allowDots: !1,
  allowPrototypes: !1,
  allowSparse: !1,
  arrayLimit: 20,
  charset: "utf-8",
  charsetSentinel: !1,
  comma: !1,
  decoder: me.decode,
  delimiter: "&",
  depth: 5,
  ignoreQueryPrefix: !1,
  interpretNumericEntities: !1,
  parameterLimit: 1e3,
  parseArrays: !0,
  plainObjects: !1,
  strictNullHandling: !1
}, fo = function(r) {
  return r.replace(/&#(\d+);/g, function(e, t) {
    return String.fromCharCode(parseInt(t, 10));
  });
}, Lt = function(r, e) {
  return r && typeof r == "string" && e.comma && r.indexOf(",") > -1 ? r.split(",") : r;
}, po = "utf8=%26%2310003%3B", yo = "utf8=%E2%9C%93", ho = function(e, t) {
  var n = { __proto__: null }, i = t.ignoreQueryPrefix ? e.replace(/^\?/, "") : e, o = t.parameterLimit === 1 / 0 ? void 0 : t.parameterLimit, s = i.split(t.delimiter, o), u = -1, l, f = t.charset;
  if (t.charsetSentinel)
    for (l = 0; l < s.length; ++l)
      s[l].indexOf("utf8=") === 0 && (s[l] === yo ? f = "utf-8" : s[l] === po && (f = "iso-8859-1"), u = l, l = s.length);
  for (l = 0; l < s.length; ++l)
    if (l !== u) {
      var v = s[l], m = v.indexOf("]="), h = m === -1 ? v.indexOf("=") : m + 1, b, y;
      h === -1 ? (b = t.decoder(v, $.decoder, f, "key"), y = t.strictNullHandling ? null : "") : (b = t.decoder(v.slice(0, h), $.decoder, f, "key"), y = me.maybeMap(
        Lt(v.slice(h + 1), t),
        function(S) {
          return t.decoder(S, $.decoder, f, "value");
        }
      )), y && t.interpretNumericEntities && f === "iso-8859-1" && (y = fo(y)), v.indexOf("[]=") > -1 && (y = co(y) ? [y] : y), yr.call(n, b) ? n[b] = me.combine(n[b], y) : n[b] = y;
    }
  return n;
}, vo = function(r, e, t, n) {
  for (var i = n ? e : Lt(e, t), o = r.length - 1; o >= 0; --o) {
    var s, u = r[o];
    if (u === "[]" && t.parseArrays)
      s = [].concat(i);
    else {
      s = t.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
      var l = u.charAt(0) === "[" && u.charAt(u.length - 1) === "]" ? u.slice(1, -1) : u, f = parseInt(l, 10);
      !t.parseArrays && l === "" ? s = { 0: i } : !isNaN(f) && u !== l && String(f) === l && f >= 0 && t.parseArrays && f <= t.arrayLimit ? (s = [], s[f] = i) : l !== "__proto__" && (s[l] = i);
    }
    i = s;
  }
  return i;
}, go = function(e, t, n, i) {
  if (e) {
    var o = n.allowDots ? e.replace(/\.([^.[]+)/g, "[$1]") : e, s = /(\[[^[\]]*])/, u = /(\[[^[\]]*])/g, l = n.depth > 0 && s.exec(o), f = l ? o.slice(0, l.index) : o, v = [];
    if (f) {
      if (!n.plainObjects && yr.call(Object.prototype, f) && !n.allowPrototypes)
        return;
      v.push(f);
    }
    for (var m = 0; n.depth > 0 && (l = u.exec(o)) !== null && m < n.depth; ) {
      if (m += 1, !n.plainObjects && yr.call(Object.prototype, l[1].slice(1, -1)) && !n.allowPrototypes)
        return;
      v.push(l[1]);
    }
    return l && v.push("[" + o.slice(l.index) + "]"), vo(v, t, n, i);
  }
}, mo = function(e) {
  if (!e)
    return $;
  if (e.decoder !== null && e.decoder !== void 0 && typeof e.decoder != "function")
    throw new TypeError("Decoder has to be a function.");
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1")
    throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  var t = typeof e.charset > "u" ? $.charset : e.charset;
  return {
    allowDots: typeof e.allowDots > "u" ? $.allowDots : !!e.allowDots,
    allowPrototypes: typeof e.allowPrototypes == "boolean" ? e.allowPrototypes : $.allowPrototypes,
    allowSparse: typeof e.allowSparse == "boolean" ? e.allowSparse : $.allowSparse,
    arrayLimit: typeof e.arrayLimit == "number" ? e.arrayLimit : $.arrayLimit,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : $.charsetSentinel,
    comma: typeof e.comma == "boolean" ? e.comma : $.comma,
    decoder: typeof e.decoder == "function" ? e.decoder : $.decoder,
    delimiter: typeof e.delimiter == "string" || me.isRegExp(e.delimiter) ? e.delimiter : $.delimiter,
    // eslint-disable-next-line no-implicit-coercion, no-extra-parens
    depth: typeof e.depth == "number" || e.depth === !1 ? +e.depth : $.depth,
    ignoreQueryPrefix: e.ignoreQueryPrefix === !0,
    interpretNumericEntities: typeof e.interpretNumericEntities == "boolean" ? e.interpretNumericEntities : $.interpretNumericEntities,
    parameterLimit: typeof e.parameterLimit == "number" ? e.parameterLimit : $.parameterLimit,
    parseArrays: e.parseArrays !== !1,
    plainObjects: typeof e.plainObjects == "boolean" ? e.plainObjects : $.plainObjects,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : $.strictNullHandling
  };
}, bo = function(r, e) {
  var t = mo(e);
  if (r === "" || r === null || typeof r > "u")
    return t.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
  for (var n = typeof r == "string" ? ho(r, t) : r, i = t.plainObjects ? /* @__PURE__ */ Object.create(null) : {}, o = Object.keys(n), s = 0; s < o.length; ++s) {
    var u = o[s], l = go(u, n[u], t, typeof r == "string");
    i = me.merge(i, l, t);
  }
  return t.allowSparse === !0 ? i : me.compact(i);
}, wo = uo, So = bo, xo = _r, Eo = {
  formats: xo,
  parse: So,
  stringify: wo
};
Object.defineProperty(gr, "__esModule", { value: !0 });
var ye = gr.DrupalJsonApiParams = void 0;
const gt = Eo;
class Oo {
  /**
   * Optionaly initialize with a previously stored query/object/query string.
   *
   * @category Init
   */
  constructor(e, t) {
    this.data = {
      filter: {},
      include: [],
      page: void 0,
      sort: [],
      fields: {}
    }, this.qsOptions = {}, this.config = {
      useShortCutForQueryGeneration: !0,
      alwaysUseFieldNameForKeys: !1
    }, t !== void 0 && (this.config = t), this.initialize(e);
  }
  /**
   * Add custom parameter to the query.
   *
   * E.g. usage
   *
   * ```js
   * apiParams
   *   // To add `foo=bar` to the query.
   *   .addCustomParam({foo: 'bar'})
   *   // To add `foo[bar]=baz` to the query.
   *   .addCustomParam({ foo: {bar: 'baz'}})
   *   // To add `bar[0]=a&bar[1]=b&bar[2]=c` to the query.
   *   .addCustomParam({ bar: ['a', 'b', 'c']})
   * ```
   *
   * @param input The parameter object
   *
   * @category Helper
   */
  addCustomParam(e) {
    this.data = Object.assign(Object.assign({}, this.data), e);
  }
  /**
   * Add JSON:API field.
   *
   * The name of this method might be miss leading. Use this to explicitely request for specific fields on an entity.
   *
   * @param type Resource type
   * @param fields Array of field names in the given resource type
   *
   * @category JSON:API Query
   */
  addFields(e, t) {
    return this.data.fields[e] = t.join(","), this;
  }
  /**
   * Add JSON:API sort.
   *
   * Used to return the list of items in specific order.
   *
   * [Read more about Sort in Drupal.org Documentation](https://www.drupal.org/docs/8/modules/jsonapi/sorting)
   *
   * @param path A 'path' identifies a field on a resource
   * @param direction Sort direction `ASC` or `DESC`
   *
   * @category JSON:API Query
   */
  addSort(e, t) {
    let n = "";
    return t !== void 0 && t === "DESC" && (n = "-"), this.data.sort = this.data.sort.concat(n + e), this;
  }
  /**
   * Add JSON:API page limit.
   *
   * Use to restrict max amount of items returned in the listing.
   * Using this for pagination is tricky, and make sure you read
   * the following document on Drupal.org to implement it correctly.
   *
   * [Read more about Pagination in Drupal.org Documentation](https://www.drupal.org/docs/8/core/modules/jsonapi-module/pagination)
   *
   * @param limit Number of items to limit to
   *
   * @category JSON:API Query
   */
  addPageLimit(e) {
    return this.data.page === void 0 ? this.data.page = { limit: e } : this.data.page.limit = e, this;
  }
  /**
   * Add JSON:API page offset.
   *
   * Use to skip some items from the start of the listing.
   * Using this for pagination is tricky, and make sure you read
   * the following document on Drupal.org to implement it correctly.
   *
   * [Read more about Pagination in Drupal.org Documentation](https://www.drupal.org/docs/8/core/modules/jsonapi-module/pagination)
   *
   * @param offset Number of items to skip from the begining.
   *
   * @category JSON:API Query
   */
  addPageOffset(e) {
    return this.data.page === void 0 ? this.data.page = { offset: e } : this.data.page.offset = e, this;
  }
  /**
   * Add JSON:API include.
   *
   * Used to add referenced resources inside same request.
   * Thereby preventing additional api calls.
   *
   * [Read more about Includes in Drupal.org Documentation](https://www.drupal.org/docs/8/modules/jsonapi/includes)
   *
   * @param fields Array of field names
   *
   * @category JSON:API Query
   */
  addInclude(e) {
    return this.data.include = this.data.include.concat(e), this;
  }
  /**
   * Add JSON:API group.
   *
   * @param name Name of the group
   * @param conjunction All groups have conjunctions and a conjunction is either `AND` or `OR`.
   * @param memberOf Name of the group, this group belongs to
   *
   * @category JSON:API Query
   */
  addGroup(e, t = "OR", n) {
    return this.data.filter[e] = {
      group: Object.assign({ conjunction: t }, n !== void 0 && { memberOf: n })
    }, this;
  }
  /**
   * Add JSON:API filter.
   *
   * Following values can be used for the operator. If none is provided, it assumes "`=`" by default.
   * ```
   *   '=', '<>',
   *   '>', '>=', '<', '<=',
   *   'STARTS_WITH', 'CONTAINS', 'ENDS_WITH',
   *   'IN', 'NOT IN',
   *   'BETWEEN', 'NOT BETWEEN',
   *   'IS NULL', 'IS NOT NULL'
   * ```
   *
   * **NOTE: Make sure you match the value supplied based on the operators used as per the table below**
   *
   * | Value Type | Operator | Comment |
   * | ---   | ---  | ---         |
   * | `string`     | `=`, `<>`, `>`, `>=`, `<`, `<=`, `STARTS_WITH`, `CONTAINS`, `ENDS_WITH` | |
   * | `string[]`    | `IN`, `NOT IN` | |
   * | `string[]` _size 2_ | `BETWEEN`, `NOT BETWEEN` | The first item is used for min (start of the range), and the second item is used for max (end of the range).
   * | `null`    | `IS NULL`, `IS NOT NULL` | Must use `null`
   *
   * [Read more about filter in Drupal.org Documentation](https://www.drupal.org/docs/8/core/modules/jsonapi-module/filtering)
   *
   * @param path A 'path' identifies a field on a resource
   * @param value string[] | null` | A 'value' is the thing you compare against. For operators like "IN" which supports multiple parameters, you can supply an array.
   * @param operator An 'operator' is a method of comparison
   * @param memberOf Name of the group, the filter belongs to
   *
   * @category JSON:API Query
   */
  addFilter(e, t, n = "=", i, o) {
    const s = this.getIndexId(this.data.filter, o || e, !!o);
    if ((n === "IS NULL" || n === "IS NOT NULL") && (t = null), t === null) {
      if (!(n === "IS NULL" || n === "IS NOT NULL"))
        throw new TypeError(`Value cannot be null for the operator "${n}"`);
      return this.data.filter[s] = {
        condition: Object.assign(Object.assign({ path: e }, { operator: n }), i !== void 0 && { memberOf: i })
      }, this;
    }
    if (Array.isArray(t)) {
      switch (n) {
        case "BETWEEN":
        case "NOT BETWEEN":
          if (t.length !== 2)
            throw new TypeError(`Value must consists of 2 items for the "${n}"`);
          break;
        case "IN":
        case "NOT IN":
          break;
        default:
          throw new TypeError(`Value cannot be an array for the operator "${n}"`);
      }
      return this.data.filter[s] = {
        condition: Object.assign(Object.assign({
          path: e,
          value: t
        }, { operator: n }), i !== void 0 && { memberOf: i })
      }, this;
    }
    return this.config.useShortCutForQueryGeneration && i === void 0 && e === s && this.data.filter[e] === void 0 ? (n === "=" ? this.data.filter[s] = t : this.data.filter[s] = {
      value: t,
      operator: n
    }, this) : (this.data.filter[s] = {
      condition: Object.assign(Object.assign({
        path: e,
        value: t
      }, this.config.useShortCutForQueryGeneration ? n !== "=" && { operator: n } : { operator: n }), i !== void 0 && { memberOf: i })
    }, this);
  }
  /**
   * @ignore
   */
  getIndexId(e, t, n) {
    n = n || this.config.alwaysUseFieldNameForKeys;
    let i;
    return e[t] === void 0 ? i = t : i = this.generateKeyName(e, t, n), i;
  }
  generateKeyName(e, t, n = !1) {
    const i = Object.keys(e).length;
    if (n)
      for (let o = 1; o <= i; o++) {
        const s = `${t}--${o}`;
        if (e[s] === void 0)
          return s;
      }
    return i.toString();
  }
  /**
   * Get query object.
   *
   * @category Helper
   */
  getQueryObject() {
    const e = JSON.parse(JSON.stringify(this.data));
    return this.data.include.length && (e.include = this.data.include.join(",")), this.data.sort.length && (e.sort = this.data.sort.join(",")), e;
  }
  /**
   * Get query string.
   *
   * @param options Options to be passed to `qs` library during parsing.
   *
   * @category Helper
   */
  getQueryString(e) {
    const t = this.getQueryObject(), n = e || this.getQsOption();
    return gt.stringify(t, n);
  }
  /**
   * Clear all parameters added so far.
   *
   * @category Helper
   */
  clear() {
    return this.data = {
      filter: {},
      include: [],
      page: void 0,
      sort: [],
      fields: {}
    }, this;
  }
  /**
   * Initialize with a previously stored query object.
   *
   * @category Init
   */
  initializeWithQueryObject(e) {
    return this.clear(), Object.keys(e).forEach((n) => {
      switch (n) {
        case "sort":
          e.sort.length && (this.data.sort = e.sort.split(","));
          break;
        case "include":
          e.include.length && (this.data.include = e.include.split(","));
          break;
        default:
          this.data[n] = e[n];
      }
    }), this;
  }
  /**
   * Initialize with a previously stored query string.
   *
   * @param input The Query string to use for initializing.
   * @param options Options to be passed to `qs` library during parsing.
   *
   * @category Init
   */
  initializeWithQueryString(e, t) {
    this.clear();
    const n = t || this.getQsOption();
    return this.initializeWithQueryObject(gt.parse(e, n)), this;
  }
  /**
   * Clone a given DrupalJsonApiParam object.
   *
   * @category Helper
   */
  clone(e) {
    const t = JSON.parse(JSON.stringify(e.getQueryObject()));
    return this.initializeWithQueryObject(t), this;
  }
  /**
   * Set options that is passed to qs when parsing/serializing.
   *
   * @see https://www.npmjs.com/package/qs
   */
  setQsOption(e) {
    return this.qsOptions = e, this;
  }
  /**
   * Get options that is passed to qs when parsing/serializing.
   *
   * @see https://www.npmjs.com/package/qs
   */
  getQsOption() {
    return this.qsOptions;
  }
  /**
   * Initialize with a previously stored query/object/query string.
   *
   * @category Init
   */
  initialize(e) {
    if (e === void 0)
      this.initializeWithQueryString("");
    else if (typeof e == "object")
      try {
        e.getQueryObject(), this.clone(e);
      } catch {
        this.initializeWithQueryObject(e);
      }
    else
      this.initializeWithQueryString(e);
    return this;
  }
}
ye = gr.DrupalJsonApiParams = Oo;
function _o(r) {
  if (!(r instanceof ye))
    throw new Error("The 'params' must be an instance of DrupalJsonApiParams.");
  return r.getQueryString({ encode: !1 });
}
class Ar {
  /**
   * Instantiates a new NodeHive client.
   *
   * const nodehive = new NodeHive(baseUrl)
   *
   * @param {baseUrl} baseUrl The baseUrl of your Drupal site.
   * @param {options} options Options for the client.
   */
  constructor(e, t = {}, n = {}) {
    Ie(this, "baseUrl");
    Ie(this, "nodehiveconfig");
    Ie(this, "options");
    if (!e || typeof e != "string")
      throw new Error("The 'baseUrl' param is required.");
    this.baseUrl = e, this.nodehiveconfig = t, this.options = n;
  }
  /**
   * Makes a request to the Drupal JSON:API.
   * @param {string} endpoint - The API endpoint (e.g., '/node/article').
   * @param {string} [method='GET'] - The HTTP method (e.g., 'GET', 'POST').
   * @param {object} [data=null] - The data to be sent with the request.
   * @param {object} [additionalHeaders={}] - Additional headers for the request.
   * @returns {Promise<any>} - The JSON response from the API.
   * @throws Will throw an error if the request fails.
   */
  async request(e, t = "GET", n = null, i = {}) {
    const o = `${this.baseUrl}${e}`;
    console.log("miauuuu"), console.log(o);
    const s = {
      "Content-Type": "application/vnd.api+json",
      ...i
    };
    console.log("mytoken", this.options.token), this.options.token && (s.Authorization = `Bearer ${this.options.token}`);
    const u = {
      method: t,
      headers: s,
      //credentials: 'same-origin',
      next: { revalidate: 1 },
      cache: "no-store"
      //cache: 'force-cache'
    };
    console.log("config", u), n && (u.body = JSON.stringify(n));
    try {
      const l = await fetch(o, u);
      if (!l.ok) {
        const f = await l.json();
        throw console.log("Response Body", f), new Error(`HTTP error! status: ${l.status} - ${l.statusText}`);
      }
      return await l.json();
    } catch (l) {
      throw console.error("Request failed", l), l;
    }
  }
  /**
   * Retrieves all available content types from the Drupal JSON:API.
   * @returns {Promise<any>} - A Promise that resolves to the list of content types.
   */
  async getContentTypes() {
    const e = "/jsonapi/node_type/node_type";
    return this.request(e, "GET");
  }
  /**
   * Retrieves all available menus from the Drupal JSON:API.
   * @returns {Promise<any>} - A Promise that resolves to the list of available menus.
   */
  async getAvailableMenus() {
    const e = "/jsonapi/menu/menu";
    return this.request(e, "GET");
  }
  /**
   * Retrieves menu items by menu id from the Drupal JSON:API.
   * @param {string} menuId - The unique identifier for the menu.
   * @param {DrupalJsonApiParams} [params=null] - Optional DrupalJsonApiParams to customize the query.
   * @returns {Promise<any>} - A Promise that resolves to the menu items data.
   */
  async getMenuItems(e) {
    const t = new ye();
    t.addFilter("status", "1").addFields("menu_link_content--menu_link_content", [
      "title",
      "url",
      "enabled",
      "menu_name",
      "external",
      "options",
      "weight",
      "expanded",
      "parent"
    ]).getQueryObject();
    const n = t.getQueryString(), i = `/jsonapi/menu_items/${e}?${n}&jsonapi_include=1`;
    return this.request(i, "GET");
  }
  /**
   * Retrieves a list of nodes from the Drupal JSON:API.
   * @param {string} contentType - The content type to interact with.
   * @param {DrupalJsonApiParams} params - DrupalJsonApiParams to customize the query.
   * @returns {Promise<any>} - A Promise that resolves to the list of nodes.
   */
  async getNodes(e, t = null, n = new ye()) {
    var i;
    try {
      if (!e || typeof e != "string")
        throw new Error("Invalid content type");
      let o = "";
      (i = this.nodehiveconfig) != null && i.entities[e] && this.nodehiveconfig.nodes.contentType.include.forEach((u) => {
        console.log("addinclude", u), n.addInclude(u.value);
      }), n instanceof ye && (o = "?" + _o(n));
      const s = t ? `/${t}/jsonapi/node/${e}${o}` : `/jsonapi/node/${e}${o}`;
      return await this.request(s, "GET");
    } catch (o) {
      console.error("Error in getNodes:", o);
    }
  }
  /**
   * Retrieves a single node by its UUID from the Drupal JSON:API.
   * @param {string} uuid - The unique identifier for the node.
   * @param {string} contentType - The content type of the node.
   * @param {DrupalJsonApiParams} [params=null] - Optional DrupalJsonApiParams to customize the query.
   * @returns {Promise<any>} - A Promise that resolves to the node data.
   */
  async getNode(e, t, n = null, i = new ye()) {
    let o = "";
    const s = "node-" + t;
    this.nodehiveconfig.entities[s] && (this.nodehiveconfig.entities[s].addFilter && this.nodehiveconfig.entities[s].addFilter.forEach((l) => {
      i.addFilter("status", 1);
    }), this.nodehiveconfig.entities[s].addFields && this.nodehiveconfig.entities[s].addFields.forEach((l) => {
      i.addFields(s, [l]);
    }), this.nodehiveconfig.entities[s].addInclude && this.nodehiveconfig.entities[s].addInclude.forEach((l) => {
      console.log("addInclude", l), i.addInclude([l]);
    })), o = "?" + i.getQueryString({ encode: !1 });
    const u = `/jsonapi/node/${t}/${e}${o}&jsonapi_include=1`;
    return n ? this.request(`/${n}${u}`, "GET") : this.request(u, "GET");
  }
  async router(e, t = null) {
    const n = "/router/translate-path?path=" + e + "/?format=json_api";
    try {
      return this.request(n.toString());
    } catch (i) {
      console.error(i), notFound();
    }
  }
  async getResourceBySlug(e, t = null) {
    try {
      const n = await this.router(e);
      return console.log("Response getResourceBySlug", n), await this.getNode(n.entity.uuid, n.entity.bundle, t);
    } catch (n) {
      console.error(n);
    }
  }
  /**
   * Stores the current user's token and details in a cookie.
   *
   * @param {string} token
   * @param {object} userDetails
   */
  storeUserDetails(e, t) {
    document.cookie = `userToken=${e}; path=/; max-age=31536000; SameSite=None; Secure`, document.cookie = `userDetails=${JSON.stringify(
      t
    )}; path=/; max-age=31536000; SameSite=None; Secure`;
  }
  /**
   * Clears the current user's token and details from cookies.
   */
  clearUserDetails() {
    document.cookie = "userToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT", document.cookie = "userDetails=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
  /**
   * Retrieves the stored token from cookies.
   *
   * @return {string|null}
   */
  getToken() {
    return this.getCookie("userToken");
  }
  /**
   * Retrieves the stored user details from cookies.
   *
   * @return {object|null}
   */
  getUserDetails() {
    const e = this.getCookie("userDetails");
    return e ? JSON.parse(e) : null;
  }
  /**
   * Utility function to get a cookie by name.
   *
   * @param {string} name
   * @return {string|null}
   */
  getCookie(e) {
    const n = `; ${document.cookie}`.split(`; ${e}=`);
    return n.length === 2 ? n.pop().split(";").shift() : null;
  }
  /**
   * Login user and store token and details.
   *
   * @param {string} email
   * @param {string} password
   * @return {Promise}
   */
  async login(e, t) {
    try {
      const n = Buffer.from(`${e}:${t}`).toString("base64"), i = await fetch(
        this.baseUrl + "/jwt/token?_format=json",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${n}`
          }
        }
      );
      if (i.ok) {
        const o = await i.json();
        console.log("JWT Token:", o.token), this.storeUserDetails(o.token, { email: e });
        const s = await this.fetchUserDetails(o.token);
        return console.log(s), this.storeUserDetails(o.token, s), !0;
      } else
        throw new Error("Unknown username or bad password");
    } catch (n) {
      throw new Error(n.message);
    }
  }
  /**
   * Logout user by clearing stored token and details.
   */
  logout() {
    this.clearUserDetails();
  }
  isLoggedIn() {
    return !!this.getCookie("userToken");
  }
  async fetchUserDetails(e) {
    const t = this.decodeJwt(e);
    console.log("Decoded JWT Data:", t.drupal.uid);
    const n = await fetch(
      this.baseUrl + "/user/" + t.drupal.uid + "?_format=json",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${e}`
        }
      }
    );
    return n.ok ? (console.log(n), await n.json()) : {};
  }
  /**
   * Check if user is logged in and has a valid session.
   *
   * @return {Promise<boolean>}
   */
  async hasValidSession() {
    try {
      const e = this.getToken();
      return e ? await (await fetch(
        this.baseUrl + "/user/login_status?_format=json",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${e}`
          }
        }
      )).json() === 1 : !1;
    } catch (e) {
      throw new Error(e.message);
    }
  }
  decodeJwt(e) {
    try {
      const n = e.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"), i = decodeURIComponent(
        atob(n).split("").map(function(o) {
          return "%" + ("00" + o.charCodeAt(0).toString(16)).slice(-2);
        }).join("")
      );
      return JSON.parse(i);
    } catch (t) {
      return console.error("Error decoding JWT", t), null;
    }
  }
  /**
   * Checks user role and permissions.
   *
   * @param {string} role
   * @return {boolean}
   */
  hasRole(e) {
    this.getUserDetails();
  }
  getAllCookieData() {
    const e = document.cookie.split("; "), t = {};
    return e.forEach((n) => {
      const [i, o] = n.split("=");
      t[i] = o;
    }), t;
  }
}
var hr = { exports: {} }, xe = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var mt;
function Ao() {
  return mt || (mt = 1, process.env.NODE_ENV !== "production" && function() {
    var r = wt, e = Symbol.for("react.element"), t = Symbol.for("react.portal"), n = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), o = Symbol.for("react.profiler"), s = Symbol.for("react.provider"), u = Symbol.for("react.context"), l = Symbol.for("react.forward_ref"), f = Symbol.for("react.suspense"), v = Symbol.for("react.suspense_list"), m = Symbol.for("react.memo"), h = Symbol.for("react.lazy"), b = Symbol.for("react.offscreen"), y = Symbol.iterator, S = "@@iterator";
    function N(a) {
      if (a === null || typeof a != "object")
        return null;
      var c = y && a[y] || a[S];
      return typeof c == "function" ? c : null;
    }
    var w = r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function A(a) {
      {
        for (var c = arguments.length, d = new Array(c > 1 ? c - 1 : 0), g = 1; g < c; g++)
          d[g - 1] = arguments[g];
        U("error", a, d);
      }
    }
    function U(a, c, d) {
      {
        var g = w.ReactDebugCurrentFrame, _ = g.getStackAddendum();
        _ !== "" && (c += "%s", d = d.concat([_]));
        var P = d.map(function(O) {
          return String(O);
        });
        P.unshift("Warning: " + c), Function.prototype.apply.call(console[a], console, P);
      }
    }
    var Y = !1, te = !1, le = !1, q = !1, B = !1, V;
    V = Symbol.for("react.module.reference");
    function X(a) {
      return !!(typeof a == "string" || typeof a == "function" || a === n || a === o || B || a === i || a === f || a === v || q || a === b || Y || te || le || typeof a == "object" && a !== null && (a.$$typeof === h || a.$$typeof === m || a.$$typeof === s || a.$$typeof === u || a.$$typeof === l || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      a.$$typeof === V || a.getModuleId !== void 0));
    }
    function ne(a, c, d) {
      var g = a.displayName;
      if (g)
        return g;
      var _ = c.displayName || c.name || "";
      return _ !== "" ? d + "(" + _ + ")" : d;
    }
    function D(a) {
      return a.displayName || "Context";
    }
    function j(a) {
      if (a == null)
        return null;
      if (typeof a.tag == "number" && A("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof a == "function")
        return a.displayName || a.name || null;
      if (typeof a == "string")
        return a;
      switch (a) {
        case n:
          return "Fragment";
        case t:
          return "Portal";
        case o:
          return "Profiler";
        case i:
          return "StrictMode";
        case f:
          return "Suspense";
        case v:
          return "SuspenseList";
      }
      if (typeof a == "object")
        switch (a.$$typeof) {
          case u:
            var c = a;
            return D(c) + ".Consumer";
          case s:
            var d = a;
            return D(d._context) + ".Provider";
          case l:
            return ne(a, a.render, "ForwardRef");
          case m:
            var g = a.displayName || null;
            return g !== null ? g : j(a.type) || "Memo";
          case h: {
            var _ = a, P = _._payload, O = _._init;
            try {
              return j(O(P));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var L = Object.assign, W = 0, J, Pr, Rr, Tr, jr, Nr, $r;
    function Cr() {
    }
    Cr.__reactDisabledLog = !0;
    function Ut() {
      {
        if (W === 0) {
          J = console.log, Pr = console.info, Rr = console.warn, Tr = console.error, jr = console.group, Nr = console.groupCollapsed, $r = console.groupEnd;
          var a = {
            configurable: !0,
            enumerable: !0,
            value: Cr,
            writable: !0
          };
          Object.defineProperties(console, {
            info: a,
            log: a,
            warn: a,
            error: a,
            group: a,
            groupCollapsed: a,
            groupEnd: a
          });
        }
        W++;
      }
    }
    function Mt() {
      {
        if (W--, W === 0) {
          var a = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: L({}, a, {
              value: J
            }),
            info: L({}, a, {
              value: Pr
            }),
            warn: L({}, a, {
              value: Rr
            }),
            error: L({}, a, {
              value: Tr
            }),
            group: L({}, a, {
              value: jr
            }),
            groupCollapsed: L({}, a, {
              value: Nr
            }),
            groupEnd: L({}, a, {
              value: $r
            })
          });
        }
        W < 0 && A("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var ze = w.ReactCurrentDispatcher, qe;
    function Te(a, c, d) {
      {
        if (qe === void 0)
          try {
            throw Error();
          } catch (_) {
            var g = _.stack.trim().match(/\n( *(at )?)/);
            qe = g && g[1] || "";
          }
        return `
` + qe + a;
      }
    }
    var Ve = !1, je;
    {
      var Bt = typeof WeakMap == "function" ? WeakMap : Map;
      je = new Bt();
    }
    function Ir(a, c) {
      if (!a || Ve)
        return "";
      {
        var d = je.get(a);
        if (d !== void 0)
          return d;
      }
      var g;
      Ve = !0;
      var _ = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var P;
      P = ze.current, ze.current = null, Ut();
      try {
        if (c) {
          var O = function() {
            throw Error();
          };
          if (Object.defineProperty(O.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(O, []);
            } catch (Q) {
              g = Q;
            }
            Reflect.construct(a, [], O);
          } else {
            try {
              O.call();
            } catch (Q) {
              g = Q;
            }
            a.call(O.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (Q) {
            g = Q;
          }
          a();
        }
      } catch (Q) {
        if (Q && g && typeof Q.stack == "string") {
          for (var x = Q.stack.split(`
`), F = g.stack.split(`
`), R = x.length - 1, T = F.length - 1; R >= 1 && T >= 0 && x[R] !== F[T]; )
            T--;
          for (; R >= 1 && T >= 0; R--, T--)
            if (x[R] !== F[T]) {
              if (R !== 1 || T !== 1)
                do
                  if (R--, T--, T < 0 || x[R] !== F[T]) {
                    var M = `
` + x[R].replace(" at new ", " at ");
                    return a.displayName && M.includes("<anonymous>") && (M = M.replace("<anonymous>", a.displayName)), typeof a == "function" && je.set(a, M), M;
                  }
                while (R >= 1 && T >= 0);
              break;
            }
        }
      } finally {
        Ve = !1, ze.current = P, Mt(), Error.prepareStackTrace = _;
      }
      var ce = a ? a.displayName || a.name : "", Jr = ce ? Te(ce) : "";
      return typeof a == "function" && je.set(a, Jr), Jr;
    }
    function Wt(a, c, d) {
      return Ir(a, !1);
    }
    function Gt(a) {
      var c = a.prototype;
      return !!(c && c.isReactComponent);
    }
    function Ne(a, c, d) {
      if (a == null)
        return "";
      if (typeof a == "function")
        return Ir(a, Gt(a));
      if (typeof a == "string")
        return Te(a);
      switch (a) {
        case f:
          return Te("Suspense");
        case v:
          return Te("SuspenseList");
      }
      if (typeof a == "object")
        switch (a.$$typeof) {
          case l:
            return Wt(a.render);
          case m:
            return Ne(a.type, c, d);
          case h: {
            var g = a, _ = g._payload, P = g._init;
            try {
              return Ne(P(_), c, d);
            } catch {
            }
          }
        }
      return "";
    }
    var $e = Object.prototype.hasOwnProperty, kr = {}, Fr = w.ReactDebugCurrentFrame;
    function Ce(a) {
      if (a) {
        var c = a._owner, d = Ne(a.type, a._source, c ? c.type : null);
        Fr.setExtraStackFrame(d);
      } else
        Fr.setExtraStackFrame(null);
    }
    function zt(a, c, d, g, _) {
      {
        var P = Function.call.bind($e);
        for (var O in a)
          if (P(a, O)) {
            var x = void 0;
            try {
              if (typeof a[O] != "function") {
                var F = Error((g || "React class") + ": " + d + " type `" + O + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof a[O] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw F.name = "Invariant Violation", F;
              }
              x = a[O](c, O, g, d, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (R) {
              x = R;
            }
            x && !(x instanceof Error) && (Ce(_), A("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", g || "React class", d, O, typeof x), Ce(null)), x instanceof Error && !(x.message in kr) && (kr[x.message] = !0, Ce(_), A("Failed %s type: %s", d, x.message), Ce(null));
          }
      }
    }
    var qt = Array.isArray;
    function Je(a) {
      return qt(a);
    }
    function Vt(a) {
      {
        var c = typeof Symbol == "function" && Symbol.toStringTag, d = c && a[Symbol.toStringTag] || a.constructor.name || "Object";
        return d;
      }
    }
    function Jt(a) {
      try {
        return Dr(a), !1;
      } catch {
        return !0;
      }
    }
    function Dr(a) {
      return "" + a;
    }
    function Lr(a) {
      if (Jt(a))
        return A("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Vt(a)), Dr(a);
    }
    var we = w.ReactCurrentOwner, Qt = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, Ur, Mr, Qe;
    Qe = {};
    function Ht(a) {
      if ($e.call(a, "ref")) {
        var c = Object.getOwnPropertyDescriptor(a, "ref").get;
        if (c && c.isReactWarning)
          return !1;
      }
      return a.ref !== void 0;
    }
    function Yt(a) {
      if ($e.call(a, "key")) {
        var c = Object.getOwnPropertyDescriptor(a, "key").get;
        if (c && c.isReactWarning)
          return !1;
      }
      return a.key !== void 0;
    }
    function Xt(a, c) {
      if (typeof a.ref == "string" && we.current && c && we.current.stateNode !== c) {
        var d = j(we.current.type);
        Qe[d] || (A('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', j(we.current.type), a.ref), Qe[d] = !0);
      }
    }
    function Kt(a, c) {
      {
        var d = function() {
          Ur || (Ur = !0, A("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", c));
        };
        d.isReactWarning = !0, Object.defineProperty(a, "key", {
          get: d,
          configurable: !0
        });
      }
    }
    function Zt(a, c) {
      {
        var d = function() {
          Mr || (Mr = !0, A("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", c));
        };
        d.isReactWarning = !0, Object.defineProperty(a, "ref", {
          get: d,
          configurable: !0
        });
      }
    }
    var en = function(a, c, d, g, _, P, O) {
      var x = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: e,
        // Built-in properties that belong on the element
        type: a,
        key: c,
        ref: d,
        props: O,
        // Record the component responsible for creating this element.
        _owner: P
      };
      return x._store = {}, Object.defineProperty(x._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(x, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: g
      }), Object.defineProperty(x, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: _
      }), Object.freeze && (Object.freeze(x.props), Object.freeze(x)), x;
    };
    function rn(a, c, d, g, _) {
      {
        var P, O = {}, x = null, F = null;
        d !== void 0 && (Lr(d), x = "" + d), Yt(c) && (Lr(c.key), x = "" + c.key), Ht(c) && (F = c.ref, Xt(c, _));
        for (P in c)
          $e.call(c, P) && !Qt.hasOwnProperty(P) && (O[P] = c[P]);
        if (a && a.defaultProps) {
          var R = a.defaultProps;
          for (P in R)
            O[P] === void 0 && (O[P] = R[P]);
        }
        if (x || F) {
          var T = typeof a == "function" ? a.displayName || a.name || "Unknown" : a;
          x && Kt(O, T), F && Zt(O, T);
        }
        return en(a, x, F, _, g, we.current, O);
      }
    }
    var He = w.ReactCurrentOwner, Br = w.ReactDebugCurrentFrame;
    function ue(a) {
      if (a) {
        var c = a._owner, d = Ne(a.type, a._source, c ? c.type : null);
        Br.setExtraStackFrame(d);
      } else
        Br.setExtraStackFrame(null);
    }
    var Ye;
    Ye = !1;
    function Xe(a) {
      return typeof a == "object" && a !== null && a.$$typeof === e;
    }
    function Wr() {
      {
        if (He.current) {
          var a = j(He.current.type);
          if (a)
            return `

Check the render method of \`` + a + "`.";
        }
        return "";
      }
    }
    function tn(a) {
      {
        if (a !== void 0) {
          var c = a.fileName.replace(/^.*[\\\/]/, ""), d = a.lineNumber;
          return `

Check your code at ` + c + ":" + d + ".";
        }
        return "";
      }
    }
    var Gr = {};
    function nn(a) {
      {
        var c = Wr();
        if (!c) {
          var d = typeof a == "string" ? a : a.displayName || a.name;
          d && (c = `

Check the top-level render call using <` + d + ">.");
        }
        return c;
      }
    }
    function zr(a, c) {
      {
        if (!a._store || a._store.validated || a.key != null)
          return;
        a._store.validated = !0;
        var d = nn(c);
        if (Gr[d])
          return;
        Gr[d] = !0;
        var g = "";
        a && a._owner && a._owner !== He.current && (g = " It was passed a child from " + j(a._owner.type) + "."), ue(a), A('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', d, g), ue(null);
      }
    }
    function qr(a, c) {
      {
        if (typeof a != "object")
          return;
        if (Je(a))
          for (var d = 0; d < a.length; d++) {
            var g = a[d];
            Xe(g) && zr(g, c);
          }
        else if (Xe(a))
          a._store && (a._store.validated = !0);
        else if (a) {
          var _ = N(a);
          if (typeof _ == "function" && _ !== a.entries)
            for (var P = _.call(a), O; !(O = P.next()).done; )
              Xe(O.value) && zr(O.value, c);
        }
      }
    }
    function an(a) {
      {
        var c = a.type;
        if (c == null || typeof c == "string")
          return;
        var d;
        if (typeof c == "function")
          d = c.propTypes;
        else if (typeof c == "object" && (c.$$typeof === l || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        c.$$typeof === m))
          d = c.propTypes;
        else
          return;
        if (d) {
          var g = j(c);
          zt(d, a.props, "prop", g, a);
        } else if (c.PropTypes !== void 0 && !Ye) {
          Ye = !0;
          var _ = j(c);
          A("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", _ || "Unknown");
        }
        typeof c.getDefaultProps == "function" && !c.getDefaultProps.isReactClassApproved && A("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function on(a) {
      {
        for (var c = Object.keys(a.props), d = 0; d < c.length; d++) {
          var g = c[d];
          if (g !== "children" && g !== "key") {
            ue(a), A("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", g), ue(null);
            break;
          }
        }
        a.ref !== null && (ue(a), A("Invalid attribute `ref` supplied to `React.Fragment`."), ue(null));
      }
    }
    function Vr(a, c, d, g, _, P) {
      {
        var O = X(a);
        if (!O) {
          var x = "";
          (a === void 0 || typeof a == "object" && a !== null && Object.keys(a).length === 0) && (x += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var F = tn(_);
          F ? x += F : x += Wr();
          var R;
          a === null ? R = "null" : Je(a) ? R = "array" : a !== void 0 && a.$$typeof === e ? (R = "<" + (j(a.type) || "Unknown") + " />", x = " Did you accidentally export a JSX literal instead of a component?") : R = typeof a, A("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", R, x);
        }
        var T = rn(a, c, d, _, P);
        if (T == null)
          return T;
        if (O) {
          var M = c.children;
          if (M !== void 0)
            if (g)
              if (Je(M)) {
                for (var ce = 0; ce < M.length; ce++)
                  qr(M[ce], a);
                Object.freeze && Object.freeze(M);
              } else
                A("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              qr(M, a);
        }
        return a === n ? on(T) : an(T), T;
      }
    }
    function sn(a, c, d) {
      return Vr(a, c, d, !0);
    }
    function ln(a, c, d) {
      return Vr(a, c, d, !1);
    }
    var un = ln, cn = sn;
    xe.Fragment = n, xe.jsx = un, xe.jsxs = cn;
  }()), xe;
}
var Ee = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var bt;
function Po() {
  if (bt)
    return Ee;
  bt = 1;
  var r = wt, e = Symbol.for("react.element"), t = Symbol.for("react.fragment"), n = Object.prototype.hasOwnProperty, i = r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, o = { key: !0, ref: !0, __self: !0, __source: !0 };
  function s(u, l, f) {
    var v, m = {}, h = null, b = null;
    f !== void 0 && (h = "" + f), l.key !== void 0 && (h = "" + l.key), l.ref !== void 0 && (b = l.ref);
    for (v in l)
      n.call(l, v) && !o.hasOwnProperty(v) && (m[v] = l[v]);
    if (u && u.defaultProps)
      for (v in l = u.defaultProps, l)
        m[v] === void 0 && (m[v] = l[v]);
    return { $$typeof: e, type: u, key: h, ref: b, props: m, _owner: i.current };
  }
  return Ee.Fragment = t, Ee.jsx = s, Ee.jsxs = s, Ee;
}
process.env.NODE_ENV === "production" ? hr.exports = Po() : hr.exports = Ao();
var p = hr.exports;
function Ro({ children: r }) {
  const [e, t] = Z(!1), n = new Ar(
    process.env.NEXT_PUBLIC_DRUPAL_REST_BASE_URL
  );
  return vr(() => {
    t(n.isLoggedIn());
  }, []), e ? /* @__PURE__ */ p.jsx(p.Fragment, { children: r }) : null;
}
function No({ data: r }) {
  return /* @__PURE__ */ p.jsxs("details", { children: [
    /* @__PURE__ */ p.jsx("summary", { children: "JSON Output" }),
    /* @__PURE__ */ p.jsx("pre", { className: "rounded-md bg-black p-8 text-xs text-slate-50", children: JSON.stringify(r, null, 2) })
  ] });
}
function $o() {
  const [r, e] = Z(!0), [t, n] = Z(null), [i, o] = Z(!1), [s, u] = Z({}), [l, f] = Z({}), v = new Ar(
    process.env.NEXT_PUBLIC_DRUPAL_REST_BASE_URL,
    ""
  );
  vr(() => {
    async function y() {
      const S = await v.hasValidSession();
      o(S), e(!1);
    }
    y(), m();
  }, []);
  function m() {
    const y = v.getAllCookieData();
    f(y);
  }
  async function h(y) {
    y.preventDefault();
    const S = new FormData(y.currentTarget), N = S.get("email").toString(), w = S.get("password").toString();
    if (N && w)
      try {
        await v.login(N, w), o(!0), window.location.href = "/";
      } catch (A) {
        console.log(A), n("Login failed. Please check your credentials."), o(!1);
      }
  }
  async function b() {
    v.logout(), o(!1);
  }
  return r ? /* @__PURE__ */ p.jsx("div", { className: "container-wrapper", children: /* @__PURE__ */ p.jsx("p", { children: "Loading..." }) }) : i ? /* @__PURE__ */ p.jsx("div", { className: "flex flex-col bg-gray-50 py-20", children: /* @__PURE__ */ p.jsx("div", { className: "sm:mx-auto sm:w-full sm:max-w-[480px]", children: /* @__PURE__ */ p.jsxs("div", { className: "bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12", children: [
    /* @__PURE__ */ p.jsx("h1", { className: "text-md mb-4 font-bold tracking-tight text-zinc-800", children: "You are already logged in!" }),
    /* @__PURE__ */ p.jsxs("details", { open: !0, children: [
      /* @__PURE__ */ p.jsx("summary", { children: "User Data" }),
      /* @__PURE__ */ p.jsx("pre", { children: JSON.stringify(s, null, 2) })
    ] }),
    /* @__PURE__ */ p.jsxs("details", { open: !0, children: [
      /* @__PURE__ */ p.jsx("summary", { children: "Cookie Data" }),
      /* @__PURE__ */ p.jsx("pre", { children: JSON.stringify(l, null, 2) })
    ] }),
    /* @__PURE__ */ p.jsx(
      "button",
      {
        onClick: b,
        className: "flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
        children: "Logout"
      }
    )
  ] }) }) }) : /* @__PURE__ */ p.jsx("div", { className: "flex flex-col bg-gray-50 py-20", children: /* @__PURE__ */ p.jsx("div", { className: "sm:mx-auto sm:w-full sm:max-w-[480px]", children: /* @__PURE__ */ p.jsxs("div", { className: "bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12", children: [
    /* @__PURE__ */ p.jsx("h1", { className: "mb-4 text-2xl font-bold tracking-tight text-zinc-800 sm:text-5xl", children: "Login" }),
    /* @__PURE__ */ p.jsxs("form", { onSubmit: h, className: "mt-4 space-y-4", children: [
      /* @__PURE__ */ p.jsx(
        "label",
        {
          htmlFor: "email",
          className: "block text-sm font-medium leading-6 text-gray-900",
          children: "Email address / Username"
        }
      ),
      /* @__PURE__ */ p.jsx("div", { className: "mt-2", children: /* @__PURE__ */ p.jsx(
        "input",
        {
          type: "text",
          name: "email",
          placeholder: "Email",
          autoComplete: "email",
          required: !0,
          className: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        }
      ) }),
      /* @__PURE__ */ p.jsx(
        "label",
        {
          htmlFor: "password",
          className: "block text-sm font-medium leading-6 text-gray-900",
          children: "Password"
        }
      ),
      /* @__PURE__ */ p.jsx("div", { className: "mt-2", children: /* @__PURE__ */ p.jsx(
        "input",
        {
          type: "password",
          name: "password",
          placeholder: "Password",
          autoComplete: "current-password",
          required: !0,
          className: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        }
      ) }),
      /* @__PURE__ */ p.jsx(
        "button",
        {
          type: "submit",
          className: "flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
          children: "Login"
        }
      ),
      t && /* @__PURE__ */ p.jsx("p", { className: "text-red-500", children: t })
    ] }),
    /* @__PURE__ */ p.jsxs("details", { className: "mt-10", children: [
      /* @__PURE__ */ p.jsx("summary", { children: "User Data" }),
      /* @__PURE__ */ p.jsx("pre", { className: "rounded-md bg-black p-8 text-xs text-slate-50", children: JSON.stringify(s, null, 2) })
    ] }),
    /* @__PURE__ */ p.jsx("pre", {})
  ] }) }) });
}
function Co() {
  const [r, e] = Z(!1), [t, n] = Z(""), i = new Ar(
    process.env.NEXT_PUBLIC_DRUPAL_REST_BASE_URL,
    ""
  );
  vr(() => {
    const h = window.self !== window.top;
    e(h), h && v();
    const b = (S) => {
      S.data === "reloadFrame" && o();
    };
    window.addEventListener("message", b);
    const y = i.getUserDetails();
    return y && y.user_picture && y.user_picture.length > 0 && n(y.user_picture[0].url), () => {
      window.removeEventListener("message", b);
    };
  }, []);
  const o = () => {
    async function h() {
      const b = window.location.pathname;
      (await fetch("/api/nodehive/revalidate?path=" + b)).ok && location.reload();
    }
    h();
  }, s = () => {
    const h = window.location;
    location.href = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL + "/space/" + process.env.NEXT_PUBLIC_NODEHIVE_SPACE_ID + "/visualeditor?url=" + h;
  }, u = (h) => {
    const b = window.location.href, y = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL + "/node/" + h + "/edit?destination=" + encodeURIComponent(b);
    parent.location.href = y;
  }, l = () => {
    const h = window.location;
    r ? parent.location.href = h : location.href = h;
  };
  async function f() {
    i.logout(), window.location.href = "/";
  }
  const v = () => {
    document.querySelectorAll(
      '[data-nodehive-enable="true"][data-nodehive-type="node"]'
    ).forEach((y) => {
      const S = document.createElement("div");
      S.innerHTML = '<div class="text-center">Edit</div', S.className = "absolute left-5 cursor-pointer rounded rounded-full bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700", S.setAttribute(
        "data-nodehive-uuid",
        y.getAttribute("data-nodehive-uuid")
      ), y.getAttribute("data-nodehive-type"), y.getAttribute("data-nodehive-uuid");
      const N = y.getAttribute("data-nodehive-id");
      y.getAttribute("data-nodehive-parent_id"), y.getAttribute("data-nodehive-editmode"), S.onclick = () => u(N), y.prepend(S);
    }), document.querySelectorAll(
      '[data-nodehive-enable="true"][data-nodehive-type="paragraph"]'
    ).forEach((y) => {
      const S = document.createElement("div");
      S.innerHTML = '<div class="text-center">Edit paragraph</div', S.className = "absolute right-5 rounded rounded-full bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700", S.setAttribute(
        "data-nodehive-uuid",
        y.getAttribute("data-nodehive-uuid")
      );
      const N = y.getAttribute("data-nodehive-type"), w = y.getAttribute("data-nodehive-uuid"), A = y.getAttribute("data-nodehive-id"), U = y.getAttribute("data-nodehive-parent_id");
      S.onclick = () => m({ type: N, uuid: w, id: A, parent_id: U }), y.prepend(S);
    });
  }, m = ({ type: h, uuid: b, id: y, parent_id: S }) => {
    console.log("openComposableComponent", h, b, y, S), window.parent.postMessage(
      {
        type: h,
        uuid: b,
        id: y,
        parent_id: S,
        pathname: window.location.pathname
      },
      "*"
    );
  };
  return /* @__PURE__ */ p.jsx(p.Fragment, { children: /* @__PURE__ */ p.jsxs("div", { className: "fixed bottom-8 left-1/2", children: [
    /* @__PURE__ */ p.jsx("div", { className: "-translate-x-1/2 rounded-full bg-zinc-700 p-3", children: /* @__PURE__ */ p.jsxs("div", { className: "flex gap-2", children: [
      t && /* @__PURE__ */ p.jsx(
        "img",
        {
          src: t,
          alt: "Profile",
          className: "cover h-10 w-10 rounded-full border-2 border-white"
        }
      ),
      !r && /* @__PURE__ */ p.jsx(
        "button",
        {
          onClick: s,
          className: "flex gap-2 rounded rounded-full bg-zinc-800 p-2 font-bold text-white hover:bg-zinc-600",
          title: "Edit in Drupal",
          children: /* @__PURE__ */ p.jsx(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              fill: "none",
              viewBox: "0 0 24 24",
              strokeWidth: 1,
              stroke: "currentColor",
              className: "h-6 w-6",
              children: /* @__PURE__ */ p.jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  d: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                }
              )
            }
          )
        }
      ),
      /* @__PURE__ */ p.jsx(
        "button",
        {
          onClick: o,
          className: "flex gap-2 rounded rounded-full bg-zinc-800 p-2 font-bold text-white hover:bg-zinc-600",
          title: "Refresh",
          children: /* @__PURE__ */ p.jsx(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              fill: "none",
              viewBox: "0 0 24 24",
              strokeWidth: "1",
              stroke: "currentColor",
              className: "h-6 w-6",
              children: /* @__PURE__ */ p.jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  d: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                }
              )
            }
          )
        }
      ),
      r && /* @__PURE__ */ p.jsx(
        "button",
        {
          onClick: l,
          className: "flex gap-2 rounded rounded-full bg-zinc-800 p-2 font-bold text-white hover:bg-zinc-600",
          title: "Show in frontend",
          children: /* @__PURE__ */ p.jsxs(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              fill: "none",
              viewBox: "0 0 24 24",
              strokeWidth: 1,
              stroke: "currentColor",
              className: "h-6 w-6",
              children: [
                /* @__PURE__ */ p.jsx(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    d: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  }
                ),
                /* @__PURE__ */ p.jsx(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  }
                )
              ]
            }
          )
        }
      ),
      !r && /* @__PURE__ */ p.jsx(
        "button",
        {
          onClick: f,
          className: "flex gap-2 rounded rounded-full bg-zinc-800 p-2 font-bold text-white hover:bg-zinc-600",
          title: "Logout",
          children: /* @__PURE__ */ p.jsx(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              fill: "none",
              viewBox: "0 0 24 24",
              strokeWidth: 1,
              stroke: "currentColor",
              className: "h-6 w-6",
              children: /* @__PURE__ */ p.jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  d: "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                }
              )
            }
          )
        }
      )
    ] }) }),
    /* @__PURE__ */ p.jsx("div", { className: "w-24 -translate-x-1/2 rounded-bl-lg  rounded-br-lg bg-zinc-700 px-4 py-1 text-center text-[8px] font-bold text-white", children: "Smart Actions!" })
  ] }) });
}
function Io({ node: r }) {
  return /* @__PURE__ */ p.jsxs(p.Fragment, { children: [
    !r.status && /* @__PURE__ */ p.jsxs(
      "div",
      {
        className: "mb-5 border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700",
        role: "alert",
        children: [
          /* @__PURE__ */ p.jsx("p", { className: "font-bold", children: "Info" }),
          /* @__PURE__ */ p.jsxs("p", { children: [
            "[",
            r.node_type.meta.drupal_internal__target_id,
            "] ",
            r.title,
            " is unpublished."
          ] })
        ]
      }
    ),
    /* @__PURE__ */ p.jsx(Ro, { children: r.status && /* @__PURE__ */ p.jsxs(
      "div",
      {
        className: "mb-5 border-l-4 border-green-500 bg-green-100 p-4 text-yellow-700",
        role: "alert",
        children: [
          /* @__PURE__ */ p.jsx("p", { className: "font-bold", children: "Info" }),
          /* @__PURE__ */ p.jsxs("p", { children: [
            "[",
            r.node_type.meta.drupal_internal__target_id,
            "] ",
            r.title,
            " is published."
          ] })
        ]
      }
    ) })
  ] });
}
function ko({
  entity: r,
  enable: e = !0,
  editmode: t = "edit-form",
  children: n
}) {
  var u;
  const i = e.toString(), o = t, s = `node-${r.data.drupal_internal__nid}`;
  return (u = r.data) != null && u.node_type ? /* @__PURE__ */ p.jsx(
    "div",
    {
      id: s,
      "data-nodehive-enable": i,
      "data-nodehive-editmode": o,
      "data-nodehive-type": "node",
      "data-nodehive-parent_id": "",
      "data-nodehive-id": r.data.drupal_internal__nid,
      "data-nodehive-uuid": r.data.id,
      "data-node-type": r.data.type,
      children: n
    }
  ) : /* @__PURE__ */ p.jsxs("div", { children: [
    "no visual editor",
    n
  ] });
}
function Fo({
  entity: r,
  enable: e = !0,
  editmode: t = "sidebar",
  children: n
}) {
  const i = e.toString(), o = t, s = `node-${r.meta.drupal_internal__target_id}`;
  return (r == null ? void 0 : r.paragraph_type) != "" ? /* @__PURE__ */ p.jsx(
    "div",
    {
      id: s,
      "data-nodehive-enable": i,
      "data-nodehive-editmode": o,
      "data-nodehive-type": "paragraph",
      "data-nodehive-parent_id": r.parent_id,
      "data-nodehive-id": r.meta.drupal_internal__target_id,
      "data-nodehive-uuid": r.id,
      children: n
    }
  ) : /* @__PURE__ */ p.jsxs("div", { children: [
    "no visual editor",
    n
  ] });
}
export {
  Ro as AuthWrapper,
  No as DevHelper,
  $o as LoginForm,
  Ar as NodeHiveClient,
  Io as NodeMeta,
  Co as SmartActionButtons,
  ko as VisualEditorNodeWrapper,
  Fo as VisualEditorParagraphWrapper
};
