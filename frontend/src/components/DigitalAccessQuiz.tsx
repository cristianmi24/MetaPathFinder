import React, { useState } from 'react';

const CORRECTAS = ["C", "A", "B"];

export function DigitalAccessQuiz({ challengeId, onValidation }: { challengeId?: string; onValidation?: (success: boolean) => void }) {
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
        <h1 className="dq-title">Análisis Digital: Conectividad en el Hogar</h1>

        <section className="dq-articles">
          <article className="dq-article">
            <h2>Artículo 1: La realidad del porcentaje de conexión</h2>
            <p>A nivel global, la brecha digital sigue siendo un desafío crítico. Según datos recientes, aproximadamente el <strong>65% de los hogares</strong> del país cuentan con una conexión estable a internet de banda ancha. Aunque esta cifra ha crecido de manera constante en la última década, significa que un 35% de las familias todavía carecen por completo de este servicio o dependen de conexiones móviles limitadas por datos, concentrándose la mayor exclusión en las zonas rurales del territorio.</p>
          </article>
          <article className="dq-article">
            <h2>Artículo 2: Causa y Efecto de la desconexión</h2>
            <p>La falta de internet en el hogar genera una reacción en cadena que afecta directamente la calidad de vida. La principal causa de la desconexión es la falta de infraestructura en regiones apartadas y el alto costo de los servicios para familias de bajos recursos. Esto provoca la llamada <em>"exclusión digital"</em>: los jóvenes sin conexión sufren de rezago educativo al no poder realizar investigaciones ni tomar clases virtuales, y los adultos ven limitadas sus oportunidades laborales y de teletrabajo, ampliando la desigualdad social.</p>
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
                q: "1. Según el texto, ¿cuál es el porcentaje exacto de hogares que SÍ cuentan con conexión estable a internet?",
                opts: [
                  { val: "A", text: "El 35% de los hogares." },
                  { val: "B", text: "El 50% de los hogares." },
                  { val: "C", text: "El 65% de los hogares." }
                ]
              },
              {
                q: "2. ¿Qué se puede interpretar bajo el concepto de \"exclusión digital\" según los artículos expuestos?",
                opts: [
                  { val: "A", text: "Que no tener internet hoy en día te desconecta de oportunidades educativas y laborales, aumentando la desigualdad." },
                  { val: "B", text: "Que las personas deciden voluntariamente no usar redes sociales ni computadoras por entretenimiento." },
                  { val: "C", text: "Que los aparatos tecnológicos modernos son demasiado complicados para que los jóvenes los entiendan." }
                ]
              },
              {
                q: "3. Sabiendo que el costo y la falta de infraestructura son las causas del problema, ¿cuál sería la solución más viable y directa?",
                opts: [
                  { val: "A", text: "Regalar teléfonos inteligentes a todas las personas aunque no tengan señal en su zona." },
                  { val: "B", text: "Crear proyectos gubernamentales de redes públicas gratuitas e invertir en antenas para zonas rurales aisladas." },
                  { val: "C", text: "Prohibir las clases y tareas que utilicen computadoras para que todos trabajen solo con libros impresos." }
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

export default DigitalAccessQuiz;
