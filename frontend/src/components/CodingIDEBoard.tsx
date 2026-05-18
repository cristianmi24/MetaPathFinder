import { useState, useCallback, useEffect, useRef } from 'react';
import './CodingIDEBoard.css';

interface BlankDef {
  id: string;
  placeholder?: string;
  width?: number;
  answer: string;
  hint: string;
}

interface CodeLine {
  type: 'plain';
  html: string;
}

interface ConsoleEntry {
  type: 'info' | 'out' | 'ok' | 'err' | 'warn';
  text: string;
}

interface Exercise {
  title: string;
  desc: string;
  tags: string[];
  code: CodeLine[];
  blanks: BlankDef[];
  validate: (vals: Record<string, string>) => boolean;
  run: (vals: Record<string, string>) => { ok: boolean; output: ConsoleEntry[] };
}

interface ChallengeConfig {
  filename: string;
  icon: string;
  exercises: Exercise[];
}

function renderCodeLine(html: string, blanks: BlankDef[], values: Record<string, string>, states: Record<string, string>, disabled: boolean, onChange: (id: string, val: string) => void): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = html;
  let key = 0;

  while (remaining.length > 0) {
    let earliestIdx = -1;
    let earliestId = '';

    for (const b of blanks) {
      const marker = `__BLANK_${b.id}__`;
      const idx = remaining.indexOf(marker);
      if (idx !== -1 && (earliestIdx === -1 || idx < earliestIdx)) {
        earliestIdx = idx;
        earliestId = b.id;
      }
    }

    if (earliestIdx === -1) {
      parts.push(<span key={key++} dangerouslySetInnerHTML={{ __html: remaining }} />);
      break;
    }

    const before = remaining.slice(0, earliestIdx);
    if (before) {
      parts.push(<span key={key++} dangerouslySetInnerHTML={{ __html: before }} />);
    }

    const blankDef = blanks.find(b => b.id === earliestId);
    const state = states[earliestId] || 'empty';
    const val = values[earliestId] || '';
    const stateClass = state === 'correct' ? 'correct' : state === 'incorrect' ? 'incorrect' : '';

    parts.push(
      <input
        key={key++}
        className={`cib-blank-input ${stateClass}`}
        placeholder={blankDef?.placeholder || '?'}
        style={{ width: blankDef?.width || 60 }}
        value={val}
        disabled={disabled}
        onChange={(e) => onChange(earliestId, e.target.value)}
        data-hint={blankDef?.hint || ''}
      />
    );

    remaining = remaining.slice(earliestIdx + `__BLANK_${earliestId}__`.length);
  }

  return <>{parts}</>;
}

