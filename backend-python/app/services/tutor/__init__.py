"""Sistema tutor de MetaPathFinder.

Módulos (arquitectura clásica de STI):
- domain: base de conocimiento del experto (progresiones de Griffin, indicadores y probabilidades).
- bayes: Naive Bayes Bernoulli, Beta-Bernoulli y muestreo de Thompson (sin datos históricos).
- indicators: convierte las métricas capturadas en observaciones sí/no.
- engine: ciclo de Griffin (evaluar → ubicar → andamiar → reevaluar) y retroalimentación.
"""
