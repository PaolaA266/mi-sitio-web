(function () {
  const MODELOS = [
    { id: "corolla", n: "Toyota Corolla", i: "img/corolla.jpg", d: "Sedán compacto, 2014–2022" },
    { id: "rav4", n: "Toyota RAV4", i: "img/rav4.jpg", d: "SUV mediana, 2016–2023" },
    { id: "hilux", n: "Toyota Hilux", i: "img/hilux.jpg", d: "Camioneta doble cabina, 2012–2023" },
    { id: "swift", n: "Suzuki Swift", i: "img/swift.jpg", d: "Hatchback urbano, 2013–2022" }];
  const SEED = [
    ["REP-001", "Filtro de aceite", "Motor", ["corolla", "rav4", "swift"], 48, 15, 6.5],
    ["REP-002", "Filtro de aire", "Motor", ["corolla", "hilux", "swift"], 32, 12, 9.8],
    ["REP-003", "Bujías iridio (juego x4)", "Encendido", ["corolla", "rav4"], 14, 10, 38],
    ["REP-004", "Pastillas de freno delanteras", "Frenos", ["corolla", "rav4", "hilux", "swift"], 9, 12, 42],
    ["REP-005", "Disco de freno ventilado", "Frenos", ["rav4", "hilux"], 6, 8, 67],
    ["REP-006", "Amortiguador delantero", "Suspensión", ["corolla", "swift"], 11, 6, 85],
    ["REP-007", "Amortiguador reforzado 4x4", "Suspensión", ["hilux"], 4, 4, 128],
    ["REP-008", "Batería 12V 60Ah", "Eléctrico", ["corolla", "swift", "rav4"], 18, 8, 96],
    ["REP-009", "Alternador 90A", "Eléctrico", ["hilux", "rav4"], 0, 3, 215],
    ["REP-010", "Correa de distribución", "Motor", ["corolla", "swift"], 21, 8, 34],
    ["REP-011", "Faro delantero derecho", "Carrocería", ["rav4", "corolla"], 5, 4, 120],
    ["REP-012", "Kit de embrague", "Transmisión", ["hilux", "swift"], 7, 4, 185],
    ["REP-013", "Radiador de aluminio", "Refrigeración", ["hilux", "rav4"], 3, 4, 175]];
  const PROV = [
    ["AutoPartes Andina", "Motor y filtros", "+000 111 2233", "ventas@andina.example", "3 días"],
    ["FrenoMax Distribuciones", "Frenos y suspensión", "+000 444 5566", "pedidos@frenomax.example", "5 días"],
    ["Electro Motriz", "Baterías y eléctrico", "+000 777 8899", "contacto@electromotriz.example", "2 días"],
    ["Carrocerías del Sur", "Faros y carrocería", "+000 222 3344", "info@carroceriassur.example", "7 días"]];
  const K = "paola_inv_v1", L = "paola_mov_v1";
  const load = (k, f) => { try { return JSON.parse(localStorage.getItem(k)) || f } catch (e) { return f } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) { } };
  let P = load(K, null) || SEED.map(a => ({ c: a[0], n: a[1], cat: a[2], m: a[3], s: a[4], min: a[5], p: a[6] }));
  let M = load(L, []);
  const $ = s => document.querySelector(s);
  const mn = id => (MODELOS.find(m => m.id === id) || {}).n || id;
  const est = p => p.s === 0 ? ["cero", "Agotado"] : p.s <= p.min ? ["bajo", "Stock bajo"] : ["ok", "Disponible"];
  const mov = (p, q, t) => { M.unshift({ f: new Date().toLocaleString("es"), c: p.c, n: p.n, q: q, t: t }); M = M.slice(0, 60); save(L, M) };
  const persist = () => save(K, P);
  const money = v => "$" + v.toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const page = document.body.dataset.page;

  function kpis() {
    const el = $("#kpis"); if (!el) return;
    const u = P.reduce((a, p) => a + p.s, 0), v = P.reduce((a, p) => a + p.s * p.p, 0), b = P.filter(p => p.s <= p.min).length;
    el.innerHTML = `<div class="kpi"><b>${P.length}</b><span>Referencias de repuestos</span></div>
 <div class="kpi"><b>${u}</b><span>Unidades en bodega</span></div>
 <div class="kpi"><b>${money(v)}</b><span>Valor del inventario</span></div>
 <div class="kpi al"><b>${b}</b><span>Con stock bajo o agotado</span></div>`;
  }
  function filas(list, acc) {
    if (!list.length) return `<tr><td colspan="8" class="vacio">No hay repuestos con esos filtros. Cambia la búsqueda o agrega uno nuevo.</td></tr>`;
    return list.map(p => {
      const e = est(p); return `<tr><td>${p.c}</td><td><b>${p.n}</b></td><td>${p.cat}</td>
 <td>${p.m.map(i => `<span class="tag">${mn(i)}</span>`).join("")}</td><td>${money(p.p)}</td>
 <td>${acc ? `<button class="mini" data-a="-" data-c="${p.c}" aria-label="Restar una unidad">−</button> <b>${p.s}</b> <button class="mini" data-a="+" data-c="${p.c}" aria-label="Sumar una unidad">+</button>` : `<b>${p.s}</b>`}</td>
 <td class="est ${e[0]}">${e[1]}</td>${acc ? `<td><button class="mini" data-a="x" data-c="${p.c}" aria-label="Eliminar repuesto">×</button></td>` : ""}</tr>`
    }).join("");
  }
  function inicio() {
    kpis();
    $("#bajos").innerHTML = filas(P.filter(p => p.s <= p.min), false);
    $("#modelos").innerHTML = MODELOS.map(m => `<article class="car"><img src="${m.i}" alt="${m.n}"><div><h3>${m.n}</h3><p>${m.d}</p><a class="btn az" href="modelos.html#${m.id}">Ver repuestos</a></div></article>`).join("");
  }
  function inventario() {
    kpis();
    const f = $("#fm"); f.innerHTML = '<option value="">Todos los modelos</option>' + MODELOS.map(m => `<option value="${m.id}">${m.n}</option>`).join("");
    $("#mchk").innerHTML = MODELOS.map(m => `<option value="${m.id}">${m.n}</option>`).join("");
    const draw = () => {
      const q = $("#q").value.toLowerCase(), m = f.value;
      $("#tb").innerHTML = filas(P.filter(p => (!m || p.m.includes(m)) && (p.n + p.c + p.cat).toLowerCase().includes(q)), true); kpis()
    };
    $("#q").oninput = draw; f.onchange = draw; draw();
    $("#tb").onclick = e => {
      const b = e.target.closest("button"); if (!b) return; const p = P.find(x => x.c === b.dataset.c);
      if (b.dataset.a === "+") { p.s++; mov(p, 1, "Entrada") }
      if (b.dataset.a === "-" && p.s > 0) { p.s--; mov(p, 1, "Salida") }
      if (b.dataset.a === "x" && confirm("¿Eliminar " + p.n + "?")) P = P.filter(x => x !== p);
      persist(); draw()
    };
    $("#alta").onsubmit = e => {
      e.preventDefault(); const d = new FormData(e.target);
      const m = [...$("#mchk").selectedOptions].map(o => o.value);
      const p = { c: "REP-" + String(P.length + 1 + Math.floor(Math.random() * 90)).padStart(3, "0"), n: d.get("n"), cat: d.get("cat"), m: m.length ? m : [MODELOS[0].id], s: +d.get("s"), min: +d.get("min"), p: +d.get("p") };
      P.push(p); mov(p, p.s, "Entrada inicial"); persist(); e.target.reset(); draw()
    };
  }
  function modelos() {
    $("#grid").innerHTML = MODELOS.map(m => {
      const l = P.filter(p => p.m.includes(m.id));
      return `<article class="car" id="${m.id}"><img src="${m.i}" alt="${m.n}"><div><h3>${m.n}</h3><p>${m.d} · ${l.length} repuestos compatibles</p>
  ${l.map(p => `<span class="tag">${p.n} (${p.s})</span>`).join("")}</div></article>`
    }).join("");
  }
  function movimientos() {
    $("#tm").innerHTML = M.length ? M.map(x => `<tr><td>${x.f}</td><td>${x.c}</td><td>${x.n}</td><td>${x.t}</td><td>${x.q}</td></tr>`).join("") :
      `<tr><td colspan="5" class="vacio">Aún no hay movimientos. Suma o resta unidades en Inventario y aparecerán aquí.</td></tr>`;
    $("#borrar").onclick = () => { M = []; save(L, M); movimientos() };
  }
  function proveedores() {
    $("#tp").innerHTML = PROV.map(p => `<tr><td><b>${p[0]}</b></td><td>${p[1]}</td><td>${p[2]}</td><td>${p[3]}</td><td>${p[4]}</td></tr>`).join("");
  }
  ({ inicio, inventario, modelos, movimientos, proveedores })[page]();
})();