const CHALLENGES: Record<string, ChallengeConfig> = {
  'RA-C2-N1': {
    filename: 'api_notas.py',
    icon: '🐍',
    exercises: [
      {
        title: 'Ejercicio 1: Ruta GET /estudiantes',
        desc: 'Completa el endpoint GET que retorna la lista de estudiantes en formato JSON.',
        tags: ['cib-hint-logic', 'Lógica', 'cib-hint-syntax', 'Sintaxis'],
        blanks: [
          { id: 'a1', placeholder: 'método HTTP...', width: 80, answer: '"GET"', hint: 'Revisa qué método HTTP se usa para consultar' },
          { id: 'a2', placeholder: 'respuesta JSON...', width: 220, answer: 'jsonify(estudiantes)', hint: 'Usa la función que convierte a JSON' },
        ],
        code: [
          { type: 'plain', html: '<span class="cib-cm"># API REST — Sistema de Notas</span>' },
          { type: 'plain', html: '<span class="cib-kw">from</span> flask <span class="cib-kw">import</span> Flask, <span class="cib-fn">jsonify</span>, <span class="cib-var">request</span>' },
          { type: 'plain', html: '<span class="cib-var">app</span> <span class="cib-op">=</span> <span class="cib-fn">Flask</span>(<span class="cib-str">__name__</span>)' },
          { type: 'plain', html: '<span class="cib-var">estudiantes</span> <span class="cib-op">=</span> []  <span class="cib-cm"># lista en memoria</span>' },
          { type: 'plain', html: '' },
          { type: 'plain', html: '<span class="cib-op">@</span><span class="cib-var">app</span>.<span class="cib-fn">route</span>(<span class="cib-str">"/estudiantes"</span>, methods<span class="cib-op">=</span>[__BLANK_a1__])' },
          { type: 'plain', html: '<span class="cib-kw">def</span> <span class="cib-fn">listar_estudiantes</span>()<span class="cib-op">:</span>' },
          { type: 'plain', html: '    <span class="cib-kw">return</span> __BLANK_a2__, <span class="cib-num">200</span>' },
        ],
        validate: (vals) => {
          const v1 = vals.a1?.trim().replace(/\s+/g, ' ') || '';
          const v2 = vals.a2?.trim().replace(/\s+/g, ' ') || '';
          return v1 === '"GET"' && v2 === 'jsonify(estudiantes)';
        },
        run: (vals) => {
          const v1 = vals.a1?.trim().replace(/\s+/g, ' ') || '';
          const v2 = vals.a2?.trim().replace(/\s+/g, ' ') || '';
          if (v1 === '"GET"' && v2 === 'jsonify(estudiantes)') {
            return { ok: true, output: [
              { type: 'info', text: '>>> python api_notas.py' },
              { type: 'ok', text: '[]' },
              { type: 'ok', text: 'GET /estudiantes → 200 OK' }
            ]};
          }
          return { ok: false, output: [
            { type: 'info', text: '>>> python api_notas.py' },
            { type: 'err', text: 'Error: método HTTP o función de respuesta incorrectos' },
            { type: 'err', text: '--- Proceso terminado con código 1 ---' }
          ]};
        }
      },
      {
        title: 'Ejercicio 2: POST para crear estudiante',
        desc: 'Completa el endpoint POST que crea un estudiante desde JSON del body.',
        tags: ['cib-hint-syntax', 'Sintaxis', 'cib-hint-logic', 'HTTP'],
        blanks: [
          { id: 'b1', placeholder: 'método HTTP...', width: 80, answer: '"POST"', hint: 'Revisa qué método HTTP crea nuevos recursos' },
          { id: 'b2', placeholder: 'leer body...', width: 200, answer: 'request.get_json()', hint: 'Extrae el JSON del cuerpo de la petición' },
          { id: 'b3', placeholder: 'código...', width: 40, answer: '201', hint: 'Código HTTP de "recurso creado"' },
        ],
        code: [
          { type: 'plain', html: '<span class="cib-op">@</span><span class="cib-var">app</span>.<span class="cib-fn">route</span>(<span class="cib-str">"/estudiantes"</span>, methods<span class="cib-op">=</span>[__BLANK_b1__])' },
          { type: 'plain', html: '<span class="cib-kw">def</span> <span class="cib-fn">crear_estudiante</span>()<span class="cib-op">:</span>' },
          { type: 'plain', html: '    <span class="cib-var">datos</span> <span class="cib-op">=</span> __BLANK_b2__' },
          { type: 'plain', html: '    <span class="cib-var">e</span> <span class="cib-op">=</span> {<span class="cib-str">"id"</span>: <span class="cib-builtin">len</span>(<span class="cib-var">estudiantes</span>)<span class="cib-op">+</span><span class="cib-num">1</span>, <span class="cib-str">"nombre"</span>: <span class="cib-var">datos</span>[<span class="cib-str">"nombre"</span>], <span class="cib-str">"notas"</span>: []}' },
          { type: 'plain', html: '    <span class="cib-var">estudiantes</span>.<span class="cib-fn">append</span>(<span class="cib-var">e</span>)' },
          { type: 'plain', html: '    <span class="cib-kw">return</span> <span class="cib-fn">jsonify</span>(<span class="cib-var">e</span>), __BLANK_b3__' },
        ],
        validate: (vals) => {
          const v1 = vals.b1?.trim().replace(/\s+/g, ' ') || '';
          const v2 = vals.b2?.trim().replace(/\s+/g, ' ') || '';
          const v3 = vals.b3?.trim() || '';
          return v1 === '"POST"' && v2 === 'request.get_json()' && v3 === '201';
        },
        run: (vals) => {
          const v1 = vals.b1?.trim().replace(/\s+/g, ' ') || '';
          const v2 = vals.b2?.trim().replace(/\s+/g, ' ') || '';
          const v3 = vals.b3?.trim() || '';
          if (v1 === '"POST"' && v2 === 'request.get_json()' && v3 === '201') {
            return { ok: true, output: [
              { type: 'info', text: '>>> python api_notas.py' },
              { type: 'ok', text: '{"id":1,"nombre":"Luis","notas":[]}' },
              { type: 'ok', text: 'POST /estudiantes → 201 Created' }
            ]};
          }
          return { ok: false, output: [
            { type: 'info', text: '>>> python api_notas.py' },
            { type: 'err', text: 'Error: método, lectura de body o código de creación incorrectos' },
            { type: 'err', text: '--- Proceso terminado con código 1 ---' }
          ]};
        }
      },
      {
        title: 'Ejercicio 3: GET por ID con manejo 404',
        desc: 'Completa el endpoint que busca un estudiante por ID y retorna 404 si no existe.',
        tags: ['cib-hint-syntax', 'Sintaxis', 'cib-hint-logic', 'Errores'],
        blanks: [
          { id: 'c1', placeholder: 'parámetro...', width: 100, answer: '<int:id>', hint: 'Define un parámetro numérico en la ruta' },
          { id: 'c2', placeholder: '{"error": "..."}', width: 340, answer: '{"error": "Estudiante no encontrado"}', hint: 'Mensaje de error cuando no hay resultados' },
          { id: 'c3', placeholder: 'código...', width: 40, answer: '404', hint: 'Código HTTP estándar para "no encontrado"' },
        ],
        code: [
          { type: 'plain', html: '<span class="cib-op">@</span><span class="cib-var">app</span>.<span class="cib-fn">route</span>(<span class="cib-str">"/estudiantes/"</span>__BLANK_c1__)' },
          { type: 'plain', html: '<span class="cib-kw">def</span> <span class="cib-fn">obtener_estudiante</span>(<span class="cib-var">id</span>)<span class="cib-op">:</span>' },
          { type: 'plain', html: '    <span class="cib-kw">for</span> <span class="cib-var">e</span> <span class="cib-kw">in</span> <span class="cib-var">estudiantes</span><span class="cib-op">:</span>' },
          { type: 'plain', html: '        <span class="cib-kw">if</span> <span class="cib-var">e</span>[<span class="cib-str">"id"</span>] <span class="cib-op">==</span> <span class="cib-var">id</span><span class="cib-op">:</span>' },
          { type: 'plain', html: '            <span class="cib-kw">return</span> <span class="cib-fn">jsonify</span>(<span class="cib-var">e</span>)' },
          { type: 'plain', html: '    <span class="cib-kw">return</span> <span class="cib-fn">jsonify</span>(__BLANK_c2__), __BLANK_c3__' },
        ],
        validate: (vals) => {
          const v1 = vals.c1?.trim().replace(/\s+/g, ' ') || '';
          const v2 = vals.c2?.trim().replace(/\s+/g, ' ') || '';
          const v3 = vals.c3?.trim() || '';
          return v1 === '<int:id>' && v2.includes('error') && v3 === '404';
        },
        run: (vals) => {
          const v1 = vals.c1?.trim().replace(/\s+/g, ' ') || '';
          const v2 = vals.c2?.trim().replace(/\s+/g, ' ') || '';
          const v3 = vals.c3?.trim() || '';
          if (v1 === '<int:id>' && v2.includes('error') && v3 === '404') {
            return { ok: true, output: [
              { type: 'info', text: '>>> python api_notas.py' },
              { type: 'ok', text: '{"error": "Estudiante no encontrado"}' },
              { type: 'ok', text: 'GET /estudiantes/999 → 404 Not Found' }
            ]};
          }
          return { ok: false, output: [
            { type: 'info', text: '>>> python api_notas.py' },
            { type: 'err', text: 'Error: parámetro de ruta o código de error incorrectos' },
            { type: 'err', text: '--- Proceso terminado con código 1 ---' }
          ]};
        }
      }
    ]
  },
  'RA-C2-N2': {
    filename: 'dashboard.py',
    icon: '🐍',
    exercises: [
      {
        title: 'Ejercicio 1: Cargar datos con Pandas',
        desc: 'Completa el código que carga un CSV y muestra sus primeras filas y estadísticas.',
        tags: ['cib-hint-syntax', 'Sintaxis', 'cib-hint-scope', 'Pandas'],
        blanks: [
          { id: 'd0', placeholder: 'función de carga...', width: 240, answer: 'pd.read_csv("datos.csv")', hint: 'Usa la función de Pandas para leer archivos CSV' },
          { id: 'd1', placeholder: '.método()...', width: 120, answer: '.describe()', hint: 'Método que resume estadísticamente los datos numéricos' },
        ],
        code: [
          { type: 'plain', html: '<span class="cib-cm"># Dashboard — Carga de datos</span>' },
          { type: 'plain', html: '<span class="cib-kw">import</span> pandas <span class="cib-kw">as</span> <span class="cib-var">pd</span>' },
          { type: 'plain', html: '<span class="cib-var">df</span> <span class="cib-op">=</span> __BLANK_d0__' },
          { type: 'plain', html: '<span class="cib-builtin">print</span>(<span class="cib-var">df</span>.<span class="cib-fn">head</span>())' },
          { type: 'plain', html: '<span class="cib-builtin">print</span>(<span class="cib-var">df</span>__BLANK_d1__)' },
        ],
        validate: (vals) => {
          const v0 = vals.d0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.d1?.trim() || '';
          return v0.includes('read_csv') && v1 === '.describe()';
        },
        run: (vals) => {
          const v0 = vals.d0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.d1?.trim() || '';
          if (v0.includes('read_csv') && v1 === '.describe()') {
            return { ok: true, output: [
              { type: 'info', text: '>>> python dashboard.py' },
              { type: 'ok', text: '   departamento  ano  matriculados' },
              { type: 'ok', text: '0    Antioquia  2020       45230' },
              { type: 'ok', text: '--- describe ---' },
              { type: 'ok', text: 'mean      41500.5' },
              { type: 'ok', text: '--- Proceso terminado con código 0 ---' }
            ]};
          }
          return { ok: false, output: [
            { type: 'info', text: '>>> python dashboard.py' },
            { type: 'err', text: 'Error: función de carga o método de estadísticas incorrectos' },
            { type: 'err', text: '--- Proceso terminado con código 1 ---' }
          ]};
        }
      },
      {
        title: 'Ejercicio 2: Gráfico de barras con Plotly',
        desc: 'Completa el código que crea un gráfico de barras interactivo con Plotly Express.',
        tags: ['cib-hint-syntax', 'Sintaxis', 'cib-hint-scope', 'Plotly'],
        blanks: [
          { id: 'e0', placeholder: 'función plotly...', width: 100, answer: 'px.bar', hint: 'Función de Plotly Express para gráfico de barras' },
          { id: 'e1', placeholder: 'ejes del gráfico...', width: 360, answer: 'x="departamento", y="matriculados"', hint: 'Define las columnas para los ejes X y Y' },
        ],
        code: [
          { type: 'plain', html: '<span class="cib-cm"># Dashboard — Visualización</span>' },
          { type: 'plain', html: '<span class="cib-kw">import</span> plotly.express <span class="cib-kw">as</span> <span class="cib-var">px</span>' },
          { type: 'plain', html: '<span class="cib-var">fig</span> <span class="cib-op">=</span> __BLANK_e0__(<span class="cib-var">df</span>, __BLANK_e1__, <span class="cib-builtin">title</span><span class="cib-op">=</span><span class="cib-str">"Matriculados por departamento"</span>)' },
          { type: 'plain', html: '<span class="cib-var">fig</span>.<span class="cib-fn">show</span>()' },
        ],
        validate: (vals) => {
          const v0 = vals.e0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.e1?.trim().replace(/\s+/g, ' ') || '';
          return v0 === 'px.bar' && v1.includes('matriculados');
        },
        run: (vals) => {
          const v0 = vals.e0?.trim().replace(/\s+/g, ' ') || '';
          if (v0 === 'px.bar') {
            return { ok: true, output: [
              { type: 'info', text: '>>> python dashboard.py' },
              { type: 'ok', text: '[Plotly] figure created with 5 bars' },
              { type: 'ok', text: '--- Proceso terminado con código 0 ---' }
            ]};
          }
          return { ok: false, output: [
            { type: 'info', text: '>>> python dashboard.py' },
            { type: 'err', text: 'Error: tipo de gráfico o nombres de ejes incorrectos' },
            { type: 'err', text: '--- Proceso terminado con código 1 ---' }
          ]};
        }
      },
      {
        title: 'Ejercicio 3: Filtro dinámico por año',
        desc: 'Completa el código que filtra datos por año para actualizar el dashboard.',
        tags: ['cib-hint-logic', 'Lógica', 'cib-hint-syntax', 'Filtros'],
        blanks: [
          { id: 'f0', placeholder: 'filtro con corchetes...', width: 340, answer: 'df[df["ano"] == ano_seleccionado]', hint: 'Usa notación de corchetes con condición booleana' },
          { id: 'f1', placeholder: 'suma de columna...', width: 280, answer: 'df_filtrado["matriculados"].sum()', hint: 'Selecciona la columna y aplica suma' },
        ],
        code: [
          { type: 'plain', html: '<span class="cib-cm"># Dashboard — Filtro dinámico</span>' },
          { type: 'plain', html: '<span class="cib-kw">def</span> <span class="cib-fn">filtrar_por_ano</span>(<span class="cib-var">df</span>, <span class="cib-var">ano_seleccionado</span>)<span class="cib-op">:</span>' },
          { type: 'plain', html: '    <span class="cib-var">df_filtrado</span> <span class="cib-op">=</span> __BLANK_f0__' },
          { type: 'plain', html: '    <span class="cib-var">kpi</span> <span class="cib-op">=</span> __BLANK_f1__' },
          { type: 'plain', html: '    <span class="cib-kw">return</span> <span class="cib-var">df_filtrado</span>, <span class="cib-var">kpi</span>' },
          { type: 'plain', html: '' },
          { type: 'plain', html: '<span class="cib-var">filtrado</span>, <span class="cib-var">total</span> <span class="cib-op">=</span> <span class="cib-fn">filtrar_por_ano</span>(<span class="cib-var">df</span>, <span class="cib-num">2021</span>)' },
          { type: 'plain', html: '<span class="cib-builtin">print</span>(<span class="cib-str">"KPI matriculados 2021:"</span>, <span class="cib-var">total</span>)' },
        ],
        validate: (vals) => {
          const v0 = vals.f0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.f1?.trim().replace(/\s+/g, ' ') || '';
          return v0.includes('[') && v0.includes('ano') && v1.includes('sum') && v1.includes('matriculados');
        },
        run: (vals) => {
          const v0 = vals.f0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.f1?.trim().replace(/\s+/g, ' ') || '';
          if (v0.includes('[') && v1.includes('sum')) {
            return { ok: true, output: [
              { type: 'info', text: '>>> python dashboard.py' },
              { type: 'ok', text: 'KPI matriculados 2021: 128500' },
              { type: 'ok', text: '--- Proceso terminado con código 0 ---' }
            ]};
          }
          return { ok: false, output: [
            { type: 'info', text: '>>> python dashboard.py' },
            { type: 'err', text: 'Error: filtro o agregación incorrectos' },
            { type: 'err', text: '--- Proceso terminado con código 1 ---' }
          ]};
        }
      }
    ]
  },
  'RA-C2-N3': {
    filename: 'chatbot.py',
    icon: '🐍',
    exercises: [
      {
        title: 'Ejercicio 1: Árbol de decisiones del chatbot',
        desc: 'Completa la lógica if/elif que clasifica intereses del estudiante.',
        tags: ['cib-hint-logic', 'Lógica', 'cib-hint-syntax', 'Sintaxis'],
        blanks: [
          { id: 'g0', placeholder: 'valor del interés...', width: 80, answer: '"salud"', hint: 'Valor que representa el área de salud' },
          { id: 'g1', placeholder: 'carrera...', width: 100, answer: '"Medicina"', hint: 'Carrera que corresponde al área de salud' },
          { id: 'g2', placeholder: 'condición compuesta...', width: 360, answer: '"tecnologia" and conocimientos_tecnicos', hint: 'Usa and para combinar dos condiciones' },
        ],
        code: [
          { type: 'plain', html: '<span class="cib-cm"># Chatbot — Árbol de decisiones</span>' },
          { type: 'plain', html: '<span class="cib-kw">def</span> <span class="cib-fn">recomendar_carrera</span>(<span class="cib-var">interes</span>, <span class="cib-var">conocimientos_tecnicos</span>)<span class="cib-op">:</span>' },
          { type: 'plain', html: '    <span class="cib-kw">if</span> <span class="cib-var">interes</span> <span class="cib-op">==</span> __BLANK_g0__<span class="cib-op">:</span>' },
          { type: 'plain', html: '        <span class="cib-kw">return</span> __BLANK_g1__' },
          { type: 'plain', html: '    <span class="cib-kw">elif</span> <span class="cib-var">interes</span> <span class="cib-op">==</span> __BLANK_g2__<span class="cib-op">:</span>' },
          { type: 'plain', html: '        <span class="cib-kw">return</span> <span class="cib-str">"Ingeniería de Sistemas"</span>' },
          { type: 'plain', html: '    <span class="cib-kw">else</span><span class="cib-op">:</span>' },
          { type: 'plain', html: '        <span class="cib-kw">return</span> <span class="cib-str">"Explora más opciones vocacionales"</span>' },
          { type: 'plain', html: '' },
          { type: 'plain', html: '<span class="cib-builtin">print</span>(<span class="cib-fn">recomendar_carrera</span>(<span class="cib-str">"salud"</span>, <span class="cib-cls">False</span>))' },
        ],
        validate: (vals) => {
          const v0 = vals.g0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.g1?.trim().replace(/\s+/g, ' ') || '';
          const v2 = vals.g2?.trim().replace(/\s+/g, ' ') || '';
          return v0 === '"salud"' && v1 === '"Medicina"' && v2.includes('tecnologia');
        },
        run: (vals) => {
          const v0 = vals.g0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.g1?.trim().replace(/\s+/g, ' ') || '';
          if (v0 === '"salud"' && v1 === '"Medicina"') {
            return { ok: true, output: [
              { type: 'info', text: '>>> python chatbot.py' },
              { type: 'ok', text: 'Medicina' },
              { type: 'ok', text: '--- Proceso terminado con código 0 ---' }
            ]};
          }
          return { ok: false, output: [
            { type: 'info', text: '>>> python chatbot.py' },
            { type: 'err', text: 'Error: condiciones o valores incorrectos en el árbol' },
            { type: 'err', text: '--- Proceso terminado con código 1 ---' }
          ]};
        }
      },
      {
        title: 'Ejercicio 2: Guardar sesión en JSON',
        desc: 'Completa la función que guarda la sesión del estudiante en un archivo JSON.',
        tags: ['cib-hint-syntax', 'Sintaxis', 'cib-hint-scope', 'Archivos'],
        blanks: [
          { id: 'h0', placeholder: 'escribir JSON...', width: 300, answer: 'json.dump(sesion, f, indent=4)', hint: 'Usa el módulo json para escribir en el archivo' },
          { id: 'h1', placeholder: 'modo apertura...', width: 40, answer: '"w"', hint: 'Modo de apertura para escritura de archivos' },
        ],
        code: [
          { type: 'plain', html: '<span class="cib-cm"># Chatbot — Guardar sesión</span>' },
          { type: 'plain', html: '<span class="cib-kw">import</span> <span class="cib-var">json</span>' },
          { type: 'plain', html: '<span class="cib-kw">def</span> <span class="cib-fn">guardar_sesion</span>(<span class="cib-var">sesion</span>)<span class="cib-op">:</span>' },
          { type: 'plain', html: '    <span class="cib-kw">with</span> <span class="cib-builtin">open</span>(<span class="cib-str">"sesion.json"</span>, __BLANK_h1__) <span class="cib-kw">as</span> <span class="cib-var">f</span><span class="cib-op">:</span>' },
          { type: 'plain', html: '        __BLANK_h0__' },
          { type: 'plain', html: '    <span class="cib-builtin">print</span>(<span class="cib-str">"Sesión guardada"</span>)' },
        ],
        validate: (vals) => {
          const v0 = vals.h0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.h1?.trim() || '';
          return v0.includes('json.dump') && (v1 === '"w"' || v1 === '"w"');
        },
        run: (vals) => {
          const v0 = vals.h0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.h1?.trim() || '';
          if (v0.includes('json.dump') && v1 === '"w"') {
            return { ok: true, output: [
              { type: 'info', text: '>>> python chatbot.py' },
              { type: 'ok', text: 'Sesión guardada' },
              { type: 'ok', text: '--- Archivo sesion.json creado ---' },
              { type: 'ok', text: '--- Proceso terminado con código 0 ---' }
            ]};
          }
          return { ok: false, output: [
            { type: 'info', text: '>>> python chatbot.py' },
            { type: 'err', text: 'Error: operación de archivo o formato incorrecto' },
            { type: 'err', text: '--- Proceso terminado con código 1 ---' }
          ]};
        }
      },
      {
        title: 'Ejercicio 3: Input y flujo de preguntas',
        desc: 'Completa el bucle que hace preguntas al usuario y acumula respuestas.',
        tags: ['cib-hint-logic', 'Lógica', 'cib-hint-syntax', 'Input'],
        blanks: [
          { id: 'i0', placeholder: 'función de entrada...', width: 280, answer: 'input("¿Qué área te gusta? ")', hint: 'Función que captura texto del usuario' },
          { id: 'i1', placeholder: 'agregar a lista...', width: 240, answer: 'respuestas.append(respuesta)', hint: 'Agrega cada respuesta a la lista' },
        ],
        code: [
          { type: 'plain', html: '<span class="cib-cm"># Chatbot — Flujo de preguntas</span>' },
          { type: 'plain', html: '<span class="cib-var">preguntas</span> <span class="cib-op">=</span> [<span class="cib-str">"¿Te gusta la tecnología?"</span>, <span class="cib-str">"¿Prefieres trabajar en equipo?"</span>]' },
          { type: 'plain', html: '<span class="cib-var">respuestas</span> <span class="cib-op">=</span> []' },
          { type: 'plain', html: '<span class="cib-kw">for</span> <span class="cib-var">p</span> <span class="cib-kw">in</span> <span class="cib-var">preguntas</span><span class="cib-op">:</span>' },
          { type: 'plain', html: '    <span class="cib-var">respuesta</span> <span class="cib-op">=</span> __BLANK_i0__' },
          { type: 'plain', html: '    __BLANK_i1__' },
          { type: 'plain', html: '<span class="cib-builtin">print</span>(<span class="cib-str">"Tus respuestas:"</span>, <span class="cib-var">respuestas</span>)' },
        ],
        validate: (vals) => {
          const v0 = vals.i0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.i1?.trim().replace(/\s+/g, ' ') || '';
          return v0.includes('input') && v1.includes('append');
        },
        run: (vals) => {
          const v0 = vals.i0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.i1?.trim().replace(/\s+/g, ' ') || '';
          if (v0.includes('input') && v1.includes('append')) {
            return { ok: true, output: [
              { type: 'info', text: '>>> python chatbot.py' },
              { type: 'ok', text: 'Tus respuestas: ["sí", "no"]' },
              { type: 'ok', text: '--- Proceso terminado con código 0 ---' }
            ]};
          }
          return { ok: false, output: [
            { type: 'info', text: '>>> python chatbot.py' },
            { type: 'err', text: 'Error: función de captura o método de lista incorrectos' },
            { type: 'err', text: '--- Proceso terminado con código 1 ---' }
          ]};
        }
      }
    ]
  },
  'RA-C3-N2': {
    filename: 'modelo_ml.py',
    icon: '🐍',
    exercises: [
      {
        title: 'Ejercicio 1: Análisis exploratorio (EDA)',
        desc: 'Completa el código que carga y explora el dataset de estudiantes.',
        tags: ['cib-hint-syntax', 'Sintaxis', 'cib-hint-scope', 'Pandas'],
        blanks: [
          { id: 'j0', placeholder: 'función de carga...', width: 280, answer: 'pd.read_csv("estudiantes.csv")', hint: 'Usa la función de Pandas para leer CSV' },
          { id: 'j1', placeholder: 'conteo de valores...', width: 240, answer: 'df["riesgo"].value_counts()', hint: 'Cuenta cuántos estudiantes hay por categoría de riesgo' },
        ],
        code: [
          { type: 'plain', html: '<span class="cib-cm"># ML — Análisis exploratorio</span>' },
          { type: 'plain', html: '<span class="cib-kw">import</span> pandas <span class="cib-kw">as</span> <span class="cib-var">pd</span>' },
          { type: 'plain', html: '<span class="cib-var">df</span> <span class="cib-op">=</span> __BLANK_j0__' },
          { type: 'plain', html: '<span class="cib-builtin">print</span>(<span class="cib-var">df</span>.<span class="cib-fn">info</span>())' },
          { type: 'plain', html: '<span class="cib-builtin">print</span>(__BLANK_j1__)' },
        ],
        validate: (vals) => {
          const v0 = vals.j0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.j1?.trim().replace(/\s+/g, ' ') || '';
          return v0.includes('read_csv') && v1.includes('value_counts');
        },
        run: (vals) => {
          const v0 = vals.j0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.j1?.trim().replace(/\s+/g, ' ') || '';
          if (v0.includes('read_csv') && v1.includes('value_counts')) {
            return { ok: true, output: [
              { type: 'info', text: '>>> python modelo_ml.py' },
              { type: 'ok', text: '<class pandas.DataFrame>' },
              { type: 'ok', text: 'RangeIndex: 500 entries' },
              { type: 'ok', text: 'riesgo' },
              { type: 'ok', text: 'bajo    200' },
              { type: 'ok', text: 'medio   180' },
              { type: 'ok', text: 'alto    120' },
              { type: 'ok', text: '--- Proceso terminado con código 0 ---' }
            ]};
          }
          return { ok: false, output: [
            { type: 'info', text: '>>> python modelo_ml.py' },
            { type: 'err', text: 'Error: función de carga o conteo incorrectos' },
            { type: 'err', text: '--- Proceso terminado con código 1 ---' }
          ]};
        }
      },
      {
        title: 'Ejercicio 2: Entrenar modelo con scikit-learn',
        desc: 'Completa el código que divide datos y entrena un árbol de decisión.',
        tags: ['cib-hint-logic', 'Lógica', 'cib-hint-syntax', 'ML'],
        blanks: [
          { id: 'k0', placeholder: 'dividir datos...', width: 340, answer: 'train_test_split(X, y, test_size=0.2)', hint: 'Divide el conjunto en entrenamiento y prueba' },
          { id: 'k1', placeholder: 'crear modelo...', width: 240, answer: 'DecisionTreeClassifier()', hint: 'Crea el clasificador importado de sklearn.tree' },
          { id: 'k2', placeholder: 'entrenar...', width: 220, answer: '.fit(X_train, y_train)', hint: 'Llama al método que entrena con los datos de entrenamiento' },
        ],
        code: [
          { type: 'plain', html: '<span class="cib-cm"># ML — Entrenar modelo</span>' },
          { type: 'plain', html: '<span class="cib-kw">from</span> sklearn.model_selection <span class="cib-kw">import</span> <span class="cib-fn">train_test_split</span>' },
          { type: 'plain', html: '<span class="cib-kw">from</span> sklearn.tree <span class="cib-kw">import</span> <span class="cib-fn">DecisionTreeClassifier</span>' },
          { type: 'plain', html: '<span class="cib-var">X</span> <span class="cib-op">=</span> <span class="cib-var">df</span>[[<span class="cib-str">"nota_promedio"</span>, <span class="cib-str">"inasistencia"</span>, <span class="cib-str">"estrato"</span>]]' },
          { type: 'plain', html: '<span class="cib-var">y</span> <span class="cib-op">=</span> <span class="cib-var">df</span>[<span class="cib-str">"riesgo"</span>]' },
          { type: 'plain', html: '<span class="cib-var">X_train</span>, <span class="cib-var">X_test</span>, <span class="cib-var">y_train</span>, <span class="cib-var">y_test</span> <span class="cib-op">=</span> __BLANK_k0__' },
          { type: 'plain', html: '<span class="cib-var">modelo</span> <span class="cib-op">=</span> __BLANK_k1__' },
          { type: 'plain', html: '<span class="cib-var">modelo</span>__BLANK_k2__' },
          { type: 'plain', html: '<span class="cib-builtin">print</span>(<span class="cib-str">"Modelo entrenado exitosamente"</span>)' },
        ],
        validate: (vals) => {
          const v0 = vals.k0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.k1?.trim().replace(/\s+/g, ' ') || '';
          const v2 = vals.k2?.trim().replace(/\s+/g, ' ') || '';
          return v0.includes('train_test_split') && v1.includes('DecisionTreeClassifier') && v2.includes('.fit');
        },
        run: (vals) => {
          const v0 = vals.k0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.k1?.trim().replace(/\s+/g, ' ') || '';
          const v2 = vals.k2?.trim().replace(/\s+/g, ' ') || '';
          if (v0.includes('train_test_split') && v1.includes('DecisionTreeClassifier') && v2.includes('.fit')) {
            return { ok: true, output: [
              { type: 'info', text: '>>> python modelo_ml.py' },
              { type: 'ok', text: 'Modelo entrenado exitosamente' },
              { type: 'ok', text: '--- Proceso terminado con código 0 ---' }
            ]};
          }
          return { ok: false, output: [
            { type: 'info', text: '>>> python modelo_ml.py' },
            { type: 'err', text: 'Error: división de datos, modelo o entrenamiento incorrectos' },
            { type: 'err', text: '--- Proceso terminado con código 1 ---' }
          ]};
        }
      },
      {
        title: 'Ejercicio 3: Evaluar métricas del modelo',
        desc: 'Completa el código que evalúa precisión y reporta métricas.',
        tags: ['cib-hint-logic', 'Lógica', 'cib-hint-syntax', 'Métricas'],
        blanks: [
          { id: 'l0', placeholder: 'predecir...', width: 160, answer: '.predict(X_test)', hint: 'Genera predicciones sobre los datos de prueba' },
          { id: 'l1', placeholder: 'calcular exactitud...', width: 340, answer: 'accuracy_score(y_test, predicciones)', hint: 'Compara predicciones con valores reales' },
        ],
        code: [
          { type: 'plain', html: '<span class="cib-cm"># ML — Evaluación</span>' },
          { type: 'plain', html: '<span class="cib-kw">from</span> sklearn.metrics <span class="cib-kw">import</span> <span class="cib-fn">accuracy_score</span>, <span class="cib-fn">classification_report</span>' },
          { type: 'plain', html: '<span class="cib-var">predicciones</span> <span class="cib-op">=</span> <span class="cib-var">modelo</span>__BLANK_l0__' },
          { type: 'plain', html: '<span class="cib-var">precision</span> <span class="cib-op">=</span> __BLANK_l1__' },
          { type: 'plain', html: '<span class="cib-builtin">print</span>(<span class="cib-str">"Precisión:"</span>, <span class="cib-var">precision</span>)' },
          { type: 'plain', html: '<span class="cib-builtin">print</span>(<span class="cib-fn">classification_report</span>(<span class="cib-var">y_test</span>, <span class="cib-var">predicciones</span>))' },
        ],
        validate: (vals) => {
          const v0 = vals.l0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.l1?.trim().replace(/\s+/g, ' ') || '';
          return v0.includes('.predict') && v1.includes('accuracy_score');
        },
        run: (vals) => {
          const v0 = vals.l0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.l1?.trim().replace(/\s+/g, ' ') || '';
          if (v0.includes('.predict') && v1.includes('accuracy_score')) {
            return { ok: true, output: [
              { type: 'info', text: '>>> python modelo_ml.py' },
              { type: 'ok', text: 'Precisión: 0.85' },
              { type: 'ok', text: '--- Proceso terminado con código 0 ---' }
            ]};
          }
          return { ok: false, output: [
            { type: 'info', text: '>>> python modelo_ml.py' },
            { type: 'err', text: 'Error: método de predicción o métrica incorrectos' },
            { type: 'err', text: '--- Proceso terminado con código 1 ---' }
          ]};
        }
      }
    ]
  },
  'RA-C3-N3': {
    filename: 'app_inventor.txt',
    icon: '📱',
    exercises: [
      {
        title: 'Ejercicio 1: Navegación entre pantallas',
        desc: 'Completa el bloque que navega de la pantalla principal a la pantalla de protocolos.',
        tags: ['cib-hint-logic', 'Lógica', 'cib-hint-syntax', 'Navegación'],
        blanks: [
          { id: 'm0', placeholder: 'nombre pantalla...', width: 220, answer: '"PantallaProtocolos"', hint: 'Nombre exacto de la pantalla a la que se navega' },
          { id: 'm1', placeholder: 'abrir pantalla...', width: 200, answer: 'open another screen', hint: 'Bloque de control de pantallas en App Inventor' },
        ],
        code: [
          { type: 'plain', html: '<span class="cib-cm">// App móvil — Navegación</span>' },
          { type: 'plain', html: '<span class="cib-kw">when</span> <span class="cib-var">BtnProtocolos</span>.<span class="cib-cls">Click</span> <span class="cib-kw">do</span>' },
          { type: 'plain', html: '    <span class="cib-cm">// Abrir pantalla de protocolos</span>' },
          { type: 'plain', html: '    <span class="cib-kw">call</span> __BLANK_m1__ <span class="cib-kw">screenName</span> __BLANK_m0__' },
        ],
        validate: (vals) => {
          const v0 = vals.m0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.m1?.trim().replace(/\s+/g, ' ') || '';
          return v0.includes('PantallaProtocolos') && v1.includes('open another screen');
        },
        run: (vals) => {
          const v0 = vals.m0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.m1?.trim().replace(/\s+/g, ' ') || '';
          if (v0.includes('PantallaProtocolos') && v1.includes('open another screen')) {
            return { ok: true, output: [
              { type: 'info', text: '>> App Inventor - Navegación' },
              { type: 'ok', text: 'Abriendo pantalla: PantallaProtocolos' },
              { type: 'ok', text: '--- Navegación exitosa ---' }
            ]};
          }
          return { ok: false, output: [
            { type: 'info', text: '>> App Inventor - Navegación' },
            { type: 'err', text: 'Error: bloque de navegación o nombre de pantalla incorrectos' },
            { type: 'err', text: '--- Navegación fallida ---' }
          ]};
        }
      },
      {
        title: 'Ejercicio 2: Obtener ubicación GPS',
        desc: 'Completa el bloque que obtiene la latitud y longitud del usuario.',
        tags: ['cib-hint-logic', 'Lógica', 'cib-hint-scope', 'Geolocalización'],
        blanks: [
          { id: 'n0', placeholder: 'propiedad latitud...', width: 220, answer: 'LocationSensor1.Latitude', hint: 'Propiedad del sensor de ubicación que da latitud' },
          { id: 'n1', placeholder: 'URL del mapa...', width: 260, answer: 'https://maps.google.com/?q=', hint: 'URL base para abrir Google Maps con coordenadas' },
        ],
        code: [
          { type: 'plain', html: '<span class="cib-cm">// App móvil — Geolocalización</span>' },
          { type: 'plain', html: '<span class="cib-kw">when</span> <span class="cib-var">BtnHospital</span>.<span class="cib-cls">Click</span> <span class="cib-kw">do</span>' },
          { type: 'plain', html: '    <span class="cib-kw">set</span> <span class="cib-var">lat</span> <span class="cib-kw">to</span> __BLANK_n0__' },
          { type: 'plain', html: '    <span class="cib-kw">set</span> <span class="cib-var">lon</span> <span class="cib-kw">to</span> <span class="cib-var">LocationSensor1</span>.<span class="cib-cls">Longitude</span>' },
          { type: 'plain', html: '    <span class="cib-kw">call</span> <span class="cib-cls">Web1</span>.<span class="cib-fn">OpenUrl</span>' },
          { type: 'plain', html: '        <span class="cib-kw">url</span>: __BLANK_n1__ <span class="cib-op">&</span> <span class="cib-var">lat</span> <span class="cib-op">&</span> <span class="cib-str">","</span> <span class="cib-op">&</span> <span class="cib-var">lon</span>' },
        ],
        validate: (vals) => {
          const v0 = vals.n0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.n1?.trim().replace(/\s+/g, ' ') || '';
          return v0.includes('Latitude') && v1.includes('maps.google.com');
        },
        run: (vals) => {
          const v0 = vals.n0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.n1?.trim().replace(/\s+/g, ' ') || '';
          if (v0.includes('Latitude') && v1.includes('maps.google.com')) {
            return { ok: true, output: [
              { type: 'info', text: '>> App Inventor - Geolocalización' },
              { type: 'ok', text: 'Lat: 4.7110, Lon: -74.0721' },
              { type: 'ok', text: 'Abriendo Google Maps con ubicación' },
              { type: 'ok', text: '--- Ubicación obtenida ---' }
            ]};
          }
          return { ok: false, output: [
            { type: 'info', text: '>> App Inventor - Geolocalización' },
            { type: 'err', text: 'Error: propiedad de sensor o URL de mapa incorrectas' },
            { type: 'err', text: '--- Ubicación fallida ---' }
          ]};
        }
      },
      {
        title: 'Ejercicio 3: Botón de emergencia con SMS',
        desc: 'Completa el bloque que llama al 123 y envía SMS al contacto.',
        tags: ['cib-hint-syntax', 'Sintaxis', 'cib-hint-logic', 'Emergencia'],
        blanks: [
          { id: 'o0', placeholder: 'hacer llamada...', width: 240, answer: 'PhoneCall1.MakePhoneCall', hint: 'Bloque del componente PhoneCall para llamar' },
          { id: 'o1', placeholder: 'número...', width: 60, answer: '"123"', hint: 'Número nacional de emergencias' },
        ],
        code: [
          { type: 'plain', html: '<span class="cib-cm">// App móvil — Emergencia</span>' },
          { type: 'plain', html: '<span class="cib-kw">when</span> <span class="cib-var">BtnEmergencia</span>.<span class="cib-cls">Click</span> <span class="cib-kw">do</span>' },
          { type: 'plain', html: '    <span class="cib-cm">// Llamar a emergencias</span>' },
          { type: 'plain', html: '    <span class="cib-kw">call</span> __BLANK_o0__ <span class="cib-var">number</span> __BLANK_o1__' },
          { type: 'plain', html: '    <span class="cib-cm">// Enviar SMS al contacto</span>' },
          { type: 'plain', html: '    <span class="cib-kw">call</span> <span class="cib-cls">Texting1</span>.<span class="cib-fn">SendMessage</span>' },
          { type: 'plain', html: '        <span class="cib-kw">message</span>: <span class="cib-str">"Emergencia! Estoy en: "</span> <span class="cib-op">&</span> <span class="cib-var">lat</span> <span class="cib-op">&</span> <span class="cib-str">","</span> <span class="cib-op">&</span> <span class="cib-var">lon</span>' },
        ],
        validate: (vals) => {
          const v0 = vals.o0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.o1?.trim().replace(/\s+/g, ' ') || '';
          return v0.includes('MakePhoneCall') && (v1 === '"123"' || v1 === "'123'");
        },
        run: (vals) => {
          const v0 = vals.o0?.trim().replace(/\s+/g, ' ') || '';
          const v1 = vals.o1?.trim().replace(/\s+/g, ' ') || '';
          if (v0.includes('MakePhoneCall') && (v1 === '"123"' || v1 === "'123'")) {
            return { ok: true, output: [
              { type: 'info', text: '>> App Inventor - Emergencia' },
              { type: 'ok', text: 'Llamando al 123...' },
              { type: 'ok', text: 'SMS enviado al contacto de emergencia' },
              { type: 'ok', text: '--- Emergencia activada ---' }
            ]};
          }
          return { ok: false, output: [
            { type: 'info', text: '>> App Inventor - Emergencia' },
            { type: 'err', text: 'Error: componente de llamada o número incorrectos' },
            { type: 'err', text: '--- Emergencia fallida ---' }
          ]};
        }
      }
    ]
  }
};

