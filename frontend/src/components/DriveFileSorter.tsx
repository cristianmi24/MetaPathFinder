import React, { useState } from 'react';

interface FileItem {
  id: number;
  name: string;
  ext: string;
  icon: string;
  iconBg: string;
  date: string;
  ts: number;
  type: string;
}

const FILES: FileItem[] = [
  { id: 1, name: 'Tarea de matemáticas', ext: 'docx', icon: '📄', iconBg: '#E6F1FB', date: '3 ene 2020', ts: 20200103, type: 'Documento' },
  { id: 2, name: 'Foto del cumpleaños', ext: 'jpg', icon: '🖼️', iconBg: '#EEEDFE', date: '15 mar 2021', ts: 20210315, type: 'Imagen' },
  { id: 3, name: 'Canción favorita', ext: 'mp3', icon: '🎵', iconBg: '#FAECE7', date: '2 jul 2019', ts: 20190702, type: 'Audio' },
  { id: 4, name: 'Video de vacaciones', ext: 'mp4', icon: '🎬', iconBg: '#F5C4B3', date: '28 ago 2022', ts: 20220828, type: 'Video' },
  { id: 5, name: 'Proyecto de ciencias', ext: 'pptx', icon: '📊', iconBg: '#FAEEDA', date: '10 feb 2023', ts: 20230210, type: 'Presentación' },
  { id: 6, name: 'Lista de libros', ext: 'txt', icon: '📝', iconBg: '#E1F5EE', date: '5 may 2018', ts: 20180505, type: 'Texto' },
  { id: 7, name: 'Dibujo del dinosaurio', ext: 'png', icon: '🦕', iconBg: '#EAF3DE', date: '20 nov 2021', ts: 20211120, type: 'Imagen' },
  { id: 8, name: 'Receta de galletas', ext: 'pdf', icon: '🍪', iconBg: '#FCEBEB', date: '1 sep 2020', ts: 20200901, type: 'PDF' },
  { id: 9, name: 'Mapa del tesoro', ext: 'jpg', icon: '🗺️', iconBg: '#FBEAF0', date: '14 jun 2017', ts: 20170614, type: 'Imagen' },
  { id: 10, name: 'Plan de la feria', ext: 'docx', icon: '🎡', iconBg: '#E6F1FB', date: '7 abr 2024', ts: 20240407, type: 'Documento' },
];

