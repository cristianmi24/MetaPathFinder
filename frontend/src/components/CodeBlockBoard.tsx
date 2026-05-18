import { useState, useCallback, useEffect } from 'react';
import './CodeBlockBoard.css';

interface CodeToken {
  t: string;
  v: string;
}

interface ConsoleLine {
  t: 'info' | 'ok' | 'err' | 'warn';
  v: string;
}

interface Exercise {
  id: string;
  title: string;
  language: string;
  fileName: string;
  icon: string;
  desc: string;
  codeTemplate: (CodeToken | null)[][];
  correctAnswers: string[];
  allBlocks: string[];
  errorMessages: string[];
  outputLines: ConsoleLine[];
  successMessage: string;
}

interface BlankState {
  answer: string | null;
}

const EXERCISES: Record<string, Exercise> = {
  'RM-C3-N2': {
    id: 'RM-C3-N2',
    title: 'Sistema de Votacion (HTML/JS)',
    language: 'javascript',
    fileName: 'voting.html',
    icon: 'ti ti-brand-html5',
    desc: 'Funcion que registra votos en localStorage',
    codeTemplate: [
      [{ t: 'cm', v: '// Sistema de votacion con localStorage' }],
      [{ t: 'kw', v: 'function' }, { t: 'tx', v: ' vote() {' }],
      [{ t: 'tx', v: '  ' }, { t: 'kw', v: 'let' }, { t: 'tx', v: ' votes = ' }, null, { t: 'tx', v: '(\'votes\');' }],
      [{ t: 'tx', v: '  votes.push(' }, { t: 'str', v: '\'candidate\'' }, { t: 'tx', v: ');' }],
      [{ t: 'tx', v: '  ' }, null, { t: 'tx', v: '(votes);' }],
      [{ t: 'tx', v: '  ' }, { t: 'kw', v: 'document' }, { t: 'tx', v: '.getElementById(\'result\').' }, null, { t: 'tx', v: '((item, index) => {' }],
      [{ t: 'tx', v: '    item.innerHTML = index + \': \' + item.textContent;' }],
      [{ t: 'tx', v: '  });' }],
      [{ t: 'tx', v: '}' }],
    ],
    correctAnswers: ['localStorage.getItem', 'JSON.stringify', 'forEach', '\'Vote\''],
    allBlocks: ['localStorage.getItem', 'JSON.stringify', 'forEach', '\'Vote\'', 'createElement', 'addEventListener'],
    errorMessages: [
      'Error: localStorage.getItem is not a function. Verifica la sintaxis.',
      'Error: JSON.stringify is not defined. Revisa el almacenamiento.',
      'Error: votes.forEach is not a function. Usa el metodo correcto.',
      'Error: \'Vote\' esperado. Revisa el texto del boton.',
    ],
    outputLines: [
      { t: 'info', v: '$ node voting.html' },
      { t: 'ok', v: 'Voto registrado correctamente' },
      { t: 'ok', v: 'Lista: [\"candidate\", \"candidate\"]' },
      { t: 'info', v: 'Proceso terminado con codigo 0' },
    ],
    successMessage: '¡Correcto! Codigo de votacion completado exitosamente.',
  },
  'RM-C3-N3': {
    id: 'RM-C3-N3',
    title: 'Clasificador de Residuos (Python)',
    language: 'python',
    fileName: 'classifier.py',
    icon: 'ti ti-brand-python',
    desc: 'Clase que clasifica residuos por material',
    codeTemplate: [
      [{ t: 'cm', v: '# Clasificador de residuos' }],
      [{ t: 'kw', v: 'class' }, { t: 'tx', v: ' WasteClassifier:' }],
      [{ t: 'tx', v: '  ' }, { t: 'kw', v: 'def' }, { t: 'tx', v: ' __init__(self, peso, material):' }],
      [{ t: 'tx', v: '    ' }, null],
      [{ t: 'tx', v: '    self.' }, null, { t: 'tx', v: ' = material' }],
      [{ t: 'tx', v: '  ' }, { t: 'kw', v: 'def' }, { t: 'tx', v: ' classify(self):' }],
      [{ t: 'tx', v: '    ' }, { t: 'kw', v: 'if' }, { t: 'tx', v: ' self.material == ' }, null, { t: 'tx', v: ':' }],
      [{ t: 'tx', v: '      ' }, { t: 'kw', v: 'return' }, { t: 'tx', v: ' \'vidrio\' + \': \' + str(self.peso)' }],
      [{ t: 'tx', v: '    ' }, { t: 'kw', v: 'raise' }, null, { t: 'tx', v: '(\'Material desconocido\')' }],
      [{ t: 'tx', v: '  ' }, { t: 'kw', v: 'def' }, { t: 'tx', v: ' process(self):' }],
      [{ t: 'tx', v: '    ' }, { t: 'kw', v: 'try' }, { t: 'tx', v: ':' }],
      [{ t: 'tx', v: '      ' }, { t: 'kw', v: 'return' }, { t: 'tx', v: ' self.classify()' }],
      [{ t: 'tx', v: '    ' }, { t: 'kw', v: 'except' }, null, { t: 'tx', v: ':' }],
      [{ t: 'tx', v: '      ' }, { t: 'kw', v: 'return' }, { t: 'tx', v: ' \'Error en clasificacion\'' }],
    ],
    correctAnswers: ['self.peso = peso', 'material', '"vidrio"', 'ValueError'],
    allBlocks: ['self.peso = peso', 'material', '"vidrio"', 'ValueError', 'self.tipo = tipo', 'TypeError'],
    errorMessages: [
      'SyntaxError: invalid syntax. Revisa la asignacion en __init__.',
      'NameError: name \'material\' is not defined. Revisa el atributo.',
      'TypeError: comparison failed. Revisa el valor del material.',
      'NameError: name \'ValueError\' is not defined. Revisa la excepcion.',
    ],
    outputLines: [
      { t: 'info', v: '$ python classifier.py' },
      { t: 'ok', v: 'vidrio: 10.5' },
      { t: 'info', v: 'Proceso terminado con codigo 0' },
    ],
    successMessage: '¡Correcto! Clasificador de residuos completado exitosamente.',
  },
};

