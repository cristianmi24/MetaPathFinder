import { useState, useCallback, useRef, useEffect } from 'react';
import './SqlBlockBoard.css';

interface FieldTagProps {
  val: string;
  onRemove: () => void;
  onEdit: (val: string) => void;
}

const ALL_TABLES = ['Proveedores','Productos','Ventas'];
const ALL_OPS = ['=','<','>','<=','>=','<>','LIKE'];
const ALL_AGGR = ['SUM','COUNT','AVG','MIN','MAX'];
const ALL_FIELDS = ['id','nombre','ciudad','contacto','activo','categoria','precio','stock','stock_min','proveedor_id','producto_id','cantidad','total','fecha','cliente'];

interface BlockParam {
  fields?: string[];
  table?: string;
  field?: string;
  field1?: string;
  field2?: string;
  op?: string;
  val?: string;
  aggr?: string;
  dir?: string;
  num?: string;
}

const BLOCK_DEFS: Record<string, {id:string; label:string; icon:string; template:(p:BlockParam)=>string}> = {
  select: { id:'select', label:'SELECT', icon:'ti ti-select', template:(p) => `SELECT ${(p.fields||['*']).join(', ')}` },
  from: { id:'from', label:'FROM', icon:'ti ti-arrow-right', template:(p) => `FROM ${p.table || 'tabla'}` },
  join: { id:'join', label:'JOIN', icon:'ti ti-plug', template:(p) => `JOIN ${p.table||'tabla'} ON ${p.field1||'campo'} = ${p.field2||'campo'}` },
  where: { id:'where', label:'WHERE', icon:'ti ti-filter', template:(p) => {
    let val = p.val || '?';
    if (p.op === 'LIKE' && val !== '?') val = `'%${val}%'`;
    else if (val !== '?' && isNaN(Number(val))) val = `'${val}'`;
    return `WHERE ${p.field||'campo'} ${p.op||'='} ${val}`;
  }},
  groupby: { id:'groupby', label:'GROUP BY', icon:'ti ti-group', template:(p) => `GROUP BY ${p.field || 'campo'}` },
  having: { id:'having', label:'HAVING', icon:'ti ti-adjustments', template:(p) => `HAVING ${p.aggr||'COUNT'}(${p.field||'campo'}) ${p.op||'>'} ${p.val||'0'}` },
  orderby: { id:'orderby', label:'ORDER BY', icon:'ti ti-sort-ascending', template:(p) => `ORDER BY ${p.field||'campo'} ${p.dir||'ASC'}` },
  limit: { id:'limit', label:'LIMIT', icon:'ti ti-numbers', template:(p) => `LIMIT ${p.num || '10'}` },
};

const BLOCK_ORDER = ['select','from','join','where','groupby','having','orderby','limit'];

interface WorkspaceBlock {
  type: string;
  params: BlockParam;
}