const correctOrder = FILES.slice().sort((a, b) => a.ts - b.ts).map(file => file.id);

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function DriveFileSorter() {
  const [order, setOrder] = useState<number[]>(() => shuffle(FILES.map(file => file.id)));
  const [dragSrc, setDragSrc] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [stars, setStars] = useState(0);
  const [message, setMessage] = useState('Arrastra cada fila arriba o abajo para ordenar por fecha.');

  const correctOrder = FILES.slice().sort((a, b) => a.ts - b.ts).map(file => file.id);

  const fileById = (id: number) => FILES.find(file => file.id === id)!;

  const resetGame = () => {
    setOrder(shuffle(FILES.map(file => file.id)));
    setChecked(false);
    setStars(0);
    setMessage('Arrastra cada fila arriba o abajo para ordenar por fecha.');
  };

  const checkOrder = () => {
    setChecked(true);
    let correctCount = 0;

    order.forEach((id, idx) => {
      if (correctOrder[idx] === id) correctCount += 1;
    });

    setStars(correctCount);

    if (correctCount === FILES.length) {
      setMessage('🎉 ¡Perfecto! Ordenaste todos los archivos por fecha correctamente. ¡Eres un experto de Drive!');
    } else if (correctCount >= 6) {
      setMessage(`⭐ ¡Muy bien! Tienes ${correctCount} de 10 archivos en el lugar correcto. Las rojas están mal — ¡inténtalo!`);
    } else {
      setMessage(`😅 Solo ${correctCount} correctos. Fíjate bien en las fechas y vuelve a intentarlo. ¡Tú puedes!`);
    }
  };

  const showHint = () => {
    const oldest = fileById(correctOrder[0]);
    const newest = fileById(correctOrder[correctOrder.length - 1]);
    setMessage(`💡 Pista: el archivo más antiguo es "${oldest.name}.${oldest.ext}" (${oldest.date}) y el más reciente es "${newest.name}.${newest.ext}" (${newest.date}).`);
  };

  const onDrop = (destIndex: number) => {
    if (dragSrc === null || dragSrc === destIndex) return;
    setOrder(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(dragSrc, 1);
      copy.splice(destIndex, 0, moved);
      return copy;
    });
    setChecked(false);
    setStars(0);
    setMessage('Arrastra cada fila arriba o abajo para ordenar por fecha.');
  };

  return (
    <div>
      <style>{`
        .drive-sorter-scoped .drive{background:var(--color-background-tertiary);min-height:600px}
        .drive-sorter-scoped .topbar{background:var(--color-background-primary);border-bottom:0.5px solid var(--color-border-tertiary);padding:10px 16px;display:flex;align-items:center;gap:12px}
        .drive-sorter-scoped .logo{display:flex;align-items:center;gap:7px;font-size:17px;font-weight:500;color:var(--color-text-primary)}
        .drive-sorter-scoped .logo-icon{width:28px;height:28px;border-radius:6px;background:#E6F1FB;display:flex;align-items:center;justify-content:center}
        .drive-sorter-scoped .search-fake{flex:1;height:36px;background:var(--color-background-secondary);border-radius:20px;border:0.5px solid var(--color-border-tertiary);display:flex;align-items:center;padding:0 12px;gap:8px;font-size:13px;color:var(--color-text-tertiary)}
        .drive-sorter-scoped .avatar{width:32px;height:32px;border-radius:50%;background:#EEEDFE;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:500;color:#3C3489}
        .drive-sorter-scoped .sidebar{width:200px;float:left;padding:12px 8px;display:flex;flex-direction:column;gap:2px}
        .drive-sorter-scoped .sb-item{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:20px;font-size:13px;color:var(--color-text-secondary);cursor:pointer;margin:0}
        .drive-sorter-scoped .sb-item.active{background:#E6F1FB;color:#0C447C;font-weight:500}
        .drive-sorter-scoped .sb-item i{font-size:17px}
        .drive-sorter-scoped .main{margin-left:200px;padding:16px 20px;min-height:560px}
        .drive-sorter-scoped .challenge-bar{background:var(--color-background-warning);border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-lg);padding:10px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        .drive-sorter-scoped .cb-text{font-size:13px;color:var(--color-text-warning);flex:1}
        .drive-sorter-scoped .cb-score{font-size:13px;font-weight:500;color:var(--color-text-warning)}
        .drive-sorter-scoped .toolbar{display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap}
        .drive-sorter-scoped .tb-btn{display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:20px;border:0.5px solid var(--color-border-secondary);background:var(--color-background-primary);font-size:12px;color:var(--color-text-primary);cursor:pointer;font-family:inherit;transition:background .15s}
        .drive-sorter-scoped .tb-btn:hover{background:var(--color-background-secondary)}
        .drive-sorter-scoped .tb-btn i{font-size:15px}
        .drive-sorter-scoped .tb-btn.primary{background:#E6F1FB;color:#0C447C;border-color:#B5D4F4}
        .drive-sorter-scoped .tb-btn.primary:hover{background:#B5D4F4}
        .drive-sorter-scoped .col-header{display:grid;grid-template-columns:2fr 1fr 1fr 80px;padding:4px 10px;font-size:11px;font-weight:500;color:var(--color-text-secondary);letter-spacing:.04em;border-bottom:0.5px solid var(--color-border-tertiary);margin-bottom:4px}
        .drive-sorter-scoped .file-list{display:flex;flex-direction:column;gap:2px}
        .drive-sorter-scoped .file-row{display:grid;grid-template-columns:2fr 1fr 1fr 80px;align-items:center;padding:7px 10px;border-radius:var(--border-radius-md);border:1.5px solid transparent;background:var(--color-background-primary);cursor:grab;transition:background .12s,border-color .12s;user-select:none;margin:0}
        .drive-sorter-scoped .file-row:hover{background:var(--color-background-secondary)}
        .drive-sorter-scoped .file-row.dragging{opacity:.4}
        .drive-sorter-scoped .file-row.drag-over{border-color:#185FA5;background:#E6F1FB}
        .drive-sorter-scoped .file-row.correct{border-color:#1D9E75;background:#E1F5EE}
        .drive-sorter-scoped .file-row.wrong{border-color:#E24B4A;background:#FCEBEB;animation:shake .3s}
        .drive-sorter-scoped .file-name{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--color-text-primary);min-width:0}
        .drive-sorter-scoped .file-name span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .drive-sorter-scoped .file-icon{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:15px}
        .drive-sorter-scoped .file-date{font-size:12px;color:var(--color-text-secondary)}
        .drive-sorter-scoped .file-type{font-size:11px;color:var(--color-text-tertiary)}
        .drive-sorter-scoped .file-action{display:flex;justify-content:flex-end}
        .drive-sorter-scoped .pos-badge{width:22px;height:22px;border-radius:50%;background:var(--color-background-secondary);font-size:11px;font-weight:500;display:flex;align-items:center;justify-content:center;color:var(--color-text-secondary)}
        .drive-sorter-scoped .pos-badge.ok{background:var(--color-background-success);color:var(--color-text-success)}
        .drive-sorter-scoped .pos-badge.bad{background:var(--color-background-danger);color:var(--color-text-danger)}
        .drive-sorter-scoped .result-wrap{margin-top:16px;padding:14px 16px;border-radius:var(--border-radius-lg);font-size:14px;font-weight:500;text-align:center;display:none}
        .drive-sorter-scoped .result-wrap.show{display:block}
        .drive-sorter-scoped .result-wrap.win{background:var(--color-background-success);color:var(--color-text-success)}
        .drive-sorter-scoped .result-wrap.partial{background:var(--color-background-warning);color:var(--color-text-warning)}
        .drive-sorter-scoped .result-wrap.lose{background:var(--color-background-danger);color:var(--color-text-danger)}
        .drive-sorter-scoped .bottom-bar{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;align-items:center}
      `}</style>
      <div className="drive-sorter-scoped">

      <div className="drive">
        <div className="topbar">
          <div className="logo">
            <div className="logo-icon">📁</div>
            Mi Drive
          </div>
          <div className="search-fake">🔎 Buscar archivos...</div>
          <div className="avatar">👦</div>
        </div>

        <div style={{ display: 'flex' }}>
          <div className="sidebar">
            <div className="sb-item active">Mi Drive</div>
            <div className="sb-item">Compartidos</div>
            <div className="sb-item">Recientes</div>
            <div className="sb-item">Destacados</div>
            <div className="sb-item">Papelera</div>
            <div style={{ borderTop: '0.5px solid var(--color-border-tertiary)', margin: '8px 0' }} />
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', padding: '4px 10px' }}>Almacenamiento</div>
            <div style={{ margin: '4px 10px', height: 6, background: 'var(--color-background-secondary)', borderRadius: 3 }}>
              <div style={{ width: '42%', height: '100%', background: '#378ADD', borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', padding: '2px 10px' }}>6,3 GB de 15 GB</div>
          </div>

          <div className="main">
            <div className="challenge-bar">
              <div className="cb-text"><strong>Reto:</strong> Arrastra los archivos para ordenarlos del más antiguo al más reciente</div>
              <div className="cb-score">⭐ <span>{stars}</span> / 10</div>
            </div>

            <div className="toolbar">
              <button className="tb-btn primary" type="button" onClick={checkOrder}>Verificar orden</button>
              <button className="tb-btn" type="button" onClick={resetGame}>Revolver</button>
              <button className="tb-btn" type="button" onClick={showHint}>Pista</button>
              <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                Del más antiguo al más reciente
              </div>
            </div>

            <div className="col-header">
              <div>Nombre</div>
              <div>Fecha</div>
              <div>Tipo</div>
              <div style={{ textAlign: 'right' }}>Pos.</div>
            </div>

            <div className="file-list">
              {order.map((id, idx) => {
                const file = fileById(id);
                const correct = checked && correctOrder[idx] === id;
                const wrong = checked && correctOrder[idx] !== id;
                return (
                  <div
                    key={file.id}
                    className={`file-row${correct ? ' correct' : ''}${wrong ? ' wrong' : ''}`}
                    draggable
                    onDragStart={() => setDragSrc(idx)}
                    onDragEnd={() => setDragSrc(null)}
                    onDragOver={e => { e.preventDefault(); }}
                    onDrop={e => { e.preventDefault(); onDrop(idx); }}
                  >
                    <div className="file-name">
                      <div className="file-icon" style={{ background: file.iconBg }}>{file.icon}</div>
                      <span>{`${file.name}.${file.ext}`}</span>
                    </div>
                    <div className="file-date">{file.date}</div>
                    <div className="file-type">{file.type}</div>
                    <div className="file-action">
                      <div className={`pos-badge${correct ? ' ok' : wrong ? ' bad' : ''}`}>
                        {checked ? (correct ? '✓' : '✗') : idx + 1}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`result-wrap${checked ? ' show' : ''} ${stars === FILES.length ? ' win' : stars >= 6 ? ' partial' : ' lose'}`}>
              {message}
            </div>

            <div className="bottom-bar">
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                Arrastra cada fila arriba o abajo para reordenarla
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
