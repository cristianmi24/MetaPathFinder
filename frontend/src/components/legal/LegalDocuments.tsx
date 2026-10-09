import type { ReactNode } from 'react';
import { LEGAL, LEGAL_ROUTES } from '../../data/legalConfig';

function Sec({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-base font-semibold text-on-surface">{n}. {title}</h3>
      <div className="space-y-2 text-sm leading-relaxed text-on-surface-variant">{children}</div>
    </section>
  );
}

const ul = 'list-disc pl-5 space-y-1';
const link = 'font-semibold text-primary underline underline-offset-2 hover:opacity-80';

function Strong({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-on-surface">{children}</strong>;
}

function ContactLine() {
  const parts: string[] = [];
  if (LEGAL.contactEmail) parts.push(`correo electrónico ${LEGAL.contactEmail}`);
  if (LEGAL.contactPhone) parts.push(`teléfono ${LEGAL.contactPhone}`);
  return (
    <p>
      Puede comunicarse con el Responsable {parts.length ? `por ${parts.join(' o ')}, o ` : ''}a través del docente
      responsable de su grupo o del administrador de la Plataforma.
    </p>
  );
}

/* ─────────────────────────  TÉRMINOS Y CONDICIONES DE USO  ───────────────────────── */

export function TermsOfUse() {
  return (
    <article className="space-y-5">
      <Sec n={1} title="Aceptación y objeto">
        <p>
          Estos Términos y Condiciones regulan el acceso y uso de {LEGAL.platform} (la «Plataforma»), una herramienta
          educativa y de investigación desarrollada en el marco de un proyecto de la {LEGAL.institution}{' '}
          ({LEGAL.institutionLocation}) sobre aprendizaje adaptativo y metacognición.
        </p>
        <p>
          Al marcar la casilla de aceptación y crear su cuenta, o al usar la Plataforma, usted manifiesta que los leyó y
          los acepta. Esta aceptación electrónica es una manifestación de voluntad válida conforme a la Ley 527 de 1999.
          La Plataforma conserva la fecha, la hora y la versión ({LEGAL.version}) de los textos que usted aceptó.
        </p>
      </Sec>

      <Sec n={2} title="Qué es y qué no es la Plataforma">
        <p>
          La Plataforma propone retos de tecnología y preguntas de autopercepción para que usted compare lo que cree
          saber con lo que realmente logra (calibración metacognitiva), y le ofrece retroalimentación y estrategias de
          estudio. Este proceso es un <Strong>análisis metacognitivo con fines formativos</Strong>.
        </p>
        <ul className={ul}>
          <li>No es una calificación oficial ni se usa para aprobar o reprobar asignaturas, salvo que su institución educativa lo indique expresamente y por separado.</li>
          <li>No es un diagnóstico psicológico, psiquiátrico ni clínico, y no sustituye la valoración de un docente u otro profesional.</li>
          <li>Los indicadores que muestra (confianza, calibración, carga mental estimada, etc.) son estimaciones estadísticas de uso y pueden contener errores.</li>
        </ul>
      </Sec>

      <Sec n={3} title="Quiénes pueden usarla">
        <p>
          La Plataforma está dirigida a estudiantes de educación básica y media, a docentes y al personal administrador
          autorizado. Las personas <Strong>menores de 18 años</Strong> solo pueden registrarse y usar la Plataforma con
          la autorización de su padre, madre o representante legal, quien declara conocer y aceptar estos Términos y la{' '}
          <a className={link} href={LEGAL_ROUTES.privacy} target="_blank" rel="noopener noreferrer">Política de Privacidad</a>.
        </p>
        <p>Las cuentas de administrador no se crean mediante el registro público; las asigna el equipo responsable.</p>
      </Sec>

      <Sec n={4} title="Cuenta y credenciales">
        <ul className={ul}>
          <li>Debe suministrar información veraz, completa y actualizada.</li>
          <li>Su cuenta es personal e intransferible: no comparta su contraseña ni inicie sesión por otra persona.</li>
          <li>Usted es responsable de la actividad realizada con sus credenciales. Avise de inmediato si sospecha un uso no autorizado.</li>
        </ul>
      </Sec>

      <Sec n={5} title="Uso aceptable">
        <p>Al usar la Plataforma se compromete a no:</p>
        <ul className={ul}>
          <li>Suplantar a otra persona ni crear cuentas con datos falsos.</li>
          <li>Intentar vulnerar la seguridad, acceder a datos de otros usuarios o interferir con el servicio.</li>
          <li>Usar programas automáticos, scripts o herramientas que alteren resultados, tiempos o registros.</li>
          <li>Escribir en los campos de texto libre (reflexiones, ensayos) datos personales de terceros, datos de salud, direcciones, números de documento u otra información sensible o confidencial.</li>
          <li>Publicar o enviar contenido ilícito, ofensivo, discriminatorio o que vulnere derechos de terceros.</li>
          <li>Copiar, redistribuir o explotar los contenidos pedagógicos fuera de lo permitido por la licencia aplicable.</li>
        </ul>
      </Sec>

      <Sec n={6} title="Participación voluntaria y fines de investigación">
        <p>
          El uso de la Plataforma puede formar parte de una investigación educativa. Su información de uso se analiza
          de forma agregada o anonimizada, y los resultados se publican sin identificar a las personas, según se
          explica en la Política de Privacidad. Usted puede dejar de usar la Plataforma y solicitar la eliminación de
          su cuenta y de sus datos en cualquier momento.
        </p>
      </Sec>

      <Sec n={7} title="Propiedad intelectual">
        <ul className={ul}>
          <li>El código fuente de la Plataforma se distribuye bajo los términos de la licencia MIT indicada en el repositorio del proyecto.</li>
          <li>Los contenidos pedagógicos (retos, textos, rúbricas), el nombre, los logos y demás signos distintivos pertenecen a sus respectivos titulares y no se transfieren por el uso de la Plataforma.</li>
          <li>Las imágenes de terceros (por ejemplo, de Wikimedia Commons) conservan su licencia y atribución originales.</li>
          <li>Las respuestas y textos que usted produce siguen siendo suyos. Usted autoriza a la Plataforma a almacenarlos y usarlos para las finalidades descritas en la Política de Privacidad.</li>
        </ul>
      </Sec>

      <Sec n={8} title="Disponibilidad y límites de responsabilidad">
        <p>
          La Plataforma se ofrece «tal como está». Se procura su disponibilidad, pero no se garantiza un servicio
          ininterrumpido ni libre de errores, ni la ausencia de fallas de conectividad o de servicios de terceros.
          En la máxima medida permitida por la ley, el Responsable no responde por daños indirectos derivados del uso o
          la imposibilidad de uso de la Plataforma. Nada de lo aquí dispuesto excluye la responsabilidad por dolo o
          culpa grave, ni limita los derechos irrenunciables que la ley reconoce a los titulares de datos personales o
          a los consumidores.
        </p>
      </Sec>

      <Sec n={9} title="Suspensión y terminación">
        <p>
          Podemos suspender o cerrar una cuenta que incumpla estos Términos o ponga en riesgo la seguridad del servicio
          o de otros usuarios. Usted puede solicitar el cierre de su cuenta cuando lo desee.
        </p>
      </Sec>

      <Sec n={10} title="Protección de datos personales">
        <p>
          El tratamiento de sus datos se rige por la{' '}
          <a className={link} href={LEGAL_ROUTES.privacy} target="_blank" rel="noopener noreferrer">Política de Privacidad y Tratamiento de Datos Personales</a>,
          que forma parte integral de estos Términos.
        </p>
      </Sec>

      <Sec n={11} title="Cambios a estos Términos">
        <p>
          Podemos actualizar estos Términos. La versión vigente y su fecha se muestran en la Plataforma. Si el cambio
          modifica de manera sustancial el tratamiento de datos personales, solicitaremos una nueva autorización.
          Continuar usando la Plataforma tras un cambio que no requiera nueva autorización implica su aceptación.
        </p>
      </Sec>

      <Sec n={12} title="Ley aplicable y controversias">
        <p>
          Estos Términos se rigen por las leyes de la República de Colombia. Las partes procurarán resolver
          directamente cualquier diferencia; de no lograrlo, será competente la autoridad judicial colombiana que
          corresponda.
        </p>
      </Sec>

      <Sec n={13} title="Contacto">
        <ContactLine />
      </Sec>
    </article>
  );
}

/* ─────────────────  POLÍTICA DE PRIVACIDAD Y TRATAMIENTO DE DATOS PERSONALES  ───────────────── */

export function PrivacyPolicy() {
  return (
    <article className="space-y-5">
      <Sec n={1} title="Responsable del tratamiento">
        <p>
          El responsable del tratamiento de los datos personales recolectados a través de {LEGAL.platform} es el equipo
          del proyecto de investigación desarrollado en la <Strong>{LEGAL.institution}</Strong> ({LEGAL.institutionLocation})
          (el «Responsable»){LEGAL.controllerNit ? `, NIT ${LEGAL.controllerNit}` : ''}.
        </p>
        <ContactLine />
      </Sec>

      <Sec n={2} title="Marco normativo">
        <p>
          Esta Política se expide conforme a los artículos 15 y 20 de la Constitución Política de Colombia; la Ley
          Estatutaria 1581 de 2012; el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015); la Ley 1098 de
          2006 (Código de la Infancia y la Adolescencia); la Ley 527 de 1999 y las instrucciones de la Superintendencia
          de Industria y Comercio (SIC), autoridad de protección de datos personales.
        </p>
      </Sec>

      <Sec n={3} title="Datos que recolectamos">
        <p><Strong>a) Cuenta e identificación:</Strong></p>
        <ul className={ul}>
          <li>Nombre y apellido, correo electrónico y rol (estudiante, docente o administrador).</li>
          <li>Contraseña: se guarda únicamente como <em>hash</em> irreversible (bcrypt), nunca en texto plano.</li>
          <li>Fecha de creación de la cuenta y registro de su aceptación (fecha, hora y versión de los textos).</li>
        </ul>
        <p><Strong>b) Actividad y desempeño en los retos:</Strong></p>
        <ul className={ul}>
          <li>Respuestas, puntajes, intentos, pistas usadas, tiempos, nivel, reto y estrategia asignada o elegida.</li>
          <li>Respuestas de autopercepción (juicios de aprendizaje), resultados de calibración y los textos de reflexión que usted escribe.</li>
        </ul>
        <p><Strong>c) Interacción con la Plataforma:</Strong></p>
        <ul className={ul}>
          <li>Clics, distancia y trayectoria aproximada del cursor, pausas, inactividad, cambios de pestaña o ventana y patrones de navegación.</li>
          <li>Indicadores calculados a partir de lo anterior (por ejemplo, impulsividad, distracción o carga mental estimada). Son estimaciones estadísticas, no diagnósticos.</li>
        </ul>
        <p><Strong>d) Datos técnicos:</Strong></p>
        <ul className={ul}>
          <li>Los proveedores de infraestructura pueden registrar la dirección IP y metadatos de conexión por razones de seguridad y funcionamiento.</li>
          <li>El navegador guarda localmente (almacenamiento local) su sesión, el tema claro/oscuro y el avance de las guías. No usamos cookies publicitarias ni de seguimiento.</li>
        </ul>
        <p>
          <Strong>No recolectamos</Strong> documentos de identidad, fotografías, imagen o audio (la Plataforma no usa
          cámara ni micrófono), geolocalización, datos de salud, origen racial o étnico, convicciones, orientación
          sexual, datos biométricos ni datos financieros.
        </p>
      </Sec>

      <Sec n={4} title="Niñas, niños y adolescentes">
        <p>
          La Plataforma se utiliza principalmente con estudiantes que pueden ser menores de edad. Conforme al artículo
          7 de la Ley 1581 de 2012 y al artículo 12 del Decreto 1377 de 2013, su tratamiento solo se realiza cuando:
        </p>
        <ul className={ul}>
          <li>Responde y respeta el interés superior del menor y la prevalencia de sus derechos fundamentales.</li>
          <li>Cuenta con la autorización previa, expresa e informada de su padre, madre o representante legal, y se tiene en cuenta la opinión del menor según su madurez.</li>
          <li>Tiene finalidades exclusivamente educativas y de investigación: no se usa para publicidad, perfilamiento comercial ni venta de datos.</li>
          <li>Los resultados de la investigación se publican solo de forma agregada o anonimizada; nunca se publican datos que identifiquen a un menor.</li>
        </ul>
        <p>
          Para registrarse, la persona declara ser mayor de edad o contar con esa autorización. El representante legal
          puede ejercer en nombre del menor todos los derechos descritos en esta Política.
        </p>
      </Sec>

      <Sec n={5} title="Finalidades del tratamiento">
        <ul className={ul}>
          <li>Crear y gestionar su cuenta y autenticar su acceso.</li>
          <li>Prestar el servicio: asignar retos, registrar su progreso, calcular la calibración y entregar retroalimentación y estrategias.</li>
          <li>Permitir al docente o administrador responsable de su grupo acompañar pedagógicamente su proceso.</li>
          <li>Realizar investigación educativa con datos seudonimizados o anonimizados y publicar resultados sin identificar a las personas.</li>
          <li>Garantizar la seguridad, prevenir abusos, dar soporte y mejorar el funcionamiento de la Plataforma.</li>
          <li>Cumplir obligaciones legales y atender requerimientos de autoridades competentes.</li>
        </ul>
        <p>No vendemos ni cedemos sus datos con fines comerciales, ni tomamos decisiones automatizadas con efectos jurídicos sobre usted.</p>
      </Sec>

      <Sec n={6} title="Datos sensibles y campos de texto libre">
        <p>
          La Plataforma no solicita datos sensibles. Sin embargo, usted puede escribir libremente en las reflexiones y
          ensayos: le pedimos no incluir datos de salud, familiares, de otras personas ni información confidencial. Si
          lo hace, trataremos esa información con reserva y podrá solicitar que se elimine.
        </p>
      </Sec>

      <Sec n={7} title="Quiénes acceden a los datos">
        <ul className={ul}>
          <li>Docentes y administradores autorizados, para el acompañamiento de su grupo.</li>
          <li>El equipo de investigación, con datos seudonimizados o anonimizados.</li>
          <li>Proveedores de infraestructura que actúan como encargados del tratamiento (actualmente servicios de alojamiento y base de datos en la nube, como Railway y Neon, u otros equivalentes), sujetos a deberes de confidencialidad y seguridad.</li>
          <li>Autoridades, cuando la ley lo exija.</li>
        </ul>
        <p>
          Algunos recursos visuales se cargan desde servidores de terceros (tipografías de Google Fonts, íconos de
          jsDelivr e imágenes de Wikimedia Commons). Al hacerlo, su navegador les revela su dirección IP y datos
          técnicos de conexión; <Strong>no les enviamos su nombre, correo ni otros datos de su cuenta</Strong>.
        </p>
      </Sec>

      <Sec n={8} title="Transmisión y transferencia internacional">
        <p>
          Los servidores de nuestros proveedores pueden estar ubicados fuera de Colombia (por ejemplo, en Estados
          Unidos). Al aceptar esta Política, usted autoriza de manera expresa e inequívoca la transmisión y
          transferencia de sus datos a esos servidores, que se realiza con medidas de seguridad y para las únicas
          finalidades aquí descritas (artículo 26 de la Ley 1581 de 2012).
        </p>
      </Sec>

      <Sec n={9} title="Sus derechos como titular">
        <ul className={ul}>
          <li>Conocer, actualizar y rectificar sus datos personales.</li>
          <li>Solicitar prueba de la autorización otorgada.</li>
          <li>Ser informado sobre el uso que se ha dado a sus datos.</li>
          <li>Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones a la ley.</li>
          <li>Revocar la autorización y/o solicitar la supresión de sus datos, cuando no exista un deber legal o contractual que impida eliminarlos.</li>
          <li>Acceder de forma gratuita a sus datos personales tratados.</li>
        </ul>
      </Sec>

      <Sec n={10} title="Cómo ejercer sus derechos (consultas y reclamos)">
        <p>
          Envíe su solicitud por los canales indicados en el numeral 1, con su nombre, la descripción de lo que solicita
          y un medio de contacto. Si actúa en nombre de un menor, indique su calidad de representante legal.
        </p>
        <ul className={ul}>
          <li><Strong>Consultas:</Strong> se responden en máximo diez (10) días hábiles, prorrogables por cinco (5) más con aviso del motivo.</li>
          <li><Strong>Reclamos</Strong> (corrección, actualización, supresión o revocatoria): se resuelven en máximo quince (15) días hábiles, prorrogables por ocho (8) más con aviso del motivo (artículos 14 y 15 de la Ley 1581 de 2012).</li>
          <li>Solo después de agotar este trámite puede acudir a la Superintendencia de Industria y Comercio.</li>
        </ul>
      </Sec>

      <Sec n={11} title="Conservación y supresión">
        <p>
          Conservamos sus datos mientras su cuenta esté activa y mientras sean necesarios para las finalidades
          educativas y de investigación descritas, o por el tiempo que exija la ley. Al finalizar, o cuando usted
          solicite la supresión y proceda legalmente, los datos se eliminan o se anonimizan de forma irreversible;
          los datos anonimizados dejan de ser datos personales y pueden conservarse para fines estadísticos.
        </p>
      </Sec>

      <Sec n={12} title="Seguridad">
        <ul className={ul}>
          <li>Comunicaciones cifradas (HTTPS/TLS) en los entornos de producción.</li>
          <li>Contraseñas almacenadas con <em>hash</em> bcrypt y sesiones con token de vencimiento (24 horas).</li>
          <li>Control de acceso por roles y acceso restringido a la base de datos.</li>
          <li>Minimización de datos: solo recolectamos lo necesario para las finalidades descritas.</li>
        </ul>
        <p>
          Ningún sistema es infalible. Si ocurre un incidente de seguridad que afecte sus datos, lo gestionaremos e
          informaremos a la SIC y a los titulares afectados cuando corresponda.
        </p>
      </Sec>

      <Sec n={13} title="Cambios a esta Política">
        <p>
          Publicaremos cualquier modificación en la Plataforma con su fecha y versión. Si el cambio altera
          sustancialmente las finalidades o el tratamiento, solicitaremos una nueva autorización.
        </p>
      </Sec>

      <Sec n={14} title="Autorización">
        <p>
          Al marcar las casillas de aceptación, usted (o su representante legal, si es menor de edad) autoriza de
          manera previa, expresa e informada al Responsable para tratar los datos descritos, con las finalidades,
          derechos y condiciones aquí establecidos, incluida la transmisión y transferencia internacional, y declara
          haber leído los{' '}
          <a className={link} href={LEGAL_ROUTES.terms} target="_blank" rel="noopener noreferrer">Términos y Condiciones</a>.
        </p>
      </Sec>
    </article>
  );
}
