import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { type OnValidation, stateReport } from '../lib/boardValidation';

interface DragAndDropBoardProps {
  challengeId: string;
  onValidation: OnValidation;
}

const getChallengeData = (id: string) => {
  const data: Record<string, { correctOrder: string[] }> = {
    // Básicos N1
    "RB-C1-N1": { correctOrder: ["Tablero de Tiza", "Retroproyector", "Computador de escritorio", "Tablet", "Pizarra Interactiva"] },
    "RB-C2-N1": { correctOrder: ["Crear carpeta principal 'Grado 10'", "Crear subcarpetas por Materia", "Definir convención de nombres", "Mover archivos a sus carpetas"] },
    "RB-C3-N1": { correctOrder: ["Sacar dos rebanadas de pan", "Poner queso sobre el pan", "Poner jamón sobre el queso", "Poner otra rebanada de pan encima"] },
    "RB-C4-N1": { correctOrder: ["Buscar datos del DANE o MinTIC", "Comparar zonas urbanas vs rurales", "Diseñar la infografía", "Escribir reflexión personal"] },
    
    // Básicos N2
    "RB-C1-N2": { correctOrder: ["Identificar infraestructura de servicios", "Tomar fotografías de los sistemas", "Investigar qué materiales y conocimientos requirieron", "Explicar cómo han mejorado la calidad de vida", "Redactar informe final"] },
    "RB-C2-N2": { correctOrder: ["Seleccionar la app adecuada para la videollamada", "Reunir capturas y ejemplos claros", "Escribir los pasos de instalación con texto grande", "Explicar cómo iniciar y terminar la llamada", "Revisar que el lenguaje sea muy sencillo"] },
    "RB-C3-N2": { correctOrder: ["Leer lista de 30 estudiantes", "Preguntar si cada uno asistió", "Validar que la respuesta sea 'sí' o 'no'", "Contar totales de presentes y ausentes", "Calcular y mostrar porcentaje de asistencia"] },
    "RB-C4-N2": { correctOrder: ["Registrar tiempo de uso durante 3 días", "Anotar emociones antes y después del uso", "Buscar 1 referencia científica sobre el impacto", "Analizar la relación entre tiempo y estado emocional", "Proponer 2 recomendaciones para uso saludable"] },

    // Básicos N3
    "RB-C1-N3": { correctOrder: ["Elegir un problema cotidiano", "Identificar una tecnología antigua y una moderna", "Comparar eficiencia, costo e impacto", "Concluir cuál es mejor argumentando", "Elaborar la tabla comparativa final"] },
    "RB-C2-N3": { correctOrder: ["SUMA todos los gastos previstos", "SUMA los ingresos posibles", "RESTA gastos de ingresos para calcular el saldo", "VERIFICA que el saldo no supere $150.000 COP", "CREA un gráfico de barras de los gastos"] },
    "RB-C3-N3": { correctOrder: ["Registrar estudiante y libro solicitado", "Verificar disponibilidad del libro", "Registrar préstamo si está disponible", "Registrar devolución y calcular días de retraso", "Generar reporte de libros más prestados"] },
    "RB-C4-N3": { correctOrder: ["Identificar un problema real de la comunidad", "Proponer tecnología pertinente para solucionarlo", "Estimar los recursos necesarios", "Analizar impactos positivos, negativos y éticos", "Presentar propuesta en texto corto"] },

    // Medios N1
    "RM-C1-N1": { correctOrder: ["Identificar los componentes internos", "Investigar la función de cada uno", "Averiguar cuándo fue inventado", "Dibujar un diagrama anotado"] },
    "RM-C2-N1": { correctOrder: ["Iniciar la grabación de la macro", "Calcular promedio, máximo y mínimo", "Resaltar estudiantes con nota < 3.0", "Asignar la macro a un botón"] },
    "RM-C3-N1": { correctOrder: ["Abrir Tinkercad Circuits", "Conectar sensor al Arduino", "Leer temperatura cada 2 segundos", "Si Temp > 30, encender LED rojo"] },
    "RM-C4-N1": { correctOrder: ["Listar redes y servicios usados", "Revisar permisos de apps", "Analizar datos recopilados", "Aplicar medidas de seguridad (2FA)"] },
    
    // Avanzados N1
    "RA-C1-N1": { correctOrder: ["Desmontar dispositivo en desuso", "Documentar fotográficamente piezas", "Identificar función y materiales", "Escribir informe técnico"] },
    "RA-C2-N1": { correctOrder: ["Definir estructura de datos", "Crear endpoints (GET, POST)", "Probar con Postman o CURL", "Escribir documentación de la API"] },
    "RA-C3-N1": { correctOrder: ["Conectar sensores de humedad y temperatura", "Programar lectura de datos", "Configurar alerta LED si humedad < 40%", "Registrar lecturas en CSV"] },
    "RA-C4-N1": { correctOrder: ["Investigar qué es sesgo algorítmico", "Seleccionar 2 herramientas digitales", "Analizar sesgos potenciales y evidencias", "Redactar ensayo con acciones correctivas"] }
  };

  const correctOrder = data[id]?.correctOrder || ["Paso A", "Paso B", "Paso C"];
  // Crear una copia desordenada para la vista inicial
  const items = [...correctOrder].sort(() => Math.random() - 0.5);
  // Asegurar que no empiece ya ordenado por azar
  if (items.join() === correctOrder.join() && items.length > 1) {
    items.reverse();
  }
  
  return { items, correctOrder };
};