interface Props {
  challengeId: string;
  onValidation?: (success: boolean) => void;
}

export function CodingIDEBoard({ challengeId, onValidation }: Props) {
  const config = CHALLENGES[challengeId];
  const [currentEx, setCurrentEx] = useState(0);
  const [attempted, setAttempted] = useState<boolean[]>([]);
  const [passed, setPassed] = useState<boolean[]>([]);
  const [inputValues, setInputValues] = useState<Record<string, Record<string, string>>>({});
  const [blankStates, setBlankStates] = useState<Record<string, Record<string, string>>>({});
  const [consoleLines, setConsoleLines] = useState<ConsoleEntry[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [resultType, setResultType] = useState<'ok' | 'fail'>('ok');
  const [resultTitle, setResultTitle] = useState('');
  const [resultDesc, setResultDesc] = useState('');
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [finalized, setFinalized] = useState(false);

  useEffect(() => {
    if (!config) return;
    const initAttempted = config.exercises.map(() => false);
    const initPassed = config.exercises.map(() => false);
    const initValues: Record<string, Record<string, string>> = {};
    const initStates: Record<string, Record<string, string>> = {};
    config.exercises.forEach((ex, ei) => {
      initValues[ei] = {};
      initStates[ei] = {};
      ex.blanks.forEach(b => {
        initValues[ei][b.id] = '';
        initStates[ei][b.id] = 'empty';
      });
    });
    setAttempted(initAttempted);
    setPassed(initPassed);
    setInputValues(initValues);
    setBlankStates(initStates);
    setCurrentEx(0);
    setConsoleLines([]);
    setShowResult(false);
    setFinalized(false);
    setShowFinalScore(false);
  }, [challengeId, config]);

  const exercise = config?.exercises[currentEx];
  const exValues = inputValues[currentEx] || {};
  const exStates = blankStates[currentEx] || {};

  const handleInputChange = useCallback((blankId: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [currentEx]: { ...prev[currentEx], [blankId]: value }
    }));
    setBlankStates(prev => ({
      ...prev,
      [currentEx]: { ...prev[currentEx], [blankId]: value.trim() ? 'filled' : 'empty' }
    }));
  }, [currentEx]);

  const doneCount = attempted.filter(Boolean).length;
  const totalEx = config?.exercises.length || 0;
  const isLastEx = currentEx === totalEx - 1;

  const runCode = useCallback(() => {
    if (!exercise || attempted[currentEx] || finalized) return;

    const vals = inputValues[currentEx] || {};
    const correct = exercise.validate(vals);
    const result = exercise.run(vals);

    setAttempted(prev => {
      const next = [...prev];
      next[currentEx] = true;
      return next;
    });
    setPassed(prev => {
      const next = [...prev];
      next[currentEx] = correct;
      return next;
    });

    const newStates: Record<string, string> = {};
    exercise.blanks.forEach(b => {
      const userVal = vals[b.id]?.trim().replace(/\s+/g, ' ') || '';
      newStates[b.id] = userVal === b.answer ? 'correct' : 'incorrect';
    });
    setBlankStates(prev => ({
      ...prev,
      [currentEx]: { ...prev[currentEx], ...newStates }
    }));

    setConsoleLines(result.output);

    if (correct && !isLastEx) {
      setResultType('ok');
      setResultTitle('¡Correcto!');
      setResultDesc(`Todas las respuestas del ejercicio ${currentEx + 1} son correctas.`);
      setShowFinalScore(false);
      setShowResult(true);
    } else if (!correct && !isLastEx) {
      setResultType('fail');
      setResultTitle('Respuesta incorrecta');
      setResultDesc('Algunas respuestas no son correctas. Revisa los errores en la consola.');
      setShowFinalScore(false);
      setShowResult(true);
    } else {
      finishEvaluation();
    }
  }, [exercise, attempted, finalized, inputValues, currentEx, isLastEx]);

  const finishEvaluation = useCallback(() => {
    const score = passed.filter(Boolean).length;
    const isLastCorrect = !attempted[currentEx] ? false : passed[currentEx];
    const finalCount = score + (isLastCorrect ? 0 : (attempted[currentEx] && passed[currentEx] ? 0 : 0));

    const actualPassed = attempted.map((a, i) => a ? passed[i] : false);
    const totalScore = actualPassed.filter(Boolean).length;

    setShowFinalScore(true);
    setResultType(totalScore >= 2 ? 'ok' : 'fail');
    setResultTitle(totalScore === totalEx ? '¡Evaluación completada!' : totalScore >= 2 ? 'Evaluación completada' : 'Evaluación finalizada');
    setResultDesc(`Obtuviste ${totalScore} de ${totalEx} ejercicios correctos.`);
    setShowResult(true);
    setFinalized(true);
    if (onValidation && totalScore >= 2) {
      onValidation(true);
    }
  }, [attempted, passed, currentEx, totalEx, onValidation]);

  const nextExercise = useCallback(() => {
    setShowResult(false);
    if (currentEx < totalEx - 1) {
      setCurrentEx(prev => prev + 1);
      setConsoleLines([]);
    }
  }, [currentEx, totalEx]);

  const handleExClick = useCallback((idx: number) => {
    if (idx <= doneCount) {
      setCurrentEx(idx);
      setShowResult(false);
      setConsoleLines([]);
    }
  }, [doneCount]);

  if (!config || !exercise) {
    return <div className="cib-root" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando ejercicios...</div>;
  }

  const getExIcon = (idx: number) => {
    if (passed[idx]) return '✅';
    if (attempted[idx]) return '❌';
    if (idx <= doneCount) return '○';
    return '🔒';
  };

  return (
    <div className="cib-root">
      <div className="cib-titlebar">
        <div className="cib-titlebar-left">
          <div className="cib-dots">
            <div className="cib-dot cib-dot-r"></div>
            <div className="cib-dot cib-dot-y"></div>
            <div className="cib-dot cib-dot-g"></div>
          </div>
          <div className="cib-filename">
            <span>{config.filename.replace(/\..*$/, '')}</span>.{config.filename.split('.').pop()} — Evaluación
          </div>
        </div>
        <div className="cib-badge-eval">EVALUATIVO · 1 INTENTO</div>
      </div>

      <div className="cib-tabs">
        <div className="cib-tab active">
          <span className="cib-tab-dot"></span>{config.filename}
        </div>
      </div>

      <div className="cib-body">
        <div className="cib-sidebar">
          <div className="cib-sidebar-section">
            <div className="cib-sidebar-label">Explorador</div>
            <div className="cib-sidebar-item active">
              <i className="ti ti-file-code" />{config.filename}
            </div>
            <div className="cib-sidebar-item">
              <i className="ti ti-folder" />recursos/
            </div>
          </div>

          <div className="cib-progress-wrap">
            <div className="cib-progress-label">
              <span>Progreso</span>
              <span>{doneCount} / {totalEx}</span>
            </div>
            <div className="cib-progress-bar">
              <div className="cib-progress-fill" style={{ width: `${(doneCount / totalEx) * 100}%` }} />
            </div>
          </div>

          <div className="cib-sidebar-label" style={{ padding: '8px 12px 4px' }}>Ejercicios</div>
          <div className="cib-ex-list">
            {config.exercises.map((ex, i) => (
              <div
                key={i}
                className={`cib-ex-item ${i === currentEx ? 'active-ex' : ''} ${passed[i] ? 'done' : ''} ${attempted[i] && !passed[i] ? 'failed' : ''}`}
                onClick={() => handleExClick(i)}
              >
                <span className="cib-ex-status-icon">{getExIcon(i)}</span>
                <span>{String(i + 1).padStart(2, '0')} · {ex.title.split(':')[0]}</span>
              </div>
            ))}
          </div>

          <div className="cib-attempt-warning">
            <i className="ti ti-alert-triangle" style={{ fontSize: 13 }} />
            Solo 1 intento por ejercicio
          </div>
        </div>

        <div className="cib-main-panel">
          <div className="cib-editor-area-wrap">
            <div className="cib-ex-header">
              <div className="cib-ex-title">{exercise.title}</div>
              <div className="cib-ex-desc">{exercise.desc}</div>
              <div className="cib-ex-tags">
                {exercise.tags.map((tag, i) => (
                  i % 2 === 0 ? (
                    <span key={i} className={`cib-hint-tag ${tag}`}>{exercise.tags[i + 1]}</span>
                  ) : null
                ))}
              </div>
            </div>

            <div className="cib-editor-area">
              <div className="cib-code-container">
                <div className="cib-line-nums">
                  {exercise.code.map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <div className="cib-code-content">
                  {exercise.code.map((line, li) => (
                    <div key={li} className="cib-code-line">
                      {renderCodeLine(line.html, exercise.blanks, exValues, exStates, attempted[currentEx], handleInputChange)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`cib-result-overlay ${showResult ? 'show' : ''}`}>
              <div className="cib-result-card">
                <div className="cib-result-icon">{resultType === 'ok' ? '✅' : '❌'}</div>
                <div className={`cib-result-title ${resultType === 'ok' ? 'ok' : 'fail'}`}>{resultTitle}</div>
                <div className="cib-result-desc">{resultDesc}</div>
                {showFinalScore && (
                  <div className="cib-score-display">
                    <div className="cib-score-big">{passed.filter(Boolean).length} / {totalEx}</div>
                    <div className="cib-score-label">Puntaje final</div>
                  </div>
                )}
                <button className="cib-btn-next" onClick={showFinalScore ? () => setShowResult(false) : nextExercise}>
                  {showFinalScore ? 'Cerrar' : 'Continuar →'}
                </button>
              </div>
            </div>
          </div>

          <div className="cib-console-panel">
            <div className="cib-console-header">
              <div className="cib-console-tabs">
                <div className="cib-console-tab active">Terminal</div>
                <div className="cib-console-tab" style={{ opacity: 0.5 }}>Problemas</div>
                <div className="cib-console-tab" style={{ opacity: 0.5 }}>Salida</div>
              </div>
              <div className="cib-console-actions">
                <button className="cib-btn-run" onClick={runCode} disabled={attempted[currentEx] || finalized}>
                  <i className="ti ti-player-play" /> Ejecutar
                </button>
                <button className="cib-btn-next" onClick={nextExercise} disabled={!attempted[currentEx] || isLastEx}>
                  Siguiente →
                </button>
              </div>
            </div>
            <div className="cib-console-output">
              {consoleLines.length === 0 && (
                <div className="cib-console-line">
                  <span className="cib-console-prompt">❯</span>
                  <span className="cib-console-info">Completa los espacios y presiona Ejecutar.</span>
                </div>
              )}
              {consoleLines.map((line, i) => (
                <div key={i} className="cib-console-line">
                  <span className="cib-console-prompt">❯</span>
                  <span className={`cib-console-${line.type}`}>{line.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