interface Props {
  id?: string;
  challengeId?: string;
  onValidation?: (success: boolean) => void;
  readOnly?: boolean;
}

export function CodeBlockBoard({ id, challengeId, onValidation, readOnly }: Props) {
  const exerciseKey = (id || challengeId) as string;
  const exercise = EXERCISES[exerciseKey];
  const [blanks, setBlanks] = useState<BlankState[]>(
    () => exercise.correctAnswers.map(() => ({ answer: null }))
  );
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);
  const [blankStates, setBlankStates] = useState<string[]>(
    () => exercise.correctAnswers.map(() => 'empty')
  );

  useEffect(() => {
    setBlanks(exercise.correctAnswers.map(() => ({ answer: null })));
    setConsoleLines([]);
    setSuccess(false);
    setError(null);
    setValidated(false);
    setBlankStates(exercise.correctAnswers.map(() => 'empty'));
  }, [exerciseKey, exercise.correctAnswers]);

  const allBlanksFilled = blanks.every(b => b.answer !== null);

  const handleDragStart = useCallback((e: React.DragEvent, block: string) => {
    e.dataTransfer.setData('text/plain', block);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, blankIndex: number) => {
    e.preventDefault();
    const block = e.dataTransfer.getData('text/plain');
    if (!block) return;
    setBlanks(prev => {
      const next = [...prev];
      next[blankIndex] = { ...next[blankIndex], answer: block };
      return next;
    });
    setBlankStates(prev => {
      const next = [...prev];
      next[blankIndex] = 'filled';
      return next;
    });
    setError(null);
    setValidated(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const removeBlank = useCallback((blankIndex: number) => {
    setBlanks(prev => {
      const next = [...prev];
      next[blankIndex] = { answer: null };
      return next;
    });
    setBlankStates(prev => {
      const next = [...prev];
      next[blankIndex] = 'empty';
      return next;
    });
    setError(null);
    setValidated(false);
  }, []);

  const handleRun = useCallback(() => {
    if (!allBlanksFilled) {
      setConsoleLines([
        { t: 'warn', v: 'Faltan espacios por completar. Arrastra todos los bloques antes de ejecutar.' }
      ]);
      return;
    }

    const newConsole: ConsoleLine[] = [];
    newConsole.push({ t: 'info', v: `$ Compilando ${exercise.fileName}...` });

    let allCorrect = true;
    const newBlankStates = exercise.correctAnswers.map((answer, i) => {
      if (blanks[i].answer === answer) {
        return 'correct';
      } else {
        allCorrect = false;
        return 'wrong';
      }
    });

    setBlankStates(newBlankStates);
    setValidated(true);

    if (allCorrect) {
      setTimeout(() => {
        newConsole.push(...exercise.outputLines);
        setConsoleLines(newConsole);
        setSuccess(true);
        setError(null);
        if (onValidation) {
          setTimeout(() => onValidation(true), 1500);
        }
      }, 400);
    } else {
      const firstWrong = newBlankStates.indexOf('wrong');
      const msg = exercise.errorMessages[firstWrong >= 0 ? firstWrong : 0];
      newConsole.push({ t: 'err', v: 'Error de compilacion:' });
      newConsole.push({ t: 'err', v: msg });
      newConsole.push({ t: 'warn', v: 'Corrige los bloques marcados en rojo.' });
      setTimeout(() => {
        setConsoleLines(newConsole);
        setError(msg);
      }, 400);
    }
  }, [blanks, allBlanksFilled, exercise, onValidation]);

  const handleReset = useCallback(() => {
    setBlanks(exercise.correctAnswers.map(() => ({ answer: null })));
    setConsoleLines([]);
    setSuccess(false);
    setError(null);
    setValidated(false);
    setBlankStates(exercise.correctAnswers.map(() => 'empty'));
  }, [exercise.correctAnswers]);

  const correctCount = blanks.filter((b, i) => b.answer === exercise.correctAnswers[i]).length;

  const renderCodeLine = (line: (CodeToken | null)[], lineIndex: number) => {
    let blankCount = 0;
    const lineTokens: React.ReactNode[] = [];

    for (let li = 0; li < lineIndex; li++) {
      for (const t of exercise.codeTemplate[li]) {
        if (t === null) blankCount++;
      }
    }

    let localBlankIdx = 0;
    for (const token of line) {
      if (token === null) {
        const blankIdx = blankCount + localBlankIdx;
        localBlankIdx++;
        const blank = blanks[blankIdx];
        const state = validated ? blankStates[blankIdx] : (blank?.answer ? 'filled' : 'empty');
        const filled = blank?.answer;

        return (
          <>
            {line.slice(0, line.indexOf(null)).map((t, idx) => {
              if (t === null) return null;
              return (
                <span key={`tok-${idx}`} className={t.t}>
                  {t.v}
                </span>
              );
            })}
            <span
              key={`blank-${blankIdx}`}
              className={`blank ${state === 'filled' || state === 'correct' ? 'filled' : ''} ${state === 'correct' ? 'correct' : ''} ${state === 'wrong' ? 'wrong' : ''}`}
              onClick={() => filled && removeBlank(blankIdx)}
              onDrop={(e) => handleDrop(e, blankIdx)}
              onDragOver={handleDragOver}
              title={filled ? 'Click para quitar' : 'drop'}
            >
              {state === 'empty' ? (
                <span className="drop-hint">drop</span>
              ) : (
                filled
              )}
            </span>
            {line.slice(line.indexOf(null) + 1).map((t, idx) => {
              if (t === null) return null;
              return (
                <span key={`tok2-${idx}`} className={t.t}>
                  {t.v}
                </span>
              );
            })}
          </>
        );
      }
    }

    return line.map((token, idx) => {
      return (
        <span key={idx} className={token.t}>
          {token.v}
        </span>
      );
    });
  };

  const isBlockUsed = (block: string) => {
    return blanks.some(b => b.answer === block);
  };

  return (
    <div className="cbb-root">
      <div className="cbb-titlebar">
        <div className="cbb-dots">
          <div className="cbb-dot-r"></div>
          <div className="cbb-dot-y"></div>
          <div className="cbb-dot-g"></div>
        </div>
        <span className="cbb-filename">
          <i className={exercise.icon} style={{ fontSize: 13 }}></i>
          {exercise.fileName}
        </span>
        <div className="cbb-actions">
          <button
            className="cbb-run-btn"
            onClick={handleRun}
            disabled={readOnly}
          >
            <i className="ti ti-player-play" style={{ fontSize: 12 }}></i>
            Ejecutar
          </button>
          <button
            className="cbb-reset-btn"
            onClick={handleReset}
            disabled={readOnly}
          >
            <i className="ti ti-refresh" style={{ fontSize: 12 }}></i>
          </button>
        </div>
      </div>

      <div className="cbb-desc">
        <i className="ti ti-info-circle" style={{ fontSize: 12, marginRight: 4 }}></i>
        {exercise.desc}
        <span className="cbb-score-pill">
          <i className="ti ti-checklist" style={{ fontSize: 11 }}></i>
          {correctCount}/{exercise.correctAnswers.length} correctos
        </span>
      </div>

      <div className="cbb-body">
        <div className="cbb-explorer">
          <div className="cbb-explorer-head">EXPLORADOR</div>
          <div className="cbb-explorer-item active">
            <i className={exercise.icon} style={{ fontSize: 13 }}></i>
            {exercise.fileName}
          </div>
        </div>

        <div className="cbb-editor">
          <div className="cbb-editor-area">
            <div className="cbb-line-nums">
              {exercise.codeTemplate.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <div className="cbb-code-lines">
              {exercise.codeTemplate.map((line, li) => (
                <div key={li} className="cbb-code-line">
                  {renderCodeLine(line, li)}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="cbb-blocks-panel">
          <div className="cbb-blocks-head">
            <i className="ti ti-puzzle" style={{ fontSize: 12 }}></i>
            BLOQUES
          </div>
          <div className="cbb-blocks-scroll">
            <div className="cbb-blocks-sep">arrastra al editor &rarr;</div>
            {exercise.allBlocks.map((block, i) => {
              const used = isBlockUsed(block);
              return (
                <div
                  key={i}
                  className={`cbb-block ${used ? 'used' : ''}`}
                  draggable={!used && !readOnly}
                  onDragStart={(e) => !used && handleDragStart(e, block)}
                >
                  <i className="ti ti-grip-vertical" style={{ fontSize: 12, color: '#555' }}></i>
                  {block}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="cbb-console">
        <div className="cbb-console-head">
          <i className="ti ti-terminal" style={{ fontSize: 12 }}></i>
          CONSOLA
        </div>
        {consoleLines.length === 0 && (
          <div className="cbb-console-line cbb-con-info">
            <span className="cbb-con-prompt">$</span>
            <span>Listo. Arrastra los bloques a los espacios en blanco y ejecuta.</span>
          </div>
        )}
        {consoleLines.map((line, i) => (
          <div key={i} className={`cbb-console-line cbb-con-${line.t}`}>
            <span className="cbb-con-prompt">
              {line.t === 'info' ? '$' : line.t === 'ok' ? '\u2713' : line.t === 'err' ? '\u2717' : '\u26A0'}
            </span>
            <span>{line.v}</span>
          </div>
        ))}
      </div>

      {success && (
        <div className="cbb-success-badge">
          <i className="ti ti-circle-check" style={{ fontSize: 14 }}></i>
          {' '}{exercise.successMessage}
        </div>
      )}
    </div>
  );
}