function SortableItem({ id, item, index, done }: { id: string; item: string; index: number; done: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group flex cursor-grab touch-none items-center gap-3 rounded-xl border px-3 py-1.5 ${
        isDragging
          ? 'border-primary bg-primary/10 shadow-xl'
          : done
            ? 'border-secondary/50 bg-secondary/10'
            : 'border-outline-variant/50 bg-surface hover:border-primary/60 hover:shadow-md'
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          done ? 'bg-secondary text-on-secondary' : 'bg-primary/10 text-primary'
        }`}
      >
        {index + 1}
      </span>
      <span className="flex-1 text-[13px] leading-snug text-on-surface">{item}</span>
      <GripVertical className="h-4 w-4 shrink-0 text-on-surface-variant/40 group-hover:text-primary" />
    </div>
  );
}

export function DragAndDropBoard({ challengeId, onValidation }: DragAndDropBoardProps) {
  const [items, setItems] = useState<string[]>([]);
  const [correctOrder, setCorrectOrder] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    const data = getChallengeData(challengeId);
    setItems(data.items);
    setCorrectOrder(data.correctOrder);
    setIsCorrect(false);
  }, [challengeId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newItems = arrayMove(items, oldIndex, newIndex);

        const success = JSON.stringify(newItems) === JSON.stringify(correctOrder);
        setIsCorrect(success);
        onValidation(success, stateReport(newItems));

        return newItems;
      });
    } else {
      const success = JSON.stringify(items) === JSON.stringify(correctOrder);
      setIsCorrect(success);
      onValidation(success, stateReport(items));
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 p-3 md:p-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <div className="min-w-0 flex-1">
          <h4 className="text-lg font-semibold text-on-surface">Ordena los pasos</h4>
          <p className="text-[13px] text-on-surface-variant">
            Arrastra cada tarjeta hasta su lugar: del primer paso (arriba) al último (abajo).
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
            isCorrect ? 'bg-secondary text-on-secondary' : 'bg-surface-container-high text-on-surface-variant'
          }`}
        >
          <i className={`ti ${isCorrect ? 'ti-check' : 'ti-arrows-sort'}`} />
          {isCorrect ? '¡Orden correcto!' : `${items.length} pasos`}
        </span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div
            className={`flex flex-col gap-1.5 rounded-xl border p-2 transition-colors duration-300 ${
              isCorrect ? 'border-secondary/40 bg-secondary/5' : 'border-outline-variant/40 bg-surface-container-low'
            }`}
          >
            {items.map((id, i) => (
              <SortableItem key={id} id={id} item={id} index={i} done={isCorrect} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {isCorrect && (
        <p className="text-center text-[13px] font-semibold text-secondary">Ya puedes verificar y enviar el reto.</p>
      )}
    </div>
  );
}