// DB simulation
const DB: Record<string, Record<string, string>[]> = {
  Proveedores: [
    {id:'1',nombre:'Papelería Norte',ciudad:'Bogotá',contacto:'3001112233',activo:'1'},
    {id:'2',nombre:'DistribuTech',ciudad:'Medellín',contacto:'3114445566',activo:'1'},
    {id:'3',nombre:'Escolar Plus',ciudad:'Cali',contacto:'3207778899',activo:'1'},
    {id:'4',nombre:'Colores SA',ciudad:'Barranquilla',contacto:'3019991100',activo:'0'},
    {id:'5',nombre:'Mundo Escolar',ciudad:'Bucaramanga',contacto:'3123334455',activo:'1'},
    {id:'6',nombre:'ArtSchool',ciudad:'Pereira',contacto:'3056667788',activo:'1'},
    {id:'7',nombre:'LibroMás',ciudad:'Manizales',contacto:'3178889900',activo:'0'},
    {id:'8',nombre:'TechEdu',ciudad:'Cartagena',contacto:'3201011121',activo:'1'},
    {id:'9',nombre:'Útiles YA',ciudad:'Cúcuta',contacto:'3141314151',activo:'1'},
    {id:'10',nombre:'PaperCity',ciudad:'Ibagué',contacto:'3161617181',activo:'1'},
  ],
  Productos: [
    {id:'1',nombre:'Cuaderno 100h',categoria:'Cuadernos',precio:'3500',stock:'45',stock_min:'10',proveedor_id:'1'},
    {id:'2',nombre:'Lapicero azul',categoria:'Lapiceros',precio:'800',stock:'120',stock_min:'20',proveedor_id:'2'},
    {id:'3',nombre:'Regla 30cm',categoria:'Geometría',precio:'1200',stock:'30',stock_min:'5',proveedor_id:'3'},
    {id:'4',nombre:'Colores x12',categoria:'Arte',precio:'8500',stock:'25',stock_min:'8',proveedor_id:'4'},
    {id:'5',nombre:'Borrador blanco',categoria:'Útiles',precio:'500',stock:'200',stock_min:'30',proveedor_id:'5'},
    {id:'6',nombre:'Marcador perm.',categoria:'Marcadores',precio:'2000',stock:'60',stock_min:'15',proveedor_id:'6'},
    {id:'7',nombre:'Tijeras punta r.',categoria:'Útiles',precio:'4500',stock:'18',stock_min:'5',proveedor_id:'7'},
    {id:'8',nombre:'Compás escolar',categoria:'Geometría',precio:'6000',stock:'10',stock_min:'3',proveedor_id:'8'},
    {id:'9',nombre:'Cartulina A4',categoria:'Arte',precio:'1500',stock:'80',stock_min:'20',proveedor_id:'9'},
    {id:'10',nombre:'Pegante stick',categoria:'Útiles',precio:'2500',stock:'35',stock_min:'10',proveedor_id:'10'},
  ],
  Ventas: [
    {id:'1',producto_id:'1',cantidad:'3',total:'10500',fecha:'2025-05-17',cliente:'Juan Pérez'},
    {id:'2',producto_id:'2',cantidad:'10',total:'8000',fecha:'2025-05-17',cliente:'María Gómez'},
    {id:'3',producto_id:'4',cantidad:'2',total:'17000',fecha:'2025-05-17',cliente:'Carlos Ruiz'},
    {id:'4',producto_id:'5',cantidad:'5',total:'2500',fecha:'2025-05-17',cliente:'Ana Torres'},
    {id:'5',producto_id:'3',cantidad:'1',total:'1200',fecha:'2025-05-17',cliente:'Luis Mora'},
    {id:'6',producto_id:'6',cantidad:'4',total:'8000',fecha:'2025-05-16',cliente:'Pedro Díaz'},
    {id:'7',producto_id:'7',cantidad:'2',total:'9000',fecha:'2025-05-16',cliente:'Laura Vega'},
    {id:'8',producto_id:'8',cantidad:'1',total:'6000',fecha:'2025-05-16',cliente:'Sofía León'},
    {id:'9',producto_id:'9',cantidad:'6',total:'9000',fecha:'2025-05-15',cliente:'Diego Cruz'},
    {id:'10',producto_id:'10',cantidad:'3',total:'7500',fecha:'2025-05-15',cliente:'Valeria Ríos'},
  ],
};

const CHALLENGES = [
  { title:'Total ventas hoy', desc:'Calcula el total de ventas del día 2025-05-17: cuántas ventas, cuántas unidades vendidas y el total en COP. Usa SUM(total), COUNT(*) y SUM(cantidad) con WHERE fecha = \'2025-05-17\'.', hint:'SELECT SUM(total), COUNT(*), SUM(cantidad) FROM Ventas WHERE fecha = \'2025-05-17\'' },
];

interface SqlBlockBoardProps {
  challengeId: string;
  onValidation: (success: boolean) => void;
}

interface Result {
  type: 'ok' | 'err' | 'table';
  msg?: string;
  cols?: string[];
  rows?: string[][];
  ms?: string;
}

