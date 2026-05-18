import React, { useState } from 'react';

const CORRECTAS = ["A", "C", "B"];

export function SocialMediaQuiz({ onValidation }: { onValidation?: (success: boolean) => void }) {
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const total = 3;

  const handleOptionChange = (val: string) => {
    const newRespuestas = [...respuestas];
    newRespuestas[paso] = val;
    setRespuestas(newRespuestas);
  };

  const handleNext = () => {
    if (!respuestas[paso]) return;
    if (paso + 1 >= total) {
      setShowResults(true);
      const aciertos = respuestas.reduce((acc, r, i) => acc + (r === CORRECTAS[i] ? 1 : 0), 0);
      if (onValidation) {
        onValidation(aciertos === total);
      }
    } else {
      setPaso(paso + 1);
    }
  };

  const reiniciar = () => {
    setPaso(0);
    setRespuestas([]);
    setShowResults(false);
  };

  const aciertos = respuestas.reduce((acc, r, i) => acc + (r === CORRECTAS[i] ? 1 : 0), 0);

  return (
    <div className="digital-quiz-wrapper" style={{ width: '100%', fontFamily: '"Sora", sans-serif', color: 'var(--fb-text)', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <style>{`
        .dq-container { background: var(--fb-bg); padding: 24px; border-radius: 0 0 2rem 2rem; border-top: 0.5px solid var(--fb-border); text-align: left; width: 100%; height: 100%; flex: 1; overflow-y: auto; }
        .dq-title { color: var(--fb-accent); text-align: center; font-size: 1.6rem; margin-top: 0; margin-bottom: 24px; font-weight: 700; font-family: 'Sora', sans-serif; }
        .dq-articles { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        @media(max-width: 768px) { .dq-articles { grid-template-columns: 1fr; } }
        .dq-article { background: var(--fb-card); padding: 20px; border-radius: 12px; border: 0.5px solid var(--fb-border); border-left: 4px solid var(--fb-accent); }
        .dq-article h2 { margin-top: 0; color: var(--fb-text); font-size: 1.1rem; margin-bottom: 8px; font-weight: 600; }
        .dq-article p { margin: 0; font-size: 0.9rem; line-height: 1.6; color: var(--fb-text-muted); }
        .dq-quiz-section { border-top: 1px solid var(--fb-border); padding-top: 24px; }
        .dq-quiz-section h2 { color: var(--fb-accent); margin-top: 0; margin-bottom: 20px; font-size: 1.3rem; font-weight: 600; }
        .dq-progress { text-align: center; font-size: 0.85rem; color: var(--fb-text-muted); margin-bottom: 8px; font-family: 'IBM Plex Mono', monospace; }
        .dq-progress-bar { height: 6px; background: var(--fb-border); border-radius: 3px; margin-bottom: 20px; overflow: hidden; }
        .dq-progress-fill { height: 100%; background: var(--fb-accent); border-radius: 3px; transition: width 0.3s; }
        .dq-card { display: none; margin-bottom: 20px; background: var(--fb-card); padding: 20px; border-radius: 12px; border: 0.5px solid var(--fb-border); }
        .dq-card.active { display: block; }
        .dq-card.show-results { display: block; opacity: 0.9; }
        .dq-qtitle { font-weight: 600; margin-bottom: 16px; color: var(--fb-text); font-size: 1rem; }
        .dq-opts { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .dq-opts li { margin: 0; }
        .dq-opt-label { display: flex; align-items: flex-start; gap: 12px; padding: 12px 16px; border: 1.5px solid var(--fb-border); border-radius: 8px; cursor: pointer; transition: all 0.2s; font-size: 0.9rem; color: var(--fb-text-muted); }
        .dq-opt-label:hover { background: rgba(56, 139, 253, 0.06); border-color: #9090ff; color: var(--fb-text); }
        .dq-opt-label input { margin-top: 4px; }
        .dq-opt-label.correct { border-color: var(--fb-accent); background: rgba(35, 134, 54, 0.08); color: var(--fb-text); font-weight: 500; }
        .dq-opt-label.incorrect { border-color: var(--fb-error); background: rgba(248, 81, 73, 0.08); color: var(--fb-error); }
        .dq-btn-next { display: block; width: 100%; background: var(--fb-accent); color: white; border: none; padding: 12px; font-size: 0.95rem; font-weight: 700; border-radius: 8px; cursor: pointer; transition: all 0.2s; margin-top: 16px; font-family: 'Sora', sans-serif; }
        .dq-btn-next:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(35, 134, 54, 0.2); }
        .dq-btn-next:disabled { background: var(--fb-border); color: var(--fb-text-muted); cursor: not-allowed; }
        .dq-btn-restart { display: block; width: 100%; background: transparent; color: var(--fb-accent); border: 1.5px solid var(--fb-accent); padding: 12px; font-size: 0.95rem; font-weight: 700; border-radius: 8px; cursor: pointer; transition: all 0.2s; margin-top: 12px; font-family: 'Sora', sans-serif; }
        .dq-btn-restart:hover { background: rgba(35, 134, 54, 0.08); }
        .dq-msg { margin-top: 20px; padding: 16px; border-radius: 12px; text-align: center; font-weight: 600; font-size: 0.95rem; }
        .dq-msg.success { color: var(--fb-accent); background: rgba(35, 134, 54, 0.08); border: 0.5px solid rgba(35, 134, 54, 0.25); }
        .dq-msg.error { color: var(--fb-error); background: rgba(248, 81, 73, 0.08); border: 0.5px solid rgba(248, 81, 73, 0.25); }
      `}</style>

      <div className="dq-container">
        <h1 className="dq-title">Análisis Digital: Redes Sociales y Bienestar</h1>

        <section className="dq-articles">
          <article className="dq-article">
            <h2>Artículo 1: El tiempo en pantalla y su impacto emocional</h2>
            <p>Según estudios recientes, pasar más de 3 horas diarias en redes sociales aumenta significativamente los niveles de ansiedad y estrés en adolescentes. La constante comparación con las vidas idealizadas de otros puede generar sentimientos de insuficiencia y aislamiento social, paradójicamente desconectando a los jóvenes de su entorno físico inmediato.</p>
          </article>
          <article className="dq-article">
            <h2>Artículo 2: Estrategias para un uso saludable</h2>
            <p>No se trata de abandonar las redes por completo, sino de consumirlas con conciencia. Establecer límites de tiempo, desactivar las notificaciones no esenciales y curar el feed para seguir cuentas que inspiren en lugar de aquellas que generen envidia son pasos cruciales. Además, reservar momentos del día libres de pantallas (como durante las comidas o antes de dormir) ayuda a recuperar el equilibrio emocional y mejorar la calidad del sueño.</p>
          </article>
        </section>

        <section className="dq-quiz-section">
          <h2>Trivia de Comprensión Directa</h2>
          <div>
            <div className="dq-progress">{showResults ? "Cuestionario completado" : `Pregunta ${paso + 1} de ${total}`}</div>
            <div className="dq-progress-bar">
              <div className="dq-progress-fill" style={{ width: showResults ? '100%' : `${((paso) / total) * 100}%` }}></div>
            </div>

            {[
              {
                q: "1. Según el primer artículo, ¿qué efecto tiene pasar más de 3 horas diarias en redes sociales?",
                opts: [
                  { val: "A", text: "Aumenta significativamente los niveles de ansiedad y estrés." },
                  { val: "B", text: "Mejora las habilidades de comunicación interpersonal." },
                  { val: "C", text: "No tiene ningún efecto documentado." }
                ]
              },
              {
                q: "2. ¿Qué paradoja se menciona sobre el uso excesivo de redes sociales?",
                opts: [
                  { val: "A", text: "Que hace que los jóvenes sean más rápidos para leer." },
                  { val: "B", text: "Que ayuda a hacer amigos en todo el mundo." },
                  { val: "C", text: "Que puede generar aislamiento social y desconexión del entorno físico." }
                ]
              },
              {
                q: "3. ¿Cuál es una de las estrategias recomendadas para un uso saludable?",
                opts: [
                  { val: "A", text: "Borrar todas las aplicaciones de redes sociales del teléfono." },
                  { val: "B", text: "Establecer límites de tiempo y reservar momentos sin pantallas." },
                  { val: "C", text: "Reemplazar el sueño por más horas de navegación nocturna." }
                ]
              }
            ].map((question, i) => (
              <div key={i} className={`dq-card ${!showResults && paso === i ? 'active' : ''} ${showResults ? 'show-results' : ''}`}>
                <div className="dq-qtitle">{question.q}</div>
                <ul className="dq-opts">
                  {question.opts.map((opt) => {
                    const isChecked = respuestas[i] === opt.val;
                    let labelClass = "dq-opt-label";
                    if (showResults) {
                      if (opt.val === CORRECTAS[i]) labelClass += " correct";
                      else if (isChecked) labelClass += " incorrect";
                    }
                    return (
                      <li key={opt.val}>
                        <label className={labelClass}>
                          <input 
                            type="radio" 
                            name={`q${i}`} 
                            value={opt.val} 
                            checked={isChecked}
                            onChange={() => !showResults && handleOptionChange(opt.val)}
                            disabled={showResults}
                          />
                          <span>{opt.text}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {!showResults && (
              <button 
                className="dq-btn-next" 
                onClick={handleNext} 
                disabled={!respuestas[paso]}
              >
                {paso === total - 1 ? "Ver resultados" : "Siguiente"}
              </button>
            )}

            {showResults && (
              <>
                <div className={`dq-msg ${aciertos === total ? 'success' : 'error'}`}>
                  {aciertos === total 
                    ? `¡Excelente! Respondiste correctamente ${aciertos} de ${total}. ¡Análisis perfecto!` 
                    : `Lograste ${aciertos} de ${total} correctas. Revisa las respuestas marcadas y vuelve a intentar.`}
                </div>
                <button className="dq-btn-restart" onClick={reiniciar}>Intentar de nuevo</button>
              </>
            )}

          </div>
        </section>
      </div>
    </div>
  );
}

export default SocialMediaQuiz;