export function SqlBlockBoard({ challengeId, onValidation }: SqlBlockBoardProps) {
  const [phase, setPhase] = useState(0);
  const [phaseDone, setPhaseDone] = useState<boolean[]>([false, false, false]);
  const [blocks, setBlocks] = useState<WorkspaceBlock[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [customField, setCustomField] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [completed, setCompleted] = useState(false);
  const resRef = useRef<HTMLDivElement>(null);

  const addBlock = useCallback((type: string) => {
    setBlocks(prev => {
      const def = BLOCK_DEFS[type];
      if (!def) return prev;
      const newBlock: WorkspaceBlock = { type, params: {} };
      switch (type) {
        case 'select': newBlock.params.fields = ['*']; break;
        case 'from': newBlock.params.table = ''; break;
        case 'join': newBlock.params = { table:'', field1:'', field2:'' }; break;
        case 'where': newBlock.params = { field:'', op:'=', val:'' }; break;
        case 'groupby': newBlock.params.field = ''; break;
        case 'having': newBlock.params = { aggr:'COUNT', field:'', op:'>', val:'0' }; break;
        case 'orderby': newBlock.params = { field:'', dir:'ASC' }; break;
        case 'limit': newBlock.params.num = '10'; break;
      }
      const next = [...prev, newBlock];
      next.sort((a, b) => BLOCK_ORDER.indexOf(a.type) - BLOCK_ORDER.indexOf(b.type));
      return next;
    });
  }, []);

  const removeBlock = useCallback((idx: number) => {
    setBlocks(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const updateParam = useCallback((idx: number, key: string, value: string) => {
    setBlocks(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], params: { ...next[idx].params, [key]: value } };
      return next;
    });
  }, []);

  const addSelectField = useCallback((idx: number) => {
    setBlocks(prev => {
      const next = [...prev];
      const b = next[idx];
      if (b.type === 'select') {
        b.params = { ...b.params, fields: [...(b.params.fields || ['*']), ''] };
      }
      return next;
    });
  }, []);

  const updateSelectField = useCallback((idx: number, fi: number, val: string) => {
    setBlocks(prev => {
      const next = [...prev];
      const b = next[idx];
      if (b.type === 'select' && b.params.fields) {
        const fields = [...b.params.fields];
        fields[fi] = val;
        b.params = { ...b.params, fields };
      }
      return next;
    });
  }, []);

  const removeSelectField = useCallback((idx: number, fi: number) => {
    setBlocks(prev => {
      const next = [...prev];
      const b = next[idx];
      if (b.type === 'select' && b.params.fields) {
        const fields = b.params.fields.filter((_, i) => i !== fi);
        b.params = { ...b.params, fields: fields.length === 0 ? ['*'] : fields };
      }
      return next;
    });
  }, []);

  const addCustomField = useCallback(() => {
    if (!customField.trim()) return;
    const selIdx = (() => { for (let i = blocks.length - 1; i >= 0; i--) if (blocks[i].type === 'select') return i; return -1; })();
    if (selIdx === -1) return;
    setBlocks(prev => {
      const next = [...prev];
      const b = next[selIdx];
      if (b.type === 'select') {
        const fields = b.params.fields || ['*'];
        if (fields.length === 1 && fields[0] === '*') fields.length = 0;
        fields.push(customField.trim());
        b.params = { ...b.params, fields: [...fields] };
      }
      return next;
    });
    setCustomField('');
  }, [customField, blocks]);

  const genSQL = useCallback((bs: WorkspaceBlock[]): string => {
    return bs.map(b => {
      const def = BLOCK_DEFS[b.type];
      return def ? def.template(b.params) : '';
    }).filter(Boolean).join('\n');
  }, []);

  const execSQL = useCallback((sql: string): Result => {
    const s = sql.replace(/--[^\n]*/g,'').replace(/\s+/g,' ').trim().toLowerCase();
    const t = performance.now();

    if (!s) return { type:'err', msg:'Arma una consulta con los bloques primero.' };
    if (s.includes('create table')) return { type:'ok', msg:'✓ Tablas creadas exitosamente: Proveedores, Productos, Ventas.' };
    if (s.includes('insert into')) return { type:'ok', msg:'✓ 10 registros insertados en cada tabla.' };

    if (s.includes('select') && s.includes('from ventas') && !s.includes('join') && !s.includes('where')) return showTable('Ventas');
    if (s.includes('select') && s.includes('from productos') && !s.includes('join') && !s.includes('where')) return showTable('Productos');
    if (s.includes('select') && s.includes('from proveedores') && !s.includes('join') && !s.includes('where')) return showTable('Proveedores');

    const hasSumTotal = s.includes('sum(total)');
    const hasCount = s.includes('count(*)');
    const hasFechaFilter = s.includes("'2025-05-17'") || s.includes('fecha') && s.includes('2025-05-17');
    const hasFromVentas = s.includes('from ventas');
    if (hasSumTotal && hasFromVentas && hasFechaFilter) {
      return { type:'table', cols:['total_ventas','num_ventas','unidades_vendidas'], rows:[['39.200 COP','5','21']], ms: (performance.now()-t).toFixed(1) };
    }

    if (s.includes('select')) {
      return { type:'ok', msg:'✓ Consulta ejecutada. Revisa los resultados.', ms: (performance.now()-t).toFixed(1) };
    }

    return { type:'err', msg:'Sentencia no reconocida por el simulador.' };
  }, []);

  const showTable = useCallback((name: string): Result => {
    const data = DB[name];
    if (!data) return { type:'err', msg:'Tabla no encontrada.' };
    const cols = Object.keys(data[0]);
    const rows = data.map(r => cols.map(c => r[c]));
    return { type:'table', cols, rows };
  }, []);

  const handleRun = useCallback(() => {
    if (phase === 0) {
      setResult({ type:'ok', msg:'✓ Tablas creadas exitosamente: Proveedores, Productos, Ventas.' });
      setPhaseDone(prev => { const next = [...prev]; next[0] = true; return next; });
      onValidation(true);
      setTimeout(() => { setPhase(1); setBlocks([]); setResult(null); }, 1500);
    } else if (phase === 1) {
      setResult({ type:'ok', msg:'✓ 10 registros insertados en cada tabla.' });
      setPhaseDone(prev => { const next = [...prev]; next[1] = true; return next; });
      onValidation(true);
      setTimeout(() => { setPhase(2); setBlocks([]); setResult(null); }, 1500);
    } else {
      const sql = genSQL(blocks);
      if (!sql) { setResult({ type:'err', msg:'Arma una consulta con los bloques primero.' }); return; }
      const res = execSQL(sql);
      setResult(res);
      if (res.type !== 'err') {
        setPhaseDone(prev => { const next = [...prev]; next[2] = true; return next; });
        setTimeout(() => { setCompleted(true); onValidation(true); }, 1500);
      }
    }
  }, [phase, blocks, genSQL, execSQL, onValidation]);

  const handlePhaseChange = useCallback((n: number) => {
    setPhase(n);
    setBlocks([]);
    setResult(null);
  }, []);

  const sql = genSQL(blocks);

  const renderBlockContent = (block: WorkspaceBlock, idx: number) => {
    const def = BLOCK_DEFS[block.type];
    const tag = def?.label || block.type.toUpperCase();
    switch (block.type) {
      case 'select': {
        const fields = block.params.fields || ['*'];
        return (
          <>
            <span className="tag">{tag}</span><span className="sep">▸</span>
            <div className="multi-fields">
              {fields.map((f, fi) => (
                <span key={fi} className="field-tag">
                  <input
                    type="text" value={f} size={Math.max(f.length, 3)}
                    onChange={e => updateSelectField(idx, fi, e.target.value)}
                    style={{background:'transparent',border:'none',color:'inherit',fontSize:10,width:Math.max(f.length*7+4,20),outline:'none',padding:0,fontFamily:'inherit'}}
                  />
                  <span className="rm" onClick={() => removeSelectField(idx, fi)}>×</span>
                </span>
              ))}
              <span className="add-field" onClick={() => addSelectField(idx)}>+ campo</span>
            </div>
          </>
        );
      }
      case 'from': return (
        <>
          <span className="tag">{tag}</span><span className="sep">▸</span>
          <select value={block.params.table||''} onChange={e => updateParam(idx,'table',e.target.value)}>
            <option value="">tabla...</option>
            {ALL_TABLES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </>
      );
      case 'join': return (
        <>
          <span className="tag">{tag}</span><span className="sep">▸</span>
          <select value={block.params.table||''} onChange={e => updateParam(idx,'table',e.target.value)}>
            <option value="">tabla...</option>
            {ALL_TABLES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <span style={{color:'var(--sqlb-text3)',fontSize:10}}>ON</span>
          <select value={block.params.field1||''} onChange={e => updateParam(idx,'field1',e.target.value)}>
            <option value="">campo</option>
            {ALL_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <span style={{color:'var(--sqlb-text3)'}}>=</span>
          <select value={block.params.field2||''} onChange={e => updateParam(idx,'field2',e.target.value)}>
            <option value="">campo</option>
            {ALL_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </>
      );
      case 'where': return (
        <>
          <span className="tag">{tag}</span><span className="sep">▸</span>
          <select value={block.params.field||''} onChange={e => updateParam(idx,'field',e.target.value)}>
            <option value="">campo</option>
            {ALL_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select value={block.params.op||'='} onChange={e => updateParam(idx,'op',e.target.value)}>
            {ALL_OPS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <input type="text" value={block.params.val||''} placeholder="valor" onChange={e => updateParam(idx,'val',e.target.value)} />
        </>
      );
      case 'groupby': return (
        <>
          <span className="tag">{tag}</span><span className="sep">▸</span>
          <select value={block.params.field||''} onChange={e => updateParam(idx,'field',e.target.value)}>
            <option value="">campo</option>
            {ALL_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </>
      );
      case 'having': return (
        <>
          <span className="tag">{tag}</span><span className="sep">▸</span>
          <select value={block.params.aggr||'COUNT'} onChange={e => updateParam(idx,'aggr',e.target.value)}>
            {ALL_AGGR.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          (<select value={block.params.field||''} onChange={e => updateParam(idx,'field',e.target.value)}>
            <option value="">campo</option>
            {ALL_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>)
          <select value={block.params.op||'>'} onChange={e => updateParam(idx,'op',e.target.value)}>
            {ALL_OPS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <input type="text" value={block.params.val||'0'} placeholder="valor" onChange={e => updateParam(idx,'val',e.target.value)} />
        </>
      );
      case 'orderby': return (
        <>
          <span className="tag">{tag}</span><span className="sep">▸</span>
          <select value={block.params.field||''} onChange={e => updateParam(idx,'field',e.target.value)}>
            <option value="">campo</option>
            {ALL_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select value={block.params.dir||'ASC'} onChange={e => updateParam(idx,'dir',e.target.value)}>
            <option value="ASC">ASC</option><option value="DESC">DESC</option>
          </select>
        </>
      );
      case 'limit': return (
        <>
          <span className="tag">{tag}</span><span className="sep">▸</span>
          <input type="number" value={block.params.num||10} min={1} max={100} onChange={e => updateParam(idx,'num',e.target.value)} style={{width:60}} />
          <span style={{color:'var(--sqlb-text3)',fontSize:10}}>filas</span>
        </>
      );
      default: return <span className="tag">{tag}</span>;
    }
  };

  return (
    <div className="sqlb-root">
      <div className="sqlb-topbar">
        <i className="ti ti-puzzle" style={{fontSize:18,color:'var(--sqlb-primary)'}} />
        <span style={{fontSize:15,fontWeight:600}}>Tienda Escolar — SQL por Bloques</span>
        <span className="sqlb-badge"><i className="ti ti-check" style={{fontSize:12}} /> DB simulada</span>
      </div>

      <div className="sqlb-phases">
        {[
          {icon:'ti ti-table-plus',label:'1. Crear tablas'},
          {icon:'ti ti-row-insert-bottom',label:'2. Insertar datos'},
          {icon:'ti ti-zoom-code',label:'3. Consultas'},
        ].map((p, i) => (
          <div key={i}
            className={`sqlb-pb ${phase === i ? 'active' : ''} ${phaseDone[i] ? 'done' : ''}`}
            onClick={() => handlePhaseChange(i)}
          ><i className={p.icon} style={{fontSize:12}} /> {p.label}</div>
        ))}
      </div>

      {/* Phase instructions */}
      <div className="sqlb-instrucciones">
        {phase === 0 && (
          <span>📌 <b>Fase 1:</b> Revisa el script <code>CREATE TABLE</code> y presiona <b>Ejecutar</b> para crear las tablas.</span>
        )}
        {phase === 1 && (
          <span>📌 <b>Fase 2:</b> Revisa el script <code>INSERT INTO</code> y presiona <b>Ejecutar</b> para insertar los datos.</span>
        )}
        {phase === 2 && (
          <span>📌 <b>Fase 3:</b> Arma la consulta con los bloques de la izquierda y presiona <b>Ejecutar</b> para resolver el reto.</span>
        )}
      </div>

      <div className="sqlb-panels" style={{ gridTemplateColumns: phase === 2 ? '200px 1fr' : '1fr' }}>
        {/* Palette — solo visible en fase 2 */}
        {phase === 2 && <div className="sqlb-paleta">
          <div className="sqlb-pal-hdr">
            <i className="ti ti-blocks" style={{fontSize:13}} /> Bloques
          </div>

          {/* Cláusulas */}
          <div className="sqlb-pal-cat">
            <div className="sqlb-pal-cat-hdr"><i className="ti ti-code" style={{fontSize:11}} /> Cláusulas</div>
            <div className="sqlb-pal-cat-body">
              {['select','from','where','join','groupby','having','orderby','limit'].map(t => {
                const d = BLOCK_DEFS[t];
                return d ? (
                  <span key={t} className="sqlb-pal-bloque sqlb-c-clause" onClick={() => addBlock(t)}>
                    <i className={d.icon} style={{fontSize:11}} /> {d.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>

          {/* Campos */}
          <div className="sqlb-pal-cat">
            <div className="sqlb-pal-cat-hdr"><i className="ti ti-list" style={{fontSize:11}} /> Campos</div>
            <div className="sqlb-pal-cat-body" style={{flexDirection:'column'}}>
              <div style={{display:'flex',gap:4}}>
                <input type="text" className="sqlb-field-input" placeholder="nombre, *, COUNT(*)..." value={customField} onChange={e => setCustomField(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addCustomField(); }} />
              </div>
              <span className="sqlb-pal-bloque sqlb-c-campo" style={{width:'100%',justifyContent:'center'}} onClick={addCustomField}>
                <i className="ti ti-plus" style={{fontSize:10}} /> Agregar campo
              </span>
            </div>
          </div>

          {/* Funciones */}
          <div className="sqlb-pal-cat">
            <div className="sqlb-pal-cat-hdr"><i className="ti ti-math" style={{fontSize:11}} /> Funciones</div>
            <div className="sqlb-pal-cat-body">
              {ALL_AGGR.map(a => (
                <span key={a} className="sqlb-pal-bloque sqlb-c-func" onClick={() => { const v = customField || ''; setCustomField(v ? `${a}(${v})` : `${a}(?)`); }}>
                  <i className="ti ti-sum" style={{fontSize:10}} /> {a}( )
                </span>
              ))}
            </div>
          </div>

          {/* Operadores */}
          <div className="sqlb-pal-cat">
            <div className="sqlb-pal-cat-hdr"><i className="ti ti-equal" style={{fontSize:11}} /> Operadores</div>
            <div className="sqlb-pal-cat-body">
              {ALL_OPS.map(o => (
                <span key={o} className="sqlb-pal-bloque sqlb-c-op" onClick={() => {
                  const idx = (() => { for(let i=blocks.length-1;i>=0;i--) if(blocks[i].type==='where'||blocks[i].type==='having') return i; return -1; })();
                  if (idx !== -1) updateParam(idx, 'op', o);
                }}>{o}</span>
              ))}
            </div>
          </div>

          {/* Tablas */}
          <div className="sqlb-pal-cat">
            <div className="sqlb-pal-cat-hdr"><i className="ti ti-database" style={{fontSize:11}} /> Tablas</div>
            <div className="sqlb-pal-cat-body">
              {ALL_TABLES.map(t => (
                <span key={t} className="sqlb-pal-bloque sqlb-c-tabla" onClick={() => {
                  const idx = (() => { for(let i=blocks.length-1;i>=0;i--) if(blocks[i].type==='from'||blocks[i].type==='join') return i; return -1; })();
                  if (idx !== -1) updateParam(idx, 'table', t);
                  else addBlock('from');
                }}>
                  <i className="ti ti-table" style={{fontSize:10}} /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>}

        {/* Main workspace */}
        <div className="sqlb-main">
          {phase === 2 && (
            <>
              <div className="sqlb-qchips">
                {CHALLENGES.map((c, i) => (
                  <div key={i} className={`sqlb-qc ${activeChallenge === i ? 'act' : ''}`} onClick={() => { setActiveChallenge(i); setBlocks([]); setResult(null); }}>
                    {c.title}
                  </div>
                ))}
              </div>
              <div className="sqlb-reto-desc">
                <span className="icono" style={{fontSize:16,flexShrink:0}}>🎯</span>
                <div><strong>{CHALLENGES[activeChallenge].title}</strong><br />{CHALLENGES[activeChallenge].desc}</div>
                <button className="sqlb-help-btn" onClick={() => setShowHelp(!showHelp)} title="Ayuda">
                  <i className="ti ti-bulb" /> {showHelp ? 'Ocultar ayuda' : 'Ayuda'}
                </button>
              </div>
              {showHelp && (
                <div className="sqlb-help-box">
                  <i className="ti ti-info-circle" /> <b>Sugerencia:</b> {CHALLENGES[activeChallenge].hint}
                </div>
              )}
            </>
          )}

          <div className={`sqlb-area-bloques ${blocks.length === 0 ? 'vacia' : ''}`}>
            {blocks.length === 0 && (
              <div className="sqlb-placeholder">
                <span className="icono"><i className="ti ti-arrow-up" /></span>
                Haz clic en los bloques de la izquierda para armar tu consulta
              </div>
            )}
            <div className="sqlb-workspace">
              {blocks.map((block, idx) => (
                <div key={idx} className="sqlb-ws-bloque">
                  {renderBlockContent(block, idx)}
                  <button className="btn-del" onClick={() => removeBlock(idx)} title="Quitar bloque">✕</button>
                </div>
              ))}
            </div>
          </div>

          <div className="sqlb-ebar">
            <span style={{fontFamily:'var(--sqlb-mono)',fontSize:11,color:'var(--sqlb-text3)'}}>
              {phase === 2 ? `🧩 ${CHALLENGES[activeChallenge].title}` : phase === 0 ? '📄 Crear tablas' : '📄 Insertar datos'}
            </span>
            <button className="sqlb-rbtn" onClick={handleRun}>
              <i className="ti ti-player-play" style={{fontSize:13}} /> Ejecutar
            </button>
          </div>

          <div className="sqlb-sql-preview">
            {sql ? highlightSQL(sql) : (
              phase === 0 || phase === 1 ? (
                <span className="placeholder"><i className="ti ti-info-circle" style={{fontSize:12}} /> Revisa el script y presiona Ejecutar</span>
              ) : (
                <span className="placeholder"><i className="ti ti-code" style={{fontSize:12}} /> SQL generado aparecerá aquí</span>
              )
            )}
          </div>

          {phase === 0 && blocks.length === 0 && (
            <div className="sqlb-sql-preview" style={{marginTop:0,background:'var(--sqlb-surface)'}}>
              {highlightSQL(`CREATE TABLE Proveedores (id INTEGER PRIMARY KEY, nombre TEXT, ciudad TEXT, contacto TEXT, activo INTEGER);
CREATE TABLE Productos (id INTEGER PRIMARY KEY, nombre TEXT, categoria TEXT, precio REAL, stock INTEGER, stock_min INTEGER, proveedor_id INTEGER);
CREATE TABLE Ventas (id INTEGER PRIMARY KEY, producto_id INTEGER, cantidad INTEGER, total REAL, fecha TEXT, cliente TEXT);`)}
            </div>
          )}
          {phase === 1 && blocks.length === 0 && (
            <div className="sqlb-sql-preview" style={{marginTop:0,background:'var(--sqlb-surface)'}}>
              {highlightSQL(`INSERT INTO Proveedores VALUES (1,'Papelería Norte','Bogotá','3001112233',1),...;
INSERT INTO Productos VALUES (1,'Cuaderno 100h','Cuadernos',3500,45,10,1),...;
INSERT INTO Ventas VALUES (1,1,3,10500,'2025-05-17','Juan Pérez'),...;`)}
            </div>
          )}

          {/* Results */}
          <div className="sqlb-rbox" ref={resRef}>
            {result ? (
              result.type === 'ok' ? (
                <>
                  <div className="sqlb-rhead"><span style={{fontSize:12,color:'var(--sqlb-accent)'}}><i className="ti ti-check" style={{fontSize:13}} /> Ejecutado{result.ms ? ` · ${result.ms}ms` : ''}</span></div>
                  <div className="sqlb-ok"><i className="ti ti-check" style={{fontSize:15}} /> {result.msg}</div>
                </>
              ) : result.type === 'err' ? (
                <>
                  <div className="sqlb-rhead"><span style={{fontSize:12,color:'var(--sqlb-danger)'}}><i className="ti ti-alert-triangle" style={{fontSize:13}} /> Error</span></div>
                  <div className="sqlb-er"><i className="ti ti-x" style={{fontSize:15}} /> {result.msg}</div>
                </>
              ) : (
                <>
                  <div className="sqlb-rhead">
                    <span style={{fontSize:12,color:'#b8b0f0'}}><i className="ti ti-table" style={{fontSize:13}} /> {result.rows?.length || 0} fila(s){result.ms ? ` · ${result.ms}ms` : ''}</span>
                  </div>
                  <div className="sqlb-rscroll">
                    <table>
                      <thead><tr>{(result.cols||[]).map(c => <th key={c}>{c}</th>)}</tr></thead>
                      <tbody>{(result.rows||[]).map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
                    </table>
                  </div>
                </>
              )
            ) : (
              <>
                <div className="sqlb-rhead"><span style={{fontSize:12,color:'var(--sqlb-text2)'}}><i className="ti ti-clock" style={{fontSize:13}} /> Esperando ejecución...</span></div>
                <div style={{padding:'10px 12px',fontSize:13,color:'var(--sqlb-text2)',display:'flex',alignItems:'center',gap:6}}>
                  <i className="ti ti-terminal-2" style={{fontSize:15}} /> Arma tu consulta con bloques y presiona Ejecutar.
                </div>
              </>
            )}
          </div>

          {completed && (
            <div className="sqlb-completado">
              <i className="ti ti-circle-check" style={{fontSize:22}} /> ¡Reto completado con éxito! Puedes terminar la fase.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function highlightSQL(sql: string): string {
  let s = sql;
  const keywords = ['SELECT','FROM','WHERE','JOIN','ON','GROUP BY','ORDER BY','LIMIT','HAVING','AND','OR','AS','ASC','DESC','LIKE','INSERT INTO','VALUES','CREATE TABLE','INTEGER','PRIMARY KEY','FOREIGN KEY','REFERENCES','REAL','TEXT'];
  keywords.forEach(kw => {
    const re = new RegExp('\\b' + kw.replace(/ /g,'\\s+') + '\\b', 'gi');
    s = s.replace(re, `<span class="kw">${kw}</span>`);
  });
  ALL_TABLES.forEach(t => {
    s = s.replace(new RegExp('\\b' + t + '\\b', 'g'), `<span class="tbl">${t}</span>`);
  });
  ALL_AGGR.forEach(a => {
    s = s.replace(new RegExp('\\b' + a + '(\\s*\\()', 'gi'), `<span class="fn">${a}</span>(`);
  });
  s = s.replace(/('[^']*')/g, '<span class="str">$1</span>');
  s = s.replace(/\b(\d+)\b/g, '<span class="num">$1</span>');
  return s;
}
